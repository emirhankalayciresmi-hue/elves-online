/**
 * Core Storage Manager - Elves Online
 * Type-safe and resilient localStorage persistence with JSON serialization & error suppression.
 */

export const StorageKeys = {
  RELEASE_VERSION: 'elves_rpg_release_version',
  CHARACTER: 'elves_rpg_character_data',
  CHAT: 'elves_rpg_chat_history',
  NOTIFICATIONS: 'elves_rpg_notifications_list',
  LAYOUT_MODE: 'elves_rpg_layout_mode',
  MARKET_STALLS: 'elves_rpg_market_stalls',
  MARKET_HISTORY: 'elves_rpg_market_history',
  PLAYER_STALL: 'elves_rpg_player_stall',
  GUILDS: 'elves_kadim_guilds',
  PARTIES: 'elves_rpg_parties_data',
  GROUP_EXPEDITION: 'elves_rpg_active_group_expedition',
};

export const storageManager = {
  getItem(key, defaultValue = null) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      // In case raw value is a plain string that is not JSON
      try {
        const raw = localStorage.getItem(key);
        if (typeof raw === 'string') return raw;
      } catch {}
      console.warn(`[storageManager.getItem] Failed reading key "${key}":`, err);
      return defaultValue;
    }
  },

  setItem(key, value) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.error(`[storageManager.setItem] Failed writing key "${key}":`, err);
      return false;
    }
  },

  removeItem(key) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`[storageManager.removeItem] Failed removing key "${key}":`, err);
      return false;
    }
  },

  clear() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('[storageManager.clear] Failed:', err);
      return false;
    }
  },

  // Aliases for compatibility
  get(key, defaultValue = null) {
    return this.getItem(key, defaultValue);
  },

  set(key, value) {
    return this.setItem(key, value);
  },

  remove(key) {
    return this.removeItem(key);
  },

  clearAll() {
    return this.clear();
  },
};

export const getItem = storageManager.getItem.bind(storageManager);
export const setItem = storageManager.setItem.bind(storageManager);
export const removeItem = storageManager.removeItem.bind(storageManager);
export const clear = storageManager.clear.bind(storageManager);
export const get = storageManager.get.bind(storageManager);
export const set = storageManager.set.bind(storageManager);
export const remove = storageManager.remove.bind(storageManager);
export const clearAll = storageManager.clearAll.bind(storageManager);

export default storageManager;
