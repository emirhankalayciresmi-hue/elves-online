import React from 'react';
import { User, Compass, Skull, ShoppingBag, Menu, Sparkles } from 'lucide-react';
import { MOBILE_PRIMARY_TABS } from '@/core/config/gameData';

const ICONS = {
  character: User,
  quests: Compass,
  dungeon: Skull,
  market: ShoppingBag,
  all_menus: Menu,
};

export default function BottomNav({ player, activeTab, onSelectTab, onOpenDrawer }) {
  // If activeTab is not one of the first 4, then all_menus is effectively active
  const isDrawerTabActive = !['character', 'quests', 'dungeon', 'market'].includes(activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[480px] mx-auto bg-[#070e12]/95 border-t border-elven-gold/40 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      {/* Decorative Ornate Center Diamond Accent */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#070e12] border-t border-l border-elven-gold/60 shadow-md" />

      {/* 5 Bottom Nav Slots */}
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {MOBILE_PRIMARY_TABS.map((tab) => {
          const isAllMenusButton = tab.id === 'all_menus';
          const isActive = isAllMenusButton ? isDrawerTabActive : activeTab === tab.id;
          const Icon = ICONS[tab.id] || Compass;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isAllMenusButton) {
                  onOpenDrawer();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-1 h-full transition-all duration-300 group cursor-pointer ${
                isActive ? 'text-amber-300' : 'text-slate-400 hover:text-amber-200/80'
              }`}
            >
              {/* Active Tab Highlight Aura */}
              {isActive && (
                <div className="absolute inset-x-1 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b]" />
              )}

              {/* Icon Slot */}
              <div
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center mb-0.5 transition-all duration-300 ${
                  isActive
                    ? 'border border-amber-400/80 bg-amber-500/15 shadow-elven-gold'
                    : 'border border-slate-700/60 bg-black/40 group-hover:border-amber-500/40'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-amber-300 scale-110' : 'text-slate-400 group-hover:text-amber-200'
                  }`}
                />

                {/* Kırmızı Bildirim Rozeti (Yeni Düşen Zindan Eşyaları) */}
                {isAllMenusButton && (player?.newDungeonDrops?.length || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 min-w-[16px] h-4 rounded-full bg-rose-600 text-white font-mono font-bold text-[9px] flex items-center justify-center animate-bounce shadow">
                    {player.newDungeonDrops.length}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`font-cinzel text-[10px] tracking-wider truncate max-w-full uppercase transition-colors ${
                  isActive ? 'font-bold text-amber-200 gold-text-glow' : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
