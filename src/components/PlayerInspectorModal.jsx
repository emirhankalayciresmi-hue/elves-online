// src/components/PlayerInspectorModal.jsx
// Detaylı Karakter İnceleme Modalı (Metin2 Tarzı Çift Panel)
// Solda 12 Ekipman Yuvası ve Eşya İnceleme Kartları, Sağda Detaylı Stat/Nitelik Analizi, Altta Sosyal Butonlar.

import React, { useState } from 'react';
import {
  X, Shield, Sword, Heart, Zap, Sparkles, Crown, Users, MessageSquare,
  Swords, ShieldAlert, Gem, CircleDot, Hand, Footprints, Layers, Wind,
  Feather, Target, Flame, Snowflake, CloudLightning, Activity, AlertCircle, Check
} from 'lucide-react';
import OrnateFrame from '@/components/OrnateFrame';
import ElvenButton from '@/components/ElvenButton';
import { ItemTooltipCard } from '@/components/ItemTooltip';
import { EQUIPMENT_SLOTS } from '@/core/config/gameData';
import { GUILD_FLAGS } from '@/core/config/guildData';

const SLOT_ICONS = {
  helmet: Crown,
  armor: Shield,
  weapon: Sword,
  offhand: ShieldAlert,
  necklace: Gem,
  ring1: CircleDot,
  ring2: CircleDot,
  gloves: Hand,
  boots: Footprints,
  belt: Layers,
  cloak: Wind,
  wings: Feather,
};

export default function PlayerInspectorModal({
  profile,
  onClose,
  onWhisper,
  onInviteParty,
  onInviteGuild,
  onChallengeDuel,
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pinnedItem, setPinnedItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [actionNotice, setActionNotice] = useState(null);

  if (!profile) return null;

  const displayedItem = pinnedItem || hoveredItem;

  const triggerNotice = (text, type = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleAction = (actionType) => {
    switch (actionType) {
      case 'whisper':
        if (onWhisper) onWhisper(profile.name);
        triggerNotice(`@${profile.name} ile fısıltı penceresi açıldı.`);
        break;
      case 'party':
        if (onInviteParty) onInviteParty(profile.name);
        triggerNotice(`[${profile.name}] grubunuza davet edildi.`);
        break;
      case 'guild':
        if (onInviteGuild) onInviteGuild(profile.name);
        triggerNotice(`[${profile.name}] loncanıza davet edildi.`);
        break;
      case 'duel':
        if (onChallengeDuel) onChallengeDuel(profile.name);
        triggerNotice(`⚔️ [${profile.name}] kahramanına kadim düello meydan okuması gönderildi!`);
        break;
      default:
        break;
    }
  };

  // Lonca bayrağı
  const guildFlagMeta = profile.guild?.flagId
    ? GUILD_FLAGS.find((f) => f.id === profile.guild.flagId) || GUILD_FLAGS[0]
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={() => {
        setPinnedItem(null);
        setHoveredItem(null);
      }}
    >
      <div
        className="w-full max-w-4xl my-auto bg-[#070c0e]/95 border border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] ring-1 ring-amber-400/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* 1. ÜST BAŞLIK & KİMLİK BANNERI                             */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-black/90 via-[#0e161c]/90 to-black/90 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Karakter Avatarı */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-amber-400 p-1 bg-black shadow-lg overflow-hidden flex-shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute bottom-1 right-1 bg-amber-950 text-amber-300 border border-amber-400 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold">
                Lv.{profile.level}
              </div>
            </div>

            {/* İsim, Unvan ve Krallık */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-100 gold-text-glow">
                  {profile.name}
                </h3>
                {profile.isSelf && (
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                    (Senin Karakterin)
                  </span>
                )}
              </div>

              <p className="text-xs font-cinzel text-amber-300/80 italic">
                "{profile.title}"
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  {profile.className}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300">
                  {profile.kingdomName}
                </span>
                {profile.guild ? (
                  <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    {profile.guild.name} ({profile.guild.rank})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-slate-500">
                    Loncasız
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sağ Üst: Savaş Gücü & Kapat Butonu */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-slate-400 hover:text-white hover:border-amber-400/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-right">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Fiziksel Saldırı
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-1.5 justify-end">
                <Sword className="w-4 h-4 text-amber-400" />
                {(profile.stats.physicalDamage || 15).toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Aksiyon Bildirim Bandı */}
        {actionNotice && (
          <div className="p-2 bg-emerald-950/80 border-y border-emerald-500/40 text-emerald-200 text-xs font-cinzel text-center flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ÇİFT PANEL GÖVDE: SOLDA EKİPMANLAR, SAĞDA ANALİZ       */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* ---------------- SOL PANEL: 12 EKİPMAN YUVASI ---------------- */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h4 className="font-cinzel text-xs sm:text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Kuşanılan Ekipmanlar ({Object.keys(profile.equipped || {}).length} / 12)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                (İncelemek için eşyaya gelin)
              </span>
            </div>

            {/* Metin2 Stili 12 Ekipman Izgarası */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 bg-black/40 p-3 rounded-xl border border-white/5 relative">
              {EQUIPMENT_SLOTS.map((slot) => {
                const item = profile.equipped?.[slot.id];
                const IconComponent = SLOT_ICONS[slot.id] || Shield;
                const isHovered = (hoveredItem?.instanceId === item?.instanceId) && Boolean(item);
                const isPinned = (pinnedItem?.instanceId === item?.instanceId) && Boolean(item);

                return (
                  <div
                    key={slot.id}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative p-1.5 transition-all cursor-pointer ${
                      isPinned
                        ? 'border-amber-400 bg-amber-950/30 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400'
                        : isHovered
                        ? 'border-amber-400/80 bg-white/5 scale-[1.03]'
                        : item
                        ? 'border-amber-500/40 bg-black/60 hover:border-amber-400'
                        : 'border-white/5 bg-black/30 opacity-40 hover:opacity-60'
                    }`}
                    onMouseEnter={(e) => {
                      if (item) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMousePos({ x: rect.right + 10, y: rect.top });
                        setHoveredItem(item);
                      }
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMousePos({ x: rect.right + 10, y: rect.top });
                        setPinnedItem((prev) => (prev?.instanceId === item.instanceId ? null : item));
                      }
                    }}
                  >
                    {item ? (
                      <>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-contain drop-shadow"
                        />
                        <span className="text-[9px] font-mono text-amber-300 truncate w-full text-center mt-1">
                          {item.name.replace(/.*?\s+(Miğferi|Zırhı|Kılıcı|Hançeri|Asası|Kolyesi|Yüzüğü|Eldiveni|Çizmesi|Kemeri|Pelerini|Kanatları)/i, '$1')}
                        </span>
                      </>
                    ) : (
                      <>
                        <IconComponent className="w-5 h-5 text-slate-500 mb-1" />
                        <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                          {slot.name}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Açık Eşya Tooltip Kartı */}
            {displayedItem && (
              <div className="pt-2 animate-fadeIn">
                <ItemTooltipCard
                  item={displayedItem}
                  isEquipped={true}
                  titlePrefix="İncelenen Ekipman"
                  isPinned={Boolean(pinnedItem)}
                  onClose={() => {
                    setPinnedItem(null);
                    setHoveredItem(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* ---------------- SAĞ PANEL: DETAYLI ANALİZ & STATLAR ---------------- */}
          <div className="lg:col-span-6 space-y-4">
            {/* Bölüm 1: Temel Nitelikler */}
            <OrnateFrame className="p-3.5 space-y-2.5">
              <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Temel Nitelikler</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-rose-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> Can (HP):
                  </span>
                  <strong className="text-rose-200">{profile.stats.hp}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-sky-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Mana:
                  </span>
                  <strong className="text-sky-200">{profile.stats.mana}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-amber-300">GÜÇ (STR):</span>
                  <strong className="text-amber-100">{profile.stats.strength}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-emerald-300">ÇEVİKLİK (AGI):</span>
                  <strong className="text-emerald-100">{profile.stats.agility}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-sky-300">ZEKA (INT):</span>
                  <strong className="text-sky-100">{profile.stats.intelligence || 0}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex justify-between items-center">
                  <span className="text-indigo-300">SAVUNMA:</span>
                  <strong className="text-indigo-100">{profile.stats.defense || 0}</strong>
                </div>
              </div>
            </OrnateFrame>

            {/* Bölüm 2: Savaş & Şans Oranları (%) */}
            <OrnateFrame className="p-3.5 space-y-2.5">
              <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Savaş & Şans Oranları (%)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px]">KAÇINMA ŞANSI</span>
                  <strong className="text-cyan-300 text-sm mt-0.5">
                    %{profile.stats.dodgeChance?.toFixed(1) || '0.0'}
                  </strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px]">KRİTİK VURUŞ</span>
                  <strong className="text-emerald-300 text-sm mt-0.5">
                    %{profile.stats.criticalChance?.toFixed(1) || '0.0'}
                  </strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px]">ZIRH DELME</span>
                  <strong className="text-purple-300 text-sm mt-0.5">
                    %{profile.stats.armorPenetration?.toFixed(1) || '10.0'}
                  </strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px]">SERSEMLETME</span>
                  <strong className="text-yellow-300 text-sm mt-0.5">
                    %{profile.stats.stunChance?.toFixed(1) || '8.0'}
                  </strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px]">ZEHİRLEME</span>
                  <strong className="text-green-400 text-sm mt-0.5">
                    %{profile.stats.poisonChance?.toFixed(1) || '5.0'}
                  </strong>
                </div>
              </div>
            </OrnateFrame>

            {/* Bölüm 3: Sınıflara Karşı Güç (%) */}
            <OrnateFrame className="p-3.5 space-y-2.5">
              <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <Sword className="w-4 h-4 text-amber-400" />
                <span>Sınıflara Karşı Güç (%)</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Savaşçı</span>
                  <strong className="text-amber-300 text-sm">
                    %{profile.stats.vsWarrior?.toFixed(1) || '15.0'}
                  </strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Ninja</span>
                  <strong className="text-emerald-300 text-sm">
                    %{profile.stats.vsNinja?.toFixed(1) || '12.0'}
                  </strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
                  <span className="text-slate-400 text-[10px] block">Büyücü</span>
                  <strong className="text-sky-300 text-sm">
                    %{profile.stats.vsMage?.toFixed(1) || '14.0'}
                  </strong>
                </div>
              </div>
            </OrnateFrame>

            {/* Bölüm 4: Element Güçleri (%) */}
            <OrnateFrame className="p-3.5 space-y-2.5">
              <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Elementlere Karşı Güç (%)</span>
              </h4>

              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-rose-950/60 text-center">
                  <Flame className="w-3.5 h-3.5 text-rose-400 mx-auto mb-0.5" />
                  <span className="text-slate-400 text-[9px] block">Ateş</span>
                  <strong className="text-rose-300 text-xs">%{profile.stats.fireBonus?.toFixed(1) || '10.0'}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-cyan-950/60 text-center">
                  <Snowflake className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                  <span className="text-slate-400 text-[9px] block">Buz</span>
                  <strong className="text-cyan-300 text-xs">%{profile.stats.iceBonus?.toFixed(1) || '10.0'}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-teal-950/60 text-center">
                  <Wind className="w-3.5 h-3.5 text-teal-400 mx-auto mb-0.5" />
                  <span className="text-slate-400 text-[9px] block">Rüzgar</span>
                  <strong className="text-teal-300 text-xs">%{profile.stats.windBonus?.toFixed(1) || '10.0'}</strong>
                </div>

                <div className="p-2 rounded bg-black/40 border border-amber-950/60 text-center">
                  <CloudLightning className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
                  <span className="text-slate-400 text-[9px] block">Şimşek</span>
                  <strong className="text-amber-300 text-xs">%{profile.stats.lightningBonus?.toFixed(1) || '10.0'}</strong>
                </div>
              </div>
            </OrnateFrame>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. ALT SOSYAL EYLEM BUTONLARI                             */}
        {/* ======================================================== */}
        <div className="p-3 sm:p-4 border-t border-amber-500/20 bg-black/80 flex flex-wrap items-center justify-between gap-2.5">
          {profile.isSelf ? (
            <div className="text-xs text-amber-300/80 font-cinzel italic w-full text-center sm:text-left">
              Bu profil sizin kendi karakterinize aittir.
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Fısılda (PM) */}
              <button
                onClick={() => handleAction('whisper')}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-400/40 hover:bg-amber-500/30 text-amber-200 font-cinzel text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Fısılda (PM)</span>
              </button>

              {/* Gruba Davet Et */}
              <button
                onClick={() => handleAction('party')}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-sky-950/40 border border-sky-500/40 hover:bg-sky-900/50 text-sky-200 font-cinzel text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Gruba Davet</span>
              </button>

              {/* Loncaya Davet Et */}
              <button
                onClick={() => handleAction('guild')}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/50 text-emerald-200 font-cinzel text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Loncaya Davet</span>
              </button>

              {/* Düello Meydan Okuması */}
              <button
                onClick={() => handleAction('duel')}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/50 text-rose-200 font-cinzel text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.2)]"
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>Düello Teklifi</span>
              </button>
            </div>
          )}

          <div className="w-full sm:w-auto flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-cinzel text-xs transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
