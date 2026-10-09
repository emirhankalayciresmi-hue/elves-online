// Kadim Elfler - Merkezi Oyun Motoru & Mantık Servisi (Game Engine Service)
// Tüm ödül hesaplamaları, envanter işlemleri, zindan/maden/boss sonuçları ve görev ilerlemeleri burada toplanır.

import { calculateLevelAndExp, rollDungeonReward, DUNGEON_GROUPS } from '../config/dungeonData';
import { rollDungeonEquipmentDrops } from '../config/itemsData';
import { ELVEN_MINES, MINING_DURATION_SECONDS, rollMiningRewards } from '../config/miningData';
import {
  ensurePlayerQuestState,
  applyQuestProgress,
  selectDailyQuestsForLevel,
  BADGE_DEFINITIONS,
  calculateBadgeStats,
} from '../config/questData';
import { loadPartiesFromStorage, getPartySynergyBonus } from '../config/partyData';
import {
  calculatePlayerStats,
  MAX_STAT_CAP,
  STAT_POINTS_PER_LEVEL,
} from '../config/gameData';

/**
 * Zindan Tamamlama Mantığı (Otomatik veya Manuel Hak Talebi)
 */
export function executeDungeonCompletion(player, dungeon, forceAuto = true) {
  if (!player || !dungeon) return player;

  // Aktif seferde toplananlar anlık tick sırasında verildi; oturum verilerini rapora kaydet
  const expReward = dungeon.sessionExp || 0;
  const goldReward = dungeon.sessionGold || 0;
  const droppedEquipment = dungeon.sessionDrops || [];

  let updated = {
    ...player,
    activeDungeon: null,
    lastDungeonReport: {
      dungeonName: dungeon.name,
      completedAt: new Date().toISOString(),
      expReward,
      goldReward,
      leveledUp: false,
      newLevel: player.level || 1,
      droppedEquipment,
      totalKills: dungeon.kills || 0,
      autoCollected: forceAuto,
    },
  };

  // Görev İlerlemeleri
  updated = applyQuestProgress(updated, 'dungeon_clear', 1);
  updated = applyQuestProgress(updated, 'monster_kill', dungeon.kills || 15);
  updated = applyQuestProgress(updated, 'gold_earned', goldReward);

  return updated;
}

/**
 * Zindan Aktif Savaş / Kasılma Döngüsü (Oto-Av / Sürekli Akın)
 * Her 3.5 saniyede bir canavar kesilir; anlık EXP, Altın, Eşya düşer.
 * Canavar vurdukça can azalır, oto-iksir eşiğinde kırmızı iksir tüketilir.
 * İksir biter ve can 0 olursa karakter ölür, zindan kapanır (5 dk ceza).
 */
export function processDungeonCombatTick(player) {
  if (!player || !player.activeDungeon) return { player, changed: false };

  const dungeon = player.activeDungeon;
  const now = Date.now();
  const durationMs = (dungeon.durationSeconds || 1800) * 1000;
  const elapsed = now - (dungeon.startTime || now);

  // 1. 30 Dakikalık maksimum sefer süresi dolduysa zaferle tamamla
  if (elapsed >= durationMs) {
    const victoryReport = {
      type: 'victory',
      dungeonName: dungeon.name,
      completedAt: new Date().toISOString(),
      expReward: dungeon.sessionExp || 0,
      goldReward: dungeon.sessionGold || 0,
      totalKills: dungeon.kills || 0,
      droppedEquipment: dungeon.sessionDrops || [],
      message: '🏆 30 dakikalık zindan seferi başarıyla tamamlandı!',
      leveledUp: false,
    };
    let completedPlayer = {
      ...player,
      activeDungeon: null,
      lastDungeonReport: victoryReport,
    };
    completedPlayer = applyQuestProgress(completedPlayer, 'dungeon_clear', 1);
    return {
      player: completedPlayer,
      changed: true,
      event: 'completed',
      message: `🏆 [${player.name}] "${dungeon.name}" zindanını başarıyla tamamladı!`,
    };
  }

  // 2. Canavar seçimi
  const monsters = dungeon.monsters || [];
  if (monsters.length === 0) return { player, changed: false };
  const currentSlotIndex = dungeon.currentMonsterIndex || 0;
  const monster = monsters[currentSlotIndex] || monsters[0];
  const isBoss = Boolean(monster.isBoss || currentSlotIndex === 4);

  // 3. Karakter Hasar ve Can Hesabı (Stat Sistemi Entegrasyonu)
  const playerLevel = player.level || 1;
  const badgeBonus = calculateBadgeStats(player?.questState?.badgeProgress);
  const playerStats = calculatePlayerStats(player, badgeBonus);
  const maxHp = playerStats.maxHp;
  const equippedCount = Object.keys(player.equipped || {}).length;
  // Çeviklik Savunması (+2/AGI) + kuşam bonusu
  const playerDef = playerStats.defense + Math.round(equippedCount * 25 + playerLevel * 2);
  const rawMonsterAtk = monster.attack || 30;
  const rawDamage = Math.round(rawMonsterAtk * (1.05 + Math.random() * 0.25));

  // Çeviklik Kaçınma Şansı Kontrolü (%0.2 / AGI)
  const isDodged = Math.random() * 100 < (playerStats.dodgeChance || 0);
  const damageTaken = isDodged ? 0 : Math.max(12, Math.round(rawDamage - playerDef * 0.14));

  let currentHp = (player.hp ?? maxHp) - damageTaken;
  let hpPotions = player.hpPotions ?? 0;
  let potionUsed = false;
  const threshold = player.autoPotionThreshold || 50;
  const hpPercent = (currentHp / maxHp) * 100;

  // Otomatik İksir Tüketimi
  if (hpPercent <= threshold && hpPotions > 0) {
    hpPotions -= 1;
    currentHp = Math.min(maxHp, currentHp + 300);
    potionUsed = true;
  }

  // 4. Karakter Ölümü (Can İksiri Bitti ve Can <= 0)
  if (currentHp <= 0) {
    const defeatReport = {
      type: 'defeat',
      dungeonName: dungeon.name,
      completedAt: new Date().toISOString(),
      expReward: dungeon.sessionExp || 0,
      goldReward: dungeon.sessionGold || 0,
      totalKills: dungeon.kills || 0,
      droppedEquipment: dungeon.sessionDrops || [],
      message: '💀 Can iksiriniz bittiği için canavarlara yenik düştünüz! Zindan kapandı. Toplanan tüm ganimetler çantanızda.',
    };
    const deadPlayer = {
      ...player,
      hp: maxHp, // Şehirde tam canla doğar
      hpPotions: 0,
      activeDungeon: null,
      dungeonCooldownUntil: Date.now() + 5 * 60 * 1000, // 5 dakika bekleme süresi
      lastDungeonReport: defeatReport,
    };
    return {
      player: deadPlayer,
      changed: true,
      event: 'died',
      message: `💀 [${player.name}] '${dungeon.name}' zindanında can iksiri tükendiği için yenik düştü! Zindan kapandı. (5 dk bekleme süresi başladı)`,
    };
  }

  // 5. Canavar Kesildi: Hardcore Anlık EXP ve Altın (24 Saatte Max Seviye 30 Kalibrasyonu)
  const dungeonTier = dungeon.dungeonId || dungeon.id || 1;
  const baseExpRate = 5 + dungeonTier * 2;
  const baseExp = Math.round((isBoss ? baseExpRate * 1.8 : baseExpRate) * (0.9 + Math.random() * 0.2));

  const baseGoldRate = 3 + dungeonTier * 1.5;
  const baseGold = Math.round((isBoss ? baseGoldRate * 1.8 : baseGoldRate) * (0.85 + Math.random() * 0.3));

  let synergyMult = 1.0;
  if (player.party?.id) {
    const parties = loadPartiesFromStorage();
    const party = parties.find((p) => p.id === player.party.id);
    if (party) {
      const syn = getPartySynergyBonus(party.members?.length || 1);
      synergyMult = syn.expMultiplier || 1.0;
    }
  }

  const expGain = Math.round(baseExp * synergyMult);
  const goldGain = Math.round(baseGold * synergyMult);

  const levelRes = calculateLevelAndExp(player.level, player.exp, expGain, player.gold, goldGain);

  // 6. Eşya Düşme Şansı (Tüm canavarlar ve bosslar istisnasız sabit %3 - Taviz yok)
  const dropChance = 0.03;
  let newDroppedItem = null;
  if (Math.random() < dropChance) {
    const drops = rollDungeonEquipmentDrops(dungeon.dungeonId || dungeon.id, player.classId || 'warrior');
    if (drops.length > 0) {
      newDroppedItem = drops[0];
    }
  }

  const currentInventory = Array.isArray(player.inventory) ? player.inventory : [];
  const updatedInventory = newDroppedItem ? [...currentInventory, newDroppedItem] : currentInventory;
  const currentNewDrops = Array.isArray(player.newDungeonDrops) ? player.newDungeonDrops : [];
  const updatedNewDrops = newDroppedItem ? [...currentNewDrops, newDroppedItem.instanceId] : currentNewDrops;

  // 7. Zindan Oturum İstatistikleri & Savaş Günlüğü
  const nextMonsterIndex = (currentSlotIndex + 1) % monsters.length;
  const kills = (dungeon.kills || 0) + 1;
  const sessionExp = (dungeon.sessionExp || 0) + expGain;
  const sessionGold = (dungeon.sessionGold || 0) + goldGain;
  const sessionDrops = newDroppedItem ? [...(dungeon.sessionDrops || []), newDroppedItem] : (dungeon.sessionDrops || []);

  const newLogEntry = {
    id: `log_${Date.now()}_${kills}`,
    monsterName: monster.name,
    isBoss,
    expGain,
    goldGain,
    damageTaken,
    isDodged,
    potionUsed,
    droppedItemName: newDroppedItem?.name || null,
    timestamp: Date.now(),
  };

  const recentLogs = [...(dungeon.recentLogs || []), newLogEntry].slice(-15);

  // Seviye atlandığında her seviye için 6 stat puanı verilir ve can/mana fullenir
  const currentStatPoints = player.statPoints !== undefined ? player.statPoints : playerStats.statPoints;
  const newStatPoints = levelRes.leveledUp
    ? currentStatPoints + levelRes.levelsGained * STAT_POINTS_PER_LEVEL
    : currentStatPoints;

  const finalHp = levelRes.leveledUp ? maxHp : currentHp;
  const finalMana = levelRes.leveledUp ? playerStats.maxMana : (player.mana ?? playerStats.maxMana);

  let updatedPlayer = {
    ...player,
    hp: finalHp,
    maxHp,
    mana: finalMana,
    maxMana: playerStats.maxMana,
    hpPotions,
    statPoints: newStatPoints,
    allocatedStats: player.allocatedStats || { hp: 0, str: 0, agi: 0, int: 0 },
    level: levelRes.level,
    exp: levelRes.exp,
    maxExp: levelRes.maxExp,
    gold: levelRes.gold,
    inventory: updatedInventory,
    newDungeonDrops: updatedNewDrops,
    activeDungeon: {
      ...dungeon,
      currentMonsterIndex: nextMonsterIndex,
      kills,
      sessionExp,
      sessionGold,
      sessionDrops,
      recentLogs,
      lastTickAt: now,
    },
  };

  // 8. Görev İlerlemeleri
  updatedPlayer = applyQuestProgress(updatedPlayer, 'monster_kill', 1);
  updatedPlayer = applyQuestProgress(updatedPlayer, 'gold_earned', goldGain);

  return {
    player: updatedPlayer,
    changed: true,
    event: 'tick',
    leveledUp: levelRes.leveledUp,
    newLevel: levelRes.level,
    droppedItem: newDroppedItem,
  };
}

/**
 * NPC veya Hızlı Menüden İksir Satın Alma
 */
export function buyPotions(player, potionType, quantity = 1, unitCost = 50) {
  if (!player) return { success: false, player, error: 'Oyuncu bulunamadı' };
  const totalCost = quantity * unitCost;
  if ((player.gold || 0) < totalCost) {
    return { success: false, player, error: `Yetersiz altın! Gerekli: ${totalCost.toLocaleString('tr-TR')} Altın` };
  }

  const updated = {
    ...player,
    gold: (player.gold || 0) - totalCost,
    hpPotions: potionType === 'hp' ? (player.hpPotions || 0) + quantity : (player.hpPotions || 0),
    manaPotions: potionType === 'mana' ? (player.manaPotions || 0) + quantity : (player.manaPotions || 0),
  };
  return { success: true, player: updated };
}

/**
 * Manuel İksir Kullanımı (Can / Mana Doldurma)
 */
export function usePotion(player, potionType) {
  if (!player) return player;
  const badgeBonus = calculateBadgeStats(player?.questState?.badgeProgress);
  const playerStats = calculatePlayerStats(player, badgeBonus);
  const maxHp = playerStats.maxHp;
  const maxMana = playerStats.maxMana;

  if (potionType === 'hp') {
    if ((player.hpPotions || 0) <= 0) return player;
    return {
      ...player,
      hpPotions: player.hpPotions - 1,
      hp: Math.min(maxHp, (player.hp ?? maxHp) + 300),
    };
  } else if (potionType === 'mana') {
    if ((player.manaPotions || 0) <= 0) return player;
    return {
      ...player,
      manaPotions: player.manaPotions - 1,
      mana: Math.min(maxMana, (player.mana ?? maxMana) + 300),
    };
  }
  return player;
}

/**
 * Otomatik İksir Eşiği Ayarlama (%30, %50, %75)
 */
export function setAutoPotionThreshold(player, threshold) {
  if (!player) return player;
  return {
    ...player,
    autoPotionThreshold: threshold,
  };
}

/**
 * Karakter Stat Puanı Dağıtımı (Metin2 Tipi 6 Puan/Seviye & Maks 90 Sınırı)
 * 1 HP: +40 Can
 * 1 STR: +3 Direkt Hasar
 * 1 AGI: +2 Savunma, +%0.2 Kaçınma, +%0.2 Kritik
 * 1 INT: +25 Mana, +3 Büyü Hasarı
 */
export function allocateStatPoint(player, statKey, amount = 1) {
  if (!player) return player;
  const validStats = ['hp', 'str', 'agi', 'int'];
  if (!validStats.includes(statKey)) return player;

  const badgeBonus = calculateBadgeStats(player?.questState?.badgeProgress);
  const derived = calculatePlayerStats(player, badgeBonus);
  const availablePoints = derived.statPoints;

  const requestedAmount = Math.max(1, Math.floor(amount));
  if (availablePoints < 1) return player;

  const currentAllocated = {
    hp: player.allocatedStats?.hp || 0,
    str: player.allocatedStats?.str || 0,
    agi: player.allocatedStats?.agi || 0,
    int: player.allocatedStats?.int || 0,
  };

  const currentVal = currentAllocated[statKey] || 0;
  if (currentVal >= MAX_STAT_CAP) return player;

  const actualAdd = Math.min(requestedAmount, availablePoints, MAX_STAT_CAP - currentVal);
  if (actualAdd <= 0) return player;

  const newAllocated = {
    ...currentAllocated,
    [statKey]: currentVal + actualAdd,
  };

  const newStatPoints = availablePoints - actualAdd;

  const newDerived = calculatePlayerStats({
    ...player,
    allocatedStats: newAllocated,
    statPoints: newStatPoints,
  }, badgeBonus);

  let newHp = player.hp ?? newDerived.maxHp;
  let newMana = player.mana ?? newDerived.maxMana;

  if (statKey === 'hp') {
    newHp = Math.min(newDerived.maxHp, (player.hp ?? 500) + actualAdd * 40);
  } else if (statKey === 'int') {
    newMana = Math.min(newDerived.maxMana, (player.mana ?? 500) + actualAdd * 25);
  }

  return {
    ...player,
    hp: newHp,
    maxHp: newDerived.maxHp,
    mana: newMana,
    maxMana: newDerived.maxMana,
    statPoints: newStatPoints,
    allocatedStats: newAllocated,
  };
}

/**
 * Karakter Statlarını Sıfırlama (Kullanılan tüm puanları iade eder)
 */
export function resetStatPoints(player) {
  if (!player) return player;
  const currentLevel = player.level || 1;
  const totalEarned = Math.max(0, (currentLevel - 1) * STAT_POINTS_PER_LEVEL);
  const badgeBonus = calculateBadgeStats(player?.questState?.badgeProgress);

  const resetAllocated = { hp: 0, str: 0, agi: 0, int: 0 };
  const baseDerived = calculatePlayerStats({
    ...player,
    allocatedStats: resetAllocated,
    statPoints: totalEarned,
  }, badgeBonus);

  return {
    ...player,
    hp: baseDerived.maxHp,
    maxHp: baseDerived.maxHp,
    mana: baseDerived.maxMana,
    maxMana: baseDerived.maxMana,
    statPoints: totalEarned,
    allocatedStats: resetAllocated,
  };
}

/**
 * Envantere Girildiğinde Yeni Düşen Eşya Bildirimlerini Temizleme
 */
export function clearNewDungeonDrops(player) {
  if (!player || !player.newDungeonDrops?.length) return player;
  return {
    ...player,
    newDungeonDrops: [],
  };
}

/**
 * Madencilik Tamamlama Mantığı (10 Dakika Sabit Süre Dolduğunda)
 */
export function executeMiningCompletion(player, mine, forceAuto = true) {
  if (!player || !mine) return player;

  const rolled = rollMiningRewards(mine);
  const expReward = rolled.exp;
  const goldReward = rolled.gold;
  const droppedOres = rolled.droppedOres;

  const result = calculateLevelAndExp(
    player.level || 1,
    player.exp || 0,
    expReward,
    player.gold || 0,
    goldReward
  );

  const currentInventory = Array.isArray(player.inventory) ? player.inventory : [];
  const updatedInventory = [...currentInventory, ...droppedOres];

  let updated = {
    ...player,
    level: result.level,
    exp: result.exp,
    maxExp: result.maxExp,
    gold: result.gold,
    inventory: updatedInventory,
    activeMine: null,
    lastMineReport: {
      mineName: mine.name,
      completedAt: new Date().toISOString(),
      expReward,
      goldReward,
      leveledUp: result.leveledUp,
      newLevel: result.level,
      droppedOres,
      autoCollected: forceAuto,
    },
  };

  // Görev İlerlemeleri
  updated = applyQuestProgress(updated, 'mine_clear', 1);
  updated = applyQuestProgress(updated, 'gold_earned', goldReward);

  return updated;
}

/**
 * Boss Zaferi Mantığı (Tek Kişilik, Grup ve Dünya Bossları)
 */
export function executeBossVictory(player, boss, rewards) {
  if (!player || !boss) return player;

  let bossExp = rewards.exp || 0;
  let bossGold = rewards.gold || 0;

  // Grup Sinerji Bonusu (+%EXP ve +%Altın)
  if (player.party?.id) {
    const parties = loadPartiesFromStorage();
    const currentParty = parties.find((p) => p.id === player.party.id);
    if (currentParty) {
      const synergy = getPartySynergyBonus(currentParty.members?.length || 1);
      bossExp = Math.round(bossExp * synergy.expMultiplier);
      bossGold = Math.round(bossGold * synergy.goldMultiplier);
    }
  }

  const result = calculateLevelAndExp(
    player.level || 1,
    player.exp || 0,
    bossExp,
    player.gold || 0,
    bossGold
  );

  const currentInventory = Array.isArray(player.inventory) ? player.inventory : [];
  const newItems = Array.isArray(rewards.droppedItems) ? rewards.droppedItems : [];
  const updatedInventory = [...currentInventory, ...newItems];

  const currentCooldowns = player.bossCooldowns || {};
  const updatedCooldowns = {
    ...currentCooldowns,
    [boss.category]: Date.now(),
  };

  const bossTargetType =
    boss.category === 'party'
      ? 'boss_party'
      : boss.category === 'world'
      ? 'boss_world'
      : 'boss_solo';

  let updated = {
    ...player,
    level: result.level,
    exp: result.exp,
    maxExp: result.maxExp,
    gold: result.gold,
    inventory: updatedInventory,
    bossCooldowns: updatedCooldowns,
  };

  updated = applyQuestProgress(updated, bossTargetType, 1);
  updated = applyQuestProgress(updated, 'gold_earned', rewards.gold || 0);

  return updated;
}

/**
 * Ekipman Kuşanma Mantığı (12 Slot)
 */
export function equipItem(player, item) {
  if (!player || !item) return player;

  const slotKey = item.slot;
  const currentEquipped = player.equipped || {};
  const oldItem = currentEquipped[slotKey] || null;

  const newInventory = (player.inventory || []).filter((it) => it.instanceId !== item.instanceId);
  if (oldItem) {
    newInventory.push(oldItem);
  }

  return {
    ...player,
    equipped: {
      ...currentEquipped,
      [slotKey]: item,
    },
    inventory: newInventory,
  };
}

/**
 * Ekipman Çıkarma Mantığı
 */
export function unequipItem(player, slotKey) {
  if (!player || !player.equipped?.[slotKey]) return player;

  const itemToUnequip = player.equipped[slotKey];
  const newEquipped = { ...player.equipped };
  delete newEquipped[slotKey];

  const newInventory = [...(player.inventory || []), itemToUnequip];

  return {
    ...player,
    equipped: newEquipped,
    inventory: newInventory,
  };
}

/**
 * Eşya Çantadan Atma veya Cevher Satma Mantığı
 */
export function discardOrSellItem(player, instanceId, sellPrice = 0) {
  if (!player) return player;

  const newInventory = (player.inventory || []).filter((it) => it.instanceId !== instanceId);
  let updated = {
    ...player,
    gold: (player.gold || 0) + (Number(sellPrice) || 0),
    inventory: newInventory,
  };

  if (sellPrice > 0) {
    updated = applyQuestProgress(updated, 'ore_sell', 1);
    updated = applyQuestProgress(updated, 'gold_earned', Number(sellPrice));
  }

  return updated;
}


