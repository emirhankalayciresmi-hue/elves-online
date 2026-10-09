import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserMinus,
  Search,
  Shield,
  Swords,
  Crown,
  Flame,
  Heart,
  Zap,
  Sparkles,
  Check,
  X,
  Skull,
  Compass,
  Truck,
  Pickaxe,
  Info,
  AlertCircle,
  LogOut,
  Award,
  Clock,
  FastForward,
  CheckCircle2,
  Trophy,
  Play,
  Gem,
  Coins,
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import PlayerBadge from '../../components/PlayerBadge';
import { ALL_MENUS } from '../../config/gameData';
import {
  PARTY_TARGETS,
  PARTY_DISTRIBUTION_MODES,
  LEADERSHIP_ROLES,
  GROUP_DUNGEONS,
  GROUP_MINES,
  getPartySynergyBonus,
  loadPartiesFromStorage,
  savePartiesToStorage,
} from '../../config/partyData';
import { calculateLevelAndExp } from '../../config/dungeonData';
import {
  joinPartyService,
  createPartyService,
  leavePartyService,
  disbandPartyService,
  kickPartyMemberService,
  promoteLeaderService,
  assignLeadershipRoleService,
  toggleMemberReadyService,
} from '../../services/partyService';

export default function PartyView({
  player,
  layoutMode = 'mobile',
  onUpdatePlayer,
  onBroadcast,
  onNavigateTab,
}) {
  const isPC = layoutMode === 'pc';

  // Submenu yönetimi
  const [activeSubmenu, setActiveSubmenu] = useState(() => {
    return player?.party?.id ? 'my_party' : 'find';
  });
  const [parties, setParties] = useState(() => loadPartiesFromStorage());
  const [toast, setToast] = useState(null); // { text: string, type: 'success' | 'error' }

  // Aktif Grup Seferi (Zindan veya Maden)
  const [activeExpedition, setActiveExpedition] = useState(() => {
    try {
      const saved = localStorage.getItem('elves_rpg_active_group_expedition');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!activeExpedition) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeExpedition]);

  // Arama & Filtreleme (Grup Bul)
  const [searchQuery, setSearchQuery] = useState('');
  const [targetCategoryFilter, setTargetCategoryFilter] = useState('all');
  const [onlyEligibleLevel, setOnlyEligibleLevel] = useState(false);
  const [onlyHasSlots, setOnlyHasSlots] = useState(false);

  // Grup Kur Form State
  const [formName, setFormName] = useState('');
  const [formTargetId, setFormTargetId] = useState('group_dungeon');
  const [formMinLevel, setFormMinLevel] = useState(1);
  const [formMaxMembers, setFormMaxMembers] = useState(4);
  const [formDistribution, setFormDistribution] = useState('equal');

  // Modallar
  const [confirmModal, setConfirmModal] = useState(null); // 'leave' | 'disband'
  const [roleModalTarget, setRoleModalTarget] = useState(null); // member object for leadership role assign

  const submenus = useMemo(() => {
    const defaultMenus = ALL_MENUS.find((m) => m.id === 'party')?.submenus || [
      { id: 'my_party', label: 'Grubum' },
      { id: 'group_dungeons', label: 'Grup Zindanları' },
      { id: 'group_mining', label: 'Beraber Maden' },
      { id: 'find', label: 'Grup Bul' },
      { id: 'create', label: 'Grup Kur' },
    ];
    return defaultMenus;
  }, []);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Oyuncunun mevcut grubu
  const currentParty = useMemo(() => {
    if (!player?.party?.id) return null;
    return parties.find((p) => p.id === player.party.id) || null;
  }, [parties, player?.party?.id]);

  const isLeader = useMemo(() => {
    if (!currentParty || !player?.name) return false;
    return currentParty.leader.toLowerCase() === player.name.toLowerCase();
  }, [currentParty, player?.name]);

  const synergyBonus = useMemo(() => {
    const count = currentParty?.members?.length || 1;
    return getPartySynergyBonus(count);
  }, [currentParty?.members?.length]);

  // Filtrelenmiş Gruplar
  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        targetCategoryFilter === 'all' || p.targetCategory === targetCategoryFilter;

      const matchLevel = !onlyEligibleLevel || (player?.level || 1) >= (p.minLevel || 1);

      const matchSlots = !onlyHasSlots || (p.members?.length || 0) < (p.maxMembers || 4);

      return matchSearch && matchCategory && matchLevel && matchSlots;
    });
  }, [parties, searchQuery, targetCategoryFilter, onlyEligibleLevel, onlyHasSlots, player?.level]);

  // Sefer Zamanlama İstatistikleri
  const expeditionElapsed = activeExpedition
    ? Math.floor((currentTime - (activeExpedition.startTime || currentTime)) / 1000)
    : 0;
  const expeditionDuration = activeExpedition?.durationSeconds || 30;
  const expeditionRemaining = Math.max(0, expeditionDuration - expeditionElapsed);
  const expeditionPercent = Math.min(100, Math.floor((expeditionElapsed / expeditionDuration) * 100));
  const isExpeditionFinished = activeExpedition && expeditionRemaining <= 0;

  // --- Eylemler ---

  const handleJoin = (partyId) => {
    const res = joinPartyService(player, partyId, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`🤝 [${player.name}] [${res.party.name}] grubuna katıldı!`, 'normal');
    }
    setActiveSubmenu('my_party');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const res = createPartyService(
      player,
      formName,
      formTargetId,
      formMinLevel,
      formMaxMembers,
      formDistribution,
      parties
    );

    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setParties(res.parties);
    savePartiesToStorage(res.parties);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`🚩 [${player.name}] yeni bir grup kurdu: [${res.party.name}]!`, 'normal');
    }
    setFormName('');
    setActiveSubmenu('my_party');
  };

  const handleLeave = () => {
    const res = leavePartyService(player, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`👋 [${player.name}] [${res.leftPartyName}] grubundan ayrıldı.`, 'normal');
    }
    setConfirmModal(null);
    setActiveSubmenu('find');
  };

  const handleDisband = () => {
    if (!currentParty) return;
    const res = disbandPartyService(player, currentParty.id, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`💥 [${player.name}] liderliğindeki [${currentParty.name}] grubu dağıtıldı.`, 'normal');
    }
    setConfirmModal(null);
    setActiveSubmenu('find');
  };

  const handleKickMember = (targetMemberName) => {
    const res = kickPartyMemberService(player, targetMemberName, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`🚫 [${targetMemberName}] [${currentParty?.name}] grubundan çıkarıldı.`, 'normal');
    }
  };

  const handlePromoteLeader = (targetMemberName) => {
    const res = promoteLeaderService(player, targetMemberName, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(
        `👑 [${currentParty?.name}] grubunda liderlik artık [${targetMemberName}] oyuncusunda!`,
        'normal'
      );
    }
  };

  const handleAssignRole = (targetMemberName, roleId) => {
    const res = assignLeadershipRoleService(player, targetMemberName, roleId, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    showToast(res.message, 'success');
    setRoleModalTarget(null);
  };

  const handleToggleReady = () => {
    const res = toggleMemberReadyService(player, parties);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setParties(res.parties);
    savePartiesToStorage(res.parties);
    showToast(res.message, 'success');
  };

  // Seferi Başlat (Lider)
  const handleLaunchExpedition = () => {
    if (!currentParty) return;
    if (currentParty.targetCategory === 'Maden') {
      setActiveSubmenu('group_mining');
    } else {
      setActiveSubmenu('group_dungeons');
    }
  };

  // Grup Zindanı veya Madeni Başlatma
  const handleStartExpedition = (expedition, partyOverride = null, type = 'dungeon') => {
    const party = partyOverride || currentParty;
    const newExp = {
      ...expedition,
      type,
      startTime: Date.now(),
      partyId: party?.id,
      partyName: party?.name,
      members: party?.members || [],
    };
    localStorage.setItem('elves_rpg_active_group_expedition', JSON.stringify(newExp));
    setActiveExpedition(newExp);
    showToast(`[${expedition.name}] grup seferi başladı! Süre dolduğunda ödüllerinizi toplayın.`, 'success');
    if (onBroadcast) {
      onBroadcast(`⚔️ [${party?.name || 'Grup'}] "${expedition.name}" seferine giriş yaptı!`, 'normal');
    }
  };

  // Hızlı Grup Kurup Seferi Başlatma
  const handleQuickCreateAndStart = (expedition, type = 'dungeon') => {
    const companions = [
      {
        name: 'Aeliana_Sun',
        level: Math.max(player.level || 1, expedition.levelReq || 5),
        class: 'Büyücü',
        isLeader: false,
        hp: 2200,
        maxHp: 2200,
        isReady: true,
        roleId: 'speed_caster',
      },
      {
        name: 'Sylv_Hunter',
        level: Math.max(player.level || 1, expedition.levelReq || 5),
        class: 'Okçu',
        isLeader: false,
        hp: 2600,
        maxHp: 2600,
        isReady: true,
        roleId: 'attacker',
      },
      {
        name: 'Thalas_Shield',
        level: Math.max((player.level || 1) + 1, (expedition.levelReq || 5) + 1),
        class: 'Savaşçı',
        isLeader: false,
        hp: 3800,
        maxHp: 3800,
        isReady: true,
        roleId: 'tank_hp',
      },
    ];

    const myMember = {
      name: player.name || 'Gizemli Elf',
      level: player.level || 1,
      class: player.className || 'Savaşçı',
      isLeader: true,
      hp: 2500,
      maxHp: 2500,
      isReady: true,
      roleId: 'defender',
    };

    const newParty = {
      id: `party_${Date.now()}`,
      name: `${player.name || 'Elf'} Muhafızları`,
      leader: player.name || 'Gizemli Elf',
      targetId: expedition.id,
      targetName: expedition.name,
      targetCategory: type === 'mine' ? 'Maden' : 'Zindan',
      maxMembers: 4,
      minLevel: expedition.levelReq || 1,
      distribution: 'equal',
      isOpen: true,
      createdAt: new Date().toISOString(),
      members: [myMember, ...companions],
    };

    const updatedParties = [newParty, ...parties];
    setParties(updatedParties);
    savePartiesToStorage(updatedParties);

    const updatedPlayer = {
      ...player,
      party: {
        id: newParty.id,
        name: newParty.name,
      },
    };
    if (onUpdatePlayer) onUpdatePlayer(updatedPlayer);

    handleStartExpedition(expedition, newParty, type);
    showToast(`Hızlı grup kuruldu ve [${expedition.name}] seferi başlatıldı!`, 'success');
  };

  // Sefer Hızlandırma
  const handleFastForwardExpedition = () => {
    if (!activeExpedition) return;
    const finishedExp = {
      ...activeExpedition,
      startTime: Date.now() - (activeExpedition.durationSeconds + 1) * 1000,
    };
    localStorage.setItem('elves_rpg_active_group_expedition', JSON.stringify(finishedExp));
    setActiveExpedition(finishedExp);
    showToast('Sefer süresi tamamlandı! Ödülleri toplayabilirsiniz.', 'success');
  };

  // Sefer Ödüllerini Toplama
  const handleClaimExpedition = () => {
    if (!activeExpedition) return;
    const exp = activeExpedition;
    const synergy = synergyBonus || { expMultiplier: 1.15, goldMultiplier: 1.1 };
    const expToAdd = Math.round((exp.expReward || 10000) * (synergy.expMultiplier || 1.15));
    const goldToAdd = Math.round((exp.goldReward || 5000) * (synergy.goldMultiplier || 1.1));
    const crystalsToAdd = exp.crystalReward || 20;

    const levelRes = calculateLevelAndExp(
      player.level || 1,
      player.exp || 0,
      expToAdd,
      player.gold || 0,
      goldToAdd
    );

    const updatedInventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
    if (exp.rareDrop) {
      updatedInventory.push({
        id: `drop_${Date.now()}`,
        instanceId: `inst_${Date.now()}`,
        name: exp.rareDrop,
        type: 'material',
        rarity: 'rare',
        desc: `[${exp.name}] grup zindanında kazanılan kadim ödül.`,
        image: exp.image || '/assets/items/warrior_helmet.svg',
      });
    } else if (exp.oreYield) {
      updatedInventory.push({
        id: `ore_${Date.now()}`,
        instanceId: `inst_${Date.now()}`,
        name: exp.oreYield,
        type: 'material',
        rarity: 'epic',
        desc: `[${exp.name}] ortak maden seferinde çıkarılan cevher.`,
        image: '/assets/ores/ore_2.svg',
      });
    }

    const updatedPlayer = {
      ...player,
      level: levelRes.level,
      exp: levelRes.exp,
      maxExp: levelRes.maxExp,
      gold: levelRes.gold,
      crystals: (player.crystals || 0) + crystalsToAdd,
      inventory: updatedInventory,
    };

    if (onUpdatePlayer) onUpdatePlayer(updatedPlayer);

    const partyName = currentParty?.name || 'Kadim Grup';
    if (onBroadcast) {
      onBroadcast(
        `🏆 [${partyName}] "${exp.name}" ${exp.type === 'mine' ? 'ortak kazısını' : 'grup zindanını'} zaferle tamamladı! [${player.name}] +${expToAdd.toLocaleString('tr-TR')} EXP, +${goldToAdd.toLocaleString('tr-TR')} Altın ve +${crystalsToAdd} Ruh Kristali kazandı!`,
        'normal'
      );
    }

    localStorage.removeItem('elves_rpg_active_group_expedition');
    setActiveExpedition(null);
    showToast(`"${exp.name}" ödülleri toplandı!`, 'success');
  };

  // İkon Çözücüler
  const getTargetIcon = (category) => {
    switch (category) {
      case 'Zindan':
        return Skull;
      case 'Boss':
        return Flame;
      case 'Maden':
        return Pickaxe;
      case 'Kervan':
        return Truck;
      default:
        return Compass;
    }
  };

  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 'attacker':
        return Swords;
      case 'defender':
        return Shield;
      case 'tank_hp':
        return Heart;
      case 'speed_caster':
        return Zap;
      case 'blocker':
        return Sparkles;
      default:
        return Shield;
    }
  };

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Toast Bildirimi */}
      {toast && (
        <div
          className={`fixed top-16 right-4 z-50 p-3 rounded-lg border shadow-xl flex items-center gap-2 text-xs font-mono animate-fadeIn ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Alt Menü Seçimi */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* -------------------- 1. SEKME: GRUBUM -------------------- */}
      {activeSubmenu === 'my_party' && (
        <div className="space-y-4">
          {!currentParty ? (
            <OrnateFrame className="p-8 text-center space-y-4 max-w-lg mx-auto">
              <Users className="w-12 h-12 text-amber-400/30 mx-auto" />
              <h3 className="font-cinzel text-base font-bold text-amber-200">
                Şu Anda Bir Grupta Değilsiniz
              </h3>
              <p className="text-xs text-slate-400 font-cormorant">
                Mevcut açık gruplardan birine katılabilir, grup zindanlarına veya beraber maden seferlerine katılabilirsiniz.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <ElvenButton
                  size="md"
                  icon={Search}
                  onClick={() => setActiveSubmenu('find')}
                >
                  Grup Bul
                </ElvenButton>
                <ElvenButton
                  size="md"
                  variant="secondary"
                  icon={Users}
                  onClick={() => setActiveSubmenu('create')}
                >
                  Grup Kur
                </ElvenButton>
              </div>
            </OrnateFrame>
          ) : (
            <div className="space-y-4">
              {/* Grup Başlık Kartı & Bilgileri */}
              <OrnateFrame className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-cinzel text-lg sm:text-xl font-bold text-amber-200 tracking-wider flex items-center gap-2">
                        <span>{currentParty.name}</span>
                        {isLeader && (
                          <span className="text-[10px] font-cinzel text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" /> Grup Liderisiniz
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-cormorant text-slate-300">
                      <span className="flex items-center gap-1 text-amber-300 font-cinzel text-[11px] bg-black/40 px-2 py-0.5 rounded border border-amber-500/20">
                        {React.createElement(getTargetIcon(currentParty.targetCategory), {
                          className: 'w-3.5 h-3.5 text-amber-400 inline',
                        })}
                        {currentParty.targetName}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span>
                        Dağıtım:{' '}
                        <strong className="text-slate-200">
                          {PARTY_DISTRIBUTION_MODES.find((d) => d.id === currentParty.distribution)?.name || 'Eşit Paylaşım'}
                        </strong>
                      </span>
                      <span className="text-slate-400">|</span>
                      <span>
                        Lider: <PlayerBadge name={currentParty.leader} isMobile={!isPC} />
                      </span>
                    </div>
                  </div>

                  {/* Sağ Taraf: Sefer Butonu ve Hızlı Eylemler */}
                  <div className="flex items-center gap-2">
                    {isLeader && (
                      <ElvenButton
                        size="sm"
                        icon={Swords}
                        onClick={handleLaunchExpedition}
                      >
                        Seferi Başlat
                      </ElvenButton>
                    )}
                    <button
                      onClick={handleToggleReady}
                      className="px-3 py-1.5 rounded text-xs font-cinzel border transition-all flex items-center gap-1.5 bg-emerald-950/50 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Hazırım
                    </button>
                  </div>
                </div>

                {/* Sinerji Bonusu & Kapasite Çubuğu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Sol: Sinerji Buffı */}
                  <div className="bg-black/50 border border-amber-500/20 rounded p-3 flex items-center gap-3">
                    <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cinzel text-xs font-bold text-amber-200">
                          Grup Sinerjisi ({synergyBonus.title})
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
                          {synergyBonus.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-cormorant mt-0.5">
                        {synergyBonus.description}
                      </p>
                    </div>
                  </div>

                  {/* Sağ: Grup Kapasitesi ve Dağılma Seçeneği */}
                  <div className="bg-black/50 border border-white/5 rounded p-3 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-cinzel">Grup Doluluğu</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {currentParty.members?.length || 0} / {currentParty.maxMembers || 4} Üye
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                          style={{
                            width: `${((currentParty.members?.length || 0) / (currentParty.maxMembers || 4)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="pl-3 border-l border-white/10">
                      {isLeader ? (
                        <button
                          onClick={() => setConfirmModal('disband')}
                          className="px-2.5 py-1.5 rounded text-[11px] font-cinzel text-red-300 bg-red-950/50 border border-red-500/30 hover:bg-red-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3 text-red-400" />
                          Dağıt
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmModal('leave')}
                          className="px-2.5 py-1.5 rounded text-[11px] font-cinzel text-red-300 bg-red-950/50 border border-red-500/30 hover:bg-red-900/50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3 h-3 text-red-400" />
                          Ayrıl
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </OrnateFrame>

              {/* Metin2 Liderlik Rol Dağıtımı Bilgi Paneli */}
              <OrnateFrame className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Metin2 Liderlik Rol Dağıtımı
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isLeader ? '⚡ Rolleri Yönetme Yetkiniz Var' : '🛡️ Lider Tarafından Belirlenir'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-cormorant">
                  {LEADERSHIP_ROLES.map((role) => {
                    const RoleIcon = getRoleIcon(role.id);
                    const assignedMember = currentParty.members?.find((m) => m.roleId === role.id);

                    return (
                      <div
                        key={role.id}
                        className={`p-2 rounded border space-y-1 transition-all ${
                          assignedMember
                            ? `${role.bg} ${role.border} shadow-[0_0_8px_rgba(0,0,0,0.5)]`
                            : 'bg-black/40 border-white/5 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-cinzel text-[10px] font-bold text-slate-200 flex items-center gap-1">
                            <RoleIcon className="w-3 h-3" style={{ color: role.color }} />
                            {role.shortName}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-300 font-mono font-semibold">
                          {role.bonusText}
                        </p>
                        <div className="text-[10px] text-slate-400 truncate">
                          {assignedMember ? (
                            <span className="text-emerald-300 font-semibold font-cinzel">
                              ✓ {assignedMember.name}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Atanmadı</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </OrnateFrame>

              {/* Grup Üyeleri Listesi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Grup Üyeleri ({currentParty.members?.length || 0})
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Tüm üyelerin can ve hazır olma durumu canlıdır
                  </span>
                </div>

                <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-2.5'}`}>
                  {currentParty.members?.map((member) => {
                    const isSelf = member.name.toLowerCase() === (player?.name || '').toLowerCase();
                    const assignedRole = LEADERSHIP_ROLES.find((r) => r.id === member.roleId);
                    const RoleIcon = assignedRole ? getRoleIcon(assignedRole.id) : null;

                    return (
                      <OrnateFrame
                        key={member.name}
                        className={`p-3.5 space-y-2.5 transition-all ${
                          isSelf ? 'border-amber-500/50 bg-amber-950/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full border border-elven-gold/40 bg-black/60 flex items-center justify-center font-cinzel font-bold text-sm text-amber-200">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              {member.isLeader && (
                                <div className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-amber-500 text-black shadow-md">
                                  <Crown className="w-3 h-3" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <PlayerBadge name={member.name} isMobile={!isPC} />
                                {isSelf && (
                                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/30">
                                    SEN
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-cormorant mt-0.5">
                                <span className="text-amber-400 font-mono font-bold">Lv. {member.level}</span>
                                <span>•</span>
                                <span>{member.class}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span
                              className={`text-[10px] font-cinzel px-2 py-0.5 rounded border flex items-center gap-1 font-semibold ${
                                member.isReady
                                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                                  : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                              }`}
                            >
                              {member.isReady ? <Check className="w-3 h-3 text-emerald-400" /> : <Info className="w-3 h-3 text-amber-400" />}
                              {member.isReady ? 'Hazır' : 'Beklemede'}
                            </span>
                          </div>
                        </div>

                        {/* Can (HP) Barı */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-red-400 inline" /> Yaşam Puanı (HP)
                            </span>
                            <span className="text-emerald-400">
                              {member.hp} / {member.maxHp}
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="bg-gradient-to-r from-red-600 to-emerald-500 h-full transition-all duration-300"
                              style={{ width: `${Math.min(100, (member.hp / member.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Atanmış Liderlik Rolü */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            {assignedRole ? (
                              <span
                                className={`text-[10px] font-cinzel px-2 py-0.5 rounded border flex items-center gap-1 font-semibold ${assignedRole.bg} ${assignedRole.border}`}
                                style={{ color: assignedRole.color }}
                              >
                                {RoleIcon && <RoleIcon className="w-3 h-3" />}
                                {assignedRole.name} ({assignedRole.bonusText})
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-cormorant italic">
                                Liderlik Rolü: Atanmadı
                              </span>
                            )}
                          </div>

                          {isLeader && !member.isLeader && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setRoleModalTarget(member)}
                                title="Liderlik Rolü Ata"
                                className="px-2 py-1 rounded text-[10px] font-cinzel text-amber-300 bg-amber-950/60 border border-amber-500/30 hover:bg-amber-900/40 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Award className="w-3 h-3 text-amber-400" /> Rol Ata
                              </button>

                              <button
                                onClick={() => handlePromoteLeader(member.name)}
                                title="Lider Yap"
                                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <Crown className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleKickMember(member.name)}
                                title="Gruptan At"
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </OrnateFrame>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- 2. SEKME: GRUP ZİNDANLARI (BERABER GRUP ZİNDANI YAPMA) -------------------- */}
      {activeSubmenu === 'group_dungeons' && (
        <div className="space-y-4">
          {/* Üst Bilgilendirme */}
          <OrnateFrame className="p-4 bg-gradient-to-r from-black/90 via-purple-950/30 to-black/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-elven-inner">
                  <Skull className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-cinzel font-bold text-base text-amber-100 gold-text-glow">
                    Grup Zindanları & Akın Seferleri
                  </h2>
                  <p className="text-xs text-slate-300 font-cormorant">
                    Zindandan taşınan zorlu akınlar. Grup arkadaşlarınızla birlikte ejderhaları ve kadim titanları dize getirin.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentParty ? (
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded">
                    🛡️ Grup: <strong>{currentParty.name}</strong> ({currentParty.members?.length || 0} Üye)
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded">
                    ⚡ Tek Başınasınız (Hızlı Grup Seçeneği Mevcut)
                  </span>
                )}
              </div>
            </div>
          </OrnateFrame>

          {/* Aktif Sefer Varsa Canlı Takip Paneli */}
          {activeExpedition && activeExpedition.type === 'dungeon' && (
            <OrnateFrame className="p-4 border-purple-500/50 bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <div>
                    <span className="text-[10px] font-mono text-purple-300 uppercase block">CANLI GRUP SEFERİ</span>
                    <h3 className="font-cinzel font-bold text-sm text-amber-100">
                      {activeExpedition.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpeditionFinished ? (
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/50 animate-pulse">
                      ✓ ZİNDAN TEMİZLENDİ!
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-amber-300 bg-black/60 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Kalan Süre: {Math.floor(expeditionRemaining / 60)}:{(expeditionRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>

              {/* İlerleme Çubuğu */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Akın İlerlemesi</span>
                  <span className="text-purple-300 font-bold">%{expeditionPercent}</span>
                </div>
                <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-purple-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(3, expeditionPercent)}%` }}
                  />
                </div>
              </div>

              {/* Sefer Butonları */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {!isExpeditionFinished && (
                  <ElvenButton
                    size="sm"
                    variant="secondary"
                    icon={FastForward}
                    onClick={handleFastForwardExpedition}
                  >
                    Hızlı Bitir (Test)
                  </ElvenButton>
                )}

                {isExpeditionFinished && (
                  <ElvenButton
                    size="sm"
                    icon={Trophy}
                    onClick={handleClaimExpedition}
                  >
                    Zafer Ganimetlerini Topla
                  </ElvenButton>
                )}
              </div>
            </OrnateFrame>
          )}

          {/* Grup Zindanları Kart Listesi */}
          <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-3'}`}>
            {GROUP_DUNGEONS.map((dungeon) => {
              const isEligible = (player?.level || 1) >= dungeon.levelReq;
              const isBusy = activeExpedition !== null;

              return (
                <OrnateFrame key={dungeon.id} className="p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
                        Lv. {dungeon.levelReq}+ ({dungeon.minMembers}-{dungeon.maxMembers} Kişilik)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> {dungeon.durationSeconds} Sn
                      </span>
                    </div>

                    <h4 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Skull className="w-4 h-4 text-purple-400" />
                      {dungeon.name}
                    </h4>

                    <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
                      {dungeon.desc}
                    </p>

                    <div className="p-2 rounded bg-black/40 border border-white/5 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between text-emerald-400">
                        <span>Ödül:</span>
                        <span>{dungeon.expReward.toLocaleString('tr-TR')} EXP • {dungeon.goldReward.toLocaleString('tr-TR')} Altın</span>
                      </div>
                      <div className="flex justify-between text-cyan-300">
                        <span>Nadir Düşen:</span>
                        <span className="font-bold text-amber-300">✨ {dungeon.rareDrop}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-cormorant">
                        💡 Öneri: {dungeon.roleHints}
                      </div>
                    </div>
                  </div>

                  {/* Zindana Giriş Butonları */}
                  <div className="pt-2 border-t border-white/5">
                    {isBusy ? (
                      <button
                        disabled
                        className="w-full py-1.5 text-xs text-slate-500 bg-white/5 rounded border border-white/5 cursor-not-allowed font-cinzel"
                      >
                        Sefer Zaten Sürüyor
                      </button>
                    ) : !isEligible ? (
                      <button
                        disabled
                        className="w-full py-1.5 text-xs text-amber-500/60 bg-amber-950/20 rounded border border-amber-900/30 cursor-not-allowed font-cinzel"
                      >
                        Seviye Yetersiz (Min. Lv. {dungeon.levelReq})
                      </button>
                    ) : currentParty ? (
                      <ElvenButton
                        size="sm"
                        icon={Swords}
                        fullWidth
                        onClick={() => handleStartExpedition(dungeon, currentParty, 'dungeon')}
                      >
                        Beraber Zindana Gir (Akını Başlat)
                      </ElvenButton>
                    ) : (
                      <ElvenButton
                        size="sm"
                        variant="secondary"
                        icon={UserPlus}
                        fullWidth
                        onClick={() => handleQuickCreateAndStart(dungeon, 'dungeon')}
                      >
                        Hızlı Grup Kur & Zindana Gir
                      </ElvenButton>
                    )}
                  </div>
                </OrnateFrame>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------- 3. SEKME: BERABER MADEN KAZMA -------------------- */}
      {activeSubmenu === 'group_mining' && (
        <div className="space-y-4">
          {/* Üst Bilgilendirme */}
          <OrnateFrame className="p-4 bg-gradient-to-r from-black/90 via-amber-950/30 to-black/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-elven-inner">
                  <Pickaxe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-cinzel font-bold text-base text-amber-100 gold-text-glow">
                    Beraber Maden Kazma (Ortak Kazı Seferleri)
                  </h2>
                  <p className="text-xs text-slate-300 font-cormorant">
                    Maden ocaklarına grup halinde inin. Grup sinerjisi sayesinde +%25 daha fazla cevher ve yüksek tecrübe kazanın!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded">
                  ✨ Kazı Sinerjisi: <strong>+%25 Ekstra Cevher Verimi</strong>
                </span>
              </div>
            </div>
          </OrnateFrame>

          {/* Aktif Maden Kazısı Varsa Canlı Takip Paneli */}
          {activeExpedition && activeExpedition.type === 'mine' && (
            <OrnateFrame className="p-4 border-amber-500/50 bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Pickaxe className="w-5 h-5 text-amber-400 animate-bounce" />
                  <div>
                    <span className="text-[10px] font-mono text-amber-300 uppercase block">CANLI ORTAK KAZI</span>
                    <h3 className="font-cinzel font-bold text-sm text-amber-100">
                      {activeExpedition.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpeditionFinished ? (
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/50 animate-pulse">
                      ✓ DAMAR TAMAMEN KAZILDI!
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-amber-300 bg-black/60 px-2.5 py-1 rounded border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Kalan Süre: {Math.floor(expeditionRemaining / 60)}:{(expeditionRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>

              {/* İlerleme Çubuğu */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Kazı İlerlemesi</span>
                  <span className="text-amber-300 font-bold">%{expeditionPercent}</span>
                </div>
                <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-amber-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(3, expeditionPercent)}%` }}
                  />
                </div>
              </div>

              {/* Sefer Butonları */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {!isExpeditionFinished && (
                  <ElvenButton
                    size="sm"
                    variant="secondary"
                    icon={FastForward}
                    onClick={handleFastForwardExpedition}
                  >
                    Hızlı Bitir (Test)
                  </ElvenButton>
                )}

                {isExpeditionFinished && (
                  <ElvenButton
                    size="sm"
                    icon={Trophy}
                    onClick={handleClaimExpedition}
                  >
                    Cevherleri ve Altınları Topla
                  </ElvenButton>
                )}
              </div>
            </OrnateFrame>
          )}

          {/* Ortak Madenler Kart Listesi */}
          <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-3' : 'space-y-3'}`}>
            {GROUP_MINES.map((mine) => {
              const isEligible = (player?.level || 1) >= mine.levelReq;
              const isBusy = activeExpedition !== null;

              return (
                <OrnateFrame key={mine.id} className="p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                        Lv. {mine.levelReq}+ ({mine.minMembers}+ Madenci)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {mine.rarity}
                      </span>
                    </div>

                    <h4 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <Pickaxe className="w-4 h-4 text-amber-400" />
                      {mine.name}
                    </h4>

                    <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
                      {mine.desc}
                    </p>

                    <div className="p-2 rounded bg-black/40 border border-white/5 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between text-emerald-400">
                        <span>Temel Verim:</span>
                        <span>{mine.expReward.toLocaleString('tr-TR')} EXP</span>
                      </div>
                      <div className="flex justify-between text-amber-300 font-bold">
                        <span>Cevher Kazancı:</span>
                        <span>⛏️ {mine.oreYield}</span>
                      </div>
                      <div className="flex justify-between text-cyan-300">
                        <span>Ruh Kristali:</span>
                        <span>+{mine.crystalReward} Kristal</span>
                      </div>
                    </div>
                  </div>

                  {/* Kazıyı Başlat Butonları */}
                  <div className="pt-2 border-t border-white/5">
                    {isBusy ? (
                      <button
                        disabled
                        className="w-full py-1.5 text-xs text-slate-500 bg-white/5 rounded border border-white/5 cursor-not-allowed font-cinzel"
                      >
                        Kazı Zaten Sürüyor
                      </button>
                    ) : !isEligible ? (
                      <button
                        disabled
                        className="w-full py-1.5 text-xs text-amber-500/60 bg-amber-950/20 rounded border border-amber-900/30 cursor-not-allowed font-cinzel"
                      >
                        Seviye Yetersiz (Min. Lv. {mine.levelReq})
                      </button>
                    ) : currentParty ? (
                      <ElvenButton
                        size="sm"
                        icon={Pickaxe}
                        fullWidth
                        onClick={() => handleStartExpedition(mine, currentParty, 'mine')}
                      >
                        Birlikte Kazıyı Başlat
                      </ElvenButton>
                    ) : (
                      <ElvenButton
                        size="sm"
                        variant="secondary"
                        icon={UserPlus}
                        fullWidth
                        onClick={() => handleQuickCreateAndStart(mine, 'mine')}
                      >
                        Hızlı Madenci Grubu Kur & Başlat
                      </ElvenButton>
                    )}
                  </div>
                </OrnateFrame>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------- 4. SEKME: GRUP BUL -------------------- */}
      {activeSubmenu === 'find' && (
        <div className="space-y-4">
          {/* Arama & Filtre Paneli */}
          <OrnateFrame className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Grup adı, lider veya sefer hedefi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-black/60 border border-amber-500/30 rounded focus:border-amber-400 focus:outline-none text-slate-100 placeholder:text-slate-500 font-cinzel"
                />
              </div>

              <select
                value={targetCategoryFilter}
                onChange={(e) => setTargetCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-black/80 border border-amber-500/30 rounded text-amber-200 font-cinzel focus:outline-none cursor-pointer"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="Zindan">Zindan Seferleri</option>
                <option value="Boss">Boss Avı</option>
                <option value="Maden">Maden Kazısı</option>
                <option value="Kervan">Kervan Muhafızlığı</option>
                <option value="Genel">Serbest Macera</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-200">
                  <input
                    type="checkbox"
                    checked={onlyEligibleLevel}
                    onChange={(e) => setOnlyEligibleLevel(e.target.checked)}
                    className="rounded border-amber-500/40 bg-black/60 text-amber-500 focus:ring-0"
                  />
                  <span>Sadece Seviyeme Uygunlar</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-200">
                  <input
                    type="checkbox"
                    checked={onlyHasSlots}
                    onChange={(e) => setOnlyHasSlots(e.target.checked)}
                    className="rounded border-amber-500/40 bg-black/60 text-amber-500 focus:ring-0"
                  />
                  <span>Sadece Boş Yeri Olanlar</span>
                </label>
              </div>

              <span>{filteredParties.length} Grup Listelendi</span>
            </div>
          </OrnateFrame>

          {/* Grup Listesi */}
          {filteredParties.length === 0 ? (
            <OrnateFrame className="p-8 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-cinzel text-sm text-slate-400">
                Arama kriterlerinize uygun aktif grup bulunamadı.
              </p>
              <ElvenButton
                size="sm"
                icon={Users}
                onClick={() => setActiveSubmenu('create')}
              >
                Kendi Grubunuzu Kurun
              </ElvenButton>
            </OrnateFrame>
          ) : (
            <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}>
              {filteredParties.map((p) => {
                const isMemberOfThis = p.id === player?.party?.id;
                const isFull = (p.members?.length || 0) >= (p.maxMembers || 4);
                const isLevelSufficient = (player?.level || 1) >= (p.minLevel || 1);
                const TargetIcon = getTargetIcon(p.targetCategory);
                const distMeta = PARTY_DISTRIBUTION_MODES.find((d) => d.id === p.distribution);

                return (
                  <OrnateFrame
                    key={p.id}
                    className={`p-3.5 flex flex-col justify-between transition-all ${
                      isMemberOfThis ? 'border-amber-400/80 bg-amber-950/20 shadow-elven-inner' : ''
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-cinzel font-semibold px-2 py-0.5 rounded border border-amber-500/30 bg-amber-950/40 text-amber-300 flex items-center gap-1">
                            <TargetIcon className="w-3 h-3 text-amber-400" />
                            {p.targetCategory}
                          </span>
                          <span className="text-[10px] font-mono text-slate-300">
                            Min. Lv. {p.minLevel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                              isFull
                                ? 'bg-red-950/70 border-red-500/40 text-red-300'
                                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                            }`}
                          >
                            {p.members?.length || 0} / {p.maxMembers || 4} Üye
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-cinzel font-bold text-sm text-slate-100 tracking-wide flex items-center justify-between">
                          <span>{p.name}</span>
                          {isMemberOfThis && (
                            <span className="text-[9px] font-cinzel text-emerald-400 uppercase tracking-widest bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-500/40">
                              Grubunuz
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-amber-300/80 font-cinzel mt-0.5 flex items-center gap-1">
                          <TargetIcon className="w-3.5 h-3.5 text-amber-400 inline" />
                          {p.targetName}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px] font-cormorant flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400 inline" /> Lider:
                          </span>
                          <PlayerBadge name={p.leader} isMobile={!isPC} />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-cormorant">
                          <span className="text-slate-400">Dağıtım Modu:</span>
                          <span className="text-slate-200">{distMeta?.name || 'Eşit Paylaşım'}</span>
                        </div>
                      </div>

                      {/* Üyeler Slot Göstergesi */}
                      <div className="flex items-center gap-1 pt-1">
                        {Array.from({ length: p.maxMembers || 4 }).map((_, idx) => {
                          const member = p.members?.[idx];
                          return (
                            <div
                              key={idx}
                              title={member ? `${member.name} (Lv. ${member.level} ${member.class})` : 'Boş Slot'}
                              className={`flex-1 h-1.5 rounded-full transition-all ${
                                member
                                  ? member.isLeader
                                    ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                                    : 'bg-emerald-400'
                                  : 'bg-slate-800 border border-white/5'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5">
                      {isMemberOfThis ? (
                        <ElvenButton
                          size="sm"
                          variant="secondary"
                          icon={Users}
                          fullWidth
                          onClick={() => setActiveSubmenu('my_party')}
                        >
                          Grubuma Git
                        </ElvenButton>
                      ) : player?.party?.id ? (
                        <button
                          disabled
                          className="w-full py-1.5 text-xs text-slate-500 bg-white/5 rounded border border-white/5 cursor-not-allowed font-cinzel"
                        >
                          Zaten Bir Gruptasınız
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          className="w-full py-1.5 text-xs text-red-400/60 bg-red-950/20 rounded border border-red-900/30 cursor-not-allowed font-cinzel"
                        >
                          Grup Dolu
                        </button>
                      ) : !isLevelSufficient ? (
                        <button
                          disabled
                          className="w-full py-1.5 text-xs text-amber-500/60 bg-amber-950/20 rounded border border-amber-900/30 cursor-not-allowed font-cinzel"
                        >
                          Seviye Yetersiz (Min Lv. {p.minLevel})
                        </button>
                      ) : (
                        <ElvenButton
                          size="sm"
                          icon={UserPlus}
                          fullWidth
                          onClick={() => handleJoin(p.id)}
                        >
                          Gruba Katıl
                        </ElvenButton>
                      )}
                    </div>
                  </OrnateFrame>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------- 5. SEKME: GRUP KUR -------------------- */}
      {activeSubmenu === 'create' && (
        <div className="max-w-2xl mx-auto space-y-4">
          {player?.party?.id ? (
            <OrnateFrame className="p-6 text-center space-y-4">
              <Shield className="w-12 h-12 text-amber-400/60 mx-auto" />
              <h3 className="font-cinzel text-base font-bold text-amber-200">
                Zaten Aktif Bir Grubunuz Var
              </h3>
              <p className="text-xs text-slate-300 font-cormorant max-w-md mx-auto">
                Şu anda <strong className="text-amber-300">[{player.party.name}]</strong> grubunun bir üyesisiniz.
                Yeni bir grup kurmak için önce mevcut grubunuzdan ayrılmanız gerekmektedir.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <ElvenButton
                  size="md"
                  icon={Users}
                  onClick={() => setActiveSubmenu('my_party')}
                >
                  Mevcut Grubuma Git
                </ElvenButton>
              </div>
            </OrnateFrame>
          ) : (
            <OrnateFrame className="p-5 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-cinzel text-base font-bold text-amber-200 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  Yeni Grup Kur & Liderlik Et
                </h3>
                <p className="text-xs text-slate-400 font-cormorant mt-0.5">
                  Kendi grubunuzu kurarak sefere önderlik edin ve üyelerinize Metin2 liderlik rolleri tayin edin.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-cinzel mb-1">
                    Grup Adı:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kadim Ejderha Avcıları"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded focus:border-amber-400 focus:outline-none text-slate-100 font-cinzel text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-cinzel mb-1">
                    Grup Sefer Hedefi:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PARTY_TARGETS.map((target) => {
                      const TargetIcon = getTargetIcon(target.category);
                      const isSelected = formTargetId === target.id;

                      return (
                        <div
                          key={target.id}
                          onClick={() => setFormTargetId(target.id)}
                          className={`p-2.5 rounded border cursor-pointer transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-amber-950/40 border-amber-400 shadow-elven-inner'
                              : 'bg-black/40 border-white/5 hover:border-amber-500/30'
                          }`}
                        >
                          <div className="p-1.5 rounded bg-black/60 border border-amber-500/20 text-amber-400 mt-0.5">
                            <TargetIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-cinzel text-xs font-bold text-slate-200 block">
                              {target.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-cormorant leading-tight block">
                              {target.description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-cinzel mb-1">
                      Minimum Katılım Seviyesi:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formMinLevel}
                      onChange={(e) => setFormMinLevel(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-black/60 border border-amber-500/30 rounded focus:border-amber-400 focus:outline-none text-slate-100 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-cinzel mb-1">
                      Maksimum Üye Kapasitesi:
                    </label>
                    <select
                      value={formMaxMembers}
                      onChange={(e) => setFormMaxMembers(parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 bg-black/80 border border-amber-500/30 rounded text-amber-200 font-cinzel focus:outline-none cursor-pointer"
                    >
                      <option value={2}>2 Kişilik Grup (İkili İttifak)</option>
                      <option value={3}>3 Kişilik Grup (Üçlü Birlik)</option>
                      <option value={4}>4 Kişilik Grup (Tam Teşekküllü Akın)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-cinzel mb-1">
                    Ganimet & EXP Dağıtım Kuralı:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PARTY_DISTRIBUTION_MODES.map((mode) => {
                      const isSelected = formDistribution === mode.id;
                      return (
                        <div
                          key={mode.id}
                          onClick={() => setFormDistribution(mode.id)}
                          className={`p-2.5 rounded border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-950/40 border-amber-400'
                              : 'bg-black/40 border-white/5 hover:border-amber-500/30'
                          }`}
                        >
                          <span className="font-cinzel text-xs font-bold text-slate-200 block">
                            {mode.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-cormorant leading-tight block mt-0.5">
                            {mode.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <ElvenButton
                    size="lg"
                    icon={Users}
                    fullWidth
                    type="submit"
                  >
                    Grubu Oluştur & Lider Ol (Ücretsiz)
                  </ElvenButton>
                </div>
              </form>
            </OrnateFrame>
          )}
        </div>
      )}

      {/* -------------------- METİN2 LİDERLİK ROL ATAMA MODALI -------------------- */}
      {roleModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <OrnateFrame className="w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-sm font-bold text-amber-200">
                  Liderlik Rolü Ata: [{roleModalTarget.name}]
                </h3>
              </div>
              <button
                onClick={() => setRoleModalTarget(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-cormorant">
              Seçtiğiniz savaşçıya partiye liderlik kudretinizi aktaran özel bir rol tayin edin. Her rol aynı anda
              yalnızca tek bir grup arkadaşında aktif olabilir.
            </p>

            <div className="space-y-2">
              {LEADERSHIP_ROLES.map((role) => {
                const RoleIcon = getRoleIcon(role.id);
                const isCurrentRole = roleModalTarget.roleId === role.id;
                const assignedOther = currentParty?.members?.find(
                  (m) => m.roleId === role.id && m.name !== roleModalTarget.name
                );

                return (
                  <div
                    key={role.id}
                    onClick={() => handleAssignRole(roleModalTarget.name, role.id)}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isCurrentRole
                        ? `${role.bg} ${role.border} ring-1 ring-amber-400/50`
                        : 'bg-black/50 border-white/5 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-black/60 border border-white/10">
                        <RoleIcon className="w-4 h-4" style={{ color: role.color }} />
                      </div>
                      <div>
                        <h5 className="font-cinzel text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{role.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: role.color }}>
                            {role.bonusText}
                          </span>
                        </h5>
                        <p className="text-[11px] text-slate-400 font-cormorant">{role.description}</p>
                      </div>
                    </div>

                    <div>
                      {isCurrentRole ? (
                        <span className="text-[10px] font-cinzel text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                          Aktif
                        </span>
                      ) : assignedOther ? (
                        <span className="text-[9px] font-mono text-slate-500">
                          ({assignedOther.name})
                        </span>
                      ) : (
                        <span className="text-[10px] font-cinzel text-amber-300/80 hover:text-amber-200">
                          Seç →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {roleModalTarget.roleId && (
                <button
                  type="button"
                  onClick={() => handleAssignRole(roleModalTarget.name, null)}
                  className="w-full py-2 text-xs font-cinzel text-red-300 bg-red-950/40 border border-red-500/30 rounded hover:bg-red-900/40 transition-colors cursor-pointer"
                >
                  Rolü Tamamen Kaldır
                </button>
              )}
            </div>
          </OrnateFrame>
        </div>
      )}

      {/* -------------------- ONAY MODALLARI (AYRILMA / DAĞITMA) -------------------- */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <OrnateFrame className="w-full max-w-sm p-5 space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h4 className="font-cinzel text-sm font-bold text-red-200 uppercase tracking-wider">
              {confirmModal === 'disband' ? 'Grubu Dağıt' : 'Gruptan Ayrıl'}
            </h4>
            <p className="text-xs text-slate-300 font-cormorant">
              {confirmModal === 'disband'
                ? 'Lideri olduğunuz bu grubu tamamen dağıtmak istediğinizden emin misiniz? Tüm üyeler gruptan çıkarılacaktır.'
                : 'Mevcut grubunuzdan ayrılmak istediğinizden emin misiniz?'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-1.5 rounded text-xs font-cinzel text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={confirmModal === 'disband' ? handleDisband : handleLeave}
                className="px-4 py-1.5 rounded text-xs font-cinzel text-red-200 bg-red-950 border border-red-500/60 hover:bg-red-900 transition-colors cursor-pointer"
              >
                Evet, Onaylıyorum
              </button>
            </div>
          </OrnateFrame>
        </div>
      )}
    </div>
  );
}
