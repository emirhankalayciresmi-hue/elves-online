import React from 'react';
import { Crown, Sparkles, Check, ArrowRight } from 'lucide-react';
import { KINGDOMS } from '../../config/gameData';
import { ASSETS } from '../../config/assets';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import OrnateFrame from '../../components/OrnateFrame';
import ElvenButton from '../../components/ElvenButton';

export default function KingdomSelect({ selectedKingdom, onSelectKingdom, onNext, layoutMode = 'mobile' }) {
  const isPC = layoutMode === 'pc';

  return (
    <div className={`space-y-6 pb-8 animate-fadeIn mx-auto w-full ${isPC ? 'w-full px-2 sm:px-6' : 'max-w-lg'}`}>
      {/* Header Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-cinzel">
          <Crown className="w-3.5 h-3.5" />
          <span>1. Adım / Krallık Seçimi</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-cinzel text-amber-100 gold-text-glow">
          Bağlılık Yemini
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-cormorant italic max-w-xl mx-auto">
          Elf ırkının kaderini tayin eden kadim krallıklardan birini seç. (Seçiminiz şu an özellik vermez, ait olduğunuz hanedanı belirler.)
        </p>
      </div>

      {/* Kingdoms List - 4 full columns on wide PC screens! */}
      <div className={`gap-4 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : 'space-y-4'}`}>
        {KINGDOMS.map((kingdom) => {
          const isSelected = selectedKingdom?.id === kingdom.id;
          const kingdomAssets = ASSETS.kingdoms[kingdom.id] || {};

          return (
            <OrnateFrame
              key={kingdom.id}
              active={isSelected}
              onClick={() => onSelectKingdom(kingdom)}
              className="p-3.5 cursor-pointer transition-all duration-300 hover:scale-[1.015] flex flex-col justify-between"
            >
              <div>
                {/* Top Banner Image */}
                <div className="mb-3 overflow-hidden rounded border border-amber-500/40">
                  <ImagePlaceholder
                    src={kingdomAssets.banner}
                    alt={`${kingdom.name} Sancağı`}
                    label={`${kingdom.name} Sancağı`}
                    dimensions="16:9 (600x338px)"
                    pathHint={`ASSETS.kingdoms.${kingdom.id}.banner`}
                    aspectRatio="aspect-[16/9]"
                  />
                </div>

                {/* Title & Crest Row */}
                <div className="flex items-start gap-3">
                  {/* Crest Slot */}
                  <div className="w-12 h-12 flex-shrink-0">
                    <img
                      src={kingdomAssets.crest}
                      alt={kingdom.name}
                      className="w-12 h-12 rounded object-cover border border-amber-500/50 shadow-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-cinzel font-bold text-sm sm:text-base text-amber-100 flex items-center justify-between">
                      <span className="truncate">{kingdom.name}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center text-xs flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-300/80 font-cinzel line-clamp-1">
                      {kingdom.title}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-slate-300/90 font-cormorant leading-relaxed pl-2 border-l-2 border-amber-500/30">
                  {kingdom.description}
                </p>
              </div>
            </OrnateFrame>
          );
        })}
      </div>

      {/* Navigation Button */}
      <div className="pt-2 sticky bottom-4 z-20 max-w-sm mx-auto">
        <ElvenButton
          fullWidth
          size="lg"
          disabled={!selectedKingdom}
          onClick={onNext}
          icon={ArrowRight}
        >
          {selectedKingdom ? `${selectedKingdom.name} ile Devam Et` : 'Bir Krallık Seçiniz'}
        </ElvenButton>
      </div>
    </div>
  );
}
