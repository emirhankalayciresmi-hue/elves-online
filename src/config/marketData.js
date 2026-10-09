// src/config/marketData.js
// Pazar Sistemi: 20 Slotluk Tezgahlar, Piyasa Satış Geçmişi, Referans Fiyatlar ve Depolama Yardımcıları

export const MARKET_STALLS_STORAGE_KEY = 'elves_rpg_market_stalls';
export const MARKET_HISTORY_STORAGE_KEY = 'elves_rpg_market_history';
export const PLAYER_STALL_STORAGE_KEY = 'elves_rpg_player_stall';

export const MAX_STALL_SLOTS = 20; // Kullanıcının istediği gibi tam 20 slot
export const MARKET_TAX_PERCENT = 3; // %3 Pazar Vergisi

// Başlangıç Piyasa Satış Geçmişi (Referans & Son Satış Fiyatları)
export const DEFAULT_MARKET_HISTORY = [
  {
    id: 'hist_1',
    itemName: 'Kanlı Çelik Muhafızı Kılıcı',
    price: 15000,
    seller: 'Elrond_99',
    buyer: 'Aragorn_Elven',
    soldAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 saat önce
    image: '/assets/items/warrior_weapon.svg',
    category: 'Silah',
  },
  {
    id: 'hist_2',
    itemName: 'Gölge Pençesi Pelerini',
    price: 4200,
    seller: 'ForestWalker',
    buyer: 'Legolas_Green',
    soldAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 saat önce
    image: '/assets/items/ninja_cloak.svg',
    category: 'Pelerin',
  },
  {
    id: 'hist_3',
    itemName: 'Arcane Yıldızı Yüzüğü',
    price: 8000,
    seller: 'NightShadow',
    buyer: 'Arwen_Star',
    soldAt: new Date(Date.now() - 3600000 * 7).toISOString(), // 7 saat önce
    image: '/assets/items/mage_ring1.svg',
    category: 'Yüzük',
  },
  {
    id: 'hist_4',
    itemName: 'Kanlı Çelik Muhafızı Miğferi',
    price: 3800,
    seller: 'NobleElf',
    buyer: 'SunKnight',
    soldAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 saat önce
    image: '/assets/items/warrior_helmet.svg',
    category: 'Miğfer',
  },
  {
    id: 'hist_5',
    itemName: 'Kanlı Çelik Muhafızı Zırhı',
    price: 18500,
    seller: 'IronShield',
    buyer: 'Vaelin_Oak',
    soldAt: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 saat önce
    image: '/assets/items/warrior_armor.svg',
    category: 'Zırh',
  },
  {
    id: 'hist_6',
    itemName: 'Gölge Pençesi Hançeri',
    price: 13500,
    seller: 'NightBlade',
    buyer: 'Sylv_Hunter',
    soldAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 gün önce
    image: '/assets/items/ninja_weapon.svg',
    category: 'Silah',
  },
  {
    id: 'hist_7',
    itemName: 'Arcane Yıldızı Asası',
    price: 16000,
    seller: 'Aeliana_Sun',
    buyer: 'Mithrandir_Glow',
    soldAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    image: '/assets/items/mage_weapon.svg',
    category: 'Silah',
  },
  {
    id: 'hist_8',
    itemName: 'Gölge Pençesi Zırhı',
    price: 9200,
    seller: 'ShadowDancer',
    buyer: 'Kaelen_Shadow',
    soldAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    image: '/assets/items/ninja_armor.svg',
    category: 'Zırh',
  },
];

// Diğer Oyuncuların Canlı Pazar Tezgahları (Pazar Alanı)
export const DEFAULT_MARKET_STALLS = [
  {
    id: 'stall_elrond',
    sellerName: 'Elrond_99',
    kingdom: 'Aeltherin Krallığı',
    stallTitle: 'Kadim Savaşçı & Efsunlu Çelik Pazarı',
    motto: 'En sağlam kılıçlar ve miğferler burada!',
    isOpen: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      {
        id: 'stall_item_1',
        slotIndex: 0,
        price: 15000,
        listedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        offers: [
          { buyerName: 'Sylv_Hunter', offerAmount: 13500, createdAt: new Date(Date.now() - 1800000).toISOString() }
        ],
        item: {
          id: 'warrior_weapon_1',
          name: 'Kanlı Çelik Muhafızı Kılıcı (+7)',
          slot: 'weapon',
          slotName: 'Silah',
          className: 'Savaşçı',
          levelMin: 5,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/warrior_weapon.svg',
          desc: 'Kanlı çelikle dövülmüş, hedefine ağır darbeler indiren keskin çift elli kılıç.',
          stats: { attack: '+140', crit: '+%8' },
        },
      },
      {
        id: 'stall_item_2',
        slotIndex: 1,
        price: 4500,
        listedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        offers: [],
        item: {
          id: 'warrior_helmet_1',
          name: 'Kanlı Çelik Muhafızı Miğferi',
          slot: 'helmet',
          slotName: 'Miğfer',
          className: 'Savaşçı',
          levelMin: 1,
          levelMax: 10,
          rarity: 'Yaygın',
          image: '/assets/items/warrior_helmet.svg',
          desc: 'Yakut rünlerle mühürlenmiş kadim muhafız miğferi.',
          stats: { defense: '+45', hp: '+350' },
        },
      },
      {
        id: 'stall_item_3',
        slotIndex: 2,
        price: 7200,
        listedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        offers: [],
        item: {
          id: 'warrior_offhand_1',
          name: 'Kanlı Çelik Muhafızı Kalkanı',
          slot: 'offhand',
          slotName: 'Kalkan',
          className: 'Savaşçı',
          levelMin: 3,
          levelMax: 10,
          rarity: 'Efsanevi',
          image: '/assets/items/warrior_offhand.svg',
          desc: 'Ağır düşman hücumlarını savuşturan çelik kalkan.',
          stats: { defense: '+80', block: '+%12' },
        },
      },
      {
        id: 'stall_item_4',
        slotIndex: 3,
        price: 3200,
        listedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        offers: [],
        item: {
          id: 'warrior_belt_1',
          name: 'Kanlı Çelik Muhafızı Kemeri',
          slot: 'belt',
          slotName: 'Kemer',
          className: 'Savaşçı',
          levelMin: 1,
          levelMax: 10,
          rarity: 'Yaygın',
          image: '/assets/items/warrior_belt.svg',
          desc: 'Bel desteği sağlayan sağlam çelik kemer.',
          stats: { hp: '+250' },
        },
      },
      {
        id: 'stall_item_5',
        slotIndex: 4,
        price: 19500,
        listedAt: new Date(Date.now() - 1800000).toISOString(),
        offers: [],
        item: {
          id: 'warrior_armor_1',
          name: 'Kanlı Çelik Muhafızı Zırhı (+8)',
          slot: 'armor',
          slotName: 'Zırh',
          className: 'Savaşçı',
          levelMin: 5,
          levelMax: 10,
          rarity: 'Efsanevi',
          image: '/assets/items/warrior_armor.svg',
          desc: 'Kadim ateş ocaklarında dövülmüş devasa göğüs zırhı.',
          stats: { defense: '+165', hp: '+1200' },
        },
      },
      {
        id: 'stall_item_6',
        slotIndex: 5,
        price: 2800,
        listedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        offers: [],
        item: {
          id: 'warrior_ring1_1',
          name: 'Kanlı Çelik Muhafızı Yüzüğü',
          slot: 'ring1',
          slotName: 'Yüzük',
          className: 'Savaşçı',
          levelMin: 1,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/warrior_ring1.svg',
          desc: 'Güç katan yakut kakmalı yüzük.',
          stats: { attack: '+35', strength: '+8' },
        },
      },
    ],
  },
  {
    id: 'stall_forest',
    sellerName: 'ForestWalker',
    kingdom: 'Sylvandar Krallığı',
    stallTitle: 'Sylvandar Orman Avcısı & Ninja Zulası',
    motto: 'Gölge elfleri için en hafif ve ölümcül ekipmanlar.',
    isOpen: true,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    items: [
      {
        id: 'stall_item_7',
        slotIndex: 0,
        price: 14000,
        listedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        offers: [
          { buyerName: 'Kaelen_Shadow', offerAmount: 12500, createdAt: new Date(Date.now() - 3600000).toISOString() }
        ],
        item: {
          id: 'ninja_weapon_1',
          name: 'Gölge Pençesi Hançeri (+6)',
          slot: 'weapon',
          slotName: 'Silah',
          className: 'Ninja',
          levelMin: 4,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/ninja_weapon.svg',
          desc: 'Zehirli zümrütle bilenmiş çift ölümcül suikast hançeri.',
          stats: { attack: '+115', speed: '+%14' },
        },
      },
      {
        id: 'stall_item_8',
        slotIndex: 1,
        price: 4200,
        listedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        offers: [],
        item: {
          id: 'ninja_cloak_1',
          name: 'Gölge Pençesi Pelerini',
          slot: 'cloak',
          slotName: 'Pelerin',
          className: 'Ninja',
          levelMin: 1,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/ninja_cloak.svg',
          desc: 'Gecenin karanlığına karıştıran ipek pelerin.',
          stats: { evasion: '+%10', speed: '+%5' },
        },
      },
      {
        id: 'stall_item_9',
        slotIndex: 2,
        price: 5100,
        listedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        offers: [],
        item: {
          id: 'ninja_boots_1',
          name: 'Gölge Pençesi Çizmeleri',
          slot: 'boots',
          slotName: 'Çizme',
          className: 'Ninja',
          levelMin: 2,
          levelMax: 10,
          rarity: 'Yaygın',
          image: '/assets/items/ninja_boots.svg',
          desc: 'Sessiz adımlar için kadife kaplı deri çizmeler.',
          stats: { speed: '+%12', defense: '+30' },
        },
      },
      {
        id: 'stall_item_10',
        slotIndex: 3,
        price: 8900,
        listedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        offers: [],
        item: {
          id: 'ninja_armor_1',
          name: 'Gölge Pençesi Zırhı',
          slot: 'armor',
          slotName: 'Zırh',
          className: 'Ninja',
          levelMin: 3,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/ninja_armor.svg',
          desc: 'Esnek zümrüt derisiyle işlenmiş hafif gövde zırhı.',
          stats: { defense: '+95', evasion: '+%8' },
        },
      },
    ],
  },
  {
    id: 'stall_aeliana',
    sellerName: 'Aeliana_Sun',
    kingdom: 'Lorvathiel Krallığı',
    stallTitle: 'Kadim Arcane Büyü & Kozmik Kristaller',
    motto: 'Büyücüler için saf mana ve element güçleri.',
    isOpen: true,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    items: [
      {
        id: 'stall_item_11',
        slotIndex: 0,
        price: 16500,
        listedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        offers: [],
        item: {
          id: 'mage_weapon_1',
          name: 'Arcane Yıldızı Asası (+7)',
          slot: 'weapon',
          slotName: 'Silah',
          className: 'Büyücü',
          levelMin: 5,
          levelMax: 10,
          rarity: 'Efsanevi',
          image: '/assets/items/mage_weapon.svg',
          desc: 'Uç noktasında saf safir kristali parıldayan kadim büyü asası.',
          stats: { magicAttack: '+175', mana: '+450' },
        },
      },
      {
        id: 'stall_item_12',
        slotIndex: 1,
        price: 8000,
        listedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
        offers: [],
        item: {
          id: 'mage_ring1_1',
          name: 'Arcane Yıldızı Yüzüğü',
          slot: 'ring1',
          slotName: 'Yüzük',
          className: 'Büyücü',
          levelMin: 1,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/mage_ring1.svg',
          desc: 'Mana dolum hızını artıran parlak safir yüzük.',
          stats: { magicPower: '+25', manaRegen: '+%15' },
        },
      },
      {
        id: 'stall_item_13',
        slotIndex: 2,
        price: 11000,
        listedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        offers: [],
        item: {
          id: 'mage_wings_1',
          name: 'Arcane Yıldızı Kanatları',
          slot: 'wings',
          slotName: 'Kanat',
          className: 'Büyücü',
          levelMin: 5,
          levelMax: 10,
          rarity: 'Efsanevi',
          image: '/assets/items/mage_wings.svg',
          desc: 'Kozmik rünlerle örülü safir ışıltılı astral kanatlar.',
          stats: { magicAttack: '+60', flySpeed: '+%20' },
        },
      },
      {
        id: 'stall_item_14',
        slotIndex: 3,
        price: 5400,
        listedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        offers: [],
        item: {
          id: 'mage_gloves_1',
          name: 'Arcane Yıldızı Eldivenleri',
          slot: 'gloves',
          slotName: 'Eldiven',
          className: 'Büyücü',
          levelMin: 2,
          levelMax: 10,
          rarity: 'Yaygın',
          image: '/assets/items/mage_gloves.svg',
          desc: 'Büyü hazırlık süresini kısaltan ipek eldivenler.',
          stats: { castSpeed: '+%12', magicAttack: '+25' },
        },
      },
      {
        id: 'stall_item_15',
        slotIndex: 4,
        price: 6800,
        listedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        offers: [],
        item: {
          id: 'mage_offhand_1',
          name: 'Arcane Yıldızı Grimoire',
          slot: 'offhand',
          slotName: 'Büyü Kitabı',
          className: 'Büyücü',
          levelMin: 3,
          levelMax: 10,
          rarity: 'Nadir',
          image: '/assets/items/mage_offhand.svg',
          desc: 'Kadim büyü sözlerini barındıran tılsımlı parşömen kitabı.',
          stats: { magicCrit: '+%10', mana: '+300' },
        },
      },
    ],
  },
];

// Depolama Yardımcıları
export function loadMarketStalls() {
  try {
    const raw = localStorage.getItem(MARKET_STALLS_STORAGE_KEY);
    if (!raw) return DEFAULT_MARKET_STALLS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MARKET_STALLS;
  } catch (e) {
    console.error('Market stalls load error:', e);
    return DEFAULT_MARKET_STALLS;
  }
}

export function saveMarketStalls(stalls) {
  try {
    localStorage.setItem(MARKET_STALLS_STORAGE_KEY, JSON.stringify(stalls));
  } catch (e) {
    console.error('Market stalls save error:', e);
  }
}

export function loadMarketHistory() {
  try {
    const raw = localStorage.getItem(MARKET_HISTORY_STORAGE_KEY);
    if (!raw) return DEFAULT_MARKET_HISTORY;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MARKET_HISTORY;
  } catch (e) {
    console.error('Market history load error:', e);
    return DEFAULT_MARKET_HISTORY;
  }
}

export function saveMarketHistory(history) {
  try {
    localStorage.setItem(MARKET_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Market history save error:', e);
  }
}

// Oyuncunun Kendi Pazar Tezgahını Yükleme / Kaydetme
export function loadPlayerStall(playerName) {
  try {
    const raw = localStorage.getItem(PLAYER_STALL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch (e) {
    console.error('Player stall load error:', e);
  }

  // Varsayılan boş tezgah (20 Slot)
  return {
    id: 'player_stall_' + Date.now(),
    sellerName: playerName || 'Kadim Tüccar',
    stallTitle: `${playerName || 'Kahraman'}'ın Pazar Yeri`,
    motto: 'Pazarlık payı vardır, tekliflere açığım!',
    isOpen: true,
    createdAt: new Date().toISOString(),
    items: [], // max 20 items
  };
}

export function savePlayerStall(stall) {
  try {
    localStorage.setItem(PLAYER_STALL_STORAGE_KEY, JSON.stringify(stall));
  } catch (e) {
    console.error('Player stall save error:', e);
  }
}

// Bir eşya için piyasadaki en son satış fiyatını (benchmark) bulma
export function getLatestBenchmarkPrice(itemName, historyList = null) {
  if (!itemName) return null;
  const history = historyList || loadMarketHistory();
  const cleanTargetName = itemName.replace(/\s*\(\+\d+\)\s*/g, '').trim().toLowerCase();

  const matched = history.find((record) => {
    const cleanRecordName = record.itemName.replace(/\s*\(\+\d+\)\s*/g, '').trim().toLowerCase();
    return cleanRecordName === cleanTargetName || record.itemName.toLowerCase() === itemName.toLowerCase();
  });

  return matched || null;
}
