// src/config/partyData.js
// Grup (Takım) Sistemi: Sefer Hedefleri, Dağıtım Modları, Metin2 Tarzı Liderlik Rolleri ve Başlangıç Grupları

export const PARTY_STORAGE_KEY = 'elves_rpg_parties_data';

// Grup Sefer Hedefleri
export const PARTY_TARGETS = [
  {
    id: 'dungeon',
    name: 'Kadim Zindan Seferi',
    category: 'Zindan',
    icon: 'Skull',
    description: 'Kadim elf harabelerinin derinliklerini keşfedin.',
    recommendedLevel: 5,
  },
  {
    id: 'group_dungeon',
    name: 'Grup Zindanı (Tapınak Mahzeni)',
    category: 'Zindan',
    icon: 'ShieldAlert',
    description: 'Yalnızca organize grupların aşabileceği tehlikeli tuzaklar ve elit muhafızlar.',
    recommendedLevel: 10,
  },
  {
    id: 'boss',
    name: 'Kadim Boss Avı',
    category: 'Boss',
    icon: 'Flame',
    description: 'Dünya bosslarına ve dev canavarlara karşı ortak akın düzenleyin.',
    recommendedLevel: 8,
  },
  {
    id: 'caravan',
    name: 'Kervan Muhafızlığı',
    category: 'Kervan',
    icon: 'Truck',
    description: 'Krallıklar arası kervan yolunu haydutlardan ve gölge yaratıklarından koruyun.',
    recommendedLevel: 6,
  },
  {
    id: 'mine',
    name: 'Kristal Maden Seferi',
    category: 'Maden',
    icon: 'Pickaxe',
    description: 'Derin kristal damarlarını kazarken madencileri koruyun.',
    recommendedLevel: 3,
  },
  {
    id: 'open_world',
    name: 'Serbest Macera & Canavar Avı',
    category: 'Genel',
    icon: 'Compass',
    description: 'Açık dünyada harita boyunca seviye kasma ve canavar avlama.',
    recommendedLevel: 1,
  },
];

// EXP & Eşya Dağıtım Modları
export const PARTY_DISTRIBUTION_MODES = [
  {
    id: 'equal',
    name: 'Eşit Paylaşım',
    description: 'Kazanılan EXP ve altın tüm üyeler arasında eşit olarak paylaştırılır.',
  },
  {
    id: 'level_based',
    name: 'Seviyeye Göre Paylaşım',
    description: 'Düşük seviyeli oyuncular daha fazla tecrübe puanı alarak hızlıca seviye atlar.',
  },
  {
    id: 'leader_first',
    name: 'Lidere Öncelikli',
    description: 'Nadir düşen eşyalar ve ganimetler doğrudan grup liderinin envanterine gider.',
  },
];

// Metin2 Tarzı Liderlik Rolleri (Party Leadership Roles)
export const LEADERSHIP_ROLES = [
  {
    id: 'attacker',
    name: 'Saldırı Değeri Artırıcı',
    shortName: 'Saldırı',
    icon: 'Swords',
    color: '#ef4444',
    bg: 'bg-red-950/70',
    border: 'border-red-500/40',
    bonusText: '+150 Saldırı Gücü',
    description: 'Ön saf savaşçısına yıkıcı saldırı kudreti aşılar.',
  },
  {
    id: 'defender',
    name: 'Savunma Artırıcı',
    shortName: 'Savunma',
    icon: 'Shield',
    color: '#3b82f6',
    bg: 'bg-blue-950/70',
    border: 'border-blue-500/40',
    bonusText: '+120 Savunma',
    description: 'Zırh direncini artırarak gelen hasarı önemli ölçüde azaltır.',
  },
  {
    id: 'tank_hp',
    name: 'Maksimum HP Artırıcı',
    shortName: 'Maks HP',
    icon: 'Heart',
    color: '#10b981',
    bg: 'bg-emerald-950/70',
    border: 'border-emerald-500/40',
    bonusText: '+1,500 Maksimum HP',
    description: 'Kadim yaşam kaynağıyla azami can barını genişletir.',
  },
  {
    id: 'speed_caster',
    name: 'Büyü Hızı & Kritik',
    shortName: 'Büyü Hızı',
    icon: 'Zap',
    color: '#c084fc',
    bg: 'bg-purple-950/70',
    border: 'border-purple-500/40',
    bonusText: '+%15 Büyü Hızı & +%10 Kritik',
    description: 'Zihinsel odaklanma sağlayarak yetenek dolumunu hızlandırır.',
  },
  {
    id: 'blocker',
    name: 'Yakın Dövüş Bloklama',
    shortName: 'Bloklama',
    icon: 'Sparkles',
    color: '#f59e0b',
    bg: 'bg-amber-950/70',
    border: 'border-amber-500/40',
    bonusText: '+%12 Bloklama Şansı',
    description: 'Fiziksel yakın darbeleri savuşturma olasılığı kazandırır.',
  },
];

// Takım Kişi Sayısına Göre Pasif Sinerji Buffları
export function getPartySynergyBonus(memberCount = 1) {
  if (memberCount <= 1) {
    return {
      expMultiplier: 1.0,
      goldMultiplier: 1.0,
      attackBonus: 0,
      defenseBonus: 0,
      title: 'Yalnız Kurt',
      badge: 'Solo',
      description: 'Grup bonusu aktif değil.',
    };
  }
  if (memberCount === 2) {
    return {
      expMultiplier: 1.05,
      goldMultiplier: 1.03,
      attackBonus: 20,
      defenseBonus: 10,
      title: 'İkili İttifak',
      badge: '+%5 EXP / +%3 Altın',
      description: '2 Kişilik grup: Ortak tecrübe ve altın kazanımı bonusu.',
    };
  }
  if (memberCount === 3) {
    return {
      expMultiplier: 1.10,
      goldMultiplier: 1.06,
      attackBonus: 40,
      defenseBonus: 25,
      title: 'Üçlü Birlik',
      badge: '+%10 EXP / +%6 Altın',
      description: '3 Kişilik grup: Güçlendirilmiş akın bonusu.',
    };
  }
  // 4 veya daha fazla
  return {
    expMultiplier: 1.15,
    goldMultiplier: 1.10,
    attackBonus: 75,
    defenseBonus: 50,
    title: 'Tam Teşekküllü Akın',
    badge: '+%15 EXP / +%10 Altın / +75 Saldırı',
    description: '4+ Kişilik tam grup: Maksimum birlik kudreti aktif!',
  };
}

// Varsayılan Dünya Grupları (Oyuncuların kurduğu gerçek gruplar tutulur)
export const DEFAULT_PARTIES = [];

export function loadPartiesFromStorage() {
  try {
    const raw = localStorage.getItem(PARTY_STORAGE_KEY);
    if (!raw) return DEFAULT_PARTIES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PARTIES;

    // Eski demo sahte grupları (party_1, party_2 vb.) temizle:
    const isOldDemo = parsed.some(
      (p) => p.id === 'party_1' || p.leader === 'Aeliana_Sun' || p.leader === 'Kaelen_Shadow' || p.leader === 'Thalorien'
    );
    if (isOldDemo) {
      localStorage.removeItem(PARTY_STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (e) {
    console.error('Parties load error:', e);
    return DEFAULT_PARTIES;
  }
}

export function savePartiesToStorage(parties) {
  try {
    localStorage.setItem(PARTY_STORAGE_KEY, JSON.stringify(parties));
  } catch (e) {
    console.error('Parties save error:', e);
  }
}

// ==========================================
// GRUP ZİNDANLARI (Zindandan Taşınan ve Genişletilen Ortak Seferler)
// ==========================================
export const GROUP_DUNGEONS = [
  {
    id: 'grp_dungeon_shadow',
    name: 'Gölge Lordunun İni',
    levelReq: 5,
    minMembers: 2,
    maxMembers: 4,
    durationSeconds: 20,
    expReward: 14000,
    goldReward: 8500,
    crystalReward: 15,
    rareDrop: 'Gölge Rünü',
    image: '/assets/classes/assassin.png',
    desc: 'Gölge suikastçılarının gizli tapınağı. Koordineli saldırılarla gölge efendisini dize getirin.',
    roleHints: '1 Tank, 1 Hasarcı önerilir.',
  },
  {
    id: 'grp_dungeon_dragon',
    name: 'Kadim Ejderha Tepesi',
    levelReq: 20,
    minMembers: 2,
    maxMembers: 4,
    durationSeconds: 30,
    expReward: 32000,
    goldReward: 18000,
    crystalReward: 30,
    rareDrop: 'Ejderha Pulu',
    image: '/assets/classes/warrior.png',
    desc: '4 kişilik grup ile ejderha yuvasına ortak akın düzenleyin. Yıkıcı alev nefeslerine karşı kalkan oluşturun.',
    roleHints: '1 Tank, 1 Büyücü, 2 Hasarcı önerilir.',
  },
  {
    id: 'grp_dungeon_crystal_temple',
    name: 'Lanetli Kristal Tapınağı',
    levelReq: 40,
    minMembers: 3,
    maxMembers: 4,
    durationSeconds: 45,
    expReward: 65000,
    goldReward: 42000,
    crystalReward: 60,
    rareDrop: 'Kadim Kristal Yüzük',
    image: '/assets/classes/mage.png',
    desc: 'Kristal titanı ve kadim gardiyanlarını alt etmek için grup çalışması gerekir.',
    roleHints: 'Dengeli sınıf dağılımı şarttır.',
  },
  {
    id: 'grp_dungeon_titan',
    name: 'Kadim Titan Mahzeni',
    levelReq: 60,
    minMembers: 4,
    maxMembers: 4,
    durationSeconds: 60,
    expReward: 135000,
    goldReward: 85000,
    crystalReward: 120,
    rareDrop: 'Titan Çekirdeği',
    image: '/assets/kingdoms/aeltherin_flag.jpg',
    desc: 'Kadim çağlardan kalma devasa titan muhafızları derin uykularından uyandı.',
    roleHints: 'Liderlik rolleri (Saldırı, Savunma, Maks HP) atanmalıdır.',
  },
];

// ==========================================
// BERABER MADEN KAZMA (Grup Ortak Madencilik Seferleri)
// ==========================================
export const GROUP_MINES = [
  {
    id: 'grp_mine_emerald',
    name: 'Derin Zümrüt Damarı Ortak Kazısı',
    levelReq: 3,
    minMembers: 2,
    durationSeconds: 20,
    expReward: 12000,
    goldReward: 9000,
    crystalReward: 20,
    oreYield: '4-8 Adet Kadim Zümrüt',
    rarity: 'Nadir Damar',
    desc: 'Birlikte kazarak köklerin arasındaki derin zümrüt cevherlerini gün yüzüne çıkarın. Sinerji ile +%25 ek verim!',
  },
  {
    id: 'grp_mine_mithril',
    name: 'Kadim Mithril & Aytaşı Seferi',
    levelReq: 15,
    minMembers: 2,
    durationSeconds: 30,
    expReward: 25000,
    goldReward: 19000,
    crystalReward: 45,
    oreYield: '6-12 Adet Mithril Külçesi & Aytaşı',
    rarity: 'Epik Damar',
    desc: 'Gümüş dağların en derin katmanlarında devasa bir mithril damarı. İttifakla kazıldığında verim katlanır.',
  },
  {
    id: 'grp_mine_volcanic',
    name: 'Volkanik Kristal & Elmas Seferi',
    levelReq: 35,
    minMembers: 3,
    durationSeconds: 45,
    expReward: 55000,
    goldReward: 42000,
    crystalReward: 90,
    oreYield: '8-16 Adet Ateş Kristali & Ham Elmas',
    rarity: 'Efsanevi Damar',
    desc: 'Yüksek sıcaklık ve tehlikeli magma kanallarından koruyucu birlik ile elmas ve kristal çıkarın.',
  },
];
