import React, { useState } from 'react';
import {
  Shield, Sword, Sparkles, User, Award, Heart, Zap,
  Crosshair, ShieldCheck, Flame, Snowflake, CloudLightning, Activity, Target,
  Crown, Castle, BookOpen, Layers, Skull, Users, ChevronRight, Compass,
  RotateCcw, ShieldAlert, Gem, CircleDot, Hand, Footprints, Wind, Feather,
  Coins, Info, ArrowDownCircle, Check, ArrowRightLeft
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ItemContextMenu from '../../components/ItemContextMenu';
import {
  KINGDOMS,
  CLASSES,
  calculatePlayerStats,
  MAX_STAT_CAP,
  EQUIPMENT_SLOTS,
} from '../../config/gameData';
import { calculateBadgeStats } from '../../config/questData';
import { getRequiredExp } from '../../config/dungeonData';
import { isItemForPlayerClass, isItemForSlot } from '../../config/itemsData';

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

export default function CharacterTab({
  player,
  layoutMode = 'mobile',
  onEquipItem,
  onUnequipItem,
  onDiscardItem,
  onAllocateStat,
  onResetStats,
}) {
  if (!player) return null;

  const isPC = layoutMode === 'pc';
  const [selectedSlotId, setSelectedSlotId] = useState('weapon');
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null,
    isEquipped: false,
    slotKey: null,
  });
  const [lastEquipTap, setLastEquipTap] = useState({ time: 0, slotId: null });
  const [lastCandidateTap, setLastCandidateTap] = useState({ time: 0, itemId: null });

  // Oyuncunun sınıf ve krallık detayları
  const currentKingdom = KINGDOMS.find(
    (k) => k.id === player.kingdomId || k.name === player.kingdomName
  ) || KINGDOMS[0];

  const currentClass = CLASSES.find(
    (c) => c.id === player.classId || c.name === player.className
  ) || CLASSES[0];

  // Rozet bonusları ve genel istatistikler
  const badgeBonus = calculateBadgeStats(player?.questState?.badgeProgress);
  const equippedCount = Object.keys(player?.equipped || {}).length;

  // Hesaplanan nihai RPG nitelikleri (Karakter Gelişimi)
  const stats = calculatePlayerStats(player, badgeBonus);
  const allocated = stats.allocatedStats || { hp: 0, str: 0, agi: 0, int: 0 };
  const availablePoints = stats.statPoints || 0;

  // Seviye ve Tecrübe (EXP) hesaplaması
  const currentLevel = player.level || 1;
  const maxExp = player.maxExp || getRequiredExp(currentLevel);
  const currentExp = player.exp || 0;
  const expPercent = Math.min(100, Math.max(0, Math.round((currentExp / (maxExp || 100)) * 100)));

  // Savaş Gücü (Combat Power / CP) Hesabı
  const combatPower = Math.round(
    (stats.physicalDamage || 0) * 2 +
    (stats.magicDamage || 0) * 2 +
    (stats.defense || 0) * 2 +
    (stats.maxHp || 500) / 10 +
    (stats.maxMana || 500) / 20 +
    equippedCount * 45 +
    currentLevel * 30
  );

  // Seçili yuva ve kuşanılan eşya
  const selectedSlot = EQUIPMENT_SLOTS.find((s) => s.id === selectedSlotId) || EQUIPMENT_SLOTS[0];
  const selectedEquippedItem = player?.equipped?.[selectedSlot.id] || null;

  // Çantadaki bu yuvaya ve oyuncunun kendi sınıfına uygun aday eşyalar (Yabancı sınıflar elenir)
  const candidateItems = (player?.inventory || []).filter(
    (item) => isItemForSlot(item, selectedSlot.id) && isItemForPlayerClass(item, player)
  );

  return (
    <div
      onClick={() => {
        if (contextMenu.isOpen) {
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: false, slotKey: null });
        }
      }}
      className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}
    >
      {/* ======================================================== */}
      {/* 1. ÜST GENEL DURUM & OYUNCU ÖZ PANELİ (PC & MOBİL SENKRON) */}
      {/* ======================================================== */}
      <OrnateFrame className="p-4 sm:p-5 bg-gradient-to-r from-black/95 via-amber-950/30 to-black/95 border-amber-500/40 w-full shadow-2xl">
        <div className="space-y-4">
          {/* Üst Satır: Karakter Adı, Rozetler & Savaş Gücü */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-950/80 border border-amber-400/60 flex items-center justify-center text-amber-200 shadow-elven-gold">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-cinzel font-bold text-xl sm:text-2xl text-amber-100 gold-text-glow tracking-wider">
                    {player.name || 'Arwen'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-bold shadow-inner">
                    Seviye {currentLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-cinzel font-semibold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                    <Crosshair className="w-3 h-3 text-emerald-400" />
                    <span>{currentClass.name}</span>
                  </span>
                  <span className="text-[11px] font-cinzel font-semibold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 shadow-sm">
                    <Castle className="w-3 h-3 text-amber-400" />
                    <span>{currentKingdom.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Savaş Gücü & Dağıtılabilir Stat Puanı Göstergesi */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Savaş Gücü (CP) */}
              <div className="px-3.5 py-2 rounded-xl bg-black/80 border border-amber-400/60 shadow-[0_0_18px_rgba(251,191,36,0.25)] flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Sword className="w-4 h-4" />
                </div>
                <div className="text-left font-mono leading-tight">
                  <span className="text-[9px] text-slate-400 block tracking-wider uppercase">SAVAŞ GÜCÜ</span>
                  <span className="text-base font-bold text-amber-200 gold-text-glow">
                    {combatPower.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Dağıtılabilir Stat Puanı */}
              <div
                className={`px-3.5 py-2 rounded-xl bg-black/80 border ${
                  availablePoints > 0
                    ? 'border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.35)] animate-pulse'
                    : 'border-white/10'
                } flex items-center gap-2.5`}
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left font-mono leading-tight">
                  <span className="text-[9px] text-slate-400 block uppercase">STAT PUANI</span>
                  <span className={`text-sm font-bold ${availablePoints > 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                    {availablePoints} Puan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Orta Satır: Canlı Durum Barları (CAN, MANA, EXP) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* CAN (HP) Barı */}
            <div className="p-3 rounded-xl bg-black/60 border border-rose-900/50 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/30" /> CAN (HP)
                </span>
                <span className="text-rose-200 font-bold">
                  {stats.hp.toLocaleString('tr-TR')} / {stats.maxHp.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/90 rounded-full overflow-hidden border border-rose-950 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (stats.hp / (stats.maxHp || 500)) * 100))}%` }}
                />
              </div>
            </div>

            {/* MANA (MP) Barı */}
            <div className="p-3 rounded-xl bg-black/60 border border-sky-900/50 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Zap className="w-3.5 h-3.5 fill-sky-500/30" /> MANA (MP)
                </span>
                <span className="text-sky-200 font-bold">
                  {stats.mana.toLocaleString('tr-TR')} / {stats.maxMana.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/90 rounded-full overflow-hidden border border-sky-950 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-sky-700 via-sky-500 to-sky-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (stats.mana / (stats.maxMana || 500)) * 100))}%` }}
                />
              </div>
            </div>

            {/* DENEYİM (EXP) Barı */}
            <div className="p-3 rounded-xl bg-black/60 border border-emerald-900/50 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> DENEYİM (EXP)
                </span>
                <span className="text-emerald-200 font-bold">
                  {currentExp.toLocaleString('tr-TR')} / {maxExp.toLocaleString('tr-TR')} (%{expPercent})
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/90 rounded-full overflow-hidden border border-emerald-950 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Alt Satır: Varlıklar & Kuşam Özeti */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/50 border border-amber-500/20 flex items-center gap-2.5">
              <Coins className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">ALTIN</span>
                <span className="text-amber-200 font-bold">
                  {(player.gold || 0).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/20 flex items-center gap-2.5">
              <Gem className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">KRİSTAL</span>
                <span className="text-cyan-200 font-bold">
                  {(player.crystals || 0).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-purple-500/20 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">ENERJİ</span>
                <span className="text-purple-200 font-bold">
                  {player.energy || 100} / 100
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/50 border border-emerald-500/20 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block">KUŞAM DURUMU</span>
                <span className="text-emerald-300 font-bold">
                  {equippedCount} / 12 Yuva Dolu
                </span>
              </div>
            </div>
          </div>
        </div>
      </OrnateFrame>

      {/* ======================================================== */}
      {/* 2. ANA GÖVDE: SOLDA EKİPMANLAR, SAĞDA STAT & SAVAŞ ANALİZİ */}
      {/* ======================================================== */}
      <div className={`grid gap-4 items-start ${isPC ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* SOL SÜTUN: Kuşanılan 12 Ekipman Yuvası & Yuva İnceleme Paneli */}
        <div className={`space-y-4 ${isPC ? 'lg:col-span-5' : 'w-full'}`}>
          <OrnateFrame className="p-4 space-y-4 bg-gradient-to-b from-black/95 via-black/85 to-black/95">
            {/* Başlık ve Kuşam Oranı */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                    Kuşanılan Ekipmanlar (12 Yuva)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-cormorant">
                    İncelemek için tıklayın, çıkarmak için çift tıklayın.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                %{Math.round((equippedCount / 12) * 100)} Tamamlandı
              </span>
            </div>

            {/* 12 Yuva Izgarası (PC'de 3 veya 4 sütun) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 text-center">
              {EQUIPMENT_SLOTS.map((slot, i) => {
                const Icon = SLOT_ICONS[slot.id] || Shield;
                const equippedItem = player?.equipped?.[slot.id] || null;
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (contextMenu.isOpen) {
                        setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: false, slotKey: null });
                      }
                      if (equippedItem) {
                        const now = Date.now();
                        if (now - lastEquipTap.time < 350 && lastEquipTap.slotId === slot.id) {
                          onUnequipItem?.(slot.id);
                          setLastEquipTap({ time: 0, slotId: null });
                          return;
                        }
                        setLastEquipTap({ time: now, slotId: slot.id });
                      }
                      setSelectedSlotId(slot.id);
                    }}
                    onDoubleClick={() => {
                      if (equippedItem && onUnequipItem) {
                        onUnequipItem(slot.id);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (equippedItem) {
                        setContextMenu({
                          isOpen: true,
                          position: { x: e.clientX, y: e.clientY },
                          item: equippedItem,
                          isEquipped: true,
                          slotKey: slot.id,
                        });
                      }
                    }}
                    title={
                      equippedItem
                        ? `${equippedItem.name} (Çift tıkla: Çıkar • Sağ tık: Menü)`
                        : `${slot.name} (${slot.slotHint || 'Boş'})`
                    }
                    className={`w-full aspect-square rounded-xl border transition-all duration-200 flex flex-col items-center justify-center p-1.5 relative cursor-pointer group ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/25 shadow-elven-gold ring-2 ring-amber-400/80 scale-[1.03]'
                        : equippedItem
                        ? 'border-amber-500/60 bg-black/70 hover:border-amber-300 hover:bg-black/90 shadow-md'
                        : 'border-dashed border-white/10 bg-black/40 hover:border-amber-400/50 hover:bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Yuva Numarası */}
                    <span className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
                      {i + 1}
                    </span>

                    {equippedItem ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <img
                          src={equippedItem.image}
                          alt={equippedItem.name}
                          className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow transition-transform group-hover:scale-110"
                        />
                        <span className="text-[9px] font-cinzel text-amber-100 text-center line-clamp-1 w-full px-0.5 mt-0.5 font-bold">
                          {equippedItem.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-full bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-0.5 group-hover:text-amber-300 group-hover:border-amber-500/50 transition-all">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-cinzel text-amber-100 font-semibold line-clamp-1 group-hover:text-amber-200">
                          {slot.name}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono">
                          Boş
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Seçili Yuva / Eşya İnceleme Detay Kartı */}
            <div className="p-3.5 rounded-xl bg-black/75 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    {React.createElement(SLOT_ICONS[selectedSlot.id] || Shield, { className: 'w-3.5 h-3.5' })}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">SEÇİLİ YUVA</span>
                    <span className="text-xs font-cinzel font-bold text-amber-200">{selectedSlot.name}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    selectedEquippedItem
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                      : 'bg-black/60 border-slate-700 text-slate-400'
                  }`}
                >
                  {selectedEquippedItem ? 'Kuşanıldı ✓' : 'Yuva Boş'}
                </span>
              </div>

              {selectedEquippedItem ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-black/90 border border-amber-500/50 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
                      <img
                        src={selectedEquippedItem.image}
                        alt={selectedEquippedItem.name}
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-cinzel font-bold text-xs text-amber-100 gold-text-glow truncate">
                        {selectedEquippedItem.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {selectedEquippedItem.setName || 'Kadim Elf Seti'}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {selectedEquippedItem.className || 'Genel'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedEquippedItem.desc && (
                    <p className="text-xs text-slate-300 font-cormorant italic leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5">
                      &quot;{selectedEquippedItem.desc}&quot;
                    </p>
                  )}

                  {onUnequipItem && (
                    <button
                      type="button"
                      onClick={() => onUnequipItem(selectedSlot.id)}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-cinzel text-xs font-bold border border-amber-400/50 shadow-md hover:shadow-elven-gold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ArrowDownCircle className="w-4 h-4 text-amber-300" />
                      <span>Ekipmanı Çıkar (Çantaya Gönder)</span>
                    </button>
                  )}

                  {/* Çantada Alternatif Eşyalar Varsa Listele (Değiştirme Özelliği) */}
                  {candidateItems.length > 0 && (
                    <div className="pt-2.5 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                          <span>Çantanızdaki Alternatif {selectedSlot.name} Eşyaları ({candidateItems.length})</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Değiştirmek için tıkla</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {candidateItems.map((candidate) => (
                          <div
                            key={candidate.instanceId || candidate.id}
                            onClick={() => {
                              if (contextMenu.isOpen) {
                                setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: false, slotKey: null });
                              }
                              const now = Date.now();
                              if (now - lastCandidateTap.time < 350 && lastCandidateTap.itemId === candidate.instanceId) {
                                onEquipItem?.(candidate);
                                setLastCandidateTap({ time: 0, itemId: null });
                              } else {
                                setLastCandidateTap({ time: now, itemId: candidate.instanceId });
                              }
                            }}
                            onDoubleClick={() => {
                              onEquipItem?.(candidate);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({
                                isOpen: true,
                                position: { x: e.clientX, y: e.clientY },
                                item: candidate,
                                isEquipped: false,
                                slotKey: selectedSlot.id,
                              });
                            }}
                            title={`${candidate.name} (Çift tıkla: Kuşan • Sağ tık: Menü)`}
                            className="p-2 rounded-lg bg-black/60 border border-amber-500/30 hover:border-amber-400 flex items-center justify-between gap-2 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={candidate.image}
                                alt={candidate.name}
                                className="w-8 h-8 object-contain drop-shadow"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-cinzel font-bold text-amber-100 group-hover:text-amber-300 truncate">
                                  {candidate.name}
                                </p>
                                <p className="text-[9px] font-mono text-emerald-400">
                                  {candidate.setName || 'Set Eşyası'} • {candidate.className}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEquipItem && onEquipItem(candidate);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-amber-200 hover:text-white font-cinzel text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Değiştir</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center py-2.5 px-2 bg-black/40 rounded-lg border border-white/5 space-y-0.5">
                    <p className="text-xs font-cinzel text-amber-200/90 font-bold">
                      Bu yuvaya bir {selectedSlot.name.toLowerCase()} takılabilir.
                    </p>
                    <p className="text-[10px] text-slate-400 font-cormorant">
                      {selectedSlot.slotHint || 'Kadim elven kuşamı'}
                    </p>
                  </div>

                  {/* Yuva Boşken Çantada Uygun Eşyalar Varsa Hemen Kuşan Listesi */}
                  {candidateItems.length > 0 ? (
                    <div className="space-y-2 pt-1 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Çantanızdaki {selectedSlot.name} Eşyaları ({candidateItems.length})</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Kuşanmak için tıkla</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {candidateItems.map((candidate) => (
                          <div
                            key={candidate.instanceId || candidate.id}
                            onClick={() => {
                              if (contextMenu.isOpen) {
                                setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: false, slotKey: null });
                              }
                              const now = Date.now();
                              if (now - lastCandidateTap.time < 350 && lastCandidateTap.itemId === candidate.instanceId) {
                                onEquipItem?.(candidate);
                                setLastCandidateTap({ time: 0, itemId: null });
                              } else {
                                setLastCandidateTap({ time: now, itemId: candidate.instanceId });
                              }
                            }}
                            onDoubleClick={() => {
                              onEquipItem?.(candidate);
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setContextMenu({
                                isOpen: true,
                                position: { x: e.clientX, y: e.clientY },
                                item: candidate,
                                isEquipped: false,
                                slotKey: selectedSlot.id,
                              });
                            }}
                            title={`${candidate.name} (Çift tıkla: Kuşan • Sağ tık: Menü)`}
                            className="p-2 rounded-lg bg-black/60 border border-emerald-500/30 hover:border-emerald-400 flex items-center justify-between gap-2 transition-all group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={candidate.image}
                                alt={candidate.name}
                                className="w-8 h-8 object-contain drop-shadow"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-cinzel font-bold text-amber-100 group-hover:text-emerald-300 truncate">
                                  {candidate.name}
                                </p>
                                <p className="text-[9px] font-mono text-emerald-400">
                                  {candidate.setName || 'Set Eşyası'} • {candidate.className}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEquipItem && onEquipItem(candidate);
                              }}
                              className="px-3 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500/50 text-emerald-200 hover:text-white font-cinzel text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                            >
                              <Check className="w-3 h-3 text-emerald-300" />
                              <span>Kuşan</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 px-2 bg-black/40 rounded-lg border border-white/5 space-y-1">
                      <p className="text-xs font-cinzel text-amber-200/80">
                        Çantanızda bu yuvaya uygun bir <strong>{currentClass.name} {selectedSlot.name.toLowerCase()}</strong> bulunmuyor.
                      </p>
                      <p className="text-[11px] text-slate-400 font-cormorant">
                        Zindanlardan ganimet düşürerek veya pazardan temin edebilirsiniz.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ekipman Yardım Bilgisi */}
            <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400/80 flex-shrink-0" />
              <span>
                Yeni eşyaları kuşanmak için üst/alt menüden <strong>Envanter</strong> sekmesini kullanabilirsiniz.
              </span>
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

      {/* Özel MMORPG Sağ Tık Menüsü (Kuşan / Çıkar / Sil) */}
      <ItemContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        item={contextMenu.item}
        isEquipped={contextMenu.isEquipped}
        slotKey={contextMenu.slotKey}
        player={player}
        onEquip={(it) => {
          onEquipItem?.(it);
        }}
        onUnequip={(sKey) => {
          onUnequipItem?.(sKey);
        }}
        onDiscard={(instId, sellPrice) => {
          onDiscardItem?.(instId, sellPrice);
        }}
        onInspect={(it) => {
          if (it.slot) {
            setSelectedSlotId(it.slot);
          }
        }}
        onClose={() => {
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: false, slotKey: null });
        }}
      />
    </div>
  );
}
