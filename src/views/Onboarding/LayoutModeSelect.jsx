import React from 'react';
import { Smartphone, Monitor, Sparkles, Check, ArrowRight } from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ElvenButton from '../../components/ElvenButton';

export default function LayoutModeSelect({ onSelectMode }) {
  const [selected, setSelected] = React.useState('pc');

  return (
    <div className="space-y-6 py-6 animate-fadeIn max-w-4xl mx-auto w-full px-4">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-cinzel">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Arayüz Tercihi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-amber-100 gold-text-glow">
          Oyun Düzeninizi Seçin
        </h1>
        <p className="text-base text-slate-300 font-cormorant italic max-w-md mx-auto">
          Elf diyarına nasıl adım atmak istersiniz? PC modunda oyun tüm ekranınızı kaplar, mobil modda kompakt ve tek elle oynanabilir.
        </p>
      </div>

      {/* Two Choice Cards - Side by Side on wide screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PC / Wide Screen Option */}
        <OrnateFrame
          active={selected === 'pc'}
          onClick={() => setSelected('pc')}
          className="p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 ${
              selected === 'pc'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-elven-gold'
                : 'bg-black/50 border-slate-700 text-slate-400'
            }`}>
              <Monitor className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel font-bold text-lg text-amber-100 flex items-center gap-2">
                  PC / Tam Ekran (Geniş Düzen)
                  {selected === 'pc' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-xs text-amber-300/80 font-cinzel mt-0.5">
                Tüm Monitörü Kaplayan Geniş RPG Düzeni
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-cormorant leading-relaxed">
                Bilgisayar ve dizüstü ekranlar için optimize edilmiştir. Dar çerçeveler olmadan tüm monitör alanını kullanır. Sol tarafta 13 menülü navigasyon sütunu, ortada devasa panoramik oyun alanı açılır.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400">
            ★ Önerilen: Geniş Ekranlar ve Masaüstü Tarayıcılar
          </div>
        </OrnateFrame>

        {/* Mobile Option */}
        <OrnateFrame
          active={selected === 'mobile'}
          onClick={() => setSelected('mobile')}
          className="p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between min-h-[220px]"
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 ${
              selected === 'mobile'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-elven-gold'
                : 'bg-black/50 border-slate-700 text-slate-400'
            }`}>
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-cinzel font-bold text-lg text-amber-100 flex items-center gap-2">
                  Mobil / Kompakt Arayüz
                  {selected === 'mobile' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-xs text-amber-300/80 font-cinzel mt-0.5">
                Dikey ve Sabit Alt Menülü Tasarım
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-cormorant leading-relaxed">
                Akıllı telefonlar veya dikey ekranlar için optimize edilmiştir. Menüler alt çubukta sabit durur, kompakt kartlar halinde tek elle rahatça kullanılır.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-amber-400/80">
            ★ Önerilen: Telefonlar ve Dikey Dokunmatik Ekranlar
          </div>
        </OrnateFrame>
      </div>

      {/* Confirmation Button */}
      <div className="pt-2 max-w-sm mx-auto">
        <ElvenButton
          fullWidth
          size="lg"
          onClick={() => onSelectMode(selected)}
          icon={ArrowRight}
        >
          {selected === 'pc' ? 'PC Tam Ekran ile Başla' : 'Mobil Düzen ile Başla'}
        </ElvenButton>
      </div>
    </div>
  );
}
