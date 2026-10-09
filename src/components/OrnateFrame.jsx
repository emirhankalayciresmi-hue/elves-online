import React from 'react';

export default function OrnateFrame({
  children,
  className = '',
  variant = 'gold', // 'gold' | 'emerald' | 'subtle'
  hasCorners = true,
  onClick,
  active = false,
}) {
  const borderStyles = {
    gold: active
      ? 'border-elven-gold shadow-elven-gold-lg bg-elven-surface/95'
      : 'border-elven-gold/40 hover:border-elven-gold/80 hover:shadow-elven-gold bg-elven-surface/90',
    emerald: active
      ? 'border-emerald-400 shadow-elven-emerald bg-elven-surface/95'
      : 'border-emerald-600/40 hover:border-emerald-400/80 bg-elven-surface/90',
    subtle: 'border-slate-800 bg-black/40',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border transition-all duration-300 backdrop-blur-md ${borderStyles[variant]} ${className}`}
    >
      {hasCorners && (
        <>
          <div className="ornate-corner-tl" />
          <div className="ornate-corner-tr" />
          <div className="ornate-corner-bl" />
          <div className="ornate-corner-br" />
        </>
      )}
      {children}
    </div>
  );
}
