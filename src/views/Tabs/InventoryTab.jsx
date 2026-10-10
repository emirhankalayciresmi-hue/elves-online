import React, { useState, useEffect, useRef } from 'react';
import {
  Crown, Shield, Sword, ShieldAlert, Gem, CircleDot, Hand, Footprints,
  Layers, Wind, Feather, Sparkles, Shirt, Info, CheckCircle2
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import Metin2Inventory from '../../components/Metin2Inventory';
import Metin2ComparisonTooltip from '../../components/ItemTooltip';
import ItemContextMenu from '../../components/ItemContextMenu';
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
  onSwapSlots,
}) {
  const isPC = layoutMode === 'pc';
  const [hoveredEquipped, setHoveredEquipped] = useState(null);
  const [pinnedEquipped, setPinnedEquipped] = useState(null);
  const [hoveredEmptySlot, setHoveredEmptySlot] = useState(null);
  const [equipMousePos, setEquipMousePos] = useState({ x: 0, y: 0 });
  const lastEquipTapRef = useRef({ time: 0, slotId: null });
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null,
    isEquipped: true,
    slotKey: null,
  });
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const updateEquipMousePos = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const dx = Math.abs(x - mousePosRef.current.x);
    const dy = Math.abs(y - mousePosRef.current.y);
    if (dx < 15 && dy < 15) return;

    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      mousePosRef.current = { x, y };
      setEquipMousePos({ x, y });
      rafIdRef.current = null;
    });
  };

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
    <div
      onClick={() => {
        if (contextMenu.isOpen) {
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: true, slotKey: null });
        }
      }}
      className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}
    >
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
                Ekipman kuşanmak için eşyaya 2 kez tıklayın veya sağ tık menüsünü açın. Çıkarmak için kuşanılan eşyaya 2 kez tıklayın veya sağ tıklayın.
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
                const plusLevel = Number(equippedItem?.plusLevel) || 0;
                const auraClass = equippedItem && plusLevel === 7 ? 'aura-electric-plus7' : equippedItem && plusLevel === 8 ? 'aura-electric-plus8' : equippedItem && plusLevel >= 9 ? 'aura-electric-plus9' : '';

                return (
                  <div
                    key={slot.id}
                    onMouseEnter={(e) => {
                          mousePosRef.current = { x: e.clientX, y: e.clientY };
                          setEquipMousePos({ x: e.clientX, y: e.clientY });
                          if (equippedItem) {
                            setHoveredEquipped(equippedItem);
                            setHoveredEmptySlot(null);
                          } else {
                            setHoveredEmptySlot(slot);
                            setHoveredEquipped(null);
                          }
                        }}
                        onMouseMove={updateEquipMousePos}
                        onMouseLeave={() => {
                          setHoveredEquipped(null);
                          setHoveredEmptySlot(null);
                        }}
                        onClick={(e) => {
                          if (contextMenu.isOpen) {
                            setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: true, slotKey: null });
                          }
                          if (equippedItem) {
                            const now = Date.now();
                            if (now - lastEquipTapRef.current.time < 450 && lastEquipTapRef.current.slotId === slot.id) {
                              onUnequipItem?.(slot.id);
                              setPinnedEquipped(null);
                              setHoveredEquipped(null);
                              lastEquipTapRef.current = { time: 0, slotId: null };
                              return;
                            }
                            lastEquipTapRef.current = { time: now, slotId: slot.id };
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
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          try {
                            const raw = e.dataTransfer.getData('text/plain');
                            if (raw) {
                              const data = JSON.parse(raw);
                              if (data && data.instanceId) {
                                const it = player?.inventory?.find((x) => x?.instanceId === data.instanceId);
                                if (it) onEquipItem?.(it);
                              }
                            }
                          } catch {}
                        }}
                        className={`w-full aspect-square max-w-[96px] max-h-[96px] mx-auto rounded-lg border transition-all duration-200 flex flex-col items-center justify-center p-1 relative cursor-pointer group ${auraClass} ${
                          isPinned
                            ? 'border-amber-400 bg-amber-500/25 shadow-elven-gold ring-2 ring-amber-400 scale-[1.03]'
                            : isHovered
                            ? 'border-amber-300 bg-amber-500/15 ring-1 ring-amber-300 scale-[1.02]'
                            : equippedItem
                            ? 'border-amber-500/50 bg-black/60 hover:border-amber-300 hover:bg-black/80'
                            : 'border-dashed border-slate-700/60 bg-black/40 hover:border-slate-500 hover:bg-white/5'
                        }`}
                      >
                        {/* Yuva Numarası */}
                        <span className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
                          {i + 1}
                        </span>

                        {/* Ekipman Yükseltme Rozeti (+0 .. +9) */}
                        {equippedItem && (
                          <span
                            className={`absolute bottom-1 right-1 font-mono text-[9px] font-black rounded px-1.5 py-0 select-none z-10 border ${
                              plusLevel === 7
                                ? 'text-blue-300 bg-blue-950/95 border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.9)]'
                                : plusLevel === 8
                                ? 'text-purple-300 bg-purple-950/95 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.95)]'
                                : plusLevel >= 9
                                ? 'text-rose-200 bg-rose-950/95 border-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]'
                                : 'text-amber-200 bg-black/90 border-amber-500/70 shadow-[0_0_6px_rgba(0,0,0,0.9)]'
                            }`}
                          >
                            +{plusLevel}
                          </span>
                        )}

                        {equippedItem ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <img
                              src={equippedItem.image}
                              alt={equippedItem.name}
                              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow transition-transform group-hover:scale-110"
                            />
                            <span className={`text-[9px] font-cinzel text-center line-clamp-1 w-full px-0.5 mt-0.5 ${
                              plusLevel === 7 ? 'text-blue-300 font-bold' :
                              plusLevel === 8 ? 'text-purple-300 font-bold' :
                              plusLevel >= 9 ? 'text-rose-300 font-black' :
                              'text-amber-100'
                            }`}>
                              {equippedItem.name}{plusLevel > 0 ? ` +${plusLevel}` : ''}
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
            onSwapSlots={onSwapSlots}
            title="Elf Heybesi (3 Sayfalı Envanter)"
          />
        </div>
      </div>

      {/* Özel MMORPG Sağ Tık Menüsü (Kuşanılan Eşyayı Çıkar) */}
      <ItemContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        item={contextMenu.item}
        isEquipped={contextMenu.isEquipped}
        slotKey={contextMenu.slotKey}
        player={player}
        onUnequip={(slotKey) => {
          onUnequipItem?.(slotKey);
          setPinnedEquipped(null);
          setHoveredEquipped(null);
        }}
        onInspect={(item) => {
          setPinnedEquipped(item);
        }}
        onClose={() => {
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null, isEquipped: true, slotKey: null });
        }}
      />
    </div>
  );
}
