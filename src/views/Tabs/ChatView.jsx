import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Shield, Users, Globe, Crown, Sparkles,
  Paperclip, X, Check, Volume2, User, UserPlus, Eye, Bell
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import { ItemTooltipCard } from '../../components/ItemTooltip';
import PlayerBadge from '../../components/PlayerBadge';
import { ALL_MENUS } from '../../config/gameData';
import { CHAT_CHANNELS, createChatMessage } from '../../services/chatService';

export default function ChatView({
  player,
  layoutMode = 'mobile',
  chatMessages = [],
  onSendMessage,
  whisperPrefill = '',
}) {
  const [activeSubmenu, setActiveSubmenu] = useState('general');
  const [inputText, setInputText] = useState('');
  const [selectedLinkedItem, setSelectedLinkedItem] = useState(null);
  const [isItemPickerOpen, setIsItemPickerOpen] = useState(false);
  const [hoveredLinkedItem, setHoveredLinkedItem] = useState(null);
  const [quickNotification, setQuickNotification] = useState(null);

  useEffect(() => {
    if (whisperPrefill) {
      setInputText(whisperPrefill);
    }
  }, [whisperPrefill]);

  const messagesEndRef = useRef(null);
  const isPC = layoutMode === 'pc';

  const submenus = ALL_MENUS.find((m) => m.id === 'chat')?.submenus || [
    { id: 'general', label: 'Genel Sohbet' },
    { id: 'kingdom', label: 'Krallık Sohbeti' },
    { id: 'guild', label: 'Lonca Sohbeti' },
    { id: 'party', label: 'Grup Sohbeti' },
    { id: 'system', label: 'Sistem Duyuruları' },
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeSubmenu]);

  // Filter messages based on active channel
  const filteredMessages = chatMessages.filter((msg) => {
    if (activeSubmenu === 'general') {
      return msg.channel === 'general' || (msg.isSystem && msg.priority === 'high');
    }
    return msg.channel === activeSubmenu;
  });

  // Handle message send
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedLinkedItem) return;

    const newMsg = createChatMessage({
      sender: player?.name || 'Savaşçı',
      senderKingdom: player?.kingdomName || 'Kadim Krallık',
      senderClass: player?.className || 'Savaşçı',
      senderLevel: player?.level || 1,
      channel: activeSubmenu === 'system' ? 'general' : activeSubmenu,
      text: inputText,
      linkedItem: selectedLinkedItem,
      isMe: true,
    });

    onSendMessage?.(newMsg);
    setInputText('');
    setSelectedLinkedItem(null);
  };

  const handleSelectItemToLink = (item) => {
    setSelectedLinkedItem(item);
    setIsItemPickerOpen(false);
  };

  const triggerQuickNotification = (text) => {
    setQuickNotification(text);
    setTimeout(() => setQuickNotification(null), 3000);
  };

  const currentChannelMeta = CHAT_CHANNELS.find((c) => c.id === activeSubmenu) || CHAT_CHANNELS[0];

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn relative ${isPC ? 'w-full' : ''}`}>
      {/* Quick Notification Toast */}
      {quickNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce-short">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{quickNotification}</span>
        </div>
      )}

      {/* Submenu Pill Bar (5 Channels) */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* Main Chat Frame */}
      <OrnateFrame className="p-4 flex flex-col h-[560px] justify-between bg-gradient-to-b from-[#090e12]/95 via-[#060a0d]/95 to-[#040608]/95 border-amber-500/40 shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <MessageSquare className={`w-4 h-4 ${currentChannelMeta.color}`} />
            <div>
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-amber-100 flex items-center gap-2">
                <span>{submenus.find((s) => s.id === activeSubmenu)?.label}</span>
                {activeSubmenu === 'kingdom' && (
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/30">
                    [{player?.kingdomName || 'Krallık'}]
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Çevrimiçi
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {filteredMessages.length} Mesaj
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1.5 scrollbar-thin scrollbar-thumb-amber-500/20">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 opacity-30 text-amber-400" />
              <p className="font-cinzel text-xs text-slate-400">Bu kanalda henüz mesaj bulunmuyor.</p>
              <p className="text-[11px] font-cormorant text-slate-500">İlk mesajı yazarak sohbeti başlatabilirsiniz.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSys = msg.isSystem;
              const isMine = msg.isMe;

              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border text-xs transition-all relative ${
                    isSys
                      ? 'bg-gradient-to-r from-yellow-950/40 via-amber-950/20 to-black/60 border-yellow-500/40 shadow-sm'
                      : isMine
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-black/50 border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Message Meta Row */}
                  <div className="flex justify-between items-center mb-1.5 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSys ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-yellow-950 text-yellow-300 border border-yellow-500/50">
                          <Crown className="w-3 h-3 text-yellow-400" />
                          {msg.sender}
                        </span>
                      ) : (
                        <PlayerBadge
                          name={msg.sender}
                          level={msg.senderLevel}
                          kingdom={msg.senderKingdom}
                          characterClass={msg.senderClass}
                          isMe={isMine}
                          showBadges={true}
                          isMobile={!isPC}
                        />
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                      {msg.timeStr}
                    </span>
                  </div>

                  {/* Message Text */}
                  <p className={`font-cormorant text-sm leading-relaxed ${isSys ? 'text-yellow-200 font-bold' : 'text-slate-200'}`}>
                    {msg.text}
                  </p>

                  {/* Linked Item Preview Badge (Metin2 Tooltip Trigger) */}
                  {msg.linkedItem && (
                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Bağlanan Eşya:</span>
                      <button
                        type="button"
                        onMouseEnter={() => setHoveredLinkedItem(msg.linkedItem)}
                        onMouseLeave={() => setHoveredLinkedItem(null)}
                        onClick={() => setHoveredLinkedItem(hoveredLinkedItem ? null : msg.linkedItem)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 hover:bg-black border border-amber-500/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold shadow-md cursor-pointer transition-all animate-pulse"
                      >
                        <img
                          src={msg.linkedItem.image || msg.linkedItem.icon}
                          alt={msg.linkedItem.name}
                          className="w-4 h-4 object-contain rounded"
                        />
                        <span>[{msg.linkedItem.name}]</span>
                        <Sparkles className="w-3 h-3 text-amber-400" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Linked Item Preview bar above input */}
        {selectedLinkedItem && (
          <div className="py-1 px-2.5 mb-2 rounded bg-amber-950/50 border border-amber-500/40 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">Bağlanan Eşya:</span>
              <img
                src={selectedLinkedItem.image || selectedLinkedItem.icon}
                alt={selectedLinkedItem.name}
                className="w-4 h-4 object-contain"
              />
              <span className="text-amber-300 font-bold">[{selectedLinkedItem.name}]</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLinkedItem(null)}
              className="text-rose-400 hover:text-rose-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Send Input Bar */}
        {activeSubmenu !== 'system' ? (
          <form onSubmit={handleSend} className="pt-2.5 border-t border-white/10 flex items-center gap-2">
            {/* Eşya Bağla Button */}
            <button
              type="button"
              onClick={() => setIsItemPickerOpen(true)}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-amber-500/40 hover:border-amber-400 text-amber-400 flex items-center justify-center cursor-pointer transition-all"
              title="Envanterden Eşya Bağla (Metin2 Tarzı)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`[${currentChannelMeta.label}] Mesajınızı yazın...`}
              className="flex-1 bg-black/70 border border-elven-gold/40 rounded-lg px-3.5 py-2 text-xs text-amber-100 font-cormorant placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30"
            />

            {/* Submit button */}
            <ElvenButton type="submit" size="sm" icon={Send}>
              Gönder
            </ElvenButton>
          </form>
        ) : (
          <div className="pt-2 border-t border-white/10 text-center text-xs font-mono text-slate-500">
            ℹ️ Sistem Duyuruları kanalı salt okunurdur.
          </div>
        )}
      </OrnateFrame>

      {/* METIN2 ITEM TOOLTIP CARD HOVER/CLICK MODAL */}
      {hoveredLinkedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs pointer-events-auto">
          <div className="relative animate-fadeIn">
            <ItemTooltipCard
              item={hoveredLinkedItem}
              titlePrefix="Sohbette Paylaşılan Eşya"
              isPinned={true}
              onClose={() => setHoveredLinkedItem(null)}
            />
          </div>
        </div>
      )}

      {/* ITEM PICKER MODAL (Envanterden Eşya Seçip Sohbete Bağlama) */}
      {isItemPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <OrnateFrame className="p-4 max-w-lg w-full max-h-[80vh] flex flex-col justify-between border-amber-400 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-amber-300 font-cinzel font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Sohbete Eşya Bağla (Envanteriniz)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsItemPickerOpen(false)}
                className="text-xs text-slate-400 hover:text-white p-1 rounded bg-black/60 border border-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-cormorant mt-2">
              Sohbette diğer oyuncuların inceleyebilmesi için heybenizden bir ekipman veya maden cevheri seçin:
            </p>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-80 pr-1">
              {(!player?.inventory || player.inventory.length === 0) ? (
                <div className="p-6 text-center text-slate-500 text-xs font-mono">
                  Heybenizde henüz eşya veya maden bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {player.inventory.map((invItem) => (
                    <button
                      key={invItem.instanceId}
                      type="button"
                      onClick={() => handleSelectItemToLink(invItem)}
                      className="p-2 rounded-lg bg-black/60 hover:bg-amber-950/40 border border-white/10 hover:border-amber-400 flex items-center gap-2.5 text-left cursor-pointer transition-all"
                    >
                      <img
                        src={invItem.image || invItem.icon}
                        alt={invItem.name}
                        className="w-10 h-10 object-contain p-0.5 rounded bg-black border border-white/10 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h5 className="font-cinzel text-xs font-bold text-amber-200 truncate">
                          {invItem.name}
                        </h5>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {invItem.isOre ? '💎 Elf Madeni' : invItem.slotName || 'Ekipman'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setIsItemPickerOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white bg-black/60 rounded border border-white/10 cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </OrnateFrame>
        </div>
      )}

    </div>
  );
}
