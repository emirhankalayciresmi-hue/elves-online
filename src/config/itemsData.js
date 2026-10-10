// Kadim Elfler - 1-10 Seviye Ekipman Setleri ve Eşya Veritabanı
// Savaşçı: "Kanlı Çelik Muhafızı"
// Ninja: "Gölge Pençesi"
// Büyücü: "Arcane Yıldızı"

export const EQUIPMENT_SETS = {
  warrior: {
    id: 'warrior_bloodsteel',
    name: 'Kanlı Çelik Muhafızı',
    className: 'Savaşçı',
    classId: 'warrior',
    color: '#f43f5e',
    borderColor: 'border-rose-500/50',
    textColor: 'text-rose-300',
    bgBadge: 'bg-rose-950/80',
    levelRequirement: '1-10 Seviye',
  },
  assassin: {
    id: 'ninja_shadowclaw',
    name: 'Gölge Pençesi',
    className: 'Ninja',
    classId: 'assassin',
    color: '#10b981',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-300',
    bgBadge: 'bg-emerald-950/80',
    levelRequirement: '1-10 Seviye',
  },
  mage: {
    id: 'mage_arcanestar',
    name: 'Arcane Yıldızı',
    className: 'Büyücü',
    classId: 'mage',
    color: '#38bdf8',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-300',
    bgBadge: 'bg-sky-950/80',
    levelRequirement: '1-10 Seviye',
  },
};

export const ITEMS_DATABASE = [
  // ⚔️ SAVAŞÇI SETİ: "Kanlı Çelik Muhafızı"
  {
    id: 'warrior_helmet',
    name: 'Kanlı Çelik Muhafızı Miğferi',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'helmet',
    slotName: 'Miğfer',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_helmet.svg',
    desc: 'Kanlı çelikle dövülmüş ve yakut rünlerle mühürlenmiş kadim muhafız miğferi.',
  },
  {
    id: 'warrior_armor',
    name: 'Kanlı Çelik Muhafızı Zırhı',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'armor',
    slotName: 'Zırh',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_armor.svg',
    desc: 'Ağır kanlı çelik plakalardan işlenmiş, göğüs kafesinde ejderha arması taşıyan zırh.',
  },
  {
    id: 'warrior_weapon',
    name: 'Kanlı Çelik Muhafızı Kılıcı',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'weapon',
    slotName: 'Silah',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_weapon.svg',
    desc: 'Keskin kan oluklarına sahip, düşman kanıyla parıldayan çift ağızlı elven kılıcı.',
  },
  {
    id: 'warrior_offhand',
    name: 'Kanlı Çelik Muhafızı Hançeri',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'offhand',
    slotName: 'Yan El',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_offhand.svg',
    desc: 'Savunma ve ani karşı saldırılar için tasarlanmış sivri uçlu yan el hançeri.',
  },
  {
    id: 'warrior_necklace',
    name: 'Kanlı Çelik Muhafızı Kolyesi',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'necklace',
    slotName: 'Kolye',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_necklace.svg',
    desc: 'Ortasında kan kırmızısı yakut taşıyan, savaşçının kalp atışlarıyla uyumlu kolye.',
  },
  {
    id: 'warrior_ring1',
    name: 'Kanlı Çelik Muhafızı Yüzüğü I',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'ring1',
    slotName: 'Yüzük 1',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_ring1.svg',
    desc: 'I. Kademe kadim rünlerle bezenmiş kanlı çelik halka yüzük.',
  },
  {
    id: 'warrior_ring2',
    name: 'Kanlı Çelik Muhafızı Yüzüğü II',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'ring2',
    slotName: 'Yüzük 2',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_ring2.svg',
    desc: 'II. Kademe muhafız gücünü mühürleyen çift kanallı yakut yüzük.',
  },
  {
    id: 'warrior_gloves',
    name: 'Kanlı Çelik Muhafızı Eldiveni',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'gloves',
    slotName: 'Eldiven',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_gloves.svg',
    desc: 'Kılıç tutuşunu güçlendiren ve parmak boğumları çelikle perçinlenmiş savaş eldiveni.',
  },
  {
    id: 'warrior_boots',
    name: 'Kanlı Çelik Muhafızı Çizmesi',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'boots',
    slotName: 'Çizme',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_boots.svg',
    desc: 'Savaş meydanında sarsılmaz denge sunan kanat mahmuzlu çelik çizme.',
  },
  {
    id: 'warrior_belt',
    name: 'Kanlı Çelik Muhafızı Kemeri',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'belt',
    slotName: 'Kemer',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_belt.svg',
    desc: 'Bel bölgesini koruyan ve kılıç kınını taşıyan süslemeli ağır toka kemer.',
  },
  {
    id: 'warrior_cloak',
    name: 'Kanlı Çelik Muhafızı Pelerini',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'cloak',
    slotName: 'Pelerin',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_cloak.svg',
    desc: 'Omuzlarda altın broşlarla tutturulmuş, kan kırmızısı asil kadife pelerin.',
  },
  {
    id: 'warrior_wings',
    name: 'Kanlı Çelik Muhafızı Kanatları',
    setName: 'Kanlı Çelik Muhafızı',
    setKey: 'warrior',
    classId: 'warrior',
    className: 'Savaşçı',
    slot: 'wings',
    slotName: 'Kanat',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/warrior_wings.svg',
    desc: 'Savaş tanrılarının lütfuyla alevlenen kızıl eterik muhafız kanatları.',
  },

  // 🥷 NİNJA SETİ: "Gölge Pençesi"
  {
    id: 'ninja_helmet',
    name: 'Gölge Pençesi Miğferi',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'helmet',
    slotName: 'Miğfer',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_helmet.svg',
    desc: 'Karanlıkta parıldayan zümrüt vizörüyle suikastçıyı gizleyen gölge miğferi.',
  },
  {
    id: 'ninja_armor',
    name: 'Gölge Pençesi Zırhı',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'armor',
    slotName: 'Zırh',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_armor.svg',
    desc: 'Sessiz adımları engellemeyen esnek yeşim derisi ve hafif gölge zırhı.',
  },
  {
    id: 'ninja_weapon',
    name: 'Gölge Pençesi Kılıcı',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'weapon',
    slotName: 'Silah',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_weapon.svg',
    desc: 'Karanlığın hızını taşıyan kavisli, zehirli ve ölümcül suikast kılıcı.',
  },
  {
    id: 'ninja_offhand',
    name: 'Gölge Pençesi Hançeri',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'offhand',
    slotName: 'Yan El',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_offhand.svg',
    desc: 'Düşmanın gardını düşürmek için ikinci elde taşınan çevik gölge hançeri.',
  },
  {
    id: 'ninja_necklace',
    name: 'Gölge Pençesi Kolyesi',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'necklace',
    slotName: 'Kolye',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_necklace.svg',
    desc: 'Gecenin sessizliğini ve zehrini simgeleyen yeşim taşlı gümüş zincir kolye.',
  },
  {
    id: 'ninja_ring1',
    name: 'Gölge Pençesi Yüzüğü I',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'ring1',
    slotName: 'Yüzük 1',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_ring1.svg',
    desc: 'Refleksleri ve çevikliği güçlendiren I. Kademe gölge yüzüğü.',
  },
  {
    id: 'ninja_ring2',
    name: 'Gölge Pençesi Yüzüğü II',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'ring2',
    slotName: 'Yüzük 2',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_ring2.svg',
    desc: 'Sessiz suikastların simgesi II. Kademe zümrüt kakmalı pençe yüzüğü.',
  },
  {
    id: 'ninja_gloves',
    name: 'Gölge Pençesi Eldiveni',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'gloves',
    slotName: 'Eldiven',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_gloves.svg',
    desc: 'Parmak uçlarında gizli pençeler barındıran ince dikişli karanlık eldiven.',
  },
  {
    id: 'ninja_boots',
    name: 'Gölge Pençesi Çizmesi',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'boots',
    slotName: 'Çizme',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_boots.svg',
    desc: 'Yere basıldığında tek bir ses bile çıkarmayan tüy kadar hafif ninja botu.',
  },
  {
    id: 'ninja_belt',
    name: 'Gölge Pençesi Kemeri',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'belt',
    slotName: 'Kemer',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_belt.svg',
    desc: 'Gizli hançerler ve zehir şişeleri için özel yuvalara sahip deri kuşak.',
  },
  {
    id: 'ninja_cloak',
    name: 'Gölge Pençesi Pelerini',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'cloak',
    slotName: 'Pelerin',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_cloak.svg',
    desc: 'Karanlıkta kullanıcısını adeta görünmez kılan gölge desenli pelerin.',
  },
  {
    id: 'ninja_wings',
    name: 'Gölge Pençesi Kanatları',
    setName: 'Gölge Pençesi',
    setKey: 'assassin',
    classId: 'assassin',
    className: 'Ninja',
    slot: 'wings',
    slotName: 'Kanat',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/ninja_wings.svg',
    desc: 'Zümrüt ve gece gölgesi buharlarıyla havada süzülmeyi sağlayan suikastçı kanatları.',
  },

  // 🔮 BÜYÜCÜ SETİ: "Arcane Yıldızı"
  {
    id: 'mage_helmet',
    name: 'Arcane Yıldızı Miğferi',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'helmet',
    slotName: 'Miğfer',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_helmet.svg',
    desc: 'Alnında kadim yıldız kristali taşıyan asil elf büyücü tacı ve başlığı.',
  },
  {
    id: 'mage_armor',
    name: 'Arcane Yıldızı Zırhı',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'armor',
    slotName: 'Zırh',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_armor.svg',
    desc: 'Büyü akışını hızlandıran rünik işlemeli göksel ipek ve safir plaka cübbe.',
  },
  {
    id: 'mage_weapon',
    name: 'Arcane Yıldızı Asası',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'weapon',
    slotName: 'Silah',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_weapon.svg',
    desc: 'Tepesinde saf arcane kristali dalgalanan yüksek kadim elf asası.',
  },
  {
    id: 'mage_offhand',
    name: 'Arcane Yıldızı Hançeri',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'offhand',
    slotName: 'Yan El',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_offhand.svg',
    desc: 'Büyü ritüellerinde enerjiyi odaklamak için kullanılan kristal odak hançeri.',
  },
  {
    id: 'mage_necklace',
    name: 'Arcane Yıldızı Kolyesi',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'necklace',
    slotName: 'Kolye',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_necklace.svg',
    desc: 'Mavi göktaşından yontulmuş ve aralıksız mana yayan yıldız cevheri kolye.',
  },
  {
    id: 'mage_ring1',
    name: 'Arcane Yıldızı Yüzüğü I',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'ring1',
    slotName: 'Yüzük 1',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_ring1.svg',
    desc: 'I. Kademe yıldız büyüsünü hapseden safir yüzük.',
  },
  {
    id: 'mage_ring2',
    name: 'Arcane Yıldızı Yüzüğü II',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'ring2',
    slotName: 'Yüzük 2',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_ring2.svg',
    desc: 'II. Kademe kozmik enerjiyi düzenleyen çift taşlı astral yüzük.',
  },
  {
    id: 'mage_gloves',
    name: 'Arcane Yıldızı Eldiveni',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'gloves',
    slotName: 'Eldiven',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_gloves.svg',
    desc: 'Büyü parşömenlerini ve elementel güçleri hisseden kadim ipek eldiven.',
  },
  {
    id: 'mage_boots',
    name: 'Arcane Yıldızı Çizmesi',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'boots',
    slotName: 'Çizme',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_boots.svg',
    desc: 'Ruhani boyutta yürüyormuşçasına hafiflik veren yıldız tozu işlemeli çizme.',
  },
  {
    id: 'mage_belt',
    name: 'Arcane Yıldızı Kemeri',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'belt',
    slotName: 'Kemer',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_belt.svg',
    desc: 'Kadim rün parşömenlerini ve kristal keselerini taşıyan parıltılı kemer.',
  },
  {
    id: 'mage_cloak',
    name: 'Arcane Yıldızı Pelerini',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'cloak',
    slotName: 'Pelerin',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_cloak.svg',
    desc: 'Gece gökyüzündeki yıldız takımyıldızlarını üzerinde dalgalandıran büyücü pelerini.',
  },
  {
    id: 'mage_wings',
    name: 'Arcane Yıldızı Kanatları',
    setName: 'Arcane Yıldızı',
    setKey: 'mage',
    classId: 'mage',
    className: 'Büyücü',
    slot: 'wings',
    slotName: 'Kanat',
    levelMin: 1,
    levelMax: 10,
    image: '/assets/items/mage_wings.svg',
    desc: 'Saf mavi ve mor arcane enerjisinden doğan parıltılı kozmik kanatlar.',
  },
];

// Eşya ID'sine göre arama
export function getItemById(id) {
  return ITEMS_DATABASE.find((item) => item.id === id) || null;
}

// Zindan 1 (1-5) ve Zindan 2 (6-10) Ganimet Düşme Mantığı
// Zindan Ekipman Düşme Mantığı (%3 şans tuttuğunda 1 parça değerli eşya düşer)
export function rollDungeonEquipmentDrops(dungeonId = 1, playerClassId = 'warrior') {
  const classItems = ITEMS_DATABASE.filter((it) => it.classId === playerClassId);
  // Havuz: %60 oyuncunun kendi sınıfına ait eşya, %40 diğer sınıfların eşyaları (pazar ekonomisi için)
  const pickFromClass = Math.random() < 0.6;
  const pool = (pickFromClass && classItems.length > 0) ? classItems : ITEMS_DATABASE;
  const randomItem = pool[Math.floor(Math.random() * pool.length)];

  if (!randomItem) return [];

  // Benzersiz tekil kopya oluştur
  return [{
    ...randomItem,
    instanceId: `${randomItem.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    droppedAt: new Date().toISOString(),
  }];
}

/**
 * Verilen eşyanın oyuncunun sınıfına ait olup olmadığını doğrular.
 * Maden, cevher ve iksir gibi genel materyaller tüm sınıflar için serbesttir.
 * Ekipmanlarda ise Savaşçı, Ninja ve Büyücü sınıfları ayrıştırılır.
 */
export function isItemForPlayerClass(item, player) {
  if (!item) return false;
  // Maden, cevher, iksir veya genel materyallerde sınıf kısıtlaması yoktur
  if (item.isOre || item.type === 'ore' || item.type === 'potion') return true;
  if (!item.classId && !item.className && !item.setKey) return true;

  const playerClass = (player?.classId || '').toLowerCase();
  const playerClassName = (player?.className || '').toLowerCase();

  const itemClass = (item.classId || '').toLowerCase();
  const itemSet = (item.setKey || '').toLowerCase();
  const itemClassName = (item.className || '').toLowerCase();

  // Ninja / Assassin alias desteği
  const isPlayerNinja =
    playerClass === 'ninja' ||
    playerClass === 'assassin' ||
    playerClassName.includes('ninja');

  if (isPlayerNinja) {
    return (
      itemClass === 'ninja' ||
      itemClass === 'assassin' ||
      itemSet === 'assassin' ||
      itemSet === 'ninja' ||
      itemClassName.includes('ninja')
    );
  }

  // Savaşçı desteği
  const isPlayerWarrior =
    playerClass === 'warrior' ||
    playerClassName.includes('savaşçı');

  if (isPlayerWarrior) {
    return (
      itemClass === 'warrior' ||
      itemSet === 'warrior' ||
      itemClassName.includes('savaşçı')
    );
  }

  // Büyücü desteği
  const isPlayerMage =
    playerClass === 'mage' ||
    playerClassName.includes('büyücü');

  if (isPlayerMage) {
    return (
      itemClass === 'mage' ||
      itemSet === 'mage' ||
      itemClassName.includes('büyücü')
    );
  }

  return itemClass === playerClass || itemClassName === playerClassName;
}

/**
 * Verilen eşyanın ilgili ekipman yuvasına uyup uymadığını kontrol eder.
 */
export function isItemForSlot(item, slotId) {
  if (!item || !slotId) return false;
  if (item.isOre || item.type === 'ore') return false;

  // Yüzük 1 ve Yüzük 2 yuvaları birbirinin eşyalarını da kabul edebilir
  if (slotId === 'ring1' || slotId === 'ring2') {
    return item.slot === 'ring1' || item.slot === 'ring2' || item.slot === 'ring';
  }

  return item.slot === slotId;
}

