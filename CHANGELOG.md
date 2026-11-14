# Changelog

Tutte le modifiche rilevanti a **StarWay** sono documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/) e il progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [1.0.0] - 2026-11-14

### Added
- **Architettura PWA Vanilla**: Struttura modulare con `index.html`, `manifest.json`, `sw.js` (strategia *Network-First* con fallback offline), `css/style.css`, `js/` e `assets/`.
- **Modulo `js/storage.js`**: Gestione centralizzata e sicura della persistenza locale (`localStorage`).
- **Puntamento Push-To in Tempo Reale (`js/app.js`, `js/render-reticle.js`)**: Mirino radar su HTML5 Canvas ad alta frequenza con anelli di scala, tolleranza configurabile (`±0.25°`, `±0.50°`, `±1.00°`) e frecce direzionali.
- **Sensori & Orientamento (`js/sensors.js`)**: Supporto completo a `DeviceOrientationEvent` (incluso flusso permessi iOS Safari), `Geolocation API` e matrice di montaggio (`PARALLEL_TOP`, `PERP_RIGHT`, `PERP_LEFT`, `CAMERA_BACK`).
- **Calibrazione ad 1 Astro & Mini-Mappa Celeste (`js/calibration.js`, `js/render-skymap.js`)**:
  - Simulatore circolare del cielo circostante in tempo reale (stelle, linee delle costellazioni, pianeti, Deep Sky, orizzonte locale, indicatore Polo Nord Celeste `N`).
  - Astro target centrale evidenziato con lampeggiamento *fading* senza cerchio di ingombro.
  - Selettore campo visivo FOV (`50°`, `30°`, `10°`).
  - **Newtonian Mode**: flag dedicato per inversione speculare e capovolta di 180° (orizzontale + verticale) per telescopi Newtoniani/Dobson.
- **Catalogo Celeste Offline (`js/catalog.js`, `js/astronomy.browser.min.js`)**: Sistema Solare, stelle di calibrazione e oggetti Messier/NGC con filtro *Visibili Ora* e ricerca istantanea.
- **Feedback Acustico & Aptico (`js/audio.js`)**: Sintetizzatore Web Audio stile sonar e vibrazione al centramento del bersaglio.
- **Screen Wake Lock + Fallback NoSleep**: Mantenimento schermo sempre acceso su iOS Safari e Android con badge di stato `💡 Sempre Attivo`.
- **Temi Astronomici**: Modalità *Visione Notturna* (rosso profondo su nero) e *Modalità Giorno* (ambra/slate).
- **Documentazione & Versioning**: `README.md`, `CHANGELOG.md` e `.gitignore` configurati secondo lo standard del repository.
