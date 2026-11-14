/**
 * StarWay - Gestore Sensori (DeviceOrientation + Geolocation)
 * Mappatura vettoriale 3D per montaggio Parallelo / Perpendicolare
 * Compatibile al 100% con iOS Safari e Android
 */

const MOUNT_MODES = {
  PARALLEL_TOP: {
    id: 'PARALLEL_TOP',
    name: 'Parallela (Top / Asse Ottico +Y)',
    description: 'La sommità dello smartphone punta verso l\'apertura anteriore del telescopio.',
    vector: [0, 1, 0]
  },
  PERP_RIGHT: {
    id: 'PERP_RIGHT',
    name: 'Perpendicolare (Lato Destro +X)',
    description: 'Telefono montato di traverso: il lato destro guarda l\'apertura del telescopio.',
    vector: [1, 0, 0]
  },
  PERP_LEFT: {
    id: 'PERP_LEFT',
    name: 'Perpendicolare (Lato Sinistro -X)',
    description: 'Telefono montato di traverso: il lato sinistro guarda l\'apertura del telescopio.',
    vector: [-1, 0, 0]
  },
  CAMERA_BACK: {
    id: 'CAMERA_BACK',
    name: 'Fotocamera Posteriore (Dorso -Z)',
    description: 'Il dorso del telefono / fotocamera principale punta verso l\'asse ottico.',
    vector: [0, 0, -1]
  }
};

class SensorManager {
  constructor() {
    this.mountMode = MOUNT_MODES.PARALLEL_TOP;
    this.rawOrientation = { alt: 0, az: 0, roll: 0 };
    this.smoothedVector = null;
    this.smoothingFactor = 0.35; // 0.1 (molto lento/liscio) a 1.0 (immediato/grezzo)

    this.location = {
      lat: 41.9028, // Default: Roma
      lon: 12.4964,
      altitude: 50,
      accuracy: null,
      isLive: false,
      lastUpdated: null
    };

    this.isSensorActive = false;
    this.needsPermissionPrompt = false;
    this.permissionGranted = false;
    this.hasCompassHeading = false;
    this.watchId = null;

    // Callbacks
    this.onOrientationChange = null;
    this.onLocationChange = null;
    this.onStatusChange = null;

    this.init();
  }

  init() {
    // Carica preferenze salvate
    const savedMount = localStorage.getItem('starway_mount_mode');
    if (savedMount && MOUNT_MODES[savedMount]) {
      this.mountMode = MOUNT_MODES[savedMount];
    }

    const savedSmoothing = localStorage.getItem('starway_smoothing');
    if (savedSmoothing) {
      this.smoothingFactor = parseFloat(savedSmoothing) || 0.35;
    }

    const savedLoc = localStorage.getItem('starway_last_location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        this.location = { ...this.location, ...parsed, isLive: false };
      } catch (e) {
        // Ignora
      }
    }

    // Controlla se siamo su iOS 13+ che richiede DeviceOrientationEvent.requestPermission
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      this.needsPermissionPrompt = true;
    }

    // Avvia geolocalizzazione GPS
    this.startGeolocation();
  }

  /**
   * Richiede il permesso per DeviceOrientation su iOS
   * Deve essere chiamato DIRETTAMENTE da un evento di tocco/click utente
   */
  async requestDeviceOrientationPermission() {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === 'granted') {
          this.permissionGranted = true;
          this.needsPermissionPrompt = false;
          this.startOrientationListeners();
          if (this.onStatusChange) this.onStatusChange();
          return { success: true };
        } else {
          this.permissionGranted = false;
          return { success: false, error: 'Permesso negato dall\'utente.' };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      // Browser standard (Android / Desktop Chrome / versioni precedenti)
      this.permissionGranted = true;
      this.needsPermissionPrompt = false;
      this.startOrientationListeners();
      if (this.onStatusChange) this.onStatusChange();
      return { success: true };
    }
  }

  startOrientationListeners() {
    if (this.isSensorActive) return;

    const handler = (event) => this.handleDeviceOrientation(event);

    // Su iOS / Safari si usa 'deviceorientation'
    window.addEventListener('deviceorientation', handler, true);

    // Su alcuni browser Android moderni 'deviceorientationabsolute' fornisce il nord assoluto
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handler, true);
    }

    this.isSensorActive = true;
  }

  /**
   * Elabora l'evento grezzo del giroscopio/bussola
   */
  handleDeviceOrientation(event) {
    if (event.beta === null || event.gamma === null) return;

    let alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    // Gestione webkitCompassHeading su iOS:
    // Su Safari iOS webkitCompassHeading indica direttamente i gradi dal Nord (0=N, 90=E, 180=S, 270=W)
    if (typeof event.webkitCompassHeading === 'number') {
      this.hasCompassHeading = true;
      // Converti l'heading iOS nell'angolo alpha efficace del modello W3C
      alpha = (360 - event.webkitCompassHeading) % 360;
    }

    // Calcola il vettore di puntamento nel sistema di coordinate terrestre [East, North, Up]
    const rawVector = this.computePointingVector(alpha, beta, gamma, this.mountMode.vector);

    // Filtro passa-basso su vettore unitario 3D (evita salti al cambio 359° -> 0°)
    if (!this.smoothedVector) {
      this.smoothedVector = [...rawVector];
    } else {
      const k = this.smoothingFactor;
      this.smoothedVector[0] = (1 - k) * this.smoothedVector[0] + k * rawVector[0];
      this.smoothedVector[1] = (1 - k) * this.smoothedVector[1] + k * rawVector[1];
      this.smoothedVector[2] = (1 - k) * this.smoothedVector[2] + k * rawVector[2];

      // Normalizzazione del vettore
      const norm = Math.hypot(this.smoothedVector[0], this.smoothedVector[1], this.smoothedVector[2]);
      if (norm > 1e-6) {
        this.smoothedVector[0] /= norm;
        this.smoothedVector[1] /= norm;
        this.smoothedVector[2] /= norm;
      }
    }

    const [vx, vy, vz] = this.smoothedVector;

    // Altitudine: angolo rispetto al piano orizzontale (-90° a +90°)
    const altDeg = Math.asin(Math.max(-1, Math.min(1, vz))) * (180 / Math.PI);

    // Azimut: angolo dal Nord ruotando verso Est (0° a 360°)
    let azDeg = Math.atan2(vx, vy) * (180 / Math.PI);
    if (azDeg < 0) azDeg += 360;

    this.rawOrientation = {
      alt: altDeg,
      az: azDeg,
      alpha,
      beta,
      gamma
    };

    if (this.onOrientationChange) {
      this.onOrientationChange(this.rawOrientation);
    }
  }

  /**
   * Moltiplica la matrice di rotazione W3C per il vettore del montaggio ottico
   * Restituisce [East, North, Up]
   */
  computePointingVector(alphaDeg, betaDeg, gammaDeg, opticAxis) {
    const degToRad = Math.PI / 180;
    const a = alphaDeg * degToRad;
    const b = betaDeg * degToRad;
    const g = gammaDeg * degToRad;

    const cA = Math.cos(a), sA = Math.sin(a);
    const cB = Math.cos(b), sB = Math.sin(b);
    const cG = Math.cos(g), sG = Math.sin(g);

    // Matrice di rotazione W3C Device to Earth (X=East, Y=North, Z=Up)
    // R = Rz(alpha) * Rx(beta) * Ry(gamma)
    const r00 = cA * cG - sA * sB * sG;
    const r01 = -sA * cB;
    const r02 = cA * sG + sA * sB * cG;

    const r10 = sA * cG + cA * sB * sG;
    const r11 = cA * cB;
    const r12 = sA * sG - cA * sB * cG;

    const r20 = -cB * sG;
    const r21 = sB;
    const r22 = cB * cG;

    const [ux, uy, uz] = opticAxis;

    // Vettore risultante nel frame terrestre
    const vx = r00 * ux + r01 * uy + r02 * uz;
    const vy = r10 * ux + r11 * uy + r12 * uz;
    const vz = r20 * ux + r21 * uy + r22 * uz;

    return [vx, vy, vz];
  }

  /**
   * Cambia la modalità di montaggio del telefono sul tubo
   * @param {string} modeKey Uno dei valori in MOUNT_MODES (es. 'PARALLEL_TOP', 'PERP_RIGHT')
   */
  setMountMode(modeKey) {
    if (MOUNT_MODES[modeKey]) {
      this.mountMode = MOUNT_MODES[modeKey];
      this.smoothedVector = null; // reset filtro per evitare transizioni lente
      localStorage.setItem('starway_mount_mode', modeKey);
      if (this.onStatusChange) this.onStatusChange();
    }
  }

  setSmoothingFactor(val) {
    this.smoothingFactor = Math.max(0.05, Math.min(1.0, val));
    localStorage.setItem('starway_smoothing', this.smoothingFactor.toString());
  }

  /**
   * Avvia il monitoraggio Geolocation GPS ad alta precisione
   */
  startGeolocation() {
    if (!('geolocation' in navigator)) {
      console.warn('Geolocalizzazione non supportata.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    };

    const success = (pos) => {
      this.location = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        altitude: pos.coords.altitude || 50,
        accuracy: pos.coords.accuracy,
        isLive: true,
        lastUpdated: new Date()
      };

      // Notifica e salva posizione per offline
      localStorage.setItem('starway_last_location', JSON.stringify({
        lat: this.location.lat,
        lon: this.location.lon,
        altitude: this.location.altitude
      }));

      // Aggiorna osservatore celeste
      if (window.celestialManager) {
        window.celestialManager.setObserver(
          this.location.lat,
          this.location.lon,
          this.location.altitude
        );
      }

      if (this.onLocationChange) this.onLocationChange(this.location);
    };

    const error = (err) => {
      console.warn('Avviso Geolocation:', err.message);
      // Mantieni la posizione di fallback o salvata
      if (window.celestialManager) {
        window.celestialManager.setObserver(
          this.location.lat,
          this.location.lon,
          this.location.altitude
        );
      }
      if (this.onLocationChange) this.onLocationChange(this.location);
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
    this.watchId = navigator.geolocation.watchPosition(success, error, options);
  }

  /**
   * Imposta manualmente la posizione geografica (es. per test o aree remote)
   */
  setManualLocation(lat, lon, altitude = 50) {
    this.location = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      altitude: parseFloat(altitude),
      accuracy: 0,
      isLive: false,
      lastUpdated: new Date()
    };

    localStorage.setItem('starway_last_location', JSON.stringify({
      lat: this.location.lat,
      lon: this.location.lon,
      altitude: this.location.altitude
    }));

    if (window.celestialManager) {
      window.celestialManager.setObserver(
        this.location.lat,
        this.location.lon,
        this.location.altitude
      );
    }

    if (this.onLocationChange) this.onLocationChange(this.location);
  }
}

// Esporta istanza singleton globale
window.sensorManager = new SensorManager();
