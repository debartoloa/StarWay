# 🔭 StarWay - Push-To Telescopio (PWA per iOS & Android)

**StarWay** è una Progressive Web App (PWA) mobile-first progettata per il puntamento assistito **"Push-To"** di telescopi astronomici (in particolare montature altazimutali **Dobson** e Newtoniani), utilizzabile 100% offline sul campo.

Sfrutta le API native HTML5 dello smartphone:
- **`DeviceOrientationEvent`**: Orientamento giroscopico e bussola magnetica 3D (con supporto al flusso permessi `requestPermission()` su iOS Safari).
- **`Geolocation API`**: Rilevamento GPS automatico in tempo reale (latitudine, longitudine, quota) con possibilità di inserimento manuale.
- **`Astronomy-Engine`**: Motore astronomico integrato 100% offline ad alta precisione (VSOP87) per il calcolo istantaneo di effemeridi e coordinate `(Alt, Az)`.
- **`Screen Wake Lock API` + Fallback NoSleep**: Mantiene lo schermo sempre acceso durante le sessioni osservative (con micro-video H.264/AAC e audio keep-alive per iOS Safari e modalità Risparmio Energetico).
- **Service Worker (`Network-First` con fallback offline) & Web App Manifest**: Installabile come app nativa a schermo intero su iPhone e Android.

---

## 🌟 Caratteristiche Principali

### 1. Allineamento ad 1 Astro (1-Star Alignment) & Mini-Mappa Celeste
Risolve anomalie magnetiche, declinazione locale e tolleranze di fissaggio sul tubo:
1. Scegli un astro di riferimento dalla lista rapida (es. **Stella Polare**, Vega, Sirio, Arturo, Giove, Luna) o dal Catalogo.
2. **Mini-Mappa Cielo Circostante & Vista Oculare (in tempo reale)**:
   - Visualizza su canvas circolare le stelle reali, le linee delle costellazioni, eventuali pianeti/oggetti Deep Sky, l'orizzonte locale e l'indicatore **`N`** verso il Polo Nord Celeste, calcolati esattamente per **posizione GPS, data e ora correnti**.
   - L'astro target selezionato al centro lampeggia con effetto **fading** per facilitarne il riconoscimento immediato senza coprire il campo con cerchi ingombranti.
   - **Selettore FOV (`50°` / `30°` / `10°`)**: Passa da una vista panoramica a una vista ravvicinata da cercatore/oculare.
   - **🔭 Newtonian Mode (Vista Dobson / Newton)**: Interruttore dedicato che applica una trasformazione speculare e capovolta di **180° (inversione orizzontale e verticale)** alla mappa, all'orizzonte e agli indicatori cardinali, replicando fedelmente ciò che vedi nel focheggiatore di un telescopio Newtoniano/Dobson.
3. Centra l'astro nell'oculare e tocca **"Conferma Allineamento Adesso"**: l'app calcola istantaneamente l'offset geometrico $(\Delta Alt, \Delta Az)$ e corregge in tempo reale tutte le letture del mirino Push-To.

### 2. Puntamento Push-To in Tempo Reale (HUD)
- **Mirino Radar Grafico su HTML5 Canvas**: Visualizza il bersaglio rispetto al centro ottico con anelli concentrici di scala e tolleranza configurabile (`± 0.25°`, `± 0.50°`, `± 1.00°`).
- **Frecce Direzionali Intelligenti**: Indicatori luminosi (▲ ALZA, ▼ ABBASSA, ◀ RUOTA SX, ▶ RUOTA DX) che segnalano direzione e urgenza dello spostamento.
- **Feedback Acustico & Aptico**: Sintetizzatore Web Audio 100% offline in stile sonar (frequenza e ritmo proporzionali alla vicinanza) con accordo armonico e vibrazione al centramento del bersaglio.

### 3. Selettore di Montaggio Smartphone sul Tubo
Adatta automaticamente le matrici di orientamento 3D al supporto fisico usato sul telescopio:
- **Posizione PARALLELA (`PARALLEL_TOP`)**: Sommità del telefono rivolta verso l'apertura anteriore (asse $+Y$).
- **Posizione PERPENDICOLARE Destra / Sinistra (`PERP_RIGHT` / `PERP_LEFT`)**: Telefono montato lateralmente a 90° per leggere comodamente lo schermo accanto all'oculare Dobson.
- **Fotocamera Posteriore (`CAMERA_BACK`)**: Dorso del telefono rivolto lungo l'asse ottico.

### 4. Catalogo Astri & Filtro "Visibili Ora"
- **Sistema Solare**: Luna, Giove, Saturno, Marte, Venere, Mercurio, Sole (con avviso di sicurezza per filtro solare certificato a tutta apertura).
- **Stelle di Calibrazione**: Stella Polare, Vega, Sirio, Arturo, Betelgeuse, Rigel, Capella, Altair, Deneb, Aldebaran, Antares, Spica, Polluce, Castore, Procione, Regolo, Dubhe, Merak, Mizar & Alcor, Albireo, Fomalhaut.
- **Deep Sky (Messier & NGC)**: M42, M31, M45, M13, M57, M27, M51, M8, M20, M16, M17, M1, M44, M81, M82, M104, M33, M11, M15, M22, M64, M97, M101, NGC 869/884, NGC 7000, NGC 6960, NGC 253.
- **Filtri rapidi e ricerca**: `Tutti`, `Visibili Ora (Alt > 0°)`, `I più Amati`, `Stelle Calibrazione`, `Deep Sky (M / NGC)`.

### 5. UI/UX Astronomica & Schermo Sempre Attivo
- **Visione Notturna (Night Vision)**: Interfaccia a dominante rosso profondo su nero ossidiana per preservare l'adattamento al buio della pupilla.
- **Modalità Giorno**: Tema ambra/slate ad alto contrasto per osservazioni solari o test diurni.
- **Indicatore Schermo Sempre Attivo (`💡 Sempre Attivo`)**: Conferma visiva nella barra superiore che il blocco spegnimento display è attivo.

---

## 📁 Struttura del Progetto

```text
├── index.html              # Struttura PWA, tab HUD, Catalogo, Calibrazione e Impostazioni
├── manifest.json           # Configurazione installazione PWA
├── sw.js                   # Service Worker (Network-First + Cache offline)
├── server.ps1              # Server HTTP locale PowerShell per test su PC/LAN
├── README.md               # Documentazione principale del progetto
├── CHANGELOG.md            # Registro cronologico delle versioni (Keep a Changelog)
├── .gitignore              # Esclusioni Git per file di sistema, log e temporanei
├── css/
│   └── style.css           # Stili mobile-first (Visione Notturna / Giorno + Safe Areas iOS)
├── js/
│   ├── astronomy.browser.min.js  # Libreria effemeridi Astronomy Engine
│   ├── storage.js          # Gestione centralizzata LocalStorage
│   ├── catalog.js          # Catalogo oggetti celesti e calcolo coordinate Alt/Az
│   ├── sensors.js          # Gestione giroscopio, bussola, GPS e matrici montaggio
│   ├── calibration.js      # Logica 1-Star Alignment e calcolo guida Push-To
│   ├── audio.js            # Feedback sonoro sonar (Web Audio API) e aptico
│   ├── render-reticle.js   # Renderer Canvas del mirino radar Push-To
│   ├── render-skymap.js    # Renderer Canvas mini-mappa celeste & Newtonian Mode
│   └── app.js              # Controller principale UI, loop HUD e Wake Lock
├── assets/
│   ├── icons/              # Icone PWA (192x192, 512x512)
│   └── img/                # Risorse grafiche
└── docs/                   # Documentazione tecnica aggiuntiva
```

---

## 📲 Come Installare e Provare su iPhone / Android

> [!IMPORTANT]
> **Requisito HTTPS su iOS Safari:**
> Apple consente l'accesso a giroscopio/bussola (`DeviceOrientationEvent`) e Service Worker **solo tramite connessione HTTPS** (oppure `localhost`).

### Avvio online (es. GitHub Pages)
Carica i file del progetto su un hosting statico HTTPS (es. GitHub Pages, Vercel, Netlify, Cloudflare Pages) e apri l'URL in **Safari** (iOS) o **Chrome** (Android).

### Test Locale dal PC
Avvia il server PowerShell incluso ed esponilo con un tunnel HTTPS:
```powershell
.\server.ps1
```
In un altro terminale:
```bash
npx cloudflared tunnel --url http://localhost:8080
```

### Installazione sulla Schermata Home (iPhone)
1. Apri l'URL HTTPS in **Safari**.
2. Tocca **Condividi** -> **"Aggiungi alla schermata Home"** -> **"Aggiungi"**.
3. Avvia **StarWay** dall'icona sulla Home per usarla a schermo intero.
4. Tocca **"Autorizza Giroscopio"** sul banner superiore e tocca lo schermo per attivare il badge **`💡 Sempre Attivo`**.
