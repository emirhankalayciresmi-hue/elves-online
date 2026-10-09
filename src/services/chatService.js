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
    id: 'msg_sys_1',
    channel: 'system',
    sender: 'SİSTEM',
    senderKingdom: 'Kadim Diyar',
    senderClass: 'Yönetici',
    senderLevel: 100,
    text: 'Kadim Krallıklar sunucusuna hoş geldiniz! Zindanlar ve madenler keşfedilmeyi bekliyor.',
    timeStr: '12:00',
    timestamp: Date.now() - 3600000,
    isSystem: true,
  },
  {
    id: 'msg_gen_1',
    channel: 'general',
    sender: 'Sylvaen_Elf',
    senderKingdom: 'Sylvandar',
    senderClass: 'Savaşçı',
    senderLevel: 28,
    text: 'Zümrüt Vadisi Dünya Bossu için toplanan var mı? Akşam 20:00 seferi için adam arıyoruz.',
    timeStr: '14:20',
    timestamp: Date.now() - 1800000,
  },
  {
    id: 'msg_gen_2',
    channel: 'general',
    sender: 'Aeliana_Sun',
    senderKingdom: 'Aeltherin',
    senderClass: 'Büyücü',
    senderLevel: 42,
    text: 'Pazara +9 Ay Gümüşü Kılıç koydum, zırh delen büyücüler baksın.',
    timeStr: '14:24',
    timestamp: Date.now() - 1200000,
  },
  {
    id: 'msg_kng_1',
    channel: 'kingdom',
    sender: 'Lorvath_Muhafız',
    senderKingdom: 'Lorvathiel',
    senderClass: 'Assassin',
    senderLevel: 35,
    text: 'Sınır karakolundaki kervan muhafızları hazır olsun, gece akını başlayacak.',
    timeStr: '14:30',
    timestamp: Date.now() - 900000,
  },
  {
    id: 'msg_gld_1',
    channel: 'guild',
    sender: 'Lonca_Lideri',
    senderKingdom: 'Sylvandar',
    senderClass: 'Savaşçı',
    senderLevel: 65,
    text: 'Lonca arazimize yeni maden işleme atölyesi kurduk, madenciler cevherleri lonca deposuna aktarabilir.',
    timeStr: '14:35',
    timestamp: Date.now() - 600000,
  },
  {
    id: 'msg_pty_1',
    channel: 'party',
    sender: 'Ithil_Okçu',
    senderKingdom: 'Ithilmar',
    senderClass: 'Assassin',
    senderLevel: 22,
    text: 'Zindana girmeden önce can iksirlerinizi fulleyin, slotlar 4. odada kalabalıklaşıyor.',
    timeStr: '14:40',
    timestamp: Date.now() - 300000,
  },
  {
    id: 'msg_sys_2',
    channel: 'system',
    sender: 'KRALLIK MÜHÜRÜ',
    senderKingdom: 'Kadim Diyar',
    senderClass: 'Duyuru',
    senderLevel: 100,
    text: '🏆 [Thalorien] Kadim Taş Devi Gorgath bossunu hezimete uğrattı ve krallık şanını yüceltti!',
    timeStr: '14:45',
    timestamp: Date.now() - 120000,
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CHAT_MESSAGES;
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
