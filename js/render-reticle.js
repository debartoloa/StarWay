/**
 * StarWay - Renderer Grafico del Mirino Push-To (Canvas Reticle HUD)
 * Renderizza il mirino astronomico ad alta precisione con radar, graticole e marker
 */

class ReticleRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    this.maxRadarDegrees = 8.0; // Raggio massimo visibile del radar in gradi
    this.animationPulse = 0;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Dimensione effettiva in pixel del display per nitidezza retina display su iPhone
    const size = Math.min(rect.width || 340, rect.height || 340);
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.scale(dpr, dpr);
    this.displaySize = size;
  }

  /**
   * Renderizza il mirino completo per il frame corrente
   * @param {Object} guidance { deltaAlt, deltaAz, angularDistance, isCentered }
   * @param {number} tolerance Tolleranza di centraggio in gradi (es. 0.5)
   * @param {string} theme 'night' | 'day'
   */
  render(guidance, tolerance = 0.5, theme = 'night') {
    if (!this.canvas || !this.ctx) return;
    this.animationPulse = (this.animationPulse + 0.05) % (Math.PI * 2);

    const size = this.displaySize || 340;
    const ctx = this.ctx;
    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = cx - 18;

    ctx.clearRect(0, 0, size, size);

    const isLocked = guidance && guidance.isCentered;

    // Palette cromatica in base al tema e allo stato di lock
    const colors = this.getPalette(theme, isLocked);

    // 1. Sfondo del mirino circolare
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.bgCircle;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = colors.outerBorder;
    ctx.stroke();

    // 2. Anelli di scala concentrici: 100% (max), 50% (metà scala), e anello di Tolleranza
    const ringScale = maxRadius / this.maxRadarDegrees;

    // Anello esterno (maxRadarDegrees)
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.gridFaint;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    // Anello intermedio (metà scala, es. 4.0°)
    const midRadius = (this.maxRadarDegrees / 2) * ringScale;
    ctx.beginPath();
    ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.gridFaint;
    ctx.stroke();

    // Anello di Tolleranza Target (<0.5°)
    const tolRadius = Math.max(14, tolerance * ringScale);
    ctx.beginPath();
    ctx.arc(cx, cy, tolRadius, 0, Math.PI * 2);
    ctx.setLineDash([]);
    ctx.lineWidth = isLocked ? 2.5 : 1.5;
    ctx.strokeStyle = colors.targetRing;
    ctx.stroke();

    if (isLocked) {
      // Effetto alone e pulsazione concentrica quando centrato
      const pulseRadius = tolRadius + Math.sin(this.animationPulse) * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.lockPulse;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, tolRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors.lockFill;
      ctx.fill();
    }

    // 3. Linee del reticolo a croce (Crosshairs)
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.crosshair;

    // Linea orizzontale (Asse Azimut)
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx - tolRadius - 4, cy);
    ctx.moveTo(cx + tolRadius + 4, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();

    // Linea verticale (Asse Altitudine)
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy - tolRadius - 4);
    ctx.moveTo(cx, cy + tolRadius + 4);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.stroke();

    // Tacche graduate sugli assi ogni 2 gradi
    const tickStep = 2.0;
    const tickCount = Math.floor(this.maxRadarDegrees / tickStep);
    ctx.strokeStyle = colors.gridFaint;
    for (let i = 1; i <= tickCount; i++) {
      const dist = i * tickStep * ringScale;
      // Tacche asse orizzontale
      ctx.beginPath();
      ctx.moveTo(cx + dist, cy - 4);
      ctx.lineTo(cx + dist, cy + 4);
      ctx.moveTo(cx - dist, cy - 4);
      ctx.lineTo(cx - dist, cy + 4);
      ctx.stroke();

      // Tacche asse verticale
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - dist);
      ctx.lineTo(cx + 4, cy - dist);
      ctx.moveTo(cx - 4, cy + dist);
      ctx.lineTo(cx + 4, cy + dist);
      ctx.stroke();
    }

    // Punto centrale del crocicchio
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = colors.centerDot;
    ctx.fill();

    // Etichette dei gradi di campo
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = colors.labelText;
    ctx.textAlign = 'right';
    ctx.fillText(`${(this.maxRadarDegrees / 2).toFixed(0)}°`, cx - midRadius - 4, cy - 6);
    ctx.fillText(`${this.maxRadarDegrees.toFixed(0)}°`, cx - maxRadius + 22, cy - 6);
    ctx.restore();

    // 4. Disegna il marker del Target
    if (guidance) {
      this.drawTargetMarker(ctx, cx, cy, maxRadius, ringScale, guidance, colors, isLocked);
    }
  }

  /**
   * Disegna il pallino/mirino dell'astro rispetto al centro ottico
   */
  drawTargetMarker(ctx, cx, cy, maxRadius, ringScale, guidance, colors, isLocked) {
    const { deltaAlt, deltaAz, angularDistance } = guidance;

    // Coordinate nel mirino:
    // Se deltaAz > 0, il target è a destra -> x positivo
    // Se deltaAlt > 0, il target è più alto -> y negativo (verso l'alto dello schermo)
    const rawTargetX = deltaAz * ringScale;
    const rawTargetY = -deltaAlt * ringScale;

    const targetDistPix = Math.hypot(rawTargetX, rawTargetY);
    const isInsideRadar = targetDistPix <= (maxRadius - 12);

    let markerX, markerY;

    if (isInsideRadar) {
      markerX = cx + rawTargetX;
      markerY = cy + rawTargetY;

      // Disegna bersaglio circolare luminoso
      ctx.save();
      ctx.shadowBlur = isLocked ? 16 : 8;
      ctx.shadowColor = colors.markerGlow;

      // Cerchio esterno del marker
      ctx.beginPath();
      ctx.arc(markerX, markerY, isLocked ? 10 : 8, 0, Math.PI * 2);
      ctx.fillStyle = colors.markerBody;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = colors.markerStroke;
      ctx.stroke();

      // Nucleo brillante
      ctx.beginPath();
      ctx.arc(markerX, markerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Traccia linea di guida verso il centro se non ancora bloccato
      if (!isLocked && targetDistPix > 15) {
        ctx.beginPath();
        ctx.moveTo(markerX, markerY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = colors.guideVector;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
      }

      ctx.restore();
    } else {
      // Fuori dal campo radar: ancora una freccia guida lungo il bordo esterno
      const angle = Math.atan2(rawTargetY, rawTargetX);
      const edgeRadius = maxRadius - 10;
      markerX = cx + Math.cos(angle) * edgeRadius;
      markerY = cy + Math.sin(angle) * edgeRadius;

      ctx.save();
      ctx.translate(markerX, markerY);
      ctx.rotate(angle);

      // Freccia triangolare orientata verso il target esterno
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-8, 6);
      ctx.closePath();

      ctx.fillStyle = colors.offscreenArrow;
      ctx.fill();
      ctx.strokeStyle = colors.markerStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }

  getPalette(theme, isLocked) {
    if (theme === 'night') {
      // Palette Visione Notturna Rossa ad alto contrasto
      if (isLocked) {
        return {
          bgCircle: 'rgba(25, 0, 5, 0.85)',
          outerBorder: '#00ff88', // Verde brillante di lock o rosso fuoco
          gridFaint: 'rgba(0, 255, 136, 0.35)',
          targetRing: '#00ff88',
          lockPulse: 'rgba(0, 255, 136, 0.6)',
          lockFill: 'rgba(0, 255, 136, 0.25)',
          crosshair: '#00ff88',
          centerDot: '#ffffff',
          labelText: '#00ff88',
          markerGlow: '#00ff88',
          markerBody: '#00ff88',
          markerStroke: '#ffffff',
          guideVector: 'rgba(0, 255, 136, 0.4)',
          offscreenArrow: '#00ff88'
        };
      } else {
        return {
          bgCircle: 'rgba(20, 0, 3, 0.85)',
          outerBorder: '#ff2a3a',
          gridFaint: 'rgba(255, 50, 60, 0.25)',
          targetRing: 'rgba(255, 60, 70, 0.6)',
          lockPulse: 'rgba(255, 40, 50, 0.5)',
          lockFill: 'rgba(255, 40, 50, 0.2)',
          crosshair: 'rgba(255, 40, 50, 0.5)',
          centerDot: '#ff4455',
          labelText: 'rgba(255, 80, 90, 0.65)',
          markerGlow: '#ff3344',
          markerBody: '#ff1a2b',
          markerStroke: '#ffe5e8',
          guideVector: 'rgba(255, 60, 70, 0.45)',
          offscreenArrow: '#ff3344'
        };
      }
    } else {
      // Tema Giorno / Solare (Ambra / Oro / Arancio scuro)
      if (isLocked) {
        return {
          bgCircle: 'rgba(10, 20, 15, 0.85)',
          outerBorder: '#10b981',
          gridFaint: 'rgba(16, 185, 129, 0.35)',
          targetRing: '#10b981',
          lockPulse: 'rgba(16, 185, 129, 0.5)',
          lockFill: 'rgba(16, 185, 129, 0.2)',
          crosshair: '#10b981',
          centerDot: '#ffffff',
          labelText: '#10b981',
          markerGlow: '#10b981',
          markerBody: '#10b981',
          markerStroke: '#ffffff',
          guideVector: 'rgba(16, 185, 129, 0.4)',
          offscreenArrow: '#10b981'
        };
      } else {
        return {
          bgCircle: 'rgba(18, 16, 25, 0.85)',
          outerBorder: '#f59e0b',
          gridFaint: 'rgba(245, 158, 11, 0.25)',
          targetRing: 'rgba(245, 158, 11, 0.55)',
          lockPulse: 'rgba(245, 158, 11, 0.4)',
          lockFill: 'rgba(245, 158, 11, 0.15)',
          crosshair: 'rgba(245, 158, 11, 0.5)',
          centerDot: '#fbbf24',
          labelText: 'rgba(245, 158, 11, 0.7)',
          markerGlow: '#f59e0b',
          markerBody: '#f59e0b',
          markerStroke: '#ffffff',
          guideVector: 'rgba(245, 158, 11, 0.4)',
          offscreenArrow: '#f59e0b'
        };
      }
    }
  }
}

// Esporta classe globale
window.ReticleRenderer = ReticleRenderer;
