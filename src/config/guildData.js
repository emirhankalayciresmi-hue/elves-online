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

// Başlangıç Varsayılan Loncaları
export const INITIAL_GUILDS = [
  {
    id: 'guild_ael_1',
    name: 'Güneş Muhafızları',
    leader: 'Lord_Aeron',
    kingdom: 'Aeltherin',
    flagId: 9,
    level: 6,
    exp: 2800,
    maxExp: 6000,
    vaultGold: 45000,
    motto: 'Aeltherin Güneşi Asla Batmaz!',
    notice: 'Haftalık grup zindanı etkinliklerimiz her akşam 21:00\'de başlamaktadır. Katılım zorunludur.',
    minLevel: 5,
    isOpen: true,
    skills: { dragon_rage: 2, spring_of_life: 2, iron_skin: 1, ancient_wisdom: 1, swift_steps: 0 },
    members: [
      { name: 'Lord_Aeron', level: 35, class: 'Savaşçı', rank: 'Lider', contributionExp: 1200, contributionGold: 20000, online: true },
      { name: 'Solaria', level: 32, class: 'Büyücü', rank: 'General', contributionExp: 800, contributionGold: 12000, online: true },
      { name: 'Kael_Sun', level: 28, class: 'Assassin', rank: 'Muhafız', contributionExp: 500, contributionGold: 8000, online: false },
      { name: 'Lyra_Dawn', level: 24, class: 'Büyücü', rank: 'Üye', contributionExp: 300, contributionGold: 5000, online: true },
    ],
  },
  {
    id: 'guild_syl_1',
    name: 'Zümrüt Kardeşliği',
    leader: 'DryadQueen',
    kingdom: 'Sylvandar',
    flagId: 2,
    level: 5,
    exp: 1900,
    maxExp: 5000,
    vaultGold: 28000,
    motto: 'Doğanın kalbi bizimle çarpar.',
    notice: 'Maden paylaşımları ve iksir dağıtımları lonca deposunda açıktır.',
    minLevel: 1,
    isOpen: true,
    skills: { dragon_rage: 1, spring_of_life: 3, iron_skin: 1, ancient_wisdom: 2, swift_steps: 1 },
    members: [
      { name: 'DryadQueen', level: 30, class: 'Büyücü', rank: 'Lider', contributionExp: 900, contributionGold: 15000, online: true },
      { name: 'LeafWalker', level: 27, class: 'Assassin', rank: 'General', contributionExp: 600, contributionGold: 7000, online: false },
      { name: 'OakShield', level: 25, class: 'Savaşçı', rank: 'Muhafız', contributionExp: 400, contributionGold: 6000, online: true },
    ],
  },
  {
    id: 'guild_lor_1',
    name: 'Gece Gölgeleri',
    leader: 'ShadowMaster',
    kingdom: 'Lorvathiel',
    flagId: 3,
    level: 4,
    exp: 1200,
    maxExp: 4000,
    vaultGold: 18000,
    motto: 'Karanlıkta fısıldayan soğuk hançerler.',
    notice: 'Sessiz ve ölümcül olanlar aramıza katılabilir.',
    minLevel: 5,
    isOpen: true,
    skills: { dragon_rage: 2, spring_of_life: 1, iron_skin: 1, ancient_wisdom: 0, swift_steps: 2 },
    members: [
      { name: 'ShadowMaster', level: 29, class: 'Assassin', rank: 'Lider', contributionExp: 700, contributionGold: 10000, online: true },
      { name: 'Nightshade', level: 26, class: 'Assassin', rank: 'General', contributionExp: 500, contributionGold: 8000, online: true },
    ],
  },
  {
    id: 'guild_lor_2',
    name: 'Kuzey Kurtları',
    leader: 'FrostBane',
    kingdom: 'Lorvathiel',
    flagId: 5,
    level: 3,
    exp: 800,
    maxExp: 3000,
    vaultGold: 12000,
    motto: 'Buz gibi keskin, fırtına kadar acımasız.',
    notice: 'Seviye 1 tüm dost elfler davetlidir!',
    minLevel: 1,
    isOpen: true,
    skills: { dragon_rage: 1, spring_of_life: 1, iron_skin: 1, ancient_wisdom: 0, swift_steps: 0 },
    members: [
      { name: 'FrostBane', level: 22, class: 'Savaşçı', rank: 'Lider', contributionExp: 500, contributionGold: 7000, online: false },
      { name: 'IceArrow', level: 20, class: 'Assassin', rank: 'Muhafız', contributionExp: 300, contributionGold: 5000, online: true },
    ],
  },
  {
    id: 'guild_ith_1',
    name: 'Kristal Okyanus',
    leader: 'TideCaller',
    kingdom: 'Ithilmar',
    flagId: 6,
    level: 5,
    exp: 3100,
    maxExp: 5000,
    vaultGold: 36000,
    motto: 'Derin suların kırılmaz muhafızları.',
    notice: 'Boss akınları için zırhlarınızı bileyin!',
    minLevel: 8,
    isOpen: true,
    skills: { dragon_rage: 1, spring_of_life: 2, iron_skin: 3, ancient_wisdom: 1, swift_steps: 1 },
    members: [
      { name: 'TideCaller', level: 31, class: 'Savaşçı', rank: 'Lider', contributionExp: 1100, contributionGold: 18000, online: true },
      { name: 'MistWhisper', level: 28, class: 'Büyücü', rank: 'General', contributionExp: 900, contributionGold: 1100, online: true },
      { name: 'DeepGuardian', level: 25, class: 'Savaşçı', rank: 'Muhafız', contributionExp: 700, contributionGold: 7000, online: false },
    ],
  },
  {
    id: 'guild_ael_2',
    name: 'Kızıl Ejderha Lejyonu',
    leader: 'IgnisDragon',
    kingdom: 'Aeltherin',
    flagId: 1,
    level: 7,
    exp: 4200,
    maxExp: 7000,
    vaultGold: 62000,
    motto: 'Alevin hükmettiği topraklarda diz çökeceksiniz.',
    notice: 'Sadece tecrübeli ve disiplinli elfler.',
    minLevel: 10,
    isOpen: true,
    skills: { dragon_rage: 4, spring_of_life: 3, iron_skin: 2, ancient_wisdom: 2, swift_steps: 1 },
    members: [
      { name: 'IgnisDragon', level: 40, class: 'Savaşçı', rank: 'Lider', contributionExp: 2200, contributionGold: 30000, online: true },
      { name: 'FlameCaster', level: 37, class: 'Büyücü', rank: 'General', contributionExp: 1400, contributionGold: 20000, online: true },
      { name: 'CinderBlade', level: 34, class: 'Assassin', rank: 'Muhafız', contributionExp: 600, contributionGold: 12000, online: true },
    ],
  },
  {
    id: 'guild_syl_2',
    name: 'Kadim Demir Ocağı',
    leader: 'IronForgeMaster',
    kingdom: 'Sylvandar',
    flagId: 10,
    level: 4,
    exp: 1500,
    maxExp: 4000,
    vaultGold: 24000,
    motto: 'Çelik ateşte sınanır, dostluk savaşta.',
    notice: 'Maden işçilerine ve demircilere tam destek!',
    minLevel: 3,
    isOpen: true,
    skills: { dragon_rage: 2, spring_of_life: 1, iron_skin: 2, ancient_wisdom: 1, swift_steps: 2 },
    members: [
      { name: 'IronForgeMaster', level: 28, class: 'Savaşçı', rank: 'Lider', contributionExp: 800, contributionGold: 14000, online: true },
      { name: 'AnvilStrike', level: 24, class: 'Savaşçı', rank: 'Muhafız', contributionExp: 700, contributionGold: 10000, online: false },
    ],
  },
  {
    id: 'guild_lor_3',
    name: 'Zehir Pençesi',
    leader: 'ViperKing',
    kingdom: 'Lorvathiel',
    flagId: 8,
    level: 3,
    exp: 600,
    maxExp: 3000,
    vaultGold: 9500,
    motto: 'Tek bir damla zehir bir imparatorluğu devirir.',
    notice: 'Pusu ve gölge taktikleri çalışıyoruz.',
    minLevel: 1,
    isOpen: true,
    skills: { dragon_rage: 2, spring_of_life: 0, iron_skin: 1, ancient_wisdom: 0, swift_steps: 1 },
    members: [
      { name: 'ViperKing', level: 25, class: 'Assassin', rank: 'Lider', contributionExp: 400, contributionGold: 5500, online: true },
      { name: 'ToxicFang', level: 21, class: 'Assassin', rank: 'Muhafız', contributionExp: 200, contributionGold: 4000, online: false },
    ],
  },
];

const STORAGE_KEY = 'elves_kadim_guilds';

// LocalStorage'dan loncaları getir
export function loadGuildsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
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
