/**
 * StarWay - Calibrazione Celeste ad Alta Precisione (1-Star Alignment)
 * Corregge offset magnetici, imperfezioni di montaggio e disallineamenti del tubo.
 */

class CalibrationManager {
  constructor() {
    this.isCalibrated = false;
    this.calibratedStar = null;
    this.calibratedAt = null;

    // Offset in gradi da sommare alle letture grezze del sensore
    this.altOffset = 0;
    this.azOffset = 0;

    // Tolleranza di puntamento (target raggiunto) in gradi
    this.targetTolerance = 0.5; // Default: 0.5° (circa il diametro della Luna piena)

    // Callbacks
    this.onCalibrationChange = null;

    this.init();
  }

  init() {
    // Carica eventuale calibrazione salvata
    const saved = localStorage.getItem('starway_calibration_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.altOffset = data.altOffset || 0;
        this.azOffset = data.azOffset || 0;
        this.calibratedStar = data.calibratedStar || null;
        this.calibratedAt = data.calibratedAt ? new Date(data.calibratedAt) : null;
        this.isCalibrated = !!data.isCalibrated;
      } catch (e) {
        console.warn('Errore lettura calibrazione salvata:', e);
      }
    }

    const savedTol = localStorage.getItem('starway_tolerance');
    if (savedTol) {
      this.targetTolerance = parseFloat(savedTol) || 0.5;
    }
  }

  /**
   * Esegue l'allineamento su un astro di riferimento centrato nell'oculare
   * @param {Object} celestialObject Oggetto celeste di calibrazione dal catalogo
   * @param {Object} rawOrientation Lettura grezza corrente del sensore { alt, az }
   * @returns {{ success: boolean, targetAlt: number, targetAz: number, altOffset: number, azOffset: number }}
   */
  alignToTarget(celestialObject, rawOrientation) {
    if (!celestialObject || !window.celestialManager) {
      return { success: false, error: 'Astro di calibrazione non valido.' };
    }

    // Calcola l'esatta posizione teorica dell'astro all'istante esatto del tocco
    const exactNow = new Date();
    const theoreticalCoords = window.celestialManager.computeObjectCoordinates(celestialObject, exactNow);

    if (theoreticalCoords.altitude === null || theoreticalCoords.azimuth === null) {
      return { success: false, error: 'Impossibile calcolare le coordinate teoriche.' };
    }

    // Calcolo degli offset:
    // Alt_teorico = Alt_raw + Alt_offset  ==> Alt_offset = Alt_teorico - Alt_raw
    // Az_teorico = Az_raw + Az_offset    ==> Az_offset = (Az_teorico - Az_raw + 360) % 360
    this.altOffset = theoreticalCoords.altitude - rawOrientation.alt;
    this.azOffset = (theoreticalCoords.azimuth - rawOrientation.az + 360) % 360;

    this.isCalibrated = true;
    this.calibratedStar = {
      id: celestialObject.id,
      name: celestialObject.name,
      designation: celestialObject.designation,
      alt: theoreticalCoords.altitude,
      az: theoreticalCoords.azimuth
    };
    this.calibratedAt = exactNow;

    // Salva per persistenza della sessione
    this.saveCalibration();

    if (this.onCalibrationChange) {
      this.onCalibrationChange({
        isCalibrated: this.isCalibrated,
        calibratedStar: this.calibratedStar,
        altOffset: this.altOffset,
        azOffset: this.azOffset
      });
    }

    return {
      success: true,
      targetAlt: theoreticalCoords.altitude,
      targetAz: theoreticalCoords.azimuth,
      altOffset: this.altOffset,
      azOffset: this.azOffset
    };
  }

  /**
   * Applica la correzione di calibrazione a qualsiasi lettura di sensore grezza
   * @param {number} rawAlt Altitudine grezza del sensore in gradi
   * @param {number} rawAz Azimut grezzo del sensore in gradi
   * @returns {{ alt: number, az: number }} Coordinate corrette del telescopio
   */
  getCorrectedTelescopeOrientation(rawAlt, rawAz) {
    if (!this.isCalibrated) {
      return {
        alt: rawAlt,
        az: (rawAz + 360) % 360
      };
    }

    const correctedAlt = rawAlt + this.altOffset;
    let correctedAz = (rawAz + this.azOffset + 360) % 360;

    return {
      alt: Math.max(-90, Math.min(90, correctedAlt)),
      az: correctedAz
    };
  }

  /**
   * Calcola la differenza (delta) per guidare il Push-To verso il bersaglio
   * @param {Object} currentCorrected { alt, az } del telescopio orientato
   * @param {Object} targetCoords { altitude, azimuth } dell'astro da puntare
   * @returns {{ deltaAlt: number, deltaAz: number, angularDistance: number, isCentered: boolean }}
   */
  computePushToGuidance(currentCorrected, targetCoords) {
    // Delta Altitudine:
    // Se positivo: il target è PIÙ ALTO dell'orientamento corrente -> ALZA il tubo (+Alt)
    // Se negativo: il target è PIÙ BASSO -> ABBASSA il tubo (-Alt)
    const deltaAlt = targetCoords.altitude - currentCorrected.alt;

    // Delta Azimut: percorso più breve (-180° a +180°)
    // Se positivo: ruota verso DESTRA (orario, +Az)
    // Se negativo: ruota verso SINISTRA (antiorario, -Az)
    let deltaAz = (targetCoords.azimuth - currentCorrected.az + 540) % 360 - 180;

    // Distanza angolare reale sulla sfera celeste (formula dell'haversine / coseno sferico)
    const degToRad = Math.PI / 180;
    const phi1 = currentCorrected.alt * degToRad;
    const phi2 = targetCoords.altitude * degToRad;
    const dPhi = (targetCoords.altitude - currentCorrected.alt) * degToRad;
    const dLam = deltaAz * degToRad;

    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLam / 2) * Math.sin(dLam / 2);
    const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * (180 / Math.PI);

    const isCentered = angularDistance <= this.targetTolerance;

    return {
      deltaAlt,
      deltaAz,
      angularDistance,
      isCentered
    };
  }

  /**
   * Resetta la calibrazione alle letture naturali del sensore
   */
  resetCalibration() {
    this.isCalibrated = false;
    this.calibratedStar = null;
    this.calibratedAt = null;
    this.altOffset = 0;
    this.azOffset = 0;

    localStorage.removeItem('starway_calibration_data');

    if (this.onCalibrationChange) {
      this.onCalibrationChange({
        isCalibrated: false,
        calibratedStar: null,
        altOffset: 0,
        azOffset: 0
      });
    }
  }

  setTolerance(degrees) {
    this.targetTolerance = Math.max(0.1, Math.min(2.0, degrees));
    localStorage.setItem('starway_tolerance', this.targetTolerance.toString());
  }

  saveCalibration() {
    localStorage.setItem('starway_calibration_data', JSON.stringify({
      isCalibrated: this.isCalibrated,
      calibratedStar: this.calibratedStar,
      calibratedAt: this.calibratedAt,
      altOffset: this.altOffset,
      azOffset: this.azOffset
    }));
  }
}

// Esporta istanza singleton globale
window.calibrationManager = new CalibrationManager();
