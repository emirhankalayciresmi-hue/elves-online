// Kadim Elfler - Zamanlayıcı & Arka Plan Sefer Yönetim Hook'u (useGameTimers)
// Zindan oto-av kasılma döngüsü ve 10 dakikalık madencilik işlemlerini yönetir.

import { useEffect } from 'react';
import { DUNGEON_GROUPS } from '../config/dungeonData';
import { ELVEN_MINES, MINING_DURATION_SECONDS } from '../config/miningData';
import {
  processDungeonCombatTick,
  executeMiningCompletion,
} from '../services/gameEngine';

export function useGameTimers(player, setPlayer, onSavePlayer, onAnnouncement) {
  // Arka plan otomatik tamamlama ve aktif zindan savaş zamanlayıcısı (1 sn interval)
  useEffect(() => {
    if (!player?.activeDungeon && !player?.activeMine) return;

    const timer = setInterval(() => {
      setPlayer((current) => {
        if (!current) return current;
        let updated = current;
        let stateChanged = false;
        const now = Date.now();

        // 1. Zindan Aktif Savaş Döngüsü (Her 3.5 saniyede 1 canavar kesimi & anlık ganimet)
        if (updated.activeDungeon) {
          const lastTick = updated.activeDungeon.lastTickAt || 0;
          if (now - lastTick >= 3500) {
            const combatRes = processDungeonCombatTick(updated);
            if (combatRes.changed) {
              updated = combatRes.player;
              stateChanged = true;

              if (combatRes.event === 'died') {
                onAnnouncement?.(combatRes.message, 'high');
              } else if (combatRes.event === 'completed') {
                onAnnouncement?.(combatRes.message, 'normal');
              } else if (combatRes.leveledUp) {
                onAnnouncement?.(`🎉 [${updated.name}] Seviye ${combatRes.newLevel} oldu!`, 'normal');
              }
            }
          }
        }

        // 2. Maden Süresi Kontrolü (10 Dakika Sabit)
        if (updated.activeMine) {
          const start = updated.activeMine.startTime || now;
          const durationMs = (updated.activeMine.durationSeconds || MINING_DURATION_SECONDS) * 1000;
          if (now - start >= durationMs) {
            const mine = ELVEN_MINES.find((m) => m.id === updated.activeMine.mineId) || ELVEN_MINES[0];
            updated = executeMiningCompletion(updated, mine, true);
            stateChanged = true;
          }
        }

        if (stateChanged) {
          onSavePlayer(updated);
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    player?.activeDungeon?.lastTickAt,
    player?.activeDungeon?.startTime,
    player?.activeMine?.startTime,
    onSavePlayer,
    setPlayer,
    onAnnouncement,
  ]);

  // Zindan Başlatma (Hemen savaş başlar, bekleme yok)
  const startDungeon = (dungeonId) => {
    const dungeon = DUNGEON_GROUPS.find((d) => d.id === dungeonId);
    if (!dungeon || !player) return;

    // Bekleme Süresi Kontrolü (5 Dakika)
    if (player.dungeonCooldownUntil && Date.now() < player.dungeonCooldownUntil) {
      const remainingSecs = Math.ceil((player.dungeonCooldownUntil - Date.now()) / 1000);
      const mins = Math.floor(remainingSecs / 60);
      const secs = remainingSecs % 60;
      alert(`⚠️ Zindan dinlenme süresindesiniz! Kalan süre: ${mins}dk ${secs}sn`);
      return;
    }

    const firstMonster = dungeon.monsters?.[0];
    const initialLog = {
      id: `log_init_${Date.now()}`,
      monsterName: firstMonster?.name || 'Canavar',
      isBoss: false,
      expGain: 0,
      goldGain: 0,
      damageTaken: 0,
      potionUsed: false,
      droppedItemName: null,
      timestamp: Date.now(),
      text: `⚔️ "${dungeon.name}" zindanına girildi! Otomatik savaş ve kasılma başladı.`,
    };

    const updated = {
      ...player,
      activeDungeon: {
        dungeonId: dungeon.id,
        name: dungeon.name,
        durationSeconds: dungeon.durationSeconds || 1800,
        startTime: Date.now(),
        lastTickAt: 0, // İlk kesim anında başlasın
        expMin: dungeon.expMin,
        expMax: dungeon.expMax,
        goldMin: dungeon.goldMin,
        goldMax: dungeon.goldMax,
        monsters: dungeon.monsters,
        levelMin: dungeon.levelMin,
        levelMax: dungeon.levelMax,
        currentMonsterIndex: 0,
        kills: 0,
        sessionExp: 0,
        sessionGold: 0,
        sessionDrops: [],
        recentLogs: [initialLog],
      },
    };
    setPlayer(updated);
    onSavePlayer(updated);
    onAnnouncement?.(`⚔️ [${player.name}] "${dungeon.name}" zindanına girdi ve kasılmaya başladı!`, 'normal');
  };

  // Zindandan Çekil / İptal Et (5 Dakika Bekleme Süresi Verir, Ganimetler Kalır)
  const cancelDungeon = () => {
    if (!player || !player.activeDungeon) return;
    const dungeonName = player.activeDungeon.name;
    const updated = {
      ...player,
      activeDungeon: null,
      dungeonCooldownUntil: Date.now() + 5 * 60 * 1000, // 5 dk bekleme süresi
    };
    setPlayer(updated);
    onSavePlayer(updated);
    onAnnouncement?.(`🏃 [${player.name}] "${dungeonName}" zindanından ayrıldı. (5 dk dinlenme süresi devrede)`, 'normal');
  };

  // Bekleme Süresini Sıfırla (Test için)
  const resetDungeonCooldown = () => {
    if (!player) return;
    const updated = { ...player, dungeonCooldownUntil: 0 };
    setPlayer(updated);
    onSavePlayer(updated);
  };

  // Zindan Hızlı Canavar Kesimi (Test: Anında +1 Slot Kes)
  const fastForwardDungeon = () => {
    setPlayer((current) => {
      if (!current?.activeDungeon) return current;
      const combatRes = processDungeonCombatTick(current);
      if (combatRes.changed) {
        onSavePlayer(combatRes.player);
        return combatRes.player;
      }
      return current;
    });
  };

  // Zindan Raporunu Kapatma
  const dismissDungeonReport = () => {
    setPlayer((current) => {
      if (!current) return current;
      const updated = { ...current, lastDungeonReport: null };
      onSavePlayer(updated);
      return updated;
    });
  };

  // Madencilik Başlatma (10 Dakika Sabit)
  const startMining = (mineId) => {
    const mine = ELVEN_MINES.find((m) => m.id === mineId);
    if (!mine || !player) return;

    const updated = {
      ...player,
      activeMine: {
        mineId: mine.id,
        name: mine.name,
        durationSeconds: MINING_DURATION_SECONDS,
        startTime: Date.now(),
        minGold: mine.minGold,
        maxGold: mine.maxGold,
        minExp: mine.minExp,
        maxExp: mine.maxExp,
        oreImage: mine.oreImage,
        cardImage: mine.cardImage,
      },
    };
    setPlayer(updated);
    onSavePlayer(updated);
  };

  // Madencilik İptali
  const cancelMining = () => {
    if (!player) return;
    const updated = { ...player, activeMine: null };
    setPlayer(updated);
    onSavePlayer(updated);
  };

  // Madencilik Hızlı Tamamlama (Test)
  const fastForwardMining = (seconds = 600) => {
    setPlayer((current) => {
      if (!current?.activeMine) return current;
      const currentStart = current.activeMine.startTime || Date.now();
      const newStart = currentStart - seconds * 1000;
      const now = Date.now();
      const durationMs = (current.activeMine.durationSeconds || MINING_DURATION_SECONDS) * 1000;

      if (now - newStart >= durationMs) {
        const mine = ELVEN_MINES.find((m) => m.id === current.activeMine.mineId) || ELVEN_MINES[0];
        const completed = executeMiningCompletion(current, mine, true);
        onSavePlayer(completed);
        return completed;
      }

      const updated = {
        ...current,
        activeMine: { ...current.activeMine, startTime: newStart },
      };
      onSavePlayer(updated);
      return updated;
    });
  };

  // Maden Raporunu Kapatma
  const dismissMineReport = () => {
    setPlayer((current) => {
      if (!current) return current;
      const updated = { ...current, lastMineReport: null };
      onSavePlayer(updated);
      return updated;
    });
  };

  return {
    startDungeon,
    cancelDungeon,
    fastForwardDungeon,
    resetDungeonCooldown,
    dismissDungeonReport,
    startMining,
    cancelMining,
    fastForwardMining,
    dismissMineReport,
  };
}
