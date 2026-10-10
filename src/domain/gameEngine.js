// Kadim Elfler - Merkezi Oyun Motoru & Mantık Servisi (Game Engine)
// Tüm ödül hesaplamaları, envanter işlemleri, zindan/maden/boss sonuçları ve görev ilerlemeleri burada toplanır.
// Pure Domain Logic: Zero React / UI or network dependencies.

import { calculateLevelAndExp, rollDungeonReward, DUNGEON_GROUPS } from '@/core/config/dungeonData';
import {
  rollDungeonEquipmentDrops,
  isItemForPlayerClass,
  UPGRADE_CONFIG,
  getRequiredClassMaterial,
  createUpgradeMaterialItem,
} from '@/core/config/itemsData';
import { ELVEN_MINES, MINING_DURATION_SECONDS, rollMiningRewards, createOreItem } from '@/core/config/miningData';
import {
  ensurePlayerQuestState,
  applyQuestProgress,
  selectDailyQuestsForLevel,
  BADGE_DEFINITIONS,
  calculateBadgeStats,
} from '@/domain/questEngine';
import { loadPartiesFromStorage, getPartySynergyBonus } from '@/core/config/partyData';
import {
  calculatePlayerStats,
  MAX_STAT_CAP,
  STAT_POINTS_PER_LEVEL,
} from '@/domain/characterStats';

export {
  calculateLevelAndExp,
  rollDungeonReward,
  DUNGEON_GROUPS,
  rollDungeonEquipmentDrops,
  ELVEN_MINES,
  MINING_DURATION_SECONDS,
  rollMiningRewards,
  createOreItem,
  ensurePlayerQuestState,
  applyQuestProgress,
  selectDailyQuestsForLevel,
  BADGE_DEFINITIONS,
  calculateBadgeStats,
  calculatePlayerStats,
  MAX_STAT_CAP,
  STAT_POINTS_PER_LEVEL,
};

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

  // 6. Eşya & Yükseltme Malzemeleri Düşme Şansı
  let updatedInventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  let newDroppedItem = null;
  let droppedMatName = null;

  // 6a. Ekipman Düşme Şansı (Tüm canavarlar ve bosslar istisnasız sabit %3)
  const dropChance = 0.03;
  if (Math.random() < dropChance) {
    const drops = rollDungeonEquipmentDrops(dungeon.dungeonId || dungeon.id, player.classId || 'warrior');
    if (drops.length > 0) {
      newDroppedItem = drops[0];
      updatedInventory.push(newDroppedItem);
    }
  }

  // 6b. Kadim Yükseltme Taşı (Boss'ta %100, Normal Canavarda %18 şans)
  const stoneDropChance = isBoss ? 1.0 : 0.18;
  if (Math.random() < stoneDropChance) {
    const stoneItem = createUpgradeMaterialItem('upgrade_stone', isBoss ? (Math.random() < 0.5 ? 2 : 1) : 1);
    updatedInventory = addItemToInventory(updatedInventory, stoneItem, 200);
    droppedMatName = stoneItem.name;
  }

  // 6c. Sınıf Yükseltme Malzemeleri (1-10 Seviye Zindanları: Ay Kurdu Pençesi, Gölge İpeği, Arkanik Kristal)
  // Boss'ta %100, Normal canavarda %15 şans
  if (dungeonTier <= 2) {
    const classMatDropChance = isBoss ? 1.0 : 0.15;
    if (Math.random() < classMatDropChance) {
      let matKey = 'claw_moonwolf';
      const mName = (monster.name || '').toLowerCase();
      if (mName.includes('kurt') || mName.includes('goblin') || mName.includes('cüce')) {
        matKey = 'claw_moonwolf';
      } else if (mName.includes('örümcek') || mName.includes('gölge')) {
        matKey = 'silk_shadowspider';
      } else {
        matKey = 'crystal_arcane';
      }
      const classMatItem = createUpgradeMaterialItem(matKey, isBoss ? (Math.random() < 0.5 ? 2 : 1) : 1);
      updatedInventory = addItemToInventory(updatedInventory, classMatItem, 200);
      droppedMatName = droppedMatName ? `${droppedMatName}, ${classMatItem.name}` : classMatItem.name;
    }
  }

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
    droppedItemName: newDroppedItem?.name || droppedMatName || null,
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
export function consumePotion(player, potionType) {
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

export const usePotion = consumePotion;

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
 * Eşyanın yığınlanabilir (maden cevheri, yükseltme taşı, zindan materyali, iksir vb.) olup olmadığını belirler.
 * Ekipmanlar (silah, miğfer, zırh, kalkan, takı vb.) asla yığınlanamaz, daima tekil slot kaplar.
 */
export function isStackableItem(item) {
  if (!item) return false;
  const isEquipment = Boolean(
    !item.isOre &&
    item.type !== 'ore' &&
    item.slot !== 'ore' &&
    !item.isMaterial &&
    item.type !== 'material' &&
    !item.isUpgradeStone &&
    (item.slot || item.setKey || item.slotName)
  );
  if (isEquipment) return false;

  return Boolean(
    item.isOre ||
    item.type === 'ore' ||
    item.slot === 'ore' ||
    item.isMaterial ||
    item.type === 'material' ||
    item.isUpgradeStone ||
    item.stackable ||
    (item.count !== undefined && item.count !== null && Number(item.count) > 0)
  );
}

/**
 * Yığınlanabilir eşyalar için benzersiz kümeleme anahtarı.
 * Maden cevherlerinde (ör. 'Ay Gümüşü') ID veya format farkı olsa bile isimden 'ore_' ön ekiyle birleştirir.
 */
export function getStackableKey(item) {
  if (!item) return '';
  if (item.isOre || item.type === 'ore' || item.slot === 'ore') {
    return `ore_${item.name || item.id}`;
  }
  return item.id || item.name || 'item';
}

/**
 * Envanteri Otomatik Konsolide Etme & Birleştirme (Maks. 200 Adet Yığın)
 * Envanterdeki aynı maden veya materyalleri otomatik olarak tek yuvaya toplar, sayılarını toplar.
 * 200'ü aşan durumlar olursa yeni bir yuvaya taşır. Ekipmanlara dokunmaz.
 */
export function consolidateInventory(inventory, maxStack = 200) {
  if (!Array.isArray(inventory)) return [];

  const result = [];
  const availableSlots = new Map(); // key -> [indices with count < maxStack]

  for (const rawItem of inventory) {
    if (!rawItem) continue;

    if (!isStackableItem(rawItem)) {
      result.push(rawItem);
      continue;
    }

    const key = getStackableKey(rawItem);
    let remaining = Math.max(1, Number(rawItem.count) || 1);

    // 1. Mevcut açık yuvaya ekle
    if (availableSlots.has(key)) {
      const slotIndices = availableSlots.get(key);
      for (const idx of slotIndices) {
        const existing = result[idx];
        const existingCount = Math.max(1, Number(existing.count) || 1);
        const space = maxStack - existingCount;
        if (space > 0) {
          const addAmount = Math.min(space, remaining);
          result[idx] = {
            ...existing,
            count: existingCount + addAmount,
          };
          remaining -= addAmount;
          if (remaining <= 0) break;
        }
      }
    }

    // 2. Kalan varsa yeni slot aç
    while (remaining > 0) {
      const addAmount = Math.min(maxStack, remaining);
      const newSlot = {
        ...rawItem,
        count: addAmount,
      };
      const newIdx = result.length;
      result.push(newSlot);

      if (!availableSlots.has(key)) {
        availableSlots.set(key, []);
      }
      availableSlots.get(key).push(newIdx);

      remaining -= addAmount;
    }
  }

  return result;
}

/**
 * Envantere Eşya Ekleme Mantığı (Maksimum 200 Adet Yığın / Stacking)
 * Maden cevherleri ve materyaller 200 adede kadar aynı yuvada birikir.
 * Ekipmanlar ise her zaman tekil slot kaplar.
 */
export function addItemToInventory(inventory, newItem, maxStack = 200) {
  if (!newItem) return consolidateInventory(inventory, maxStack);
  const current = consolidateInventory(inventory, maxStack);
  return consolidateInventory([...current, newItem], maxStack);
}

/**
 * 10 Dakikalık Madencilik Süresince Canlı Kazı Döngüsü
 * Maden devam ederken cevherler zindanda olduğu gibi anında çantaya düşer.
 * 10 dakika boyunca toplam 5 - 10 cevher hedefine göre düzenli aralıklarla düşer.
 */
export function processMiningTick(player) {
  if (!player || !player.activeMine) return { player, changed: false };

  const activeMine = player.activeMine;
  const mineData = ELVEN_MINES.find((m) => m.id === activeMine.mineId) || ELVEN_MINES[0];
  const now = Date.now();

  const targetOres = activeMine.targetOres || 7;
  const currentMined = activeMine.minedOres || 0;

  if (currentMined >= targetOres) {
    return { player, changed: false };
  }

  const newMinedCount = currentMined + 1;
  const newOre = createOreItem(mineData, 1);

  // Envantere 200'lük yığın mantığıyla anında ekle!
  const updatedInventory = addItemToInventory(player.inventory, newOre, 200);

  // Altın payı
  const goldPerOre = Math.round((mineData.minGold || 2000) / targetOres);
  const newGold = (player.gold || 0) + goldPerOre;

  const nextInterval = activeMine.intervalMs || Math.floor((MINING_DURATION_SECONDS * 1000) / (targetOres + 1));
  const nextDropAt = now + nextInterval;

  const logEntry = {
    id: `mine_log_${now}_${newMinedCount}`,
    text: `⛏️ [${mineData.name}] damarından 1 adet cevher çıkarıldı! (${newMinedCount}/${targetOres})`,
    timestamp: now,
    oreName: mineData.name,
    count: newMinedCount,
    goldGain: goldPerOre,
  };

  const updatedLogs = [...(activeMine.recentLogs || []), logEntry].slice(-15);

  let updatedPlayer = {
    ...player,
    gold: newGold,
    inventory: updatedInventory,
    activeMine: {
      ...activeMine,
      minedOres: newMinedCount,
      nextDropAt,
      recentLogs: updatedLogs,
    },
  };

  // Görev ilerlemesi
  updatedPlayer = applyQuestProgress(updatedPlayer, 'gold_earned', goldPerOre);

  return {
    player: updatedPlayer,
    changed: true,
    droppedOre: newOre,
    minedCount: newMinedCount,
    targetOres,
  };
}

/**
 * Madencilik Tamamlama Mantığı (10 Dakika Sabit Süre Dolduğunda)
 * Eğer süre dolduğunda hedef 5-10 madenden eksik kalan olduysa aradaki farkı telafi eder.
 */
export function executeMiningCompletion(player, mine, forceAuto = true) {
  if (!player || !mine) return player;

  const activeMine = player.activeMine;
  const targetOres = activeMine?.targetOres || (Math.floor(Math.random() * (10 - 5 + 1)) + 5);
  const alreadyMined = activeMine?.minedOres || 0;
  const remainingDeficit = Math.max(0, targetOres - alreadyMined);

  let currentInventory = Array.isArray(player.inventory) ? player.inventory : [];

  if (remainingDeficit > 0) {
    const deficitOre = createOreItem(mine, remainingDeficit);
    currentInventory = addItemToInventory(currentInventory, deficitOre, 200);
  }

  // Kalan altın ödülü
  const remainingGold = Math.round(((mine.maxGold + mine.minGold) / 2) * (remainingDeficit / targetOres));
  const finalGold = (player.gold || 0) + remainingGold;

  let updated = {
    ...player,
    gold: finalGold,
    inventory: currentInventory,
    activeMine: null,
    lastMineReport: {
      mineName: mine.name,
      completedAt: new Date().toISOString(),
      expReward: 0,
      goldReward: (mine.minGold || 2000),
      totalMined: targetOres,
      droppedOres: [createOreItem(mine, targetOres)],
      autoCollected: forceAuto,
    },
  };

  // Görev İlerlemeleri
  updated = applyQuestProgress(updated, 'mine_clear', 1);
  if (remainingGold > 0) {
    updated = applyQuestProgress(updated, 'gold_earned', remainingGold);
  }

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

  // Sınıf Kısıtlaması: Oyuncu yalnızca kendi sınıfına ait ekipmanları kuşanabilir
  if (!isItemForPlayerClass(item, player)) {
    return player;
  }

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
 * Yığınlı madenlerde 1 adet veya Tüm Yığını satma desteği.
 */
export function discardOrSellItem(player, instanceId, sellPrice = 0, amountToSell = 'all') {
  if (!player) return player;

  const currentInventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  const itemIndex = currentInventory.findIndex((it) => it.instanceId === instanceId);
  if (itemIndex === -1) return player;

  const item = currentInventory[itemIndex];
  const count = Number(item.count) > 0 ? Number(item.count) : 1;
  let goldGain = 0;
  let newInventory = [...currentInventory];
  let soldAmount = 1;

  if (amountToSell === 1 && count > 1) {
    // 1 adet sat
    goldGain = Number(item.sellPrice) || Math.round(Number(sellPrice) / count) || 0;
    soldAmount = 1;
    newInventory[itemIndex] = {
      ...item,
      count: count - 1,
    };
  } else {
    // Tüm yığını veya tekil eşyayı sat / sil
    goldGain = Number(sellPrice) || 0;
    soldAmount = count;
    newInventory = currentInventory.filter((_, idx) => idx !== itemIndex);
  }

  let updated = {
    ...player,
    gold: (player.gold || 0) + goldGain,
    inventory: newInventory,
  };

  if (goldGain > 0) {
    updated = applyQuestProgress(updated, 'ore_sell', soldAmount);
    updated = applyQuestProgress(updated, 'gold_earned', goldGain);
  }

  return updated;
}

/**
 * Envanterden Belirli Miktarda Malzeme Tüketir (Yığın Azaltma / Yuva Silme)
 */
export function consumeMaterialFromInventory(inventory = [], itemId, amount = 1) {
  let remainingToConsume = amount;
  const newInventory = [];

  for (const item of inventory) {
    if (!item) continue;
    if (item.id === itemId && remainingToConsume > 0) {
      const currentCount = Number(item.count) > 0 ? Number(item.count) : 1;
      if (currentCount <= remainingToConsume) {
        remainingToConsume -= currentCount;
      } else {
        newInventory.push({
          ...item,
          count: currentCount - remainingToConsume,
        });
        remainingToConsume = 0;
      }
    } else {
      newInventory.push(item);
    }
  }

  return { inventory: newInventory, success: remainingToConsume === 0 };
}

/**
 * 🔨 DEMİRCİ / EKİPMAN YÜKSELTME SİSTEMİ (+0 -> +9)
 * +1..+6 arası yalnızca Kadim Yükseltme Taşı ve Altın ister.
 * +7..+9 arası Kadim Yükseltme Taşı + İlgili Sınıf Malzemesi + Altın ister.
 * BAŞARISIZ OLURSA: Eşya +0 seviyesine geriler!
 */
export function upgradeEquipment(player, instanceId) {
  if (!player || !instanceId) {
    return { success: false, error: 'Geçersiz eşya veya oyuncu verisi!' };
  }

  const currentInventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
  const itemIndex = currentInventory.findIndex((it) => it.instanceId === instanceId);

  if (itemIndex === -1) {
    return { success: false, error: 'Eşya envanterinizde bulunamadı!' };
  }

  const targetItem = currentInventory[itemIndex];
  if (targetItem.isOre || targetItem.type === 'ore' || targetItem.isMaterial || targetItem.type === 'material') {
    return { success: false, error: 'Yalnızca kuşanılabilir ekipmanlar yükseltilebilir!' };
  }

  const currentPlus = Number(targetItem.plusLevel) || 0;
  if (currentPlus >= 9) {
    return { success: false, error: 'Bu ekipman zaten azami +9 seviyesindedir!' };
  }

  const nextPlus = currentPlus + 1;
  const config = UPGRADE_CONFIG[nextPlus];
  if (!config) {
    return { success: false, error: 'Yükseltme formülü bulunamadı!' };
  }

  // 1. Altın Kontrolü
  if ((player.gold || 0) < config.gold) {
    return {
      success: false,
      error: `Yetersiz Altın! Gereken: ${config.gold.toLocaleString('tr-TR')} Altın, Mevcut: ${(player.gold || 0).toLocaleString('tr-TR')} Altın`,
    };
  }

  // 2. Kadim Yükseltme Taşı Kontrolü
  const totalStones = currentInventory
    .filter((it) => it.id === 'upgrade_stone')
    .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0);

  if (totalStones < config.stones) {
    return {
      success: false,
      error: `Yetersiz Kadim Yükseltme Taşı! Gereken: ${config.stones} Adet, Çantanızda: ${totalStones} Adet`,
    };
  }

  // 3. Sınıf Malzemesi Kontrolü (+7, +8, +9)
  let reqClassMat = null;
  if (config.classMats > 0) {
    reqClassMat = getRequiredClassMaterial(targetItem, player);
    const totalClassMats = currentInventory
      .filter((it) => it.id === reqClassMat.id)
      .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0);

    if (totalClassMats < config.classMats) {
      return {
        success: false,
        error: `Yetersiz ${reqClassMat.name}! Gereken: ${config.classMats} Adet, Çantanızda: ${totalClassMats} Adet`,
      };
    }
  }

  // Malzemeleri ve Altını Tüket
  let updatedInv = currentInventory;
  const stoneRes = consumeMaterialFromInventory(updatedInv, 'upgrade_stone', config.stones);
  updatedInv = stoneRes.inventory;

  if (config.classMats > 0 && reqClassMat) {
    const matRes = consumeMaterialFromInventory(updatedInv, reqClassMat.id, config.classMats);
    updatedInv = matRes.inventory;
  }

  const newGold = Math.max(0, (player.gold || 0) - config.gold);

  // Başarı Oranı Çekilişi (% şans)
  const roll = Math.random() * 100;
  const isSuccess = roll < config.rate;

  let finalItem;
  let resultMessage;

  // Hedef eşyanın yeni kopyasını bul
  const finalItemIdx = updatedInv.findIndex((it) => it.instanceId === instanceId);

  if (isSuccess) {
    finalItem = {
      ...targetItem,
      plusLevel: nextPlus,
    };
    resultMessage = `✨ [BAŞARILI] Demirci çekicini ustalıkla vurdu! "${targetItem.name}" başarıyla +${nextPlus} oldu!`;
  } else {
    // KULLANICI KURALI: "eşya başarısız olursa +0a düşsün"
    finalItem = {
      ...targetItem,
      plusLevel: 0,
    };
    resultMessage = `💥 [BAŞARISIZ] Demirci çeliği soğuturken çatlak oluştu! "${targetItem.name}" +0 seviyesine geriledi.`;
  }

  if (finalItemIdx !== -1) {
    updatedInv[finalItemIdx] = finalItem;
  } else {
    updatedInv.push(finalItem);
  }

  const updatedPlayer = {
    ...player,
    gold: newGold,
    inventory: updatedInv,
  };

  return {
    success: true,
    isUpgradeSuccess: isSuccess,
    player: updatedPlayer,
    upgradedItem: finalItem,
    previousLevel: currentPlus,
    newLevel: isSuccess ? nextPlus : 0,
    message: resultMessage,
    rate: config.rate,
  };
}
