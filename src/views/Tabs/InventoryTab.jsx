import React, { useState, useEffect } from 'react';
import {
  Crown, Shield, Sword, ShieldAlert, Gem, CircleDot, Hand, Footprints,
  Layers, Wind, Feather, Sparkles, Shirt, Info, CheckCircle2
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import Metin2Inventory from '../../components/Metin2Inventory';
import Metin2ComparisonTooltip from '../../components/ItemTooltip';
import { EQUIPMENT_SLOTS } from '../../config/gameData';

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

export default function InventoryTab({
  player,
  layoutMode = 'mobile',
  onEquipItem,
  onUnequipItem,
  onDiscardItem,
  onClearNewDrops,
}) {
  const isPC = layoutMode === 'pc';
  const [hoveredEquipped, setHoveredEquipped] = useState(null);
  const [pinnedEquipped, setPinnedEquipped] = useState(null);
  const [hoveredEmptySlot, setHoveredEmptySlot] = useState(null);
  const [equipMousePos, setEquipMousePos] = useState({ x: 0, y: 0 });

  // Envanterden çıkıldığında (unmount) yeni eşya parlamaları söner
  useEffect(() => {
    return () => {
      onClearNewDrops?.();
    };
  }, [onClearNewDrops]);

  const equipped = player?.equipped || {};
  const equippedCount = Object.keys(equipped).length;
  const displayedEquipped = pinnedEquipped || hoveredEquipped;

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Yeni Düşen Eşyalar Bildirimi */}
      {player?.newDungeonDrops?.length > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/50 flex items-center justify-between text-xs font-mono animate-fadeIn">
          <span className="text-amber-200 flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{player.newDungeonDrops.length} Yeni Zindan Ganimeti Çantanızda Sarı Kareyle Parlıyor!</span>
          </span>
          <button
            type="button"
            onClick={onClearNewDrops}
            className="px-2 py-0.5 rounded bg-black/60 border border-amber-500/40 text-amber-300 hover:text-white cursor-pointer transition-colors"
          >
            Parlamaları Söndür ✓
          </button>
        </div>
      )}
      {/* Üst Bilgilendirme Banner */}
      <OrnateFrame className="p-3 bg-gradient-to-r from-black/80 via-amber-950/20 to-black/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-sm text-amber-100 tracking-wider">
                Kuşam & Envanter Yönetimi
              </h2>
              <p className="text-[11px] text-slate-400 font-cormorant">
                Ekipmanlarınızı kuşanmak için çantadaki eşyaya 2 kez tıklayın veya sürükleyin. Çıkarmak için kuşanılan eşyaya 2 kez tıklayın.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded">
              Kuşanılan: <strong className="text-amber-100">{equippedCount} / 12</strong>
            </span>
          </div>
        </div>
      </OrnateFrame>

      {/* Ana Gövde: PC'de Yan Yana, Mobilde Üst Üste */}
      <div className={`grid gap-4 items-start ${isPC ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'}`}>
        {/* SOL: Kuşanılan 12 Ekipman Yuvası */}
        <div className={`${isPC ? 'xl:col-span-5' : 'w-full'}`}>
          <OrnateFrame className="p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <h3 className="text-xs font-cinzel uppercase text-amber-300 tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Kuşanılan Ekipmanlar (12 Yuva)</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  1-10 Seviye Set Eşyaları
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                %{Math.round((equippedCount / 12) * 100)} Tamamlandı
              </span>
            </div>

            {/* 12 Yuva Izgarası (PC'de 3x4 / Mobilde 4x3) */}
            <div className={`grid gap-2 text-center ${isPC ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {EQUIPMENT_SLOTS.map((slot, i) => {
                const Icon = SLOT_ICONS[slot.id] || Shield;
                const equippedItem = equipped[slot.id] || null;
                const isHovered = hoveredEquipped?.instanceId === equippedItem?.instanceId && equippedItem;
                const isPinned = pinnedEquipped?.instanceId === equippedItem?.instanceId && equippedItem;

                return (
                  <div
                    key={slot.id}
                    onMouseEnter={(e) => {
                      if (equippedItem) {
                        setHoveredEquipped(equippedItem);
                        setHoveredEmptySlot(null);
                        setEquipMousePos({ x: e.clientX, y: e.clientY });
                      } else {
                        setHoveredEmptySlot(slot);
                        setHoveredEquipped(null);
                        setEquipMousePos({ x: e.clientX, y: e.clientY });
                      }
                    }}
                    onMouseMove={(e) => {
                      setEquipMousePos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setHoveredEquipped(null);
                      setHoveredEmptySlot(null);
                    }}
                    onClick={(e) => {
                      if (equippedItem) {
                        setEquipMousePos({ x: e.clientX, y: e.clientY });
                        setPinnedEquipped((prev) =>
                          prev?.instanceId === equippedItem.instanceId ? null : equippedItem
                        );
                      }
                    }}
                    onDoubleClick={() => {
                      if (equippedItem) {
                        onUnequipItem?.(slot.id);
                        setPinnedEquipped(null);
                        setHoveredEquipped(null);
                      }
                    }}
                    className={`w-full aspect-square max-w-[96px] max-h-[96px] mx-auto rounded-lg border transition-all duration-200 flex flex-col items-center justify-center p-1 relative cursor-pointer group ${
                      isPinned
                        ? 'border-amber-400 bg-amber-500/25 shadow-elven-gold ring-2 ring-amber-400 scale-[1.03]'
                        : isHovered
                        ? 'border-amber-300 bg-amber-500/15 ring-1 ring-amber-300 scale-[1.02]'
                        : equippedItem
                        ? 'border-amber-500/50 bg-black/60 hover:border-amber-300 hover:bg-black/80'
                        : 'border-dashed border-amber-500/30 bg-black/40 hover:border-amber-400/70 hover:bg-white/5'
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
                        <span className="text-[9px] font-cinzel text-amber-100 text-center line-clamp-1 w-full px-0.5 mt-0.5">
                          {equippedItem.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-0.5 group-hover:text-amber-300 group-hover:border-amber-500/50 transition-all">
                          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-cinzel text-amber-100 font-semibold line-clamp-1 group-hover:text-amber-200">
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

            {/* Ekipman Durumu İpucu */}
            <div className="p-2.5 rounded bg-black/40 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400/80 flex-shrink-0" />
              <span>
                Bir eşyayı çıkarmak için üzerine çift tıklayın veya eşyayı seçip &apos;Çıkar&apos; butonuna basın.
              </span>
            </div>
          </OrnateFrame>

          {/* Kuşanılan Eşya Karşılaştırma Tooltip'i */}
          {displayedEquipped && (
            <Metin2ComparisonTooltip
              activeItem={displayedEquipped}
              comparedItem={null}
              isEquipped={true}
              isPinned={Boolean(pinnedEquipped)}
              mousePos={equipMousePos}
              onUnequip={(slotKey) => {
                onUnequipItem?.(slotKey);
                setPinnedEquipped(null);
                setHoveredEquipped(null);
              }}
              onClose={() => {
                setPinnedEquipped(null);
                setHoveredEquipped(null);
              }}
            />
          )}

          {/* Boş Yuva İpucu Tooltip */}
          {hoveredEmptySlot && !displayedEquipped && (
            <div
              style={{
                position: 'fixed',
                left: `${Math.min(typeof window !== 'undefined' ? window.innerWidth - 250 : 800, Math.max(10, equipMousePos.x + 15))}px`,
                top: `${Math.min(typeof window !== 'undefined' ? window.innerHeight - 150 : 600, Math.max(10, equipMousePos.y - 20))}px`,
                zIndex: 9999,
                pointerEvents: 'none',
              }}
              className="w-56 p-2.5 rounded-lg border border-amber-400/80 bg-[#070b0e]/95 backdrop-blur-md shadow-2xl text-left space-y-1 animate-fadeIn"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[10px] font-mono font-bold text-amber-300">
                  Boş Ekipman Yuvası
                </span>
                <span className="text-[9px] font-mono text-slate-400">1-10 Seviye</span>
              </div>
              <h4 className="font-cinzel font-bold text-xs text-amber-100">
                {hoveredEmptySlot.name} ({hoveredEmptySlot.slotHint})
              </h4>
              <p className="text-[11px] text-slate-300 font-cormorant leading-relaxed italic">
                Bu yuvaya kuşanılacak eşyayı yan taraftaki heybeden seçip 2 kez tıklayarak kuşanabilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* SAĞ: Elf Heybesi (3 Sayfalık Metin2 Envanteri) */}
        <div className={`${isPC ? 'xl:col-span-7' : 'w-full'}`}>
          <Metin2Inventory
            player={player}
            onEquipItem={onEquipItem}
            onUnequipItem={onUnequipItem}
            onDiscardItem={onDiscardItem}
            title="Elf Heybesi (3 Sayfalı Envanter)"
          />
        </div>
      </div>
    </div>
  );
}
