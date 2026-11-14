/**
 * StarWay - Catalogo Celeste & Calcolo Effemeridi
 * Utilizza astronomy-engine per calcoli di altissima precisione in tempo reale.
 */

// Catalogo corpi celesti, stelle di calibrazione e oggetti Deep Sky (Messier & NGC)
const CELESTIAL_CATALOG = [
  // --- SISTEMA SOLARE ---
  {
    id: 'moon',
    name: 'Luna',
    designation: 'Luna',
    type: 'Pianeta/Satellite',
    constellation: 'Variabile',
    mag: -12.5,
    isSolarSystem: true,
    body: 'Moon',
    popular: true,
    isCalibrationStar: true,
    description: 'Il nostro satellite naturale. Perfetta per calibrazione diurna o notturna.'
  },
  {
    id: 'jupiter',
    name: 'Giove',
    designation: 'Pianeta',
    type: 'Pianeta',
    constellation: 'Variabile',
    mag: -2.4,
    isSolarSystem: true,
    body: 'Jupiter',
    popular: true,
    isCalibrationStar: true,
    description: 'Il gigante gassoso con le quattro lune galileiane visibili.'
  },
  {
    id: 'saturn',
    name: 'Saturno',
    designation: 'Pianeta',
    type: 'Pianeta',
    constellation: 'Variabile',
    mag: 0.5,
    isSolarSystem: true,
    body: 'Saturn',
    popular: true,
    isCalibrationStar: true,
    description: 'Il signore degli anelli. Favoloso in qualsiasi telescopio.'
  },
  {
    id: 'mars',
    name: 'Marte',
    designation: 'Pianeta',
    type: 'Pianeta',
    constellation: 'Variabile',
    mag: -0.5,
    isSolarSystem: true,
    body: 'Mars',
    popular: true,
    isCalibrationStar: true,
    description: 'Il pianeta rosso.'
  },
  {
    id: 'venus',
    name: 'Venere',
    designation: 'Pianeta',
    type: 'Pianeta',
    constellation: 'Variabile',
    mag: -4.4,
    isSolarSystem: true,
    body: 'Venus',
    popular: true,
    isCalibrationStar: true,
    description: 'La stella del mattino o della sera. Luminosissima a falce.'
  },
  {
    id: 'mercury',
    name: 'Mercurio',
    designation: 'Pianeta',
    type: 'Pianeta',
    constellation: 'Variabile',
    mag: 0.1,
    isSolarSystem: true,
    body: 'Mercury',
    popular: true,
    description: 'Il pianeta più interno, visibile al crepuscolo.'
  },
  {
    id: 'sun',
    name: 'Sole (ATTENZIONE FILTRO)',
    designation: 'Stella',
    type: 'Stella / Solare',
    constellation: 'Variabile',
    mag: -26.7,
    isSolarSystem: true,
    body: 'Sun',
    popular: true,
    isSunWarning: true,
    isCalibrationStar: true,
    description: '⚠️ ATTENZIONE: OSSERVARE SOLO CON FILTRO SOLARE A TUTTA APERTURA CERTIFICATO! Cecità immediata senza filtro.'
  },

  // --- STELLE DI CALIBRAZIONE CHIAVE ---
  {
    id: 'polaris',
    name: 'Stella Polare (Polaris)',
    designation: 'Alpha UMi / HIP 11767',
    type: 'Stella di Calibrazione',
    constellation: 'Orsa Minore (UMi)',
    mag: 1.98,
    ra: 2.5303, // ore
    dec: 89.2641, // gradi
    popular: true,
    isCalibrationStar: true,
    isPolaris: true,
    description: 'La stella perno del Polo Nord Celeste. Calibrazione ideale nell\'emisfero boreale!'
  },
  {
    id: 'vega',
    name: 'Vega',
    designation: 'Alpha Lyr / HIP 91262',
    type: 'Stella Calibrazione',
    constellation: 'Lira (Lyr)',
    mag: 0.03,
    ra: 18.6156,
    dec: 38.7837,
    popular: true,
    isCalibrationStar: true,
    description: 'Luminosa stella azzurra del Triangolo Estivo.'
  },
  {
    id: 'arcturus',
    name: 'Arturo (Arcturus)',
    designation: 'Alpha Boo / HIP 69673',
    type: 'Stella Calibrazione',
    constellation: 'Bootes (Boo)',
    mag: -0.05,
    ra: 14.2610,
    dec: 19.1822,
    popular: true,
    isCalibrationStar: true,
    description: 'Gigante arancione tra le stelle più luminose del cielo.'
  },
  {
    id: 'sirius',
    name: 'Sirio (Sirius)',
    designation: 'Alpha CMa / HIP 32349',
    type: 'Stella Calibrazione',
    constellation: 'Cane Maggiore (CMa)',
    mag: -1.46,
    ra: 6.7525,
    dec: -16.7161,
    popular: true,
    isCalibrationStar: true,
    description: 'La stella più luminosa del cielo notturno terrestre.'
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    designation: 'Alpha Ori / HIP 27989',
    type: 'Stella Calibrazione',
    constellation: 'Orione (Ori)',
    mag: 0.50,
    ra: 5.9195,
    dec: 7.4071,
    popular: true,
    isCalibrationStar: true,
    description: 'Supergigante rossa al vertice nord-est di Orione.'
  },
  {
    id: 'rigel',
    name: 'Rigel',
    designation: 'Beta Ori / HIP 24436',
    type: 'Stella Calibrazione',
    constellation: 'Orione (Ori)',
    mag: 0.18,
    ra: 5.2423,
    dec: -8.2016,
    popular: true,
    isCalibrationStar: true,
    description: 'Supergigante blu-bianca al vertice sud-ovest di Orione.'
  },
  {
    id: 'capella',
    name: 'Capella',
    designation: 'Alpha Aur / HIP 24608',
    type: 'Stella Calibrazione',
    constellation: 'Auriga (Aur)',
    mag: 0.08,
    ra: 5.2782,
    dec: 45.9980,
    popular: true,
    isCalibrationStar: true,
    description: 'Luminosa stella multipla circumpolare per medie latitudini.'
  },
  {
    id: 'altair',
    name: 'Altair',
    designation: 'Alpha Aql / HIP 97649',
    type: 'Stella Calibrazione',
    constellation: 'Aquila (Aql)',
    mag: 0.77,
    ra: 19.8464,
    dec: 8.8683,
    popular: true,
    isCalibrationStar: true,
    description: 'Vertice meridionale del Triangolo Estivo.'
  },
  {
    id: 'deneb',
    name: 'Deneb',
    designation: 'Alpha Cyg / HIP 102098',
    type: 'Stella Calibrazione',
    constellation: 'Cigno (Cyg)',
    mag: 1.25,
    ra: 20.6905,
    dec: 45.2803,
    popular: true,
    isCalibrationStar: true,
    description: 'Supergigante bianca nella costellazione del Cigno.'
  },
  {
    id: 'aldebaran',
    name: 'Aldebaran',
    designation: 'Alpha Tau / HIP 21421',
    type: 'Stella Calibrazione',
    constellation: 'Toro (Tau)',
    mag: 0.85,
    ra: 4.5987,
    dec: 16.5093,
    popular: true,
    isCalibrationStar: true,
    description: 'L\'occhio rosso del Toro, vicino all\'ammasso delle Iadi.'
  },
  {
    id: 'antares',
    name: 'Antares',
    designation: 'Alpha Sco / HIP 80763',
    type: 'Stella Calibrazione',
    constellation: 'Scorpione (Sco)',
    mag: 1.06,
    ra: 16.4901,
    dec: -26.4320,
    popular: true,
    isCalibrationStar: true,
    description: 'Il cuore fiammeggiante dello Scorpione.'
  },
  {
    id: 'spica',
    name: 'Spica',
    designation: 'Alpha Vir / HIP 65474',
    type: 'Stella Calibrazione',
    constellation: 'Vergine (Vir)',
    mag: 0.98,
    ra: 13.4199,
    dec: -11.1613,
    popular: true,
    isCalibrationStar: true,
    description: 'Brillante stella azzurra della Vergine.'
  },
  {
    id: 'pollux',
    name: 'Polluce (Pollux)',
    designation: 'Beta Gem / HIP 37826',
    type: 'Stella Calibrazione',
    constellation: 'Gemelli (Gem)',
    mag: 1.16,
    ra: 7.7553,
    dec: 28.0262,
    popular: true,
    isCalibrationStar: true,
    description: 'Uno dei due celebri gemelli celesti.'
  },
  {
    id: 'castor',
    name: 'Castore (Castor)',
    designation: 'Alpha Gem / HIP 36850',
    type: 'Stella Doppia / Calibrazione',
    constellation: 'Gemelli (Gem)',
    mag: 1.58,
    ra: 7.5767,
    dec: 31.8883,
    popular: true,
    isCalibrationStar: true,
    description: 'Famoso sistema sestuplo, bella doppia all\'oculare.'
  },
  {
    id: 'procyon',
    name: 'Procione (Procyon)',
    designation: 'Alpha CMi / HIP 37279',
    type: 'Stella Calibrazione',
    constellation: 'Cane Minore (CMi)',
    mag: 0.38,
    ra: 7.6551,
    dec: 5.2250,
    popular: true,
    isCalibrationStar: true,
    description: 'Vertice del Triangolo Invernale.'
  },
  {
    id: 'fomalhaut',
    name: 'Fomalhaut',
    designation: 'Alpha PsA / HIP 113368',
    type: 'Stella Calibrazione',
    constellation: 'Pesce Australe (PsA)',
    mag: 1.17,
    ra: 22.9608,
    dec: -29.6222,
    popular: false,
    isCalibrationStar: true,
    description: 'Stella solitaria dell\'autunno meridionale.'
  },
  {
    id: 'regulus',
    name: 'Regolo (Regulus)',
    designation: 'Alpha Leo / HIP 49669',
    type: 'Stella Calibrazione',
    constellation: 'Leone (Leo)',
    mag: 1.36,
    ra: 10.1395,
    dec: 11.9672,
    popular: true,
    isCalibrationStar: true,
    description: 'Il cuore del Leone sull\'eclittica.'
  },
  {
    id: 'dubhe',
    name: 'Dubhe',
    designation: 'Alpha UMa / HIP 54061',
    type: 'Stella Calibrazione',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 1.79,
    ra: 11.0621,
    dec: 61.7508,
    isCalibrationStar: true,
    description: 'Puntatore settentrionale verso la Stella Polare.'
  },
  {
    id: 'merak',
    name: 'Merak',
    designation: 'Beta UMa / HIP 53910',
    type: 'Stella Calibrazione',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 2.37,
    ra: 11.0307,
    dec: 56.3824,
    isCalibrationStar: true,
    description: 'Puntatore verso la Stella Polare insieme a Dubhe.'
  },
  {
    id: 'mizar',
    name: 'Mizar & Alcor',
    designation: 'Zeta UMa / HIP 65378',
    type: 'Stella Doppia / Calibrazione',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 2.23,
    ra: 13.3987,
    dec: 54.9254,
    popular: true,
    isCalibrationStar: true,
    description: 'La celebre doppia del timone del Gran Carro.'
  },
  {
    id: 'albireo',
    name: 'Albireo',
    designation: 'Beta Cyg / HIP 95947',
    type: 'Stella Doppia Meravigliosa',
    constellation: 'Cigno (Cyg)',
    mag: 3.05,
    ra: 19.5126,
    dec: 27.9597,
    popular: true,
    isCalibrationStar: true,
    description: 'La stella doppia con il contrasto cromatico oro-blu più bello del cielo.'
  },

  // --- OGGETTI DEL CIELO PROFONDO (DEEP SKY - MESSIER & NGC) ---
  {
    id: 'm42',
    name: 'M42 - Nebulosa di Orione',
    designation: 'Messier 42 / NGC 1976',
    type: 'Nebulosa Diffusa a Emissione',
    constellation: 'Orione (Ori)',
    mag: 4.0,
    ra: 5.5881,
    dec: -5.3911,
    popular: true,
    description: 'La culla stellare più spettacolare del cielo, con il Trapezio al centro.'
  },
  {
    id: 'm31',
    name: 'M31 - Galassia di Andromeda',
    designation: 'Messier 31 / NGC 224',
    type: 'Galassia a Spirale',
    constellation: 'Andromeda (And)',
    mag: 3.44,
    ra: 0.7123,
    dec: 41.2688,
    popular: true,
    description: 'La grande galassia a spirale vicina, visibile a occhio nudo sotto cieli bui.'
  },
  {
    id: 'm45',
    name: 'M45 - Le Pleiadi',
    designation: 'Messier 45 / Sette Sorelle',
    type: 'Ammasso Aperto',
    constellation: 'Toro (Tau)',
    mag: 1.6,
    ra: 3.7900,
    dec: 24.1100,
    popular: true,
    description: 'Il più brillante ammasso aperto del cielo boreale.'
  },
  {
    id: 'm13',
    name: 'M13 - Grande Ammasso di Ercole',
    designation: 'Messier 13 / NGC 6205',
    type: 'Ammasso Globulare',
    constellation: 'Ercole (Her)',
    mag: 5.8,
    ra: 16.6950,
    dec: 36.4600,
    popular: true,
    description: 'Oltre 300.000 stelle raggruppate in una sfera brillante.'
  },
  {
    id: 'm57',
    name: 'M57 - Nebulosa Anello (Ring Nebula)',
    designation: 'Messier 57 / NGC 6720',
    type: 'Nebulosa Planetaria',
    constellation: 'Lira (Lyr)',
    mag: 8.8,
    ra: 18.8932,
    dec: 33.0292,
    popular: true,
    description: 'Il classico fumo ad anello lasciato da una nana bianca morente.'
  },
  {
    id: 'm27',
    name: 'M27 - Nebulosa Dumbbell',
    designation: 'Messier 27 / NGC 6853',
    type: 'Nebulosa Planetaria',
    constellation: 'Volpetta (Vul)',
    mag: 7.4,
    ra: 19.9933,
    dec: 22.7211,
    popular: true,
    description: 'Grande e luminosa nebulosa planetaria a clessidra.'
  },
  {
    id: 'm51',
    name: 'M51 - Galassia Vortice (Whirlpool)',
    designation: 'Messier 51 / NGC 5194',
    type: 'Galassia a Spirale con Interazione',
    constellation: 'Cani da Caccia (CVn)',
    mag: 8.4,
    ra: 13.4981,
    dec: 47.1989,
    popular: true,
    description: 'Spettacolare galassia a spirale vista di fronte con compagna interagente.'
  },
  {
    id: 'm8',
    name: 'M8 - Nebulosa Laguna',
    designation: 'Messier 8 / NGC 6523',
    type: 'Nebulosa Diffusa & Ammasso',
    constellation: 'Sagittario (Sgr)',
    mag: 6.0,
    ra: 18.0603,
    dec: -24.3833,
    popular: true,
    description: 'Vasta nube interstellare e ammasso nel cuore della Via Lattea.'
  },
  {
    id: 'm20',
    name: 'M20 - Nebulosa Trifida',
    designation: 'Messier 20 / NGC 6514',
    type: 'Nebulosa a Emissione/Riflessione',
    constellation: 'Sagittario (Sgr)',
    mag: 6.3,
    ra: 18.0444,
    dec: -23.0311,
    popular: true,
    description: 'Divisa in tre lobi da corridoi di polvere oscura.'
  },
  {
    id: 'm16',
    name: 'M16 - Nebulosa Aquila (Eagle Nebula)',
    designation: 'Messier 16 / NGC 6611',
    type: 'Nebulosa & Pilastri della Creazione',
    constellation: 'Serpente (Ser)',
    mag: 6.4,
    ra: 18.3133,
    dec: -13.7911,
    popular: true,
    description: 'Sede dei celebri Pilastri della Creazione.'
  },
  {
    id: 'm17',
    name: 'M17 - Nebulosa Omega / Cigno',
    designation: 'Messier 17 / NGC 6618',
    type: 'Nebulosa a Emissione',
    constellation: 'Sagittario (Sgr)',
    mag: 6.0,
    ra: 18.3467,
    dec: -16.1767,
    popular: true,
    description: 'Brillante nebulosa a forma di cigno che galleggia sull\'acqua.'
  },
  {
    id: 'm1',
    name: 'M1 - Nebulosa del Granchio (Crab)',
    designation: 'Messier 1 / NGC 1952',
    type: 'Resto di Supernova',
    constellation: 'Toro (Tau)',
    mag: 8.4,
    ra: 5.5756,
    dec: 22.0144,
    popular: true,
    description: 'Resto della supernova esplosa nell\'anno 1054, con pulsar centrale.'
  },
  {
    id: 'm44',
    name: 'M44 - Presepe (Beehive Cluster)',
    designation: 'Messier 44 / NGC 2632',
    type: 'Ammasso Aperto',
    constellation: 'Cancro (Cnc)',
    mag: 3.7,
    ra: 8.6678,
    dec: 19.6667,
    popular: true,
    description: 'Splendido ammasso aperto visibile anche a occhio nudo.'
  },
  {
    id: 'm81',
    name: 'M81 - Galassia di Bode',
    designation: 'Messier 81 / NGC 3031',
    type: 'Galassia a Spirale',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 6.9,
    ra: 9.9261,
    dec: 69.0653,
    popular: true,
    description: 'Luminosa galassia a spirale classica del Grande Carro.'
  },
  {
    id: 'm82',
    name: 'M82 - Galassia Sigaro (Cigar)',
    designation: 'Messier 82 / NGC 3034',
    type: 'Galassia Starburst',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 8.4,
    ra: 9.9297,
    dec: 69.6797,
    popular: true,
    description: 'Galassia vista di taglio con intensissima attività di formazione stellare.'
  },
  {
    id: 'm104',
    name: 'M104 - Galassia Sombrero',
    designation: 'Messier 104 / NGC 4594',
    type: 'Galassia Lenticolare/Spirale',
    constellation: 'Vergine (Vir)',
    mag: 8.0,
    ra: 12.6664,
    dec: -11.6231,
    popular: true,
    description: 'Celeberrima galassia dal grande bulbo centrale e banda di polvere scura.'
  },
  {
    id: 'm33',
    name: 'M33 - Galassia del Triangolo',
    designation: 'Messier 33 / NGC 598',
    type: 'Galassia a Spirale',
    constellation: 'Triangolo (Tri)',
    mag: 5.7,
    ra: 1.5642,
    dec: 30.6603,
    popular: true,
    description: 'Terzo membro principale del nostro Gruppo Locale di galassie.'
  },
  {
    id: 'm11',
    name: 'M11 - Anitra Selvatica (Wild Duck)',
    designation: 'Messier 11 / NGC 6705',
    type: 'Ammasso Aperto Compatto',
    constellation: 'Scudo (Sct)',
    mag: 5.8,
    ra: 18.8517,
    dec: -6.2700,
    popular: false,
    description: 'Uno degli ammassi aperti più ricchi e compatti del cielo.'
  },
  {
    id: 'm15',
    name: 'M15',
    designation: 'Messier 15 / NGC 7078',
    type: 'Ammasso Globulare',
    constellation: 'Pegaso (Peg)',
    mag: 6.2,
    ra: 21.5000,
    dec: 12.1667,
    popular: false,
    description: 'Ammasso globulare antichissimo con nucleo ad altissima densità.'
  },
  {
    id: 'm22',
    name: 'M22',
    designation: 'Messier 22 / NGC 6656',
    type: 'Ammasso Globulare',
    constellation: 'Sagittario (Sgr)',
    mag: 5.1,
    ra: 18.6067,
    dec: -23.9033,
    popular: false,
    description: 'Tra i globulari più luminosi e vicini alla Terra.'
  },
  {
    id: 'm64',
    name: 'M64 - Occhio Nero (Black Eye)',
    designation: 'Messier 64 / NGC 4826',
    type: 'Galassia a Spirale',
    constellation: 'Chioma di Berenice (Com)',
    mag: 8.5,
    ra: 12.9458,
    dec: 21.6828,
    popular: false,
    description: 'Caratterizzata da una nube di polveri assorbenti davanti al nucleo.'
  },
  {
    id: 'm97',
    name: 'M97 - Nebulosa Civetta (Owl Nebula)',
    designation: 'Messier 97 / NGC 3587',
    type: 'Nebulosa Planetaria',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 9.9,
    ra: 11.2467,
    dec: 55.0194,
    popular: false,
    description: 'Nebulosa planetaria con due cavità scure che ricordano gli occhi di un gufo.'
  },
  {
    id: 'm101',
    name: 'M101 - Galassia Girandola (Pinwheel)',
    designation: 'Messier 101 / NGC 5457',
    type: 'Galassia a Spirale',
    constellation: 'Orsa Maggiore (UMa)',
    mag: 7.9,
    ra: 14.0533,
    dec: 54.3492,
    popular: false,
    description: 'Magnifica spirale frontale estesa nell\'Orsa Maggiore.'
  },
  {
    id: 'ngc869',
    name: 'NGC 869 & 884 - Doppio Ammasso di Perseo',
    designation: 'h + Chi Persei',
    type: 'Ammasso Aperto Doppio',
    constellation: 'Perseo (Per)',
    mag: 3.7,
    ra: 2.3167,
    dec: 57.1333,
    popular: true,
    description: 'Coppia mozzafiato di ammassi aperti immersi nel braccio di Perseo.'
  },
  {
    id: 'ngc7000',
    name: 'NGC 7000 - Nebulosa Nord America',
    designation: 'Caldwell 20',
    type: 'Nebulosa a Emissione',
    constellation: 'Cigno (Cyg)',
    mag: 4.0,
    ra: 20.9833,
    dec: 44.5333,
    popular: false,
    description: 'Vasta nebulosa che ricalca i contorni del continente nordamericano.'
  },
  {
    id: 'ngc6960',
    name: 'NGC 6960 - Velo del Cigno (Pizzo di Strega)',
    designation: 'Caldwell 34 / Veil Nebula',
    type: 'Resto di Supernova',
    constellation: 'Cigno (Cyg)',
    mag: 7.0,
    ra: 20.7611,
    dec: 30.7167,
    popular: false,
    description: 'Filamenti di gas ionizzato generati da una supernova circa 10.000 anni fa.'
  },
  {
    id: 'ngc253',
    name: 'NGC 253 - Galassia dello Scultore',
    designation: 'Silver Dollar Galaxy',
    type: 'Galassia Starburst',
    constellation: 'Scultore (Scl)',
    mag: 7.2,
    ra: 0.7933,
    dec: -25.2917,
    popular: false,
    description: 'Una delle galassie più luminose del cielo australe.'
  }
];

class CelestialManager {
  constructor() {
    this.catalog = CELESTIAL_CATALOG;
    this.observer = null;
    this.currentPositions = new Map(); // id -> { alt, az, ra, dec, isVisible }
  }

  /**
   * Imposta l'osservatore corrente con coordinate geografiche
   * @param {number} lat Latitudine in gradi decimali (-90 .. +90)
   * @param {number} lon Longitudine in gradi decimali (-180 .. +180)
   * @param {number} heightMeters Altitudine sul livello del mare in metri
   */
  setObserver(lat, lon, heightMeters = 50) {
    if (window.Astronomy) {
      this.observer = new window.Astronomy.Observer(lat, lon, heightMeters);
    }
  }

  /**
   * Calcola Altitudine e Azimut per un singolo oggetto celeste
   * @param {Object} item Oggetto del catalogo o custom target { ra, dec, isSolarSystem, body }
   * @param {Date} date Data/ora del calcolo (default: adesso)
   * @returns {{ altitude: number, azimuth: number, ra: number, dec: number, isVisible: boolean }}
   */
  computeObjectCoordinates(item, date = new Date()) {
    if (!window.Astronomy || !this.observer) {
      return { altitude: 0, azimuth: 0, ra: item.ra || 0, dec: item.dec || 0, isVisible: false };
    }

    try {
      if (item.isSolarSystem && item.body) {
        // Corpi del sistema solare: calcolo effemeridi in tempo reale
        const bodyName = window.Astronomy.Body[item.body];
        if (bodyName) {
          const eq = window.Astronomy.Equator(bodyName, date, this.observer, true, true);
          const hor = window.Astronomy.Horizon(date, this.observer, eq.ra, eq.dec, 'normal');
          return {
            altitude: hor.altitude,
            azimuth: hor.azimuth,
            ra: eq.ra,
            dec: eq.dec,
            isVisible: hor.altitude > 0
          };
        }
      }

      // Stelle fisse e Deep Sky: conversione da RA (ore) e Dec (gradi) ad Alt/Az
      if (typeof item.ra === 'number' && typeof item.dec === 'number') {
        const hor = window.Astronomy.Horizon(date, this.observer, item.ra, item.dec, 'normal');
        return {
          altitude: hor.altitude,
          azimuth: hor.azimuth,
          ra: item.ra,
          dec: item.dec,
          isVisible: hor.altitude > 0
        };
      }
    } catch (err) {
      console.warn('Errore calcolo coordinate per:', item.name || item.id, err);
    }

    return { altitude: 0, azimuth: 0, ra: 0, dec: 0, isVisible: false };
  }

  /**
   * Ricalcola la posizione di tutti gli oggetti del catalogo per l'istante attuale
   * @param {Date} date Data/ora corrente
   */
  updateAllPositions(date = new Date()) {
    if (!this.observer) return;

    for (const item of this.catalog) {
      const coords = this.computeObjectCoordinates(item, date);
      this.currentPositions.set(item.id, coords);
    }
  }

  /**
   * Recupera le coordinate correnti di un oggetto dato il suo ID
   * @param {string} id ID univoco dell'oggetto
   * @returns {Object|null}
   */
  getCoordinates(id) {
    return this.currentPositions.get(id) || null;
  }

  /**
   * Filtra e ricerca nel catalogo
   * @param {Object} options Filtri { filterType: 'all'|'visible'|'popular'|'calibration'|'deepsky', searchQuery: string }
   * @returns {Array<Object>} Oggetti filtrati con coordinate calcolate
   */
  getFilteredList(options = {}) {
    const { filterType = 'all', searchQuery = '' } = options;
    const query = searchQuery.trim().toLowerCase();

    return this.catalog
      .map(item => {
        const coords = this.currentPositions.get(item.id) || this.computeObjectCoordinates(item);
        return {
          ...item,
          coords
        };
      })
      .filter(item => {
        // Filtro visibilità
        if (filterType === 'visible' && !item.coords.isVisible) {
          return false;
        }
        if (filterType === 'popular' && !item.popular) {
          return false;
        }
        if (filterType === 'calibration' && !item.isCalibrationStar) {
          return false;
        }
        if (filterType === 'deepsky' && (item.isSolarSystem || item.type.includes('Stella'))) {
          return false;
        }

        // Filtro di ricerca testuale
        if (query.length > 0) {
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesig = item.designation.toLowerCase().includes(query);
          const matchConst = item.constellation.toLowerCase().includes(query);
          const matchType = item.type.toLowerCase().includes(query);
          const matchId = item.id.toLowerCase().includes(query);
          if (!matchName && !matchDesig && !matchConst && !matchType && !matchId) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Metti prima la Stella Polare nelle liste di calibrazione
        if (a.isPolaris) return -1;
        if (b.isPolaris) return 1;

        // Se entrambi visibili, ordina per altitudine decrescente (più alto nel cielo = migliore visibilità)
        if (a.coords.isVisible && b.coords.isVisible) {
          return b.coords.altitude - a.coords.altitude;
        }
        // Visibili prima di non visibili
        if (a.coords.isVisible && !b.coords.isVisible) return -1;
        if (!a.coords.isVisible && b.coords.isVisible) return 1;

        return a.name.localeCompare(b.name);
      });
  }

  /**
   * Formatta un angolo in gradi in una stringa leggibile: gradi, primi d'arco (es. +42° 18')
   */
  static formatDMS(deg, isElevation = false) {
    if (typeof deg !== 'number' || isNaN(deg)) return '--° --\'';
    const sign = deg < 0 ? '-' : (isElevation ? '+' : '');
    const abs = Math.abs(deg);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    return `${sign}${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}'`;
  }
}

// Esporta istanza singleton globale
window.celestialManager = new CelestialManager();
