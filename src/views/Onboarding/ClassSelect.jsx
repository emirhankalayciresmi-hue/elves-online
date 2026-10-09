import React, { useState } from 'react';
import { Shield, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { CLASSES } from '../../config/gameData';
import { ASSETS } from '../../config/assets';
import OrnateFrame from '../../components/OrnateFrame';
import ElvenButton from '../../components/ElvenButton';

export default function ClassSelect({
  selectedClass,
  onSelectClass,
  onNext,
  onBack,
  layoutMode = 'mobile',
  selectedGender = 'female',
  onSelectGender,
}) {
  const isPC = layoutMode === 'pc';
  const [gender, setGender] = useState(selectedGender || 'female');

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    if (onSelectGender) onSelectGender(newGender);
    if (selectedClass) {
      const portrait = ASSETS.classes[selectedClass.id]?.[newGender];
      onSelectClass({
        ...selectedClass,
        portrait,
        gender: newGender,
      });
    }
  };

  const handleClassClick = (cls) => {
    const portrait = ASSETS.classes[cls.id]?.[gender];
    onSelectClass({
      ...cls,
      portrait,
      gender,
    });
  };

  return (
    <div className={`space-y-6 pb-8 animate-fadeIn mx-auto w-full ${isPC ? 'w-full px-2 sm:px-6' : 'max-w-lg'}`}>
      {/* Header Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-cinzel">
          <Shield className="w-3.5 h-3.5" />
          <span>2. Adım / Sınıf & Avatar Seçimi</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-cinzel text-amber-100 gold-text-glow">
          Karakterini ve Portreni Belirle
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-cormorant italic max-w-xl mx-auto">
          Cinsiyetini ve elf savaş sınıfını seç. Her portre kadim ırkın asaletini yansıtır.
        </p>
      </div>

      {/* Gender / Avatar Switcher Bar */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-xl border border-elven-gold/40 bg-black/60 shadow-inner">
          <button
            type="button"
            onClick={() => handleGenderChange('female')}
            className={`px-6 py-2.5 rounded-lg font-cinzel text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              gender === 'female'
                ? 'bg-gradient-to-r from-amber-500/30 via-amber-500/20 to-amber-500/30 border border-amber-400 text-amber-200 shadow-elven-gold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🧝‍♀️ Kadın Elf Avatarları (3 Adet)</span>
          </button>
          <button
            type="button"
            onClick={() => handleGenderChange('male')}
            className={`px-6 py-2.5 rounded-lg font-cinzel text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              gender === 'male'
                ? 'bg-gradient-to-r from-amber-500/30 via-amber-500/20 to-amber-500/30 border border-amber-400 text-amber-200 shadow-elven-gold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🧝‍♂️ Erkek Elf Avatarları (3 Adet)</span>
          </button>
        </div>
      </div>

      {/* Class Cards with Real Avatars - Full Screen Width 3 Columns on PC */}
      <div className={`gap-5 ${isPC ? 'grid grid-cols-1 md:grid-cols-3' : 'space-y-4'}`}>
        {CLASSES.map((cls) => {
          const isSelected = selectedClass?.id === cls.id;
          const portraitSrc = ASSETS.classes[cls.id]?.[gender];

          return (
            <OrnateFrame
              key={cls.id}
              active={isSelected}
              onClick={() => handleClassClick(cls)}
              className="p-4 cursor-pointer transition-all duration-300 hover:scale-[1.015] flex flex-col justify-between"
            >
              <div className={`${isPC ? 'flex flex-col' : 'flex'} gap-4`}>
                {/* Character Portrait Slot */}
                <div className={`${isPC ? 'w-full h-80 sm:h-96' : 'w-24 sm:w-28 h-32'} flex-shrink-0 relative overflow-hidden rounded-lg border border-amber-500/40 shadow-elven-inner group`}>
                  <img
                    src={portraitSrc}
                    alt={`${cls.name} Portresi`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-3 text-xs sm:text-sm font-mono text-amber-300 font-semibold">
                    {gender === 'female' ? 'Kadın' : 'Erkek'} {cls.name}
                  </span>
                </div>

                {/* Class Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-cinzel font-bold text-lg sm:text-xl text-amber-100 flex items-center gap-2">
                        {cls.name}
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-400/80 font-cinzel tracking-wider mt-0.5">
                      {cls.title}
                    </p>

                    <p className="mt-2.5 text-xs sm:text-sm text-slate-300/90 font-cormorant leading-relaxed">
                      {cls.description}
                    </p>
                  </div>
                </div>
              </div>
            </OrnateFrame>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-2 flex gap-3 sticky bottom-4 z-20 max-w-sm mx-auto">
        <ElvenButton variant="ghost" onClick={onBack} icon={ArrowLeft} className="w-1/3">
          Geri
        </ElvenButton>
        <ElvenButton
          fullWidth
          size="lg"
          disabled={!selectedClass}
          onClick={onNext}
          icon={ArrowRight}
          className="flex-1"
        >
          {selectedClass ? `${selectedClass.name} ile İlerle` : 'Bir Sınıf Seçiniz'}
        </ElvenButton>
      </div>
    </div>
  );
}
