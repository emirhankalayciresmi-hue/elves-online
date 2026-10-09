import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { ALL_MENUS } from '../config/gameData';
import {
  User, Briefcase, MessageSquare, Compass, Users, Shield,
  Skull, Pickaxe, Flame, Castle, Store, ShoppingBag, Settings
} from 'lucide-react';

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

export default function MobileMenuDrawer({ player, isOpen, onClose, activeTab, onSelectTab }) {
  if (!isOpen) return null;

  // Group menus by category
  const categories = [
    { title: 'Karakter & Eşya', items: ALL_MENUS.filter((m) => m.group === 'Karakter & Eşya') },
    { title: 'Savaş & Macera', items: ALL_MENUS.filter((m) => m.group === 'Savaş & Macera') },
    { title: 'Topluluk & İletişim', items: ALL_MENUS.filter((m) => m.group === 'Topluluk & İletişim') },
    { title: 'Pazar & Zanaat', items: ALL_MENUS.filter((m) => m.group === 'Pazar & Zanaat') },
    { title: 'Sistem', items: ALL_MENUS.filter((m) => m.group === 'Sistem') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#090f12] border-t-2 border-elven-gold/60 rounded-t-2xl max-h-[85vh] flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel font-bold text-base text-amber-100 gold-text-glow">
              Tüm Oyun Menüleri
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[11px] font-cinzel uppercase tracking-widest text-amber-400/70 border-b border-white/5 pb-1 block">
                {cat.title}
              </span>

              <div className="grid grid-cols-2 gap-2">
                {cat.items.map((menu) => {
                  const Icon = MENU_ICONS[menu.id] || Compass;
                  const isActive = activeTab === menu.id;

                  return (
                    <button
                      key={menu.id}
                      onClick={() => {
                        onSelectTab(menu.id);
                        onClose();
                      }}
                      className={`p-2.5 rounded border text-left transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                        isActive
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-elven-gold font-bold'
                          : 'border-slate-800 bg-black/40 text-slate-300 hover:border-amber-500/40 hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-cinzel text-xs line-clamp-1">{menu.label}</p>
                          {menu.id === 'inventory' && (player?.newDungeonDrops?.length || 0) > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono font-bold text-[9px] animate-bounce shadow">
                              {player.newDungeonDrops.length}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-cormorant line-clamp-1">
                          {menu.submenus[0]?.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
