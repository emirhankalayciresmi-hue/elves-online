import React, { useEffect, useRef } from 'react';
import {
  Sword, ArrowDownCircle, Trash2, Coins, Sparkles, Lock, X
} from 'lucide-react';
import { isItemForPlayerClass } from '@/core/config/itemsData';

export default function ItemContextMenu({
  isOpen,
  position = { x: 0, y: 0 },
  item,
  isEquipped = false,
  slotKey = null,
  player,
  onEquip,
  onUnequip,
  onDiscard,
  onInspect,
  onClose,
}) {
  const menuRef = useRef(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isClassLocked = !isEquipped && !isItemForPlayerClass(item, player);
  const isOre = item.isOre || item.type === 'ore';

  // Calculate adjusted coordinates to prevent overflowing window bounds
  const menuWidth = 190;
  const menuHeight = 220;
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 900;

  let left = position.x + 8;
  let top = position.y + 8;

  if (left + menuWidth > winW - 10) {
    left = Math.max(10, position.x - menuWidth - 8);
  }
  if (top + menuHeight > winH - 10) {
    top = Math.max(10, position.y - menuHeight - 8);
  }
  if (top < 10) top = 10;
  if (left < 10) left = 10;

  return (
    <div
      ref={menuRef}
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-[99999] w-48 rounded-xl bg-[#070b0e]/95 backdrop-blur-md border-2 border-amber-500/60 shadow-[0_10px_35px_rgba(0,0,0,0.9)] ring-1 ring-amber-400/30 p-2 space-y-1.5 animate-fadeIn select-none font-sans text-left"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Mini Item Header */}
      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/60 border border-white/10">
        <div className="w-8 h-8 rounded bg-black/80 border border-amber-500/40 p-0.5 flex items-center justify-center flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-cinzel font-bold text-amber-100 gold-text-glow truncate">
            {item.name}
          </p>
          <p className="text-[9px] font-mono text-slate-400 truncate">
            {isOre ? 'Maden & Materyal' : item.className ? `${item.className} Eşyası` : 'Ekipman'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-white p-0.5 rounded cursor-pointer"
          title="Kapat"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Actions List */}
      <div className="space-y-1 pt-0.5">
        {/* 1. Kuşan (Equip) */}
        {!isEquipped && !isOre && (
          isClassLocked ? (
            <div
              className="w-full px-2.5 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300/70 font-cinzel text-[11px] font-bold flex items-center gap-2 cursor-not-allowed opacity-60"
              title="Bu eşyayı sadece ait olduğu sınıf giyebilir"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Giyilemez (Kilitli)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onEquip?.(item);
                onClose?.();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-500/50 text-emerald-100 font-cinzel text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              <Sword className="w-3.5 h-3.5 text-emerald-400" />
              <span>Karaktere Kuşan</span>
            </button>
          )
        )}

        {/* 2. Çıkar (Unequip) */}
        {isEquipped && (
          <button
            type="button"
            onClick={() => {
              onUnequip?.(slotKey || item.slot);
              onClose?.();
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-800/80 border border-amber-500/50 text-amber-100 font-cinzel text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-elven-gold"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Ekipmanı Çıkar</span>
          </button>
        )}

        {/* 3. İncele (Inspect) */}
        <button
          type="button"
          onClick={() => {
            onInspect?.(item);
            onClose?.();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-amber-200 font-cinzel text-[11px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
          <span>Detayları İncele</span>
        </button>

        {/* 4. Madeni Sat (Eğer madense) */}
        {isOre && !isEquipped && onDiscard && (
          <button
            type="button"
            onClick={() => {
              onDiscard(item.instanceId, item.sellPrice || 1500);
              onClose?.();
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-800/70 border border-yellow-500/40 text-yellow-200 font-cinzel text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400" />
            <span>Madeni Sat (+{(item.sellPrice || 1500).toLocaleString('tr-TR')})</span>
          </button>
        )}

        {/* 5. Çantadan Sil (Eğer çantadaysa) */}
        {!isEquipped && onDiscard && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`"${item.name}" eşyasını çantadan tamamen silmek istediğinize emin misiniz?`)) {
                onDiscard(item.instanceId);
                onClose?.();
              }
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-100 font-cinzel text-[11px] font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Çantadan Sil</span>
          </button>
        )}
      </div>
    </div>
  );
}
