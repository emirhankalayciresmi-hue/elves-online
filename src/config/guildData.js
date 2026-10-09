// src/config/guildData.js
// Lonca Sistemi: 10 Adet Özel Bayrak, Lonca Yetenekleri, Varsayılan Loncalar ve Yardımcı Metodlar

export const GUILD_CREATION_COST = 25000;
export const GUILD_CREATION_MIN_LEVEL = 10;

// 10 Adet Özel Vektörel Lonca Bayrağı
export const GUILD_FLAGS = [
  {
    id: 1,
    name: 'Kadim Altın Ejderha',
    file: 'assets/guild_flags/flag_1.svg',
    accentColor: '#f59e0b',
    borderClass: 'border-amber-500/50',
    description: 'Cesaret, saf alev ve yıkılmaz kudret sembolü.',
  },
  {
    id: 2,
    name: 'Kutsal Zümrüt Meşe',
    file: 'assets/guild_flags/flag_2.svg',
    accentColor: '#10b981',
    borderClass: 'border-emerald-500/50',
    description: 'Sylvandar ormanlarının ebedi koruyucusu ve yaşamın kökleri.',
  },
  {
    id: 3,
    name: 'Hilal & Gece Yıldızı',
    file: 'assets/guild_flags/flag_3.svg',
    accentColor: '#6366f1',
    borderClass: 'border-indigo-500/50',
    description: 'Lorvathiel gölgelerinin gizemi ve gümüş yıldızların fısıltısı.',
  },
  {
    id: 4,
    name: 'Alevli Anka Kuşu',
    file: 'assets/guild_flags/flag_4.svg',
    accentColor: '#f97316',
    borderClass: 'border-orange-500/50',
    description: 'Küllerinden yeniden doğan ve asla pes etmeyen asil ruhlar.',
  },
  {
    id: 5,
    name: 'Buz Kurdu Başı',
    file: 'assets/guild_flags/flag_5.svg',
    accentColor: '#06b6d4',
    borderClass: 'border-cyan-500/50',
    description: 'Kuzey rüzgarlarının soğuk avcıları ve sürü sadakati.',
  },
  {
    id: 6,
    name: 'Çift Kılıç & Çelik Kalkan',
    file: 'assets/guild_flags/flag_6.svg',
    accentColor: '#94a3b8',
    borderClass: 'border-slate-400/50',
    description: 'Yıkılmaz cephe muhafızları ve onurlu kılıç ustaları.',
  },
  {
    id: 7,
    name: 'Arcane Büyü Gözü',
    file: 'assets/guild_flags/flag_7.svg',
    accentColor: '#c084fc',
    borderClass: 'border-purple-500/50',
    description: 'Kadim rünlerin ve sonsuz kozmik bilginin arayıcıları.',
  },
  {
    id: 8,
    name: 'Zümrüt Zehir Kobrası',
    file: 'assets/guild_flags/flag_8.svg',
    accentColor: '#34d399',
    borderClass: 'border-teal-500/50',
    description: 'Gölge bataklıkların sessiz ve ölümcül zehirli pençesi.',
  },
  {
    id: 9,
    name: 'Güneş Krallığı Tacı',
    file: 'assets/guild_flags/flag_9.svg',
    accentColor: '#eab308',
    borderClass: 'border-yellow-500/50',
    description: 'Aeltherin güneşinin parlak ışığı ve krallık asaleti.',
  },
  {
    id: 10,
    name: 'Kadim Çekiç & Örs',
    file: 'assets/guild_flags/flag_10.svg',
    accentColor: '#ea580c',
    borderClass: 'border-amber-600/50',
    description: 'Kadim ocakların kor ateşi ve efsanevi demirciler.',
  },
];

// Metin2 Tarzı Lonca Yetenekleri
export const GUILD_SKILLS = [
  {
    id: 'dragon_rage',
    name: 'Ejderha Gazabı',
    iconName: 'Flame',
    color: '#ef4444',
    maxLevel: 5,
    costGoldPerLevel: 5000,
    bonusPerLevel: '+%1.5 Saldırı Gücü',
    description: 'Tüm lonca üyelerinin fiziksel ve büyü saldırı gücünü arttırır.',
  },
  {
    id: 'spring_of_life',
    name: 'Hayat Pınarı',
    iconName: 'Heart',
    color: '#ec4899',
    maxLevel: 5,
    costGoldPerLevel: 5000,
    bonusPerLevel: '+%2.0 Maksimum Can',
    description: 'Tüm lonca üyelerine kadim hayat özü aşılayarak can havuzunu genişletir.',
  },
  {
    id: 'iron_skin',
    name: 'Demir Ten',
    iconName: 'Shield',
    color: '#3b82f6',
    maxLevel: 5,
    costGoldPerLevel: 5000,
    bonusPerLevel: '+%1.5 Savunma Oranı',
    description: 'Sertleşmiş büyü kalkanı tüm üyelere gelen hasarı azaltır.',
  },
  {
    id: 'ancient_wisdom',
    name: 'Kadim Bilgelik',
    iconName: 'BookOpen',
    color: '#a855f7',
    maxLevel: 5,
    costGoldPerLevel: 7500,
    bonusPerLevel: '+%2.0 Kazanılan EXP',
    description: 'Zindan ve canavarlardan kazanılan tecrübe puanına ek bonus sağlar.',
  },
  {
    id: 'swift_steps',
    name: 'Hızlı Adımlar',
    iconName: 'Zap',
    color: '#eab308',
    maxLevel: 5,
    costGoldPerLevel: 7500,
    bonusPerLevel: '+%1.5 Maden & Sefer Hızı',
    description: 'Maden çıkarma ve sefer operasyonlarında hızı arttırır.',
  },
];

// Başlangıç Loncaları (Oyuncuların kurduğu gerçek loncalar tutulur)
export const INITIAL_GUILDS = [];

const STORAGE_KEY = 'elves_kadim_guilds';

// LocalStorage'dan loncaları getir
export function loadGuildsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Eski demo loncaları (guild_ael_1, Lord_Aeron vb.) temizle
        const isOldDemo = parsed.some(
          (g) => g.id === 'guild_ael_1' || g.leader === 'Lord_Aeron' || g.leader === 'DryadQueen'
        );
        if (isOldDemo) {
          localStorage.removeItem(STORAGE_KEY);
          return [];
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load guilds from storage:', err);
  }
  return INITIAL_GUILDS;
}

// LocalStorage'a kaydet
export function saveGuildsToStorage(guilds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guilds));
  } catch (err) {
    console.error('Failed to save guilds to storage:', err);
  }
}

// Oyuncunun Loncasını bul
export function getPlayerGuild(guilds, guildId) {
  if (!guildId) return null;
  return guilds.find((g) => g.id === guildId) || null;
}
