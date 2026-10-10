import React from 'react';
import {
  User, Briefcase, MessageSquare, Compass, Users, Shield,
  Skull, Pickaxe, Flame, Castle, Store, ShoppingBag, Settings
} from 'lucide-react';
import { ALL_MENUS } from '@/core/config/gameData';
import OrnateFrame from '@/components/OrnateFrame';

const MENU_ICONS = {
  character: User,
  inventory: Briefcase,
  chat: MessageSquare,
  quests: Compass,
  party: Users,
  guild: Shield,
  dungeon: Skull,
  mine: Pickaxe,
  boss: Flame,
  kingdom: Castle,
  npc: Store,
  market: ShoppingBag,
  settings: Settings,
};

export default function DesktopSidebar({ player, activeTab, onSelectTab }) {
  if (!player) return null;

  const categories = [
    { title: 'Karakter & Eşya', items: ALL_MENUS.filter((m) => m.group === 'Karakter & Eşya') },
    { title: 'Savaş & Macera', items: ALL_MENUS.filter((m) => m.group === 'Savaş & Macera') },
    { title: 'Topluluk & İletişim', items: ALL_MENUS.filter((m) => m.group === 'Topluluk & İletişim') },
    { title: 'Pazar & Zanaat', items: ALL_MENUS.filter((m) => m.group === 'Pazar & Zanaat') },
    { title: 'Sistem', items: ALL_MENUS.filter((m) => m.group === 'Sistem') },
  ];

  return (
    <aside className="w-72 flex-shrink-0 space-y-4">
      {/* Categorized Vertical 13 Menus Navigation */}
      <OrnateFrame className="p-2 space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2 py-0.5 text-[10px] font-cinzel uppercase tracking-widest text-amber-400/70 border-b border-white/5 flex items-center justify-between">
              <span>{cat.title}</span>
            </div>

            {cat.items.map((menu) => {
              const isActive = activeTab === menu.id;
              const Icon = MENU_ICONS[menu.id] || Compass;

              return (
                <button
                  key={menu.id}
                  onClick={() => onSelectTab(menu.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-all duration-200 text-left cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-3 border-amber-400 text-amber-200 shadow-elven-inner font-bold'
                      : 'hover:bg-white/5 text-slate-300 hover:text-amber-100 font-medium'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive
                        ? 'border border-amber-400/80 bg-amber-500/20 text-amber-300 shadow-elven-gold'
                        : 'border border-slate-700/60 bg-black/40 text-slate-400 group-hover:border-amber-500/40 group-hover:text-amber-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <span className="font-cinzel text-xs tracking-wider line-clamp-1">
                    {menu.label}
                  </span>

                  {menu.id === 'inventory' && (player?.newDungeonDrops?.length || 0) > 0 && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono font-bold text-[10px] animate-bounce shadow-md">
                      {player.newDungeonDrops.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </OrnateFrame>
    </aside>
  );
}
