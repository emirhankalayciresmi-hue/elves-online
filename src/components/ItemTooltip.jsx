import React from 'react';
import { Sparkles, Shield, Trash2, ArrowRightLeft } from 'lucide-react';
import ElvenButton from './ElvenButton';

export function ItemTooltipCard({
  item,
  isEquipped = false,
  titlePrefix = null,
  onEquip,
  onUnequip,
  onDiscard,
  isPinned = false,
  onClose,
}) {
  if (!item) return null;

  return (
    <div className="w-64 p-3 rounded-lg border-2 border-amber-400/90 bg-[#070b0e]/95 backdrop-blur-md shadow-2xl shadow-black ring-1 ring-amber-500/40 text-left space-y-2.5 z-50 animate-fadeIn">
      {/* Title Prefix Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span
          className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
            item.isOre || item.type === 'ore'
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
              : isEquipped
              ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
          }`}
        >
          {titlePrefix || (item.isOre || item.type === 'ore' ? 'Elf Madeni & Cevher' : isEquipped ? 'Kuşanılan Ekipman' : 'Çantadaki Eşya')}
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {item.isOre || item.type === 'ore' ? item.rarity || 'Maden' : `Lv. ${item.levelMin || 1}-${item.levelMax || 10}`}
        </span>
      </div>

      {/* Item Image & Title */}
      <div className="flex items-center gap-2.5">
        <div className={`w-12 h-12 rounded-lg border p-1 flex items-center justify-center flex-shrink-0 shadow-inner ${
          item.isOre || item.type === 'ore'
            ? 'border-emerald-400/80 bg-emerald-950/40'
            : 'border-amber-400/60 bg-black/70'
        }`}>
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow"
          />
        </div>
        <div className="overflow-hidden">
          <h4 className="font-cinzel font-bold text-xs text-amber-100 gold-text-glow line-clamp-2">
            {item.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[9px] font-mono text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/30">
              {item.setName || 'Kadim Elf Materyali'}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {item.className || 'Zanaat'}
            </span>
          </div>
        </div>
      </div>

      {/* Slot & Info */}
      <div className="p-2 rounded bg-black/60 border border-white/5 space-y-1 text-[11px] font-mono">
        <div className="flex justify-between text-slate-300">
          <span className="text-slate-400">{item.isOre || item.type === 'ore' ? 'Eşya Türü:' : 'Ekipman Yuvası:'}</span>
          <span className="text-amber-200 font-semibold">
            {item.slotName || (item.isOre ? 'Cevher & Materyal' : item.slot)}
          </span>
        </div>
        {item.isOre || item.type === 'ore' ? (
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Satış Değeri:</span>
            <span className="text-yellow-300 font-semibold">
              {(item.sellPrice || 1500).toLocaleString('tr-TR')} Altın
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Gereken Seviye:</span>
            <span className="text-emerald-400 font-semibold">
              {item.levelMin || 1} - {item.levelMax || 10} Seviye
            </span>
          </div>
        )}
      </div>

      {/* Description / Lore */}
      <p className="text-xs text-slate-300 font-cormorant leading-relaxed italic border-t border-white/5 pt-1.5">
        "{item.desc}"
      </p>

      {/* Metin2 Interaction Hint or Action Buttons if Pinned */}
      {isPinned ? (
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          {item.isOre || item.type === 'ore' ? (
            /* Ore Actions: Sell or Discard */
            onDiscard && (
              <ElvenButton
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard(item.instanceId, item.sellPrice || 1500);
                  onClose?.();
                }}
              >
                Madeni Sat (+{(item.sellPrice || 1500).toLocaleString('tr-TR')} Altın)
              </ElvenButton>
            )
          ) : isEquipped ? (
            <ElvenButton
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onUnequip?.(item.slot);
                onClose?.();
              }}
            >
              Ekipmanı Çıkar
            </ElvenButton>
          ) : (
            <ElvenButton
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onEquip?.(item);
                onClose?.();
              }}
            >
              Karaktere Kuşan
            </ElvenButton>
          )}

          {!isEquipped && onDiscard && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`"${item.name}" eşyasını çantadan silmek istediğinize emin misiniz?`)) {
                  onDiscard(item.instanceId);
                  onClose?.();
                }
              }}
              className="w-full py-1 text-[10px] font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded border border-rose-500/20 flex items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 className="w-3 h-3" /> Çantadan At
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="w-full py-0.5 text-[10px] font-mono text-slate-400 hover:text-white text-center cursor-pointer"
          >
            Kapat
          </button>
        </div>
      ) : (
        <div className="pt-1 text-[9px] font-mono text-amber-400/80 border-t border-white/5 text-center">
          {item.isOre || item.type === 'ore'
            ? '💎 Kadim Elf Zanaat & Büyü Materyali'
            : `⚡ 2 Kez Hızlı Tıkla: ${isEquipped ? 'Çıkar' : 'Kuşan'}`}
        </div>
      )}
    </div>
  );
}

export default function Metin2ComparisonTooltip({
  activeItem,
  comparedItem,
  isEquipped = false,
  isPinned = false,
  mousePos = null,
  onEquip,
  onUnequip,
  onDiscard,
  onClose,
}) {
  if (!activeItem) return null;

  const isComparison = Boolean(comparedItem);
  const cardWidth = isComparison ? 540 : 270;
  const cardHeight = 390;

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const isMobile = winW < 640;

  // On small mobile screens when pinned, show centered modal dialog for comfortable tapping
  if (isMobile && isPinned) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="pointer-events-auto max-w-full my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center gap-3 shadow-2xl">
            {comparedItem && (
              <ItemTooltipCard
                item={comparedItem}
                isEquipped={true}
                titlePrefix="Şu An Kuşanılan"
                onUnequip={onUnequip}
                isPinned={false}
              />
            )}
            <ItemTooltipCard
              item={activeItem}
              isEquipped={isEquipped}
              titlePrefix={comparedItem ? 'Çantadaki Eşya (Karşılaştırma)' : null}
              onEquip={onEquip}
              onUnequip={onUnequip}
              onDiscard={onDiscard}
              isPinned={isPinned}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    );
  }

  // Floating coordinates near mouse / slot (Metin2 cursor-following style)
  let posX = mousePos ? mousePos.x + 15 : 20;
  let posY = mousePos ? mousePos.y - 30 : 20;

  if (posX + cardWidth > winW - 15) {
    posX = Math.max(10, (mousePos ? mousePos.x : winW) - cardWidth - 15);
  }
  if (posY + cardHeight > winH - 15) {
    posY = Math.max(10, winH - cardHeight - 15);
  }
  if (posY < 10) posY = 10;

  return (
    <>
      {/* If pinned on desktop, backdrop to dismiss on click outside */}
      {isPinned && (
        <div
          className="fixed inset-0 z-[9990] bg-black/30 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}
      <div
        style={{
          position: 'fixed',
          left: `${posX}px`,
          top: `${posY}px`,
          zIndex: 9999,
          pointerEvents: isPinned ? 'auto' : 'none',
        }}
        className="transition-opacity duration-150 shadow-2xl"
      >
        <div className="flex flex-col sm:flex-row items-start gap-3">
          {comparedItem && (
            <ItemTooltipCard
              item={comparedItem}
              isEquipped={true}
              titlePrefix="Şu An Kuşanılan"
              onUnequip={onUnequip}
              isPinned={false}
            />
          )}
          <ItemTooltipCard
            item={activeItem}
            isEquipped={isEquipped}
            titlePrefix={comparedItem ? 'Çantadaki Eşya (Karşılaştırma)' : null}
            onEquip={onEquip}
            onUnequip={onUnequip}
            onDiscard={onDiscard}
            isPinned={isPinned}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}
