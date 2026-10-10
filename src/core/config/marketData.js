// src/core/config/marketData.js
// Pazar Sistemi: 20 Slotluk Tezgahlar, Piyasa Satış Geçmişi, Referans Fiyatlar ve Depolama Yardımcıları
import { storageManager, StorageKeys } from '@/core/storage/storageManager';

export const MARKET_STALLS_STORAGE_KEY = StorageKeys.MARKET_STALLS;
export const MARKET_HISTORY_STORAGE_KEY = StorageKeys.MARKET_HISTORY;
export const PLAYER_STALL_STORAGE_KEY = StorageKeys.PLAYER_STALL;

export const MAX_STALL_SLOTS = 20; // Tam 20 slot
export const MARKET_TAX_PERCENT = 3; // %3 Pazar Vergisi

// Piyasa Satış Geçmişi (Gerçek oyuncuların satışları tutulur)
export const DEFAULT_MARKET_HISTORY = [];

// Diğer Oyuncuların Canlı Pazar Tezgahları (Pazar Alanı)
export const DEFAULT_MARKET_STALLS = [];

// Depolama Yardımcıları
export function loadMarketStalls() {
  try {
    const parsed = storageManager.getItem(MARKET_STALLS_STORAGE_KEY, null);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MARKET_STALLS;

    // Eski demo tezgahları temizle
    const isOldDemo = parsed.some((s) => s.id === 'stall_elrond' || s.sellerName === 'Elrond_99');
    if (isOldDemo) {
      storageManager.removeItem(MARKET_STALLS_STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (e) {
    console.error('Market stalls load error:', e);
    return DEFAULT_MARKET_STALLS;
  }
}

export function saveMarketStalls(stalls) {
  try {
    storageManager.setItem(MARKET_STALLS_STORAGE_KEY, stalls);
  } catch (e) {
    console.error('Market stalls save error:', e);
  }
}

export function loadMarketHistory() {
  try {
    const parsed = storageManager.getItem(MARKET_HISTORY_STORAGE_KEY, null);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MARKET_HISTORY;

    // Eski demo satış kayıtlarını temizle
    const isOldDemo = parsed.some((h) => h.id === 'hist_1' || h.seller === 'Elrond_99');
    if (isOldDemo) {
      storageManager.removeItem(MARKET_HISTORY_STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (e) {
    console.error('Market history load error:', e);
    return DEFAULT_MARKET_HISTORY;
  }
}

export function saveMarketHistory(history) {
  try {
    storageManager.setItem(MARKET_HISTORY_STORAGE_KEY, history);
  } catch (e) {
    console.error('Market history save error:', e);
  }
}

// Oyuncunun Kendi Pazar Tezgahını Yükleme / Kaydetme
export function loadPlayerStall(playerName) {
  try {
    const parsed = storageManager.getItem(PLAYER_STALL_STORAGE_KEY, null);
    if (parsed) return parsed;
  } catch (e) {
    console.error('Player stall load error:', e);
  }

  // Varsayılan boş tezgah (20 Slot)
  return {
    id: 'player_stall_' + Date.now(),
    sellerName: playerName || 'Kadim Tüccar',
    stallTitle: `${playerName || 'Kahraman'}'ın Pazar Yeri`,
    motto: 'Pazarlık payı vardır, tekliflere açığım!',
    isOpen: true,
    createdAt: new Date().toISOString(),
    items: [], // max 20 items
  };
}

export function savePlayerStall(stall) {
  try {
    storageManager.setItem(PLAYER_STALL_STORAGE_KEY, stall);
  } catch (e) {
    console.error('Player stall save error:', e);
  }
}

// Bir eşya için piyasadaki en son satış fiyatını (benchmark) bulma
export function getLatestBenchmarkPrice(itemName, historyList = null) {
  if (!itemName) return null;
  const history = historyList || loadMarketHistory();
  const cleanTargetName = itemName.replace(/\s*\(\+\d+\)\s*/g, '').trim().toLowerCase();

  const matched = history.find((record) => {
    const cleanRecordName = record.itemName.replace(/\s*\(\+\d+\)\s*/g, '').trim().toLowerCase();
    return cleanRecordName === cleanTargetName || record.itemName.toLowerCase() === itemName.toLowerCase();
  });

  return matched || null;
}
