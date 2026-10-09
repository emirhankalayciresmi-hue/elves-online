// src/services/partyService.js
// Grup Yönetim Mantığı: Katılma, Kurma, Ayrılma, Dağıtma, Üye Atma, Liderlik Devri ve Metin2 Liderlik Rol Ataması

import { PARTY_TARGETS, LEADERSHIP_ROLES } from '../config/partyData';

/**
 * Gruba katılma servisi
 */
export function joinPartyService(player, partyId, parties) {
  if (!player) return { success: false, error: 'Oyuncu bulunamadı.' };
  if (player.party?.id) {
    return {
      success: false,
      error: 'Zaten bir gruptasınız! Yeni bir gruba katılmak için önce mevcut grubunuzdan ayrılmalısınız.',
    };
  }

  const partyIndex = parties.findIndex((p) => p.id === partyId);
  if (partyIndex === -1) {
    return { success: false, error: 'Grup bulunamadı veya dağıtılmış olabilir.' };
  }

  const party = parties[partyIndex];

  if ((player.level || 1) < (party.minLevel || 1)) {
    return {
      success: false,
      error: `Bu gruba katılmak için en az Seviye ${party.minLevel} olmalısınız! (Mevcut Seviyeniz: ${player.level || 1})`,
    };
  }

  if (party.members.length >= (party.maxMembers || 4)) {
    return { success: false, error: 'Bu grup tamamen dolu! Başka bir gruba katılmayı deneyin.' };
  }

  const isAlreadyMember = party.members.some(
    (m) => m.name.toLowerCase() === (player.name || '').toLowerCase()
  );
  if (isAlreadyMember) {
    return { success: false, error: 'Zaten bu grubun bir üyesisiniz.' };
  }

  const newMember = {
    name: player.name || 'Gizemli Elf',
    level: player.level || 1,
    class: player.className || player.class || 'Savaşçı',
    isLeader: false,
    hp: 2400 + (player.level || 1) * 150,
    maxHp: 2400 + (player.level || 1) * 150,
    isReady: true,
    roleId: null,
  };

  const updatedParty = {
    ...party,
    members: [...party.members, newMember],
  };

  const updatedParties = [...parties];
  updatedParties[partyIndex] = updatedParty;

  const updatedPlayer = {
    ...player,
    party: {
      id: updatedParty.id,
      name: updatedParty.name,
      isLeader: false,
      targetId: updatedParty.targetId,
      targetName: updatedParty.targetName,
    },
  };

  return {
    success: true,
    player: updatedPlayer,
    parties: updatedParties,
    party: updatedParty,
    message: `[${updatedParty.name}] grubuna başarıyla katıldınız!`,
  };
}

/**
 * Yeni grup kurma servisi
 */
export function createPartyService(player, partyParams, parties) {
  if (!player) return { success: false, error: 'Oyuncu bulunamadı.' };
  if (player.party?.id) {
    return { success: false, error: 'Zaten aktif bir grubunuz var. Önce gruptan ayrılmalısınız.' };
  }

  const rawName = (partyParams.name || '').trim();
  if (rawName.length < 3 || rawName.length > 25) {
    return { success: false, error: 'Grup adı 3 ile 25 karakter arasında olmalıdır.' };
  }

  const nameExists = parties.some((p) => p.name.toLowerCase() === rawName.toLowerCase());
  if (nameExists) {
    return { success: false, error: 'Bu grup adı zaten kullanılıyor. Lütfen farklı bir isim seçin.' };
  }

  const targetMeta = PARTY_TARGETS.find((t) => t.id === partyParams.targetId) || PARTY_TARGETS[0];
  const newPartyId = 'party_' + Date.now();

  const leaderMember = {
    name: player.name || 'Kadim Lider',
    level: player.level || 1,
    class: player.className || player.class || 'Savaşçı',
    isLeader: true,
    hp: 2800 + (player.level || 1) * 180,
    maxHp: 2800 + (player.level || 1) * 180,
    isReady: true,
    roleId: null,
  };

  const newParty = {
    id: newPartyId,
    name: rawName,
    leader: player.name || 'Kadim Lider',
    targetId: targetMeta.id,
    targetName: targetMeta.name,
    targetCategory: targetMeta.category,
    maxMembers: Number(partyParams.maxMembers) || 4,
    minLevel: Math.max(1, Number(partyParams.minLevel) || 1),
    distribution: partyParams.distribution || 'equal',
    isOpen: partyParams.isOpen ?? true,
    createdAt: new Date().toISOString(),
    members: [leaderMember],
  };

  const updatedParties = [newParty, ...parties];

  const updatedPlayer = {
    ...player,
    party: {
      id: newParty.id,
      name: newParty.name,
      isLeader: true,
      targetId: newParty.targetId,
      targetName: newParty.targetName,
    },
  };

  return {
    success: true,
    player: updatedPlayer,
    parties: updatedParties,
    party: newParty,
    message: `[${newParty.name}] grubu kuruldu! Lider sizsiniz.`,
  };
}

/**
 * Gruptan ayrılma servisi
 */
export function leavePartyService(player, parties) {
  if (!player?.party?.id) {
    return { success: false, error: 'Herhangi bir grupta değilsiniz.' };
  }

  const partyIndex = parties.findIndex((p) => p.id === player.party.id);
  if (partyIndex === -1) {
    const updatedPlayer = { ...player, party: null };
    return { success: true, player: updatedPlayer, parties, message: 'Gruptan ayrıldınız.' };
  }

  const party = parties[partyIndex];
  const remainingMembers = party.members.filter(
    (m) => m.name.toLowerCase() !== (player.name || '').toLowerCase()
  );

  let updatedParties;
  let msg;

  if (remainingMembers.length === 0) {
    // Grupta kimse kalmadı, grubu sil
    updatedParties = parties.filter((p) => p.id !== party.id);
    msg = `[${party.name}] grubundan ayrıldınız. Grupta üye kalmadığı için grup dağıtıldı.`;
  } else {
    // Eğer ayrılan liderse, sonraki ilk üyeyi lider yap
    let newLeaderName = party.leader;
    if (party.leader.toLowerCase() === (player.name || '').toLowerCase()) {
      remainingMembers[0] = { ...remainingMembers[0], isLeader: true };
      newLeaderName = remainingMembers[0].name;
      msg = `[${party.name}] grubundan ayrıldınız. Liderlik [${newLeaderName}] oyuncusuna devredildi.`;
    } else {
      msg = `[${party.name}] grubundan başarıyla ayrıldınız.`;
    }

    const updatedParty = {
      ...party,
      leader: newLeaderName,
      members: remainingMembers,
    };
    updatedParties = [...parties];
    updatedParties[partyIndex] = updatedParty;
  }

  const updatedPlayer = {
    ...player,
    party: null,
  };

  return {
    success: true,
    player: updatedPlayer,
    parties: updatedParties,
    message: msg,
  };
}

/**
 * Grubu dağıtma servisi (Sadece lider)
 */
export function disbandPartyService(player, partyId, parties) {
  const party = parties.find((p) => p.id === partyId);
  if (!party) {
    return { success: false, error: 'Grup bulunamadı.' };
  }

  if (party.leader.toLowerCase() !== (player?.name || '').toLowerCase()) {
    return { success: false, error: 'Yalnızca grup lideri grubu dağıtabilir!' };
  }

  const updatedParties = parties.filter((p) => p.id !== partyId);
  const updatedPlayer = {
    ...player,
    party: null,
  };

  return {
    success: true,
    player: updatedPlayer,
    parties: updatedParties,
    message: `[${party.name}] grubu lider tarafından dağıtıldı.`,
  };
}

/**
 * Üyeyi gruptan atma servisi (Sadece lider)
 */
export function kickPartyMemberService(player, targetMemberName, parties) {
  if (!player?.party?.id) {
    return { success: false, error: 'Herhangi bir grupta değilsiniz.' };
  }

  const partyIndex = parties.findIndex((p) => p.id === player.party.id);
  if (partyIndex === -1) {
    return { success: false, error: 'Grup bulunamadı.' };
  }

  const party = parties[partyIndex];
  if (party.leader.toLowerCase() !== (player?.name || '').toLowerCase()) {
    return { success: false, error: 'Yalnızca grup lideri üye atabilir!' };
  }

  if (targetMemberName.toLowerCase() === (player?.name || '').toLowerCase()) {
    return { success: false, error: 'Kendinizi gruptan atamazsınız. Ayrılmak için "Gruptan Ayrıl" seçeneğini kullanın.' };
  }

  const updatedMembers = party.members.filter(
    (m) => m.name.toLowerCase() !== targetMemberName.toLowerCase()
  );

  const updatedParty = {
    ...party,
    members: updatedMembers,
  };

  const updatedParties = [...parties];
  updatedParties[partyIndex] = updatedParty;

  return {
    success: true,
    parties: updatedParties,
    party: updatedParty,
    message: `[${targetMemberName}] gruptan çıkarıldı.`,
  };
}

/**
 * Liderliği başka bir üyeye devretme servisi
 */
export function promoteLeaderService(player, targetMemberName, parties) {
  if (!player?.party?.id) {
    return { success: false, error: 'Herhangi bir grupta değilsiniz.' };
  }

  const partyIndex = parties.findIndex((p) => p.id === player.party.id);
  if (partyIndex === -1) {
    return { success: false, error: 'Grup bulunamadı.' };
  }

  const party = parties[partyIndex];
  if (party.leader.toLowerCase() !== (player?.name || '').toLowerCase()) {
    return { success: false, error: 'Yalnızca mevcut lider liderliği devredebilir!' };
  }

  const updatedMembers = party.members.map((m) => {
    if (m.name.toLowerCase() === targetMemberName.toLowerCase()) {
      return { ...m, isLeader: true };
    }
    if (m.name.toLowerCase() === (player.name || '').toLowerCase()) {
      return { ...m, isLeader: false };
    }
    return m;
  });

  const updatedParty = {
    ...party,
    leader: targetMemberName,
    members: updatedMembers,
  };

  const updatedParties = [...parties];
  updatedParties[partyIndex] = updatedParty;

  const updatedPlayer = {
    ...player,
    party: {
      ...player.party,
      isLeader: false,
    },
  };

  return {
    success: true,
    player: updatedPlayer,
    parties: updatedParties,
    party: updatedParty,
    message: `Grup liderliği başarıyla [${targetMemberName}] oyuncusuna devredildi.`,
  };
}

/**
 * Metin2 Liderlik Rol Ataması (Saldırı / Savunma / Maks HP vb.)
 */
export function assignLeadershipRoleService(player, targetMemberName, roleId, parties) {
  if (!player?.party?.id) {
    return { success: false, error: 'Herhangi bir grupta değilsiniz.' };
  }

  const partyIndex = parties.findIndex((p) => p.id === player.party.id);
  if (partyIndex === -1) {
    return { success: false, error: 'Grup bulunamadı.' };
  }

  const party = parties[partyIndex];
  if (party.leader.toLowerCase() !== (player?.name || '').toLowerCase()) {
    return { success: false, error: 'Yalnızca grup lideri Liderlik Rolleri atayabilir!' };
  }

  const roleMeta = LEADERSHIP_ROLES.find((r) => r.id === roleId);

  // Metin2 Kuralı: Aynı rol partide birden fazla üyeye aynı anda verilemez.
  // Eğer rol atanıyorsa, diğer üyelerde bu rol varsa kaldırılır.
  const updatedMembers = party.members.map((m) => {
    if (m.name.toLowerCase() === targetMemberName.toLowerCase()) {
      return { ...m, roleId: roleId };
    }
    if (roleId && m.roleId === roleId) {
      return { ...m, roleId: null };
    }
    return m;
  });

  const updatedParty = {
    ...party,
    members: updatedMembers,
  };

  const updatedParties = [...parties];
  updatedParties[partyIndex] = updatedParty;

  const roleLabel = roleMeta ? roleMeta.name : 'Rol Kaldırıldı';
  return {
    success: true,
    parties: updatedParties,
    party: updatedParty,
    message: `[${targetMemberName}] oyuncusuna "${roleLabel}" rolü atandı!`,
  };
}

/**
 * Hazır olma durumunu değiştirme (Ready Check)
 */
export function toggleMemberReadyService(player, parties) {
  if (!player?.party?.id) {
    return { success: false, error: 'Herhangi bir grupta değilsiniz.' };
  }

  const partyIndex = parties.findIndex((p) => p.id === player.party.id);
  if (partyIndex === -1) {
    return { success: false, error: 'Grup bulunamadı.' };
  }

  const party = parties[partyIndex];
  const updatedMembers = party.members.map((m) => {
    if (m.name.toLowerCase() === (player.name || '').toLowerCase()) {
      return { ...m, isReady: !m.isReady };
    }
    return m;
  });

  const myState = updatedMembers.find(
    (m) => m.name.toLowerCase() === (player.name || '').toLowerCase()
  );

  const updatedParty = {
    ...party,
    members: updatedMembers,
  };

  const updatedParties = [...parties];
  updatedParties[partyIndex] = updatedParty;

  return {
    success: true,
    parties: updatedParties,
    party: updatedParty,
    isReady: myState?.isReady,
    message: myState?.isReady ? 'Hazır durumundasınız! ⚔️' : 'Beklemede durumundasınız.',
  };
}

/**
 * Başka bir oyuncuyu partiye davet etme
 */
export function invitePlayerToPartyService(player, targetName, parties) {
  if (!player?.party?.id) {
    return {
      success: false,
      error: 'Bir oyuncuyu davet etmek için önce bir grubunuz olmalıdır.',
    };
  }

  const partyIndex = parties.findIndex((p) => p.id === player.party.id);
  if (partyIndex === -1) {
    return { success: false, error: 'Grup bulunamadı.' };
  }

  const party = parties[partyIndex];
  if (party.members.length >= (party.maxMembers || 4)) {
    return { success: false, error: 'Grup kapasitesi dolu olduğundan davet gönderilemiyor.' };
  }

  const alreadyInParty = party.members.some(
    (m) => m.name.toLowerCase() === targetName.toLowerCase()
  );
  if (alreadyInParty) {
    return { success: false, error: `[${targetName}] zaten grubunuzda yer alıyor.` };
  }

  // MMORPG simülasyonu: Davet edilen oyuncu gruba kabul eder ve katılır
  const mockClasses = ['Savaşçı', 'Büyücü', 'Okçu', 'Assassin'];
  const randomClass = mockClasses[Math.floor(Math.random() * mockClasses.length)];
  const randomLevel = Math.max(party.minLevel || 1, Math.floor(Math.random() * 8) + 5);

  const newMember = {
    name: targetName,
    level: randomLevel,
    class: randomClass,
    isLeader: false,
    hp: 500 + randomLevel * 60,
    maxHp: 500 + randomLevel * 60,
    isReady: true,
    roleId: null,
  };

  const updatedParty = {
    ...party,
    members: [...party.members, newMember],
  };

  const updatedParties = [...parties];
  updatedParties[partyIndex] = updatedParty;

  return {
    success: true,
    parties: updatedParties,
    party: updatedParty,
    message: `[${targetName}] grup davetini kabul etti ve gruba katıldı!`,
  };
}
