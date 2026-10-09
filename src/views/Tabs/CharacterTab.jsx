import React from 'react';
import {
  Shield, Sword, Sparkles, User, Award, Heart, Zap,
  Crosshair, ShieldCheck, Flame, Snowflake, CloudLightning, Activity, Target,
  Crown, Castle, BookOpen, Layers, Skull, Users, ChevronRight, Compass,
  RotateCcw
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { ASSETS } from '../../config/assets';
import {
  DEFAULT_PLAYER_STATS,
  KINGDOMS,
  CLASSES,
  calculatePlayerStats,
  MAX_STAT_CAP,
} from '../../config/gameData';
import { calculateBadgeStats, BADGE_DEFINITIONS } from '../../config/questData';

export default function CharacterTab({
  player,
  layoutMode = 'mobile',
  onAllocateStat,
  onResetStats,
}) {
  if (!player) return null;

  const isPC = layoutMode === 'pc';
  const classAssets = ASSETS.classes[player.classId] || {};

  // Oyuncunun sınıf ve krallık detayları
  const currentKingdom = KINGDOMS.find(
    (k) => k.id === player.kingdomId || k.name === player.kingdomName
  ) || KINGDOMS[0];

  const currentClass = CLASSES.find(
    (c) => c.id === player.classId || c.name === player.className
  ) || CLASSES[0];

  // Rozet bonusları ve genel istatistikler
  const badgeBonus = calculateBadgeStats(player?.questState?.badgeProgress);
  const currentLevel = player.level || 1;
  const equippedCount = Object.keys(player?.equipped || {}).length;

  // Hesaplanan nihai RPG nitelikleri (Karakter Gelişimi)
  const stats = calculatePlayerStats(player, badgeBonus);
  const allocated = stats.allocatedStats || { hp: 0, str: 0, agi: 0, int: 0 };
  const availablePoints = stats.statPoints || 0;

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Üst Karakter Bilgileri Başlığı */}
      <OrnateFrame className="p-4 bg-gradient-to-r from-black/90 via-amber-950/25 to-black/90">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-elven-gold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg text-amber-100 gold-text-glow tracking-wider">
                Karakter Bilgileri
              </h1>
              <p className="text-xs text-amber-200/70 font-cormorant">
                Kadim elven soyağacı, dövüş uzmanlıkları, temel stat dağıtımı ve savaş oranları dökümü.
              </p>
            </div>
          </div>

          {/* Stat Puanı & Kuşanılan Eşya Göstergesi */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div
              className={`px-3.5 py-1.5 rounded-lg bg-black/60 border ${
                availablePoints > 0
                  ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse'
                  : 'border-amber-500/40'
              } flex items-center gap-2 shadow-inner`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-left font-mono leading-tight">
                <span className="text-[10px] text-slate-400 block">STAT PUANI</span>
                <span className="text-sm font-bold text-amber-200">{availablePoints} Puan</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-emerald-500/30 flex items-center gap-2 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left font-mono leading-tight">
                <span className="text-[10px] text-slate-400 block">KUŞAM DURUMU</span>
                <span className="text-xs font-bold text-emerald-300">{equippedCount} / 12 Yuva Dolu</span>
              </div>
            </div>
          </div>
        </div>
      </OrnateFrame>

      {/* İki Sütunlu Kapsamlı RPG Bilgi Düzeni */}
      <div className={`grid gap-4 items-start ${isPC ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* SOL SÜTUN: Portre, Sınıf Uzmanlığı & Krallık Mirası */}
        <div className={`space-y-4 ${isPC ? 'lg:col-span-5' : 'w-full'}`}>
          {/* Karakter Portresi & Görsel Kimlik Kartı */}
          <OrnateFrame className="p-4 space-y-3 text-center">
            <div className="w-48 h-64 mx-auto rounded-lg overflow-hidden border border-elven-gold/60 shadow-2xl relative bg-black/60">
              <ImagePlaceholder
                src={player.classImage || classAssets.portrait}
                alt={player.name}
                label="Karakter Portresi"
                dimensions="3:4 (300x400px)"
                pathHint={`ASSETS.classes.${player.classId}.portrait`}
                aspectRatio="aspect-[3/4]"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 text-center">
                <span className="text-xs font-cinzel font-bold text-amber-100 gold-text-glow">
                  {player.name}
                </span>
                <span className="block text-[10px] text-amber-300/80 font-mono">
                  Seviye {player.level || 1} • {currentClass.name}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-cinzel font-bold text-sm">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{player.name}</span>
              </div>
              <p className="text-xs text-slate-400 font-cormorant italic">
                {currentClass.lore || currentClass.description}
              </p>
            </div>
          </OrnateFrame>

          {/* Sınıf Bilgileri & Dövüş Uzmanlıkları */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Sınıf Uzmanlığı: {currentClass.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300/80 uppercase">
                {currentClass.role || 'Savaşçı Sınıfı'}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
              {currentClass.description}
            </p>

            <div className="p-2.5 rounded bg-black/40 border border-amber-950/40 text-[11px] font-mono text-slate-300 space-y-1">
              <span className="text-amber-400 block font-bold">🎯 Öne Çıkan Özellik:</span>
              <span>{currentClass.traits || 'Kadim dövüş sanatı ve elven refleksleri ustası.'}</span>
            </div>
          </OrnateFrame>

          {/* Krallık Mirası & Bağlılık */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Castle className="w-4 h-4 text-amber-400" />
                <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Krallık Mirası: {currentKingdom.name}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300/80">
                Kadim Elf Diyarı
              </span>
            </div>

            <p className="text-xs text-slate-300 font-cormorant leading-relaxed italic">
              &quot;{currentKingdom.description}&quot;
            </p>
            <div className="p-2.5 rounded bg-sky-950/20 border border-sky-500/20 text-[11px] text-sky-300 font-mono">
              ✨ <strong>Krallık Lütfu:</strong> Kadim elven diyarının manevi koruması ile tüm zindan ve maceralarda krallık şerefiyle savaşıyorsunuz.
            </div>
          </OrnateFrame>
        </div>

        {/* SAĞ SÜTUN: Stat Dağıtımı, Temel Nitelikler, Savaş Oranları, Sınıf ve Element Güçleri */}
        <div className={`space-y-4 ${isPC ? 'lg:col-span-7' : 'w-full'}`}>
          
          {/* BÖLÜM 1: Stat Dağıtımı & Geliştirme (Metin2 Tipi 6 Puan / Seviye & Maks 90 Sınırı) */}
          <OrnateFrame className="p-4 space-y-3.5 bg-gradient-to-br from-black/90 via-amber-950/20 to-black/90 border-amber-500/40">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                    Stat Dağıtımı & Geliştirme
                  </h3>
                  <p className="text-[10px] text-slate-400 font-cormorant">
                    Her seviyede +6 Stat Puanı kazanırsınız. Stat başına sınır: 90 / 90.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 font-mono text-xs">
                  <span className="text-slate-400 text-[10px]">Kalan: </span>
                  <strong className="text-amber-300 font-bold">{availablePoints} Puan</strong>
                </div>
                {onResetStats && (
                  <button
                    onClick={onResetStats}
                    title="Kullanılan stat puanlarını sıfırla ve yeniden dağıt"
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/50 text-[10px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sıfırla</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Stat Dağıtım Kartı */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              {/* CAN (HP) */}
              <div className="p-3 rounded-lg bg-black/60 border border-rose-900/50 hover:border-rose-500/40 transition-all space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-rose-500/20 text-rose-400">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-rose-300 flex items-center gap-1.5">
                        <span>CAN (HP)</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          [{allocated.hp || 0} / {MAX_STAT_CAP}]
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-cormorant">
                        +40 Max Can / Puan
                      </span>
                    </div>
                  </div>

                  {/* Artırma Butonları */}
                  <div className="flex items-center gap-1">
                    {(allocated.hp || 0) >= MAX_STAT_CAP ? (
                      <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                        MAX
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onAllocateStat && onAllocateStat('hp', 1)}
                          disabled={availablePoints < 1}
                          className="px-2 py-1 rounded bg-rose-950/60 border border-rose-600/40 text-rose-200 hover:bg-rose-900 hover:border-rose-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        {availablePoints >= 5 && (
                          <button
                            onClick={() => onAllocateStat && onAllocateStat('hp', 5)}
                            className="px-2 py-1 rounded bg-rose-900/40 border border-rose-500/40 text-rose-200 hover:bg-rose-800 hover:border-rose-300 font-bold transition-all cursor-pointer"
                          >
                            +5
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-rose-950">
                  <div
                    className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((allocated.hp || 0) / MAX_STAT_CAP) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Mevcut Katkı:</span>
                  <span className="text-rose-300 font-bold">+{(allocated.hp || 0) * 40} Can</span>
                </div>
              </div>

              {/* GÜÇ (STR) */}
              <div className="p-3 rounded-lg bg-black/60 border border-amber-900/50 hover:border-amber-500/40 transition-all space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-amber-500/20 text-amber-400">
                      <Sword className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <span>GÜÇ (STR)</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          [{allocated.str || 0} / {MAX_STAT_CAP}]
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-cormorant">
                        +3 Direkt Hasar / Puan
                      </span>
                    </div>
                  </div>

                  {/* Artırma Butonları */}
                  <div className="flex items-center gap-1">
                    {(allocated.str || 0) >= MAX_STAT_CAP ? (
                      <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                        MAX
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onAllocateStat && onAllocateStat('str', 1)}
                          disabled={availablePoints < 1}
                          className="px-2 py-1 rounded bg-amber-950/60 border border-amber-600/40 text-amber-200 hover:bg-amber-900 hover:border-amber-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        {availablePoints >= 5 && (
                          <button
                            onClick={() => onAllocateStat && onAllocateStat('str', 5)}
                            className="px-2 py-1 rounded bg-amber-900/40 border border-amber-500/40 text-amber-200 hover:bg-amber-800 hover:border-amber-300 font-bold transition-all cursor-pointer"
                          >
                            +5
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-amber-950">
                  <div
                    className="h-full bg-gradient-to-r from-amber-700 to-amber-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((allocated.str || 0) / MAX_STAT_CAP) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Mevcut Katkı:</span>
                  <span className="text-amber-300 font-bold">+{(allocated.str || 0) * 3} Hasar</span>
                </div>
              </div>

              {/* ÇEVİKLİK (AGI) */}
              <div className="p-3 rounded-lg bg-black/60 border border-emerald-900/50 hover:border-emerald-500/40 transition-all space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                        <span>ÇEVİKLİK (AGI)</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          [{allocated.agi || 0} / {MAX_STAT_CAP}]
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-cormorant">
                        +2 Savunma, +%0.2 Kaçınma, +%0.2 Kritik
                      </span>
                    </div>
                  </div>

                  {/* Artırma Butonları */}
                  <div className="flex items-center gap-1">
                    {(allocated.agi || 0) >= MAX_STAT_CAP ? (
                      <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                        MAX
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onAllocateStat && onAllocateStat('agi', 1)}
                          disabled={availablePoints < 1}
                          className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-200 hover:bg-emerald-900 hover:border-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        {availablePoints >= 5 && (
                          <button
                            onClick={() => onAllocateStat && onAllocateStat('agi', 5)}
                            className="px-2 py-1 rounded bg-emerald-900/40 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-800 hover:border-emerald-300 font-bold transition-all cursor-pointer"
                          >
                            +5
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-emerald-950">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((allocated.agi || 0) / MAX_STAT_CAP) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Mevcut Katkı:</span>
                  <span className="text-emerald-300 font-bold">
                    +{(allocated.agi || 0) * 2} Sav | +%{((allocated.agi || 0) * 0.2).toFixed(1)} Kaç/Krit
                  </span>
                </div>
              </div>

              {/* ZEKA (INT) */}
              <div className="p-3 rounded-lg bg-black/60 border border-sky-900/50 hover:border-sky-500/40 transition-all space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-sky-500/20 text-sky-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sky-300 flex items-center gap-1.5">
                        <span>ZEKA (INT)</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          [{allocated.int || 0} / {MAX_STAT_CAP}]
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-cormorant">
                        +25 Mana, +3 Büyü Hasarı / Puan
                      </span>
                    </div>
                  </div>

                  {/* Artırma Butonları */}
                  <div className="flex items-center gap-1">
                    {(allocated.int || 0) >= MAX_STAT_CAP ? (
                      <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold">
                        MAX
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => onAllocateStat && onAllocateStat('int', 1)}
                          disabled={availablePoints < 1}
                          className="px-2 py-1 rounded bg-sky-950/60 border border-sky-600/40 text-sky-200 hover:bg-sky-900 hover:border-sky-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
                        >
                          +1
                        </button>
                        {availablePoints >= 5 && (
                          <button
                            onClick={() => onAllocateStat && onAllocateStat('int', 5)}
                            className="px-2 py-1 rounded bg-sky-900/40 border border-sky-500/40 text-sky-200 hover:bg-sky-800 hover:border-sky-300 font-bold transition-all cursor-pointer"
                          >
                            +5
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-sky-950">
                  <div
                    className="h-full bg-gradient-to-r from-sky-700 to-sky-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((allocated.int || 0) / MAX_STAT_CAP) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Mevcut Katkı:</span>
                  <span className="text-sky-300 font-bold">
                    +{(allocated.int || 0) * 25} Mana | +{(allocated.int || 0) * 3} Büyü
                  </span>
                </div>
              </div>
            </div>
          </OrnateFrame>

          {/* BÖLÜM 2: Temel Nitelikler (Core Attributes - Nihai Değerler) */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Temel Nitelikler (Core Attributes)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Stat & Rozet Toplamı
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {/* HP */}
              <div className="p-3 rounded-lg bg-black/50 border border-rose-900/50 space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <Heart className="w-3.5 h-3.5" /> HP (Maksimum Can)
                  </span>
                  <span className="text-rose-300 font-bold">
                    {stats.hp.toLocaleString('tr-TR')} / {stats.maxHp.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-full" />
                </div>
                <p className="text-[10px] text-slate-400 font-cormorant">
                  Karakterin yaşam gücü. Zindan ve boss darbelerinde hayatta kalmayı sağlar.
                </p>
              </div>

              {/* MANA */}
              <div className="p-3 rounded-lg bg-black/50 border border-sky-900/50 space-y-1.5">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <Zap className="w-3.5 h-3.5" /> MANA (Büyü Gücü)
                  </span>
                  <span className="text-sky-300 font-bold">
                    {stats.mana.toLocaleString('tr-TR')} / {stats.maxMana.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 w-full" />
                </div>
                <p className="text-[10px] text-slate-400 font-cormorant">
                  Özel teknikler ve kadim elven büyülerinin icrası için tüketilir.
                </p>
              </div>

              {/* GÜÇ */}
              <div className="p-3 rounded-lg bg-black/50 border border-amber-900/50 space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sword className="w-3.5 h-3.5" /> GÜÇ (STR)
                  </span>
                  <div className="text-right">
                    <span className="text-amber-300 font-bold text-sm block">{stats.strength}</span>
                    <span className="text-[10px] text-slate-400">({stats.physicalDamage} Hasar)</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-cormorant">
                  Fiziksel yakın dövüş saldırı hasarını doğrudan artırır (+3 hasar / STR).
                </p>
              </div>

              {/* ÇEVİKLİK */}
              <div className="p-3 rounded-lg bg-black/50 border border-emerald-900/50 space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Crosshair className="w-3.5 h-3.5" /> ÇEVİKLİK (AGI)
                  </span>
                  <div className="text-right">
                    <span className="text-emerald-300 font-bold text-sm block">{stats.agility}</span>
                    <span className="text-[10px] text-slate-400">({stats.defense} Sav | %{stats.dodgeChance} Kaç)</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-cormorant">
                  Kaçınma şansını, kritik darbe olasılığını ve savunmayı yükseltir.
                </p>
              </div>

              {/* ZEKA */}
              <div className="p-3 rounded-lg bg-black/50 border border-sky-900/50 space-y-1 sm:col-span-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                    <Zap className="w-3.5 h-3.5" /> ZEKA (INT)
                  </span>
                  <div className="text-right">
                    <span className="text-sky-300 font-bold text-sm block">{stats.intelligence}</span>
                    <span className="text-[10px] text-slate-400">({stats.magicDamage} Büyü Hasarı)</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-cormorant">
                  Büyü hasarını ve maksimum mana kapasitesini artırır.
                </p>
              </div>
            </div>
          </OrnateFrame>

          {/* BÖLÜM 3: Savaş & Şans Oranları (%) */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Savaş & Şans Oranları (%)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Muharebe Çarpanları
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Kaçınma Şansı:</span>
                <span className="text-cyan-300 font-bold">%{stats.dodgeChance.toFixed(1)}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Kritik Vuruş Şansı:</span>
                <span className="text-emerald-300 font-bold">%{stats.criticalChance.toFixed(1)}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Zırh Delme Şansı:</span>
                <span className="text-purple-300 font-bold">%{stats.armorPenetration.toFixed(1)}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Sersemletme Şansı:</span>
                <span className="text-yellow-300 font-bold">%{stats.stunChance.toFixed(1)}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Zehirleme Şansı:</span>
                <span className="text-green-400 font-bold">%{stats.poisonChance.toFixed(1)}</span>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Hasar Yansıtma:</span>
                <span className="text-teal-300 font-bold">%{stats.reflectChance.toFixed(1)}</span>
              </div>
            </div>
          </OrnateFrame>

          {/* BÖLÜM 4: Sınıflara Karşı Güç (%) */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Sword className="w-4 h-4 text-amber-400" />
                <span>Sınıflara Karşı Üstünlük Oranları (%)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded bg-black/40 border border-rose-950/60 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px]">SAVAŞÇILARA KARŞI</span>
                <span className="text-rose-300 font-bold text-base mt-1">%{stats.vsWarrior.toFixed(1)}</span>
              </div>
              <div className="p-3 rounded bg-black/40 border border-emerald-950/60 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px]">NİNJALARA KARŞI</span>
                <span className="text-emerald-300 font-bold text-base mt-1">%{stats.vsNinja.toFixed(1)}</span>
              </div>
              <div className="p-3 rounded bg-black/40 border border-sky-950/60 flex flex-col justify-between">
                <span className="text-slate-400 text-[10px]">BÜYÜCÜLERE KARŞI</span>
                <span className="text-sky-300 font-bold text-base mt-1">%{stats.vsMage.toFixed(1)}</span>
              </div>
            </div>
          </OrnateFrame>

          {/* BÖLÜM 5: Kadim Element Dirençleri & Güçleri (%) */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Element Güçleri & Kadim Savunmalar (%)</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-black/40 border border-rose-950/60 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Ateş Gücü</p>
                  <p className="text-rose-300 font-bold">%{stats.fireBonus.toFixed(1)}</p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-cyan-950/60 flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Buz Gücü</p>
                  <p className="text-cyan-300 font-bold">%{stats.iceBonus.toFixed(1)}</p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-teal-950/60 flex items-center gap-2">
                <CloudLightning className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Rüzgar Gücü</p>
                  <p className="text-teal-300 font-bold">%{stats.windBonus.toFixed(1)}</p>
                </div>
              </div>

              <div className="p-2.5 rounded bg-black/40 border border-amber-950/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400">Şimşek Gücü</p>
                  <p className="text-amber-300 font-bold">%{stats.lightningBonus.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </OrnateFrame>

          {/* BÖLÜM 6: Rozet ve Kahramanlık Başarımları */}
          <OrnateFrame className="p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Kalıcı Rozet Bonusları & Unvan İlerlemesi</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-cormorant">
              Görevler sekmesinde tamamladığınız kademeli rozet görevleri karakterinize kalıcı nitelik artışları sağlar.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
              <div className="p-2 rounded bg-black/50 border border-amber-500/20 text-center">
                <span className="text-slate-400 block text-[10px]">ROZET GÜCÜ</span>
                <span className="text-amber-300 font-bold">+{badgeBonus.strength || 0} STR</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-emerald-500/20 text-center">
                <span className="text-slate-400 block text-[10px]">ROZET ÇEVİKLİĞİ</span>
                <span className="text-emerald-300 font-bold">+{badgeBonus.agility || 0} AGI</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-purple-500/20 text-center">
                <span className="text-slate-400 block text-[10px]">ROZET KRİTİĞİ</span>
                <span className="text-purple-300 font-bold">+%{badgeBonus.criticalChance || 0} KRİT</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-rose-500/20 text-center">
                <span className="text-slate-400 block text-[10px]">ROZET DELMESİ</span>
                <span className="text-rose-300 font-bold">+%{badgeBonus.armorPenetration || 0} DELME</span>
              </div>
            </div>
          </OrnateFrame>

        </div>
      </div>
    </div>
  );
}
