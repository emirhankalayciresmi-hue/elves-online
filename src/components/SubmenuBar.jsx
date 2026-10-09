import React from 'react';

export default function SubmenuBar({ submenus, activeSubmenu, onSelect }) {
  if (!submenus || submenus.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
      {submenus.map((sub) => {
        const isActive = activeSubmenu === sub.id;
        return (
          <button
            key={sub.id}
            type="button"
            onClick={() => onSelect(sub.id)}
            className={`px-3 py-1.5 rounded text-xs font-cinzel whitespace-nowrap transition-all duration-200 cursor-pointer border ${
              isActive
                ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-elven-gold scale-[1.02]'
                : 'bg-black/50 border-slate-800 text-slate-400 hover:text-amber-200 hover:border-amber-500/40'
            }`}
          >
            {sub.label}
          </button>
        );
      })}
    </div>
  );
}
