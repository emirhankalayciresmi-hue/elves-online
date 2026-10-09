import React from 'react';

export default function ElvenButton({
  children,
  onClick,
  variant = 'gold', // 'gold' | 'emerald' | 'ghost' | 'danger'
  disabled = false,
  className = '',
  icon: Icon = null,
  fullWidth = false,
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-xs tracking-wider',
    md: 'py-2.5 px-5 text-sm tracking-widest',
    lg: 'py-3.5 px-7 text-base tracking-widest',
  };

  const variantStyles = {
    gold: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-bold border border-amber-300/80 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-[0.98]',
    emerald: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-emerald-100 font-semibold border border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-[0.98]',
    ghost: 'bg-transparent text-amber-200/80 hover:text-amber-100 hover:bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/70',
    danger: 'bg-gradient-to-r from-red-950 via-rose-900 to-red-950 text-rose-200 border border-red-500/40 hover:border-red-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-cinzel relative inline-flex items-center justify-center gap-2 rounded-sm transition-all duration-300 uppercase cursor-pointer select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      {/* Decorative tiny corner notch on buttons */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/50 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/50 pointer-events-none" />
      
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
}
