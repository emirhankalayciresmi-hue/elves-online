import React, { useState, useRef, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight, Layers, Sparkles } from 'lucide-react';
import OrnateFrame from '@/components/OrnateFrame';
import Metin2ComparisonTooltip from '@/components/ItemTooltip';

export default function Metin2Inventory({
  player,
  onEquipItem,
  onDiscardItem,
  onUnequipItem,
  title = 'Elf Heybesi (3 Sayfalı Envanter)',
}) {
  const [activePage, setActivePage] = useState(1); // 1, 2, 3
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pinnedItem, setPinnedItem] = useState(null);
  const [lastTap, setLastTap] = useState({ time: 0, itemId: null });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const updateMousePos = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const dx = Math.abs(x - mousePosRef.current.x);
    const dy = Math.abs(y - mousePosRef.current.y);
    if (dx < 15 && dy < 15) return;

    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      mousePosRef.current = { x, y };
      setMousePos({ x, y });
      rafIdRef.current = null;
    });
  };

  const inventory = Array.isArray(player?.inventory) ? player.inventory : [];
  const equipped = player?.equipped || {};

  const SLOTS_PER_PAGE = 16; // 4x4 grid
  const TOTAL_PAGES = 3; // 48 slots total
  const startIndex = (activePage - 1) * SLOTS_PER_PAGE;
  const pageSlots = Array.from({ length: SLOTS_PER_PAGE }, (_, i) => inventory[startIndex + i] || null);

  // Right-click on inventory container cycles to next page
  const handleContextMenu = (e) => {
    e.preventDefault();
    setActivePage((prev) => (prev % TOTAL_PAGES) + 1);
  };

  // Double-tap or double-click to directly equip
  const handleSlotClick = (item) => {
    if (!item) {
      setPinnedItem(null);
      return;
    }

    const now = Date.now();
    if (now - lastTap.time < 350 && lastTap.itemId === item.instanceId) {
      // 2nd fast click -> DIRECT EQUIP!
      onEquipItem?.(item);
      setPinnedItem(null);
      setHoveredItem(null);
      setLastTap({ time: 0, itemId: null });
    } else {
      setLastTap({ time: now, itemId: item.instanceId });
      // Single click pins/inspects the item
      setPinnedItem((prev) => (prev?.instanceId === item.instanceId ? null : item));
    }
  };

  // Long press for mobile touch
  const handleTouchStart = (item) => {
    if (!item) return;
    longPressTimerRef.current = setTimeout(() => {
      onEquipItem?.(item);
      setPinnedItem(null);
      setHoveredItem(null);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const displayedItem = pinnedItem || hoveredItem;
  // If the inspected item has an equipped counterpart in that slot, show side-by-side comparison!
  const comparedEquippedItem = displayedItem ? equipped[displayedItem.slot] : null;

  return (
    <div
      onContextMenu={handleContextMenu}
      className="space-y-3 relative select-none"
    >
      <OrnateFrame className="p-3.5 space-y-3">
        {/* Header: Title, 3-Page Tabs [I] [II] [III], Capacity */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel text-xs font-bold text-amber-100 uppercase tracking-wider">
              {title}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              ({inventory.length}/48)
            </span>
          </div>

          {/* Metin2 Style Roman Numeral Page Tabs [I] [II] [III] */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActivePage((prev) => (prev === 1 ? 3 : prev - 1))}
              className="w-6 h-6 rounded bg-black/60 border border-slate-700 hover:border-amber-400 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
              title="Önceki Sayfa"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3].map((pageNum) => {
              const roman = pageNum === 1 ? 'I' : pageNum === 2 ? 'II' : 'III';
              const isActive = activePage === pageNum;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setActivePage(pageNum)}
                  className={`w-7 h-7 rounded text-xs font-cinzel font-bold border transition-all cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/30 to-amber-500/15 border-amber-400 text-amber-200 shadow-elven-gold scale-105'
                      : 'bg-black/50 border-slate-800 text-slate-400 hover:text-amber-200 hover:border-amber-500/40'
                  }`}
                >
                  {roman}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActivePage((prev) => (prev % TOTAL_PAGES) + 1)}
              className="w-6 h-6 rounded bg-black/60 border border-slate-700 hover:border-amber-400 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
              title="Sonraki Sayfa"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
          <span>Sayfa {activePage} / 3 (16 Yuva)</span>
          <span className="text-amber-400/80">Sağ Tık: Sayfa Değiştir • 2x Tıkla: Kuşan</span>
        </div>

        {/* 16 Slots Grid (100x100 Boxes) */}
        <div className="grid grid-cols-4 gap-2.5">
          {pageSlots.map((item, idx) => {
            const isHovered = hoveredItem?.instanceId === item?.instanceId;
            const isPinned = pinnedItem?.instanceId === item?.instanceId;
            const isNewDrop = Boolean(item && player?.newDungeonDrops?.includes(item?.instanceId));
            const absoluteSlotIndex = startIndex + idx;

            return (
              <div
                key={idx}
                onMouseEnter={(e) => {
                  if (item) {
                    setHoveredItem(item);
                    mousePosRef.current = { x: e.clientX, y: e.clientY };
                    setMousePos({ x: e.clientX, y: e.clientY });
                  }
                }}
                onMouseMove={(e) => {
                  if (item) {
                    updateMousePos(e);
                  }
                }}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  if (item) setMousePos({ x: e.clientX, y: e.clientY });
                  handleSlotClick(item);
                }}
                onDoubleClick={() => item && onEquipItem?.(item)}
                onTouchStart={() => handleTouchStart(item)}
                onTouchEnd={handleTouchEnd}
                className={`w-full aspect-square max-w-[100px] max-h-[100px] mx-auto rounded-lg border transition-all duration-200 flex flex-col items-center justify-center p-1.5 relative cursor-pointer group ${
                  isNewDrop
                    ? 'border-2 border-yellow-400 ring-2 ring-amber-300 bg-amber-500/25 shadow-[0_0_18px_rgba(250,204,21,0.9)] animate-pulse scale-[1.03]'
                    : isPinned
                    ? 'border-amber-400 bg-amber-500/25 shadow-elven-gold ring-2 ring-amber-400 scale-[1.03]'
                    : isHovered
                    ? 'border-amber-300 bg-amber-500/15 ring-1 ring-amber-300 scale-[1.02]'
                    : item?.isOre || item?.type === 'ore'
                    ? 'border-emerald-500/60 bg-emerald-950/30 hover:border-emerald-300 hover:bg-emerald-950/50'
                    : item
                    ? 'border-amber-500/40 bg-black/60 hover:border-amber-300 hover:bg-black/80'
                    : 'border-dashed border-slate-700/60 bg-black/30 hover:border-slate-500'
                }`}
              >
                {/* Slot index number */}
                <span className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
                  {absoluteSlotIndex + 1}
                </span>

                {/* New Drop Glowing Badge */}
                {isNewDrop && (
                  <span className="absolute top-1 right-1 text-[7px] font-mono font-bold text-amber-200 bg-amber-950/95 border border-yellow-400 rounded px-1 py-0.2 shadow animate-pulse">
                    ✨ YENİ
                  </span>
                )}

                {/* Ore Distinction Badge */}
                {!isNewDrop && (item?.isOre || item?.type === 'ore') && (
                  <span className="absolute top-1 right-1 text-[7px] font-mono font-bold text-emerald-300 bg-emerald-950/95 border border-emerald-500/50 rounded px-1 py-0.2 shadow">
                    💎 Cevher
                  </span>
                )}

                {item ? (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow transition-transform group-hover:scale-110"
                    />
                    <span className={`text-[9px] font-cinzel text-center line-clamp-1 w-full px-0.5 mt-0.5 ${
                      item.isOre || item.type === 'ore' ? 'text-emerald-200 font-semibold' : 'text-amber-100'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600 font-mono">
                    Boş
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </OrnateFrame>

      {/* Floating Metin2 Comparison Tooltip (Rendered directly above/beside without taking bottom layout space) */}
      {displayedItem && (
        <Metin2ComparisonTooltip
          activeItem={displayedItem}
          comparedItem={comparedEquippedItem}
          isEquipped={false}
          isPinned={Boolean(pinnedItem)}
          mousePos={mousePos}
          onEquip={(it) => {
            onEquipItem?.(it);
            setPinnedItem(null);
            setHoveredItem(null);
          }}
          onDiscard={(instId) => {
            onDiscardItem?.(instId);
            setPinnedItem(null);
            setHoveredItem(null);
          }}
          onClose={() => {
            setPinnedItem(null);
            setHoveredItem(null);
          }}
        />
      )}
    </div>
  );
}
