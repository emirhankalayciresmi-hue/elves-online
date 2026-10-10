/**
 * Inventory Engine - Pure Domain Model
 * Validates equipment compatibility, stat delta comparisons, and inventory slot indexing.
 * Zero UI / React / network dependencies.
 */

export function compareItemStats(activeItem, comparedItem) {
  if (!activeItem) return null;

  const getStats = (item) => ({
    atk: item?.stats?.attack || item?.attack || 0,
    def: item?.stats?.defense || item?.defense || 0,
    hp: item?.stats?.hp || item?.hp || 0,
    mana: item?.stats?.mana || item?.mana || 0,
  });

  const activeStats = getStats(activeItem);
  const compStats = getStats(comparedItem);

  return {
    diffAtk: activeStats.atk - compStats.atk,
    diffDef: activeStats.def - compStats.def,
    diffHp: activeStats.hp - compStats.hp,
    diffMana: activeStats.mana - compStats.mana,
  };
}

export function isItemUsableByClass(item, characterClassId) {
  if (!item || !item.classRequired) return true;
  if (item.classRequired === 'all') return true;
  return item.classRequired.toLowerCase() === (characterClassId || '').toLowerCase();
}

export function validateInventoryCapacity(inventory = [], maxSlots = 48) {
  return (inventory.length) < maxSlots;
}

export function findEmptySlot(inventory = [], maxSlots = 48) {
  const occupiedSlots = new Set(inventory.map((item) => item.slotIndex).filter((s) => s !== undefined));
  for (let i = 0; i < maxSlots; i++) {
    if (!occupiedSlots.has(i)) return i;
  }
  return -1;
}

export function calculateSellGold(item, customSellPrice = null) {
  if (customSellPrice !== null && customSellPrice !== undefined && customSellPrice > 0) {
    return Math.floor(Number(customSellPrice));
  }
  return item?.sellPrice || Math.floor((item?.price || 100) * 0.4);
}

export default {
  compareItemStats,
  isItemUsableByClass,
  validateInventoryCapacity,
  findEmptySlot,
  calculateSellGold,
};
