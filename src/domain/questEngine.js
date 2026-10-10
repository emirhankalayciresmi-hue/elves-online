/**
 * Quest Engine - Pure Domain Model
 * Zero UI / React / network dependencies.
 * Handles quest progression, daily quest selection, badge calculations, and completion rewards.
 */

import {
  ALL_DAILY_QUESTS,
  ALL_WEEKLY_QUESTS,
  BADGE_DEFINITIONS,
} from '@/core/config/questData';

export { BADGE_DEFINITIONS };

// Karakter seviyesine uygun 5 günlük görev seç
export function selectDailyQuestsForLevel(playerLevel = 1, count = 5) {
  const eligible = ALL_DAILY_QUESTS.filter(
    (q) => playerLevel >= q.levelMin && playerLevel <= q.levelMax + 15
  );

  const fallback = eligible.length >= count ? eligible : ALL_DAILY_QUESTS;
  const shuffled = [...fallback].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((q) => ({
    ...q,
    instanceId: `${q.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    current: 0,
    isCompleted: false,
    rewardClaimed: false,
  }));
}

// Karakter seviyesine uygun 20 haftalık görev seç
export function selectWeeklyQuestsForLevel(playerLevel = 1, count = 20) {
  const eligible = ALL_WEEKLY_QUESTS.filter(
    (q) => playerLevel >= q.levelMin && playerLevel <= q.levelMax + 20
  );

  const fallback = eligible.length >= count ? eligible : ALL_WEEKLY_QUESTS;
  const shuffled = [...fallback].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((q) => ({
    ...q,
    instanceId: `${q.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    current: 0,
    isCompleted: false,
    rewardClaimed: false,
  }));
}

// Rozet başlangıç durumunu oluştur
export function createInitialBadgeProgress() {
  const badgeState = {};
  BADGE_DEFINITIONS.forEach((b) => {
    badgeState[b.id] = {
      id: b.id,
      currentCount: 0,
      currentTier: 0, // 0 = henüz tamamlanmadı, 1..5 tamamlanan kademe
    };
  });
  return badgeState;
}

// Oyuncu statlarına kazanılan kalıcı rozet bonuslarını uygula
export function calculateBadgeStats(badgeState = {}) {
  const accumulatedStats = {};
  BADGE_DEFINITIONS.forEach((badgeDef) => {
    const p = badgeState[badgeDef.id];
    if (!p || !p.currentTier) return;

    for (let t = 1; t <= p.currentTier; t++) {
      const tierObj = badgeDef.tiers.find((tier) => tier.tier === t);
      if (tierObj && tierObj.statBonus) {
        Object.entries(tierObj.statBonus).forEach(([statKey, val]) => {
          accumulatedStats[statKey] = (accumulatedStats[statKey] || 0) + val;
        });
      }
    }
  });
  return accumulatedStats;
}

// Oyuncu questState'ini garantiye al (eksikse oluştur)
export function ensurePlayerQuestState(player) {
  if (!player) return null;
  const currentQs = player.questState || {};
  const playerLevel = player.level || 1;

  const dailyQuests = Array.isArray(currentQs.dailyQuests) && currentQs.dailyQuests.length === 5
    ? currentQs.dailyQuests
    : selectDailyQuestsForLevel(playerLevel, 5);

  const weeklyQuests = Array.isArray(currentQs.weeklyQuests) && currentQs.weeklyQuests.length === 20
    ? currentQs.weeklyQuests
    : selectWeeklyQuestsForLevel(playerLevel, 20);

  const badgeProgress = currentQs.badgeProgress && Object.keys(currentQs.badgeProgress).length > 0
    ? currentQs.badgeProgress
    : createInitialBadgeProgress();

  return {
    ...player,
    questState: {
      dailyQuests,
      weeklyQuests,
      badgeProgress,
      completedDailyCount: currentQs.completedDailyCount || 0,
      completedWeeklyCount: currentQs.completedWeeklyCount || 0,
      completedBadgeCount: currentQs.completedBadgeCount || 0,
      completedDailyBatches: currentQs.completedDailyBatches || 0,
      dailyBatchJustCompleted: currentQs.dailyBatchJustCompleted || false,
    },
  };
}

// Tüm oyun eylemlerini (zindan, maden, boss, altın, yaratık) görevlere otomatik yansıtan motor
export function applyQuestProgress(player, eventType, amount = 1) {
  if (!player) return player;
  const ensured = ensurePlayerQuestState(player);
  let { dailyQuests, weeklyQuests, badgeProgress, completedDailyCount, completedWeeklyCount, completedBadgeCount, completedDailyBatches, dailyBatchJustCompleted } = ensured.questState;

  let addedGold = 0;
  let addedExp = 0;
  let addedCrystals = 0;
  let newBadgesUnlocked = [];

  // 1. Günlük Görevleri İlerlet & Otomatik Ödül
  dailyQuests = dailyQuests.map((q) => {
    if (q.type === eventType && !q.isCompleted) {
      const newCurrent = q.current + amount;
      if (newCurrent >= q.target) {
        addedGold += q.rewardGold || 0;
        completedDailyCount++;
        return {
          ...q,
          current: q.target,
          isCompleted: true,
          rewardClaimed: true,
        };
      }
      return { ...q, current: newCurrent };
    }
    return q;
  });

  // 5 Görev Tamamlandı mı? Kontrol et
  const all5DailyCompleted = dailyQuests.length === 5 && dailyQuests.every((q) => q.isCompleted);
  if (all5DailyCompleted) {
    addedGold += 3500;
    addedCrystals += 15;
    completedDailyBatches++;
    dailyBatchJustCompleted = true;
    dailyQuests = selectDailyQuestsForLevel(ensured.level || 1, 5);
  }

  // 2. Haftalık Görevleri İlerlet & Otomatik Ödül
  weeklyQuests = weeklyQuests.map((q) => {
    if (q.type === eventType && !q.isCompleted) {
      const newCurrent = q.current + amount;
      if (newCurrent >= q.target) {
        addedGold += q.rewardGold || 0;
        completedWeeklyCount++;
        return {
          ...q,
          current: q.target,
          isCompleted: true,
          rewardClaimed: true,
        };
      }
      return { ...q, current: newCurrent };
    }
    return q;
  });

  // 3. Kademeli Rozet Görevlerini İlerlet
  const updatedBadgeProgress = { ...badgeProgress };
  BADGE_DEFINITIONS.forEach((bDef) => {
    if (bDef.targetType === eventType) {
      const cur = updatedBadgeProgress[bDef.id] || { id: bDef.id, currentCount: 0, currentTier: 0 };
      const newCount = cur.currentCount + amount;
      let curTier = cur.currentTier || 0;

      const nextTierObj = bDef.tiers.find((t) => t.tier === curTier + 1);
      if (nextTierObj && newCount >= nextTierObj.target) {
        curTier = nextTierObj.tier;
        completedBadgeCount++;
        addedGold += nextTierObj.rewardGold || 0;
        addedCrystals += nextTierObj.rewardCrystals || 0;
        newBadgesUnlocked.push({
          badgeName: bDef.name,
          tierName: nextTierObj.name,
          statDesc: nextTierObj.statDesc,
        });
      }

      updatedBadgeProgress[bDef.id] = {
        ...cur,
        currentCount: newCount,
        currentTier: curTier,
      };
    }
  });

  return {
    ...ensured,
    gold: (ensured.gold || 0) + addedGold,
    crystals: (ensured.crystals || 0) + addedCrystals,
    questState: {
      dailyQuests,
      weeklyQuests,
      badgeProgress: updatedBadgeProgress,
      completedDailyCount,
      completedWeeklyCount,
      completedBadgeCount,
      completedDailyBatches,
      dailyBatchJustCompleted,
    },
    lastQuestRewardNotification: addedGold > 0 || newBadgesUnlocked.length > 0 ? {
      addedGold,
      addedExp,
      addedCrystals,
      newBadgesUnlocked,
      timestamp: Date.now(),
    } : null,
  };
}

export default {
  selectDailyQuestsForLevel,
  selectWeeklyQuestsForLevel,
  createInitialBadgeProgress,
  calculateBadgeStats,
  ensurePlayerQuestState,
  applyQuestProgress,
};
