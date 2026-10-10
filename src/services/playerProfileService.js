// src/services/playerProfileService.js
// Evrensel Oyuncu Profil Servisi
// Gerçek oyuncu ve diğer karakterlerin profil, ekipman ve analiz verilerini üretir.

import { ITEMS_DATABASE } from '@/core/config/itemsData';
import { DEFAULT_PLAYER_STATS, EQUIPMENT_SLOTS } from '@/core/config/gameData';
import { calculatePlayerStats } from '@/domain/characterStats';
import { ASSETS } from '@/core/config/assets';
import { calculateBadgeStats } from '@/domain/questEngine';
import { loadGuildsFromStorage } from '@/core/config/guildData';

// İsimden sabit sayısal hash üretici (Deterministik sahte veriler için)
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Oyuncu profil verisini derle
export function getPlayerProfile(playerInfo, activePlayer = null, guildsList = null) {
  if (!playerInfo) return null;

  const guilds = guildsList || loadGuildsFromStorage();
  const rawName = typeof playerInfo === 'string' ? playerInfo : playerInfo.name || playerInfo.sender || 'Kadim Elf';

  // 1. Kendi karakterimizi mi inceliyoruz?
  const isSelf = activePlayer && (rawName === activePlayer.name || playerInfo.isMe);

  if (isSelf) {
    const classId = activePlayer.classId || activePlayer.class || 'warrior';
    const gender = activePlayer.gender || 'female';
    const avatarKey = `${gender}_${classId}`;
    const avatar = ASSETS.avatars?.[avatarKey] || activePlayer.classImage || '/assets/avatars/female_warrior.jpg';

    // Gerçek oyuncu istatistikleri
    const badgeBonus = calculateBadgeStats(activePlayer.questState?.badgeProgress);
    const stats = calculatePlayerStats(activePlayer, badgeBonus);

    return {
      isSelf: true,
      name: activePlayer.name,
      level: activePlayer.level || 1,
      exp: activePlayer.exp || 0,
      maxExp: activePlayer.maxExp || 1000,
      classId,
      className: activePlayer.className || (classId === 'warrior' ? 'Savaşçı' : classId === 'assassin' ? 'Assassin' : 'Büyücü'),
      gender,
      avatar,
      kingdom: activePlayer.kingdom || 'Aeltherin',
      kingdomName: activePlayer.kingdomName || 'Aeltherin Krallığı',
      guild: activePlayer.guild || null,
      equipped: activePlayer.equipped || {},
      stats,
      title: activePlayer.level >= 20 ? 'Kadim Efsane' : activePlayer.level >= 10 ? 'Usta Muhafız' : 'Genç Çırak',
      online: true,
    };
  }

  // 2. Başka bir oyuncuyu inceliyoruz:
  const hash = hashString(rawName);

  // Sınıf belirleme
  let classId = 'warrior';
  if (playerInfo.senderClass || playerInfo.characterClass || playerInfo.class) {
    const c = (playerInfo.senderClass || playerInfo.characterClass || playerInfo.class).toLowerCase();
    if (c.includes('büyü') || c.includes('mage')) classId = 'mage';
    else if (c.includes('assassin') || c.includes('ninja') || c.includes('suikast')) classId = 'assassin';
    else classId = 'warrior';
  } else {
    const classes = ['warrior', 'assassin', 'mage'];
    classId = classes[hash % 3];
  }

  const className = classId === 'warrior' ? 'Savaşçı' : classId === 'assassin' ? 'Assassin' : 'Büyücü';

  // Cinsiyet ve Avatar
  const gender = hash % 2 === 0 ? 'female' : 'male';
  const avatarKey = `${gender}_${classId}`;
  const avatar = ASSETS.avatars?.[avatarKey] || '/assets/avatars/female_warrior.jpg';

  // Seviye
  const level = playerInfo.level || playerInfo.senderLevel || 12 + (hash % 28);

  // Krallık
  let kingdom = playerInfo.kingdom || playerInfo.senderKingdom;
  if (!kingdom) {
    const kingdoms = ['Aeltherin', 'Sylvandar', 'Lorvathiel', 'Ithilmar'];
    kingdom = kingdoms[hash % 4];
  }
  const kingdomName = kingdom.includes('Krallığı') ? kingdom : `${kingdom} Krallığı`;

  // Lonca Araştırması (Önce lonca listesine bakılır)
  let foundGuild = null;
  for (const g of guilds) {
    const memberMatch = g.members?.find((m) => m.name.toLowerCase() === rawName.toLowerCase());
    if (memberMatch) {
      foundGuild = {
        id: g.id,
        name: g.name,
        rank: memberMatch.rank || 'Üye',
        flagId: g.flagId,
        level: g.level,
      };
      break;
    }
  }

  if (!foundGuild && (hash % 3 !== 0)) {
    // Rastgele bir loncaya bağla
    const g = guilds[hash % guilds.length];
    if (g) {
      foundGuild = {
        id: g.id,
        name: g.name,
        rank: hash % 5 === 0 ? 'General' : 'Üye',
        flagId: g.flagId,
        level: g.level,
      };
    }
  }

  // Belirlenen sınıfa göre donatılacak eşyalar (ITEMS_DATABASE içinden)
  const classItems = ITEMS_DATABASE.filter((item) => item.classId === classId || item.setKey === classId);
  const equipped = {};

  EQUIPMENT_SLOTS.forEach((slotDef) => {
    // Seviyeye göre eşya takılı olma ihtimali
    const itemMatch = classItems.find((i) => i.slot === slotDef.id);
    if (itemMatch) {
      equipped[slotDef.id] = {
        ...itemMatch,
        instanceId: `inst_${rawName}_${slotDef.id}`,
      };
    }
  });

  // İstatistikler (Klasik MMORPG Değerleri)
  const baseHp = 500 + level * 40;
  const baseMana = 500 + level * 25;
  const str = classId === 'warrior' ? level * 3 : level;
  const agi = classId === 'assassin' ? level * 3 : level;
  const int = classId === 'mage' ? level * 3 : level;
  const stats = {
    ...DEFAULT_PLAYER_STATS,
    hp: baseHp,
    maxHp: baseHp,
    mana: baseMana,
    maxMana: baseMana,
    strength: str,
    agility: agi,
    intelligence: int,
    physicalDamage: 15 + str * 3,
    magicDamage: int * 3,
    defense: agi * 2,
    dodgeChance: Number((agi * 0.2).toFixed(1)),
    criticalChance: Number((agi * 0.2).toFixed(1)),
  };

  return {
    isSelf: false,
    name: rawName,
    level,
    exp: 450 + (hash % 500),
    maxExp: 1000 + level * 100,
    classId,
    className,
    gender,
    avatar,
    kingdom,
    kingdomName,
    guild: foundGuild,
    equipped,
    stats,
    title: level >= 35 ? 'Kadim Efsane' : level >= 25 ? 'Kıdemli Komutan' : level >= 15 ? 'Cesur Muhafız' : 'Gezgin',
    online: hash % 4 !== 0,
  };
}
