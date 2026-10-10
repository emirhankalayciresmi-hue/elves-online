import React, { useState } from 'react';
import { Store, Hammer, Gem, Sparkles, Shield, Sword, FlaskConical, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import BlacksmithUpgradePanel from './BlacksmithUpgradePanel';
import { ALL_MENUS } from '../../config/gameData';
import { buyPotions } from '../../services/gameEngine';

export default function NpcView({ player, layoutMode = 'mobile', onUpdatePlayer }) {
  const [activeSubmenu, setActiveSubmenu] = useState('market');
  const [hpPackSize, setHpPackSize] = useState(200);
  const [manaPackSize, setManaPackSize] = useState(200);
  const [toastMessage, setToastMessage] = useState(null);

  const isPC = layoutMode === 'pc';
  const submenus = ALL_MENUS.find((m) => m.id === 'npc')?.submenus || [];

  const handleBuyPotion = (type, quantity, unitCost) => {
    if (!onUpdatePlayer || !player) return;
    const res = buyPotions(player, type, quantity, unitCost);
    if (res.success) {
      onUpdatePlayer(res.player);
      setToastMessage({
        type: 'success',
        text: `✓ +${quantity} Adet ${type === 'hp' ? 'Kırmızı Can İksiri' : 'Mavi Mana İksiri'} satın alındı!`,
      });
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setToastMessage({
        type: 'error',
        text: `⚠️ ${res.error}`,
      });
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const PACK_SIZES = [1, 10, 50, 200];

  const NPC_ITEMS = {
    market: [
      {
        id: 'hp_pot',
        name: 'Kırmızı Can İksiri',
        type: 'potion_hp',
        unitCost: 50,
        desc: 'Savaşta canınızı anında +300 HP yeniler. Zindanda oto-iksir için kullanılır.',
      },
      {
        id: 'mana_pot',
        name: 'Mavi Mana İksiri',
        type: 'potion_mana',
        unitCost: 60,
        desc: 'Büyü ve beceriler için +300 Mana yeniler. Kadim elf esansı içerir.',
      },
      {
        id: 'town_scroll',
        name: 'Dönüş Parşömeni',
        cost: '200 Altın',
        desc: 'Tehlike anında başkente anında ışınlar.',
      },
    ],
    gem_expert: [
      { id: 1, name: 'Kavrama Taşı (+3)', cost: '1,500 Altın', desc: '+%5 Delici vuruş şansı ekler' },
      { id: 2, name: 'Öldürücü Darbe Taşı (+3)', cost: '1,500 Altın', desc: '+%5 Kritik vuruş şansı ekler' },
      { id: 3, name: 'Korunma Taşı (+3)', cost: '1,200 Altın', desc: '+%5 Bloklama şansı ekler' },
    ],
    talisman: [
      { id: 1, name: 'Ateş Tılsımı', cost: '3,000 Altın', desc: '+%10 Ateşe karşı güç kazandırır' },
      { id: 2, name: 'Buz Tılsımı', cost: '3,000 Altın', desc: '+%10 Buza karşı güç kazandırır' },
      { id: 3, name: 'Rüzgar Tılsımı', cost: '3,000 Altın', desc: '+%10 Rüzgara karşı güç kazandırır' },
    ],
    armorer: [
      { id: 1, name: 'Çırak Miğferi', cost: '400 Altın', desc: '+15 Savunma' },
      { id: 2, name: 'Asil Elf Plaka Zırhı', cost: '2,500 Altın', desc: '+65 Savunma • +%5 Savunma Oranı' },
      { id: 3, name: 'Sessiz Gölge Çizmesi', cost: '1,100 Altın', desc: '+20 Savunma • +8 Çeviklik' },
    ],
    weaponsmith: [
      { id: 1, name: 'Elven Çelik Kılıç', cost: '1,800 Altın', desc: '+45 Saldırı Gücü' },
      { id: 2, name: 'Hilal Gölge Hançeri', cost: '1,800 Altın', desc: '+40 Saldırı • +%8 Kritik Vuruş' },
      { id: 3, name: 'Arkanik Kristal Asa', cost: '2,200 Altın', desc: '+50 Büyü Saldırısı • +80 Mana' },
    ],
    alchemist: [
      { id: 1, name: 'Kırmızı Şebnem (Saldırı)', cost: '800 Altın', desc: '10 Dk boyunca +%10 Saldırı Oranı' },
      { id: 2, name: 'Mavi Şebnem (Savunma)', cost: '800 Altın', desc: '10 Dk boyunca +%10 Savunma Oranı' },
      { id: 3, name: 'Yeşil Şebnem (Büyü Hızı)', cost: '1,000 Altın', desc: '10 Dk boyunca +%15 Büyü Hızı' },
    ],
  };

  const activeItems = NPC_ITEMS[activeSubmenu] || [];
  const currentSubmenu = submenus.find((s) => s.id === activeSubmenu);

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {toastMessage && (
        <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between animate-fadeIn ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* DEMİRCİ AKTİFSE: ÖZEL ETKİLEŞİMLİ YÜKSELTME ODASI */}
      {activeSubmenu === 'blacksmith' ? (
        <BlacksmithUpgradePanel
          player={player}
          layoutMode={layoutMode}
          onUpdatePlayer={onUpdatePlayer}
        />
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Şehir Zanaatkarı: {currentSubmenu?.label}</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                ❤️ HP İksir: {(player.hpPotions ?? 0).toLocaleString('tr-TR')}
              </span>
              <span className="text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/40">
                ⚡ MP İksir: {(player.manaPotions ?? 0).toLocaleString('tr-TR')}
              </span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> {(player.gold ?? 0).toLocaleString('tr-TR')} Altın
              </span>
            </div>
          </div>

      <div className={`gap-3 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}>
        {activeItems.map((item) => {
          const isHpPotion = item.type === 'potion_hp';
          const isManaPotion = item.type === 'potion_mana';
          const isPotion = isHpPotion || isManaPotion;

          const currentPackSize = isHpPotion ? hpPackSize : isManaPotion ? manaPackSize : 1;
          const totalCost = isPotion ? currentPackSize * item.unitCost : 0;
          const canAfford = (player.gold ?? 0) >= totalCost;

          return (
            <OrnateFrame key={item.id} className="p-3.5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {isPotion && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                        isHpPotion ? 'bg-rose-950 border-rose-500/50 text-rose-400' : 'bg-sky-950 border-sky-500/50 text-sky-400'
                      }`}>
                        <FlaskConical className="w-4 h-4" />
                      </div>
                    )}
                    <h4 className="font-cinzel font-bold text-sm text-slate-100">{item.name}</h4>
                  </div>
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    {isPotion ? `${item.unitCost} Altın / Adet` : item.cost}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-cormorant mt-1 leading-relaxed">
                  {item.desc}
                </p>

                {/* İksirler için Paket Boyutu Seçimi (1, 10, 50, 200) */}
                {isPotion && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Paket Miktarı Seçin (Maks. 200 Adet):
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PACK_SIZES.map((size) => {
                        const isSelected = (isHpPotion ? hpPackSize : manaPackSize) === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              if (isHpPotion) setHpPackSize(size);
                              else setManaPackSize(size);
                            }}
                            className={`py-1 text-center rounded text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-elven-gold scale-102'
                                : 'bg-black/50 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            x{size}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[11px] font-mono pt-1 text-slate-300">
                      <span>Toplam Tutar:</span>
                      <span className="font-bold text-yellow-300">
                        {totalCost.toLocaleString('tr-TR')} Altın
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/5">
                {isPotion ? (
                  <ElvenButton
                    size="sm"
                    fullWidth
                    disabled={!canAfford}
                    onClick={() => handleBuyPotion(isHpPotion ? 'hp' : 'mana', currentPackSize, item.unitCost)}
                  >
                    {canAfford ? `${currentPackSize} Adet Satın Al` : 'Yetersiz Altın'}
                  </ElvenButton>
                ) : (
                  <ElvenButton size="sm" fullWidth>
                    Satın Al / İşle
                  </ElvenButton>
                )}
              </div>
            </OrnateFrame>
          );
        })}
      </div>
    </>
  )}
</div>
  );
}
