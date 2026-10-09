import React, { useState, useMemo } from 'react';
import {
  Shield,
  Award,
  Users,
  PlusCircle,
  Search,
  Sparkles,
  Flame,
  Heart,
  BookOpen,
  Zap,
  Crown,
  Coins,
  LogOut,
  Check,
  AlertCircle,
  Info,
  ChevronRight,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import PlayerBadge from '../../components/PlayerBadge';
import { ALL_MENUS } from '../../config/gameData';
import {
  GUILD_FLAGS,
  GUILD_SKILLS,
  GUILD_CREATION_COST,
  GUILD_CREATION_MIN_LEVEL,
  loadGuildsFromStorage,
  saveGuildsToStorage,
} from '../../config/guildData';
import {
  joinGuildService,
  createGuildService,
  leaveGuildService,
  donateGoldService,
  donateExpService,
  upgradeSkillService,
} from '../../services/guildService';

export default function GuildView({
  player,
  layoutMode = 'mobile',
  onUpdatePlayer,
  onBroadcast,
}) {
  const [activeSubmenu, setActiveSubmenu] = useState(() => {
    return player?.guild?.id ? 'my_guild' : 'find';
  });

  const [guilds, setGuilds] = useState(() => loadGuildsFromStorage());
  const [searchQuery, setSearchQuery] = useState('');
  const [kingdomFilter, setKingdomFilter] = useState('all');
  const [toast, setToast] = useState(null); // { type: 'success'|'error', text: string }
  const [showConfirmModal, setShowConfirmModal] = useState(null); // 'leave' | 'disband'

  // Lonca Kurma Form State
  const [formName, setFormName] = useState('');
  const [formFlagId, setFormFlagId] = useState(1);
  const [formMotto, setFormMotto] = useState('');
  const [formNotice, setFormNotice] = useState('');
  const [formMinLevel, setFormMinLevel] = useState(1);
  const [formIsOpen, setFormIsOpen] = useState(true);

  const isPC = layoutMode === 'pc';
  const submenus = ALL_MENUS.find((m) => m.id === 'guild')?.submenus || [
    { id: 'find', label: 'Lonca Bul' },
    { id: 'create', label: 'Lonca Kur' },
    { id: 'my_guild', label: 'Loncam' },
  ];

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Oyuncunun mevcut loncası
  const currentGuild = useMemo(() => {
    if (!player?.guild?.id) return null;
    return guilds.find((g) => g.id === player.guild.id) || null;
  }, [guilds, player?.guild?.id]);

  // Seçili bayrak meta verisi
  const selectedFlagMeta = useMemo(() => {
    return GUILD_FLAGS.find((f) => f.id === formFlagId) || GUILD_FLAGS[0];
  }, [formFlagId]);

  // Filtrelenmiş loncalar
  const filteredGuilds = useMemo(() => {
    return guilds.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.motto && g.motto.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchKingdom = kingdomFilter === 'all' || g.kingdom.toLowerCase() === kingdomFilter.toLowerCase();
      return matchSearch && matchKingdom;
    });
  }, [guilds, searchQuery, kingdomFilter]);

  // Eylemler
  const handleJoinGuild = (guildId) => {
    const res = joinGuildService(player, guildId, guilds);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setGuilds(res.guilds);
    saveGuildsToStorage(res.guilds);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`🤝 [${player.name}] [${res.player.guild.name}] loncasına katıldı!`, 'normal');
    }
    setActiveSubmenu('my_guild');
  };

  const handleCreateGuild = () => {
    const res = createGuildService(
      player,
      {
        name: formName,
        flagId: formFlagId,
        motto: formMotto,
        notice: formNotice,
        minLevel: formMinLevel,
        isOpen: formIsOpen,
      },
      guilds
    );

    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setGuilds(res.guilds);
    saveGuildsToStorage(res.guilds);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    if (onBroadcast) {
      onBroadcast(`👑 [${player.name}] yeni bir lonca kurdu: [${formName.trim()}]!`, 'high');
    }
    setFormName('');
    setFormMotto('');
    setFormNotice('');
    setActiveSubmenu('my_guild');
  };

  const handleLeaveOrDisband = () => {
    const res = leaveGuildService(player, guilds);
    if (!res.success) {
      showToast(res.error, 'error');
      setShowConfirmModal(null);
      return;
    }
    setGuilds(res.guilds);
    saveGuildsToStorage(res.guilds);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
    setShowConfirmModal(null);
    setActiveSubmenu('find');
  };

  const handleDonateGold = (amount) => {
    const res = donateGoldService(player, amount, guilds);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setGuilds(res.guilds);
    saveGuildsToStorage(res.guilds);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
  };

  const handleDonateExp = (amount) => {
    const res = donateExpService(player, amount, guilds);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setGuilds(res.guilds);
    saveGuildsToStorage(res.guilds);
    if (onUpdatePlayer) onUpdatePlayer(res.player);
    showToast(res.message, 'success');
  };

  const handleUpgradeSkill = (skillId) => {
    const res = upgradeSkillService(player, skillId, guilds);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }
    setGuilds(res.guilds);
    saveGuildsToStorage(res.guilds);
    showToast(res.message, 'success');
  };

  // Yetenek ikonu yardımcı fonksiyonu
  const getSkillIcon = (iconName) => {
    switch (iconName) {
      case 'Flame':
        return Flame;
      case 'Heart':
        return Heart;
      case 'Shield':
        return Shield;
      case 'BookOpen':
        return BookOpen;
      case 'Zap':
        return Zap;
      default:
        return Sparkles;
    }
  };

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3 rounded-lg border text-xs font-cinzel flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Üst Sekmeler */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* ======================================================== */}
      {/* 1. SEKME: LONCA BULMA (find)                              */}
      {/* ======================================================== */}
      {activeSubmenu === 'find' && (
        <div className="space-y-4">
          {/* Arama ve Krallık Filtreleme Çubuğu */}
          <OrnateFrame className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lonca ismi, lider veya slogan ara..."
                  className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Krallık Filtre Butonları */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Tüm Krallıklar' },
                  { id: 'Aeltherin', label: 'Aeltherin' },
                  { id: 'Sylvandar', label: 'Sylvandar' },
                  { id: 'Lorvathiel', label: 'Lorvathiel' },
                  { id: 'Ithilmar', label: 'Ithilmar' },
                ].map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setKingdomFilter(k.id)}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-cinzel transition-all whitespace-nowrap border ${
                      kingdomFilter === k.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                        : 'bg-black/40 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1 border-t border-white/5 pt-2">
              <span>{filteredGuilds.length} Lonca Listeleniyor</span>
              {player?.guild?.id && (
                <span className="text-amber-300">
                  Mevcut Loncanız: <strong className="text-amber-100">{player.guild.name}</strong>
                </span>
              )}
            </div>
          </OrnateFrame>

          {/* Loncalar Listesi */}
          <div className={`gap-3.5 ${isPC ? 'grid grid-cols-1 lg:grid-cols-2' : 'space-y-3.5'}`}>
            {filteredGuilds.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-cinzel text-xs space-y-2">
                <Shield className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                <p>Aradığınız kriterlere uygun lonca bulunamadı.</p>
              </div>
            ) : (
              filteredGuilds.map((g) => {
                const flagMeta = GUILD_FLAGS.find((f) => f.id === g.flagId) || GUILD_FLAGS[0];
                const maxMembers = 20 + g.level * 2;
                const memberCount = g.members?.length || 0;
                const isMemberOfThis = player?.guild?.id === g.id;
                const meetsLevel = (player?.level || 1) >= (g.minLevel || 1);
                const isFull = memberCount >= maxMembers;

                return (
                  <OrnateFrame
                    key={g.id}
                    className={`p-4 flex flex-col justify-between transition-all hover:border-amber-500/40 relative overflow-hidden ${
                      isMemberOfThis ? 'border-amber-400/60 bg-amber-950/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Lonca Bayrağı */}
                      <div className="w-14 h-18 flex-shrink-0 relative group">
                        <img
                          src={flagMeta.file}
                          alt={flagMeta.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                        />
                        <div className="text-[9px] text-center font-mono text-amber-300/80 mt-1">
                          Lv. {g.level}
                        </div>
                      </div>

                      {/* Lonca Detayları */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-cinzel font-bold text-sm text-amber-100 truncate">
                                {g.name}
                              </h4>
                              {isMemberOfThis && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-mono">
                                  Loncanız
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-cinzel flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" />
                              Lider: <PlayerBadge name={g.leader} kingdom={g.kingdom} isMobile={!isPC} />
                            </p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-200">
                            {g.kingdom}
                          </span>
                        </div>

                        {g.motto && (
                          <p className="text-xs italic text-amber-200/70 font-cormorant line-clamp-1">
                            "{g.motto}"
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {memberCount} / {maxMembers} Üye
                            </span>
                          </div>
                          <div
                            className={`flex items-center gap-1 text-right justify-end ${
                              meetsLevel ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            <span>Gereksinim: Lv. {g.minLevel}</span>
                          </div>
                        </div>

                        {/* Üye Doluluk Çubuğu */}
                        <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                            style={{ width: `${Math.min(100, (memberCount / maxMembers) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Katılma Butonu */}
                    <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 font-mono">
                        {g.isOpen ? '🟢 Açık Katılım' : '🟡 Onaylı Başvuru'}
                      </div>
                      <div>
                        {isMemberOfThis ? (
                          <ElvenButton
                            size="sm"
                            variant="secondary"
                            onClick={() => setActiveSubmenu('my_guild')}
                          >
                            Loncama Git →
                          </ElvenButton>
                        ) : player?.guild?.id ? (
                          <button
                            disabled
                            className="px-3 py-1.5 text-[11px] rounded bg-white/5 text-slate-500 cursor-not-allowed font-cinzel"
                          >
                            Başka Loncadasınız
                          </button>
                        ) : isFull ? (
                          <button
                            disabled
                            className="px-3 py-1.5 text-[11px] rounded bg-white/5 text-rose-400/60 cursor-not-allowed font-cinzel"
                          >
                            Kapasite Dolu
                          </button>
                        ) : !meetsLevel ? (
                          <button
                            disabled
                            className="px-3 py-1.5 text-[11px] rounded bg-white/5 text-rose-400/60 cursor-not-allowed font-cinzel"
                          >
                            Seviye Yetersiz
                          </button>
                        ) : (
                          <ElvenButton
                            size="sm"
                            icon={Shield}
                            onClick={() => handleJoinGuild(g.id)}
                          >
                            Loncaya Katıl
                          </ElvenButton>
                        )}
                      </div>
                    </div>
                  </OrnateFrame>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SEKME: LONCA KURMA (create)                            */}
      {/* ======================================================== */}
      {activeSubmenu === 'create' && (
        <div className="space-y-4">
          {/* Durum / Şartlar Bilgilendirme */}
          <OrnateFrame className="p-4 space-y-2.5">
            <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kadim Lonca Kurma Şartları
            </h3>
            <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
              Kendi sancağınızı dikip kardeşlerinizi bir araya getirmek büyük bir sorumluluktur. Lonca kurucusu olarak
              loncanızın seviyesini yükseltebilir, kadim Metin2 tarzı lonca yeteneklerini açabilir ve kasayı yönetebilirsiniz.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div
                className={`p-2.5 rounded border flex items-center justify-between ${
                  (player?.level || 1) >= GUILD_CREATION_MIN_LEVEL
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                <span>Gereken Seviye: 10</span>
                <span>Mevcut: Lv. {player?.level || 1}</span>
              </div>
              <div
                className={`p-2.5 rounded border flex items-center justify-between ${
                  (player?.gold || 0) >= GUILD_CREATION_COST
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                <span>Gereken Altın: {GUILD_CREATION_COST.toLocaleString()} 🪙</span>
                <span>Mevcut: {(player?.gold || 0).toLocaleString()} 🪙</span>
              </div>
            </div>
          </OrnateFrame>

          {/* Form ve Canlı Önizleme Grid */}
          <div className={`gap-4 ${isPC ? 'grid grid-cols-12' : 'space-y-4'}`}>
            {/* Sol Taraf: Form Alanları */}
            <div className={`${isPC ? 'col-span-7' : ''} space-y-4`}>
              <OrnateFrame className="p-4 space-y-4">
                <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider border-b border-white/5 pb-2">
                  1. Lonca Bilgileri
                </h4>

                {/* Lonca İsmi */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-cinzel text-slate-200">Lonca İsmi</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formName.length}/20 Karakter
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Kadim Güneş Muhafızları"
                    className="w-full bg-black/60 border border-elven-gold/40 rounded-lg px-3 py-2 text-xs text-amber-100 font-cinzel focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Slogan & Manifesto */}
                <div>
                  <label className="block text-xs font-cinzel text-slate-200 mb-1">
                    Lonca Sloganı / Manifestosu
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formMotto}
                    onChange={(e) => setFormMotto(e.target.value)}
                    placeholder="Örn: Güneşin ve çeliğin asil bekçileri."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-cormorant"
                  />
                </div>

                {/* Lonca Duyurusu */}
                <div>
                  <label className="block text-xs font-cinzel text-slate-200 mb-1">
                    Başlangıç Lonca Duyurusu
                  </label>
                  <textarea
                    rows={2}
                    maxLength={100}
                    value={formNotice}
                    onChange={(e) => setFormNotice(e.target.value)}
                    placeholder="Yeni gelen üyeler için hoş geldin mesajı veya kurallar..."
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-cormorant resize-none"
                  />
                </div>

                {/* Katılım Ayarları */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-cinzel text-slate-200 mb-1">
                      Min. Katılım Seviyesi
                    </label>
                    <select
                      value={formMinLevel}
                      onChange={(e) => setFormMinLevel(Number(e.target.value))}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                    >
                      <option value={1}>Seviye 1 (Herkes)</option>
                      <option value={5}>Seviye 5</option>
                      <option value={10}>Seviye 10</option>
                      <option value={15}>Seviye 15</option>
                      <option value={20}>Seviye 20</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-cinzel text-slate-200 mb-1">
                      Katılım Türü
                    </label>
                    <select
                      value={formIsOpen ? 'open' : 'apply'}
                      onChange={(e) => setFormIsOpen(e.target.value === 'open')}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-amber-200 font-cinzel focus:outline-none focus:border-amber-400"
                    >
                      <option value="open">Açık Katılım (Anında)</option>
                      <option value="apply">Onaylı Katılım</option>
                    </select>
                  </div>
                </div>
              </OrnateFrame>

              {/* Bayrak Seçimi */}
              <OrnateFrame className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                    2. Lonca Bayrağı Seçimi (10 Özel Sancak)
                  </h4>
                  <span className="text-[10px] text-amber-400 font-cinzel">
                    {selectedFlagMeta.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {GUILD_FLAGS.map((flag) => {
                    const isSelected = flag.id === formFlagId;
                    return (
                      <button
                        key={flag.id}
                        type="button"
                        onClick={() => setFormFlagId(flag.id)}
                        className={`p-2 rounded-lg flex flex-col items-center gap-1.5 transition-all text-center relative border ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] scale-[1.02]'
                            : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-amber-400 text-black rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div className="w-10 h-13">
                          <img
                            src={flag.file}
                            alt={flag.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          />
                        </div>
                        <span className="text-[10px] font-cinzel font-semibold text-slate-200 line-clamp-1">
                          {flag.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-amber-300/80 italic font-cormorant text-center pt-1">
                  "{selectedFlagMeta.description}"
                </p>
              </OrnateFrame>
            </div>

            {/* Sağ Taraf: Canlı Önizleme Kartı */}
            <div className={`${isPC ? 'col-span-5' : ''} space-y-4`}>
              <OrnateFrame className="p-4 space-y-3 flex flex-col items-center text-center relative overflow-hidden bg-gradient-to-b from-black/80 via-[#0b1014]/90 to-black/80">
                <div className="text-[10px] font-cinzel tracking-widest text-amber-400 uppercase">
                  Lonca Sancağı Önizlemesi
                </div>

                {/* Büyük Bayrak Gösterimi */}
                <div className="w-28 h-34 my-2 relative animate-pulse">
                  <img
                    src={selectedFlagMeta.file}
                    alt={selectedFlagMeta.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
                  />
                </div>

                <div className="space-y-1 w-full">
                  <h3 className="font-cinzel text-base font-bold text-amber-100">
                    {formName.trim() || 'Lonca İsminiz'}
                  </h3>
                  <p className="text-xs italic text-amber-300/80 font-cormorant">
                    "{formMotto.trim() || 'Kadim Elflerin Birliği'}"
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-300">
                    <span className="bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                      Seviye 1
                    </span>
                    <span className="bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">
                      {player?.kingdom || 'Aeltherin'}
                    </span>
                    <span className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Min. Lv. {formMinLevel}
                    </span>
                  </div>
                </div>

                <div className="w-full border-t border-white/10 pt-3 mt-1 space-y-2 text-left text-xs font-cormorant text-slate-400">
                  <div className="flex justify-between">
                    <span>Kurucu Lider:</span>
                    <strong className="text-slate-200">{player?.name || 'Kahraman'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Başlangıç Üye Limiti:</span>
                    <strong className="text-slate-200">22 Üye</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lonca Yetenek Puanı:</span>
                    <strong className="text-slate-200">5 Farklı Ağaç Açık</strong>
                  </div>
                </div>

                {/* Lonca Kur Eylem Butonu */}
                <div className="w-full pt-2">
                  <ElvenButton
                    size="lg"
                    icon={PlusCircle}
                    fullWidth
                    disabled={
                      (player?.level || 1) < GUILD_CREATION_MIN_LEVEL ||
                      (player?.gold || 0) < GUILD_CREATION_COST ||
                      formName.trim().length < 3 ||
                      !!player?.guild?.id
                    }
                    onClick={handleCreateGuild}
                  >
                    Lonca Kur (25.000 🪙)
                  </ElvenButton>
                </div>
              </OrnateFrame>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SEKME: LONCAM (my_guild)                              */}
      {/* ======================================================== */}
      {activeSubmenu === 'my_guild' && (
        <div className="space-y-4">
          {!currentGuild ? (
            /* Oyuncunun Loncası Yoksa */
            <OrnateFrame className="p-8 text-center space-y-5 max-w-xl mx-auto my-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-2">
                <h3 className="font-cinzel text-lg font-bold text-amber-100">
                  Henüz Bir Loncaya Ait Değilsiniz
                </h3>
                <p className="text-xs text-slate-300 font-cormorant leading-relaxed max-w-md mx-auto">
                  Kadim krallıklar tek başına gezen kahramanlar için tehlikelerle doludur. Bir loncaya katılarak
                  silah arkadaşlarınızla güç birliği yapabilir, lonca yeteneklerinden pasif istatistik kazanabilir ve
                  büyük boss akınlarına katılabilirsiniz.
                </p>
              </div>

              {/* Lonca Avantajları */}
              <div className="grid grid-cols-2 gap-2.5 text-left text-xs font-mono">
                <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Lonca Yetenekleri</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-cormorant">
                    +%Saldırı, +%Can ve +%Savunma pasifleri
                  </p>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lonca Kasası</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-cormorant">
                    Altın bağışları ile devasa seviye geliştirmeleri
                  </p>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Kadim Bilgelik</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-cormorant">
                    Tüm zindan ve canavarlardan ekstra EXP bonusu
                  </p>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Özel Lonca Sohbeti</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-cormorant">
                    Yalnızca müttefiklerinizin görebildiği gizli kanal
                  </p>
                </div>
              </div>

              {/* Eylem Butonları */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <ElvenButton
                  size="md"
                  icon={Search}
                  onClick={() => setActiveSubmenu('find')}
                >
                  Lonca Bul ve Katıl
                </ElvenButton>
                <ElvenButton
                  size="md"
                  variant="secondary"
                  icon={PlusCircle}
                  onClick={() => setActiveSubmenu('create')}
                >
                  Yeni Lonca Kur
                </ElvenButton>
              </div>
            </OrnateFrame>
          ) : (
            /* Oyuncunun Loncası Varsa */
            <div className="space-y-4">
              {/* Lonca Üst Başlık & Sancak Kartı */}
              <OrnateFrame className="p-4 relative overflow-hidden bg-gradient-to-r from-black/80 via-[#0d1318]/90 to-black/80">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Lonca Bayrağı */}
                  {(() => {
                    const flagMeta =
                      GUILD_FLAGS.find((f) => f.id === currentGuild.flagId) || GUILD_FLAGS[0];
                    return (
                      <div className="w-20 h-26 flex-shrink-0 relative">
                        <img
                          src={flagMeta.file}
                          alt={flagMeta.name}
                          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                        />
                      </div>
                    );
                  })()}

                  {/* Lonca Bilgileri */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h3 className="font-cinzel text-lg font-bold text-amber-100">
                            {currentGuild.name}
                          </h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Lv. {currentGuild.level}
                          </span>
                        </div>
                        <p className="text-xs font-cinzel text-slate-400 mt-0.5">
                          Krallık: <strong className="text-indigo-300">{currentGuild.kingdom}</strong> | Lider:{' '}
                          <PlayerBadge name={currentGuild.leader} kingdom={currentGuild.kingdom} isMobile={!isPC} />
                        </p>
                      </div>

                      {/* Oyuncunun Loncadaki Rütbesi */}
                      <div className="text-right">
                        <span className="text-xs font-cinzel px-3 py-1 rounded bg-amber-500/10 border border-amber-400/40 text-amber-200 inline-flex items-center gap-1.5">
                          {player.guild?.rank === 'Lider' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          {player.guild?.rank || 'Üye'}
                        </span>
                      </div>
                    </div>

                    {currentGuild.motto && (
                      <p className="text-xs italic text-amber-200/80 font-cormorant">
                        "{currentGuild.motto}"
                      </p>
                    )}

                    {/* Hızlı İstatistik Rozetleri */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-mono">
                      <span className="bg-black/60 px-2.5 py-1 rounded border border-white/10 text-slate-300">
                        👥 Üyeler: {currentGuild.members?.length || 0} / {20 + currentGuild.level * 2}
                      </span>
                      <span className="bg-black/60 px-2.5 py-1 rounded border border-amber-500/20 text-amber-300">
                        🪙 Kasa: {(currentGuild.vaultGold || 0).toLocaleString()} Altın
                      </span>
                      <span className="bg-black/60 px-2.5 py-1 rounded border border-indigo-500/20 text-indigo-300">
                        ⚡ EXP: {(currentGuild.exp || 0).toLocaleString()} / {(currentGuild.maxExp || 2000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </OrnateFrame>

              {/* Lonca Gelişimi & Bağışlar (EXP ve Altın Kasası) */}
              <div className={`gap-4 ${isPC ? 'grid grid-cols-2' : 'space-y-4'}`}>
                {/* 1. Lonca EXP Seviye Gelişimi */}
                <OrnateFrame className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      Lonca EXP İlerlemesi
                    </h4>
                    <span className="text-xs font-mono text-purple-300">
                      Seviye {currentGuild.level} / 20
                    </span>
                  </div>

                  {/* İlerleme Çubuğu */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{(currentGuild.exp || 0).toLocaleString()} EXP</span>
                      <span>{(currentGuild.maxExp || 2000).toLocaleString()} EXP</span>
                    </div>
                    <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-purple-500/30">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            ((currentGuild.exp || 0) / (currentGuild.maxExp || 2000)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-cormorant">
                    Kendi EXP puanınızdan loncaya bağış yaparak loncanın seviye atlamasını sağlayın.
                    (Karakter EXP: {(player.exp || 0).toLocaleString()})
                  </p>

                  {/* Hızlı EXP Bağış Butonları */}
                  <div className="flex items-center gap-2 pt-1">
                    {[100, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleDonateExp(amt)}
                        disabled={(player.exp || 0) < amt}
                        className={`flex-1 py-1.5 px-2 rounded text-[11px] font-mono transition-all border ${
                          (player.exp || 0) >= amt
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-purple-900/50'
                            : 'bg-black/30 border-white/5 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        +{amt} EXP
                      </button>
                    ))}
                  </div>
                </OrnateFrame>

                {/* 2. Lonca Altın Kasası */}
                <OrnateFrame className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      Lonca Kasası (Altın)
                    </h4>
                    <span className="text-xs font-mono text-amber-300">
                      {(currentGuild.vaultGold || 0).toLocaleString()} 🪙
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-cormorant">
                    Lonca yeteneklerini geliştirmek için kasada altın birikmelidir.
                    (Karakter Altını: {(player.gold || 0).toLocaleString()} 🪙)
                  </p>

                  {/* Hızlı Altın Bağış Butonları */}
                  <div className="flex items-center gap-2 pt-3">
                    {[1000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleDonateGold(amt)}
                        disabled={(player.gold || 0) < amt}
                        className={`flex-1 py-1.5 px-2 rounded text-[11px] font-mono transition-all border ${
                          (player.gold || 0) >= amt
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 hover:bg-amber-900/50'
                            : 'bg-black/30 border-white/5 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        +{amt.toLocaleString()} 🪙
                      </button>
                    ))}
                  </div>
                </OrnateFrame>
              </div>

              {/* Metin2 Tarzı Lonca Yetenekleri */}
              <OrnateFrame className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                      Kadim Lonca Yetenekleri (Tüm Üyelere Aktif)
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Kasa: {(currentGuild.vaultGold || 0).toLocaleString()} 🪙
                  </span>
                </div>

                <div className={`gap-3 ${isPC ? 'grid grid-cols-5' : 'grid grid-cols-1 sm:grid-cols-2'}`}>
                  {GUILD_SKILLS.map((skill) => {
                    const currentLvl = currentGuild.skills?.[skill.id] || 0;
                    const isMax = currentLvl >= skill.maxLevel;
                    const canAfford = (currentGuild.vaultGold || 0) >= skill.costGoldPerLevel;
                    const isLeaderOrOfficer =
                      player.guild?.rank === 'Lider' || player.guild?.rank === 'General';
                    const IconComponent = getSkillIcon(skill.iconName);

                    return (
                      <div
                        key={skill.id}
                        className="p-3 rounded-lg bg-black/50 border border-white/5 flex flex-col justify-between space-y-2 relative overflow-hidden"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center border"
                              style={{
                                backgroundColor: `${skill.color}15`,
                                borderColor: `${skill.color}40`,
                                color: skill.color,
                              }}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-mono font-bold text-amber-300">
                              {currentLvl}/{skill.maxLevel}
                            </span>
                          </div>

                          <h5 className="font-cinzel font-bold text-xs text-slate-100 mt-2">
                            {skill.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 font-cormorant mt-0.5 line-clamp-2">
                            {skill.description}
                          </p>

                          <div className="mt-2 text-[10px] font-mono text-emerald-400">
                            Aktif: {skill.bonusPerLevel} (x{currentLvl})
                          </div>
                        </div>

                        {/* Geliştirme Butonu */}
                        <div className="pt-2 border-t border-white/5">
                          {isMax ? (
                            <div className="text-center text-[10px] text-amber-400 font-mono py-1">
                              ✓ MAKSİMUM
                            </div>
                          ) : !isLeaderOrOfficer ? (
                            <div className="text-center text-[10px] text-slate-500 font-mono py-1">
                              (Lider Yetkisi)
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpgradeSkill(skill.id)}
                              disabled={!canAfford}
                              className={`w-full py-1 px-2 rounded text-[10px] font-cinzel transition-all border ${
                                canAfford
                                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200 hover:bg-amber-500/30'
                                  : 'bg-black/30 border-white/5 text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              Yükselt ({skill.costGoldPerLevel.toLocaleString()} 🪙)
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </OrnateFrame>

              {/* Lonca Duyuru Panosu */}
              {currentGuild.notice && (
                <OrnateFrame className="p-3.5 bg-amber-950/20 border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-cinzel text-amber-300">
                    <Info className="w-3.5 h-3.5" />
                    <span>Lonca Lideri Duyurusu:</span>
                  </div>
                  <p className="text-xs text-amber-100/90 font-cormorant leading-relaxed pl-5">
                    "{currentGuild.notice}"
                  </p>
                </OrnateFrame>
              )}

              {/* Lonca Üye Listesi */}
              <OrnateFrame className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    Lonca Üyeleri ({currentGuild.members?.length || 0} / {20 + currentGuild.level * 2})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Rütbe Sıralaması</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-cinzel text-slate-400">
                        <th className="pb-2">Kahraman</th>
                        <th className="pb-2">Rütbe</th>
                        <th className="pb-2">Sınıf</th>
                        <th className="pb-2">Seviye</th>
                        <th className="pb-2 text-right">Altın Bağışı</th>
                        <th className="pb-2 text-right">EXP Bağışı</th>
                        <th className="pb-2 text-center">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {currentGuild.members?.map((m, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-white/5 ${
                            m.name === player.name ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="py-2.5 font-cinzel text-slate-200 flex items-center gap-1.5">
                            {m.rank === 'Lider' && <Crown className="w-3 h-3 text-amber-400" />}
                            <PlayerBadge
                              name={m.name}
                              level={m.level}
                              characterClass={m.class}
                              kingdom={currentGuild.kingdom}
                              isMe={m.name === player.name}
                              isMobile={!isPC}
                            />
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border ${
                                m.rank === 'Lider'
                                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                                  : m.rank === 'General'
                                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                                  : m.rank === 'Muhafız'
                                  ? 'bg-blue-950/60 border-blue-500/50 text-blue-200'
                                  : 'bg-black/40 border-white/5 text-slate-400'
                              }`}
                            >
                              {m.rank}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-300 font-cinzel">{m.class}</td>
                          <td className="py-2.5 text-amber-300">Lv. {m.level}</td>
                          <td className="py-2.5 text-right text-slate-300">
                            {(m.contributionGold || 0).toLocaleString()} 🪙
                          </td>
                          <td className="py-2.5 text-right text-purple-300">
                            {(m.contributionExp || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 text-center">
                            {m.online ? (
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                            ) : (
                              <span className="inline-block w-2 h-2 rounded-full bg-slate-600" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </OrnateFrame>

              {/* Loncadan Ayrılma veya Feshetme Butonu */}
              <div className="pt-2 flex justify-end">
                {player.guild?.rank === 'Lider' || currentGuild.leader === player.name ? (
                  <button
                    onClick={() => setShowConfirmModal('disband')}
                    className="px-4 py-2 rounded text-xs font-cinzel bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/50 flex items-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Loncayı Feshet
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal('leave')}
                    className="px-4 py-2 rounded text-xs font-cinzel bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/50 flex items-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Loncadan Ayrıl
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onay Modalı (Ayrılma / Feshetme) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <OrnateFrame className="p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/40 mx-auto flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-cinzel text-base font-bold text-slate-100">
                {showConfirmModal === 'disband' ? 'Loncayı Feshetmek İstiyor musunuz?' : 'Loncadan Ayrılmak İstiyor musunuz?'}
              </h4>
              <p className="text-xs text-slate-300 font-cormorant">
                {showConfirmModal === 'disband'
                  ? 'Lonca lideri olarak loncayı feshettiğinizde lonca kasası, yetenekler ve tüm kayıtlar kalıcı olarak silinir!'
                  : 'Loncadan ayrıldığınızda lonca yeteneklerinin sağladığı tüm bonusları kaybedeceksiniz.'}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-2 rounded bg-white/5 border border-white/10 text-xs font-cinzel text-slate-300 hover:bg-white/10"
              >
                Vazgeç
              </button>
              <button
                onClick={handleLeaveOrDisband}
                className="flex-1 py-2 rounded bg-rose-600 text-white text-xs font-cinzel font-bold hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                Evet, Onayla
              </button>
            </div>
          </OrnateFrame>
        </div>
      )}
    </div>
  );
}
