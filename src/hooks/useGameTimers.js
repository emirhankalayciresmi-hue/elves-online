// Kadim Elfler - Zamanlayıcı & Arka Plan Sefer Yönetim Hook'u (useGameTimers)
// Zindan oto-av kasılma döngüsü ve 10 dakikalık madencilik işlemlerini yönetir.

import { useEffect, useRef } from 'react';
import { DUNGEON_GROUPS } from '@/core/config/dungeonData';
import { ELVEN_MINES, MINING_DURATION_SECONDS } from '@/core/config/miningData';
import {
  processDungeonCombatTick,
  processMiningTick,
  executeMiningCompletion,
  consolidateInventory,
} from '@/domain/gameEngine';
import { storageManager, StorageKeys } from '@/core/storage/storageManager';

export function useGameTimers(player, setPlayer, onSavePlayer, onAnnouncement) {
  const onSavePlayerRef = useRef(onSavePlayer);
  const onAnnouncementRef = useRef(onAnnouncement);
  const lastCloudSyncRef = useRef(Date.now());

  useEffect(() => {
    onSavePlayerRef.current = onSavePlayer;
  }, [onSavePlayer]);

  useEffect(() => {
    onAnnouncementRef.current = onAnnouncement;
  }, [onAnnouncement]);

  const hasActiveActivity = Boolean(player?.activeDungeon || player?.activeMine);

  // Arka plan otomatik tamamlama ve aktif zindan savaş zamanlayıcısı (1 sn interval)
  useEffect(() => {
    if (!hasActiveActivity) return;

    const timer = setInterval(() => {
      setPlayer((current) => {
        if (!current) return current;
        let updated = current;
        let stateChanged = false;
        let shouldSyncCloud = false;
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
                onAnnouncementRef.current?.(combatRes.message, 'high');
                shouldSyncCloud = true;
              } else if (combatRes.event === 'completed') {
                onAnnouncementRef.current?.(combatRes.message, 'normal');
                shouldSyncCloud = true;
              } else if (combatRes.leveledUp) {
                onAnnouncementRef.current?.(`🎉 [${updated.name}] Seviye ${combatRes.newLevel} oldu!`, 'normal');
                shouldSyncCloud = true;
              }
            }
          }
        }

        // 2. Maden Süreci & Canlı Cevher Düşme Döngüsü (10 Dakika, 5-10 Maden)
        if (updated.activeMine) {
          const mineState = updated.activeMine;
          const start = mineState.startTime || now;
          const durationMs = (mineState.durationSeconds || MINING_DURATION_SECONDS) * 1000;
          const isTimeUp = now - start >= durationMs;

          // A) Periyodik kazı tiki: süre dolmadan önce aralıklarla 1'er cevher çantaya düşer
          if (!isTimeUp && now >= mineState.nextDropAt && (mineState.minedOres || 0) < (mineState.targetOres || 5)) {
            const tickRes = processMiningTick(updated);
            if (tickRes.changed) {
              updated = tickRes.player;
              stateChanged = true;
            }
          }

          // B) 10 Dakika tamamlandığında sefer bitişi
          if (isTimeUp) {
            const mine = ELVEN_MINES.find((m) => m.id === mineState.mineId) || ELVEN_MINES[0];
            updated = executeMiningCompletion(updated, mine, true);
            stateChanged = true;
            shouldSyncCloud = true;
            onAnnouncementRef.current?.(`✨ [${updated.name}] "${mine.name}" maden kazısını başarıyla tamamladı!`, 'normal');
          }
        }

        if (stateChanged) {
          if (Array.isArray(updated.inventory)) {
            updated = { ...updated, inventory: consolidateInventory(updated.inventory) };
          }
          // Yerel depolamaya anında yaz (veri kaybını sıfır gecikmeyle önle)
          storageManager.setItem(StorageKeys.CHARACTER, updated);

          // Supabase bulut kotasını korumak için sadece dönüm noktalarında veya dakikada 1 kez senkronize et
          if (shouldSyncCloud || now - lastCloudSyncRef.current >= 60000) {
            lastCloudSyncRef.current = now;
            onSavePlayerRef.current?.(updated);
          }
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasActiveActivity, setPlayer]);

  // Zindan Başlatma (Hemen savaş başlar, bekleme yok)
  const startDungeon = (dungeonId) => {
    const dungeon = DUNGEON_GROUPS.find((d) => d.id === dungeonId);
    if (!dungeon || !player) return;

    // Bekleme Süresi Kontrolü (5 Dakika)
    if (player.dungeonCooldownUntil && Date.now() < player.dungeonCooldownUntil) {
      const remainingSecs = Math.ceil((player.dungeonCooldownUntil - Date.now()) / 1000);
      const mins = Math.floor(remainingSecs / 60);
      const secs = remainingSecs % 60;
      onAnnouncement?.(`⚠️ Zindan dinlenme süresindesiniz! Kalan süre: ${mins}dk ${secs}sn`, 'high');
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

  // Zindan Raporunu Kapatma
  const dismissDungeonReport = () => {
    setPlayer((current) => {
      if (!current) return current;
      const updated = { ...current, lastDungeonReport: null };
      onSavePlayer(updated);
      return updated;
    });
  };

  // Madencilik Başlatma (10 Dakika Sabit, 5-10 Cevher Hedefi)
  const startMining = (mineId) => {
    const mine = ELVEN_MINES.find((m) => m.id === mineId);
    if (!mine || !player) return;

    // Hedef Cevher: En az 5, en fazla 10 (Garanti)
    const targetOres = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
    const now = Date.now();
    const durationSeconds = MINING_DURATION_SECONDS; // 600 saniye
    // Cevher düşme aralığı: ~60-90 saniye (örneğin 600 sn / (7 + 1) ≈ 75 sn)
    const intervalSec = Math.max(35, Math.floor(durationSeconds / (targetOres + 1)));

    const initialLog = {
      id: `mine_log_init_${now}`,
      text: `⛏️ "${mine.name}" maden ocağında kazı başladı! (Hedef: ${targetOres} Cevher)`,
      timestamp: now,
      oreName: mine.name,
      count: 0,
    };

    const updated = {
      ...player,
      activeMine: {
        mineId: mine.id,
        name: mine.name,
        durationSeconds,
        startTime: now,
        targetOres,
        minedOres: 0,
        nextDropAt: now + (intervalSec * 1000),
        intervalMs: intervalSec * 1000,
        minGold: mine.minGold,
        maxGold: mine.maxGold,
        oreImage: mine.oreImage,
        cardImage: mine.cardImage,
        sellPrice: mine.sellPrice,
        lore: mine.lore,
        rarity: mine.rarity,
        level: mine.level,
        recentLogs: [initialLog],
      },
    };
    setPlayer(updated);
    onSavePlayer(updated);
    onAnnouncementRef.current?.(`⛏️ [${player.name}] "${mine.name}" madeninde kazıya başladı! (Hedef: ${targetOres} Cevher)`, 'normal');
  };

  // Madencilik İptali (Kazanılan cevherler çantada kalır)
  const cancelMining = () => {
    if (!player || !player.activeMine) return;
    const mined = player.activeMine.minedOres || 0;
    const mineName = player.activeMine.name || 'Maden';
    const updated = { ...player, activeMine: null };
    setPlayer(updated);
    onSavePlayer(updated);
    onAnnouncementRef.current?.(`⛏️ "${mineName}" kazısı durduruldu. Çıkarılan ${mined} adet cevher çantanızda kaldı.`, 'normal');
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
    dismissDungeonReport,
    startMining,
    cancelMining,
    dismissMineReport,
  };
}
