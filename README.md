# 🔭 StarWay - Push-To Telescopio (PWA per iOS & Android)

**StarWay** è una Progressive Web App (PWA) mobile-first creata per il puntamento assistito "Push-To" di telescopi astronomici (es. montature altazimutali Dobson).

Sfrutta le API native HTML5 del dispositivo:
- **`DeviceOrientationEvent`**: Orientamento giroscopico e bussola magnetica 3D (con gestione della richiesta di autorizzazione su iOS Safari `requestPermission()`).
- **`Geolocation API`**: Coordinate GPS in tempo reale (latitudine, longitudine, quota).
- **`Astronomy-Engine`**: Motore astronomico integrato 100% offline ad altissima precisione (VSOP87).
- **Service Worker & Web App Manifest**: Installabile come app nativa a schermo intero senza barre del browser su iPhone e Android.

---

## 🌟 Caratteristiche Principali

### 1. Selettore di Orientamento & Montaggio Smartphone
Consente di adattare l'app al supporto fisico montato sul tubo del telescopio:
- **Posizione PARALLELA:** La sommità del telefono punta verso l'apertura anteriore del telescopio (asse ottico $+Y$).
- **Posizione PERPENDICOLARE (Destra / Sinistra):** Il telefono è montato di traverso a 90° sul tubo per una lettura ergonomica stando in piedi accanto all'oculare.
- **Fotocamera Posteriore:** Per supporti con il dorso rivolto verso la direzione di puntamento.

### 2. Sistema di Calibrazione Celeste ad 1 Astro (1-Star Alignment)
Risolve qualsiasi anomalia magnetica o imprecisione di montaggio:
1. Centra un astro ben visibile nell'oculare (es. **Stella Polare**, Vega, Sirio, Luna, Giove).
2. Seleziona l'astro nella lista di calibrazione rapida.
3. Tocca **"Conferma Allineamento"**: l'app calcola istantaneamente l'offset geometrico tra i sensori grezzi del telefono e le coordinate $(Alt, Az)$ teoriche esatte.
4. L'offset corregge tutte le successive letture del mirino Push-To.

### 3. Puntamento Push-To in Tempo Reale
- **Mirino Radar Grafico su HTML5 Canvas**: Visualizza la posizione dell'astro rispetto al centro dell'ottica con anelli concentrici di scala.
- **Frecce Direzionali Intelligenti**: Frecce luminose pulsanti (▲ ALZA, ▼ ABBASSA, ◀ RUOTA SX, ▶ RUOTA DX) che indicano la direzione e l'intensità del movimento da impartire al telescopio.
- **Feedback Acustico & Aptico**: Sintetizzatore Web Audio (funziona senza file audio esterni). Frequenza del beep in stile sonar proporzionale alla vicinanza; al raggiungimento del bersaglio ($< 0.5^\circ$), il mirino diventa verde e suona un accordo armonico accompagnato da vibrazione.

### 4. Catalogo Astri & Filtro "Visibili Ora"
- **Sistema Solare**: Luna, Giove, Saturno, Marte, Venere, Mercurio, Sole (con avviso di sicurezza per filtro solare a tutta apertura).
- **Stelle di Calibrazione Principali**: Stella Polare, Vega, Sirio, Arturo, Betelgeuse, Rigel, Capella, Altair, Deneb, Aldebaran, Antares, Spica, Polluce, Castore, Procione, Regolo, Dubhe, Mizar & Alcor, Albireo, ecc.
- **Deep Sky (Messier & NGC)**: M42 Orione, M31 Andromeda, M45 Pleiadi, M13 Ercole, M57 Anello, M27 Dumbbell, M51 Vortice, M8 Laguna, M20 Trifida, M81/M82, M104 Sombrero, Doppio Ammasso di Perseo (NGC 869/884), e molti altri.
- **Filtro Istantaneo**: Mostra solo oggetti con Altitudine $> 0^\circ$ sull'orizzonte locale.
- **Barra di Ricerca**: Ricerca rapida per nome o designazione (es. "M42", "Polaris", "Saturno").

### 5. UI/UX Astronomica
- **Modalità Visione Notturna (Night Vision)**: Grafica a dominante rosso profondo e nero ossidiana per preservare l'adattamento al buio dell'occhio umano.
- **Modalità Giorno**: Tema ambra/slate per osservazioni solari diurne.
- **Screen Wake Lock**: Mantiene lo schermo dell'iPhone sempre acceso durante le sessioni osservative.

---

## 📲 Come Installare e Provare su iPhone via Safari (PWA)

> [!IMPORTANT]
> **Requisito di Sicurezza Apple per iOS Safari:**
> Safari consente l'accesso alle API giroscopio/bussola (`DeviceOrientationEvent`) e al Service Worker **solo tramite connessione HTTPS protetta** (oppure `localhost`).
> Se apri una pagina via semplice `http://192.168.x.x`, Safari disattiva per sicurezza la richiesta di permesso dei sensori.

### Metodo 1: Deploy Gratuito con HTTPS in 1 Click (Consigliato per il campo)
Carica la cartella su una piattaforma di hosting statico con HTTPS gratuito:
1. **GitHub Pages:**
   - Crea un repository GitHub, carica i file e attiva *GitHub Pages* da `Settings > Pages`.
   - Apri l'URL HTTPS generato sul tuo iPhone in Safari.
2. **Vercel / Cloudflare Pages / Netlify:**
   - Trascina la cartella `StarWay` sulla dashboard di Vercel o Netlify per ottenere un URL HTTPS istantaneo (es. `https://starway.vercel.app`).

### Metodo 2: Test Locale con Tunnel HTTPS (ngrok o Cloudflare Tunnel)
Se hai avviato il server locale sul tuo PC con PowerShell (`.\server.ps1`), puoi esporlo in HTTPS al tuo iPhone con:
```bash
# Con Cloudflare Tunnel (gratuito senza registrazione):
npx cloudflared tunnel --url http://localhost:8080

# Oppure con ngrok:
ngrok http 8080
```
Apri l'URL `https://...` generato direttamente in **Safari** su iPhone.

### Procedura di Installazione sulla Schermata Home:
1. Apri la pagina in **Safari** su iPhone.
2. Tocca l'icona **Condividi** (il quadrato con la freccia rivolta verso l'alto al centro della barra inferiore di Safari).
3. Scorri il foglio delle azioni e seleziona **"Aggiungi alla schermata Home"**.
4. Tocca **"Aggiungi"** in alto a destra.
5. Sulla schermata Home del tuo iPhone troverai l'icona personalizzata **StarWay**.
6. Toccala per avviare l'app: si aprirà **a tutto schermo come un'app nativa**, senza barre di navigazione o barre URL di Safari.
7. Al primo avvio, tocca il banner superiore **"Autorizza Giroscopio"** per abilitare l'orientamento in tempo reale.
