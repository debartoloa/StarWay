/**
 * StarWay - Sistema Feedback Acustico & Aptico (Web Audio API)
 * Generatore sonoro sintetizzato 100% offline per guida al puntamento
 */

class FeedbackManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.isUnlocked = false;

    this.lastBeepTime = 0;
    this.isPlayingLockChime = false;
    this.hasVibratedForLock = false;

    this.init();
  }

  init() {
    const savedMute = localStorage.getItem('starway_muted');
    this.isMuted = savedMute === 'true';

    // Sblocca AudioContext al primo tocco dell'utente (requisito policy browser iOS/Safari)
    const unlockAudio = () => {
      this.ensureAudioContext();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.isUnlocked = true;
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    document.addEventListener('click', unlockAudio, { once: true });
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('starway_muted', this.isMuted.toString());
    return this.isMuted;
  }

  /**
   * Emette un singolo beep a frequenza e durata specificate
   */
  playBeep(frequency = 587.33, duration = 0.08, volume = 0.15) {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      // Inviluppo per evitare click audio (fade-in / fade-out)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // AudioContext potrebbe non essere pronto
    }
  }

  /**
   * Suona l'accordo armonico di bersaglio centrato (Target Acquired!)
   */
  playTargetLockChime() {
    if (this.isMuted || this.isPlayingLockChime) return;
    this.ensureAudioContext();
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;

    this.isPlayingLockChime = true;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // Accordo di Do Maggiore (C5, E5, G5)

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.5);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.52);
      });

      // Reset stato dopo il chime
      setTimeout(() => {
        this.isPlayingLockChime = false;
      }, 700);
    } catch (e) {
      this.isPlayingLockChime = false;
    }
  }

  /**
   * Vibrazione aptica per bersaglio centrato
   */
  triggerHaptic() {
    if ('vibrate' in navigator && !this.hasVibratedForLock) {
      try {
        navigator.vibrate([60, 40, 60, 40, 100]);
        this.hasVibratedForLock = true;
      } catch (e) {
        // Ignora
      }
    }
  }

  /**
   * Aggiorna il feedback acustico in tempo reale in base alla distanza angolare
   * @param {number} angularDistance Distanza in gradi dal bersaglio
   * @param {boolean} isCentered Vero se dentro la tolleranza (<0.5°)
   */
  updateGuidanceAudio(angularDistance, isCentered) {
    if (isCentered) {
      this.playTargetLockChime();
      this.triggerHaptic();
      return;
    }

    // Se non è più centrato, ripristina la possibilità di vibrare al prossimo lock
    this.hasVibratedForLock = false;

    // Se la distanza è maggiore di 6.0°, nessun suono continuo
    if (angularDistance > 6.0) {
      return;
    }

    // Effetto Sonar/Geiger: intervallo e pitch dipendenti dalla distanza (0.5° a 6.0°)
    // Distanza 6° -> 1.0 sec intervallo, 440 Hz
    // Distanza 0.6° -> 0.12 sec intervallo, 780 Hz
    const normalized = Math.max(0, Math.min(1, (angularDistance - 0.5) / 5.5));
    const intervalMs = 120 + normalized * 880;
    const frequency = 780 - normalized * 340;

    const nowTime = performance.now();
    if (nowTime - this.lastBeepTime >= intervalMs) {
      this.lastBeepTime = nowTime;
      this.playBeep(frequency, 0.06, 0.12);
    }
  }
}

// Esporta istanza singleton globale
window.feedbackManager = new FeedbackManager();
