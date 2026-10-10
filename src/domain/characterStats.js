/**
 * Character Stats Engine - Pure Domain Model
 * Zero React/UI or network dependencies.
 * Handles base stat calculation, stat point allocations, caps and badge multipliers.
 */

export const STAT_POINTS_PER_LEVEL = 6;
export const MAX_STAT_CAP = 90;
export const BASE_PHYSICAL_DAMAGE = 15;

export function calculateBaseAndAllocatedStats(player) {
  const baseHp = 1000;
  const baseMana = 500;
  const baseAtk = 50;
  const baseDef = 30;

  const allocated = player?.allocatedStats || { hp: 0, str: 0, agi: 0, int: 0 };

  const bonusHp = (allocated.hp || 0) * 40;
  const bonusAtk = (allocated.str || 0) * 3;
  const bonusDef = (allocated.agi || 0) * 2;
  const bonusCrit = (allocated.agi || 0) * 0.2;
  const bonusMana = (allocated.int || 0) * 25;
  const bonusMagicAtk = (allocated.int || 0) * 3;

  return {
    maxHp: baseHp + bonusHp,
    maxMana: baseMana + bonusMana,
    attack: baseAtk + bonusAtk,
    defense: baseDef + bonusDef,
    critRate: 5 + bonusCrit,
    magicAttack: bonusMagicAtk,
  };
}

/**
 * Oyuncu nesnesinden tüm hesaplanmış nihai RPG niteliklerini türetir.
 * Dağıtılan statlar, rozet bonusları ve temel değerleri harmanlar.
 */
export function calculatePlayerStats(player = {}, badgeBonus = {}) {
  const currentLevel = player.level || 1;
  const allocated = player.allocatedStats || {
    hp: 0,
    str: 0,
    agi: 0,
    int: 0,
  };

  // 1 HP = +40 Can
  const bonusHp = (allocated.hp || 0) * 40 + (badgeBonus.hp || 0);
  const maxHp = 500 + bonusHp;
  const currentHp = Math.min(player.hp ?? maxHp, maxHp);

  // 1 INT = +25 Mana, +3 Büyü Hasarı
  const bonusMana = (allocated.int || 0) * 25 + (badgeBonus.mana || 0);
  const maxMana = 500 + bonusMana;
  const currentMana = Math.min(player.mana ?? maxMana, maxMana);

  // 1 STR = +3 Direkt Fiziksel Hasar
  const strength = (allocated.str || 0) + (badgeBonus.strength || 0);
  const physicalDamage = BASE_PHYSICAL_DAMAGE + strength * 3;

  // 1 AGI = +2 Savunma, +%0.2 Kaçınma, +%0.2 Kritik
  const agility = (allocated.agi || 0) + (badgeBonus.agility || 0);
  const intelligence = (allocated.int || 0) + (badgeBonus.intelligence || 0);
  const magicDamage = intelligence * 3;

  const defense = agility * 2 + (badgeBonus.defense || 0);
  const dodgeChance = Number(((agility * 0.2) + (badgeBonus.dodgeChance || 0)).toFixed(1));
  const criticalChance = Number(((agility * 0.2) + (badgeBonus.criticalChance || 0)).toFixed(1));

  // Toplam hak edilen stat puanı ve kalan puan hesabı
  const totalEarned = Math.max(0, (currentLevel - 1) * STAT_POINTS_PER_LEVEL);
  const totalSpent = (allocated.hp || 0) + (allocated.str || 0) + (allocated.agi || 0) + (allocated.int || 0);
  const statPoints = player.statPoints !== undefined ? player.statPoints : Math.max(0, totalEarned - totalSpent);

  return {
    hp: currentHp,
    maxHp,
    mana: currentMana,
    maxMana,
    strength,
    agility,
    intelligence,
    physicalDamage,
    magicDamage,
    defense,
    statPoints,
    allocatedStats: allocated,
    dodgeChance,
    criticalChance,
    armorPenetration: Number((badgeBonus.armorPenetration || 0).toFixed(1)),
    stunChance: Number((badgeBonus.stunChance || 0).toFixed(1)),
    poisonChance: Number((badgeBonus.poisonChance || 0).toFixed(1)),
    reflectChance: Number((badgeBonus.reflectChance || 0).toFixed(1)),
    vsWarrior: Number((badgeBonus.vsWarrior || 0).toFixed(1)),
    vsNinja: Number((badgeBonus.vsNinja || 0).toFixed(1)),
    vsMage: Number((badgeBonus.vsMage || 0).toFixed(1)),
    fireBonus: Number((badgeBonus.fireBonus || 0).toFixed(1)),
    iceBonus: Number((badgeBonus.iceBonus || 0).toFixed(1)),
    windBonus: Number((badgeBonus.windBonus || 0).toFixed(1)),
    lightningBonus: Number((badgeBonus.lightningBonus || 0).toFixed(1)),
  };
}
