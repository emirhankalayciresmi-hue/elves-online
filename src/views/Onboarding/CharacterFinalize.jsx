import React, { useState } from 'react';
import { User, Sparkles, Shield, Crown, ArrowLeft, Play } from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ElvenButton from '../../components/ElvenButton';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { ASSETS } from '../../config/assets';

export default function CharacterFinalize({
  kingdom,
  characterClass,
  onComplete,
  onBack,
  layoutMode = 'mobile',
}) {
  const [characterName, setCharacterName] = useState('');
  const [error, setError] = useState('');
  const isPC = layoutMode === 'pc';

  const kingdomAssets = ASSETS.kingdoms[kingdom?.id] || {};
  const classAssets = ASSETS.classes[characterClass?.id] || {};
  const portraitSrc = characterClass?.portrait || classAssets.portrait;

  const handleStartGame = (e) => {
    e?.preventDefault();
    if (!characterName.trim()) {
      setError('Lütfen asil karakterinize bir isim veriniz.');
      return;
    }
    if (characterName.trim().length < 3) {
      setError('Karakter ismi en az 3 harften oluşmalıdır.');
      return;
    }
    onComplete(characterName.trim());
  };

  return (
    <div className={`space-y-6 pb-8 animate-fadeIn mx-auto w-full ${isPC ? 'max-w-3xl px-4' : 'max-w-lg'}`}>
      {/* Header Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-cinzel">
          <Sparkles className="w-3.5 h-3.5" />
          <span>3. Adım / Son Onay</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-cinzel text-amber-100 gold-text-glow">
          Karakterini İsimlendir
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-cormorant italic max-w-md mx-auto">
          Elf kroniklerine yazılacak olan kadim isminizi belirleyin ve maceranızı başlatın.
        </p>
      </div>

      {/* Name Input Box */}
      <OrnateFrame className="p-5">
        <label className="block text-xs sm:text-sm font-cinzel text-amber-300 mb-2 uppercase tracking-wider">
          Karakter Adı
        </label>
        <div className="relative">
          <input
            type="text"
            value={characterName}
            onChange={(e) => {
              setCharacterName(e.target.value);
              if (error) setError('');
            }}
            placeholder="Örn: Elrond, Legolas, Aerith..."
            maxLength={18}
            className="w-full bg-black/60 border border-elven-gold/50 rounded-lg px-4 py-3 text-amber-100 placeholder:text-slate-600 font-cinzel text-base sm:text-lg focus:outline-none focus:border-amber-400 focus:shadow-elven-gold transition-all"
          />
          <User className="absolute right-4 top-3.5 w-6 h-6 text-amber-500/50 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-2 text-xs sm:text-sm text-rose-400 font-sans tracking-wide">
            {error}
          </p>
        )}
      </OrnateFrame>

      {/* Summary Review Card */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-cinzel uppercase text-slate-400 tracking-wider pl-1">
          Karakter Özeti
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Kingdom Summary */}
          <OrnateFrame className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-cinzel text-amber-300 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Seçilen Krallık</span>
            </div>
            <div className="mb-2">
              <img
                src={kingdomAssets.crest}
                alt={kingdom?.name}
                className="w-20 h-20 rounded-lg object-cover mx-auto border border-amber-500/40 shadow-md"
              />
            </div>
            <p className="font-cinzel text-base font-bold text-amber-100 mt-1">
              {kingdom?.name}
            </p>
            <p className="text-xs text-slate-400 font-cormorant">
              {kingdom?.title}
            </p>
          </OrnateFrame>

          {/* Class Summary */}
          <OrnateFrame className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-cinzel text-emerald-300 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Seçilen Sınıf</span>
            </div>
            <div className="mb-2">
              <img
                src={portraitSrc}
                alt={characterClass?.name}
                className="w-20 h-24 rounded-lg object-cover object-top mx-auto border border-amber-500/40 shadow-md"
              />
            </div>
            <p className="font-cinzel text-base font-bold text-emerald-200 mt-1">
              {characterClass?.name}
            </p>
            <p className="text-xs text-slate-400 font-cormorant">
              {characterClass?.title}
            </p>
          </OrnateFrame>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-2 flex gap-4 sticky bottom-4 z-20 max-w-sm mx-auto">
        <ElvenButton variant="ghost" onClick={onBack} icon={ArrowLeft} className="w-1/3">
          Geri
        </ElvenButton>
        <ElvenButton
          fullWidth
          size="lg"
          onClick={handleStartGame}
          icon={Play}
          className="flex-1"
        >
          Maceraya Başla
        </ElvenButton>
      </div>
    </div>
  );
}
