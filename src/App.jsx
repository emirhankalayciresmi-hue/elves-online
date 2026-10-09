import React, { useState, useCallback } from 'react';
import HeaderStatusBar from './components/HeaderStatusBar';
import BottomNav from './components/BottomNav';
import DesktopSidebar from './components/DesktopSidebar';
import MobileMenuDrawer from './components/MobileMenuDrawer';

// Onboarding
import LayoutModeSelect from './views/Onboarding/LayoutModeSelect';
import KingdomSelect from './views/Onboarding/KingdomSelect';
import ClassSelect from './views/Onboarding/ClassSelect';
import CharacterFinalize from './views/Onboarding/CharacterFinalize';

// Tab Views
import CharacterTab from './views/Tabs/CharacterTab';
import InventoryTab from './views/Tabs/InventoryTab';
import ChatView from './views/Tabs/ChatView';
import QuestsTab from './views/Tabs/QuestsTab';
import PartyView from './views/Tabs/PartyView';
import GuildView from './views/Tabs/GuildView';
import DungeonView from './views/Tabs/DungeonView';
import MineView from './views/Tabs/MineView';
import BossView from './views/Tabs/BossView';
import KingdomTab from './views/Tabs/KingdomTab';
import NpcView from './views/Tabs/NpcView';
import MarketView from './views/Tabs/MarketView';
import SettingsTab from './views/Tabs/SettingsTab';

import { ASSETS } from './config/assets';
import { ensurePlayerQuestState } from './config/questData';
import { getRequiredExp } from './config/dungeonData';
import {
  executeDungeonCompletion,
  executeBossVictory,
  equipItem,
  unequipItem,
  discardOrSellItem,
  testProgressQuest,
  allocateStatPoint,
  resetStatPoints,
} from './services/gameEngine';
import { useGameTimers } from './hooks/useGameTimers';
import MiniChatDock from './components/MiniChatDock';
import { loadChatHistory, saveChatHistory, createSystemAnnouncement } from './services/chatService';
import { PlayerProfileProvider } from './context/PlayerProfileContext';
import { loadPartiesFromStorage, savePartiesToStorage } from './config/partyData';
import { invitePlayerToPartyService } from './services/partyService';

const CHAR_STORAGE_KEY = 'elves_rpg_character_data';
const MODE_STORAGE_KEY = 'elves_rpg_layout_mode';

export default function App() {
  // Layout mode: 'mobile' | 'pc' | null
  const [layoutMode, setLayoutMode] = useState(() => {
    try {
      return localStorage.getItem(MODE_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Saved player state (wrapped with guaranteed quest and character state)
  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAR_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
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
      // Eski kayıtlardan kalan 1500 HP veya eksik stat puanlarını standardize et:
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

  // Storage save helper
  const savePlayerToStorage = useCallback((updated) => {
    if (!updated) return;
    try {
      localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, []);

  // Chat messages state (multiplayer ready)
  const [chatMessages, setChatMessages] = useState(() => loadChatHistory());

  const handleSendMessage = useCallback((newMsg) => {
    setChatMessages((prev) => {
      const updated = [...prev, newMsg];
      saveChatHistory(updated);
      return updated;
    });
  }, []);

  const broadcastSystemAnnouncement = useCallback((text, priority = 'normal') => {
    const annMsg = createSystemAnnouncement(text, priority);
    setChatMessages((prev) => {
      const updated = [...prev, annMsg];
      saveChatHistory(updated);
      return updated;
    });
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
    fastForwardDungeon,
    resetDungeonCooldown,
    dismissDungeonReport,
    startMining,
    cancelMining,
    fastForwardMining,
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
    localStorage.setItem(MODE_STORAGE_KEY, mode);
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

  // Reset character (for testing)
  const handleResetPlayer = () => {
    localStorage.removeItem(CHAR_STORAGE_KEY);
    setPlayer(null);
    setSelectedKingdom(null);
    setSelectedClass(null);
    setOnboardingStep(1);
    setActiveTab('character');
    setIsDrawerOpen(false);
  };

  // Manual claim dungeon (if player manually claims)
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

  const handleDiscardItem = (instanceId, sellReward = 0) => {
    const updated = discardOrSellItem(player, instanceId, sellReward);
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

  const handleResetBossCooldown = (category) => {
    if (!player) return;
    const currentCooldowns = player.bossCooldowns || {};
    const updated = {
      ...player,
      bossCooldowns: {
        ...currentCooldowns,
        [category]: 0,
      },
    };
    setPlayer(updated);
    savePlayerToStorage(updated);
  };

  // Quest test simulator & batch celebration dismiss
  const handleTestProgressQuest = (type, id) => {
    const updated = testProgressQuest(player, type, id);
    setPlayer(updated);
    savePlayerToStorage(updated);
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

  // 1. If layout mode is not yet chosen, show LayoutModeSelect
  if (!layoutMode) {
    return (
      <div className="min-h-screen bg-[#040709] text-slate-100 flex items-center justify-center p-4 relative overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-[#060a0d] to-[#030507]" />
        <div className="relative z-10 w-full">
          <LayoutModeSelect onSelectMode={handleChangeLayoutMode} />
        </div>
      </div>
    );
  }

  // Active tab views
  const renderActiveView = () => {
    switch (activeTab) {
      case 'character':
        return (
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
      case 'inventory':
        return (
          <InventoryTab
            player={player}
            layoutMode={layoutMode}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onDiscardItem={handleDiscardItem}
            onClearNewDrops={handleClearNewDrops}
          />
        );
      case 'chat':
        return (
          <ChatView
            player={player}
            layoutMode={layoutMode}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            whisperPrefill={whisperPrefill}
          />
        );
      case 'quests':
        return (
          <QuestsTab
            player={player}
            layoutMode={layoutMode}
            onTestProgressQuest={handleTestProgressQuest}
            onDismissBatchNotice={handleDismissBatchNotice}
          />
        );
      case 'party':
        return (
          <PartyView
            player={player}
            layoutMode={layoutMode}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
            onBroadcast={broadcastSystemAnnouncement}
            onNavigateTab={setActiveTab}
          />
        );
      case 'guild':
        return (
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
      case 'dungeon':
        return (
          <DungeonView
            player={player}
            layoutMode={layoutMode}
            onStartDungeon={startDungeon}
            onClaimDungeon={handleClaimDungeon}
            onCancelDungeon={cancelDungeon}
            onFastForwardDungeon={(act) => {
              if (act === 'reset_cooldown') {
                resetDungeonCooldown();
              } else {
                fastForwardDungeon();
              }
            }}
            onDismissReport={dismissDungeonReport}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
          />
        );
      case 'mine':
        return (
          <MineView
            player={player}
            layoutMode={layoutMode}
            onStartMining={startMining}
            onCancelMining={cancelMining}
            onFastForwardMining={fastForwardMining}
            onDismissMineReport={dismissMineReport}
          />
        );
      case 'boss':
        return (
          <BossView
            player={player}
            layoutMode={layoutMode}
            onBossVictory={handleBossVictory}
            onResetBossCooldown={handleResetBossCooldown}
          />
        );
      case 'kingdom':
        return <KingdomTab player={player} layoutMode={layoutMode} />;
      case 'npc':
        return (
          <NpcView
            player={player}
            layoutMode={layoutMode}
            onUpdatePlayer={(updated) => {
              setPlayer(updated);
              savePlayerToStorage(updated);
            }}
          />
        );
      case 'market':
        return (
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
      case 'settings':
        return (
          <SettingsTab
            player={player}
            layoutMode={layoutMode}
            onChangeLayoutMode={handleChangeLayoutMode}
            onResetPlayer={handleResetPlayer}
          />
        );
      default:
        return (
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
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Mod: {isPC ? 'PC Geniş Ekran' : 'Mobil'}
              </span>
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
          </div>
        )}
        </main>
      </PlayerProfileProvider>
    </div>
  );
}
