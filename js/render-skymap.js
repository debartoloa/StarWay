/**
 * StarWay - Mini-Mappa Celeste & Simulatore Vista Oculare per Calibrazione
 * Renderizza in tempo reale la porzione di cielo attorno all'astro selezionato
 * con linee delle costellazioni, stelle di campo, corpi del Sistema Solare e
 * modalità "Newtonian Mode" (inversione speculare 180° Orizzontale + Verticale).
 */

// Database di stelle di riferimento e costellazioni (J2000: ra in ore, dec in gradi, mag)
const SKY_BACKGROUND_STARS = [
  // Orsa Minore (UMi)
  { id: 'polaris', name: 'Polaris', ra: 2.5303, dec: 89.2641, mag: 1.98, con: 'UMi' },
  { id: 'kochab', name: 'Kochab', ra: 14.8451, dec: 74.1555, mag: 2.07, con: 'UMi' },
  { id: 'pherkad', name: 'Pherkad', ra: 15.3455, dec: 71.8340, mag: 3.00, con: 'UMi' },
  { id: 'yildun', name: 'Yildun (δ UMi)', ra: 17.5369, dec: 86.5864, mag: 4.35, con: 'UMi' },
  { id: 'epsilon_umi', name: 'ε UMi', ra: 16.7662, dec: 82.0373, mag: 4.21, con: 'UMi' },
  { id: 'zeta_umi', name: 'ζ UMi', ra: 15.7343, dec: 77.7945, mag: 4.29, con: 'UMi' },
  { id: 'eta_umi', name: 'η UMi', ra: 16.2918, dec: 75.7553, mag: 4.95, con: 'UMi' },

  // Orsa Maggiore (UMa)
  { id: 'dubhe', name: 'Dubhe', ra: 11.0621, dec: 61.7508, mag: 1.79, con: 'UMa' },
  { id: 'merak', name: 'Merak', ra: 11.0307, dec: 56.3824, mag: 2.37, con: 'UMa' },
  { id: 'phecda', name: 'Phecda', ra: 11.8972, dec: 53.6948, mag: 2.44, con: 'UMa' },
  { id: 'megrez', name: 'Megrez', ra: 12.2570, dec: 57.0326, mag: 3.31, con: 'UMa' },
  { id: 'alioth', name: 'Alioth', ra: 12.9005, dec: 55.9598, mag: 1.77, con: 'UMa' },
  { id: 'mizar', name: 'Mizar', ra: 13.3987, dec: 54.9254, mag: 2.23, con: 'UMa' },
  { id: 'alcor', name: 'Alcor', ra: 13.4204, dec: 54.9880, mag: 3.99, con: 'UMa' },
  { id: 'alkaid', name: 'Alkaid', ra: 13.7923, dec: 49.3133, mag: 1.86, con: 'UMa' },

  // Cassiopea (Cas)
  { id: 'schedar', name: 'Schedar', ra: 0.6751, dec: 56.5373, mag: 2.24, con: 'Cas' },
  { id: 'caph', name: 'Caph', ra: 0.1529, dec: 59.1498, mag: 2.28, con: 'Cas' },
  { id: 'gamma_cas', name: 'γ Cas', ra: 0.9451, dec: 60.7167, mag: 2.47, con: 'Cas' },
  { id: 'ruchbah', name: 'Ruchbah', ra: 1.4303, dec: 60.2353, mag: 2.68, con: 'Cas' },
  { id: 'segin', name: 'Segin', ra: 1.9066, dec: 63.6701, mag: 3.35, con: 'Cas' },

  // Orione (Ori)
  { id: 'betelgeuse', name: 'Betelgeuse', ra: 5.9195, dec: 7.4071, mag: 0.50, con: 'Ori' },
  { id: 'rigel', name: 'Rigel', ra: 5.2423, dec: -8.2016, mag: 0.18, con: 'Ori' },
  { id: 'bellatrix', name: 'Bellatrix', ra: 5.4189, dec: 6.3497, mag: 1.64, con: 'Ori' },
  { id: 'mintaka', name: 'Mintaka', ra: 5.5334, dec: -0.2991, mag: 2.23, con: 'Ori' },
  { id: 'alnilam', name: 'Alnilam', ra: 5.6036, dec: -1.2019, mag: 1.69, con: 'Ori' },
  { id: 'alnitak', name: 'Alnitak', ra: 5.6793, dec: -1.9428, mag: 1.77, con: 'Ori' },
  { id: 'saiph', name: 'Saiph', ra: 5.7959, dec: -9.6696, mag: 2.07, con: 'Ori' },
  { id: 'meissa', name: 'Meissa', ra: 5.5856, dec: 9.9342, mag: 3.39, con: 'Ori' },

  // Toro (Tau)
  { id: 'aldebaran', name: 'Aldebaran', ra: 4.5987, dec: 16.5093, mag: 0.85, con: 'Tau' },
  { id: 'elnath', name: 'Elnath', ra: 5.4382, dec: 28.6075, mag: 1.65, con: 'Tau' },
  { id: 'zeta_tau', name: 'ζ Tau', ra: 5.6274, dec: 21.1425, mag: 3.01, con: 'Tau' },
  { id: 'theta2_tau', name: 'θ Tau (Iadi)', ra: 4.4777, dec: 15.8709, mag: 3.40, con: 'Tau' },
  { id: 'gamma_tau', name: 'γ Tau', ra: 4.3299, dec: 15.6276, mag: 3.65, con: 'Tau' },
  { id: 'alcyone', name: 'Alcyone (M45)', ra: 3.7914, dec: 24.1051, mag: 2.87, con: 'Tau' },

  // Auriga (Aur)
  { id: 'capella', name: 'Capella', ra: 5.2782, dec: 45.9980, mag: 0.08, con: 'Aur' },
  { id: 'menkalinan', name: 'Menkalinan', ra: 5.9921, dec: 44.9474, mag: 1.90, con: 'Aur' },
  { id: 'theta_aur', name: 'θ Aur', ra: 5.9954, dec: 37.2126, mag: 2.62, con: 'Aur' },
  { id: 'hassaleh', name: 'Hassaleh', ra: 4.9499, dec: 33.1661, mag: 2.69, con: 'Aur' },
  { id: 'almaaz', name: 'Almaaz', ra: 5.0331, dec: 43.8233, mag: 2.99, con: 'Aur' },

  // Gemelli (Gem)
  { id: 'pollux', name: 'Polluce', ra: 7.7553, dec: 28.0262, mag: 1.16, con: 'Gem' },
  { id: 'castor', name: 'Castore', ra: 7.5767, dec: 31.8883, mag: 1.58, con: 'Gem' },
  { id: 'alhena', name: 'Alhena', ra: 6.6285, dec: 16.3993, mag: 1.93, con: 'Gem' },
  { id: 'wasat', name: 'Wasat', ra: 7.3355, dec: 21.9823, mag: 3.53, con: 'Gem' },
  { id: 'mebsuta', name: 'Mebsuta', ra: 6.7322, dec: 25.1311, mag: 3.06, con: 'Gem' },
  { id: 'tejat', name: 'Tejat', ra: 6.3826, dec: 22.5136, mag: 2.88, con: 'Gem' },

  // Cane Maggiore (CMa) & Minore (CMi)
  { id: 'sirius', name: 'Sirio', ra: 6.7525, dec: -16.7161, mag: -1.46, con: 'CMa' },
  { id: 'mirzam', name: 'Mirzam', ra: 6.3783, dec: -17.9559, mag: 1.98, con: 'CMa' },
  { id: 'wezen', name: 'Wezen', ra: 7.1399, dec: -26.3932, mag: 1.83, con: 'CMa' },
  { id: 'adhara', name: 'Adhara', ra: 6.9771, dec: -28.9721, mag: 1.50, con: 'CMa' },
  { id: 'aludra', name: 'Aludra', ra: 7.4016, dec: -29.3031, mag: 2.45, con: 'CMa' },
  { id: 'procyon', name: 'Procione', ra: 7.6551, dec: 5.2250, mag: 0.38, con: 'CMi' },
  { id: 'gomeisa', name: 'Gomeisa', ra: 7.4525, dec: 8.2893, mag: 2.89, con: 'CMi' },

  // Leone (Leo)
  { id: 'regulus', name: 'Regolo', ra: 10.1395, dec: 11.9672, mag: 1.36, con: 'Leo' },
  { id: 'algieba', name: 'Algieba', ra: 10.3329, dec: 19.8415, mag: 2.01, con: 'Leo' },
  { id: 'denebola', name: 'Denebola', ra: 11.8177, dec: 14.5721, mag: 2.14, con: 'Leo' },
  { id: 'zosma', name: 'Zosma', ra: 11.2351, dec: 20.5237, mag: 2.56, con: 'Leo' },
  { id: 'chertan', name: 'Chertan', ra: 11.2373, dec: 15.4296, mag: 3.33, con: 'Leo' },
  { id: 'eta_leo', name: 'η Leo', ra: 10.1223, dec: 16.7627, mag: 3.48, con: 'Leo' },
  { id: 'adhafera', name: 'Adhafera', ra: 10.2782, dec: 23.4173, mag: 3.43, con: 'Leo' },

  // Bootes (Boo) & Vergine (Vir)
  { id: 'arcturus', name: 'Arturo', ra: 14.2610, dec: 19.1822, mag: -0.05, con: 'Boo' },
  { id: 'izar', name: 'Izar', ra: 14.7498, dec: 27.0742, mag: 2.35, con: 'Boo' },
  { id: 'muphrid', name: 'Muphrid', ra: 13.9114, dec: 18.3977, mag: 2.68, con: 'Boo' },
  { id: 'seginus', name: 'Seginus', ra: 14.5349, dec: 38.3083, mag: 3.04, con: 'Boo' },
  { id: 'nekkar', name: 'Nekkar', ra: 15.0323, dec: 40.3906, mag: 3.49, con: 'Boo' },
  { id: 'spica', name: 'Spica', ra: 13.4199, dec: -11.1613, mag: 0.98, con: 'Vir' },
  { id: 'porrima', name: 'Porrima', ra: 12.6943, dec: -1.4494, mag: 2.74, con: 'Vir' },
  { id: 'vindemiatrix', name: 'Vindemiatrix', ra: 13.0363, dec: 10.9591, mag: 2.85, con: 'Vir' },

  // Lira (Lyr), Cigno (Cyg), Aquila (Aql)
  { id: 'vega', name: 'Vega', ra: 18.6156, dec: 38.7837, mag: 0.03, con: 'Lyr' },
  { id: 'sheliak', name: 'Sheliak', ra: 18.8347, dec: 33.3627, mag: 3.52, con: 'Lyr' },
  { id: 'sulafat', name: 'Sulafat', ra: 18.9824, dec: 32.6896, mag: 3.25, con: 'Lyr' },
  { id: 'epsilon_lyr', name: 'ε Lyr (Doppia-Doppia)', ra: 18.7393, dec: 39.6696, mag: 3.80, con: 'Lyr' },
  { id: 'zeta_lyr', name: 'ζ Lyr', ra: 18.7462, dec: 37.6051, mag: 4.34, con: 'Lyr' },
  { id: 'deneb', name: 'Deneb', ra: 20.6905, dec: 45.2803, mag: 1.25, con: 'Cyg' },
  { id: 'sadr', name: 'Sadr', ra: 20.3705, dec: 40.2567, mag: 2.23, con: 'Cyg' },
  { id: 'albireo', name: 'Albireo', ra: 19.5126, dec: 27.9597, mag: 3.05, con: 'Cyg' },
  { id: 'gienah_cyg', name: 'Gienah (ε Cyg)', ra: 20.7702, dec: 33.9703, mag: 2.48, con: 'Cyg' },
  { id: 'delta_cyg', name: 'δ Cyg', ra: 19.7496, dec: 45.1308, mag: 2.86, con: 'Cyg' },
  { id: 'altair', name: 'Altair', ra: 19.8464, dec: 8.8683, mag: 0.77, con: 'Aql' },
  { id: 'tarazed', name: 'Tarazed', ra: 19.7710, dec: 10.6133, mag: 2.72, con: 'Aql' },
  { id: 'alshain', name: 'Alshain', ra: 19.9219, dec: 6.4068, mag: 3.71, con: 'Aql' },

  // Scorpione (Sco) & Sagittario (Sgr)
  { id: 'antares', name: 'Antares', ra: 16.4901, dec: -26.4320, mag: 1.06, con: 'Sco' },
  { id: 'dschubba', name: 'Dschubba', ra: 16.0056, dec: -22.6217, mag: 2.29, con: 'Sco' },
  { id: 'acrab', name: 'Acrab', ra: 16.0906, dec: -19.8054, mag: 2.56, con: 'Sco' },
  { id: 'shaula', name: 'Shaula', ra: 17.5601, dec: -37.1038, mag: 1.62, con: 'Sco' },
  { id: 'sargas', name: 'Sargas', ra: 17.6220, dec: -42.9978, mag: 1.86, con: 'Sco' },
  { id: 'tau_sco', name: 'τ Sco', ra: 16.5981, dec: -28.2160, mag: 2.82, con: 'Sco' },
  { id: 'epsilon_sco', name: 'Larawag', ra: 16.8361, dec: -34.2932, mag: 2.29, con: 'Sco' },
  { id: 'kaus_australis', name: 'Kaus Australis', ra: 18.4029, dec: -34.3846, mag: 1.85, con: 'Sgr' },
  { id: 'nunki', name: 'Nunki', ra: 18.9211, dec: -26.2967, mag: 2.05, con: 'Sgr' },
  { id: 'kaus_media', name: 'Kaus Media', ra: 18.3499, dec: -29.8281, mag: 2.72, con: 'Sgr' },
  { id: 'kaus_borealis', name: 'Kaus Borealis', ra: 18.4661, dec: -25.4217, mag: 2.82, con: 'Sgr' },

  // Pegaso (Peg), Andromeda (And), Perseo (Per), Pesce Australe (PsA)
  { id: 'markab', name: 'Markab', ra: 23.0793, dec: 15.2053, mag: 2.49, con: 'Peg' },
  { id: 'scheat', name: 'Scheat', ra: 23.0629, dec: 28.0828, mag: 2.44, con: 'Peg' },
  { id: 'algenib', name: 'Algenib', ra: 0.2206, dec: 15.1836, mag: 2.83, con: 'Peg' },
  { id: 'enif', name: 'Enif', ra: 21.7364, dec: 9.8750, mag: 2.38, con: 'Peg' },
  { id: 'alpheratz', name: 'Alpheratz', ra: 0.1398, dec: 29.0904, mag: 2.07, con: 'And' },
  { id: 'mirach', name: 'Mirach', ra: 1.1622, dec: 35.6206, mag: 2.07, con: 'And' },
  { id: 'almach', name: 'Almach', ra: 2.0650, dec: 42.3297, mag: 2.10, con: 'And' },
  { id: 'mirfak', name: 'Mirfak', ra: 3.4054, dec: 49.8612, mag: 1.80, con: 'Per' },
  { id: 'algol', name: 'Algol', ra: 3.1361, dec: 40.9556, mag: 2.12, con: 'Per' },
  { id: 'fomalhaut', name: 'Fomalhaut', ra: 22.9608, dec: -29.6222, mag: 1.17, con: 'PsA' },
  { id: 'hamal', name: 'Hamal', ra: 2.1196, dec: 23.4624, mag: 2.00, con: 'Ari' },
  { id: 'sheratan', name: 'Sheratan', ra: 1.9107, dec: 20.8080, mag: 2.64, con: 'Ari' }
];

// Segmenti delle costellazioni (coppie di ID in SKY_BACKGROUND_STARS)
const CONSTELLATION_LINES = [
  // Orsa Minore
  ['polaris', 'yildun'], ['yildun', 'epsilon_umi'], ['epsilon_umi', 'zeta_umi'],
  ['zeta_umi', 'kochab'], ['kochab', 'pherkad'], ['pherkad', 'eta_umi'], ['eta_umi', 'zeta_umi'],
  // Orsa Maggiore (Gran Carro)
  ['dubhe', 'merak'], ['merak', 'phecda'], ['phecda', 'megrez'], ['megrez', 'dubhe'],
  ['megrez', 'alioth'], ['alioth', 'mizar'], ['mizar', 'alkaid'],
  // Puntatore verso la Stella Polare (trattaggio speciale gestito o linea guida)
  ['merak', 'dubhe'],
  // Cassiopea
  ['caph', 'schedar'], ['schedar', 'gamma_cas'], ['gamma_cas', 'ruchbah'], ['ruchbah', 'segin'],
  // Orione
  ['betelgeuse', 'bellatrix'], ['betelgeuse', 'alnitak'], ['bellatrix', 'mintaka'],
  ['mintaka', 'alnilam'], ['alnilam', 'alnitak'], ['alnitak', 'saiph'], ['mintaka', 'rigel'], ['saiph', 'rigel'],
  ['betelgeuse', 'meissa'], ['bellatrix', 'meissa'],
  // Toro
  ['aldebaran', 'theta2_tau'], ['theta2_tau', 'gamma_tau'], ['aldebaran', 'zeta_tau'], ['theta2_tau', 'elnath'],
  // Auriga
  ['capella', 'menkalinan'], ['menkalinan', 'theta_aur'], ['theta_aur', 'hassaleh'], ['hassaleh', 'almaaz'], ['almaaz', 'capella'],
  // Gemelli
  ['castor', 'pollux'], ['castor', 'mebsuta'], ['mebsuta', 'tejat'], ['pollux', 'wasat'], ['wasat', 'alhena'],
  // Cane Maggiore & Minore
  ['sirius', 'mirzam'], ['sirius', 'wezen'], ['wezen', 'adhara'], ['wezen', 'aludra'], ['procyon', 'gomeisa'],
  // Leone
  ['regulus', 'eta_leo'], ['eta_leo', 'algieba'], ['algieba', 'adhafera'], ['algieba', 'zosma'],
  ['zosma', 'denebola'], ['denebola', 'chertan'], ['chertan', 'regulus'],
  // Bootes & Vergine
  ['arcturus', 'izar'], ['izar', 'seginus'], ['seginus', 'nekkar'], ['arcturus', 'muphrid'],
  ['spica', 'porrima'], ['porrima', 'vindemiatrix'],
  // Lira
  ['vega', 'epsilon_lyr'], ['vega', 'zeta_lyr'], ['zeta_lyr', 'sheliak'], ['sheliak', 'sulafat'], ['sulafat', 'zeta_lyr'],
  // Cigno
  ['deneb', 'sadr'], ['sadr', 'albireo'], ['delta_cyg', 'sadr'], ['sadr', 'gienah_cyg'],
  // Aquila
  ['tarazed', 'altair'], ['altair', 'alshain'],
  // Scorpione & Sagittario
  ['acrab', 'dschubba'], ['dschubba', 'antares'], ['antares', 'tau_sco'], ['tau_sco', 'epsilon_sco'],
  ['epsilon_sco', 'sargas'], ['sargas', 'shaula'],
  ['kaus_borealis', 'kaus_media'], ['kaus_media', 'kaus_australis'], ['kaus_media', 'nunki'],
  // Pegaso & Andromeda
  ['alpheratz', 'scheat'], ['scheat', 'markab'], ['markab', 'algenib'], ['algenib', 'alpheratz'],
  ['alpheratz', 'mirach'], ['mirach', 'almach'], ['mirfak', 'algol']
];

class CalibrationSkyMapRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;

    // Stato Newtonian Mode (inversione speculare H + V = 180°)
    this.newtonianMode = localStorage.getItem('starway_newtonian_mode') === 'true';

    // Campo visivo (FOV) in gradi di raggio dal centro (default: 15° raggio = 30° diametro)
    this.fovRadiusDeg = parseFloat(localStorage.getItem('starway_calib_fov')) || 15.0;

    // Cache stelle sintetiche di campo per effetto oculare realistico
    this.fieldStarCache = new Map();

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  setNewtonianMode(enabled) {
    this.newtonianMode = !!enabled;
    localStorage.setItem('starway_newtonian_mode', this.newtonianMode.toString());
  }

  setFovRadius(deg) {
    this.fovRadiusDeg = Math.max(2.0, Math.min(35.0, deg));
    localStorage.setItem('starway_calib_fov', this.fovRadiusDeg.toString());
  }

  resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(rect.width || 280, rect.height || 280);
    if (size <= 0) return;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.displaySize = size;
  }

  /**
   * Genera stelle di campo deboli deterministiche (mag 4.5 - 7.5) attorno a una coordinata (RA, Dec)
   * per arricchire la vista ad alto ingrandimento nell'oculare
   */
  getSyntheticFieldStars(targetId, centerRa, centerDec) {
    if (this.fieldStarCache.has(targetId)) {
      return this.fieldStarCache.get(targetId);
    }

    // PRNG deterministico basato sull'ID dell'astro
    let seed = 0;
    for (let i = 0; i < targetId.length; i++) {
      seed = ((seed << 5) - seed + targetId.charCodeAt(i)) | 0;
    }
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return Math.abs(seed / 4294967296);
    };

    const stars = [];
    const cosDec = Math.max(0.08, Math.cos(centerDec * Math.PI / 180));

    for (let i = 0; i < 65; i++) {
      const r = Math.sqrt(rand()) * 26.0; // Fino a 26° dal centro
      const theta = rand() * Math.PI * 2;
      const dDec = r * Math.cos(theta);
      const dRaDeg = (r * Math.sin(theta)) / cosDec;
      const ra = (centerRa + dRaDeg / 15 + 24) % 24;
      const dec = Math.max(-89.9, Math.min(89.9, centerDec + dDec));
      const mag = 4.2 + rand() * 3.0;
      stars.push({ ra, dec, mag });
    }

    this.fieldStarCache.set(targetId, stars);
    return stars;
  }

  /**
   * Proiezione azimutale tangente centrata sull'astro selezionato (Alt0, Az0)
   * Calcola le coordinate cartesiane (dx, dy) in gradi nel piano dell'oculare:
   * - In vista naturale: Alto (dy < 0) = Zenit (+Alt), Basso = Orizzonte (-Alt), Sinistra = -Az, Destra = +Az
   * - In Newtonian Mode: Speculare orizzontale + verticale (rotazione 180° come nel focheggiatore Newton/Dobson)
   */
  projectAltAzToTangentPlane(altDeg, azDeg, centerAltDeg, centerAzDeg) {
    const deg2rad = Math.PI / 180;
    const alt = altDeg * deg2rad;
    const alt0 = centerAltDeg * deg2rad;
    const dAz = ((azDeg - centerAzDeg + 540) % 360 - 180) * deg2rad;

    const sinAlt = Math.sin(alt);
    const cosAlt = Math.cos(alt);
    const sinAlt0 = Math.sin(alt0);
    const cosAlt0 = Math.cos(alt0);
    const cosDAz = Math.cos(dAz);
    const sinDAz = Math.sin(dAz);

    // Coseno della distanza angolare dal centro
    const cosC = sinAlt0 * sinAlt + cosAlt0 * cosAlt * cosDAz;
    if (cosC <= 0.15) return null; // Dietro l'emisfero visibile

    // Proiezione stereografica locale in gradi
    const k = (2 / (1 + cosC)) * (180 / Math.PI);

    // xEst: positivo verso destra (+Azimut / senso orario guardando l'astro)
    // yZenit: positivo verso l'alto (+Altitudine / Zenit)
    let xDeg = k * cosAlt * sinDAz;
    let yDeg = k * (cosAlt0 * sinAlt - sinAlt0 * cosAlt * cosDAz);

    // Se Newtonian Mode è attivo: applica inversione orizzontale e verticale (-x, -y)
    if (this.newtonianMode) {
      xDeg = -xDeg;
      yDeg = -yDeg;
    }

    return {
      xDeg,
      yDeg,
      angularDist: Math.acos(Math.min(1, Math.max(-1, cosC))) * (180 / Math.PI)
    };
  }

  /**
   * Renderizza la mini-mappa celeste centrata sull'astro selezionato
   * @param {Object} targetObj Astro selezionato per la calibrazione
   * @param {string} theme 'night' | 'day'
   */
  render(targetObj, theme = 'night') {
    if (!this.canvas || !this.ctx || !targetObj || !window.celestialManager) return;

    if (!this.displaySize) {
      this.resizeCanvas();
    }
    const size = this.displaySize || 280;
    const ctx = this.ctx;
    const cx = size / 2;
    const cy = size / 2;
    const radius = cx - 16;
    const scale = radius / this.fovRadiusDeg; // pixel per grado

    const now = new Date();
    const centerCoords = window.celestialManager.computeObjectCoordinates(targetObj, now);
    const centerAlt = centerCoords.altitude;
    const centerAz = centerCoords.azimuth;

    ctx.clearRect(0, 0, size, size);

    const isNight = theme === 'night';
    const colors = isNight ? {
      bgSky: '#070102',
      bgHorizonBelow: 'rgba(45, 5, 8, 0.55)',
      horizonLine: 'rgba(255, 90, 90, 0.65)',
      fovRing: '#ff2a3a',
      gridRing: 'rgba(255, 60, 75, 0.22)',
      crosshair: 'rgba(255, 60, 75, 0.40)',
      constLine: 'rgba(255, 70, 85, 0.38)',
      starMain: '#ffdede',
      starGlow: 'rgba(255, 60, 75, 0.8)',
      targetHighlight: '#00ff88',
      planetColor: '#ffaa33',
      textLabel: 'rgba(255, 190, 195, 0.88)',
      cardinalBg: 'rgba(20, 2, 4, 0.85)',
      cardinalText: '#ff858d'
    } : {
      bgSky: '#090e17',
      bgHorizonBelow: 'rgba(30, 41, 59, 0.6)',
      horizonLine: 'rgba(245, 158, 11, 0.7)',
      fovRing: '#f59e0b',
      gridRing: 'rgba(148, 163, 184, 0.22)',
      crosshair: 'rgba(245, 158, 11, 0.42)',
      constLine: 'rgba(96, 165, 250, 0.42)',
      starMain: '#ffffff',
      starGlow: 'rgba(147, 197, 253, 0.8)',
      targetHighlight: '#10b981',
      planetColor: '#fbbf24',
      textLabel: 'rgba(241, 245, 249, 0.92)',
      cardinalBg: 'rgba(15, 23, 42, 0.88)',
      cardinalText: '#fbbf24'
    };

    // 1. Maschera circolare del campo visivo (Oculare / Cercatore)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.bgSky;
    ctx.fill();
    ctx.clip();

    // 2. Disegna la linea dell'orizzonte locale (Alt = 0°) se visibile nel campo
    this.drawHorizonOverlay(ctx, cx, cy, scale, centerAlt, centerAz, colors);

    // 3. Anelli concentrici di scala angolare e reticolo dell'oculare
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = colors.gridRing;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reticolo a croce sottile con gap centrale
    const gap = 14;
    ctx.beginPath();
    ctx.strokeStyle = colors.crosshair;
    ctx.lineWidth = 1;
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx - gap, cy);
    ctx.moveTo(cx + gap, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy - gap);
    ctx.moveTo(cx, cy + gap);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // 4. Calcola coordinate proiettate di tutte le stelle di sfondo
    const projectedStars = new Map();
    for (const star of SKY_BACKGROUND_STARS) {
      const hor = window.celestialManager.computeObjectCoordinates(star, now);
      const proj = this.projectAltAzToTangentPlane(hor.altitude, hor.azimuth, centerAlt, centerAz);
      if (proj && proj.angularDist <= this.fovRadiusDeg * 1.35) {
        projectedStars.set(star.id, {
          ...star,
          px: cx + proj.xDeg * scale,
          py: cy - proj.yDeg * scale,
          angularDist: proj.angularDist
        });
      }
    }

    // 5. Disegna le linee delle costellazioni
    ctx.strokeStyle = colors.constLine;
    ctx.lineWidth = 1.3;
    for (const [idA, idB] of CONSTELLATION_LINES) {
      const sA = projectedStars.get(idA);
      const sB = projectedStars.get(idB);
      if (sA && sB) {
        ctx.beginPath();
        ctx.moveTo(sA.px, sA.py);
        ctx.lineTo(sB.px, sB.py);
        ctx.stroke();
      }
    }

    // 6. Disegna stelle sintetiche di campo (per dare punti di riferimento quando si usa zoom stretto o Newtonian flip)
    const synthStars = this.getSyntheticFieldStars(
      targetObj.id,
      centerCoords.ra || targetObj.ra || 0,
      centerCoords.dec || targetObj.dec || 0
    );
    for (const s of synthStars) {
      const hor = window.celestialManager.computeObjectCoordinates(s, now);
      const proj = this.projectAltAzToTangentPlane(hor.altitude, hor.azimuth, centerAlt, centerAz);
      if (proj && proj.angularDist <= this.fovRadiusDeg) {
        const px = cx + proj.xDeg * scale;
        const py = cy - proj.yDeg * scale;
        const r = Math.max(0.8, 2.2 - (s.mag - 4.0) * 0.45);
        ctx.fillStyle = isNight ? 'rgba(255, 150, 155, 0.48)' : 'rgba(203, 213, 225, 0.55)';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Disegna le stelle reali del database e le etichette
    for (const star of projectedStars.values()) {
      const isCenterTarget = (star.id === targetObj.id);
      if (isCenterTarget) continue; // La stella target viene disegnata con effetto fading al passo 9

      const starRadius = Math.max(1.6, 5.2 - star.mag * 0.85);

      ctx.save();
      ctx.beginPath();
      ctx.arc(star.px, star.py, starRadius, 0, Math.PI * 2);
      ctx.fillStyle = colors.starMain;
      if (star.mag < 2.2) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = colors.starGlow;
      }
      ctx.fill();
      ctx.restore();

      // Etichetta per le stelle principali vicine (non sovrapposte al centro)
      if (star.mag <= 3.1 && star.angularDist <= this.fovRadiusDeg * 0.92) {
        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = colors.textLabel;
        ctx.textAlign = 'left';
        ctx.fillText(star.name, star.px + starRadius + 4, star.py + 3);
      }
    }

    // 8. Disegna eventuali pianeti / Luna / Deep Sky dal catalogo StarWay presenti nel campo
    for (const item of window.celestialManager.catalog) {
      if (item.id === targetObj.id) continue;
      if (projectedStars.has(item.id)) continue;

      const hor = window.celestialManager.getCoordinates(item.id) ||
                  window.celestialManager.computeObjectCoordinates(item, now);
      const proj = this.projectAltAzToTangentPlane(hor.altitude, hor.azimuth, centerAlt, centerAz);
      if (proj && proj.angularDist <= this.fovRadiusDeg * 0.95) {
        const px = cx + proj.xDeg * scale;
        const py = cy - proj.yDeg * scale;

        if (item.isSolarSystem) {
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = colors.planetColor;
          ctx.fill();
          ctx.font = '700 10px -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillStyle = colors.planetColor;
          ctx.fillText(item.name, px + 7, py + 3);
        } else {
          // Oggetto Deep Sky (piccolo rombo tratteggiato)
          ctx.strokeStyle = colors.targetHighlight;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(px - 3.5, py - 3.5, 7, 7);
          if (this.fovRadiusDeg <= 20) {
            ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillStyle = colors.textLabel;
            ctx.fillText(item.id.toUpperCase(), px + 6, py + 3);
          }
        }
      }
    }

    // 9. Disegna l'astro selezionato al centro esatto del reticolo (cx, cy)
    this.drawCenterTargetMarker(ctx, cx, cy, targetObj, colors);

    // 10. Indicatori direzionali Nord Celeste (Polare) e Zenit sul bordo del campo
    this.drawOrientationVectors(ctx, cx, cy, radius, centerAlt, centerAz, now, colors);

    ctx.restore(); // Fine clip circolare

    // 11. Bordo esterno dell'oculare e indicatori assi (in Visione Notturna resta sempre rosso)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = isNight ? colors.fovRing : (this.newtonianMode ? colors.targetHighlight : colors.fovRing);
    ctx.stroke();

    this.drawAxisBadges(ctx, cx, cy, radius, colors);
  }

  /**
   * Disegna l'orizzonte locale se interseca il campo visivo
   */
  drawHorizonOverlay(ctx, cx, cy, scale, centerAlt, centerAz, colors) {
    if (Math.abs(centerAlt) > this.fovRadiusDeg * 1.4) return;

    // L'orizzonte è a Alt = 0°. Nel piano tangente è a deltaAlt = -centerAlt
    let horizonYOffsetDeg = -centerAlt;
    if (this.newtonianMode) {
      horizonYOffsetDeg = -horizonYOffsetDeg;
    }
    const horizonPy = cy - horizonYOffsetDeg * scale;

    ctx.save();
    ctx.beginPath();
    if (!this.newtonianMode) {
      // Sotto l'orizzonte è y > horizonPy
      ctx.rect(0, horizonPy, cx * 2, cx * 2);
    } else {
      // Capovolto (Newtonian): sotto l'orizzonte appare nella parte superiore dell'oculare!
      ctx.rect(0, 0, cx * 2, horizonPy);
    }
    ctx.fillStyle = colors.bgHorizonBelow;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, horizonPy);
    ctx.lineTo(cx * 2, horizonPy);
    ctx.strokeStyle = colors.horizonLine;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Disegna l'astro target selezionato al centro dell'oculare con lampeggiamento dolce (effetto fading)
   */
  drawCenterTargetMarker(ctx, cx, cy, targetObj, colors) {
    // Onda sinusoidale fluida per effetto fading (alpha tra 0.22 e 1.0)
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.0045);
    const fadeAlpha = 0.22 + 0.78 * pulse;

    ctx.save();

    // Astro al centro con effetto fading (senza cerchietto attorno)
    const baseRadius = targetObj.isSolarSystem ? 5.5 : 4.5;
    const r = baseRadius + 1.2 * pulse;

    ctx.globalAlpha = fadeAlpha;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = targetObj.isSolarSystem ? colors.planetColor : '#ffffff';
    ctx.shadowBlur = 6 + 12 * pulse;
    ctx.shadowColor = colors.targetHighlight;
    ctx.fill();

    // Nome dell'astro selezionato (sempre leggibile)
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
    ctx.font = '700 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = colors.targetHighlight;
    ctx.textAlign = 'center';
    ctx.fillText(targetObj.name.split(' (')[0], cx, cy - 14);

    ctx.restore();
  }

  /**
   * Mostra una piccola freccia "N" sul bordo che indica la direzione del Polo Nord Celeste
   * così l'utente riconosce immediatamente l'orientamento delle costellazioni
   */
  drawOrientationVectors(ctx, cx, cy, radius, centerAlt, centerAz, now, colors) {
    if (!window.celestialManager || !window.celestialManager.observer) return;

    // Posizione del Polo Nord Celeste (Dec = +90°)
    const poleHor = window.celestialManager.computeObjectCoordinates({ ra: 0, dec: 89.99 }, now);
    const proj = this.projectAltAzToTangentPlane(poleHor.altitude, poleHor.azimuth, centerAlt, centerAz);
    if (!proj || (Math.abs(proj.xDeg) < 0.2 && Math.abs(proj.yDeg) < 0.2)) return;

    const angle = Math.atan2(-proj.yDeg, proj.xDeg);
    const badgeR = radius - 14;
    const bx = cx + Math.cos(angle) * badgeR;
    const by = cy + Math.sin(angle) * badgeR;

    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, 9, 0, Math.PI * 2);
    ctx.fillStyle = colors.cardinalBg;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = colors.targetHighlight;
    ctx.stroke();

    ctx.font = '800 9px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = colors.targetHighlight;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', bx, by);
    ctx.restore();
  }

  /**
   * Disegna le etichette cardinali del campo visivo (Zenit/Orizzonte o Invertite in Newtonian Mode)
   */
  drawAxisBadges(ctx, cx, cy, radius, colors) {
    const topLabel = this.newtonianMode ? '▼ ORIZZONTE (INV.)' : '▲ ZENIT (ALTO)';
    const bottomLabel = this.newtonianMode ? '▲ ZENIT (INV.)' : '▼ ORIZZONTE';
    const leftLabel = this.newtonianMode ? 'DX' : 'SX';
    const rightLabel = this.newtonianMode ? 'SX' : 'DX';

    ctx.save();
    ctx.font = '700 9px -apple-system, BlinkMacSystemFont, monospace';
    ctx.fillStyle = colors.cardinalText;
    ctx.textAlign = 'center';

    ctx.fillText(topLabel, cx, cy - radius + 12);
    ctx.fillText(bottomLabel, cx, cy + radius - 6);

    ctx.textAlign = 'left';
    ctx.fillText(leftLabel, cx - radius + 6, cy - 4);

    ctx.textAlign = 'right';
    ctx.fillText(rightLabel, cx + radius - 6, cy - 4);

    // Indicazione FOV in basso a destra fuori dal cerchio
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, monospace';
    ctx.fillStyle = colors.textLabel;
    ctx.textAlign = 'right';
    ctx.fillText(`FOV: ${(this.fovRadiusDeg * 2).toFixed(0)}°`, cx * 2 - 4, cx * 2 - 4);

    ctx.restore();
  }
}

window.CalibrationSkyMapRenderer = CalibrationSkyMapRenderer;
