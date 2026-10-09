// src/config/dungeonData.js
// 20 Seviye Grubu ve Her Gruptaki 5 Canavarın Detaylı Saldırı, Defans ve Can Slot Değerleri (1 - 100 Seviye)

/**
 * Canavar slot değerlerini hesaplayan yardımcı fonksiyon:
 * Slot 1 tablodaki temel değerlerle başlar; her slot %8 artışla 5. slotta (Boss) zirve yapar.
 */
function createMonsterSlots(names, baseAttack, baseDefense, baseHp) {
  return names.map((name, idx) => {
    const multiplier = 1 + idx * 0.08;
    return {
      name,
      slot: idx + 1,
      attack: Math.round(baseAttack * multiplier),
      defense: Math.round(baseDefense * multiplier),
      hp: Math.round(baseHp * multiplier),
      isBoss: idx === 4,
    };
  });
}

export function getMonsterName(monster) {
  if (!monster) return '';
  return typeof monster === 'string' ? monster : monster.name;
}

export const DUNGEON_GROUPS = [
  // GRUP 1 (1-5): Saldırı: 10, Defans: 20, Can: 30
  {
    id: 1,
    name: 'Fısıldayan Gölgeler Koruluğu',
    levelMin: 1,
    levelMax: 5,
    bracket: '1-30',
    durationSeconds: 1800, // 30 Dakika
    expMin: 8000,
    expMax: 11500,
    goldMin: 1500,
    goldMax: 3500,
    baseAttack: 10,
    baseDefense: 20,
    baseHp: 30,
    monsters: createMonsterSlots(
      ['Gölge Elfleri', 'Orman Cüceleri', 'Ay Kurtları', 'Kristal Örümcekleri', 'Yaprak Goblini'],
      10,
      20,
      30
    ),
    desc: 'Kadim ormanın unutulmuş sınırları. Ağaçların derinliklerinde gölge elfleri ve yaprak goblinleri pusu kurar.',
  },

  // GRUP 2 (6-10): Saldırı: 20, Defans: 30, Can: 40
  {
    id: 2,
    name: 'Mehtap Çürüğü Mağarası',
    levelMin: 6,
    levelMax: 10,
    bracket: '1-30',
    durationSeconds: 1800,
    expMin: 8200,
    expMax: 11800,
    goldMin: 2000,
    goldMax: 4500,
    baseAttack: 20,
    baseDefense: 30,
    baseHp: 40,
    monsters: createMonsterSlots(
      ['Mehtap Yarasaları', 'Dev Mantarlar', 'Diken Yılanları', 'Sis Perileri', 'Kaya Trolleri'],
      20,
      30,
      40
    ),
    desc: 'Gümüşi ay ışığının zehirli mantarlarla aydınlattığı sisli mağaralar ve vadi trollerinin inleri.',
  },

  // GRUP 3 (11-15): Saldırı: 30, Defans: 40, Can: 50
  {
    id: 3,
    name: 'Zümrüt Sarmaşık Geçidi',
    levelMin: 11,
    levelMax: 15,
    bracket: '1-30',
    durationSeconds: 1800,
    expMin: 8500,
    expMax: 12000,
    goldMin: 2500,
    goldMax: 5500,
    baseAttack: 30,
    baseDefense: 40,
    baseHp: 50,
    monsters: createMonsterSlots(
      ['Ateş Böcekleri', 'Gümüş Geyikleri', 'Zehirli Sarmaşıklar', 'Karanlık Elfleri', 'Buz Kurtları'],
      30,
      40,
      50
    ),
    desc: 'Karanlık elflerin ve elementel yırtıcıların hüküm sürdüğü sarmaşık kaplı kadim geçit.',
  },

  // GRUP 4 (16-20): Saldırı: 40, Defans: 50, Can: 60
  {
    id: 4,
    name: 'Dört Element Mabedi',
    levelMin: 16,
    levelMax: 20,
    bracket: '1-30',
    durationSeconds: 1800,
    expMin: 8500,
    expMax: 12200,
    goldMin: 3000,
    goldMax: 6500,
    baseAttack: 40,
    baseDefense: 50,
    baseHp: 60,
    monsters: createMonsterSlots(
      ['Toprak Elementalleri', 'Hava Ruhları', 'Su Perileri', 'Ateş İfritleri', 'Gölge Kedileri'],
      40,
      50,
      60
    ),
    desc: 'Kadim elflerin doğanın dört ana gücünü mühürlediği, ruhların çatıştığı gizli tapınak.',
  },

  // GRUP 5 (21-25): Saldırı: 50, Defans: 60, Can: 70
  {
    id: 5,
    name: 'Fırtına ve Kristal Zirvesi',
    levelMin: 21,
    levelMax: 25,
    bracket: '1-30',
    durationSeconds: 1800,
    expMin: 8800,
    expMax: 12500,
    goldMin: 3500,
    goldMax: 7500,
    baseAttack: 50,
    baseDefense: 60,
    baseHp: 70,
    monsters: createMonsterSlots(
      ['Ay Işığı Hayaletleri', 'Orman Bekçileri', 'Kristal Golemi', 'Yıldız Ejderhaları', 'Gök Gürültüsü Kuşları'],
      50,
      60,
      70
    ),
    desc: 'Gök gürültüsü kuşlarının yuvalandığı, kristal golem muhafızların beklediği sarp dağ zirvesi.',
  },

  // GRUP 6 (26-30): Saldırı: 60, Defans: 70, Can: 80
  {
    id: 6,
    name: 'Yeşil Ejderha Uçurumu',
    levelMin: 26,
    levelMax: 30,
    bracket: '1-30',
    durationSeconds: 1800,
    expMin: 9000,
    expMax: 12500,
    goldMin: 4000,
    goldMax: 8500,
    baseAttack: 60,
    baseDefense: 70,
    baseHp: 80,
    monsters: createMonsterSlots(
      ['Zümrüt Yılanları', 'Gümüş Kanatlılar', 'Karanlık Örümcekleri', 'Beyaz Kurtlar', 'Yeşil Ejderhalar'],
      60,
      70,
      80
    ),
    desc: 'Zümrüt yılanlarının kayalıkları sardığı ve yeşil ejderhaların göğe yükseldiği derin kanyon.',
  },

  // GRUP 7 (31-35): Saldırı: 70, Defans: 80, Can: 90
  {
    id: 7,
    name: 'Ay Tutulması Vahası',
    levelMin: 31,
    levelMax: 35,
    bracket: '31-60',
    durationSeconds: 1800,
    expMin: 8500,
    expMax: 12500,
    goldMin: 5000,
    goldMax: 10000,
    baseAttack: 70,
    baseDefense: 80,
    baseHp: 90,
    monsters: createMonsterSlots(
      ['Sis Hayaletleri', 'Meşe Adamları', 'Diken Yaratıkları', 'Ay Tutulması Ruhları', 'Yıldız Tozu Perileri'],
      70,
      80,
      90
    ),
    desc: 'Güneşin söndüğü ve ay tutulması ruhlarının meşe devlerini uyandırdığı kutsal vaha.',
  },

  // GRUP 8 (36-40): Saldırı: 80, Defans: 90, Can: 100
  {
    id: 8,
    name: 'Buzul Devi Kanyonu',
    levelMin: 36,
    levelMax: 40,
    bracket: '31-60',
    durationSeconds: 1800,
    expMin: 8800,
    expMax: 12800,
    goldMin: 5500,
    goldMax: 11500,
    baseAttack: 80,
    baseDefense: 90,
    baseHp: 100,
    monsters: createMonsterSlots(
      ['Gölge Suikastçıları', 'Orman Trolü', 'Kristal Yarasalar', 'Buz Devi', 'Ateş Akrepleri'],
      80,
      90,
      100
    ),
    desc: 'Buz devlerinin buzlu nefesiyle kavurucu akrep alevlerinin çarpıştığı çetin savaş alanı.',
  },

  // GRUP 9 (41-45): Saldırı: 90, Defans: 100, Can: 110
  {
    id: 9,
    name: 'Karanlık Şövalye Kalesi',
    levelMin: 41,
    levelMax: 45,
    bracket: '31-60',
    durationSeconds: 1800,
    expMin: 9000,
    expMax: 13000,
    goldMin: 6500,
    goldMax: 13000,
    baseAttack: 90,
    baseDefense: 100,
    baseHp: 110,
    monsters: createMonsterSlots(
      ['Zehirli Mantarlar', 'Gümüş Tilki Ruhları', 'Karanlık Şövalyeler', 'Ay Ayıları', 'Yaprak Ninjaları'],
      90,
      100,
      110
    ),
    desc: 'Gümüş tilki ruhlarının koruduğu ve lanetli kara şövalyelerin nöbet tuttuğu kadim kale.',
  },

  // GRUP 10 (46-50): Saldırı: 100, Defans: 110, Can: 120
  {
    id: 10,
    name: 'Kadim Elementler Mihrabı',
    levelMin: 46,
    levelMax: 50,
    bracket: '31-60',
    durationSeconds: 1800,
    expMin: 9200,
    expMax: 13200,
    goldMin: 7500,
    goldMax: 15000,
    baseAttack: 100,
    baseDefense: 110,
    baseHp: 120,
    monsters: createMonsterSlots(
      ['Rüzgar Elementalleri', 'Toprak Golemi', 'Su Yılanları', 'Ateş Kuşları', 'Gölge Kurtları'],
      100,
      110,
      120
    ),
    desc: 'Toprağı ve göğü titreten vahşi elemental akımların ve ateş kuşlarının kutsal mabedi.',
  },

  // GRUP 11 (51-55): Saldırı: 110, Defans: 120, Can: 130
  {
    id: 11,
    name: 'Yıldız Avcıları Labirenti',
    levelMin: 51,
    levelMax: 55,
    bracket: '31-60',
    durationSeconds: 1800,
    expMin: 9200,
    expMax: 13500,
    goldMin: 8500,
    goldMax: 17000,
    baseAttack: 110,
    baseDefense: 120,
    baseHp: 130,
    monsters: createMonsterSlots(
      ['Kristal Akrepleri', 'Mehtap Kedileri', 'Orman Hayaletleri', 'Yıldız Avcıları', 'Diken Golemi'],
      110,
      120,
      130
    ),
    desc: 'Kristal akreplerin pusu kurduğu ve yıldız avcılarının kurbanlarını aradığı girift labirent.',
  },

  // GRUP 12 (56-60): Saldırı: 140, Defans: 150, Can: 160
  {
    id: 12,
    name: 'Gümüş Ejderha Kulesi',
    levelMin: 56,
    levelMax: 60,
    bracket: '31-60',
    durationSeconds: 1800,
    expMin: 9500,
    expMax: 13500,
    goldMin: 10000,
    goldMax: 20000,
    baseAttack: 140,
    baseDefense: 150,
    baseHp: 160,
    monsters: createMonsterSlots(
      ['Buz Perileri', 'Zehirli Örümcekler', 'Gümüş Ejderhalar', 'Karanlık Ruhlar', 'Ay Işığı Savaşçıları'],
      140,
      150,
      160
    ),
    desc: 'Gümüş ejderhaların göğe uzanan mermer kuleleri ve ay ışığı savaşçılarının kadim sığınağı.',
  },

  // GRUP 13 (61-65): Saldırı: 150, Defans: 160, Can: 170
  {
    id: 13,
    name: 'Kadim Meşe Tahtı',
    levelMin: 61,
    levelMax: 65,
    bracket: '61-80',
    durationSeconds: 1800,
    expMin: 9500,
    expMax: 13800,
    goldMin: 11000,
    goldMax: 22000,
    baseAttack: 150,
    baseDefense: 160,
    baseHp: 170,
    monsters: createMonsterSlots(
      ['Orman İfritleri', 'Kristal Kanatlılar', 'Gölge Yılanları', 'Yıldız Golemi', 'Meşe Bekçileri'],
      150,
      160,
      170
    ),
    desc: 'Sylvandar\'ın en yaşlı meşe ağacının köklerinde uyuyan kadim ruhlar ve ifritler.',
  },

  // GRUP 14 (66-70): Saldırı: 160, Defans: 170, Can: 180
  {
    id: 14,
    name: 'Ateş ve Buz Derinlikleri',
    levelMin: 66,
    levelMax: 70,
    bracket: '61-80',
    durationSeconds: 1800,
    expMin: 9800,
    expMax: 14000,
    goldMin: 13000,
    goldMax: 26000,
    baseAttack: 160,
    baseDefense: 170,
    baseHp: 180,
    monsters: createMonsterSlots(
      ['Ateş Perileri', 'Buz Golemi', 'Zehirli Dikenler', 'Gümüş Hayaletler', 'Karanlık Bekçiler'],
      160,
      170,
      180
    ),
    desc: 'İki zıt elementin çatıştığı, ateş perileri ve buz golemlerinin savaştığı tehlikeli derinlikler.',
  },

  // GRUP 15 (71-75): Saldırı: 170, Defans: 180, Can: 190
  {
    id: 15,
    name: 'Kurtadam Gece Ormanı',
    levelMin: 71,
    levelMax: 75,
    bracket: '61-80',
    durationSeconds: 1800,
    expMin: 10000,
    expMax: 14200,
    goldMin: 15000,
    goldMax: 30000,
    baseAttack: 170,
    baseDefense: 180,
    baseHp: 190,
    monsters: createMonsterSlots(
      ['Ay Kurt Adamları', 'Orman Ruhları', 'Kristal Yaratıkları', 'Gölge Avcıları', 'Yıldız Perileri'],
      170,
      180,
      190
    ),
    desc: 'Dolunayın asla batmadığı, ay kurt adamlarının ve gölge avcılarının kol gezdiği tehlikeli orman.',
  },

  // GRUP 16 (76-80): Saldırı: 180, Defans: 190, Can: 200
  {
    id: 16,
    name: 'Karanlık Gölgeler Cehennemi',
    levelMin: 76,
    levelMax: 80,
    bracket: '61-80',
    durationSeconds: 1800,
    expMin: 10200,
    expMax: 14500,
    goldMin: 17000,
    goldMax: 34000,
    baseAttack: 180,
    baseDefense: 190,
    baseHp: 200,
    monsters: createMonsterSlots(
      ['Diken Şeytanları', 'Buz Yılanları', 'Ateş Golemi', 'Gümüş Periler', 'Karanlık Gölgeler'],
      180,
      190,
      200
    ),
    desc: 'Diken şeytanları ve ateş golemlerinin dünyayı saran kadim gölgelerle birleştiği cehennem kapısı.',
  },

  // GRUP 17 (81-85): Saldırı: 190, Defans: 200, Can: 210
  {
    id: 17,
    name: 'Zümrüt Golem Kalesi',
    levelMin: 81,
    levelMax: 85,
    bracket: '81-100',
    durationSeconds: 1800,
    expMin: 10200,
    expMax: 14800,
    goldMin: 19000,
    goldMax: 38000,
    baseAttack: 190,
    baseDefense: 200,
    baseHp: 210,
    monsters: createMonsterSlots(
      ['Zümrüt Golemi', 'Mehtap Yaratıkları', 'Orman Şeytanları', 'Yıldız Şövalyeleri', 'Kristal Hayaletler'],
      190,
      200,
      210
    ),
    desc: 'Yıkılmaz zümrüt golemleri ve yıldız şövalyelerinin nöbet tuttuğu aşılmaz dağ kalesi.',
  },

  // GRUP 18 (86-90): Saldırı: 200, Defans: 210, Can: 220
  {
    id: 18,
    name: 'Karanlık İfrit Mahzeni',
    levelMin: 86,
    levelMax: 90,
    bracket: '81-100',
    durationSeconds: 1800,
    expMin: 10500,
    expMax: 15000,
    goldMin: 22000,
    goldMax: 44000,
    baseAttack: 200,
    baseDefense: 210,
    baseHp: 220,
    monsters: createMonsterSlots(
      ['Gölge İfritleri', 'Buz Şeytanları', 'Ateş Yılanları', 'Gümüş Golemi', 'Karanlık Periler'],
      200,
      210,
      220
    ),
    desc: 'Gölge ifritlerinin ve ateş yılanlarının yer altı labirentlerinde saklanan kadim mahzen.',
  },

  // GRUP 19 (91-95): Saldırı: 210, Defans: 220, Can: 230
  {
    id: 19,
    name: 'Ay Ejderhası Yuvası',
    levelMin: 91,
    levelMax: 95,
    bracket: '81-100',
    durationSeconds: 1800,
    expMin: 10800,
    expMax: 15500,
    goldMin: 25000,
    goldMax: 48000,
    baseAttack: 210,
    baseDefense: 220,
    baseHp: 230,
    monsters: createMonsterSlots(
      ['Ay Ejderhaları', 'Orman İfritleri', 'Kristal Şövalyeleri', 'Yıldız Golemi', 'Diken Avcıları'],
      210,
      220,
      230
    ),
    desc: 'Göklerde yankılanan kükremelerle uyanan Ay Ejderhaları ve kristal şövalyelerin kutsal tapınağı.',
  },

  // GRUP 20 (96-100): Saldırı: 220, Defans: 230, Can: 240
  {
    id: 20,
    name: 'Ay\'ın Son Bekçisi Mabedi',
    levelMin: 96,
    levelMax: 100,
    bracket: '81-100',
    durationSeconds: 1800,
    expMin: 11000,
    expMax: 16000,
    goldMin: 30000,
    goldMax: 55000,
    baseAttack: 220,
    baseDefense: 230,
    baseHp: 240,
    monsters: createMonsterSlots(
      ['Ebedi Gölgeler', 'Sonsuz Alevler', 'Buz Kraliçesi', 'Ormanın Kalbi', 'Ay\'ın Son Bekçisi'],
      220,
      230,
      240
    ),
    desc: 'Elf evreninin nihai kadim zindanı. Buz Kraliçesi, Sonsuz Alevler ve Ay\'ın Son Bekçisi burada bekler.',
  },
];

// Seviye başına EXP gereksinimi:
// 24 saat aktif kesintisiz zindan oto-avında (3.5s per mob, ~24.685 mob) tam Seviye 30'a ulaşacak sert klasik MMORPG eğrisi.
// Seviye 1-5 hızlı (15 dk), 6-20 giderek yavaşlayan, 20-30 her seviyesi saatler süren hardcore tempo.
export function getRequiredExp(level) {
  if (level < 1) return 220;
  return Math.round(180 * Math.pow(1.245, level - 1) + 40 * level);
}

// Seviye Atlama ve EXP / Altın Hesaplama Yardımcısı
export function calculateLevelAndExp(currentLevel, currentExp, expToAdd, currentGold, goldToAdd) {
  let level = currentLevel || 1;
  let gold = (currentGold || 0) + goldToAdd;

  let maxExp = getRequiredExp(level);
  // Eski sistemden kalan astronomik EXP varsa oyuncunun anında fırlamaması için normalize et:
  const normalizedBaseExp = Math.min(currentExp || 0, maxExp - 1);
  let exp = normalizedBaseExp + expToAdd;

  let leveledUp = false;
  let levelsGained = 0;

  while (exp >= maxExp && level < 100) {
    exp -= maxExp;
    level += 1;
    levelsGained += 1;
    leveledUp = true;
    maxExp = getRequiredExp(level);
  }

  return {
    level,
    exp,
    maxExp,
    gold,
    leveledUp,
    levelsGained,
  };
}

// Rastgele Ödül Çekme Yardımcısı (Belirtilen Aralıkta)
export function rollDungeonReward(dungeon) {
  const expMin = dungeon.expMin || 8000;
  const expMax = dungeon.expMax || 12000;
  const goldMin = dungeon.goldMin || 2000;
  const goldMax = dungeon.goldMax || 6000;

  const rolledExp = Math.floor(Math.random() * (expMax - expMin + 1)) + expMin;
  const rolledGold = Math.floor(Math.random() * (goldMax - goldMin + 1)) + goldMin;

  return {
    exp: rolledExp,
    gold: rolledGold,
  };
}
