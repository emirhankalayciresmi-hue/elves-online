import React, { useState, useRef, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight, Layers, Sparkles, Lock } from 'lucide-react';
import OrnateFrame from '@/components/OrnateFrame';
import Metin2ComparisonTooltip from '@/components/ItemTooltip';
import ItemContextMenu from '@/components/ItemContextMenu';
import { isItemForPlayerClass } from '@/core/config/itemsData';
import { consolidateInventory } from '@/domain/gameEngine';

export default function Metin2Inventory({
  player,
  onEquipItem,
  onDiscardItem,
  onUnequipItem,
  onSwapSlots,
  title = 'Elf Heybesi (3 Sayfalı Envanter)',
}) {
  const [activePage, setActivePage] = useState(1); // 1, 2, 3
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'warrior', 'ninja', 'mage', 'ores', 'materials'
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pinnedItem, setPinnedItem] = useState(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null,
  });

  const lastTapRef = useRef({ time: 0, itemId: null });
  const lastEquipTimeRef = useRef(0);
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

  const inventory = consolidateInventory(Array.isArray(player?.inventory) ? player.inventory : []);
  const equipped = player?.equipped || {};

  // Sınıfsal / Maden / Yükseltme filtreleri
  const isFiltered = activeFilter !== 'all';
  const filteredInventory = isFiltered
    ? inventory.filter((item) => {
        if (!item) return false;
        const itemClass = (item.classId || '').toLowerCase();
        const itemSet = (item.setKey || '').toLowerCase();
        const itemClassName = (item.className || '').toLowerCase();

        if (activeFilter === 'warrior') {
          return itemClass === 'warrior' || itemSet === 'warrior' || itemClassName.includes('savaşçı');
        }
        if (activeFilter === 'ninja') {
          return (
            itemClass === 'ninja' ||
            itemClass === 'assassin' ||
            itemSet === 'assassin' ||
            itemSet === 'ninja' ||
            itemClassName.includes('ninja')
          );
        }
        if (activeFilter === 'mage') {
          return itemClass === 'mage' || itemSet === 'mage' || itemClassName.includes('büyücü');
        }
        if (activeFilter === 'ores') return item.isOre || item.type === 'ore' || item.slot === 'ore';
        if (activeFilter === 'materials') return item.isMaterial || item.type === 'material' || item.isUpgradeStone;
        return true;
      })
    : inventory;

  const SLOTS_PER_PAGE = 16; // 4x4 grid
  const TOTAL_PAGES = 3; // 48 slots total
  const startIndex = (activePage - 1) * SLOTS_PER_PAGE;
  const pageSlots = Array.from(
    { length: SLOTS_PER_PAGE },
    (_, i) => (isFiltered ? filteredInventory[startIndex + i] : inventory[startIndex + i]) || null
  );

  const FILTER_TABS = [
    { id: 'all', label: 'Tümü' },
    { id: 'warrior', label: 'Savaşçı' },
    { id: 'ninja', label: 'Ninja' },
    { id: 'mage', label: 'Büyücü' },
    { id: 'ores', label: '💎 Madenler' },
    { id: 'materials', label: '🔮 Yükseltme Eşyaları' },
  ];

  // Doğrudan Çift Tıkla Kuşanma Yardımcısı (Sıfır gecikme & Çift kuşanma çakışma korumalı)
  const handleItemEquipDirect = (item) => {
    if (!item) return;
    const now = Date.now();
    if (now - lastEquipTimeRef.current < 400) {
      return; // Bu çift tık dizisi zaten işlendi
    }
    lastEquipTimeRef.current = now;

    if (item.isOre || item.type === 'ore' || item.isMaterial || item.type === 'material') {
      return;
    }
    if (!isItemForPlayerClass(item, player)) return;
    onEquipItem?.(item);
    setPinnedItem(null);
    setHoveredItem(null);
  };

  // Tek tıkla incele / 2. tıkta (450ms içinde) anında kuşan
  const handleSlotClick = (item) => {
    if (contextMenu.isOpen) {
      setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null });
    }

    if (!item) {
      setPinnedItem(null);
      return;
    }

    const now = Date.now();
    const isDoubleTap =
      now - lastTapRef.current.time < 450 && lastTapRef.current.itemId === item.instanceId;

    if (isDoubleTap) {
      lastTapRef.current = { time: 0, itemId: null };
      handleItemEquipDirect(item);
      return;
    }

    lastTapRef.current = { time: now, itemId: item.instanceId };
    setPinnedItem((prev) => (prev?.instanceId === item.instanceId ? null : item));
  };

  // Doğrudan tarayıcı yerel çift tıklaması (Dblclick)
  const handleDoubleClick = (item) => {
    handleItemEquipDirect(item);
  };

  // Long press for mobile touch
  const handleTouchStart = (item) => {
    if (!item || !isItemForPlayerClass(item, player)) return;
    longPressTimerRef.current = setTimeout(() => {
      handleItemEquipDirect(item);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const displayedItem = pinnedItem || hoveredItem;
  const comparedEquippedItem = displayedItem ? equipped[displayedItem.slot] : null;

  return (
    <div
      onClick={() => {
        if (contextMenu.isOpen) {
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null });
        }
      }}
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

        {/* Sınıfsal Ayrım / Madenler / Yükseltme Eşyaları Filtre Çubuğu */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
          {FILTER_TABS.map((tab) => {
            const isTabActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id);
                  setActivePage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-cinzel whitespace-nowrap border text-[10px] font-bold transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-elven-gold'
                    : 'bg-black/50 border-slate-800 text-slate-400 hover:text-amber-100 hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-0.5">
          <span>
            {isFiltered ? `${FILTER_TABS.find((t) => t.id === activeFilter)?.label} Listeleniyor` : `Sayfa ${activePage} / 3 (16 Yuva)`}
          </span>
          <span className="text-amber-400/80">Sürükle: Hizala/Kuşan • 2x Tıkla: Kuşan • Sağ Tık: Menü</span>
        </div>

        {/* 16 Slots Grid (100x100 Boxes) */}
        <div className="grid grid-cols-4 gap-2.5">
          {pageSlots.map((item, idx) => {
            const isHovered = hoveredItem?.instanceId === item?.instanceId;
            const isPinned = pinnedItem?.instanceId === item?.instanceId;
            const isNewDrop = Boolean(item && player?.newDungeonDrops?.includes(item?.instanceId));
            const isClassLocked = Boolean(item && !isItemForPlayerClass(item, player));
            const absoluteSlotIndex = startIndex + idx;
            const isBeingDragged = draggedSlotIndex === absoluteSlotIndex;
            const isDragOver = dragOverSlotIndex === absoluteSlotIndex;

            const isEquip = Boolean(
              item &&
                !item.isOre &&
                item.type !== 'ore' &&
                !item.isMaterial &&
                item.type !== 'material' &&
                item.type !== 'potion' &&
                (item.slot || item.setKey || item.slotName)
            );
            const plusLevel = isEquip ? Number(item.plusLevel) || 0 : 0;
            const auraClass =
              isEquip && plusLevel === 7
                ? 'aura-electric-plus7'
                : isEquip && plusLevel === 8
                ? 'aura-electric-plus8'
                : isEquip && plusLevel >= 9
                ? 'aura-electric-plus9'
                : '';

            return (
              <div
                key={idx}
                draggable={Boolean(item)}
                onDragStart={(e) => {
                  if (!item) {
                    e.preventDefault();
                    return;
                  }
                  e.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify({
                      type: 'inventory_slot',
                      slotIndex: absoluteSlotIndex,
                      instanceId: item.instanceId,
                    })
                  );
                  e.dataTransfer.effectAllowed = 'all';
                  setDraggedSlotIndex(absoluteSlotIndex);
                }}
                onDragEnd={() => {
                  setDraggedSlotIndex(null);
                  setDragOverSlotIndex(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverSlotIndex !== absoluteSlotIndex) {
                    setDragOverSlotIndex(absoluteSlotIndex);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverSlotIndex === absoluteSlotIndex) {
                    setDragOverSlotIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverSlotIndex(null);
                  setDraggedSlotIndex(null);
                  try {
                    const raw = e.dataTransfer.getData('text/plain');
                    if (raw) {
                      const data = JSON.parse(raw);
                      if (data && data.slotIndex !== undefined) {
                        if (data.slotIndex !== absoluteSlotIndex) {
                          onSwapSlots?.(data.slotIndex, absoluteSlotIndex);
                        }
                      }
                    }
                  } catch (err) {
                    console.error('Inventory drop error:', err);
                  }
                }}
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
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (item) {
                    setContextMenu({
                      isOpen: true,
                      position: { x: e.clientX, y: e.clientY },
                      item,
                    });
                  }
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDoubleClick(item);
                }}
                onTouchStart={() => handleTouchStart(item)}
                onTouchEnd={handleTouchEnd}
                className={`w-full aspect-square max-w-[100px] max-h-[100px] mx-auto rounded-lg border transition-colors duration-150 flex flex-col items-center justify-center p-1.5 relative select-none group ${auraClass} ${
                  item ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                } ${
                  isBeingDragged
                    ? 'opacity-40 border-amber-400 border-dashed'
                    : isDragOver
                    ? 'border-2 border-emerald-400 bg-emerald-500/25 ring-2 ring-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.8)]'
                    : isNewDrop
                    ? 'border-2 border-yellow-400 ring-2 ring-amber-300 bg-amber-500/25 shadow-[0_0_18px_rgba(250,204,21,0.9)] animate-pulse'
                    : isPinned
                    ? 'border-amber-400 bg-amber-500/25 shadow-elven-gold ring-2 ring-amber-400'
                    : isHovered
                    ? 'border-amber-300 bg-amber-500/15 ring-1 ring-amber-300'
                    : isClassLocked
                    ? 'border-rose-900/60 bg-rose-950/20 hover:border-rose-600/60'
                    : item?.isOre || item?.type === 'ore'
                    ? 'border-emerald-500/60 bg-emerald-950/30 hover:border-emerald-300 hover:bg-emerald-950/50'
                    : item
                    ? 'border-amber-500/40 bg-black/60 hover:border-amber-300 hover:bg-black/80'
                    : 'border-dashed border-slate-700/60 bg-black/30 hover:border-slate-500'
                }`}
              >
                {/* Slot index number */}
                <span className="absolute top-1 left-1.5 text-[8px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors pointer-events-none select-none">
                  {absoluteSlotIndex + 1}
                </span>

                {/* Permanent Class Lock Badge */}
                {isClassLocked && (
                  <span
                    className="absolute top-1 right-1 text-[7px] font-mono font-bold text-rose-300 bg-rose-950/95 border border-rose-500/80 rounded px-1 py-0.2 shadow flex items-center gap-0.5 z-10 pointer-events-none select-none"
                    title={`Yalnızca ${item.className || 'diğer sınıf'} kuşanabilir`}
                  >
                    <Lock className="w-2.5 h-2.5 text-rose-400" />
                    <span>Kilit</span>
                  </span>
                )}

                {/* New Drop Glowing Badge */}
                {!isClassLocked && isNewDrop && (
                  <span className="absolute top-1 right-1 text-[7px] font-mono font-bold text-amber-200 bg-amber-950/95 border border-yellow-400 rounded px-1 py-0.2 shadow animate-pulse pointer-events-none select-none">
                    ✨ YENİ
                  </span>
                )}

                {/* Ore Distinction Badge */}
                {!isNewDrop && !isClassLocked && (item?.isOre || item?.type === 'ore') && (
                  <span className="absolute top-1 right-1 text-[7px] font-mono font-bold text-emerald-300 bg-emerald-950/95 border border-emerald-500/50 rounded px-1 py-0.2 shadow pointer-events-none select-none">
                    💎 Cevher
                  </span>
                )}

                {/* Material Distinction Badge */}
                {!isNewDrop && !isClassLocked && (item?.isMaterial || item?.type === 'material') && (
                  <span className="absolute top-1 right-1 text-[7px] font-mono font-bold text-indigo-300 bg-indigo-950/95 border border-indigo-500/50 rounded px-1 py-0.2 shadow pointer-events-none select-none">
                    🔮 Materyal
                  </span>
                )}

                {/* Ekipman Yükseltme Rozeti (+0 .. +9) */}
                {isEquip && (
                  <span
                    className={`absolute bottom-1 right-1 font-mono text-[9px] font-black rounded px-1.5 py-0 select-none z-10 border pointer-events-none ${
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

                {/* Metin2 Yığın Sayacı (Maks 200 Adet) - 1, 2, 3, 4, 5... 200 */}
                {item && !isEquip && ((item.isOre || item.type === 'ore' || item.isMaterial || item.type === 'material') || (Number(item.count) || 1) > 1) && (
                  <span className="absolute bottom-1 right-1 font-mono text-[10px] font-black text-amber-200 bg-black/95 border border-amber-500/80 rounded px-1.5 py-0 shadow-[0_0_8px_rgba(0,0,0,0.95)] z-10 select-none pointer-events-none">
                    {item.count || 1}
                  </span>
                )}

                {item ? (
                  <div className="flex flex-col items-center justify-center w-full h-full pointer-events-none select-none">
                    <img
                      src={item.image}
                      alt={item.name}
                      draggable={false}
                      className={`w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow transition-transform group-hover:scale-110 pointer-events-none select-none ${
                        isClassLocked ? 'opacity-70 grayscale-[20%]' : ''
                      }`}
                    />
                    <span className={`text-[9px] font-cinzel text-center line-clamp-1 w-full px-0.5 mt-0.5 pointer-events-none select-none ${
                      isClassLocked
                        ? 'text-rose-300/80 font-medium'
                        : item.isOre || item.type === 'ore'
                        ? 'text-emerald-200 font-semibold'
                        : isEquip && plusLevel === 7
                        ? 'text-blue-300 font-bold'
                        : isEquip && plusLevel === 8
                        ? 'text-purple-300 font-bold'
                        : isEquip && plusLevel >= 9
                        ? 'text-rose-300 font-black'
                        : 'text-amber-100'
                    }`}>
                      {item.name}{isEquip && plusLevel > 0 ? ` +${plusLevel}` : ''}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-600 font-mono pointer-events-none select-none">
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
          isClassLocked={Boolean(displayedItem && !isItemForPlayerClass(displayedItem, player))}
          mousePos={mousePos}
          onEquip={(it) => {
            if (isItemForPlayerClass(it, player)) {
              onEquipItem?.(it);
              setPinnedItem(null);
              setHoveredItem(null);
            }
          }}
          onDiscard={(instId, sellPrice, amountToSell) => {
            onDiscardItem?.(instId, sellPrice, amountToSell);
            setPinnedItem(null);
            setHoveredItem(null);
          }}
          onClose={() => {
            setPinnedItem(null);
            setHoveredItem(null);
          }}
        />
      )}

      {/* Özel MMORPG Sağ Tık Menüsü (Kuşan / Sil / Sat) */}
      <ItemContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        item={contextMenu.item}
        isEquipped={false}
        player={player}
        onEquip={(it) => {
          if (isItemForPlayerClass(it, player)) {
            onEquipItem?.(it);
          }
        }}
        onDiscard={(instId, sellPrice, amountToSell) => {
          onDiscardItem?.(instId, sellPrice, amountToSell);
        }}
        onInspect={(it) => {
          setPinnedItem(it);
        }}
        onClose={() => {
          setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, item: null });
        }}
      />
    </div>
  );
}
