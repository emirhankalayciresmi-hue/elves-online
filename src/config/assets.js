/**
 * ASSET YAPILANDIRMASI
 * 
 * Oyunda kullanılan tüm görsel ve ikonların merkezi tanımları.
 */

export const ASSETS = {
  // Arka plan görselleri
  backgrounds: {
    desktopWallpaper: null,
    mobileContainer: null,
  },

  // 4 Krallık Görselleri: Manzara (Banner), Krallık Bayrağı (Crest/Flag) ve Kutsal Elf Ağacı (Tree)
  kingdoms: {
    aeltherin: {
      banner: '/assets/kingdoms/aeltherin_landscape.jpg',
      crest: '/assets/kingdoms/aeltherin_flag.jpg',
      tree: '/assets/trees/tree_aeltherin.jpg',
    },
    sylvandar: {
      banner: '/assets/kingdoms/sylvandar_landscape.jpg',
      crest: '/assets/kingdoms/sylvandar_flag.jpg',
      tree: '/assets/trees/tree_sylvandar.jpg',
    },
    lorvathiel: {
      banner: '/assets/kingdoms/lorvathiel_landscape.jpg',
      crest: '/assets/kingdoms/lorvathiel_flag.jpg',
      tree: '/assets/trees/tree_lorvathiel.jpg',
    },
    ithilmar: {
      banner: '/assets/kingdoms/ithilmar_landscape.jpg',
      crest: '/assets/kingdoms/ithilmar_flag.jpg',
      tree: '/assets/trees/tree_ithilmar.jpg',
    },
  },

  // 4 Kadim Büyük Elf Ağacı
  trees: {
    aeltherin: '/assets/trees/tree_aeltherin.jpg',
    sylvandar: '/assets/trees/tree_sylvandar.jpg',
    lorvathiel: '/assets/trees/tree_lorvathiel.jpg',
    ithilmar: '/assets/trees/tree_ithilmar.jpg',
  },

  // 6 Adet Avatar İkonu (3 Kız, 3 Erkek)
  avatars: {
    female_warrior: '/assets/avatars/female_warrior.jpg',
    female_ninja: '/assets/avatars/female_assassin.jpg',
    female_assassin: '/assets/avatars/female_assassin.jpg',
    female_mage: '/assets/avatars/female_mage.jpg',
    male_warrior: '/assets/avatars/male_warrior.jpg',
    male_ninja: '/assets/avatars/male_assassin.jpg',
    male_assassin: '/assets/avatars/male_assassin.jpg',
    male_mage: '/assets/avatars/male_mage.jpg',
  },

  // Sınıf Portreleri ve Büyük Tanıtım Görselleri
  classes: {
    warrior: {
      female: '/assets/avatars/female_warrior.jpg',
      male: '/assets/avatars/male_warrior.jpg',
      portrait: '/assets/avatars/female_warrior.jpg',
      showcase: '/assets/classes/class_warrior.jpg',
      icon: null,
    },
    ninja: {
      female: '/assets/avatars/female_assassin.jpg',
      male: '/assets/avatars/male_assassin.jpg',
      portrait: '/assets/avatars/female_assassin.jpg',
      showcase: '/assets/classes/class_ninja.jpg',
      icon: null,
    },
    assassin: {
      female: '/assets/avatars/female_assassin.jpg',
      male: '/assets/avatars/male_assassin.jpg',
      portrait: '/assets/avatars/female_assassin.jpg',
      showcase: '/assets/classes/class_ninja.jpg',
      icon: null,
    },
    mage: {
      female: '/assets/avatars/female_mage.jpg',
      male: '/assets/avatars/male_mage.jpg',
      portrait: '/assets/avatars/female_mage.jpg',
      showcase: '/assets/classes/class_mage.jpg',
      icon: null,
    },
  },

  // 12 Kuşanılabilir Ekipman Yuvaları
  equipment: {
    helmet: null,
    armor: null,
    weapon: null,
    offhand: null,
    necklace: null,
    ring1: null,
    ring2: null,
    gloves: null,
    boots: null,
    belt: null,
    cloak: null,
    wings: null,
  },

  // Alt Menü İkonları
  navIcons: {
    character: null,
    quests: null,
    kingdom: null,
    inventory: null,
    settings: null,
  },

  // Üst Bar Kaynak İkonları
  resources: {
    gold: null,
    crystal: null,
    energy: null,
  },
};
