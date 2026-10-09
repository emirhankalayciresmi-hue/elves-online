// src/components/PlayerBadge.jsx
// Evrensel Oyuncu İsim Etiketi & Profil Tetikleyicisi
// Sohbet, Lonca, Grup ve Sıralamalardaki tüm oyuncu isimleri bu bileşenle render edilir.

import React from 'react';
import { usePlayerProfile } from '../context/PlayerProfileContext';

export default function PlayerBadge({
  name,
  level = null,
  kingdom = null,
  characterClass = null,
  isMe = false,
  showBadges = false,
  className = '',
  isMobile = false,
}) {
  const { openHoverCard, closeHoverCard, openInspector } = usePlayerProfile();

  if (!name) return null;

  const playerInfo = {
    name,
    level,
    kingdom,
    characterClass,
    isMe,
  };

  const handleMouseEnter = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    openHoverCard(playerInfo, { x: rect.right + 8, y: rect.top });
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    closeHoverCard(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isMobile) {
      // Mobilde dokunulduğunda mini profil kartı açılır (içinde Detaylı İncele butonu vardır)
      const rect = e.currentTarget.getBoundingClientRect();
      openHoverCard(playerInfo, { x: rect.left, y: rect.bottom + 4 }, true);
    } else {
      // Masaüstünde tıklandığında doğrudan tam detaylı modal açılır
      openInspector(playerInfo);
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 cursor-pointer group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title="Profil kartını görmek için gelin, detaylı incelemek için tıklayın"
    >
      <span className="font-cinzel font-bold text-amber-200 group-hover:text-amber-300 group-hover:underline transition-colors flex items-center gap-1">
        <span>{name}</span>
        {isMe && <span className="text-[10px] text-amber-400/80 font-mono font-normal">(Sen)</span>}
      </span>

      {showBadges && (
        <>
          {kingdom && (
            <span className="text-[9px] font-mono text-slate-300 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700">
              [{kingdom}]
            </span>
          )}
          {level && (
            <span className="text-[9px] font-mono text-emerald-400 px-1 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
              Lv. {level}
            </span>
          )}
        </>
      )}
    </span>
  );
}
