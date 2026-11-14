/**
 * StarWay - Gestione Persistenza Locale (LocalStorage)
 * Centralizza lettura e scrittura delle preferenze utente in modo sicuro.
 */

class StorageManager {
  constructor(prefix = 'starway_') {
    this.prefix = prefix;
  }

  /**
   * Salva una stringa o un valore serializzabile in localStorage
   * @param {string} key Chiave senza prefisso (o con prefisso già incluso)
   * @param {*} value Valore da salvare
   */
  set(key, value) {
    const fullKey = key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
    } catch (err) {
      console.warn(`Impossibile salvare in localStorage (${fullKey}):`, err.message);
    }
  }

  /**
   * Legge un valore stringa da localStorage
   * @param {string} key Chiave
   * @param {string|null} fallback Valore predefinito se assente
   * @returns {string|null}
   */
  get(key, fallback = null) {
    const fullKey = key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
    try {
      const val = localStorage.getItem(fullKey);
      return val !== null ? val : fallback;
    } catch (err) {
      return fallback;
    }
  }

  /**
   * Legge e deserializza un oggetto JSON da localStorage
   * @param {string} key Chiave
   * @param {*} fallback Valore predefinito
   * @returns {*}
   */
  getJSON(key, fallback = null) {
    const raw = this.get(key, null);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  /**
   * Rimuove una chiave da localStorage
   * @param {string} key Chiave
   */
  remove(key) {
    const fullKey = key.startsWith(this.prefix) ? key : `${this.prefix}${key}`;
    try {
      localStorage.removeItem(fullKey);
    } catch (err) {
      // Ignora errori in modalità ristretta
    }
  }
}

window.storageManager = new StorageManager();
