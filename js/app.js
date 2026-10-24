/**
 * StarWay - Main Application Controller
 * Coordina UI, Sensori, Catalogo, Mirino Push-To e Allineamento
 */

class StarWayApp {
  constructor() {
    this.activeTab = 'hud';
    this.currentTarget = null;
    this.reticleRenderer = null;

    this.currentTheme = localStorage.getItem('starway_theme') || 'night';
    this.wakeLock = null;

    // Elementi DOM memorizzati
    this.dom = {};

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    this.cacheDomElements();
    this.applyTheme(this.currentTheme);
    this.initReticle();
    this.bindEvents();
    this.initPWA();
    this.requestWakeLock();

    // Imposta target iniziale di default (Stella Polare o Giove)
    this.setDefaultTarget();

    // Aggiorna posizioni iniziali catalogo
    if (window.celestialManager) {
      window.celestialManager.updateAllPositions();
      this.renderCatalogList();
      this.renderQuickCalibrationList();
    }

    // Configura callbacks dai manager
    this.setupManagerCallbacks();

    // Controlla se mostrare il banner permessi sensori iOS
    this.checkSensorPermissionsUI();

    // Avvia il loop di animazione del puntamento HUD
    this.startHudLoop();

    // Timer periodico per aggiornare le effemeridi celesti ogni 3 secondi
    setInterval(() => {
      if (window.celestialManager) {
        window.celestialManager.updateAllPositions();
        if (this.activeTab === 'catalog') {
          this.renderCatalogList();
        }
      }
    }, 3000);
  }

  cacheDomElements() {
    this.dom = {
      appRoot: document.getElementById('app-root'),
      reticleCanvas: document.getElementById('reticle-canvas'),

      // Banner permessi iOS
      permissionBanner: document.getElementById('permission-banner'),
      btnRequestSensor: document.getElementById('btn-request-sensor'),

      // Schede / Viste
      tabs: document.querySelectorAll('.tab-view'),
      navButtons: document.querySelectorAll('.nav-bar button'),

      // HUD Elements
      targetName: document.getElementById('hud-target-name'),
      targetDesig: document.getElementById('hud-target-desig'),
      targetConst: document.getElementById('hud-target-const'),
      targetMag: document.getElementById('hud-target-mag'),
      targetCoords: document.getElementById('hud-target-coords'),
      scopeCoords: document.getElementById('hud-scope-coords'),

      deltaAltText: document.getElementById('hud-delta-alt'),
      deltaAzText: document.getElementById('hud-delta-az'),
      distText: document.getElementById('hud-distance'),

      arrowUp: document.getElementById('arrow-up'),
      arrowDown: document.getElementById('arrow-down'),
      arrowLeft: document.getElementById('arrow-left'),
      arrowRight: document.getElementById('arrow-right'),
      targetLockBadge: document.getElementById('target-lock-badge'),

      // Status Bar Badges
      statusGps: document.getElementById('status-gps'),
      statusSensors: document.getElementById('status-sensors'),
      statusCalib: document.getElementById('status-calib'),
      btnToggleTheme: document.getElementById('btn-toggle-theme'),
      btnToggleMute: document.getElementById('btn-toggle-mute'),

      // Catalogo
      catalogList: document.getElementById('catalog-items-container'),
      catalogSearchInput: document.getElementById('catalog-search-input'),
      catalogFilterTabs: document.querySelectorAll('.filter-pill'),

      // Calibrazione
      calibStarName: document.getElementById('calib-star-name'),
      calibStarCoords: document.getElementById('calib-star-coords'),
      calibRawCoords: document.getElementById('calib-raw-coords'),
      calibCurrentOffset: document.getElementById('calib-current-offset'),
      calibStatusText: document.getElementById('calib-status-text'),
      btnConfirmCalibration: document.getElementById('btn-confirm-calibration'),
      btnResetCalibration: document.getElementById('btn-reset-calibration'),
      quickCalibList: document.getElementById('quick-calib-container'),

      // Impostazioni
      mountSelect: document.getElementById('settings-mount-select'),
      toleranceSelect: document.getElementById('settings-tolerance-select'),
      smoothingSlider: document.getElementById('settings-smoothing-slider'),
      smoothingValueLabel: document.getElementById('settings-smoothing-val'),
      manualLatInput: document.getElementById('settings-lat'),
      manualLonInput: document.getElementById('settings-lon'),
      btnSaveLocation: document.getElementById('btn-save-location'),
      gpsLocationLabel: document.getElementById('gps-location-label')
    };
  }

  initReticle() {
    if (this.dom.reticleCanvas && window.ReticleRenderer) {
      this.reticleRenderer = new window.ReticleRenderer(this.dom.reticleCanvas);
    }
  }

  setupManagerCallbacks() {
    // Cambio orientamento
    if (window.sensorManager) {
      window.sensorManager.onStatusChange = () => {
        this.updateStatusBadges();
        this.checkSensorPermissionsUI();
      };

      window.sensorManager.onLocationChange = (loc) => {
        this.updateStatusBadges();
        if (this.dom.gpsLocationLabel) {
          const latStr = loc.lat >= 0 ? `${loc.lat.toFixed(4)}° N` : `${Math.abs(loc.lat).toFixed(4)}° S`;
          const lonStr = loc.lon >= 0 ? `${loc.lon.toFixed(4)}° E` : `${Math.abs(loc.lon).toFixed(4)}° W`;
          this.dom.gpsLocationLabel.textContent = `${latStr}, ${lonStr} (±${Math.round(loc.accuracy || 0)}m)`;
        }
        if (this.dom.manualLatInput && !this.dom.manualLatInput.value) {
          this.dom.manualLatInput.value = loc.lat.toFixed(4);
          this.dom.manualLonInput.value = loc.lon.toFixed(4);
        }
      };
    }

    // Cambio calibrazione
    if (window.calibrationManager) {
      window.calibrationManager.onCalibrationChange = (state) => {
        this.updateStatusBadges();
        this.updateCalibrationViewUI();
      };
    }
  }

  bindEvents() {
    // Navigazione schede
    this.dom.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Permessi iOS banner
    if (this.dom.btnRequestSensor) {
      this.dom.btnRequestSensor.addEventListener('click', async () => {
        const result = await window.sensorManager.requestDeviceOrientationPermission();
        if (result.success) {
          if (this.dom.permissionBanner) this.dom.permissionBanner.style.display = 'none';
          this.updateStatusBadges();
        } else {
          alert('Attenzione: ' + (result.error || 'Permesso sensori negato.'));
        }
      });
    }

    // Cambio Tema (Night / Day)
    if (this.dom.btnToggleTheme) {
      this.dom.btnToggleTheme.addEventListener('click', () => {
        const nextTheme = this.currentTheme === 'night' ? 'day' : 'night';
        this.applyTheme(nextTheme);
      });
    }

    // Toggle Audio Mute
    if (this.dom.btnToggleMute) {
      this.dom.btnToggleMute.addEventListener('click', () => {
        if (window.feedbackManager) {
          const isMuted = window.feedbackManager.toggleMute();
          this.dom.btnToggleMute.classList.toggle('muted', isMuted);
          this.dom.btnToggleMute.textContent = isMuted ? '🔇' : '🔊';
        }
      });
    }

    // Ricerca e filtri catalogo
    if (this.dom.catalogSearchInput) {
      this.dom.catalogSearchInput.addEventListener('input', () => this.renderCatalogList());
    }

    this.dom.catalogFilterTabs.forEach(pill => {
      pill.addEventListener('click', () => {
        this.dom.catalogFilterTabs.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.renderCatalogList();
      });
    });

    // Conferma Calibrazione
    if (this.dom.btnConfirmCalibration) {
      this.dom.btnConfirmCalibration.addEventListener('click', () => {
        this.handleCalibrationConfirm();
      });
    }

    // Reset Calibrazione
    if (this.dom.btnResetCalibration) {
      this.dom.btnResetCalibration.addEventListener('click', () => {
        if (confirm('Vuoi davvero azzerare l\'allineamento del telescopio?')) {
          window.calibrationManager.resetCalibration();
        }
      });
    }

    // Impostazioni: Selezione Modalità di Montaggio Telefono
    if (this.dom.mountSelect) {
      this.dom.mountSelect.value = window.sensorManager.mountMode.id;
      this.dom.mountSelect.addEventListener('change', (e) => {
        window.sensorManager.setMountMode(e.target.value);
      });
    }

    // Impostazioni: Tolleranza Target
    if (this.dom.toleranceSelect) {
      this.dom.toleranceSelect.value = window.calibrationManager.targetTolerance.toString();
      this.dom.toleranceSelect.addEventListener('change', (e) => {
        window.calibrationManager.setTolerance(parseFloat(e.target.value));
      });
    }

    // Impostazioni: Slider Filtro Smoothing
    if (this.dom.smoothingSlider) {
      this.dom.smoothingSlider.value = window.sensorManager.smoothingFactor;
      if (this.dom.smoothingValueLabel) {
        this.dom.smoothingValueLabel.textContent = window.sensorManager.smoothingFactor.toFixed(2);
      }
      this.dom.smoothingSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.sensorManager.setSmoothingFactor(val);
        if (this.dom.smoothingValueLabel) {
          this.dom.smoothingValueLabel.textContent = val.toFixed(2);
        }
      });
    }

    // Impostazioni: Salva coordinate manuali
    if (this.dom.btnSaveLocation) {
      this.dom.btnSaveLocation.addEventListener('click', () => {
        const lat = parseFloat(this.dom.manualLatInput.value);
        const lon = parseFloat(this.dom.manualLonInput.value);
        if (!isNaN(lat) && !isNaN(lon)) {
          window.sensorManager.setManualLocation(lat, lon);
          alert('Coordinate geografiche aggiornate!');
        } else {
          alert('Inserisci latitudine e longitudine valide.');
        }
      });
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    this.dom.tabs.forEach(tab => {
      tab.classList.toggle('active', tab.id === `tab-${tabId}`);
    });

    this.dom.navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    if (tabId === 'hud' && this.reticleRenderer) {
      this.reticleRenderer.resizeCanvas();
    } else if (tabId === 'catalog') {
      this.renderCatalogList();
    } else if (tabId === 'calibration') {
      this.updateCalibrationViewUI();
    }
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('starway_theme', theme);

    if (theme === 'night') {
      document.body.classList.remove('theme-day');
      document.body.classList.add('theme-night');
      if (this.dom.btnToggleTheme) {
        this.dom.btnToggleTheme.textContent = '🌙';
        this.dom.btnToggleTheme.title = 'Modalità Notte Attiva (Tocca per Giorno)';
      }
    } else {
      document.body.classList.remove('theme-night');
      document.body.classList.add('theme-day');
      if (this.dom.btnToggleTheme) {
        this.dom.btnToggleTheme.textContent = '☀️';
        this.dom.btnToggleTheme.title = 'Modalità Giorno Attiva (Tocca per Notte)';
      }
    }
  }

  checkSensorPermissionsUI() {
    if (!this.dom.permissionBanner) return;

    if (window.sensorManager.needsPermissionPrompt && !window.sensorManager.permissionGranted) {
      this.dom.permissionBanner.style.display = 'flex';
    } else {
      this.dom.permissionBanner.style.display = 'none';
    }
  }

  updateStatusBadges() {
    // GPS
    if (this.dom.statusGps) {
      const loc = window.sensorManager.location;
      if (loc && loc.isLive) {
        this.dom.statusGps.className = 'status-pill status-ok';
        this.dom.statusGps.textContent = 'GPS: OK';
      } else {
        this.dom.statusGps.className = 'status-pill status-warn';
        this.dom.statusGps.textContent = 'GPS: Default';
      }
    }

    // Sensori
    if (this.dom.statusSensors) {
      if (window.sensorManager.isSensorActive) {
        this.dom.statusSensors.className = 'status-pill status-ok';
        this.dom.statusSensors.textContent = 'Sensori: Attivi';
      } else if (window.sensorManager.needsPermissionPrompt) {
        this.dom.statusSensors.className = 'status-pill status-warn';
        this.dom.statusSensors.textContent = 'Sensori: Permesso';
      } else {
        this.dom.statusSensors.className = 'status-pill status-ok';
        this.dom.statusSensors.textContent = 'Sensori: Standby';
      }
    }

    // Calibrazione
    if (this.dom.statusCalib) {
      if (window.calibrationManager.isCalibrated) {
        this.dom.statusCalib.className = 'status-pill status-ok';
        this.dom.statusCalib.textContent = 'Allineato: ' + (window.calibrationManager.calibratedStar?.name || 'Sì');
      } else {
        this.dom.statusCalib.className = 'status-pill status-warn';
        this.dom.statusCalib.textContent = 'Non Allineato';
      }
    }
  }

  setDefaultTarget() {
    // Stella Polare o M42 o Giove
    const defaultObj = window.celestialManager.catalog.find(o => o.isPolaris) ||
                       window.celestialManager.catalog.find(o => o.id === 'jupiter') ||
                       window.celestialManager.catalog[0];
    if (defaultObj) {
      this.setTarget(defaultObj);
    }
  }

  setTarget(celestialObj) {
    this.currentTarget = celestialObj;

    if (this.dom.targetName) this.dom.targetName.textContent = celestialObj.name;
    if (this.dom.targetDesig) this.dom.targetDesig.textContent = celestialObj.designation;
    if (this.dom.targetConst) this.dom.targetConst.textContent = celestialObj.constellation;
    if (this.dom.targetMag) {
      this.dom.targetMag.textContent = `Mag: ${typeof celestialObj.mag === 'number' ? celestialObj.mag.toFixed(1) : '-'}`;
    }

    // Aggiorna anche nella scheda Calibrazione
    this.updateCalibrationViewUI();
  }

  /**
   * Loop principale ad alta frequenza per aggiornare l'orientamento, la grafica HUD e i suoni
   */
  startHudLoop() {
    const loop = () => {
      this.updateHudPointing();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateHudPointing() {
    if (!this.currentTarget || !window.sensorManager || !window.calibrationManager) return;

    // Lettura grezza del sensore
    const raw = window.sensorManager.rawOrientation;

    // Orientamento telescopio corretto da calibrazione
    const scope = window.calibrationManager.getCorrectedTelescopeOrientation(raw.alt, raw.az);

    // Coordinate teoriche correnti del target
    const targetCoords = window.celestialManager.computeObjectCoordinates(this.currentTarget, new Date());

    // Calcolo della guida Push-To
    const guidance = window.calibrationManager.computePushToGuidance(scope, targetCoords);

    // Aggiorna letture numeriche nella HUD solo se siamo nella scheda HUD
    if (this.activeTab === 'hud') {
      const formatDMS = CelestialManager.formatDMS;

      if (this.dom.targetCoords) {
        this.dom.targetCoords.textContent = `Alt: ${formatDMS(targetCoords.altitude, true)} | Az: ${formatDMS(targetCoords.azimuth)}`;
      }

      if (this.dom.scopeCoords) {
        this.dom.scopeCoords.textContent = `Alt: ${formatDMS(scope.alt, true)} | Az: ${formatDMS(scope.az)}`;
      }

      if (this.dom.deltaAltText) {
        this.dom.deltaAltText.textContent = formatDMS(guidance.deltaAlt, true);
        this.dom.deltaAltText.className = 'delta-value ' + (Math.abs(guidance.deltaAlt) < 0.3 ? 'on-target' : '');
      }

      if (this.dom.deltaAzText) {
        this.dom.deltaAzText.textContent = formatDMS(guidance.deltaAz, true);
        this.dom.deltaAzText.className = 'delta-value ' + (Math.abs(guidance.deltaAz) < 0.3 ? 'on-target' : '');
      }

      if (this.dom.distText) {
        this.dom.distText.textContent = formatDMS(guidance.angularDistance);
      }

      // Aggiorna Frecce Direzionali (Su/Giù/Sinistra/Destra)
      this.updateDirectionalArrows(guidance);

      // Badge Target Centrato
      if (this.dom.targetLockBadge) {
        this.dom.targetLockBadge.classList.toggle('active', guidance.isCentered);
      }

      // Renderizza Canvas Mirino Radar
      if (this.reticleRenderer) {
        this.reticleRenderer.render(
          guidance,
          window.calibrationManager.targetTolerance,
          this.currentTheme
        );
      }

      // Feedback Sonoro e Aptico
      if (window.feedbackManager) {
        window.feedbackManager.updateGuidanceAudio(guidance.angularDistance, guidance.isCentered);
      }
    }
  }

  updateDirectionalArrows(guidance) {
    const { deltaAlt, deltaAz, isCentered } = guidance;
    const tol = 0.25; // Tolleranza minima per cui l'asse è allineato

    // Su / Giù
    if (isCentered || Math.abs(deltaAlt) <= tol) {
      this.dom.arrowUp.classList.remove('active', 'urgent');
      this.dom.arrowDown.classList.remove('active', 'urgent');
    } else if (deltaAlt > 0) {
      // Target è più alto: Alza il tubo (Su)
      this.dom.arrowUp.classList.add('active');
      this.dom.arrowUp.classList.toggle('urgent', Math.abs(deltaAlt) > 4.0);
      this.dom.arrowDown.classList.remove('active', 'urgent');
    } else {
      // Target è più basso: Abbassa il tubo (Giù)
      this.dom.arrowDown.classList.add('active');
      this.dom.arrowDown.classList.toggle('urgent', Math.abs(deltaAlt) > 4.0);
      this.dom.arrowUp.classList.remove('active', 'urgent');
    }

    // Sinistra / Destra
    if (isCentered || Math.abs(deltaAz) <= tol) {
      this.dom.arrowLeft.classList.remove('active', 'urgent');
      this.dom.arrowRight.classList.remove('active', 'urgent');
    } else if (deltaAz > 0) {
      // Ruota verso destra (senso orario)
      this.dom.arrowRight.classList.add('active');
      this.dom.arrowRight.classList.toggle('urgent', Math.abs(deltaAz) > 6.0);
      this.dom.arrowLeft.classList.remove('active', 'urgent');
    } else {
      // Ruota verso sinistra (senso antiorario)
      this.dom.arrowLeft.classList.add('active');
      this.dom.arrowLeft.classList.toggle('urgent', Math.abs(deltaAz) > 6.0);
      this.dom.arrowRight.classList.remove('active', 'urgent');
    }
  }

  /**
   * Rendering dinamico del catalogo con filtri e ricerca
   */
  renderCatalogList() {
    if (!this.dom.catalogList || !window.celestialManager) return;

    // Determina il filtro attivo
    let activeFilter = 'all';
    this.dom.catalogFilterTabs.forEach(p => {
      if (p.classList.contains('active')) {
        activeFilter = p.getAttribute('data-filter');
      }
    });

    const searchQuery = this.dom.catalogSearchInput ? this.dom.catalogSearchInput.value : '';

    const items = window.celestialManager.getFilteredList({
      filterType: activeFilter,
      searchQuery
    });

    if (items.length === 0) {
      this.dom.catalogList.innerHTML = `
        <div class="empty-state">
          <p>Nessun oggetto trovato per questa ricerca o filtro.</p>
        </div>
      `;
      return;
    }

    const formatDMS = CelestialManager.formatDMS;

    const html = items.map(item => {
      const isCurrentTarget = this.currentTarget && this.currentTarget.id === item.id;
      const isVisible = item.coords.isVisible;
      const altStr = formatDMS(item.coords.altitude, true);
      const azStr = formatDMS(item.coords.azimuth);

      return `
        <div class="catalog-card ${isCurrentTarget ? 'is-target' : ''} ${!isVisible ? 'below-horizon' : ''}">
          <div class="catalog-card-header">
            <div>
              <div class="catalog-card-title">${item.name}</div>
              <div class="catalog-card-sub">${item.designation} • ${item.constellation}</div>
            </div>
            <div class="catalog-badges">
              <span class="badge ${isVisible ? 'badge-visible' : 'badge-hidden'}">
                ${isVisible ? 'Visibile' : 'Sotto Orizzonte'}
              </span>
              <span class="badge badge-type">${item.type}</span>
            </div>
          </div>

          <div class="catalog-card-body">
            <div class="catalog-coords-grid">
              <div><small>Altitudine:</small> <strong>${altStr}</strong></div>
              <div><small>Azimut:</small> <strong>${azStr}</strong></div>
              <div><small>Magnitudine:</small> <strong>${typeof item.mag === 'number' ? item.mag.toFixed(1) : '-'}</strong></div>
            </div>
            ${item.isSunWarning ? '<div class="warning-callout">⚠️ ATTENZIONE: Filtro solare obbligatorio a tutta apertura! Pericolo cecità!</div>' : ''}
            <div class="catalog-card-desc">${item.description}</div>
          </div>

          <div class="catalog-card-actions">
            <button class="btn-action btn-target" data-id="${item.id}">
              🔭 Punta (Push-To)
            </button>
            ${item.isCalibrationStar ? `
              <button class="btn-action btn-calib" data-id="${item.id}">
                ⭐ Usa per Calibrare
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.dom.catalogList.innerHTML = html;

    // Aggiungi click listener per pulsanti
    this.dom.catalogList.querySelectorAll('.btn-target').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const obj = window.celestialManager.catalog.find(o => o.id === id);
        if (obj) {
          this.setTarget(obj);
          this.switchTab('hud');
        }
      });
    });

    this.dom.catalogList.querySelectorAll('.btn-calib').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const obj = window.celestialManager.catalog.find(o => o.id === id);
        if (obj) {
          this.setTarget(obj);
          this.switchTab('calibration');
        }
      });
    });
  }

  /**
   * Rendering della lista rapida di stelle di calibrazione nella schermata Allineamento
   */
  renderQuickCalibrationList() {
    if (!this.dom.quickCalibList || !window.celestialManager) return;

    const stars = window.celestialManager.catalog.filter(o => o.isCalibrationStar);

    const html = stars.map(star => {
      const isSelected = this.currentTarget && this.currentTarget.id === star.id;
      const isPolaris = !!star.isPolaris;

      return `
        <button class="quick-calib-pill ${isSelected ? 'selected' : ''} ${isPolaris ? 'polaris-highlight' : ''}" data-id="${star.id}">
          ${isPolaris ? '⭐ ' : ''}${star.name}
        </button>
      `;
    }).join('');

    this.dom.quickCalibList.innerHTML = html;

    this.dom.quickCalibList.querySelectorAll('.quick-calib-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const obj = window.celestialManager.catalog.find(o => o.id === id);
        if (obj) {
          this.setTarget(obj);
          this.renderQuickCalibrationList();
          this.updateCalibrationViewUI();
        }
      });
    });
  }

  updateCalibrationViewUI() {
    if (!this.currentTarget) return;

    const formatDMS = CelestialManager.formatDMS;
    const targetCoords = window.celestialManager.computeObjectCoordinates(this.currentTarget, new Date());
    const raw = window.sensorManager.rawOrientation;

    if (this.dom.calibStarName) {
      this.dom.calibStarName.textContent = this.currentTarget.name;
    }

    if (this.dom.calibStarCoords) {
      this.dom.calibStarCoords.textContent =
        `Alt: ${formatDMS(targetCoords.altitude, true)} | Az: ${formatDMS(targetCoords.azimuth)}`;
    }

    if (this.dom.calibRawCoords) {
      this.dom.calibRawCoords.textContent =
        `Alt: ${formatDMS(raw.alt, true)} | Az: ${formatDMS(raw.az)}`;
    }

    if (this.dom.calibCurrentOffset) {
      if (window.calibrationManager.isCalibrated) {
        this.dom.calibCurrentOffset.textContent =
          `ΔAlt: ${formatDMS(window.calibrationManager.altOffset, true)} | ΔAz: ${formatDMS(window.calibrationManager.azOffset, true)}`;
      } else {
        this.dom.calibCurrentOffset.textContent = 'Nessun offset applicato (Grezzo)';
      }
    }

    if (this.dom.calibStatusText) {
      if (window.calibrationManager.isCalibrated) {
        const timeStr = window.calibrationManager.calibratedAt
          ? new Date(window.calibrationManager.calibratedAt).toLocaleTimeString()
          : '';
        this.dom.calibStatusText.innerHTML = `
          <span style="color: #10b981;">✓ Allineato con successo su: <strong>${window.calibrationManager.calibratedStar?.name || ''}</strong> alle ore ${timeStr}</span>
        `;
      } else {
        this.dom.calibStatusText.innerHTML = `
          <span style="color: #f59e0b;">⚠️ Telescopio non ancora calibrato. Punta l'astro al centro del tuo oculare e tocca "Conferma Allineamento".</span>
        `;
      }
    }
  }

  handleCalibrationConfirm() {
    if (!this.currentTarget) {
      alert('Seleziona un astro di calibrazione prima di procedere.');
      return;
    }

    const raw = window.sensorManager.rawOrientation;
    const res = window.calibrationManager.alignToTarget(this.currentTarget, raw);

    if (res.success) {
      // Feedback acustico di conferma
      if (window.feedbackManager) {
        window.feedbackManager.playTargetLockChime();
        window.feedbackManager.triggerHaptic();
      }

      this.updateCalibrationViewUI();
      this.updateStatusBadges();

      alert(`Allineamento completato con successo!\n\nOffset Altitudine: ${CelestialManager.formatDMS(res.altOffset, true)}\nOffset Azimut: ${CelestialManager.formatDMS(res.azOffset, true)}\n\nIl mirino Push-To ora corregge in tempo reale la posizione del tubo.`);
      this.switchTab('hud');
    } else {
      alert('Errore allineamento: ' + (res.error || 'Dati sensore non disponibili.'));
    }
  }

  /**
   * Mantiene lo schermo dell'iPhone sveglio durante l'osservazione
   */
  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        document.addEventListener('visibilitychange', async () => {
          if (this.wakeLock !== null && document.visibilityState === 'visible') {
            this.wakeLock = await navigator.wakeLock.request('screen');
          }
        });
      } catch (err) {
        console.warn('Wake Lock non disponibile:', err.message);
      }
    }
  }

  /**
   * Registra il Service Worker per il funzionamento offline della PWA
   */
  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('Service Worker registrato con successo:', reg.scope))
          .catch(err => console.warn('Errore registrazione Service Worker:', err));
      });
    }
  }
}

// Inizializza applicazione
window.starWayApp = new StarWayApp();
