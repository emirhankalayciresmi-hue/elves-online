import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, ChevronUp, ChevronDown, Send, Shield, Users,
  Sparkles, Crown, X, Maximize2, Minimize2
} from 'lucide-react';
import { ItemTooltipCard } from './ItemTooltip';
import PlayerBadge from './PlayerBadge';
import { createChatMessage } from '../services/chatService';

export default function MiniChatDock({
  player,
  chatMessages = [],
  onSendMessage,
  onOpenFullChat,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChannel, setActiveChannel] = useState('all'); // 'all' | 'general' | 'kingdom' | 'guild' | 'party' | 'system'
  const [inputText, setInputText] = useState('');
  const [hoveredLinkedItem, setHoveredLinkedItem] = useState(null);

  const dockEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (!isMinimized) {
      dockEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChannel, isMinimized]);

  // Filter messages
  const displayMessages = chatMessages.filter((msg) => {
    if (activeChannel === 'all') return true;
    return msg.channel === activeChannel;
  });

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const channelToSend = activeChannel === 'all' || activeChannel === 'system' ? 'general' : activeChannel;
    const newMsg = createChatMessage({
      sender: player?.name || 'Savaşçı',
      senderKingdom: player?.kingdomName || 'Kadim Krallık',
      senderClass: player?.className || 'Savaşçı',
      senderLevel: player?.level || 1,
      channel: channelToSend,
      text: inputText,
      isMe: true,
    });

    onSendMessage?.(newMsg);
    setInputText('');
  };

  return (
    <>
      {/* Metin2 Mini Chat Window */}
      <div className="fixed bottom-3 left-4 z-40 w-96 max-w-[calc(100vw-2rem)] select-none">
        <div className="bg-[#05080a]/90 backdrop-blur-md border border-amber-500/40 rounded-lg shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header Bar */}
          <div className="px-3 py-1.5 bg-black/80 border-b border-white/10 flex items-center justify-between">
            {/* Channel Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setActiveChannel('all')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  activeChannel === 'all'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel('general')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  activeChannel === 'general'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Genel
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel('kingdom')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  activeChannel === 'kingdom'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Krallık
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel('guild')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  activeChannel === 'guild'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lonca
              </button>
              <button
                type="button"
                onClick={() => setActiveChannel('system')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                  activeChannel === 'system'
                    ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sistem
              </button>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={onOpenFullChat}
                className="text-slate-400 hover:text-amber-300 cursor-pointer p-0.5"
                title="Geniş İletişim Sekmesini Aç"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-slate-400 hover:text-amber-300 cursor-pointer p-0.5"
                title={isMinimized ? 'Genişlet' : 'Küçült'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="h-44 overflow-y-auto p-2.5 space-y-1.5 text-xs font-mono scrollbar-thin scrollbar-thumb-amber-500/20">
                {displayMessages.slice(-25).map((msg) => (
                  <div key={msg.id} className="leading-snug">
                    <span className="text-[10px] text-slate-500 mr-1.5">[{msg.timeStr}]</span>

                    {msg.isSystem ? (
                      <span className="text-yellow-300 font-bold">
                        <Crown className="w-3 h-3 inline mr-1 text-yellow-400" />
                        [SİSTEM]: {msg.text}
                      </span>
                    ) : (
                      <>
                        <PlayerBadge
                          name={msg.sender}
                          level={msg.senderLevel}
                          kingdom={msg.senderKingdom}
                          characterClass={msg.senderClass}
                          isMe={msg.isMe}
                          showBadges={false}
                          className="mr-1 inline-flex"
                          isMobile={false}
                        />:
                        <span className="text-slate-200 font-cormorant text-[13px]">{msg.text}</span>
                        {msg.linkedItem && (
                          <button
                            type="button"
                            onClick={() => setHoveredLinkedItem(msg.linkedItem)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 underline ml-1 cursor-pointer"
                          >
                            [{msg.linkedItem.name}]
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <div ref={dockEndRef} />
              </div>

              {/* Quick Input Bar */}
              <form onSubmit={handleSend} className="p-1.5 bg-black/80 border-t border-white/10 flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Mesaj yaz... (Enter)"
                  className="flex-1 bg-black/70 border border-white/15 rounded px-2 py-1 text-xs text-amber-100 font-cormorant placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Tooltip Card for Linked Item Click from Mini Dock */}
      {hoveredLinkedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <ItemTooltipCard
            item={hoveredLinkedItem}
            titlePrefix="Sohbette Paylaşılan Eşya"
            isPinned={true}
            onClose={() => setHoveredLinkedItem(null)}
          />
        </div>
      )}
    </>
  );
}
