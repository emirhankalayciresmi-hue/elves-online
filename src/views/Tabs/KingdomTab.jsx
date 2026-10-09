import React, { useState } from 'react';
import { Castle, Landmark, ShoppingBag, Users, Globe, UserCheck, Shield } from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import SubmenuBar from '../../components/SubmenuBar';
import { ASSETS } from '../../config/assets';
import { KINGDOMS, ALL_MENUS } from '../../config/gameData';

export default function KingdomTab({ player, layoutMode = 'mobile' }) {
  const [activeSubmenu, setActiveSubmenu] = useState('info');
  const kingdomAssets = ASSETS.kingdoms[player.kingdomId] || {};
  const isPC = layoutMode === 'pc';

  const submenus = ALL_MENUS.find((m) => m.id === 'kingdom')?.submenus || [];

  const PLAYERS = [
    { id: 1, name: 'Lord_Aeron', kingdom: 'Aeltherin', class: 'Savaşçı', level: 'Lv. 75', status: 'Online' },
    { id: 2, name: 'Sylvaen_Shadow', kingdom: 'Sylvandar', class: 'Assassin', level: 'Lv. 72', status: 'Online' },
    { id: 3, name: 'Mage_Loriel', kingdom: 'Lorvathiel', class: 'Büyücü', level: 'Lv. 68', status: 'Offline' },
    { id: 4, name: 'OceanGuardian', kingdom: 'Ithilmar', class: 'Savaşçı', level: 'Lv. 65', status: 'Online' },
    { id: 5, name: 'SilverBow', kingdom: 'Sylvandar', class: 'Assassin', level: 'Lv. 61', status: 'Offline' },
  ];

  const filteredPlayers = activeSubmenu === 'online'
    ? PLAYERS.filter((p) => p.status === 'Online')
    : PLAYERS;

  const DISTRICTS = [
    { name: 'Kraliyet Sarayı', desc: 'Krallık liderlerinin ve soyluların toplandığı taht odası.', icon: Castle },
    { name: 'Elf Pazarı & Tüccarlar', desc: 'Nadir iksirler ve kadim eşyaların takas edildiği ticaret merkezi.', icon: ShoppingBag },
    { name: 'Kadim Rün Tapınağı', desc: 'Mistik enerjilerin toplandığı ve kutsamaların alındığı mabet.', icon: Landmark },
    { name: 'Elf Loncaları Meclisi', desc: 'Klanların ve müttefiklerin bir araya geldiği toplanma salonu.', icon: Users },
  ];

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* 1. Alt Menü: 4 Krallık Bilgileri */}
      {activeSubmenu === 'info' && (
        <div className="space-y-4">
          {/* Active Kingdom Grand Artwork */}
          <OrnateFrame className="p-3">
            <ImagePlaceholder
              src={kingdomAssets.banner}
              label={`${player.kingdomName} Şehir Manzarası`}
              dimensions="16:9 (600x338px)"
              pathHint={`ASSETS.kingdoms.${player.kingdomId}.banner`}
              aspectRatio={isPC ? 'aspect-[21/8]' : 'aspect-[16/8]'}
            />

            <div className="mt-2.5 text-center">
              <h2 className="text-lg sm:text-xl font-bold font-cinzel text-amber-100 gold-text-glow">
                {player.kingdomName}
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/80 font-cinzel">
                Başkent & Kutsal Topraklar
              </p>
            </div>
          </OrnateFrame>

          {/* 4 Kingdoms Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-cinzel uppercase text-amber-300 tracking-wider pl-1">
              4 Kadim Elf Krallığı
            </h3>

            <div className={`gap-3 ${isPC ? 'grid grid-cols-2' : 'space-y-3'}`}>
              {KINGDOMS.map((k) => (
                <OrnateFrame key={k.id} className="p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={ASSETS.kingdoms[k.id]?.crest}
                      alt={k.name}
                      className="w-10 h-10 rounded object-cover border border-amber-500/40"
                    />
                    <div>
                      <h4 className="font-cinzel font-bold text-sm text-amber-100">{k.name}</h4>
                      <p className="text-[11px] text-amber-300/80 font-cinzel">{k.title}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
                    {k.description}
                  </p>
                </OrnateFrame>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2 & 3. Alt Menü: Oyuncu Listesi & Online Oyuncular */}
      {(activeSubmenu === 'players' || activeSubmenu === 'online') && (
        <OrnateFrame className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{activeSubmenu === 'online' ? 'Çevrimiçi (Online) Elf Oyuncuları' : 'Genel Oyuncu Sıralaması'}</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {filteredPlayers.length} Oyuncu
            </span>
          </div>

          <div className="space-y-2">
            {filteredPlayers.map((p, idx) => (
              <div key={p.id} className="p-2.5 rounded bg-black/40 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-500 text-xs w-4">#{idx + 1}</span>
                  <div>
                    <p className="font-cinzel font-bold text-slate-100">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {p.kingdom} • {p.class}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-amber-300">{p.level}</span>
                  <p className={`text-[10px] font-mono ${p.status === 'Online' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    ● {p.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </OrnateFrame>
      )}
    </div>
  );
}
