/**
 * StarWay - Pianificatore di Tour Celesti (Sessioni di Osservazione Pianificate)
 * Gestisce creazione, salvataggio, analisi visibilità su slot di 3 ore,
 * ottimizzazione cronologica del percorso ed esecuzione guidata del tour.
 */

class TourPlannerManager {
  constructor() {
    this.storageKey = 'planned_tours';
    this.tours = [];
    this.activeRunner = null; // { tourId, items, currentIndex, alignmentConfirmed }
    this.loadTours();
  }

  loadTours() {
    const saved = window.storageManager
      ? window.storageManager.getJSON(this.storageKey, [])
      : [];
    this.tours = Array.isArray(saved) ? saved : [];
  }

  saveTours() {
    if (window.storageManager) {
      window.storageManager.set(this.storageKey, this.tours);
    }
  }

  getAllTours() {
    return [...this.tours].sort((a, b) => {
      const dateA = `${a.dateStr}T${String(a.slotStartHour).padStart(2, '0')}:00`;
      const dateB = `${b.dateStr}T${String(b.slotStartHour).padStart(2, '0')}:00`;
      return dateA.localeCompare(dateB);
    });
  }

  getTourById(id) {
    return this.tours.find(t => t.id === id) || null;
  }

  saveTour(tourData) {
    const nowIso = new Date().toISOString();
    if (tourData.id) {
      const idx = this.tours.findIndex(t => t.id === tourData.id);
      if (idx !== -1) {
        this.tours[idx] = {
          ...this.tours[idx],
          ...tourData,
          updatedAt: nowIso
        };
        this.saveTours();
        return this.tours[idx];
      }
    }

    const newTour = {
      id: 'tour_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: tourData.name || 'Sessione Osservativa',
      dateStr: tourData.dateStr,
      slotStartHour: Number(tourData.slotStartHour),
      slotDurationHours: 3,
      orderMode: tourData.orderMode || 'smart',
      itemIds: Array.isArray(tourData.itemIds) ? [...tourData.itemIds] : [],
      createdAt: nowIso,
      updatedAt: nowIso
    };
    this.tours.push(newTour);
    this.saveTours();
    return newTour;
  }

  deleteTour(id) {
    this.tours = this.tours.filter(t => t.id !== id);
    if (this.activeRunner && this.activeRunner.tourId === id) {
      this.activeRunner = null;
    }
    this.saveTours();
  }

  /**
   * Calcola l'oggetto Date di inizio dello slot (ora locale)
   */
  getSlotStartDate(dateStr, slotStartHour) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1, Number(slotStartHour) || 21, 0, 0, 0);
    return dt;
  }

  /**
   * Formatta la finestra oraria di 3 ore (es. "21:00 - 00:00")
   */
  formatSlotLabel(slotStartHour, duration = 3) {
    const start = Number(slotStartHour) % 24;
    const end = (start + duration) % 24;
    return `${String(start).padStart(2, '0')}:00 - ${String(end).padStart(2, '0')}:00`;
  }

  /**
   * Formatta una data YYYY-MM-DD in italiano leggibile
   */
  formatDateLabel(dateStr) {
    if (!dateStr) return '--';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Analizza la visibilità, gli orari di tramonto/sorgere e genera consigli osservativi
   * per un oggetto celeste nella finestra di 3 ore selezionata.
   */
  analyzeObjectForSlot(item, dateStr, slotStartHour, durationHours = 3) {
    const slotStart = this.getSlotStartDate(dateStr, slotStartHour);
    const slotDurationMs = durationHours * 3600 * 1000;
    const slotEnd = new Date(slotStart.getTime() + slotDurationMs);

    if (!window.celestialManager || !window.celestialManager.observer) {
      return {
        item,
        startAlt: 0,
        endAlt: 0,
        maxAlt: 0,
        isVisibleInSlot: false,
        disappearTime: null,
        riseTime: null,
        statusLabel: 'Coordinate GPS non pronte',
        statusLevel: 'warn',
        difficultyLabel: 'N/D',
        advice: 'Attiva il GPS o imposta le coordinate nelle Opzioni per calcolare la visibilità.'
      };
    }

    // 1. Campionamento ogni 15 minuti nello slot di 3 ore (13 punti)
    const stepMinutes = 15;
    const totalSteps = (durationHours * 60) / stepMinutes;
    let startAlt = 0;
    let endAlt = 0;
    let maxAlt = -90;
    let visibleSamples = 0;
    let riseTime = null;
    let prevAlt = null;

    for (let i = 0; i <= totalSteps; i++) {
      const sampleTime = new Date(slotStart.getTime() + i * stepMinutes * 60 * 1000);
      const coords = window.celestialManager.computeObjectCoordinates(item, sampleTime);
      const alt = coords.altitude;

      if (i === 0) startAlt = alt;
      if (i === totalSteps) endAlt = alt;
      if (alt > maxAlt) maxAlt = alt;
      if (alt > 0) visibleSamples++;

      if (prevAlt !== null && prevAlt <= 0 && alt > 0 && !riseTime) {
        riseTime = sampleTime;
      }
      prevAlt = alt;
    }

    const isVisibleInSlot = maxAlt > 0;

    // 2. Cerca quando l'oggetto tramonta (scende <= 0°) a partire dall'inizio dello slot fino a +12 ore
    let disappearTime = null;
    const searchHorizonHours = 12;
    const searchStepMin = 10;
    const searchSteps = (searchHorizonHours * 60) / searchStepMin;
    let wasAbove = startAlt > 0;

    for (let i = 1; i <= searchSteps; i++) {
      const t = new Date(slotStart.getTime() + i * searchStepMin * 60 * 1000);
      const coords = window.celestialManager.computeObjectCoordinates(item, t);
      if (coords.altitude > 0) {
        wasAbove = true;
      } else if (wasAbove && coords.altitude <= 0) {
        disappearTime = t;
        break;
      }
    }

    // 3. Determina etichetta di stato e urgenza
    const formatHM = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    let statusLabel = '';
    let statusLevel = 'ok';

    if (!isVisibleInSlot) {
      statusLabel = `Sotto orizzonte nello slot (Max ${maxAlt.toFixed(0)}°)`;
      statusLevel = 'danger';
    } else if (disappearTime && disappearTime <= slotEnd) {
      statusLabel = `Tramonta alle ${formatHM(disappearTime)} (Punta presto!)`;
      statusLevel = 'warn';
    } else if (startAlt <= 0 && riseTime) {
      statusLabel = `Sorge alle ${formatHM(riseTime)} (Max +${maxAlt.toFixed(0)}°)`;
      statusLevel = 'warn';
    } else if (disappearTime) {
      statusLabel = `Visibile tutto lo slot • Tramonta ${formatHM(disappearTime)}`;
      statusLevel = 'ok';
    } else {
      statusLabel = `Visibile tutta la notte (Max +${maxAlt.toFixed(0)}°)`;
      statusLevel = 'ok';
    }

    // 4. Difficoltà e consigli osservativi intelligenti
    const mag = typeof item.mag === 'number' ? item.mag : 9.0;
    let difficultyLabel = 'Facile';
    const adviceParts = [];

    if (item.isSunWarning) {
      difficultyLabel = 'Solo con Filtro';
      adviceParts.push('⚠️ Osservazione diurna: usare esclusivamente filtro solare certificato a tutta apertura!');
    } else if (!isVisibleInSlot) {
      difficultyLabel = 'Non visibile';
      adviceParts.push('In questa fascia oraria l\'oggetto resta sotto l\'orizzonte: scegli uno slot diverso o un altro astro.');
    } else {
      if (maxAlt < 15) {
        adviceParts.push(`Molto basso sull'orizzonte (max +${maxAlt.toFixed(0)}°): soggetto a turbolenza atmosferica, osservalo prima possibile.`);
      } else if (maxAlt < 35) {
        adviceParts.push(`Altezza media (+${maxAlt.toFixed(0)}°): buona osservabilità lontano da ostacoli bassi.`);
      } else {
        adviceParts.push(`Ottima elevazione (+${maxAlt.toFixed(0)}°): cielo più terso e immagine stabile.`);
      }

      if (mag <= 1.5) {
        difficultyLabel = 'Facile';
        adviceParts.push(`Mag ${mag.toFixed(1)}: brillantissimo, individuabile subito anche a occhio nudo.`);
      } else if (mag <= 4.5) {
        difficultyLabel = 'Facile / Media';
        adviceParts.push(`Mag ${mag.toFixed(1)}: ben visibile nel cercatore, ottimo contrasto.`);
      } else if (mag <= 7.5) {
        difficultyLabel = 'Media';
        adviceParts.push(`Mag ${mag.toFixed(1)}: usa un oculare a largo campo (25–32mm) per centrarlo facilmente.`);
      } else {
        difficultyLabel = 'Impegnativa';
        adviceParts.push(`Mag ${mag.toFixed(1)}: oggetto debole, richiede cielo buio, oculare a bassi ingrandimenti e visione distolta.`);
      }

      if (disappearTime && disappearTime <= slotEnd) {
        adviceParts.push(`Priorità alta: sparirà alle ${formatHM(disappearTime)}.`);
      }
    }

    return {
      item,
      startAlt,
      endAlt,
      maxAlt,
      visibleMinutes: visibleSamples * stepMinutes,
      isVisibleInSlot,
      disappearTime,
      riseTime,
      statusLabel,
      statusLevel,
      difficultyLabel,
      advice: adviceParts.join(' ')
    };
  }

  /**
   * Restituisce gli oggetti del tour analizzati e ordinati secondo `orderMode`:
   * - 'custom': mantiene l'ordine esatto scelto dall'utente
   * - 'smart': ordina cronologicamente in base a chi tramonta/sparisce prima,
   *            fino agli oggetti visibili più a lungo nella notte
   */
  getOrderedItemsWithAnalysis(itemIds, dateStr, slotStartHour, orderMode = 'smart') {
    if (!window.celestialManager) return [];

    const analyses = itemIds
      .map(id => window.celestialManager.catalog.find(o => o.id === id))
      .filter(Boolean)
      .map(item => this.analyzeObjectForSlot(item, dateStr, slotStartHour, 3));

    if (orderMode !== 'smart') {
      return analyses;
    }

    return [...analyses].sort((a, b) => {
      // 1. Oggetti visibili nello slot sempre prima di quelli non visibili
      if (a.isVisibleInSlot !== b.isVisibleInSlot) {
        return a.isVisibleInSlot ? -1 : 1;
      }
      if (!a.isVisibleInSlot && !b.isVisibleInSlot) {
        return b.maxAlt - a.maxAlt;
      }

      // 2. Chi è già sopra l'orizzonte all'inizio dello slot e tramonta prima ha priorità
      //    rispetto a chi sorge più tardi (se non tramonta prima)
      const timeA = a.disappearTime ? a.disappearTime.getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.disappearTime ? b.disappearTime.getTime() : Number.MAX_SAFE_INTEGER;

      if (timeA !== timeB) {
        return timeA - timeB;
      }

      // 3. A parità (es. entrambi circumpolari / visibili tutta la notte):
      //    chi sta scendendo (endAlt più bassa rispetto a startAlt) prima di chi sta salendo
      const trendA = a.endAlt - a.startAlt;
      const trendB = b.endAlt - b.startAlt;
      if (Math.abs(trendA - trendB) > 0.5) {
        return trendA - trendB;
      }

      return a.endAlt - b.endAlt;
    });
  }

  /**
   * Avvia l'esecuzione guidata di un tour salvato
   */
  startRunner(tourId) {
    const tour = this.getTourById(tourId);
    if (!tour) return null;

    const orderedAnalyses = this.getOrderedItemsWithAnalysis(
      tour.itemIds,
      tour.dateStr,
      tour.slotStartHour,
      tour.orderMode
    );

    this.activeRunner = {
      tourId: tour.id,
      tourName: tour.name,
      dateStr: tour.dateStr,
      slotStartHour: tour.slotStartHour,
      orderMode: tour.orderMode,
      items: orderedAnalyses,
      currentIndex: 0,
      alignmentConfirmed: false
    };

    return this.activeRunner;
  }

  stopRunner() {
    this.activeRunner = null;
  }
}

window.tourPlannerManager = new TourPlannerManager();
