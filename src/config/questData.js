// Kadim Elfler - 200+ Günlük, 100+ Haftalık ve Kademeli Rozet Görevleri Veritabanı
// Kurallar:
// - Günlük: Seviyeye göre kolay, orta, zor, çok zor (200+ görev havuzu). Oyuncuya 5 adet sunulur, 5'i bitmeden yenisi gelmez.
// - Haftalık: 20 adet sabit sunulur (100+ haftalık görev havuzu).
// - Rozetler: Kademeli artış (örn: 20 -> 40 -> 80 -> 160) ve kalıcı stat bonusları.
// - Otomatik tamamlama ve otomatik ödül toplama.

// ==========================================
// 1. ROZET GÖREVLERİ (KADEMELİ ARTIŞ)
// ==========================================
export const BADGE_DEFINITIONS = [
  {
    id: 'badge_solo_boss',
    name: 'Yalnız Avcı (Tek Kişilik Boss Celladı)',
    category: 'boss',
    targetType: 'boss_solo',
    icon: 'Skull',
    desc: 'Tek kişilik 6 saatlik kadim bossları yok et.',
    tiers: [
      { tier: 1, name: 'Bronz Çırak', target: 10, rewardGold: 25000, rewardExp: 0, rewardCrystals: 50, statBonus: { strength: 2 }, statDesc: '+2 Güç (STR)' },
      { tier: 2, name: 'Gümüş Avcı', target: 25, rewardGold: 60000, rewardExp: 0, rewardCrystals: 100, statBonus: { strength: 5 }, statDesc: '+5 Güç (STR)' },
      { tier: 3, name: 'Altın Cellat', target: 50, rewardGold: 150000, rewardExp: 0, rewardCrystals: 200, statBonus: { strength: 10, criticalChance: 1.5 }, statDesc: '+10 Güç, +%1.5 Kritik' },
      { tier: 4, name: 'Elmas Hükümdar', target: 100, rewardGold: 400000, rewardExp: 0, rewardCrystals: 400, statBonus: { strength: 20, criticalChance: 3.0 }, statDesc: '+20 Güç, +%3.0 Kritik' },
      { tier: 5, name: 'Ebedi Katil', target: 200, rewardGold: 1000000, rewardExp: 0, rewardCrystals: 1000, statBonus: { strength: 40, criticalChance: 5.0 }, statDesc: '+40 Güç, +%5.0 Kritik' },
    ],
  },
  {
    id: 'badge_party_boss',
    name: 'Grup Savaşçısı (Grup Bossları Fatihi)',
    category: 'boss',
    targetType: 'boss_party',
    icon: 'Users',
    desc: 'Büyük grup bosslarına karşı ittifakınla zafer kazan.',
    tiers: [
      { tier: 1, name: 'Birlik Neferi', target: 10, rewardGold: 30000, rewardExp: 0, rewardCrystals: 60, statBonus: { agility: 2 }, statDesc: '+2 Çeviklik (AGI)' },
      { tier: 2, name: 'Kalkan Ustası', target: 25, rewardGold: 75000, rewardExp: 0, rewardCrystals: 120, statBonus: { agility: 5 }, statDesc: '+5 Çeviklik (AGI)' },
      { tier: 3, name: 'Yıkılmaz Kale', target: 50, rewardGold: 200000, rewardExp: 0, rewardCrystals: 250, statBonus: { agility: 10, armorPenetration: 2.0 }, statDesc: '+10 Çeviklik, +%2 Zırh Delme' },
      { tier: 4, name: 'Kadim Muhafız', target: 100, rewardGold: 500000, rewardExp: 0, rewardCrystals: 500, statBonus: { agility: 20, armorPenetration: 4.0 }, statDesc: '+20 Çeviklik, +%4 Zırh Delme' },
      { tier: 5, name: 'Ölümsüz Lejyoner', target: 200, rewardGold: 1200000, rewardExp: 0, rewardCrystals: 1200, statBonus: { agility: 40, armorPenetration: 7.0 }, statDesc: '+40 Çeviklik, +%7 Zırh Delme' },
    ],
  },
  {
    id: 'badge_world_boss',
    name: 'Kıyamet Kırıcı (Dünya Bossu Şampiyonu)',
    category: 'boss',
    targetType: 'boss_world',
    icon: 'Flame',
    desc: 'Tüm krallığı tehdit eden Dünya Bosslarına haddini bildir.',
    tiers: [
      { tier: 1, name: 'Dünya Koruyucusu I', target: 5, rewardGold: 50000, rewardExp: 0, rewardCrystals: 100, statBonus: { criticalChance: 1.0 }, statDesc: '+%1.0 Kritik Vuruş' },
      { tier: 2, name: 'Dünya Koruyucusu II', target: 15, rewardGold: 150000, rewardExp: 0, rewardCrystals: 250, statBonus: { criticalChance: 2.5, strength: 5 }, statDesc: '+%2.5 Kritik, +5 Güç' },
      { tier: 3, name: 'Dünya Koruyucusu III', target: 35, rewardGold: 400000, rewardExp: 0, rewardCrystals: 600, statBonus: { criticalChance: 4.5, strength: 15 }, statDesc: '+%4.5 Kritik, +15 Güç' },
      { tier: 4, name: 'Dünya Koruyucusu IV', target: 70, rewardGold: 1000000, rewardExp: 0, rewardCrystals: 1200, statBonus: { criticalChance: 7.0, strength: 30 }, statDesc: '+%7.0 Kritik, +30 Güç' },
      { tier: 5, name: 'Kozmik Efsane', target: 150, rewardGold: 2500000, rewardExp: 0, rewardCrystals: 3000, statBonus: { criticalChance: 10.0, strength: 50 }, statDesc: '+%10 Kritik, +50 Güç' },
    ],
  },
  {
    id: 'badge_dungeon_master',
    name: 'Zindan Fatihi (Derinliklerin Efendisi)',
    category: 'dungeon',
    targetType: 'dungeon_clear',
    icon: 'Shield',
    desc: 'Kadim zindanların derinliklerini temizle ve canavarları yok et.',
    tiers: [
      { tier: 1, name: 'Mağara Kaşifi', target: 10, rewardGold: 20000, rewardExp: 0, rewardCrystals: 40, statBonus: { stunChance: 1.0 }, statDesc: '+%1.0 Sersemletme Şansı' },
      { tier: 2, name: 'Karanlık Avcısı', target: 30, rewardGold: 60000, rewardExp: 0, rewardCrystals: 100, statBonus: { stunChance: 2.0, vsWarrior: 2.0 }, statDesc: '+%2.0 Sersemletme, +%2.0 Savaşçı Hasarı' },
      { tier: 3, name: 'Labirent Ustası', target: 70, rewardGold: 150000, rewardExp: 0, rewardCrystals: 220, statBonus: { stunChance: 3.5, vsWarrior: 4.0, vsNinja: 4.0 }, statDesc: '+%3.5 Sersemletme, +%4 Savaşçı & Ninja Hasarı' },
      { tier: 4, name: 'Zindan Lordu', target: 150, rewardGold: 350000, rewardExp: 0, rewardCrystals: 500, statBonus: { stunChance: 5.0, vsWarrior: 7.0, vsNinja: 7.0, vsMage: 7.0 }, statDesc: '+%5 Sersemletme, +%7 Tüm Sınıflara Karşı Güç' },
      { tier: 5, name: 'Ebedi Zindan Fatihi', target: 300, rewardGold: 1000000, rewardExp: 0, rewardCrystals: 1200, statBonus: { stunChance: 8.0, vsWarrior: 12.0, vsNinja: 12.0, vsMage: 12.0 }, statDesc: '+%8 Sersemletme, +%12 Tüm Sınıflara Karşı Güç' },
    ],
  },
  {
    id: 'badge_master_miner',
    name: 'Kadim Madenci (Elf Ocakları Üstadı)',
    category: 'mining',
    targetType: 'mine_clear',
    icon: 'Pickaxe',
    desc: '20 kadim maden ocağından elf cevherleri ve kutsal taşlar çıkar.',
    tiers: [
      { tier: 1, name: 'Çırak Madenci', target: 10, rewardGold: 20000, rewardExp: 0, rewardCrystals: 30, statBonus: { armorPenetration: 1.0 }, statDesc: '+%1.0 Zırh Delme Şansı' },
      { tier: 2, name: 'Damar Uzmanı', target: 25, rewardGold: 50000, rewardExp: 0, rewardCrystals: 80, statBonus: { armorPenetration: 2.5, agility: 4 }, statDesc: '+%2.5 Zırh Delme, +4 Çeviklik' },
      { tier: 3, name: 'Kristal Ustası', target: 60, rewardGold: 130000, rewardExp: 0, rewardCrystals: 180, statBonus: { armorPenetration: 4.5, agility: 8, strength: 8 }, statDesc: '+%4.5 Zırh Delme, +8 Çeviklik, +8 Güç' },
      { tier: 4, name: 'Cevher Hükümdarı', target: 120, rewardGold: 300000, rewardExp: 0, rewardCrystals: 400, statBonus: { armorPenetration: 7.0, agility: 18, strength: 18 }, statDesc: '+%7.0 Zırh Delme, +18 Çeviklik, +18 Güç' },
      { tier: 5, name: 'Toprağın Kalbi', target: 250, rewardGold: 800000, rewardExp: 0, rewardCrystals: 1000, statBonus: { armorPenetration: 10.0, agility: 35, strength: 35 }, statDesc: '+%10 Zırh Delme, +35 Çeviklik, +35 Güç' },
    ],
  },
  {
    id: 'badge_wealthy_merchant',
    name: 'Hazine Lordu (Altın Zengini)',
    category: 'economy',
    targetType: 'gold_earned',
    icon: 'Coins',
    desc: 'Görevlerden, zindanlardan ve madenlerden servet biriktir.',
    tiers: [
      { tier: 1, name: 'Tüccar', target: 100000, rewardGold: 20000, rewardExp: 0, rewardCrystals: 50, statBonus: { reflectChance: 1.0 }, statDesc: '+%1.0 Yansıtma Şansı' },
      { tier: 2, name: 'Zengin Baron', target: 500000, rewardGold: 60000, rewardExp: 0, rewardCrystals: 120, statBonus: { reflectChance: 2.5, agility: 3 }, statDesc: '+%2.5 Yansıtma, +3 Çeviklik' },
      { tier: 3, name: 'Krallık Hazinedarı', target: 2000000, rewardGold: 200000, rewardExp: 0, rewardCrystals: 300, statBonus: { reflectChance: 4.5, agility: 8 }, statDesc: '+%4.5 Yansıtma, +8 Çeviklik' },
      { tier: 4, name: 'Altın İmparatoru', target: 10000000, rewardGold: 600000, rewardExp: 0, rewardCrystals: 800, statBonus: { reflectChance: 7.0, agility: 18 }, statDesc: '+%7.0 Yansıtma, +18 Çeviklik' },
      { tier: 5, name: 'Ebedi Midas', target: 50000000, rewardGold: 2000000, rewardExp: 0, rewardCrystals: 2000, statBonus: { reflectChance: 10.0, agility: 35 }, statDesc: '+%10 Yansıtma, +35 Çeviklik' },
    ],
  },
];

// ==========================================
// 2. 200+ GÜNLÜK GÖREV ŞABLON VE LİSTESİ
// (Seviye 1-30 Kolay, 31-60 Orta, 61-80 Zor, 81-100 Çok Zor)
// ==========================================
const DAILY_QUEST_TEMPLATES = [
  // --- SEVİYE 1 - 30 (KOLAY DÜZEY - 60 ADET) ---
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'dungeon_clear', target: 1, title: 'Ormanın Fısıltısı', desc: '1 zindan seferini başarıyla tamamla.', expMin: 3000, expMax: 6000, goldMin: 2000, goldMax: 4000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'dungeon_clear', target: 2, title: 'Gölgelerle Savaş', desc: '2 zindan keşfini sonlandır.', expMin: 5000, expMax: 9000, goldMin: 3500, goldMax: 6500 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'mine_clear', target: 1, title: 'Ay Gümüşü Damarı', desc: 'Maden ocağında 1 kazı tamamla.', expMin: 2500, expMax: 5000, goldMin: 1800, goldMax: 3500 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'mine_clear', target: 2, title: 'Parlayan Kristaller', desc: '2 maden kazısını başarıyla bitir.', expMin: 4500, expMax: 8000, goldMin: 3000, goldMax: 6000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'boss_solo', target: 1, title: 'Gölge Ejderinin Peşinde', desc: '1 Tek Kişilik Boss yok et.', expMin: 6000, expMax: 11000, goldMin: 4500, goldMax: 8500 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'gold_earned', target: 5000, title: 'İlk Kazanç', desc: 'Zindan veya madenlerden en az 5,000 Altın topla.', expMin: 3000, expMax: 6000, goldMin: 2500, goldMax: 5000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'monster_kill', target: 10, title: 'Cüce ve Goblin Avı', desc: 'Zindanda 10 adet slot canavarı katlet.', expMin: 4000, expMax: 7000, goldMin: 3000, goldMax: 5500 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'monster_kill', target: 20, title: 'Ay Kurtlarını Durdur', desc: 'Zindanda 20 vahşi yaratık alt et.', expMin: 6000, expMax: 10000, goldMin: 4000, goldMax: 7500 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'boss_party', target: 1, title: 'Birlik Zaferi', desc: '1 Grup Bossunu müttefiklerinle ez.', expMin: 7000, expMax: 12000, goldMin: 5000, goldMax: 9000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Kolay', type: 'ore_sell', target: 1, title: 'Tüccarla Pazarlık', desc: 'Envanterinden 1 cevher satışı gerçekleştir.', expMin: 2000, expMax: 4000, goldMin: 2000, goldMax: 4000 },

  // --- SEVİYE 31 - 60 (ORTA DÜZEY - 60 ADET) ---
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'dungeon_clear', target: 2, title: 'Kadim Zümrüt Seferi', desc: 'Orta kademe zindanlardan 2 tanesini temizle.', expMin: 12000, expMax: 20000, goldMin: 8000, goldMax: 14000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'dungeon_clear', target: 3, title: 'Sis Perilerinin Peşinde', desc: '3 zindan akınını başarıyla bitir.', expMin: 18000, expMax: 28000, goldMin: 12000, goldMax: 20000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'mine_clear', target: 2, title: 'Zümrüt ve Kehribar Arayışı', desc: '2 maden ocağında kazı gerçekleştir.', expMin: 10000, expMax: 16000, goldMin: 7000, goldMax: 12000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'mine_clear', target: 3, title: 'Derin Kök Madenciliği', desc: '3 maden kazısını sonlandır.', expMin: 15000, expMax: 24000, goldMin: 10000, goldMax: 18000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'boss_solo', target: 2, title: 'Korkusuz Düellocu', desc: '2 Tek Kişilik Boss yok et.', expMin: 20000, expMax: 32000, goldMin: 14000, goldMax: 24000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'boss_party', target: 1, title: 'Alev Lordu İmtihanı', desc: '1 Grup Bossunu dize getir.', expMin: 18000, expMax: 28000, goldMin: 12000, goldMax: 20000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'boss_world', target: 1, title: 'Kadim Kraliçe Savunması', desc: '1 Dünya Bossu saldırısına karşı koy.', expMin: 30000, expMax: 50000, goldMin: 20000, goldMax: 35000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'gold_earned', target: 25000, title: 'Hazineye Hücum', desc: 'Günün sonunda 25,000 Altın kazan.', expMin: 14000, expMax: 22000, goldMin: 10000, goldMax: 16000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'monster_kill', target: 35, title: 'Karanlık Şövalyeler Katli', desc: 'Zindanda 35 yaratık yok et.', expMin: 16000, expMax: 26000, goldMin: 11000, goldMax: 18000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Orta', type: 'ore_sell', target: 2, title: 'Cevher Borsası', desc: '2 parça nadir elf madeni sat.', expMin: 10000, expMax: 15000, goldMin: 8000, goldMax: 14000 },

  // --- SEVİYE 61 - 80 (ZOR DÜZEY - 50 ADET) ---
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'dungeon_clear', target: 3, title: 'Buz ve Alev Sınavı', desc: 'İleri seviye 3 zindanı fethet.', expMin: 40000, expMax: 70000, goldMin: 25000, goldMax: 45000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'dungeon_clear', target: 4, title: 'Karanlık Gölgelerin Sonu', desc: '4 zindan akınını tamamla.', expMin: 60000, expMax: 95000, goldMin: 40000, goldMax: 65000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'mine_clear', target: 3, title: 'Yıldız Tozu Kazısı', desc: 'Zorlu damarlarda 3 maden kazısı yap.', expMin: 35000, expMax: 60000, goldMin: 22000, goldMax: 40000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'boss_solo', target: 3, title: 'Lanetli Kralların Sonu', desc: '3 Tek Kişilik Boss canavarını devir.', expMin: 55000, expMax: 90000, goldMin: 35000, goldMax: 60000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'boss_party', target: 2, title: 'Derin Deniz Korkusu', desc: '2 Grup Bossunu yok et.', expMin: 65000, expMax: 110000, goldMin: 45000, goldMax: 75000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'boss_world', target: 1, title: 'Yıldız Kıran Çarpışması', desc: '1 Dünya Bossu savaşını zaferle bitir.', expMin: 90000, expMax: 150000, goldMin: 60000, goldMax: 100000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'gold_earned', target: 80000, title: 'Soylu Hazinesi', desc: 'Günün boyunca 80,000 Altın kazan.', expMin: 45000, expMax: 75000, goldMin: 30000, goldMax: 50000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Zor', type: 'monster_kill', target: 50, title: 'Kadim Şeytanlar Kıyımı', desc: 'Zindanlarda 50 güçlü canavar alt et.', expMin: 50000, expMax: 85000, goldMin: 35000, goldMax: 60000 },

  // --- SEVİYE 81 - 100 (ÇOK ZOR / EFSANEVİ - 50 ADET) ---
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'dungeon_clear', target: 4, title: 'Kıyamet Mahzenleri', desc: 'Son kademe 4 ölümcül zindanı temizle.', expMin: 120000, expMax: 220000, goldMin: 80000, goldMax: 150000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'dungeon_clear', target: 5, title: 'Ebedi Gölgeler Arınması', desc: '5 zorlu zindanı dize getir.', expMin: 160000, expMax: 300000, goldMin: 110000, goldMax: 200000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'mine_clear', target: 4, title: 'Ebedi Orman Cevheri Kazısı', desc: 'Son kademe 4 maden ocağında kazı yap.', expMin: 100000, expMax: 180000, goldMin: 70000, goldMax: 130000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'boss_solo', target: 4, title: 'Ebedi Karanlığın Sonu', desc: '4 üst düzey Tek Kişilik Boss öldür.', expMin: 150000, expMax: 280000, goldMin: 100000, goldMax: 180000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'boss_party', target: 3, title: 'Ejderha Kralının Düşüşü', desc: '3 kudretli Grup Bossunu devir.', expMin: 200000, expMax: 380000, goldMin: 140000, goldMax: 260000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'boss_world', target: 2, title: 'Son Kıyamet Ejderi Avı', desc: '2 Dünya Bossunu dize getir.', expMin: 300000, expMax: 600000, goldMin: 200000, goldMax: 400000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'gold_earned', target: 250000, title: 'Krallık Şerefi', desc: 'Günün içinde 250,000 Altın topla.', expMin: 140000, expMax: 260000, goldMin: 90000, goldMax: 170000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Çok Zor', type: 'monster_kill', target: 80, title: 'Kıyamet Ordusu Katli', desc: 'Zindanda 80 ölümcül yaratık ez.', expMin: 170000, expMax: 320000, goldMin: 120000, goldMax: 220000 },
];

// 200+ Günlük Görev Üreten Motor (Zengin çeşitlilik ve isimler)
export function generateDailyQuestPool() {
  const pool = [];
  const prefixes = [
    'Kadim', 'Kutsal', 'Gölge', 'Ay Işığı', 'Yıldız', 'Sisli', 'Alevli',
    'Buzul', 'Zümrüt', 'Fırtına', 'Karanlık', 'Gümüş', 'Şafak', 'Ölümcül',
  ];
  const nouns = [
    'Muhafızı', 'Avcısı', 'Fatihi', 'İmtihanı', 'Sefere Çıkışı', 'Nöbeti',
    'Yemini', 'Kurtarışı', 'Hükmü', 'Duruşu', 'Zaferi', 'Yakarışı', 'Gazabı',
  ];

  let idCounter = 1;
  DAILY_QUEST_TEMPLATES.forEach((tmpl, tIdx) => {
    // Her temel şablondan farklı varyantlar üreterek 200+ zengin görev oluştur
    const variantsCount = 7;
    for (let v = 0; v < variantsCount; v++) {
      const p = prefixes[(tIdx * 3 + v) % prefixes.length];
      const n = nouns[(tIdx * 2 + v) % nouns.length];
      const title = `${p} ${tmpl.title.split(' ')[0]} ${n}`;

      // Ölçeklendirilmiş hedef ve ödül
      const targetScale = tmpl.type === 'gold_earned' || tmpl.type === 'monster_kill'
        ? Math.round(tmpl.target * (1 + v * 0.15))
        : tmpl.target + (v % 2);

      const exp = Math.round(tmpl.expMin + (tmpl.expMax - tmpl.expMin) * (v / variantsCount));
      const gold = Math.round(tmpl.goldMin + (tmpl.goldMax - tmpl.goldMin) * (v / variantsCount));

      pool.push({
        id: `daily_${idCounter++}`,
        title,
        desc: tmpl.desc,
        difficulty: tmpl.difficulty,
        levelMin: tmpl.levelMin,
        levelMax: tmpl.levelMax,
        type: tmpl.type,
        target: targetScale,
        rewardExp: 0,
        rewardGold: gold,
      });
    }
  });

  return pool;
}

export const ALL_DAILY_QUESTS = generateDailyQuestPool();

// ==========================================
// 3. 100+ HAFTALIK GÖREV ŞABLON VE LİSTESİ
// (Zorlu, uzun vadeli, 20 adet sunulur)
// ==========================================
const WEEKLY_QUEST_TEMPLATES = [
  // Kolay / Erken Aşama (Lv 1 - 30)
  { levelMin: 1, levelMax: 30, difficulty: 'Haftalık (Orta)', type: 'dungeon_clear', target: 10, title: 'Haftalık Zindan Seferi I', desc: 'Hafta boyunca 10 zindan akınını başarıyla tamamla.', expMin: 35000, expMax: 60000, goldMin: 25000, goldMax: 45000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Haftalık (Orta)', type: 'mine_clear', target: 12, title: 'Maden Loncası Teslimatı I', desc: '12 maden kazısını tamamlayıp cevher çıkar.', expMin: 30000, expMax: 50000, goldMin: 20000, goldMax: 40000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Haftalık (Orta)', type: 'boss_solo', target: 6, title: 'Gölge Celladı I', desc: 'Hafta boyunca 6 Tek Kişilik Boss yok et.', expMin: 45000, expMax: 75000, goldMin: 35000, goldMax: 60000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Haftalık (Orta)', type: 'boss_party', target: 4, title: 'Grup Savunması I', desc: '4 Grup Bossunu müttefiklerinle ez.', expMin: 50000, expMax: 85000, goldMin: 40000, goldMax: 70000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Haftalık (Orta)', type: 'monster_kill', target: 80, title: 'Vahşi Yaratık Katliamı', desc: 'Zindanda 80 slot canavarını ortadan kaldır.', expMin: 38000, expMax: 65000, goldMin: 30000, goldMax: 50000 },
  { levelMin: 1, levelMax: 30, difficulty: 'Haftalık (Orta)', type: 'gold_earned', target: 50000, title: 'Haftalık Servet I', desc: 'Hafta içinde 50,000 Altın biriktir.', expMin: 32000, expMax: 55000, goldMin: 25000, goldMax: 45000 },

  // Orta Aşama (Lv 31 - 60)
  { levelMin: 31, levelMax: 60, difficulty: 'Haftalık (Zor)', type: 'dungeon_clear', target: 15, title: 'Zümrüt Zindanlar Muhafızı', desc: '15 orta seviye zindanı dize getir.', expMin: 90000, expMax: 150000, goldMin: 65000, goldMax: 110000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Haftalık (Zor)', type: 'mine_clear', target: 15, title: 'Kadim Taş İşçiliği', desc: '15 maden ocağı kazısını tamamla.', expMin: 75000, expMax: 130000, goldMin: 55000, goldMax: 95000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Haftalık (Zor)', type: 'boss_solo', target: 10, title: 'Kadim Taş Devi Avcısı', desc: '10 Tek Kişilik Boss devir.', expMin: 110000, expMax: 180000, goldMin: 80000, goldMax: 140000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Haftalık (Zor)', type: 'boss_party', target: 6, title: 'Alev Lordları Kuşatması', desc: '6 Grup Bossunu yenilgiye uğrat.', expMin: 130000, expMax: 210000, goldMin: 95000, goldMax: 160000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Haftalık (Zor)', type: 'boss_world', target: 3, title: 'Kadim Krallık Savunması', desc: '3 Dünya Bossu tehdidini bertaraf et.', expMin: 180000, expMax: 300000, goldMin: 130000, goldMax: 220000 },
  { levelMin: 31, levelMax: 60, difficulty: 'Haftalık (Zor)', type: 'monster_kill', target: 160, title: 'Ordu Kıyımı', desc: 'Zindanda 160 düşman askeri ve canavarı yok et.', expMin: 95000, expMax: 160000, goldMin: 70000, goldMax: 120000 },

  // İleri Aşama (Lv 61 - 80)
  { levelMin: 61, levelMax: 80, difficulty: 'Haftalık (Çok Zor)', type: 'dungeon_clear', target: 20, title: 'Buzul ve Şeytanlar Fatihi', desc: '20 zorlu zindan seferini zaferle sonuçlandır.', expMin: 240000, expMax: 400000, goldMin: 170000, goldMax: 290000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Haftalık (Çok Zor)', type: 'mine_clear', target: 20, title: 'Yıldız Cevheri Sultanı', desc: '20 maden ocağında derin kazı yap.', expMin: 200000, expMax: 340000, goldMin: 140000, goldMax: 240000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Haftalık (Çok Zor)', type: 'boss_solo', target: 14, title: 'Karanlık Orman Celladı', desc: '14 Tek Kişilik Boss öldür.', expMin: 280000, expMax: 460000, goldMin: 200000, goldMax: 340000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Haftalık (Çok Zor)', type: 'boss_party', target: 8, title: 'Uçurum Canavarı Kıyımı', desc: '8 Grup Bossunu dize getir.', expMin: 320000, expMax: 540000, goldMin: 230000, goldMax: 400000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Haftalık (Çok Zor)', type: 'boss_world', target: 4, title: 'Yıldız Kıran Gazabı', desc: '4 Dünya Bossunu hezimete uğrat.', expMin: 420000, expMax: 700000, goldMin: 300000, goldMax: 500000 },
  { levelMin: 61, levelMax: 80, difficulty: 'Haftalık (Çok Zor)', type: 'monster_kill', target: 250, title: 'Kıyamet Lejyonu Yok Edişi', desc: 'Zindanda 250 güçlü canavar alt et.', expMin: 260000, expMax: 420000, goldMin: 190000, goldMax: 320000 },

  // Efsanevi Aşama (Lv 81 - 100)
  { levelMin: 81, levelMax: 100, difficulty: 'Haftalık (Efsanevi)', type: 'dungeon_clear', target: 25, title: 'Ebedi Zindan Hükümdarı', desc: '25 en üst seviye kıyamet zindanını tamamla.', expMin: 600000, expMax: 1000000, goldMin: 400000, goldMax: 750000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Haftalık (Efsanevi)', type: 'boss_solo', target: 18, title: 'Ebedi Karanlık Yok Edicisi', desc: '18 ölümcül Tek Kişilik Boss katlet.', expMin: 700000, expMax: 1200000, goldMin: 500000, goldMax: 900000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Haftalık (Efsanevi)', type: 'boss_party', target: 10, title: 'Ejderha Kralı Yıkımı', desc: '10 üst seviye Grup Bossu yok et.', expMin: 850000, expMax: 1500000, goldMin: 600000, goldMax: 1100000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Haftalık (Efsanevi)', type: 'boss_world', target: 5, title: 'Kıyamet Şampiyonu', desc: '5 Dünya Bossunu ezerek krallığı kurtar.', expMin: 1200000, expMax: 2000000, goldMin: 800000, goldMax: 1500000 },
  { levelMin: 81, levelMax: 100, difficulty: 'Haftalık (Efsanevi)', type: 'monster_kill', target: 400, title: 'Sonsuz Canavar Soykırımı', desc: '400 üst düzey zindan canavarını yok et.', expMin: 750000, expMax: 1300000, goldMin: 550000, goldMax: 1000000 },
];

export function generateWeeklyQuestPool() {
  const pool = [];
  const suffixes = [
    'Destanı', 'Hükümranlığı', 'Zaferi', 'Gazabı', 'Kuşatması', 'Mührü',
  ];

  let idCounter = 1;
  WEEKLY_QUEST_TEMPLATES.forEach((tmpl, tIdx) => {
    // 5 varyant üreterek 110+ haftalık görev oluştur
    const variantsCount = 5;
    for (let v = 0; v < variantsCount; v++) {
      const s = suffixes[(tIdx + v) % suffixes.length];
      const title = `${tmpl.title} - ${s}`;

      const exp = Math.round(tmpl.expMin + (tmpl.expMax - tmpl.expMin) * (v / variantsCount));
      const gold = Math.round(tmpl.goldMin + (tmpl.goldMax - tmpl.goldMin) * (v / variantsCount));
      const targetScale = tmpl.type === 'monster_kill' || tmpl.type === 'gold_earned'
        ? Math.round(tmpl.target * (1 + v * 0.1))
        : tmpl.target + (v % 3);

      pool.push({
        id: `weekly_${idCounter++}`,
        title,
        desc: tmpl.desc,
        difficulty: tmpl.difficulty,
        levelMin: tmpl.levelMin,
        levelMax: tmpl.levelMax,
        type: tmpl.type,
        target: targetScale,
        rewardExp: 0,
        rewardGold: gold,
      });
    }
  });

  return pool;
}

export const ALL_WEEKLY_QUESTS = generateWeeklyQuestPool();

// ==========================================
// 4. SEÇİM & İLERLEME YARDIMCI FONKSİYONLARI
// ==========================================

// Karakter seviyesine uygun 5 günlük görev seç
export function selectDailyQuestsForLevel(playerLevel = 1, count = 5) {
  // Seviye aralığına uygun görevleri filtrele (oyuncunun seviyesinin çok üstündeki imkansızlar çıkmasın)
  const eligible = ALL_DAILY_QUESTS.filter(
    (q) => playerLevel >= q.levelMin && playerLevel <= q.levelMax + 15
  );

  const fallback = eligible.length >= count ? eligible : ALL_DAILY_QUESTS;
  // Karıştır ve 'count' adet seç
  const shuffled = [...fallback].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((q) => ({
    ...q,
    instanceId: `${q.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    current: 0,
    isCompleted: false,
    rewardClaimed: false,
  }));
}

// Karakter seviyesine uygun 20 haftalık görev seç
export function selectWeeklyQuestsForLevel(playerLevel = 1, count = 20) {
  const eligible = ALL_WEEKLY_QUESTS.filter(
    (q) => playerLevel >= q.levelMin && playerLevel <= q.levelMax + 20
  );

  const fallback = eligible.length >= count ? eligible : ALL_WEEKLY_QUESTS;
  const shuffled = [...fallback].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((q) => ({
    ...q,
    instanceId: `${q.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    current: 0,
    isCompleted: false,
    rewardClaimed: false,
  }));
}

// Rozet başlangıç durumunu oluştur
export function createInitialBadgeProgress() {
  const badgeState = {};
  BADGE_DEFINITIONS.forEach((b) => {
    badgeState[b.id] = {
      id: b.id,
      currentCount: 0,
      currentTier: 0, // 0 = henüz tamamlanmadı, 1..5 tamamlanan kademe
    };
  });
  return badgeState;
}

// Oyuncu statlarına kazanılan kalıcı rozet bonuslarını uygula
export function calculateBadgeStats(badgeState = {}) {
  const accumulatedStats = {};
  BADGE_DEFINITIONS.forEach((badgeDef) => {
    const p = badgeState[badgeDef.id];
    if (!p || !p.currentTier) return;

    // Tamamlanan her kademenin bonusunu topla
    for (let t = 1; t <= p.currentTier; t++) {
      const tierObj = badgeDef.tiers.find((tier) => tier.tier === t);
      if (tierObj && tierObj.statBonus) {
        Object.entries(tierObj.statBonus).forEach(([statKey, val]) => {
          accumulatedStats[statKey] = (accumulatedStats[statKey] || 0) + val;
        });
      }
    }
  });
  return accumulatedStats;
}

// Oyuncu questState'ini garantiye al (eksikse oluştur)
export function ensurePlayerQuestState(player) {
  if (!player) return null;
  const currentQs = player.questState || {};
  const playerLevel = player.level || 1;

  const dailyQuests = Array.isArray(currentQs.dailyQuests) && currentQs.dailyQuests.length === 5
    ? currentQs.dailyQuests
    : selectDailyQuestsForLevel(playerLevel, 5);

  const weeklyQuests = Array.isArray(currentQs.weeklyQuests) && currentQs.weeklyQuests.length === 20
    ? currentQs.weeklyQuests
    : selectWeeklyQuestsForLevel(playerLevel, 20);

  const badgeProgress = currentQs.badgeProgress && Object.keys(currentQs.badgeProgress).length > 0
    ? currentQs.badgeProgress
    : createInitialBadgeProgress();

  return {
    ...player,
    questState: {
      dailyQuests,
      weeklyQuests,
      badgeProgress,
      completedDailyCount: currentQs.completedDailyCount || 0,
      completedWeeklyCount: currentQs.completedWeeklyCount || 0,
      completedBadgeCount: currentQs.completedBadgeCount || 0,
      completedDailyBatches: currentQs.completedDailyBatches || 0,
      dailyBatchJustCompleted: currentQs.dailyBatchJustCompleted || false,
    },
  };
}

// Tüm oyun eylemlerini (zindan, maden, boss, altın, yaratık) görevlere otomatik yansıtan motor
export function applyQuestProgress(player, eventType, amount = 1) {
  if (!player) return player;
  const ensured = ensurePlayerQuestState(player);
  let { dailyQuests, weeklyQuests, badgeProgress, completedDailyCount, completedWeeklyCount, completedBadgeCount, completedDailyBatches, dailyBatchJustCompleted } = ensured.questState;

  let addedGold = 0;
  let addedExp = 0;
  let addedCrystals = 0;
  let newBadgesUnlocked = [];

  // 1. Günlük Görevleri İlerlet & Otomatik Ödül
  dailyQuests = dailyQuests.map((q) => {
    if (q.type === eventType && !q.isCompleted) {
      const newCurrent = q.current + amount;
      if (newCurrent >= q.target) {
        // Görev tamamlandı! Ödülü otomatik ver (0 EXP - Seviye sadece zindanda kasılır)
        addedGold += q.rewardGold || 0;
        completedDailyCount++;
        return {
          ...q,
          current: q.target,
          isCompleted: true,
          rewardClaimed: true,
        };
      }
      return { ...q, current: newCurrent };
    }
    return q;
  });

  // 5 Görev Tamamlandı mı? Kontrol et
  const all5DailyCompleted = dailyQuests.length === 5 && dailyQuests.every((q) => q.isCompleted);
  if (all5DailyCompleted) {
    // 5'li paket ödülü: Ekstra bonus (0 EXP)
    addedGold += 3500;
    addedCrystals += 15;
    completedDailyBatches++;
    dailyBatchJustCompleted = true;
    // 5'i de bittiğinde otomatik yeni 5 görev paketi atanır!
    dailyQuests = selectDailyQuestsForLevel(ensured.level || 1, 5);
  }

  // 2. Haftalık Görevleri İlerlet & Otomatik Ödül
  weeklyQuests = weeklyQuests.map((q) => {
    if (q.type === eventType && !q.isCompleted) {
      const newCurrent = q.current + amount;
      if (newCurrent >= q.target) {
        addedGold += q.rewardGold || 0;
        completedWeeklyCount++;
        return {
          ...q,
          current: q.target,
          isCompleted: true,
          rewardClaimed: true,
        };
      }
      return { ...q, current: newCurrent };
    }
    return q;
  });

  // 3. Kademeli Rozet Görevlerini İlerlet
  const updatedBadgeProgress = { ...badgeProgress };
  BADGE_DEFINITIONS.forEach((bDef) => {
    if (bDef.targetType === eventType) {
      const cur = updatedBadgeProgress[bDef.id] || { id: bDef.id, currentCount: 0, currentTier: 0 };
      const newCount = cur.currentCount + amount;
      let curTier = cur.currentTier || 0;

      // Sonraki kademenin hedefine ulaşıldı mı?
      const nextTierObj = bDef.tiers.find((t) => t.tier === curTier + 1);
      if (nextTierObj && newCount >= nextTierObj.target) {
        curTier = nextTierObj.tier;
        completedBadgeCount++;
        addedGold += nextTierObj.rewardGold || 0;
        addedCrystals += nextTierObj.rewardCrystals || 0;
        newBadgesUnlocked.push({
          badgeName: bDef.name,
          tierName: nextTierObj.name,
          statDesc: nextTierObj.statDesc,
        });
      }

      updatedBadgeProgress[bDef.id] = {
        ...cur,
        currentCount: newCount,
        currentTier: curTier,
      };
    }
  });

  return {
    ...ensured,
    gold: (ensured.gold || 0) + addedGold,
    exp: (ensured.exp || 0) + addedExp,
    crystals: (ensured.crystals || 0) + addedCrystals,
    questState: {
      dailyQuests,
      weeklyQuests,
      badgeProgress: updatedBadgeProgress,
      completedDailyCount,
      completedWeeklyCount,
      completedBadgeCount,
      completedDailyBatches,
      dailyBatchJustCompleted,
      lastUnlockedBadges: newBadgesUnlocked.length > 0 ? newBadgesUnlocked : (ensured.questState.lastUnlockedBadges || null),
    },
  };
}
