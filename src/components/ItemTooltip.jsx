import React from 'react';
import { Sparkles, Shield, Trash2, ArrowRightLeft, Lock, Zap } from 'lucide-react';
import ElvenButton from './ElvenButton';
import { calculateItemPlusStats } from '../config/itemsData';

export function ItemTooltipCard({
  item,
  isEquipped = false,
  titlePrefix = null,
  onEquip,
  onUnequip,
  onDiscard,
  isPinned = false,
  isClassLocked = false,
  onClose,
}) {
  if (!item) return null;

  const isEquip = Boolean(!item.isOre && item.type !== 'ore' && !item.isMaterial && item.type !== 'material' && item.type !== 'potion' && (item.slot || item.setKey || item.slotName));
  const plusLevel = isEquip ? (Number(item.plusLevel) || 0) : 0;
  const plusStats = isEquip ? calculateItemPlusStats(item) : { physicalDamage: 0, magicDamage: 0, defense: 0, hp: 0 };
  const auraClass = isEquip && plusLevel === 7 ? 'aura-electric-plus7' : isEquip && plusLevel === 8 ? 'aura-electric-plus8' : isEquip && plusLevel >= 9 ? 'aura-electric-plus9' : '';

  return (
    <div className={`w-64 p-3 rounded-lg border-2 border-amber-400/90 bg-[#070b0e]/95 backdrop-blur-md shadow-2xl shadow-black ring-1 ring-amber-500/40 text-left space-y-2.5 z-50 animate-fadeIn ${auraClass}`}>
      {/* Title Prefix Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
        <span
          className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
            item.isOre || item.type === 'ore'
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
              : item.isMaterial || item.type === 'material'
              ? 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/50'
              : isEquipped
              ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
          }`}
        >
          {titlePrefix || (item.isOre || item.type === 'ore' ? 'Elf Madeni & Cevher' : item.isMaterial || item.type === 'material' ? 'Yükseltme Malzemesi' : isEquipped ? 'Kuşanılan Ekipman' : 'Çantadaki Eşya')}
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          {item.isOre || item.type === 'ore' || item.isMaterial ? item.rarity || 'Materyal' : `Lv. ${item.levelMin || 1}-${item.levelMax || 10}`}
        </span>
      </div>

      {/* Item Image & Title */}
      <div className="flex items-center gap-2.5">
        <div className={`w-12 h-12 rounded-lg border p-1 flex items-center justify-center flex-shrink-0 shadow-inner relative ${
          item.isOre || item.type === 'ore'
            ? 'border-emerald-400/80 bg-emerald-950/40'
            : item.isMaterial || item.type === 'material'
            ? 'border-indigo-400/80 bg-indigo-950/40'
            : plusLevel === 7
            ? 'border-blue-400 bg-blue-950/50'
            : plusLevel === 8
            ? 'border-purple-400 bg-purple-950/50'
            : plusLevel >= 9
            ? 'border-rose-400 bg-rose-950/50'
            : 'border-amber-400/60 bg-black/70'
        }`}>
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain drop-shadow"
          />
          {isEquip && (
            <span className={`absolute bottom-0.5 right-0.5 font-mono text-[8px] font-black px-1 rounded ${
              plusLevel === 7 ? 'text-blue-200 bg-blue-950 border border-blue-400' :
              plusLevel === 8 ? 'text-purple-200 bg-purple-950 border border-purple-400' :
              plusLevel >= 9 ? 'text-rose-200 bg-rose-950 border border-red-500' :
              'text-amber-200 bg-black/90 border border-amber-500/70'
            }`}>
              +{plusLevel}
            </span>
          )}
        </div>
        <div className="overflow-hidden">
          <h4 className={`font-cinzel font-bold text-xs line-clamp-2 ${
            isEquip && plusLevel === 7 ? 'text-blue-200' :
            isEquip && plusLevel === 8 ? 'text-purple-200' :
            isEquip && plusLevel >= 9 ? 'text-rose-200' :
            'text-amber-100 gold-text-glow'
          }`}>
            {item.name}{isEquip && plusLevel > 0 ? ` +${plusLevel}` : ''}
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
          <span className="text-slate-400">{item.isOre || item.type === 'ore' || item.isMaterial ? 'Eşya Türü:' : 'Ekipman Yuvası:'}</span>
          <span className="text-amber-200 font-semibold">
            {item.slotName || (item.isOre ? 'Cevher' : item.isMaterial ? 'Yükseltme Malzemesi' : item.slot)}
          </span>
        </div>
        {item.isOre || item.type === 'ore' || item.isMaterial || item.type === 'material' ? (
          <>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Yığın Miktarı:</span>
              <span className="text-emerald-300 font-bold">
                {item.count || 1} / 200 Adet
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Birim Satış:</span>
              <span className="text-yellow-300 font-semibold">
                {(item.sellPrice || 250).toLocaleString('tr-TR')} Altın
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Gereken Seviye:</span>
              <span className="text-emerald-400 font-semibold">
                {item.levelMin || 1} - {item.levelMax || 10} Seviye
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Yükseltme Kademesi:</span>
              <span className={`font-bold ${
                plusLevel === 7 ? 'text-blue-300' :
                plusLevel === 8 ? 'text-purple-300' :
                plusLevel >= 9 ? 'text-rose-300' :
                'text-amber-300'
              }`}>
                +{plusLevel} / +9
              </span>
            </div>
            {/* + Seviyesinden Gelen Bonuslar */}
            {plusLevel > 0 && (
              <div className="pt-1 border-t border-white/5 space-y-0.5">
                {plusStats.physicalDamage > 0 && (
                  <div className="flex justify-between text-amber-300 text-[10px]">
                    <span>⚔️ Saldırı Gücü:</span>
                    <span>+{plusStats.physicalDamage}</span>
                  </div>
                )}
                {plusStats.magicDamage > 0 && (
                  <div className="flex justify-between text-cyan-300 text-[10px]">
                    <span>✨ Büyülü Saldırı:</span>
                    <span>+{plusStats.magicDamage}</span>
                  </div>
                )}
                {plusStats.defense > 0 && (
                  <div className="flex justify-between text-emerald-300 text-[10px]">
                    <span>🛡️ Zırh / Savunma:</span>
                    <span>+{plusStats.defense}</span>
                  </div>
                )}
                {plusStats.hp > 0 && (
                  <div className="flex justify-between text-rose-300 text-[10px]">
                    <span>❤️ Maksimum Can:</span>
                    <span>+{plusStats.hp} HP</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sınıf Kısıtlaması Uyarısı */}
      {isClassLocked && (
        <div className="p-1.5 rounded bg-rose-950/80 border border-rose-500/50 text-[10px] text-rose-300 font-mono flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>Yalnızca <strong>{item.className || 'Farklı Sınıf'}</strong> kuşanabilir!</span>
        </div>
      )}

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
              <div className="space-y-1">
                <ElvenButton
                  size="sm"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    const count = Number(item.count) > 0 ? Number(item.count) : 1;
                    const totalGold = (Number(item.sellPrice) || 1500) * count;
                    onDiscard(item.instanceId, totalGold, 'all');
                    onClose?.();
                  }}
                >
                  Tüm Yığını Sat (+{((Number(item.sellPrice) || 1500) * (item.count || 1)).toLocaleString('tr-TR')} Altın)
                </ElvenButton>

                {(item.count || 1) > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const unitPrice = Number(item.sellPrice) || 1500;
                      onDiscard(item.instanceId, unitPrice, 1);
                      onClose?.();
                    }}
                    className="w-full py-1 rounded bg-black/60 hover:bg-white/10 border border-yellow-500/30 text-yellow-100 font-cinzel text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <span>1 Adet Sat (+{(Number(item.sellPrice) || 1500).toLocaleString('tr-TR')} Altın)</span>
                  </button>
                )}
              </div>
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
          ) : isClassLocked ? (
            <button
              type="button"
              disabled
              className="w-full py-1.5 px-3 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300/70 font-cinzel text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Farklı Sınıf (Giyilemez)</span>
            </button>
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
      ) : isClassLocked ? (
        <div className="pt-1 text-[9px] font-mono text-rose-400/90 border-t border-white/5 text-center flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-rose-400" />
          <span>Bu eşyayı sınıfınız kuşanamaz</span>
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
  isClassLocked = false,
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
              isClassLocked={isClassLocked}
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
            isClassLocked={isClassLocked}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  );
}
