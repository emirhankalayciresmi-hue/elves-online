import React from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ImagePlaceholder({
  src,
  alt = 'Görsel',
  label = 'Görsel Alanı',
  dimensions = 'Belirtilmedi',
  pathHint = '',
  className = '',
  aspectRatio = 'aspect-video',
  icon: CustomIcon = ImageIcon,
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-lg elven-border ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 border border-dashed border-elven-gold/40 bg-black/40 rounded-lg text-center overflow-hidden transition-all duration-300 hover:border-elven-gold/70 group ${aspectRatio} ${className}`}
    >
      {/* Decorative Ornate Corners */}
      <div className="ornate-corner-tl opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="ornate-corner-tr opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="ornate-corner-bl opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="ornate-corner-br opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Subtle Rune Glow in background */}
      <div className="absolute inset-0 bg-radial-gradient from-elven-gold/5 to-transparent pointer-events-none" />

      {/* Central Icon */}
      <div className="w-10 h-10 rounded-full border border-elven-gold/30 bg-elven-surface flex items-center justify-center mb-2 shadow-elven-inner group-hover:border-elven-gold/80 group-hover:shadow-elven-gold transition-all">
        <CustomIcon className="w-5 h-5 text-elven-goldLight group-hover:scale-110 transition-transform" />
      </div>

      {/* Text Info */}
      <div className="relative z-10 space-y-0.5">
        <p className="font-cinzel text-xs font-semibold tracking-wider text-amber-200/90 group-hover:text-amber-100 transition-colors uppercase">
          {label}
        </p>
        <p className="text-[10px] text-emerald-400/80 font-mono">
          Önerilen: {dimensions}
        </p>
        {pathHint && (
          <p className="text-[9px] text-slate-400 font-mono truncate max-w-[200px] opacity-75 group-hover:opacity-100">
            {pathHint}
          </p>
        )}
      </div>

      {/* Aesthetic bottom badge */}
      <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[9px] text-amber-500/40">
        <Sparkles className="w-2.5 h-2.5" />
        <span>Görsel Bekleniyor</span>
      </div>
    </div>
  );
}
