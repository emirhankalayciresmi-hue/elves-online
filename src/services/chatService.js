// Kadim Elfler - Sohbet & Canlı İletişim Servisi (Chat Service)
// Çok oyunculu (online) altyapıya hazır, 5 kanallı, Supabase Realtime destekli motor.
import { supabase } from './supabaseClient';

export const CHAT_STORAGE_KEY = 'elves_rpg_chat_history';

export const CHAT_CHANNELS = [
  { id: 'general', label: 'Genel Sohbet', color: 'text-amber-300', border: 'border-amber-500/30', bg: 'bg-amber-950/20', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'kingdom', label: 'Krallık Sohbeti', color: 'text-indigo-300', border: 'border-indigo-500/30', bg: 'bg-indigo-950/20', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { id: 'guild', label: 'Lonca Sohbeti', color: 'text-emerald-300', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'party', label: 'Grup Sohbeti', color: 'text-sky-300', border: 'border-sky-500/30', bg: 'bg-sky-950/20', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { id: 'system', label: 'Sistem Duyuruları', color: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-950/30', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'msg_sys_welcome',
    channel: 'system',
    sender: 'SİSTEM BİLDİRİMİ',
    senderKingdom: 'Elves Online',
    senderClass: 'Yönetici',
    senderLevel: 100,
    text: 'Kadim Krallıklar dünyasına hoş geldiniz! Tüm sohbet ve krallık iletişim kanalları canlıya açılmıştır.',
    timeStr: '00:00',
    timestamp: Date.now(),
    isSystem: true,
  },
];

/**
 * Mesajları LocalStorage'dan yükler
 */
export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return INITIAL_CHAT_MESSAGES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CHAT_MESSAGES;

    const demoSenders = ['Sylvaen_Elf', 'Aeliana_Sun', 'Lorvath_Muhafız', 'Lonca_Lideri', 'Ithil_Okçu', 'KRALLIK MÜHÜRÜ'];
    const hasDemo = parsed.some((m) => demoSenders.includes(m.sender));
    if (hasDemo) {
      const cleaned = parsed.filter((m) => !demoSenders.includes(m.sender));
      const result = cleaned.length > 0 ? cleaned : INITIAL_CHAT_MESSAGES;
      saveChatHistory(result);
      return result;
    }

    return parsed;
  } catch {
    return INITIAL_CHAT_MESSAGES;
  }
}

/**
 * Mesajları kaydeder (Son 150 mesajı tutarak belleği korur)
 */
export function saveChatHistory(messages) {
  try {
    const trimmed = Array.isArray(messages) ? messages.slice(-150) : [];
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Chat storage save error:', e);
  }
}

/**
 * Yeni Sohbet Mesajı Oluşturur
 */
export function createChatMessage({
  sender,
  senderKingdom,
  senderClass,
  senderLevel,
  channel = 'general',
  text,
  linkedItem = null,
  isMe = false,
}) {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    channel,
    sender: sender || 'İsimsiz Savaşçı',
    senderKingdom: senderKingdom || 'Kadim Krallık',
    senderClass: senderClass || 'Savaşçı',
    senderLevel: senderLevel || 1,
    text: (text || '').trim(),
    linkedItem,
    timeStr,
    timestamp: Date.now(),
    isMe,
    isSystem: false,
  };
}

/**
 * Otomatik Sistem Duyurusu Oluşturur
 */
export function createSystemAnnouncement(text, priority = 'normal') {
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return {
    id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    channel: 'system',
    sender: 'SİSTEM BİLDİRİMİ',
    senderKingdom: 'Kadim Diyar',
    senderClass: 'Kutsal Çağrı',
    senderLevel: 100,
    text,
    timeStr,
    timestamp: Date.now(),
    isSystem: true,
    priority,
  };
}

/**
 * Supabase'den son mesajları çeker
 */
export async function fetchCloudChatMessages(limit = 60) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Chat fetch warning:', error.message);
      return [];
    }

    if (!data) return [];

    // Chronological order (oldest to newest)
    return data.reverse().map((row) => {
      const d = new Date(row.created_at);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      return {
        id: row.id,
        channel: row.channel || 'general',
        sender: row.sender_name,
        senderKingdom: row.sender_kingdom || 'Kadim Krallık',
        senderClass: row.sender_class || 'Savaşçı',
        senderLevel: row.sender_level || 1,
        text: row.text,
        linkedItem: row.linked_item,
        isSystem: row.is_system || false,
        timeStr,
        timestamp: d.getTime(),
        isMe: false,
      };
    });
  } catch (err) {
    console.error('Chat fetch exception:', err);
    return [];
  }
}

/**
 * Supabase'e mesaj kaydeder
 */
export async function sendChatMessageToCloud(msg) {
  try {
    const payload = {
      channel: msg.channel || 'general',
      sender_name: msg.sender,
      sender_kingdom: msg.senderKingdom,
      sender_class: msg.senderClass,
      sender_level: msg.senderLevel || 1,
      text: msg.text,
      linked_item: msg.linkedItem || null,
      is_system: msg.isSystem || false,
    };

    const { error } = await supabase.from('chat_messages').insert([payload]);
    if (error) {
      console.warn('Cloud message insert error:', error.message);
    }
  } catch (err) {
    console.error('Cloud message insert exception:', err);
  }
}

/**
 * Realtime Chat Dinleyicisi
 */
export function subscribeToRealtimeChat(onNewMessage) {
  try {
    const channel = supabase
      .channel('chat_realtime_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          const d = new Date(row.created_at || Date.now());
          const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          const formattedMsg = {
            id: row.id,
            channel: row.channel || 'general',
            sender: row.sender_name,
            senderKingdom: row.sender_kingdom || 'Kadim Krallık',
            senderClass: row.sender_class || 'Savaşçı',
            senderLevel: row.sender_level || 1,
            text: row.text,
            linkedItem: row.linked_item,
            isSystem: row.is_system || false,
            timeStr,
            timestamp: d.getTime(),
            isMe: false,
          };
          onNewMessage(formattedMsg);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Subscribe to realtime chat error:', err);
    return () => {};
  }
}
