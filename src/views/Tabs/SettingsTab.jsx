import React, { useState } from 'react';
import { RotateCcw, Image, Smartphone, Monitor, ShieldAlert, Check, Volume2, UserCheck, Settings as SettingsIcon } from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import { ALL_MENUS } from '../../config/gameData';

export default function SettingsTab({ layoutMode, onChangeLayoutMode, onResetPlayer, player }) {
  const [activeSubmenu, setActiveSubmenu] = useState('general');
  const [bgMusic, setBgMusic] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  const submenus = ALL_MENUS.find((m) => m.id === 'settings')?.submenus || [];

  return (
    <div className="space-y-4 pb-20 animate-fadeIn max-w-xl mx-auto">
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* 1. Alt Menü: GENEL AYARLAR */}
      {activeSubmenu === 'general' && (
        <div className="space-y-4">
          {/* Layout Mode Switcher */}
          <OrnateFrame className="p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-cinzel uppercase text-amber-300 font-semibold tracking-wider">
                Arayüz / Görünüm Modu
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Aktif: {layoutMode === 'mobile' ? 'Mobil Mod' : 'PC Geniş Ekran'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onChangeLayoutMode('mobile')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  layoutMode === 'mobile'
                    ? 'border-amber-400 bg-amber-500/15 shadow-elven-gold'
                    : 'border-slate-800 bg-black/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Smartphone className={`w-4 h-4 ${layoutMode === 'mobile' ? 'text-amber-300' : 'text-slate-400'}`} />
                  {layoutMode === 'mobile' && <Check className="w-3.5 h-3.5 text-amber-300" />}
                </div>
                <div className="mt-2">
                  <p className="font-cinzel text-xs font-bold text-slate-100">Mobil Arayüz</p>
                  <p className="text-[10px] text-slate-400 font-cormorant mt-0.5">Kompakt & sabit alt menü</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeLayoutMode('pc')}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  layoutMode === 'pc'
                    ? 'border-amber-400 bg-amber-500/15 shadow-elven-gold'
                    : 'border-slate-800 bg-black/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Monitor className={`w-4 h-4 ${layoutMode === 'pc' ? 'text-amber-300' : 'text-slate-400'}`} />
                  {layoutMode === 'pc' && <Check className="w-3.5 h-3.5 text-amber-300" />}
                </div>
                <div className="mt-2">
                  <p className="font-cinzel text-xs font-bold text-slate-100">PC Geniş Ekran</p>
                  <p className="text-[10px] text-slate-400 font-cormorant mt-0.5">Klasik sol menülü geniş düzen</p>
                </div>
              </button>
            </div>
          </OrnateFrame>

          {/* Oyun Bilgileri & Beta Künyesi */}
          <OrnateFrame className="p-3.5 space-y-2.5 bg-gradient-to-br from-amber-950/20 via-black to-black border-amber-500/40">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <span className="text-xs font-cinzel uppercase text-amber-300 font-bold tracking-wider">
                Oyun Bilgileri & Beta Künyesi
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-200">
                Açık Beta
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-black/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">OYUN ADI</span>
                <span className="text-amber-200 font-bold text-xs">Elves Online</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">DURUM</span>
                <span className="text-emerald-300 font-bold text-xs">Açık (Beta)</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">YAPIMCI</span>
                <span className="text-slate-200 font-bold text-xs">Emirhan Kalaycı</span>
              </div>
              <div className="p-2 rounded bg-black/50 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">STÜDYO</span>
                <span className="text-amber-300 font-bold text-xs">Han Gaming Studio</span>
              </div>
            </div>
          </OrnateFrame>

          {/* Asset Guide for User */}
          <OrnateFrame className="p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs font-semibold">
              <Image className="w-4 h-4 text-amber-400" />
              <span>Görselleri & İkonları Yönetme</span>
            </div>
            <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
              Tüm görsel yolları <code className="text-amber-300 bg-black/50 px-1 py-0.5 rounded font-mono">src/config/assets.js</code> dosyasında tanımlıdır. Yeni eklenen görselleriniz otomatik olarak oyunda güncellenir.
            </p>
          </OrnateFrame>
        </div>
      )}

      {/* 2. Alt Menü: HESAP AYARLARI */}
      {activeSubmenu === 'account' && (
        <div className="space-y-4">
          <OrnateFrame className="p-3.5 space-y-2.5">
            <h3 className="text-xs font-cinzel uppercase text-amber-300 tracking-wider border-b border-white/5 pb-2">
              Karakter & Hesap Bilgisi
            </h3>
            <div className="text-xs space-y-1.5 font-mono text-slate-300">
              <p>Karakter Adı: <span className="text-amber-200 font-bold">{player?.name}</span></p>
              <p>Krallık: <span className="text-amber-200">{player?.kingdomName}</span></p>
              <p>Sınıf: <span className="text-emerald-300">{player?.className}</span></p>
              <p>Oluşturulma: <span className="text-slate-400">{new Date(player?.createdAt).toLocaleDateString()}</span></p>
            </div>
          </OrnateFrame>

          {/* Reset Character */}
          <OrnateFrame className="p-3.5 space-y-2 border-red-500/30">
            <div className="flex items-center gap-2 text-rose-300 font-cinzel text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Karakteri Sıfırla ve Başa Dön</span>
            </div>
            <p className="text-xs text-slate-300/80 font-cormorant">
              Farklı bir krallık veya sınıf seçmek isterseniz karakterinizi sıfırlayıp seçim ekranına dönebilirsiniz.
            </p>
            <div className="pt-1">
              <ElvenButton
                variant="danger"
                size="sm"
                onClick={() => {
                  if (window.confirm('Karakter seçim ekranına dönmek istediğinize emin misiniz?')) {
                    onResetPlayer();
                  }
                }}
                icon={RotateCcw}
                fullWidth
              >
                Karakteri Sıfırla
              </ElvenButton>
            </div>
          </OrnateFrame>
        </div>
      )}

      {/* 3. Alt Menü: SES AYARLARI */}
      {activeSubmenu === 'sound' && (
        <OrnateFrame className="p-3.5 space-y-3">
          <h3 className="text-xs font-cinzel uppercase text-amber-300 tracking-wider border-b border-white/5 pb-2">
            Ses ve Ambiyans
          </h3>

          <div className="flex items-center justify-between text-xs py-2 border-b border-white/5">
            <div>
              <p className="text-slate-200 font-cinzel">Arka Plan Elf Müziği</p>
              <p className="text-[10px] text-slate-500">Mistik orman ve saray melodileri</p>
            </div>
            <button
              onClick={() => setBgMusic(!bgMusic)}
              className={`px-3 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
                bgMusic
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-black/50 border-slate-700 text-slate-400'
              }`}
            >
              {bgMusic ? 'Açık' : 'Kapalı'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs py-2">
            <div>
              <p className="text-slate-200 font-cinzel">Savaş & Menü Ses Efektleri</p>
              <p className="text-[10px] text-slate-500">Kılıç ve rün sesleri</p>
            </div>
            <button
              onClick={() => setSoundEffects(!soundEffects)}
              className={`px-3 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
                soundEffects
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-black/50 border-slate-700 text-slate-400'
              }`}
            >
              {soundEffects ? 'Açık' : 'Kapalı'}
            </button>
          </div>
        </OrnateFrame>
      )}
    </div>
  );
}
