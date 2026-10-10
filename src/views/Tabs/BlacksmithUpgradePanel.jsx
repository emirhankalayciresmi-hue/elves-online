import React, { useState } from 'react';
import {
  Hammer, Sparkles, Shield, Sword, AlertTriangle, Check, X,
  ArrowRight, Flame, Layers, Info, Coins, CheckCircle2, RotateCcw
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ElvenButton from '../../components/ElvenButton';
import {
  UPGRADE_CONFIG,
  getRequiredClassMaterial,
  calculateItemPlusStats,
  UPGRADE_ITEMS,
} from '../../config/itemsData';
import { upgradeEquipment } from '../../services/gameEngine';

export default function BlacksmithUpgradePanel({ player, layoutMode = 'mobile', onUpdatePlayer }) {
  const isPC = layoutMode === 'pc';
  const [selectedInstanceId, setSelectedInstanceId] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [classFilter, setClassFilter] = useState('all'); // 'all', 'warrior', 'ninja', 'mage'
  const [isDragOverAnvil, setIsDragOverAnvil] = useState(false);

  // 1. Kuşanılan ekipmanlar (Kullanıcı kuralı: Her zaman ilk sırada listelensin ve 'Kuşanıldı' ibaresi olsun)
  const equipped = player?.equipped || {};
  const equippedList = Object.entries(equipped)
    .filter(([, it]) => it && Boolean(it.slot || it.setKey || it.slotName))
    .map(([slotKey, it]) => ({
      ...it,
      isEquippedItem: true,
      equippedSlotKey: slotKey,
    }));

  // 2. Çantadaki yükseltilebilir ekipmanlar
  const inventory = Array.isArray(player?.inventory) ? player.inventory : [];
  const equipmentInBag = inventory
    .filter(
      (item) =>
        item &&
        !item.isOre &&
        item.type !== 'ore' &&
        !item.isMaterial &&
        item.type !== 'material' &&
        item.type !== 'potion' &&
        (item.slot || item.setKey || item.slotName)
    )
    .map((it) => ({ ...it, isEquippedItem: false }));

  // Kuşanılanlar HER ZAMAN İLK SIRADA!
  const allEquipment = [...equippedList, ...equipmentInBag];

  // Sınıfsal filtreleme
  const filteredEquipment = allEquipment.filter((item) => {
    if (classFilter === 'all') return true;
    const itemClass = (item.classId || '').toLowerCase();
    const itemSet = (item.setKey || '').toLowerCase();
    const itemClassName = (item.className || '').toLowerCase();

    if (classFilter === 'warrior') {
      return itemClass === 'warrior' || itemSet === 'warrior' || itemClassName.includes('savaşçı');
    }
    if (classFilter === 'ninja') {
      return (
        itemClass === 'ninja' ||
        itemClass === 'assassin' ||
        itemSet === 'assassin' ||
        itemSet === 'ninja' ||
        itemClassName.includes('ninja')
      );
    }
    if (classFilter === 'mage') {
      return itemClass === 'mage' || itemSet === 'mage' || itemClassName.includes('büyücü');
    }
    return true;
  });

  // Seçili eşya
  const selectedItem = allEquipment.find((it) => it.instanceId === selectedInstanceId) || null;
  const currentPlus = Number(selectedItem?.plusLevel) || 0;
  const nextPlus = currentPlus + 1;
  const config = currentPlus < 9 ? UPGRADE_CONFIG[nextPlus] : null;

  // Malzeme sayıları
  const ownedStones = inventory
    .filter((it) => it.id === 'upgrade_stone')
    .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0);

  const ownedMoonwolf = inventory
    .filter((it) => it.id === 'claw_moonwolf')
    .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0);

  const ownedShadowsilk = inventory
    .filter((it) => it.id === 'silk_shadowspider')
    .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0);

  const ownedArcanecrystal = inventory
    .filter((it) => it.id === 'crystal_arcane')
    .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0);

  const reqClassMat = config && config.classMats > 0 ? getRequiredClassMaterial(selectedItem, player) : null;
  const ownedClassMats = reqClassMat
    ? inventory
        .filter((it) => it.id === reqClassMat.id)
        .reduce((acc, cur) => acc + (Number(cur.count) || 1), 0)
    : 0;

  // Yeterlilik kontrolleri
  const hasGold = config ? (player?.gold || 0) >= config.gold : false;
  const hasStones = config ? ownedStones >= config.stones : false;
  const hasClassMats = config ? (!reqClassMat || ownedClassMats >= config.classMats) : false;
  const canUpgrade = Boolean(selectedItem && config && hasGold && hasStones && hasClassMats && !isUpgrading);

  // İstatistik farkları
  const currentStats = calculateItemPlusStats(selectedItem);
  const nextStats = selectedItem ? calculateItemPlusStats({ ...selectedItem, plusLevel: nextPlus }) : null;

  // Yükseltme işlemi
  const handleUpgrade = () => {
    if (!canUpgrade || !selectedItem) return;

    setIsUpgrading(true);
    setLastResult(null);

    // Çekiç vurma simülasyonu (650ms)
    setTimeout(() => {
      const res = upgradeEquipment(player, selectedItem.instanceId);
      setIsUpgrading(false);

      if (res.success) {
        onUpdatePlayer?.(res.player);
        setLastResult({
          isSuccess: res.isUpgradeSuccess,
          message: res.message,
          newLevel: res.newLevel,
        });

        // Seçili eşyayı yeni nesneyle güncelle
        if (res.upgradedItem) {
          setSelectedInstanceId(res.upgradedItem.instanceId);
        }
      } else {
        setLastResult({
          isSuccess: false,
          message: res.error || 'Yükseltme başarısız oldu!',
          newLevel: currentPlus,
        });
      }
    }, 650);
  };

  const selectedAura = currentPlus === 7 ? 'aura-electric-plus7' : currentPlus === 8 ? 'aura-electric-plus8' : currentPlus >= 9 ? 'aura-electric-plus9' : '';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. ÜST MALZEME & ALTIN ÇANTASI ÖZETİ */}
      <OrnateFrame className="p-3 bg-gradient-to-r from-black/90 via-amber-950/20 to-black/90">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-400" />
            <span className="font-cinzel font-bold text-amber-200 uppercase">Kadim Demircinin Ocağı</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-indigo-500/40 text-indigo-200">
              <img src="/assets/items/upgrade_stone.svg" alt="Taş" className="w-3.5 h-3.5 object-contain" />
              <span>Yükseltme Taşı: <strong>{ownedStones}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-rose-500/40 text-rose-200">
              <img src="/assets/items/claw_moonwolf.svg" alt="Pençe" className="w-3.5 h-3.5 object-contain" />
              <span>Kurt Pençesi: <strong>{ownedMoonwolf}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-emerald-500/40 text-emerald-200">
              <img src="/assets/items/silk_shadowspider.svg" alt="İpek" className="w-3.5 h-3.5 object-contain" />
              <span>Gölge İpeği: <strong>{ownedShadowsilk}</strong></span>
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-cyan-500/40 text-cyan-200">
              <img src="/assets/items/crystal_arcane.svg" alt="Kristal" className="w-3.5 h-3.5 object-contain" />
              <span>Ruh Kristali: <strong>{ownedArcanecrystal}</strong></span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-yellow-950/70 border border-yellow-500/50 text-yellow-300 font-bold">
              <Coins className="w-3.5 h-3.5" /> {(player?.gold || 0).toLocaleString('tr-TR')} Altın
            </span>
          </div>
        </div>
      </OrnateFrame>

      {/* Yükseltme Sonuç Bildirimi */}
      {lastResult && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between animate-fadeIn ${
            lastResult.isSuccess
              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-rose-950/90 border-rose-500/70 text-rose-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
          }`}
        >
          <div className="flex items-center gap-2">
            {lastResult.isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-bounce" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
            )}
            <span className="font-semibold">{lastResult.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastResult(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-black/50 border border-white/10"
          >
            Kapat
          </button>
        </div>
      )}

      {/* 2. DEMİRCİ ÖRSÜ / YÜKSELTME YUVASI (Sürükle - Bırak Destekli) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          setIsDragOverAnvil(true);
        }}
        onDragLeave={() => setIsDragOverAnvil(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOverAnvil(false);
          try {
            const raw = e.dataTransfer.getData('text/plain');
            let droppedId = raw;
            try {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.instanceId) droppedId = parsed.instanceId;
            } catch {}
            if (droppedId) {
              setSelectedInstanceId(droppedId);
              setLastResult(null);
            }
          } catch (err) {
            console.error('Anvil drop error:', err);
          }
        }}
      >
        <OrnateFrame
          className={`p-4 sm:p-5 bg-gradient-to-b from-[#0a1215] via-[#080d10] to-[#04080a] space-y-4 shadow-xl transition-all duration-200 ${
            isDragOverAnvil
              ? 'border-2 border-emerald-400 ring-2 ring-emerald-400/80 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
              : 'border-amber-400'
          }`}
        >
          {!selectedItem ? (
            /* Eşya Seçilmediğinde Boş Örs */
            <div className="p-8 text-center space-y-3 border-2 border-dashed border-amber-500/30 rounded-xl bg-black/40">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/50 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-elven-inner animate-pulse">
                <Hammer className="w-8 h-8 text-amber-400" />
              </div>
              <h4 className="font-cinzel text-base font-bold text-amber-200">
                {isDragOverAnvil ? '✨ Eşyayı Örse Bırakın!' : 'Demirci Örsü Boş'}
              </h4>
              <p className="text-xs text-slate-300 font-cormorant max-w-md mx-auto">
                Yükseltmek istediğiniz ekipmana tıklayın veya sürükleyip örsün üzerine bırakın.
              </p>
            </div>
        ) : (
          /* Eşya Seçildiğinde Aktif Örs Kartı */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              {/* Eşya İkonu & Seviye Değişimi */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-16 h-16 rounded-xl border p-2 flex items-center justify-center flex-shrink-0 bg-black/80 relative shadow-lg ${selectedAura} ${
                    currentPlus === 7 ? 'border-blue-400' :
                    currentPlus === 8 ? 'border-purple-400' :
                    currentPlus >= 9 ? 'border-rose-500' :
                    'border-amber-400'
                  }`}
                >
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-full h-full object-contain drop-shadow"
                  />
                  <span className={`absolute bottom-0.5 right-0.5 font-mono text-[9px] font-black px-1.5 rounded ${
                    currentPlus === 7 ? 'text-blue-200 bg-blue-950 border border-blue-400' :
                    currentPlus === 8 ? 'text-purple-200 bg-purple-950 border border-purple-400' :
                    currentPlus >= 9 ? 'text-rose-200 bg-rose-950 border border-red-500' :
                    'text-amber-200 bg-black/90 border border-amber-500/70'
                  }`}>
                    +{currentPlus}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/40 uppercase font-bold">
                      {selectedItem.slotName || 'Ekipman'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedItem.className || 'Tüm Sınıflar'}
                    </span>
                  </div>
                  <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-100 gold-text-glow">
                    {selectedItem.name} +{currentPlus}
                  </h3>
                </div>
              </div>

              {/* Seviye Geçiş Rozeti */}
              <div className="flex items-center gap-2 bg-black/70 px-3.5 py-2 rounded-xl border border-amber-500/30 font-mono">
                <span className="text-sm font-bold text-slate-300">+{currentPlus}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <span className={`text-base font-black ${
                  nextPlus === 7 ? 'text-blue-400' :
                  nextPlus === 8 ? 'text-purple-400' :
                  nextPlus === 9 ? 'text-rose-400' :
                  'text-emerald-400'
                }`}>
                  {currentPlus < 9 ? `+${nextPlus}` : 'MAKS (+9)'}
                </span>
              </div>
            </div>

            {/* Azami Seviye Uyarısı veya Yükseltme Detayı */}
            {currentPlus >= 9 ? (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-center space-y-1">
                <span className="text-sm font-cinzel font-bold text-amber-200 block">
                  👑 Bu Ekipman Zirveye Ulaştı (+9 Efsanevi Seviye)!
                </span>
                <p className="text-xs text-slate-300 font-cormorant">
                  Ekipman artık en yüksek saldırı ve savunma gücüne sahiptir, daha fazla yükseltilemez.
                </p>
              </div>
            ) : config ? (
              <div className="space-y-3">
                {/* Başarı Şansı Çubuğu */}
                <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Demirci Başarı Şansı:</span>
                    </span>
                    <span className={`font-bold text-sm ${
                      config.rate >= 60 ? 'text-emerald-400' :
                      config.rate >= 40 ? 'text-yellow-400' :
                      'text-rose-400'
                    }`}>
                      %{config.rate} Başarı
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        config.rate >= 60 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                        config.rate >= 40 ? 'bg-gradient-to-r from-yellow-600 to-amber-400' :
                        'bg-gradient-to-r from-rose-600 to-rose-400'
                      }`}
                      style={{ width: `${config.rate}%` }}
                    />
                  </div>
                </div>

                {/* Gereken Malzemeler Listesi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  {/* Altın */}
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    hasGold ? 'bg-black/60 border-emerald-500/40 text-slate-200' : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span>Altın:</span>
                    </div>
                    <span className="font-bold">
                      {config.gold.toLocaleString('tr-TR')}
                      {hasGold ? <Check className="w-3.5 h-3.5 text-emerald-400 inline ml-1" /> : <X className="w-3.5 h-3.5 text-rose-400 inline ml-1" />}
                    </span>
                  </div>

                  {/* Yükseltme Taşı */}
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    hasStones ? 'bg-black/60 border-emerald-500/40 text-slate-200' : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      <img src="/assets/items/upgrade_stone.svg" alt="Taş" className="w-4 h-4 object-contain" />
                      <span>Yükseltme Taşı:</span>
                    </div>
                    <span className="font-bold">
                      {ownedStones} / {config.stones}
                      {hasStones ? <Check className="w-3.5 h-3.5 text-emerald-400 inline ml-1" /> : <X className="w-3.5 h-3.5 text-rose-400 inline ml-1" />}
                    </span>
                  </div>

                  {/* Sınıf Malzemesi (+7, +8, +9) */}
                  {config.classMats > 0 && reqClassMat ? (
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      hasClassMats ? 'bg-black/60 border-emerald-500/40 text-slate-200' : 'bg-rose-950/30 border-rose-500/50 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2 truncate pr-1">
                        <img src={reqClassMat.image} alt={reqClassMat.name} className="w-4 h-4 object-contain flex-shrink-0" />
                        <span className="truncate">{reqClassMat.name}:</span>
                      </div>
                      <span className="font-bold flex-shrink-0">
                        {ownedClassMats} / {config.classMats}
                        {hasClassMats ? <Check className="w-3.5 h-3.5 text-emerald-400 inline ml-1" /> : <X className="w-3.5 h-3.5 text-rose-400 inline ml-1" />}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-slate-400 flex items-center justify-center text-[11px]">
                      <span>+6'ya kadar sınıf malzemesi gerekmez</span>
                    </div>
                  )}
                </div>

                {/* Yeni Nitelik Önizlemesi */}
                {nextStats && (
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300">
                    <span className="text-amber-300 font-semibold">+{nextPlus} Seviyesinde Kazanılacak Bonuslar:</span>
                    <div className="flex items-center gap-3">
                      {nextStats.physicalDamage > 0 && (
                        <span className="text-amber-200">⚔️ Saldırı: +{nextStats.physicalDamage} (+12)</span>
                      )}
                      {nextStats.magicDamage > 0 && (
                        <span className="text-cyan-200">✨ Büyü: +{nextStats.magicDamage} (+12)</span>
                      )}
                      {nextStats.defense > 0 && (
                        <span className="text-emerald-200">🛡️ Savunma: +{nextStats.defense} (+12)</span>
                      )}
                      {nextStats.hp > 0 && (
                        <span className="text-rose-200">❤️ Can: +{nextStats.hp} HP (+60)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Başarısızlık Cezası Uyarısı (Kullanıcı Kuralı: +0'a Düşer) */}
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-300">Başarısızlık Riski: </strong>
                    Yükseltme başarısız olursa eşya kırılmaz fakat <span className="underline font-bold text-white">+0 seviyesine geriler</span> ve harcanan malzemeler tükenir!
                  </div>
                </div>

                {/* Eylemler: Yükselt ve Seçimi İptal Et */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInstanceId(null);
                      setLastResult(null);
                    }}
                    className="px-3 py-2 text-xs font-mono text-slate-400 hover:text-white bg-black/60 hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer transition-all"
                  >
                    Seçimi Kaldır
                  </button>

                  <ElvenButton
                    onClick={handleUpgrade}
                    disabled={!canUpgrade}
                    icon={Hammer}
                    className={isUpgrading ? 'animate-bounce' : ''}
                  >
                    {isUpgrading
                      ? 'Demirci Çekiç Vuruyor...'
                      : !hasGold
                      ? 'Yetersiz Altın'
                      : !hasStones
                      ? 'Yetersiz Yükseltme Taşı'
                      : !hasClassMats
                      ? `Yetersiz ${reqClassMat?.name}`
                      : `Demirciye Bırak (+${nextPlus} Yap)`}
                  </ElvenButton>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </OrnateFrame>
    </div>

      {/* 3. ÇANTADAKİ VE KUŞANILAN YÜKSELTİLEBİLİR EKİPMANLAR */}
      <OrnateFrame className="p-4 space-y-3 bg-black/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
              Yükseltilebilir Ekipmanlarınız ({filteredEquipment.length} Eşya)
            </h4>
          </div>

          {/* Sınıfsal Filtre Butonları */}
          <div className="flex items-center gap-1 text-[10px] font-mono">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'warrior', label: 'Savaşçı' },
              { id: 'ninja', label: 'Ninja' },
              { id: 'mage', label: 'Büyücü' },
            ].map((tab) => {
              const isTabActive = classFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setClassFilter(tab.id)}
                  className={`px-2 py-0.5 rounded font-cinzel font-bold border transition-all cursor-pointer ${
                    isTabActive
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-elven-gold'
                      : 'bg-black/50 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>Örse tıklayarak veya sürükleyip bırakarak yerleştirebilirsiniz</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span>🛡️</span>
            <span>Kuşanılan eşyalar her zaman ilk sırada</span>
          </span>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-cormorant italic">
            Bu kategoride yükseltilebilir ekipman bulunmuyor. Zindanlardan eşya düşürerek demirciye getirebilirsiniz.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {filteredEquipment.map((item) => {
              const isSelected = selectedInstanceId === item.instanceId;
              const plus = Number(item.plusLevel) || 0;
              const aura = plus === 7 ? 'aura-electric-plus7' : plus === 8 ? 'aura-electric-plus8' : plus >= 9 ? 'aura-electric-plus9' : '';

              return (
                <div
                  key={item.instanceId}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.instanceId);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    setSelectedInstanceId(item.instanceId);
                    setLastResult(null);
                  }}
                  className={`w-full aspect-square rounded-xl border p-1.5 flex flex-col items-center justify-center relative cursor-pointer transition-all duration-200 group ${aura} ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400 shadow-elven-gold scale-105'
                      : item.isEquippedItem
                      ? 'border-emerald-500/60 bg-emerald-950/25 hover:border-emerald-400 hover:bg-emerald-950/40'
                      : 'border-amber-500/40 bg-black/60 hover:border-amber-300 hover:bg-black/90'
                  }`}
                >
                  {/* Kuşanıldı İbaresi (Her zaman ilk sırada yer alan kuşanılmış eşyalarda) */}
                  {item.isEquippedItem && (
                    <span className="absolute top-1 left-1 font-mono text-[7px] font-black text-emerald-200 bg-emerald-950/95 border border-emerald-400/80 rounded px-1 py-0.2 shadow flex items-center gap-0.5 z-10 select-none">
                      <span>🛡️</span>
                      <span>Kuşanıldı</span>
                    </span>
                  )}

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-contain drop-shadow group-hover:scale-110 transition-transform"
                  />

                  {/* +0 .. +9 Rozeti */}
                  <span
                    className={`absolute bottom-0.5 right-0.5 font-mono text-[9px] font-black rounded px-1.5 py-0 select-none z-10 border ${
                      plus === 7
                        ? 'text-blue-300 bg-blue-950/95 border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.9)]'
                        : plus === 8
                        ? 'text-purple-300 bg-purple-950/95 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.95)]'
                        : plus >= 9
                        ? 'text-rose-200 bg-rose-950/95 border-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]'
                        : 'text-amber-200 bg-black/90 border-amber-500/70 shadow-[0_0_6px_rgba(0,0,0,0.9)]'
                    }`}
                  >
                    +{plus}
                  </span>

                  <span className={`text-[8px] font-cinzel text-center line-clamp-1 w-full px-0.5 mt-0.5 font-semibold ${
                    plus === 7 ? 'text-blue-300' :
                    plus === 8 ? 'text-purple-300' :
                    plus >= 9 ? 'text-rose-300' :
                    item.isEquippedItem ? 'text-emerald-200' :
                    'text-amber-100'
                  }`}>
                    {item.name}{plus > 0 ? ` +${plus}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </OrnateFrame>
    </div>
  );
}
