// src/services/guildService.js
import { GUILD_CREATION_COST, GUILD_CREATION_MIN_LEVEL, GUILD_SKILLS } from '../config/guildData';

export function joinGuildService(player, guildId, guilds) {
  if (!player) return { success: false, error: 'Oyuncu bulunamadı.' };
  if (player.guild?.id) {
    return { success: false, error: 'Zaten bir loncaya üyesiniz. Önce mevcut loncanızdan ayrılmalısınız.' };
  }

  const guildIndex = guilds.findIndex((g) => g.id === guildId);
  if (guildIndex === -1) {
    return { success: false, error: 'Lonca bulunamadı.' };
  }

  const guild = guilds[guildIndex];
  if (player.level < guild.minLevel) {
    return { success: false, error: `Bu loncaya katılmak için en az Seviye ${guild.minLevel} olmalısınız.` };
  }

  const maxMembers = 20 + guild.level * 2;
  if (guild.members.length >= maxMembers) {
    return { success: false, error: 'Lonca üye kapasitesi dolu.' };
  }

  const newMember = {
    name: player.name || 'Gizemli Elf',
    level: player.level || 1,
    class: player.class || 'Savaşçı',
    rank: 'Üye',
    contributionExp: 0,
    contributionGold: 0,
    online: true,
  };

  const updatedGuild = {
    ...guild,
    members: [...guild.members, newMember],
  };

  const updatedGuilds = [...guilds];
  updatedGuilds[guildIndex] = updatedGuild;

  const updatedPlayer = {
    ...player,
    guild: {
      id: updatedGuild.id,
      name: updatedGuild.name,
      rank: 'Üye',
      flagId: updatedGuild.flagId,
    },
  };

  return {
    success: true,
    player: updatedPlayer,
    guilds: updatedGuilds,
    message: `[${updatedGuild.name}] loncasına başarıyla katıldınız!`,
  };
}

export function createGuildService(player, guildParams, guilds) {
  if (!player) return { success: false, error: 'Oyuncu bulunamadı.' };
  if (player.guild?.id) {
    return { success: false, error: 'Zaten bir loncanız var!' };
  }
  if ((player.level || 1) < GUILD_CREATION_MIN_LEVEL) {
    return { success: false, error: `Lonca kurmak için en az Seviye ${GUILD_CREATION_MIN_LEVEL} olmalısınız!` };
  }
  if ((player.gold || 0) < GUILD_CREATION_COST) {
    return { success: false, error: `Lonca kurmak için ${GUILD_CREATION_COST.toLocaleString()} Altın gereklidir!` };
  }

  const rawName = (guildParams.name || '').trim();
  if (rawName.length < 3 || rawName.length > 20) {
    return { success: false, error: 'Lonca ismi 3 ile 20 karakter arasında olmalıdır.' };
  }

  const nameExists = guilds.some((g) => g.name.toLowerCase() === rawName.toLowerCase());
  if (nameExists) {
    return { success: false, error: 'Bu lonca ismi zaten kullanılıyor. Lütfen başka bir isim seçin.' };
  }

  const newGuildId = 'guild_' + Date.now();
  const flagId = guildParams.flagId || 1;

  const newGuild = {
    id: newGuildId,
    name: rawName,
    leader: player.name || 'Kadim Lider',
    kingdom: player.kingdom || 'Aeltherin',
    flagId,
    level: 1,
    exp: 0,
    maxExp: 2000,
    vaultGold: 0,
    motto: guildParams.motto?.trim() || 'Kadim Elflerin Yıkılmaz Birliği!',
    notice: guildParams.notice?.trim() || 'Yeni kurulan loncamıza hoş geldiniz!',
    minLevel: Math.max(1, parseInt(guildParams.minLevel, 10) || 1),
    isOpen: guildParams.isOpen ?? true,
    skills: {
      dragon_rage: 0,
      spring_of_life: 0,
      iron_skin: 0,
      ancient_wisdom: 0,
      swift_steps: 0,
    },
    members: [
      {
        name: player.name || 'Kadim Lider',
        level: player.level || 10,
        class: player.class || 'Savaşçı',
        rank: 'Lider',
        contributionExp: 0,
        contributionGold: GUILD_CREATION_COST,
        online: true,
      },
    ],
  };

  const updatedPlayer = {
    ...player,
    gold: (player.gold || 0) - GUILD_CREATION_COST,
    guild: {
      id: newGuild.id,
      name: newGuild.name,
      rank: 'Lider',
      flagId: newGuild.flagId,
    },
  };

  const updatedGuilds = [newGuild, ...guilds];

  return {
    success: true,
    player: updatedPlayer,
    guilds: updatedGuilds,
    message: `Tebrikler! [${newGuild.name}] loncası başarıyla kuruldu!`,
  };
}

export function leaveGuildService(player, guilds) {
  if (!player?.guild?.id) {
    return { success: false, error: 'Herhangi bir loncaya üye değilsiniz.' };
  }

  const guildIndex = guilds.findIndex((g) => g.id === player.guild.id);
  if (guildIndex === -1) {
    const updatedPlayer = { ...player, guild: null };
    return { success: true, player: updatedPlayer, guilds, message: 'Lonca kaydı temizlendi.' };
  }

  const guild = guilds[guildIndex];
  const isLeader = player.guild.rank === 'Lider' || guild.leader === player.name;

  let updatedGuilds = [...guilds];

  if (isLeader) {
    // Lider loncadan ayrıldığında lonca feshedilir
    updatedGuilds = updatedGuilds.filter((g) => g.id !== guild.id);
  } else {
    // Normal üye ayrılır
    const updatedMembers = guild.members.filter((m) => m.name !== player.name);
    updatedGuilds[guildIndex] = {
      ...guild,
      members: updatedMembers,
    };
  }

  const updatedPlayer = {
    ...player,
    guild: null,
  };

  return {
    success: true,
    player: updatedPlayer,
    guilds: updatedGuilds,
    message: isLeader ? `[${guild.name}] loncası feshedildi.` : `[${guild.name}] loncasından ayrıldınız.`,
  };
}

export function donateGoldService(player, amount, guilds) {
  if (!player?.guild?.id) return { success: false, error: 'Bir loncada değilsiniz.' };
  const numAmount = Math.floor(Number(amount));
  if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: 'Geçersiz altın miktarı.' };
  if ((player.gold || 0) < numAmount) return { success: false, error: 'Yeterli altınınız yok!' };

  const guildIndex = guilds.findIndex((g) => g.id === player.guild.id);
  if (guildIndex === -1) return { success: false, error: 'Lonca bulunamadı.' };

  const guild = guilds[guildIndex];
  const updatedMembers = guild.members.map((m) => {
    if (m.name === player.name) {
      return { ...m, contributionGold: (m.contributionGold || 0) + numAmount };
    }
    return m;
  });

  const updatedGuild = {
    ...guild,
    vaultGold: (guild.vaultGold || 0) + numAmount,
    members: updatedMembers,
  };

  const updatedGuilds = [...guilds];
  updatedGuilds[guildIndex] = updatedGuild;

  const updatedPlayer = {
    ...player,
    gold: (player.gold || 0) - numAmount,
  };

  return {
    success: true,
    player: updatedPlayer,
    guilds: updatedGuilds,
    message: `${numAmount.toLocaleString()} Altın lonca kasasına bağışlandı!`,
  };
}

export function donateExpService(player, amount, guilds) {
  if (!player?.guild?.id) return { success: false, error: 'Bir loncada değilsiniz.' };
  const numAmount = Math.floor(Number(amount));
  if (isNaN(numAmount) || numAmount <= 0) return { success: false, error: 'Geçersiz EXP miktarı.' };
  if ((player.exp || 0) < numAmount) return { success: false, error: 'Yeterli EXP puanınız yok!' };

  const guildIndex = guilds.findIndex((g) => g.id === player.guild.id);
  if (guildIndex === -1) return { success: false, error: 'Lonca bulunamadı.' };

  const guild = { ...guilds[guildIndex] };
  let newExp = (guild.exp || 0) + numAmount;
  let newLevel = guild.level || 1;
  let maxExp = guild.maxExp || (newLevel + 1) * 1000;

  // Seviye atlama kontrolü (Maksimum 20. Seviye)
  let leveledUp = false;
  while (newExp >= maxExp && newLevel < 20) {
    newExp -= maxExp;
    newLevel += 1;
    maxExp = (newLevel + 1) * 1000;
    leveledUp = true;
  }

  guild.level = newLevel;
  guild.exp = newExp;
  guild.maxExp = maxExp;
  guild.members = guild.members.map((m) => {
    if (m.name === player.name) {
      return { ...m, contributionExp: (m.contributionExp || 0) + numAmount };
    }
    return m;
  });

  const updatedGuilds = [...guilds];
  updatedGuilds[guildIndex] = guild;

  const updatedPlayer = {
    ...player,
    exp: (player.exp || 0) - numAmount,
  };

  return {
    success: true,
    player: updatedPlayer,
    guilds: updatedGuilds,
    message: leveledUp
      ? `Tebrikler! Loncanız ${newLevel}. Seviyeye yükseldi!`
      : `${numAmount.toLocaleString()} EXP loncaya bağışlandı!`,
  };
}

export function upgradeSkillService(player, skillId, guilds) {
  if (!player?.guild?.id) return { success: false, error: 'Bir loncada değilsiniz.' };
  const guildIndex = guilds.findIndex((g) => g.id === player.guild.id);
  if (guildIndex === -1) return { success: false, error: 'Lonca bulunamadı.' };

  const guild = { ...guilds[guildIndex] };
  const member = guild.members.find((m) => m.name === player.name);
  if (!member || (member.rank !== 'Lider' && member.rank !== 'General')) {
    return { success: false, error: 'Yetenek geliştirmek için Lider veya General olmalısınız!' };
  }

  const skillMeta = GUILD_SKILLS.find((s) => s.id === skillId);
  if (!skillMeta) return { success: false, error: 'Geçersiz yetenek.' };

  const currentLevel = guild.skills?.[skillId] || 0;
  if (currentLevel >= skillMeta.maxLevel) {
    return { success: false, error: `${skillMeta.name} zaten maksimum seviyede!` };
  }

  if ((guild.vaultGold || 0) < skillMeta.costGoldPerLevel) {
    return {
      success: false,
      error: `Lonca kasasında yeterli altın yok! (${skillMeta.costGoldPerLevel.toLocaleString()} Altın gerekir)`,
    };
  }

  guild.vaultGold -= skillMeta.costGoldPerLevel;
  guild.skills = {
    ...guild.skills,
    [skillId]: currentLevel + 1,
  };

  const updatedGuilds = [...guilds];
  updatedGuilds[guildIndex] = guild;

  return {
    success: true,
    guilds: updatedGuilds,
    message: `${skillMeta.name} yeteneği Seviye ${currentLevel + 1}'e yükseltildi!`,
  };
}
