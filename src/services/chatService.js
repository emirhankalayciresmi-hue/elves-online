// Kadim Elfler - Sohbet & Canlı İletişim Servisi (Chat Service)
// Çok oyunculu (online) altyapıya hazır, 5 kanallı, Metin2 tarzı eşya linkleme ve sistem duyuruları motoru.

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
 * Mesajları LocalStorage'dan yükler (Demo bot mesajlarını temizler)
 */
export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return INITIAL_CHAT_MESSAGES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CHAT_MESSAGES;

    // Eski demo sahte bot mesajlarını temizle:
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
    linkedItem, // { name, rarity, image, slot, desc, sellPrice ... }
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
    priority, // 'normal' | 'high'
  };
}
