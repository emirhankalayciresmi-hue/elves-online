import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Coins, Gem, Sparkles, User, Skull, Heart, Zap,
  Bell, BellOff, CheckCheck, Trash2, X, Swords, Pickaxe,
  Users, AlertCircle, Award, ChevronRight, FlaskConical, Plus
} from 'lucide-react';
import { ASSETS } from '../config/assets';
import { DEFAULT_PLAYER_STATS } from '../config/gameData';
import { getRequiredExp } from '../config/dungeonData';
import { buyPotions, usePotion, setAutoPotionThreshold } from '../services/gameEngine';

const NOTIF_STORAGE_KEY = 'elves_rpg_notifications_list';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_welcome',
    title: 'Kadim Diyara Hoş Geldiniz!',
    message: 'Ithilmar Krallığı sizi selamlıyor. Zindanları fethedin, madenleri kazın ve gücünüzü kanıtlayın.',
    type: 'system',
    targetTab: 'character',
    timestamp: 'Az önce',
    isRead: false,
  },
  {
    id: 'notif_party',
    title: 'Grup Sistemi Aktif',
    message: 'Grup sekmesinden takım kurup beraber maden kazabilir ve ejderha zindanlarına akın düzenleyebilirsiniz.',
    type: 'party',
    targetTab: 'party',
    timestamp: '5 dk önce',
    isRead: false,
  },
];

export default function HeaderStatusBar({
  player,
  onResetPlayer,
  layoutMode = 'mobile',
  onNavigateTab,
  onUpdatePlayer,
}) {
  if (!player) return null;

  const isPC = layoutMode === 'pc';
  const currentLevel = player.level || 1;
  const currentExp = player.exp || 0;
  const maxExp = getRequiredExp(currentLevel);
  const expPercent = Math.min(100, Math.max(0, Math.round((currentExp / maxExp) * 100)));

  const currentHp = player.hp ?? DEFAULT_PLAYER_STATS.hp;
  const maxHp = player.maxHp ?? DEFAULT_PLAYER_STATS.maxHp;
  const currentMana = player.mana ?? DEFAULT_PLAYER_STATS.mana;
  const maxMana = player.maxMana ?? DEFAULT_PLAYER_STATS.maxMana;
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentHp / maxHp) * 100)));
  const manaPercent = Math.min(100, Math.max(0, Math.round((currentMana / maxMana) * 100)));

  // Bildirim State ve Dropdown
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  // İksir State ve Modal
  const [isPotionModalOpen, setIsPotionModalOpen] = useState(false);
  const [potionShopTab, setPotionShopTab] = useState('hp');
  const [potionNotice, setPotionNotice] = useState(null);

  // ESC tuşuyla iksir modalını kapatma
  useEffect(() => {
    if (!isPotionModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPotionModalOpen(false);
        setPotionNotice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPotionModalOpen]);

  // Modal açıkken arka plan kaydırmayı engelle
  useEffect(() => {
    if (isPotionModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isPotionModalOpen]);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (!saved) return INITIAL_NOTIFICATIONS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Bildirimleri kaydet
  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Notif save error:', e);
    }
  }, [notifications]);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  // Zindan tamamlama raporlarını otomatik bildirime ekle
  const lastDungeonReportRef = useRef(null);
  useEffect(() => {
    if (
      player?.lastDungeonReport?.completedAt &&
      player.lastDungeonReport.completedAt !== lastDungeonReportRef.current
    ) {
      lastDungeonReportRef.current = player.lastDungeonReport.completedAt;
      const report = player.lastDungeonReport;
      const newNotif = {
        id: `notif_dung_${Date.now()}`,
        title: `Zindan Temizlendi: ${report.dungeonName}`,
        message: `+${(report.expReward || 0).toLocaleString('tr-TR')} EXP ve +${(report.goldReward || 0).toLocaleString('tr-TR')} Altın kazanıldı.`,
        type: 'dungeon',
        targetTab: 'dungeon',
        timestamp: 'Az önce',
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    }
  }, [player?.lastDungeonReport]);

  // Maden tamamlama raporlarını otomatik bildirime ekle
  const lastMineReportRef = useRef(null);
  useEffect(() => {
    if (
      player?.lastMineReport?.completedAt &&
      player.lastMineReport.completedAt !== lastMineReportRef.current
    ) {
      lastMineReportRef.current = player.lastMineReport.completedAt;
      const report = player.lastMineReport;
      const newNotif = {
        id: `notif_mine_${Date.now()}`,
        title: `Maden Kazısı Bitti: ${report.mineName}`,
        message: `+${(report.expReward || 0).toLocaleString('tr-TR')} EXP ve +${(report.goldReward || 0).toLocaleString('tr-TR')} Altın kazanıldı. Cevherler çantanıza aktarıldı.`,
        type: 'mine',
        targetTab: 'mine',
        timestamp: 'Az önce',
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
    }
  }, [player?.lastMineReport]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleClickNotification = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.targetTab && onNavigateTab) {
      onNavigateTab(notif.targetTab);
      setIsNotifOpen(false);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'dungeon':
        return Swords;
      case 'mine':
        return Pickaxe;
      case 'party':
        return Users;
      case 'level':
        return Sparkles;
      case 'quest':
        return Award;
      default:
        return AlertCircle;
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#070d10]/95 border-b border-elven-gold/30 backdrop-blur-md shadow-lg">
      <div className={`py-2 flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 ${isPC ? 'px-6 sm:px-8' : 'px-3'}`}>
        {/* Sol Taraf: Avatar & Karakter Kimliği */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-elven-gold/60 bg-black/50 overflow-hidden flex items-center justify-center shadow-elven-inner group flex-shrink-0">
            {player.classImage ? (
              <img src={player.classImage} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-elven-goldLight opacity-80" />
            )}
            <span className="absolute bottom-0 right-0 bg-black/90 text-[9px] font-mono text-amber-300 px-1 border-tl border-amber-500/40">
              Lv.{currentLevel}
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-cinzel font-bold text-xs sm:text-sm text-amber-100 gold-text-glow tracking-wider">
                {player.name || 'İsimsiz Savaşçı'}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold">
                {player.className}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-200/70 font-cinzel">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span className="truncate max-w-[130px] sm:max-w-none">{player.kingdomName}</span>
            </div>
          </div>
        </div>

        {/* Orta: Kompakt HP & MANA Barları + Hızlı İksir Butonları */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Kompakt HP & MANA Barları */}
          <div className="flex flex-col gap-1 w-28 xs:w-36 sm:w-44 md:w-48 flex-shrink-0">
            {/* HP Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <Heart className="w-2.5 h-2.5 fill-rose-500/30" /> HP
                </span>
                <span className="text-slate-200 text-[9px] sm:text-[10px]">
                  {currentHp.toLocaleString('tr-TR')} / {maxHp.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="w-full h-2 bg-black/70 rounded-full overflow-hidden border border-rose-900/60 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                  style={{ width: `${Math.max(3, hpPercent)}%` }}
                />
              </div>
            </div>

            {/* MANA Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                <span className="flex items-center gap-1 text-sky-400 font-bold">
                  <Zap className="w-2.5 h-2.5 fill-sky-500/30" /> MANA
                </span>
                <span className="text-slate-200 text-[9px] sm:text-[10px]">
                  {currentMana.toLocaleString('tr-TR')} / {maxMana.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="w-full h-2 bg-black/70 rounded-full overflow-hidden border border-sky-900/60 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-sky-700 via-sky-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                  style={{ width: `${Math.max(3, manaPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* HP & MANA Hızlı İksir Slotları (Metin2/Silkroad tarzı) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Kırmızı Can İksiri */}
            <button
              type="button"
              onClick={() => { setPotionShopTab('hp'); setIsPotionModalOpen(true); }}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/50 hover:border-rose-400 text-rose-200 transition-all cursor-pointer group shadow-sm hover:shadow-rose-950/60"
              title="Kırmızı Can İksiri (Yönetmek veya Satın Almak için Tıkla)"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600/30 border border-rose-400/80 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform flex-shrink-0">
                <FlaskConical className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 fill-rose-500/40" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[7px] sm:text-[8px] font-mono text-rose-300 font-bold">HP İKSİR</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white">
                  {(player.hpPotions ?? 0).toLocaleString('tr-TR')}
                </span>
              </div>
            </button>

            {/* Mavi Mana İksiri */}
            <button
              type="button"
              onClick={() => { setPotionShopTab('mana'); setIsPotionModalOpen(true); }}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md bg-sky-950/70 hover:bg-sky-900/90 border border-sky-500/50 hover:border-sky-400 text-sky-200 transition-all cursor-pointer group shadow-sm hover:shadow-sky-950/60"
              title="Mavi Mana İksiri (Yönetmek veya Satın Almak için Tıkla)"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-600/30 border border-sky-400/80 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform flex-shrink-0">
                <FlaskConical className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400 fill-sky-500/40" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[7px] sm:text-[8px] font-mono text-sky-300 font-bold">MP İKSİR</span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-white">
                  {(player.manaPotions ?? 0).toLocaleString('tr-TR')}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Sağ Taraf: BİLDİRİM ÇUBUĞU + Para Birimleri (Altın / Kristal) + Zindan Rozeti + EXP Barı */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap ml-auto">
          {/* 🔔 BİLDİRİM ÇUBUĞU / BUTONU (Altının hemen solunda) */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className={`relative p-2 rounded-lg border transition-all duration-200 flex items-center justify-center cursor-pointer group ${
                isNotifOpen
                  ? 'border-amber-400 bg-amber-500/25 text-amber-200 shadow-elven-gold scale-105'
                  : unreadCount > 0
                  ? 'border-amber-500/60 bg-black/70 text-amber-300 hover:border-amber-400 hover:bg-black/90'
                  : 'border-slate-800 bg-black/50 text-slate-400 hover:border-amber-500/40 hover:text-amber-200'
              }`}
              title="Bildirimler"
            >
              <Bell className={`w-4 h-4 transition-transform ${unreadCount > 0 ? 'animate-bounce text-amber-300' : 'group-hover:scale-110'}`} />

              {/* Okunmamış Sayı Rozeti */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[16px] h-4 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-[9px] font-mono font-bold text-white flex items-center justify-center shadow-lg border border-black/80 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* AÇILIR ELVEN BİLDİRİM PANELİ */}
            {isNotifOpen && (
              <div className="w-80 sm:w-96 max-w-[calc(100vw-24px)] max-h-[460px] flex flex-col rounded-xl border border-amber-500/50 bg-[#070e12]/98 backdrop-blur-xl shadow-2xl shadow-black z-50 absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 animate-fadeIn overflow-hidden">
                {/* Panel Başlığı */}
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-xs font-bold text-amber-200 flex items-center gap-1.5">
                        <span>Bildirimler</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/40 text-amber-300">
                            {unreadCount} Yeni
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* Hızlı Eylemler */}
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Tümünü Okundu Say"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Tümünü Temizle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Kapat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bildirim Listesi */}
                <div className="overflow-y-auto max-h-80 divide-y divide-white/5 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <BellOff className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-cinzel text-xs text-slate-400">
                        Henüz yeni bir bildiriminiz yok.
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Zindan, maden ve grup zaferleriniz burada listelenir.
                      </span>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = getNotifIcon(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleClickNotification(notif)}
                          className={`p-3 transition-all cursor-pointer flex items-start gap-3 hover:bg-white/5 group ${
                            !notif.isRead ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-lg border mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            !notif.isRead
                              ? 'border-amber-400/60 bg-amber-500/20 text-amber-300'
                              : 'border-slate-800 bg-black/40 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className={`font-cinzel text-xs font-bold truncate ${
                                !notif.isRead ? 'text-amber-100 gold-text-glow' : 'text-slate-300'
                              }`}>
                                {notif.title}
                              </h5>
                              <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">
                                {notif.timestamp}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 font-cormorant leading-relaxed line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>

                            {notif.targetTab && (
                              <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400/80 group-hover:text-amber-300 mt-1">
                                <span>Görüntülemek için tıkla</span>
                                <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            )}
                          </div>

                          {/* Okunmadı Noktası */}
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Alt Çubuk */}
                <div className="p-2.5 bg-black/80 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{notifications.length} Bildirim Kayıtlı</span>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      Hepsini Okundu İşaretle
                    </button>
                  ) : (
                    <span className="text-emerald-400">Tümü Okundu ✓</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Para Birimleri (Altın / Kristal) */}
          <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1 rounded-md bg-black/60 border border-amber-500/20 font-mono text-xs shadow-inner">
            {/* Altın */}
            <div className="flex items-center gap-1.5" title="Altın">
              {ASSETS.resources.gold ? (
                <img src={ASSETS.resources.gold} alt="Altın" className="w-3.5 h-3.5 object-contain" />
              ) : (
                <Coins className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-amber-200 font-bold text-xs sm:text-sm">
                {(player.gold ?? 500).toLocaleString('tr-TR')}
              </span>
            </div>

            <span className="text-white/20 font-light">|</span>

            {/* Kristal */}
            <div className="flex items-center gap-1.5" title="Ruh Kristali">
              {ASSETS.resources.crystal ? (
                <img src={ASSETS.resources.crystal} alt="Kristal" className="w-3.5 h-3.5 object-contain" />
              ) : (
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="text-cyan-200 font-bold text-xs sm:text-sm">
                {(player.crystals ?? 50).toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Aktif Zindan Rozeti (Varsa) */}
          {player.activeDungeon && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-mono animate-pulse shadow-sm shadow-rose-900/50">
              <Skull className="w-3 h-3 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-cinzel font-bold hidden xs:inline">{player.activeDungeon.name || 'Zindan'}</span>
              <span className="text-amber-300 text-[9px]">Savaşta</span>
            </div>
          )}

          {/* Seviye EXP Barı */}
          <div className="flex flex-col items-end w-32 sm:w-40 flex-shrink-0">
            <div className="flex justify-between w-full text-[10px] text-amber-200/90 font-mono">
              <span>SEVİYE {currentLevel} EXP</span>
              <span>{currentExp.toLocaleString('tr-TR')} / {maxExp.toLocaleString('tr-TR')}</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full border border-amber-500/30 overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-300"
                style={{ width: `${Math.max(2, expPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* İKSİR YÖNETİMİ & HIZLI ALIM MODAL (PORTAL İLE BODY'YE BAĞLI) */}
      {isPotionModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPotionModalOpen(false);
              setPotionNotice(null);
            }
          }}
        >
          <div
            className="w-full max-w-[440px] max-h-[85vh] sm:max-h-[90vh] bg-[#0a1215] border-2 border-amber-500/60 rounded-xl shadow-2xl flex flex-col overflow-hidden relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sabit */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-black/70 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-100 gold-text-glow">
                    İksir Yönetimi & Hızlı Alım
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Zindan ve Savaş İksir Tedariği
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsPotionModalOpen(false); setPotionNotice(null); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-950/60 border border-white/10 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 flex items-center justify-center cursor-pointer transition-colors"
                title="Pencereyi Kapat (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Kaydırılabilir */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 scrollbar-thin">
              {/* Bildirim Uyarısı */}
              {potionNotice && (
                <div className={`p-2 rounded text-xs font-mono text-center border ${
                  potionNotice.type === 'error' ? 'bg-rose-950/80 border-rose-500/50 text-rose-200' : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                }`}>
                  {potionNotice.text}
                </div>
              )}

              {/* Mevcut Durum Kartları */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* HP Kartı */}
                <div className="p-2.5 sm:p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-cinzel font-bold text-rose-300 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/40" /> Can (HP)
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-200">
                      {(player.hpPotions ?? 0).toLocaleString('tr-TR')} Adet
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    {currentHp.toLocaleString('tr-TR')} / {maxHp.toLocaleString('tr-TR')}
                  </div>
                  <button
                    type="button"
                    disabled={(player.hpPotions ?? 0) <= 0 || currentHp >= maxHp}
                    onClick={() => {
                      if (onUpdatePlayer) {
                        const updated = usePotion(player, 'hp');
                        onUpdatePlayer(updated);
                        setPotionNotice({ type: 'success', text: '1 Adet Kırmızı İksir içildi (+300 HP)' });
                      }
                    }}
                    className="w-full py-1.5 text-xs font-mono rounded bg-rose-600/80 hover:bg-rose-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition-all cursor-pointer"
                  >
                    İç (+300 HP)
                  </button>
                </div>

                {/* MANA Kartı */}
                <div className="p-2.5 sm:p-3 rounded-lg bg-sky-950/40 border border-sky-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-cinzel font-bold text-sky-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-sky-500/40" /> Mana (MP)
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-200">
                      {(player.manaPotions ?? 0).toLocaleString('tr-TR')} Adet
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    {currentMana.toLocaleString('tr-TR')} / {maxMana.toLocaleString('tr-TR')}
                  </div>
                  <button
                    type="button"
                    disabled={(player.manaPotions ?? 0) <= 0 || currentMana >= maxMana}
                    onClick={() => {
                      if (onUpdatePlayer) {
                        const updated = usePotion(player, 'mana');
                        onUpdatePlayer(updated);
                        setPotionNotice({ type: 'success', text: '1 Adet Mavi İksir içildi (+300 MP)' });
                      }
                    }}
                    className="w-full py-1.5 text-xs font-mono rounded bg-sky-600/80 hover:bg-sky-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition-all cursor-pointer"
                  >
                    İç (+300 MP)
                  </button>
                </div>
              </div>

              {/* Oto-İksir Eşiği Ayarı */}
              <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-cinzel text-amber-200">
                  <span>Otomatik İksir Eşiği:</span>
                  <span className="font-mono font-bold text-amber-300">%{player.autoPotionThreshold || 50} Can</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Zindanda canınız bu seviyenin altına indiğinde otomatik olarak kırmızı iksir tüketilir. İksiriniz biter ve can 0 olursa zindan kapanır.
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[30, 50, 75].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        if (onUpdatePlayer) {
                          const updated = setAutoPotionThreshold(player, pct);
                          onUpdatePlayer(updated);
                          setPotionNotice({ type: 'success', text: `Oto-İksir eşiği %${pct} olarak ayarlandı.` });
                        }
                      }}
                      className={`py-1.5 rounded text-xs font-mono font-bold border transition-all cursor-pointer ${
                        (player.autoPotionThreshold || 50) === pct
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-elven-gold'
                          : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      %{pct} Can
                    </button>
                  ))}
                </div>
              </div>

              {/* Hızlı Paket Satın Alma (NPC Fiyatları) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-xs font-cinzel font-bold text-amber-200">
                    Hızlı Paket Satın Alma
                  </span>
                  <span className="text-xs font-mono text-yellow-300 font-bold">
                    Mevcut: {(player.gold ?? 0).toLocaleString('tr-TR')} Altın
                  </span>
                </div>

                {/* Tab Seçimi (Kırmızı vs Mavi) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPotionShopTab('hp')}
                    className={`py-1.5 rounded text-xs font-cinzel font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      potionShopTab === 'hp'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md'
                        : 'bg-black/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
                    <span>Kırmızı İksir (HP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPotionShopTab('mana')}
                    className={`py-1.5 rounded text-xs font-cinzel font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      potionShopTab === 'mana'
                        ? 'bg-sky-950/80 border-sky-500 text-sky-200 shadow-md'
                        : 'bg-black/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
                    <span>Mavi İksir (MP)</span>
                  </button>
                </div>

                {/* Satın Alma Paketleri: 1, 10, 50, 200 */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { count: 1, cost: potionShopTab === 'hp' ? 50 : 60, label: '1 Adet' },
                    { count: 10, cost: potionShopTab === 'hp' ? 500 : 600, label: '10 Adet' },
                    { count: 50, cost: potionShopTab === 'hp' ? 2500 : 3000, label: '50 Adet' },
                    { count: 200, cost: potionShopTab === 'hp' ? 10000 : 12000, label: '200 Adet (Maksimum Paket)' },
                  ].map((pack) => {
                    const canAfford = (player.gold ?? 0) >= pack.cost;
                    return (
                      <button
                        key={pack.count}
                        type="button"
                        disabled={!canAfford}
                        onClick={() => {
                          if (onUpdatePlayer) {
                            const res = buyPotions(player, potionShopTab, pack.count, potionShopTab === 'hp' ? 50 : 60);
                            if (res.success) {
                              onUpdatePlayer(res.player);
                              setPotionNotice({
                                type: 'success',
                                text: `+${pack.count} Adet ${potionShopTab === 'hp' ? 'Kırmızı Can İksiri' : 'Mavi Mana İksiri'} satın alındı!`,
                              });
                            } else {
                              setPotionNotice({ type: 'error', text: res.error });
                            }
                          }
                        }}
                        className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          pack.count === 200
                            ? 'col-span-2 bg-gradient-to-r from-amber-950/40 via-black/80 to-amber-950/40 border-amber-500/60 hover:border-amber-400'
                            : 'bg-black/60 border-white/10 hover:border-amber-500/40'
                        } ${!canAfford ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-cinzel text-xs font-bold text-amber-100">{pack.label}</span>
                          {pack.count === 200 && (
                            <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-500/40">
                              ★ EN ÇOK TERCİH EDİLEN (200'lük)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                          <span className="text-yellow-300 font-bold">
                            {pack.cost.toLocaleString('tr-TR')} Altın
                          </span>
                          <span className={`text-[10px] ${canAfford ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                            {canAfford ? 'Satın Al →' : 'Yetersiz Altın'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer - Sabit Kapatma Çubuğu */}
            <div className="p-3 border-t border-white/10 bg-black/80 flex items-center justify-between gap-3 flex-shrink-0">
              <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">
                ESC veya dışarı tıklayarak da kapatabilirsiniz.
              </span>
              <button
                type="button"
                onClick={() => { setIsPotionModalOpen(false); setPotionNotice(null); }}
                className="w-full xs:w-auto ml-auto px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 active:scale-95 text-rose-200 hover:text-white border border-rose-500/50 hover:border-rose-400 font-cinzel font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Pencereyi Kapat</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
