import React, { useState } from 'react';
import {
  Award, Clock, CheckCircle2, Zap, Sparkles,
  Flame, Skull, Users, Shield, Pickaxe, Coins,
  TrendingUp, Star, X
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import { ALL_MENUS } from '../../config/gameData';
import {
  BADGE_DEFINITIONS,
  ensurePlayerQuestState
} from '../../config/questData';

export default function QuestsTab({
  player,
  layoutMode = 'mobile',
  onTestProgressQuest,
  onDismissBatchNotice,
}) {
  const [activeSubmenu, setActiveSubmenu] = useState('daily');
  const isPC = layoutMode === 'pc';

  // Ensure questState exists on player
  const ensuredPlayer = ensurePlayerQuestState(player);
  const questState = ensuredPlayer?.questState || {
    dailyQuests: [],
    weeklyQuests: [],
    badgeProgress: {},
    completedDailyCount: 0,
    completedWeeklyCount: 0,
    completedBadgeCount: 0,
    completedDailyBatches: 0,
    dailyBatchJustCompleted: false,
  };

  const {
    dailyQuests = [],
    weeklyQuests = [],
    badgeProgress = {},
    completedDailyCount = 0,
    completedWeeklyCount = 0,
    completedBadgeCount = 0,
    dailyBatchJustCompleted = false,
  } = questState;

  const submenus = ALL_MENUS.find((m) => m.id === 'quests')?.submenus || [
    { id: 'daily', label: 'Günlük Görevler' },
    { id: 'weekly', label: 'Haftalık Görevler' },
    { id: 'badges', label: 'Rozet Görevleri' },
  ];

  // Helper for badge category icon
  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Skull': return <Skull className="w-5 h-5 text-rose-400" />;
      case 'Users': return <Users className="w-5 h-5 text-indigo-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Pickaxe': return <Pickaxe className="w-5 h-5 text-cyan-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-yellow-400" />;
      default: return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  // Helper for difficulty badge styling
  const getDifficultyColor = (diff) => {
    if (!diff) return 'border-amber-500/30 text-amber-300 bg-amber-500/10';
    if (diff.includes('Kolay')) return 'border-emerald-500/40 text-emerald-300 bg-emerald-500/15';
    if (diff.includes('Orta')) return 'border-sky-500/40 text-sky-300 bg-sky-500/15';
    if (diff.includes('Çok Zor') || diff.includes('Efsanevi')) return 'border-purple-500/40 text-purple-300 bg-purple-500/15';
    if (diff.includes('Zor')) return 'border-rose-500/40 text-rose-300 bg-rose-500/15';
    return 'border-amber-500/30 text-amber-300 bg-amber-500/10';
  };

  // Daily batch completed count out of 5
  const completedInCurrentBatch = dailyQuests.filter((q) => q.isCompleted).length;

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Submenu Bar (Günlük / Haftalık / Rozet) */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* TOP STATS DASHBOARD: Yapılan Görev Sayısı & Rozetler (Banner kaldırıldı, istatistik paneli eklendi) */}
      <OrnateFrame className="p-3.5 bg-gradient-to-r from-black/80 via-[#0d161a]/80 to-black/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded bg-black/50 border border-amber-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Günlük Tamamlanan
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-cinzel font-bold text-base sm:text-lg text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{completedDailyCount}</span>
            </div>
          </div>

          <div className="p-2 rounded bg-black/50 border border-sky-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Haftalık Tamamlanan
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-cinzel font-bold text-base sm:text-lg text-sky-300">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{completedWeeklyCount}</span>
            </div>
          </div>

          <div className="p-2 rounded bg-black/50 border border-purple-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Kazanılan Rozetler
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-cinzel font-bold text-base sm:text-lg text-purple-300">
              <Award className="w-4 h-4 text-purple-400" />
              <span>{completedBadgeCount}</span>
            </div>
          </div>

          <div className="p-2 rounded bg-black/50 border border-emerald-500/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Mevcut Paket
            </span>
            <div className="mt-1 flex items-center justify-center gap-1.5 font-cinzel font-bold text-base sm:text-lg text-emerald-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{completedInCurrentBatch} / 5</span>
            </div>
          </div>
        </div>

        {/* Info Note: Görevler otomatik takip edilir */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300 font-cormorant">
          <span>
            ⚡ <span className="text-amber-300 font-bold">Otomatik Takip:</span> Görevleri başlatmanıza gerek yoktur; zindan, boss ve maden seferleri otomatik sayılır ve bittiğinde ödüller anında heybenize eklenir.
          </span>
          <span className="text-[11px] font-mono text-amber-400/80">
            Seviye: Lv. {ensuredPlayer?.level || 1}
          </span>
        </div>
      </OrnateFrame>

      {/* 5/5 GÜNLÜK GÖREV TAMAMLAMA KUTLAMASI POP-UP / BANNER */}
      {dailyBatchJustCompleted && (
        <div className="p-4 rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-950/90 via-[#1b1509]/95 to-amber-950/90 text-center space-y-2 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce-short">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span>TEBRİKLER! 5 GÜNLÜK GÖREVİN TAMAMI BİTTİ!</span>
            </div>
            <button
              type="button"
              onClick={onDismissBatchNotice}
              className="text-xs text-slate-400 hover:text-white p-1 rounded bg-black/60 border border-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-200 font-cormorant leading-relaxed">
            Paket bonusu kazanıldı: <span className="text-yellow-300 font-bold font-mono">+35,000 Altın</span>, <span className="text-amber-300 font-bold font-mono">+75,000 EXP</span>, <span className="text-cyan-300 font-bold font-mono">+50 Kristal</span>! Yeni 5 adet seviyenize uygun görev paketiniz otomatik olarak atandı.
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. GÜNLÜK GÖREVLER (SABİT 5 ADET, BİTMEDEN YENİSİ GELMEZ) */}
      {/* ======================================================== */}
      {activeSubmenu === 'daily' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Günün Görevleri (5/5 Tamamlanınca Yeni Paket Gelir)</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
              Paket İlerlemesi: {completedInCurrentBatch} / 5
            </span>
          </div>

          <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}>
            {dailyQuests.map((q) => {
              const progressPct = Math.min(100, Math.round(((q.current || 0) / (q.target || 1)) * 100));
              return (
                <OrnateFrame
                  key={q.instanceId || q.id}
                  className={`p-3.5 space-y-2.5 flex flex-col justify-between transition-all ${
                    q.isCompleted
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div>
                    {/* Header badge & target */}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty} • Lv {q.levelMin}-{q.levelMax}
                      </span>
                      {q.isCompleted ? (
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> TAMAMLANDI
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" /> Günlük
                        </span>
                      )}
                    </div>

                    <h4 className="font-cinzel font-bold text-sm text-slate-100 mt-2">
                      {q.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-300 font-cormorant leading-relaxed">
                      {q.desc}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">İlerleme:</span>
                        <span className={q.isCompleted ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                          {(q.current || 0).toLocaleString('tr-TR')} / {(q.target || 1).toLocaleString('tr-TR')} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                        <div
                          className={`h-full transition-all duration-300 ${
                            q.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Test Action */}
                  <div className="pt-2.5 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-yellow-400 font-bold">
                        +{(q.rewardGold || 0).toLocaleString('tr-TR')} Altın
                      </span>
                      <span className="text-amber-300 font-bold">
                        +{(q.rewardExp || 0).toLocaleString('tr-TR')} EXP
                      </span>
                    </div>

                    {q.isCompleted ? (
                      <div className="w-full py-1.5 text-center text-[11px] font-mono text-emerald-300 bg-emerald-950/40 rounded border border-emerald-500/30 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ödül Otomatik Alındı</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onTestProgressQuest?.('daily', q.instanceId)}
                        className="w-full py-1.5 text-xs font-mono text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        title="Görevi anında tamamlayıp ödülünü topla"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Test: Görevi Tamamla</span>
                      </button>
                    )}
                  </div>
                </OrnateFrame>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HAFTALIK GÖREVLER (SABİT 20 ADET ZORLU GÖREV) */}
      {/* ======================================================== */}
      {activeSubmenu === 'weekly' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-sky-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Haftalık Sefer Görevleri (Sabit 20 Zorlu Görev)</span>
            </h3>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
              Tamamlanan: {completedWeeklyCount}
            </span>
          </div>

          <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}>
            {weeklyQuests.map((q) => {
              const progressPct = Math.min(100, Math.round(((q.current || 0) / (q.target || 1)) * 100));
              return (
                <OrnateFrame
                  key={q.instanceId || q.id}
                  className={`p-3.5 space-y-2.5 flex flex-col justify-between transition-all ${
                    q.isCompleted
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-white/10 hover:border-sky-500/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      {q.isCompleted ? (
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> TAMAMLANDI
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 7 Gün
                        </span>
                      )}
                    </div>

                    <h4 className="font-cinzel font-bold text-sm text-slate-100 mt-2">
                      {q.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-300 font-cormorant leading-relaxed">
                      {q.desc}
                    </p>

                    <div className="mt-2.5 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">İlerleme:</span>
                        <span className={q.isCompleted ? 'text-emerald-300 font-bold' : 'text-sky-300'}>
                          {(q.current || 0).toLocaleString('tr-TR')} / {(q.target || 1).toLocaleString('tr-TR')} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden border border-white/5">
                        <div
                          className={`h-full transition-all duration-300 ${
                            q.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-sky-500 to-blue-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-yellow-400 font-bold">
                        +{(q.rewardGold || 0).toLocaleString('tr-TR')} Altın
                      </span>
                      <span className="text-sky-300 font-bold">
                        +{(q.rewardExp || 0).toLocaleString('tr-TR')} EXP
                      </span>
                    </div>

                    {q.isCompleted ? (
                      <div className="w-full py-1.5 text-center text-[11px] font-mono text-emerald-300 bg-emerald-950/40 rounded border border-emerald-500/30 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ödül Otomatik Alındı</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onTestProgressQuest?.('weekly', q.instanceId)}
                        className="w-full py-1.5 text-xs font-mono text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900 border border-sky-500/40 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        title="Görevi anında tamamlayıp ödülünü topla"
                      >
                        <Zap className="w-3.5 h-3.5 text-sky-400" />
                        <span>Test: Görevi Tamamla</span>
                      </button>
                    )}
                  </div>
                </OrnateFrame>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. KADEMELİ ROZET GÖREVLERİ (KALICI STAT BONUSLARI) */}
      {/* ======================================================== */}
      {activeSubmenu === 'badges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-cinzel text-sm sm:text-base font-bold text-purple-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Kademeli Rozet Sistemi (Zorlu & Kalıcı Nitelikler)</span>
            </h3>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              Kazanılan Kademeler: {completedBadgeCount}
            </span>
          </div>

          <div className={`gap-4 ${isPC ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-4'}`}>
            {BADGE_DEFINITIONS.map((badge) => {
              const progress = badgeProgress[badge.id] || { currentCount: 0, currentTier: 0 };
              const currentTierIdx = progress.currentTier || 0;
              const nextTierIdx = currentTierIdx + 1;
              const nextTierObj = badge.tiers.find((t) => t.tier === nextTierIdx);
              const isMaxTier = currentTierIdx >= badge.tiers.length;

              const target = nextTierObj ? nextTierObj.target : badge.tiers[badge.tiers.length - 1].target;
              const currentCount = progress.currentCount || 0;
              const progressPct = isMaxTier
                ? 100
                : Math.min(100, Math.round((currentCount / target) * 100));

              return (
                <OrnateFrame key={badge.id} className="p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    {/* Header: Icon, Name & Current Tier */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-black/60 border border-purple-500/30">
                          {getBadgeIcon(badge.icon)}
                        </div>
                        <div>
                          <h4 className="font-cinzel font-bold text-sm text-slate-100">
                            {badge.name}
                          </h4>
                          <span className="text-[11px] font-mono text-purple-300">
                            Mevcut Kademe:{' '}
                            <span className="font-bold text-amber-300">
                              {currentTierIdx > 0 ? badge.tiers[currentTierIdx - 1]?.name : 'Başlanmadı'} (Kademe {currentTierIdx}/5)
                            </span>
                          </span>
                        </div>
                      </div>

                      {isMaxTier && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                          MAKSİMUM
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-300 font-cormorant leading-relaxed">
                      {badge.desc}
                    </p>

                    {/* Progress Bar to Next Tier */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">
                          {isMaxTier ? 'Tüm Kademeler Tamamlandı' : `Sıradaki: ${nextTierObj?.name} (Kademe ${nextTierIdx})`}
                        </span>
                        <span className="text-amber-300 font-bold">
                          {currentCount.toLocaleString('tr-TR')} / {target.toLocaleString('tr-TR')} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-amber-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Tier Road Map (5 Tiers preview) */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-5 gap-1.5 text-center">
                      {badge.tiers.map((t) => {
                        const isUnlocked = currentTierIdx >= t.tier;
                        return (
                          <div
                            key={t.tier}
                            className={`p-1.5 rounded border text-[10px] font-mono transition-all ${
                              isUnlocked
                                ? 'border-amber-500/60 bg-amber-950/40 text-amber-200'
                                : 'border-white/5 bg-black/40 text-slate-500'
                            }`}
                          >
                            <span className="block font-bold">K.{t.tier}</span>
                            <span className="block text-[9px] truncate">{t.target}x</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rewards & Permanent Stat Description */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>
                        Kalıcı Güç:{' '}
                        <span className="text-slate-200">
                          {nextTierObj ? nextTierObj.statDesc : badge.tiers[badge.tiers.length - 1].statDesc}
                        </span>
                      </span>
                    </div>

                    {/* Test button to advance badge progress */}
                    {!isMaxTier && (
                      <button
                        type="button"
                        onClick={() => onTestProgressQuest?.('badge', badge.id)}
                        className="w-full py-1 text-xs font-mono text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        title="Bu rozete hızlı test ilerlemesi ekle"
                      >
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        <span>Test: +10 İlerleme Ekle</span>
                      </button>
                    )}
                  </div>
                </OrnateFrame>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
