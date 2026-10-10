import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import HeaderStatusBar from '@/components/HeaderStatusBar';
import BottomNav from '@/components/BottomNav';
import DesktopSidebar from '@/components/DesktopSidebar';
import MobileMenuDrawer from '@/components/MobileMenuDrawer';

// Portal & Onboarding (Code-Split)
const LandingPortal = lazy(() => import('@/views/LandingPortal/LandingPortal'));
const LayoutModeSelect = lazy(() => import('@/views/Onboarding/LayoutModeSelect'));
const KingdomSelect = lazy(() => import('@/views/Onboarding/KingdomSelect'));
const ClassSelect = lazy(() => import('@/views/Onboarding/ClassSelect'));
const CharacterFinalize = lazy(() => import('@/views/Onboarding/CharacterFinalize'));

// Tab Views (Code-Split)
const CharacterTab = lazy(() => import('@/views/Tabs/CharacterTab'));
const InventoryTab = lazy(() => import('@/views/Tabs/InventoryTab'));
const ChatView = lazy(() => import('@/views/Tabs/ChatView'));
const QuestsTab = lazy(() => import('@/views/Tabs/QuestsTab'));
const PartyView = lazy(() => import('@/views/Tabs/PartyView'));
const GuildView = lazy(() => import('@/views/Tabs/GuildView'));
const DungeonView = lazy(() => import('@/views/Tabs/DungeonView'));
const MineView = lazy(() => import('@/views/Tabs/MineView'));
const BossView = lazy(() => import('@/views/Tabs/BossView'));
const KingdomTab = lazy(() => import('@/views/Tabs/KingdomTab'));
const NpcView = lazy(() => import('@/views/Tabs/NpcView'));
const MarketView = lazy(() => import('@/views/Tabs/MarketView'));
const SettingsTab = lazy(() => import('@/views/Tabs/SettingsTab'));

import { ASSETS } from '@/core/config/assets';
import { ensurePlayerQuestState } from '@/domain/questEngine';
import { getRequiredExp } from '@/core/config/dungeonData';
import {
  executeDungeonCompletion,
  executeBossVictory,
  equipItem,
  unequipItem,
  discardOrSellItem,
  allocateStatPoint,
  resetStatPoints,
  consolidateInventory,
  swapInventorySlots,
} from '@/domain/gameEngine';
import { useGameTimers } from '@/hooks/useGameTimers';
import MiniChatDock from '@/components/MiniChatDock';
import {
  loadChatHistory,
  saveChatHistory,
  createSystemAnnouncement,
  fetchCloudChatMessages,
  sendChatMessageToCloud,
  subscribeToRealtimeChat,
} from '@/services/chatService';
import { PlayerProfileProvider } from '@/context/PlayerProfileContext';
import { loadPartiesFromStorage, savePartiesToStorage } from '@/core/config/partyData';
import { invitePlayerToPartyService } from '@/services/partyService';
import { onAuthStateChange, signOutUser, getCurrentUser } from '@/services/authService';
import {
  saveCharacterToCloud,
  fetchCharacterByUserId,
  debouncedSyncPlayerToCloud,
  updatePlayerHeartbeat,
} from '@/services/cloudCharacterService';
import { storageManager, StorageKeys } from '@/core/storage/storageManager';

const CHAR_STORAGE_KEY = StorageKeys.CHARACTER;
const MODE_STORAGE_KEY = StorageKeys.LAYOUT_MODE;
const RELEASE_VERSION_KEY = StorageKeys.RELEASE_VERSION;

// Demo verilerini ve eski sahte karakterleri bir defaya mahsus temizleme
try {
  if (storageManager.getItem(RELEASE_VERSION_KEY) !== 'beta_live_v1') {
    storageManager.removeItem(CHAR_STORAGE_KEY);
    storageManager.removeItem(StorageKeys.CHAT);
    storageManager.removeItem(StorageKeys.PARTIES);
    storageManager.removeItem(StorageKeys.GUILDS);
    storageManager.removeItem(StorageKeys.MARKET_STALLS);
    storageManager.removeItem(StorageKeys.MARKET_HISTORY);
    storageManager.removeItem(StorageKeys.GROUP_EXPEDITION);
    storageManager.setItem(RELEASE_VERSION_KEY, 'beta_live_v1');
  }
} catch (e) {
  console.error('Storage migration error:', e);
}

export default function App() {
  // Portal vs Game view: 'portal' | 'game'
  const [viewMode, setViewMode] = useState('portal');

  // Authenticated Supabase User
  const [currentUser, setCurrentUser] = useState(null);

  // Layout mode: 'mobile' | 'pc' | null
  const [layoutMode, setLayoutMode] = useState(() => {
    return storageManager.getItem(MODE_STORAGE_KEY, null);
  });

  // Saved player state (wrapped with guaranteed quest and character state)
  const [player, setPlayer] = useState(() => {
    try {
      const saved = storageManager.getItem(CHAR_STORAGE_KEY, null);
      if (!saved) return null;
      const parsed = typeof saved === 'object' ? saved : JSON.parse(saved);
      const basePlayer = {
        level: 1,
        exp: 0,
        maxExp: getRequiredExp(parsed?.level || 1),
        gold: 500,
        crystals: 50,
        energy: 100,
        hp: 500,
        maxHp: 500,
        mana: 500,
        maxMana: 500,
        strength: 0,
        agility: 0,
        intelligence: 0,
        statPoints: 0,
        allocatedStats: { hp: 0, str: 0, agi: 0, int: 0 },
        hpPotions: 50,
        manaPotions: 50,
        autoPotionThreshold: 50,
        dungeonCooldownUntil: 0,
        newDungeonDrops: [],
        activeDungeon: null,
        activeMine: null,
        inventory: [],
        equipped: {},
        ...parsed,
      };
      if (Array.isArray(basePlayer.inventory)) {
        basePlayer.inventory = consolidateInventory(basePlayer.inventory);
      }
      if (!parsed.allocatedStats) {
        basePlayer.allocatedStats = { hp: 0, str: 0, agi: 0, int: 0 };
        basePlayer.maxHp = 500;
        basePlayer.hp = Math.min(500, basePlayer.hp || 500);
        basePlayer.maxMana = 500;
        basePlayer.mana = Math.min(500, basePlayer.mana || 500);
        basePlayer.statPoints = Math.max(0, ((parsed?.level || 1) - 1) * 6);
      }
      return ensurePlayerQuestState(basePlayer);
    } catch {
      return null;
    }
  });

  // Onboarding Wizard state
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedKingdom, setSelectedKingdom] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGender, setSelectedGender] = useState('female');

  // Active Tab & Mobile Drawer state
  const [activeTab, setActiveTab] = useState('character');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Storage and cloud save helper
  const savePlayerToStorage = useCallback(
    (updated) => {
      if (!updated) return;
      const cleanPlayer = Array.isArray(updated.inventory)
        ? { ...updated, inventory: consolidateInventory(updated.inventory) }
        : updated;
      storageManager.setItem(CHAR_STORAGE_KEY, cleanPlayer);
      debouncedSyncPlayerToCloud(cleanPlayer, currentUser?.id);
    },
    [currentUser]
  );

  // Supabase Auth Listener & Cloud Character Fetch
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        fetchCharacterByUserId(user.id).then((cloudChar) => {
          if (cloudChar) {
            const ensured = ensurePlayerQuestState(cloudChar);
            setPlayer(ensured);
            storageManager.setItem(CHAR_STORAGE_KEY, ensured);
          }
        });
      }
    });

    const unsubscribeAuth = onAuthStateChange((event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        fetchCharacterByUserId(user.id).then((cloudChar) => {
          if (cloudChar) {
            const ensured = ensurePlayerQuestState(cloudChar);
            setPlayer(ensured);
            storageManager.setItem(CHAR_STORAGE_KEY, ensured);
            setViewMode('game');
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Global Sağ Tık Engeli (Tüm oyunda tarayıcının varsayılan menüsünü ve sayfa atlamasını engeller)
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleGlobalContextMenu, { capture: true });
    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu, { capture: true });
    };
  }, []);

  // Chat messages state (multiplayer & realtime ready)
  const [chatMessages, setChatMessages] = useState(() => loadChatHistory());

  // Cloud Chat Fetch & Realtime Subscription
  useEffect(() => {
    fetchCloudChatMessages(50).then((cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        setChatMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMsgs = cloudMsgs.filter((m) => !existingIds.has(m.id));
          if (newMsgs.length === 0) return prev;
          const merged = [...prev, ...newMsgs];
          saveChatHistory(merged);
          return merged;
        });
      }
    });

    const unsubscribeChat = subscribeToRealtimeChat((newMsg) => {
      setChatMessages((prev) => {
        // Prevent duplicate echoes (both by exact id, or by identical sender + text within 6 seconds)
        const isDuplicate = prev.some((m) =>
          m.id === newMsg.id ||
          (m.sender === newMsg.sender && m.text === newMsg.text && Math.abs((m.timestamp || 0) - (newMsg.timestamp || 0)) < 6000)
        );
        if (isDuplicate) {
          return prev.map((m) =>
            m.sender === newMsg.sender && m.text === newMsg.text && Math.abs((m.timestamp || 0) - (newMsg.timestamp || 0)) < 6000
              ? { ...m, id: newMsg.id }
              : m
          );
        }
        const updated = [...prev, newMsg];
        saveChatHistory(updated);
        return updated;
      });
    });

    return () => {
      unsubscribeChat();
    };
  }, []);

  // Canlı Oyuncu Kalp Atışı (Online durumunu Supabase'de güncel tutar)
  useEffect(() => {
    if (viewMode === 'game' && player?.name) {
      updatePlayerHeartbeat(player.name);
      const heartbeatInterval = setInterval(() => {
        updatePlayerHeartbeat(player.name);
      }, 60000); // Her 60 saniyede bir
      return () => clearInterval(heartbeatInterval);
    }
  }, [viewMode, player?.name]);

  // Global tarayıcı sağ tık menüsünü engelle (Özel oyun içi MMORPG sağ tık menüleri için)
  useEffect(() => {
    const handleGlobalContextMenu = (e) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleGlobalContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleGlobalContextMenu);
    };
  }, []);

  const handleSendMessage = useCallback((newMsg) => {
    setChatMessages((prev) => {
      const updated = [...prev, newMsg];
      saveChatHistory(updated);
      return updated;
    });
    // Send to Supabase cloud
    sendChatMessageToCloud(newMsg);
  }, []);

  const broadcastSystemAnnouncement = useCallback((text, priority = 'normal') => {
    const annMsg = createSystemAnnouncement(text, priority);
    setChatMessages((prev) => {
      const updated = [...prev, annMsg];
      saveChatHistory(updated);
      return updated;
    });
    sendChatMessageToCloud(annMsg);
  }, []);

  // Profil Kartı Fısıltı & Sosyal Eylemler
  const [whisperPrefill, setWhisperPrefill] = useState('');

  const handleWhisperPlayer = useCallback((targetName) => {
    setActiveTab('chat');
    setWhisperPrefill(`@${targetName} `);
  }, []);

  const handleInviteParty = useCallback((targetName) => {
    if (!player?.party?.id) {
      broadcastSystemAnnouncement(
        `⚠️ [${player?.name || 'Kahraman'}] henüz bir gruba dahil değil. Davet gönderebilmek için önce 'Grup' sekmesinden bir grup kurmalısınız.`,
        'normal'
      );
      return;
    }
    const parties = loadPartiesFromStorage();
    const res = invitePlayerToPartyService(player, targetName, parties);
    if (!res.success) {
      broadcastSystemAnnouncement(`⚠️ ${res.error}`, 'normal');
      return;
    }
    savePartiesToStorage(res.parties);
    broadcastSystemAnnouncement(
      `🤝 [${player?.name || 'Kahraman'}] tarafından [${targetName}] oyuncusuna iletilen grup daveti kabul edildi! [${targetName}] takıma katıldı.`,
      'normal'
    );
  }, [player, broadcastSystemAnnouncement]);

  const handleInviteGuild = useCallback((targetName) => {
    if (!player?.guild?.name) {
      broadcastSystemAnnouncement(`⚠️ Bir loncanız olmadan davet gönderemezsiniz.`);
      return;
    }
    broadcastSystemAnnouncement(`🛡️ [${player?.name || 'Kahraman'}] tarafından [${targetName}] oyuncusuna [${player.guild.name}] loncası için katılım daveti gönderildi!`);
  }, [player?.name, player?.guild?.name, broadcastSystemAnnouncement]);

  const handleChallengeDuel = useCallback((targetName) => {
    broadcastSystemAnnouncement(`⚔️ KADİM DÜELLO ÇAĞRISI: [${player?.name || 'Kahraman'}], [${targetName}] kahramanını savaş alanına davet etti!`, 'high');
  }, [player?.name, broadcastSystemAnnouncement]);

  // Hook for 30m Dungeon and 10m Mining background timers & actions
  const {
    startDungeon,
    cancelDungeon,
    dismissDungeonReport,
    startMining,
    cancelMining,
    dismissMineReport,
  } = useGameTimers(player, setPlayer, savePlayerToStorage, broadcastSystemAnnouncement);

  // Envanter ziyaret edildiğinde yeni eşya parlamalarını temizle
  const handleClearNewDrops = useCallback(() => {
    setPlayer((prev) => {
      if (!prev || !prev.newDungeonDrops?.length) return prev;
      const updated = { ...prev, newDungeonDrops: [] };
      savePlayerToStorage(updated);
      return updated;
    });
  }, [savePlayerToStorage]);

  // Change layout mode
  const handleChangeLayoutMode = (mode) => {
    setLayoutMode(mode);
    storageManager.setItem(MODE_STORAGE_KEY, mode);
  };

  // Save character
  const handleSavePlayer = (characterName) => {
    const chosenPortrait =
      selectedClass?.portrait || ASSETS.classes[selectedClass.id]?.[selectedGender] || null;

    const newPlayer = {
      name: characterName,
      kingdomId: selectedKingdom.id,
      kingdomName: selectedKingdom.name,
      classId: selectedClass.id,
      className: selectedClass.name,
      gender: selectedGender,
      classImage: chosenPortrait,
      level: 1,
      exp: 0,
      maxExp: getRequiredExp(1),
      gold: 500,
      crystals: 50,
      energy: 100,
      hp: 500,
      maxHp: 500,
      mana: 500,
      maxMana: 500,
      strength: 0,
      agility: 0,
      intelligence: 0,
      statPoints: 0,
      allocatedStats: { hp: 0, str: 0, agi: 0, int: 0 },
      hpPotions: 50,
      manaPotions: 50,
      autoPotionThreshold: 50,
      dungeonCooldownUntil: 0,
      newDungeonDrops: [],
      activeDungeon: null,
      activeMine: null,
      createdAt: new Date().toISOString(),
    };
    const playerWithQuests = ensurePlayerQuestState(newPlayer);
    setPlayer(playerWithQuests);
    savePlayerToStorage(playerWithQuests);
    saveCharacterToCloud(playerWithQuests, currentUser?.id);
  };

  // Stat Allocation handlers
  const handleAllocateStat = (statKey, amount = 1) => {
    const updated = allocateStatPoint(player, statKey, amount);
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  const handleResetStats = () => {
    const updated = resetStatPoints(player);
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  // Reset character
  const handleResetPlayer = () => {
    storageManager.removeItem(CHAR_STORAGE_KEY);
    setPlayer(null);
    setSelectedKingdom(null);
    setSelectedClass(null);
    setOnboardingStep(1);
    setActiveTab('character');
    setIsDrawerOpen(false);
  };

  // Manual claim dungeon
  const handleClaimDungeon = () => {
    if (!player?.activeDungeon) return null;
    const updated = executeDungeonCompletion(player, player.activeDungeon, false);
    setPlayer(updated);
    savePlayerToStorage(updated);
    return updated;
  };

  // Equipment handlers
  const handleEquipItem = (item) => {
    const updated = equipItem(player, item);
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  const handleUnequipItem = (slotKey) => {
    const updated = unequipItem(player, slotKey);
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  const handleDiscardItem = (instanceId, sellReward = 0, amountToSell = 'all') => {
    const updated = discardOrSellItem(player, instanceId, sellReward, amountToSell);
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  const handleSwapInventorySlots = (fromIndex, toIndex) => {
    if (!player) return;
    const updated = swapInventorySlots(player, fromIndex, toIndex);
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  // Boss victory & cooldown
  const handleBossVictory = (boss, rewards) => {
    const updated = executeBossVictory(player, boss, rewards);
    setPlayer(updated);
    savePlayerToStorage(updated);
    broadcastSystemAnnouncement(
      `⚔️ [${player?.name || 'Kahraman'}] Kadim Boss "${boss.name}" (Lv. ${boss.level}) karşısında büyük zafer kazandı!`,
      boss.category === 'world' ? 'high' : 'normal'
    );
  };

  const handleDismissBatchNotice = () => {
    if (!player?.questState) return;
    const updated = {
      ...player,
      questState: {
        ...player.questState,
        dailyBatchJustCompleted: false,
      },
    };
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  const isPC = layoutMode === 'pc';

  // 1. If user is in Portal mode, render LandingPortal
  if (viewMode === 'portal') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#040709] flex items-center justify-center font-cinzel text-amber-300">Kadim Diyar Yükleniyor...</div>}>
        <LandingPortal
          onEnterGame={() => {
            setViewMode('game');
            window.history.pushState(null, '', '/oyun');
          }}
          currentUser={currentUser}
          savedCharacter={player}
          onSignOut={async () => {
            await signOutUser();
            setCurrentUser(null);
          }}
        />
      </Suspense>
    );
  }

  // 2. If in Game mode but layout mode is not yet chosen, show LayoutModeSelect
  if (!layoutMode) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#040709] flex items-center justify-center font-cinzel text-amber-300">Yükleniyor...</div>}>
        <div className="min-h-screen bg-[#040709] text-slate-100 flex items-center justify-center p-4 relative overflow-x-hidden">
          <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-[#060a0d] to-[#030507]" />
          <div className="relative z-10 w-full">
            <LayoutModeSelect onSelectMode={handleChangeLayoutMode} />
          </div>
        </div>
      </Suspense>
    );
  }

  // Active tab views (Code-split with Suspense)
  const renderActiveView = () => {
    let viewContent = null;
    switch (activeTab) {
      case 'character':
        viewContent = (
          <CharacterTab
            player={player}
            layoutMode={layoutMode}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onDiscardItem={handleDiscardItem}
            onAllocateStat={handleAllocateStat}
            onResetStats={handleResetStats}
          />
        );
        break;
      case 'inventory':
        viewContent = (
          <InventoryTab
            player={player}
            layoutMode={layoutMode}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onDiscardItem={handleDiscardItem}
            onClearNewDrops={handleClearNewDrops}
            onSwapSlots={handleSwapInventorySlots}
          />
        );
        break;
      case 'chat':
        viewContent = (
          <ChatView
            player={player}
            layoutMode={layoutMode}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            whisperPrefill={whisperPrefill}
          />
        );
        break;
      case 'quests':
        viewContent = (
          <QuestsTab
            player={player}
            layoutMode={layoutMode}
            onDismissBatchNotice={handleDismissBatchNotice}
          />
        );
        break;
      case 'party':
        viewContent = (
          <PartyView
            player={player}
            layoutMode={layoutMode}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
            onBroadcast={broadcastSystemAnnouncement}
          />
        );
        break;
      case 'guild':
        viewContent = (
          <GuildView
            player={player}
            layoutMode={layoutMode}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
            onBroadcast={broadcastSystemAnnouncement}
          />
        );
        break;
      case 'dungeon':
        viewContent = (
          <DungeonView
            player={player}
            layoutMode={layoutMode}
            onStartDungeon={startDungeon}
            onClaimDungeon={handleClaimDungeon}
            onCancelDungeon={cancelDungeon}
            onDismissReport={dismissDungeonReport}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
          />
        );
        break;
      case 'mine':
        viewContent = (
          <MineView
            player={player}
            layoutMode={layoutMode}
            onStartMining={startMining}
            onCancelMining={cancelMining}
            onDismissMineReport={dismissMineReport}
          />
        );
        break;
      case 'boss':
        viewContent = (
          <BossView
            player={player}
            layoutMode={layoutMode}
            onBossVictory={handleBossVictory}
          />
        );
        break;
      case 'kingdom':
        viewContent = <KingdomTab player={player} layoutMode={layoutMode} />;
        break;
      case 'npc':
        viewContent = (
          <NpcView
            player={player}
            layoutMode={layoutMode}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
          />
        );
        break;
      case 'market':
        viewContent = (
          <MarketView
            player={player}
            layoutMode={layoutMode}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
            onBroadcast={broadcastSystemAnnouncement}
          />
        );
        break;
      case 'settings':
        viewContent = (
          <SettingsTab
            player={player}
            layoutMode={layoutMode}
            onChangeLayoutMode={handleChangeLayoutMode}
            onResetPlayer={handleResetPlayer}
            onOpenPortal={() => {
              setViewMode('portal');
              window.history.pushState(null, '', '/anasayfa');
            }}
          />
        );
        break;
      default:
        viewContent = (
          <CharacterTab
            player={player}
            layoutMode={layoutMode}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onDiscardItem={handleDiscardItem}
            onAllocateStat={handleAllocateStat}
            onResetStats={handleResetStats}
          />
        );
    }
    return (
      <Suspense fallback={<div className="p-8 text-center font-cinzel text-amber-300 animate-pulse">Kadim Elf Diyarı Yükleniyor...</div>}>
        {viewContent}
      </Suspense>
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#040709] text-slate-100 relative overflow-x-hidden flex ${
        isPC ? 'w-full' : 'justify-center items-stretch'
      }`}
    >
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-[#060a0d] to-[#030507]" />

      {/* Decorative side lines (mobile mode only) */}
      {!isPC && (
        <>
          <div className="hidden lg:flex fixed left-8 top-12 flex-col items-center gap-4 opacity-40 select-none pointer-events-none">
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
            <span className="font-cinzel text-xs tracking-[0.4em] [writing-mode:vertical-lr] text-amber-200/60 uppercase">
              Kadim Elfler Dünyası
            </span>
            <div className="w-2 h-2 rotate-45 border border-amber-400/60" />
          </div>

          <div className="hidden lg:flex fixed right-8 top-12 flex-col items-center gap-4 opacity-40 select-none pointer-events-none">
            <div className="w-px h-32 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
            <span className="font-cinzel text-xs tracking-[0.4em] [writing-mode:vertical-lr] text-amber-200/60 uppercase">
              Asil Hanedanlar
            </span>
            <div className="w-2 h-2 rotate-45 border border-amber-400/60" />
          </div>
        </>
      )}

      {/* Main Container - Full Screen Width on PC, Max 480px on Mobile */}
      <PlayerProfileProvider
        activePlayer={player}
        onWhisper={handleWhisperPlayer}
        onInviteParty={handleInviteParty}
        onInviteGuild={handleInviteGuild}
        onChallengeDuel={handleChallengeDuel}
      >
        <main
          className={`min-h-screen bg-[#070c0e] relative flex flex-col z-10 transition-all duration-300 ${
            isPC
              ? 'w-full border-none shadow-none'
              : 'w-full max-w-[480px] shadow-[0_0_60px_rgba(0,0,0,0.9)] border-x border-elven-gold/25'
          }`}
        >
        {player ? (
          <>
            {/* Top Status Bar */}
            <HeaderStatusBar
              player={player}
              onResetPlayer={handleResetPlayer}
              layoutMode={layoutMode}
              onNavigateTab={setActiveTab}
              onUpdatePlayer={(updated) => {
                setPlayer(updated);
                savePlayerToStorage(updated);
              }}
              onOpenPortal={() => {
                setViewMode('portal');
                window.history.pushState(null, '', '/anasayfa');
              }}
            />

            {/* PC Mode: Full Width Sidebar + Content + Mini Chat Dock */}
            {isPC ? (
              <div className="flex-1 flex gap-6 p-4 sm:p-6 overflow-y-auto w-full relative">
                <DesktopSidebar
                  player={player}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                />
                <div className="flex-1 min-w-0 w-full overflow-y-auto pb-16">
                  {renderActiveView()}
                </div>

                {/* PC Mini Chat Dock (Metin2 in-game chat) */}
                <MiniChatDock
                  player={player}
                  chatMessages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onOpenFullChat={() => setActiveTab('chat')}
                />
              </div>
            ) : (
              /* Mobile Mode: Bottom Nav + Drawer */
              <>
                <div className="flex-1 p-3.5 overflow-y-auto">{renderActiveView()}</div>
                <BottomNav
                  player={player}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onOpenDrawer={() => setIsDrawerOpen(true)}
                />
                <MobileMenuDrawer
                  player={player}
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                />
              </>
            )}
          </>
        ) : (
          /* Onboarding Wizard */
          <div className={`flex-1 flex flex-col overflow-y-auto ${isPC ? 'w-full p-4 sm:p-8' : 'p-4'}`}>
            <div className="text-center pt-2 pb-3 border-b border-amber-500/20 mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setViewMode('portal');
                  window.history.pushState(null, '', '/anasayfa');
                }}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                ← Portala Dön
              </button>
              <h2 className="font-cinzel text-xs uppercase tracking-[0.3em] text-amber-400/80">
                Kadim Elven Çağı
              </h2>
              <button
                type="button"
                onClick={() => setLayoutMode(null)}
                className="text-[10px] font-mono text-amber-400/60 hover:text-amber-300 underline cursor-pointer"
              >
                Modu Değiştir
              </button>
            </div>

            <Suspense fallback={<div className="p-8 text-center font-cinzel text-amber-300 animate-pulse">Karakter Hazırlanıyor...</div>}>
              {onboardingStep === 1 && (
                <KingdomSelect
                  selectedKingdom={selectedKingdom}
                  onSelectKingdom={setSelectedKingdom}
                  onNext={() => setOnboardingStep(2)}
                  layoutMode={layoutMode}
                />
              )}

              {onboardingStep === 2 && (
                <ClassSelect
                  selectedClass={selectedClass}
                  onSelectClass={setSelectedClass}
                  selectedGender={selectedGender}
                  onSelectGender={setSelectedGender}
                  onNext={() => setOnboardingStep(3)}
                  onBack={() => setOnboardingStep(1)}
                  layoutMode={layoutMode}
                />
              )}

              {onboardingStep === 3 && (
                <CharacterFinalize
                  kingdom={selectedKingdom}
                  characterClass={selectedClass}
                  onComplete={handleSavePlayer}
                  onBack={() => setOnboardingStep(2)}
                />
              )}
            </Suspense>
          </div>
        )}
        </main>
      </PlayerProfileProvider>
    </div>
  );
}
