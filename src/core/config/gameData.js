// Oyunun başlangıç veri tanımları (Krallıklar, Sınıflar, Menüler, Ekipman ve Nitelikler)

export const KINGDOMS = [
  {
    id: 'aeltherin',
    name: 'Aeltherin Krallığı',
    title: 'Güneş & Kadim Işık Elfleri',
    description: 'Yüksek altın kuleleri ve saf kadim ışığın koruyucuları. Asil hanedanların ve diplomatik dehanın beşiği.',
    bannerSlot: 'assets/kingdoms/aeltherin_landscape.jpg',
    crestSlot: 'assets/kingdoms/aeltherin_flag.jpg',
    themeColor: '#e6c88b',
    accentBorder: 'border-amber-500/40',
    glowColor: 'rgba(230, 200, 139, 0.3)',
  },
  {
    id: 'sylvandar',
    name: 'Sylvandar Krallığı',
    title: 'Kadim Zümrüt Orman Elfleri',
    description: 'Yüzyıllık kutsal ağaçların gölgesinde yaşayan, doğanın ve kadim yaratıkların kadim sırlarına hükmeden halk.',
    bannerSlot: 'assets/kingdoms/sylvandar_landscape.jpg',
    crestSlot: 'assets/kingdoms/sylvandar_flag.jpg',
    themeColor: '#10b981',
    accentBorder: 'border-emerald-500/40',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: 'lorvathiel',
    name: 'Lorvathiel Krallığı',
    title: 'Gece & Hilal Muhafızları',
    description: 'Gümüş yıldızların ve sessiz gölgelerin elfleri. Gece göğünün gizemli bilgeliğini ve soğuk çeliğini kuşanmışlardır.',
    bannerSlot: 'assets/kingdoms/lorvathiel_landscape.jpg',
    crestSlot: 'assets/kingdoms/lorvathiel_flag.jpg',
    themeColor: '#818cf8',
    accentBorder: 'border-indigo-500/40',
    glowColor: 'rgba(129, 140, 248, 0.3)',
  },
  {
    id: 'ithilmar',
    name: 'Ithilmar Krallığı',
    title: 'Kristal Sis & Okyanus Elfleri',
    description: 'Köpüren denizlerin ve el değmemiş kristal kıyıların efendileri. Derin suların fısıltısını duyarlar.',
    bannerSlot: 'assets/kingdoms/ithilmar_landscape.jpg',
    crestSlot: 'assets/kingdoms/ithilmar_flag.jpg',
    themeColor: '#38bdf8',
    accentBorder: 'border-sky-500/40',
    glowColor: 'rgba(56, 189, 248, 0.3)',
  },
];

export const CLASSES = [
  {
    id: 'warrior',
    name: 'Savaşçı',
    title: '',
    description: 'Korkusuz, cesur ve mücadeleci bir savaş ruhu. Meydanlarda geri adım atmayan kararlılığıyla kadim efsanelere adını kazıyan öncüler.',
    imageSlot: '/assets/classes/class_warrior.jpg',
  },
  {
    id: 'ninja',
    name: 'Ninja',
    title: '',
    description: 'Hızlı, çevik ve keskin bir odaklanma. Rüzgar gibi sessiz, adımlarında kararlı ve hedefine odaklanan gölge ustaları.',
    imageSlot: '/assets/classes/class_ninja.jpg',
  },
  {
    id: 'mage',
    name: 'Büyücü',
    title: '',
    description: 'Kadim bilgeliğe ve derin bir zihne sahip bir karakter. Soğukkanlı düşünce yapısı, sabrı ve planlı yaklaşımıyla öne çıkar.',
    imageSlot: '/assets/classes/class_mage.jpg',
  },
];

// 12 Adet Kuşanılabilir Ekipman Yuvası
export const EQUIPMENT_SLOTS = [
  { id: 'helmet', name: 'Miğfer', slotHint: 'Baş zırhı' },
  { id: 'armor', name: 'Zırh', slotHint: 'Gövde zırhı' },
  { id: 'weapon', name: 'Silah', slotHint: 'Ana el silahı' },
  { id: 'offhand', name: 'Yan El', slotHint: 'Kalkan / Yan silah' },
  { id: 'necklace', name: 'Kolye', slotHint: 'Boyun takısı' },
  { id: 'ring1', name: 'Yüzük (1)', slotHint: '1. Yüzük yuvası' },
  { id: 'ring2', name: 'Yüzük (2)', slotHint: '2. Yüzük yuvası' },
  { id: 'gloves', name: 'Eldiven', slotHint: 'El zırhı' },
  { id: 'boots', name: 'Çizme', slotHint: 'Ayak zırhı' },
  { id: 'belt', name: 'Kemer', slotHint: 'Bel kuşamı' },
  { id: 'cloak', name: 'Pelerin', slotHint: 'Asil pelerin' },
  { id: 'wings', name: 'Kanat', slotHint: 'Kadim elf kanatları' },
];

// Stat Dağıtım Kuralları & Sınırları (Metin2 Tipi RPG Standartları)
export const MAX_STAT_CAP = 90;           // Her bir stat en fazla 90 puan alabilir
export const STAT_POINTS_PER_LEVEL = 6;    // Her seviye atlayışında 6 stat puanı kazanılır
export const BASE_PHYSICAL_DAMAGE = 15;    // Başlangıç taban fiziksel hasar

// Detaylı Karakter Nitelikleri ve Oranları (Başlangıç Standartları)
export const DEFAULT_PLAYER_STATS = {
  // Temel Nitelikler
  hp: 500,
  maxHp: 500,
  mana: 500,
  maxMana: 500,
  strength: 0,           // GÜÇ (STR): Direkt Fiziksel Hasar (+3 Hasar / Puan)
  agility: 0,            // ÇEVİKLİK (AGI): Savunma (+2), Kaçınma (+%0.2), Kritik (+%0.2)
  intelligence: 0,       // ZEKA (INT): Mana (+25 MP), Büyü Hasarı (+3 / Puan)
  statPoints: 0,         // Dağıtılabilir Stat Puanı (Seviye başına +6)
  allocatedStats: {      // Dağıtılan Stat Puanları (Maks 90/90)
    hp: 0,
    str: 0,
    agi: 0,
    int: 0,
  },

  // İksir ve Otomatik Tüketim
  hpPotions: 50,           // Kırmızı Can İksiri Adedi
  manaPotions: 50,         // Mavi Mana İksiri Adedi
  autoPotionThreshold: 50, // Otomatik İksir İçme Yüzdesi (%50 Can)
  dungeonCooldownUntil: 0, // Zindan Bekleme Süresi (timestamp)
  newDungeonDrops: [],     // Yeni Düşen Zindan Eşyaları (Parıldama & Bildirim için)

  // Savaş & Oran Nitelikleri (%) (Başlangıçta hepsi %0)
  dodgeChance: 0,          // Kaçınma Şansı % (AGI ile artar: +%0.2 / AGI)
  criticalChance: 0,       // Kritik Vuruş Şansı % (AGI ile artar: +%0.2 / AGI)
  armorPenetration: 0,     // ZIRH DELME ŞANSI %
  stunChance: 0,           // SERSEMLETME ŞANSI %
  poisonChance: 0,         // ZEHİRLEME ŞANSI %
  reflectChance: 0,        // YANSITMA ŞANSI %

  // Sınıflara Karşı Güç (%) (Başlangıçta hepsi %0)
  vsWarrior: 0,            // SAVAŞÇILARA KARŞI GÜÇLÜ %
  vsNinja: 0,              // NİNJALARA KARŞI GÜÇLÜ %
  vsMage: 0,               // BÜYÜCÜLERE KARŞI GÜÇLÜ %

  // Elementlere Karşı Güç (%) (Başlangıçta hepsi %0)
  fireBonus: 0,            // Ateşe Karşı Güçlü %
  iceBonus: 0,             // Buza Karşı Güçlü %
  windBonus: 0,            // Rüzgara Karşı Güçlü %
  lightningBonus: 0,       // Şimşeğe Karşı Güçlü %
};

/**
 * Oyuncu nesnesinden tüm hesaplanmış nihai RPG niteliklerini türetir.
 * Dağıtılan statlar, rozet bonusları ve temel değerleri harmanlar.
 */
export function calculatePlayerStats(player = {}, badgeBonus = {}) {
  const currentLevel = player.level || 1;
  const allocated = player.allocatedStats || {
    hp: 0,
    str: 0,
    agi: 0,
    int: 0,
  };

  // 1 HP = +40 Can
  const bonusHp = (allocated.hp || 0) * 40 + (badgeBonus.hp || 0);
  const maxHp = 500 + bonusHp;
  const currentHp = Math.min(player.hp ?? maxHp, maxHp);

  // 1 INT = +25 Mana, +3 Büyü Hasarı
  const bonusMana = (allocated.int || 0) * 25 + (badgeBonus.mana || 0);
  const maxMana = 500 + bonusMana;
  const currentMana = Math.min(player.mana ?? maxMana, maxMana);

  // 1 STR = +3 Direkt Fiziksel Hasar
  const strength = (allocated.str || 0) + (badgeBonus.strength || 0);
  const physicalDamage = BASE_PHYSICAL_DAMAGE + strength * 3;

  // 1 AGI = +2 Savunma, +%0.2 Kaçınma, +%0.2 Kritik
  const agility = (allocated.agi || 0) + (badgeBonus.agility || 0);
  const intelligence = (allocated.int || 0) + (badgeBonus.intelligence || 0);
  const magicDamage = intelligence * 3;

  const defense = agility * 2 + (badgeBonus.defense || 0);
  const dodgeChance = Number(((agility * 0.2) + (badgeBonus.dodgeChance || 0)).toFixed(1));
  const criticalChance = Number(((agility * 0.2) + (badgeBonus.criticalChance || 0)).toFixed(1));

  // Toplam hak edilen stat puanı ve kalan puan hesabı
  const totalEarned = Math.max(0, (currentLevel - 1) * STAT_POINTS_PER_LEVEL);
  const totalSpent = (allocated.hp || 0) + (allocated.str || 0) + (allocated.agi || 0) + (allocated.int || 0);
  const statPoints = player.statPoints !== undefined ? player.statPoints : Math.max(0, totalEarned - totalSpent);

  return {
    hp: currentHp,
    maxHp,
    mana: currentMana,
    maxMana,
    strength,
    agility,
    intelligence,
    physicalDamage,
    magicDamage,
    defense,
    statPoints,
    allocatedStats: allocated,
    dodgeChance,
    criticalChance,
    armorPenetration: Number((badgeBonus.armorPenetration || 0).toFixed(1)),
    stunChance: Number((badgeBonus.stunChance || 0).toFixed(1)),
    poisonChance: Number((badgeBonus.poisonChance || 0).toFixed(1)),
    reflectChance: Number((badgeBonus.reflectChance || 0).toFixed(1)),
    vsWarrior: Number((badgeBonus.vsWarrior || 0).toFixed(1)),
    vsNinja: Number((badgeBonus.vsNinja || 0).toFixed(1)),
    vsMage: Number((badgeBonus.vsMage || 0).toFixed(1)),
    fireBonus: Number((badgeBonus.fireBonus || 0).toFixed(1)),
    iceBonus: Number((badgeBonus.iceBonus || 0).toFixed(1)),
    windBonus: Number((badgeBonus.windBonus || 0).toFixed(1)),
    lightningBonus: Number((badgeBonus.lightningBonus || 0).toFixed(1)),
  };
}

// 13 Adet Ana Menü ve Alt Menü Yapısı
export const ALL_MENUS = [
  {
    id: 'character',
    label: 'Karakter',
    icon: 'User',
    group: 'Karakter & Eşya',
    submenus: [
      { id: 'info', label: 'Karakter Bilgileri' },
    ],
  },
  {
    id: 'inventory',
    label: 'Envanter',
    icon: 'Briefcase',
    group: 'Karakter & Eşya',
    submenus: [
      { id: 'all', label: 'TÜM ENVANTER' },
    ],
  },
  {
    id: 'chat',
    label: 'İletişim',
    icon: 'MessageSquare',
    group: 'Topluluk & İletişim',
    submenus: [
      { id: 'general', label: 'Genel Sohbet' },
      { id: 'kingdom', label: 'Krallık Sohbeti' },
      { id: 'guild', label: 'Lonca Sohbeti' },
      { id: 'party', label: 'Grup Sohbeti' },
      { id: 'system', label: 'Sistem Duyuruları' },
    ],
  },
  {
    id: 'quests',
    label: 'Görev',
    icon: 'Compass',
    group: 'Savaş & Macera',
    submenus: [
      { id: 'daily', label: 'Günlük Görevler' },
      { id: 'weekly', label: 'Haftalık Görevler' },
      { id: 'badges', label: 'Rozet Görevleri' },
    ],
  },
  {
    id: 'party',
    label: 'Grup',
    icon: 'Users',
    group: 'Topluluk & İletişim',
    submenus: [
      { id: 'my_party', label: 'Grubum' },
      { id: 'group_dungeons', label: 'Grup Zindanları' },
      { id: 'group_mining', label: 'Beraber Maden' },
      { id: 'find', label: 'Grup Bul' },
      { id: 'create', label: 'Grup Kur' },
    ],
  },
  {
    id: 'guild',
    label: 'Lonca',
    icon: 'Shield',
    group: 'Topluluk & İletişim',
    submenus: [
      { id: 'find', label: 'Lonca Bul' },
      { id: 'create', label: 'Lonca Kur' },
      { id: 'my_guild', label: 'Loncam' },
    ],
  },
  {
    id: 'dungeon',
    label: 'Zindan',
    icon: 'Skull',
    group: 'Savaş & Macera',
    submenus: [
      { id: 'solo', label: 'Tek Kişilik Zindan' },
    ],
  },
  {
    id: 'mine',
    label: 'Maden',
    icon: 'Pickaxe',
    group: 'Savaş & Macera',
    submenus: [
      { id: 'quarry', label: 'Maden Ocağı' },
    ],
  },
  {
    id: 'boss',
    label: 'Boss',
    icon: 'Flame',
    group: 'Savaş & Macera',
    submenus: [
      { id: 'solo', label: 'Tek Kişilik Boss' },
      { id: 'group', label: 'Grup Boss' },
      { id: 'world', label: 'Dünya Bossu' },
    ],
  },
  {
    id: 'kingdom',
    label: 'Krallık',
    icon: 'Castle',
    group: 'Topluluk & İletişim',
    submenus: [
      { id: 'info', label: '4 Krallık Bilgileri' },
      { id: 'players', label: 'Oyuncu Listesi' },
      { id: 'online', label: 'Online Oyuncu Listesi' },
    ],
  },
  {
    id: 'npc',
    label: 'NPC',
    icon: 'Store',
    group: 'Pazar & Zanaat',
    submenus: [
      { id: 'market', label: 'MARKET' },
      { id: 'blacksmith', label: 'DEMİRCİ' },
      { id: 'gem_expert', label: 'DEĞERLİ TAŞ UZMANI' },
      { id: 'talisman', label: 'TILSIMCI' },
      { id: 'armorer', label: 'ZIRHÇI' },
      { id: 'weaponsmith', label: 'SİLAHÇI' },
      { id: 'alchemist', label: 'ŞEBNEM USTASI' },
    ],
  },
  {
    id: 'market',
    label: 'Pazar',
    icon: 'ShoppingBag',
    group: 'Pazar & Zanaat',
    submenus: [
      { id: 'browse', label: 'Pazar Alanı' },
      { id: 'my_stall', label: 'Pazar Kur / Tezgahım' },
      { id: 'history', label: 'Piyasa Geçmişi' },
    ],
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    icon: 'Settings',
    group: 'Sistem',
    submenus: [
      { id: 'general', label: 'GENEL AYARLAR' },
      { id: 'account', label: 'HESAP AYARLARI' },
      { id: 'sound', label: 'SES AYARLARI' },
    ],
  },
];

// Mobil Alt Çubuk için 5 Hızlı Erişim Menüsü
export const MOBILE_PRIMARY_TABS = [
  { id: 'character', label: 'Karakter', icon: 'User' },
  { id: 'quests', label: 'Görev', icon: 'Compass' },
  { id: 'dungeon', label: 'Zindan', icon: 'Skull' },
  { id: 'market', label: 'Pazar', icon: 'ShoppingBag' },
  { id: 'all_menus', label: 'Menü ☰', icon: 'Grid' },
];
