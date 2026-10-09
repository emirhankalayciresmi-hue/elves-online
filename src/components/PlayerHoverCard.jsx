// src/components/PlayerHoverCard.jsx
// Fareyle ismin üzerine gelindiğinde veya dokunulduğunda açılan şık süzülen Mini Profil Kartı

import React from 'react';
import { Shield, Sword, Heart, Crown, ArrowRight, Sparkles, X } from 'lucide-react';

export default function PlayerHoverCard({
  profile,
  onInspect,
  onClose,
  position = { x: 0, y: 0 },
  isMobile = false,
}) {
  if (!profile) return null;

  // Ekran sınırlarını taşmaması için koordinat hesaplama
  const cardWidth = 260;
  const cardHeight = 310;
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

  let left = position.x + 10;
  let top = position.y + 10;

  if (left + cardWidth > screenWidth - 16) {
    left = Math.max(16, position.x - cardWidth - 10);
  }
  if (top + cardHeight > screenHeight - 16) {
    top = Math.max(16, position.y - cardHeight - 10);
  }

  return (
    <div
      style={
        isMobile
          ? {}
          : {
              position: 'fixed',
              left: `${left}px`,
              top: `${top}px`,
              zIndex: 9999,
            }
      }
      className={`${
        isMobile
          ? 'w-full max-w-xs mx-auto animate-fadeIn'
          : 'w-64 animate-fadeIn pointer-events-auto'
      } rounded-xl border border-amber-500/50 bg-[#060a0d]/95 backdrop-blur-md p-3.5 shadow-2xl shadow-black ring-1 ring-amber-400/20 text-left space-y-3 z-50`}
      onMouseEnter={(e) => e.stopPropagation()}
    >
      {/* Üst Başlık & Kapat Butonu (Mobilde) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-cinzel text-[11px] font-bold text-amber-200 tracking-wider uppercase">
            Karakter Kartı
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              profile.online ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'
            }`}
            title={profile.online ? 'Çevrimiçi' : 'Çevrimdışı'}
          />
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white bg-black/40 border border-white/5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Karakter Avatarı & Kimlik Bilgileri */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-full border-2 border-amber-400/80 p-0.5 flex-shrink-0 bg-black shadow-inner overflow-hidden">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute bottom-0 right-0 bg-amber-950 text-amber-300 border border-amber-500/50 rounded-full px-1 text-[8px] font-mono font-bold">
            Lv.{profile.level}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-cinzel font-bold text-sm text-amber-100 gold-text-glow truncate">
            {profile.name}
          </h4>
          <p className="text-[10px] text-amber-300/80 font-cinzel italic">
            "{profile.title}"
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
              {profile.className}
            </span>
            <span className="text-[9px] font-mono text-indigo-300 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-500/30">
              {profile.kingdom}
            </span>
          </div>
        </div>
      </div>

      {/* Lonca Bilgisi */}
      <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 flex items-center gap-1">
          <Shield className="w-3 h-3 text-amber-400" />
          Lonca:
        </span>
        {profile.guild ? (
          <span className="text-amber-200 font-bold truncate max-w-[140px]">
            {profile.guild.name}{' '}
            <span className="text-[10px] text-slate-400 font-normal">({profile.guild.rank})</span>
          </span>
        ) : (
          <span className="text-slate-500 italic">Loncasız</span>
        )}
      </div>

      {/* Hızlı İstatistikler (Savaş Gücü & Can) */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="p-1.5 rounded bg-amber-950/20 border border-amber-500/20 flex items-center gap-1.5">
          <Sword className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[9px]">Saldırı Gücü</span>
            <strong className="text-amber-300 text-xs">{(profile.stats.physicalDamage || 15).toLocaleString()}</strong>
          </div>
        </div>

        <div className="p-1.5 rounded bg-rose-950/20 border border-rose-500/20 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400 block text-[9px]">Can (HP)</span>
            <strong className="text-rose-300 text-xs">{profile.stats.hp}</strong>
          </div>
        </div>
      </div>

      {/* Detaylı İncele Butonu */}
      <div className="pt-1 border-t border-white/10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect?.(profile);
          }}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(251,191,36,0.3)] cursor-pointer"
        >
          <span>Detaylı İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
