import { supabase } from '@/core/supabase/supabaseClient';

/**
 * Elves Online - Cloud Character Persistence & Leaderboard Service
 * Powered by Supabase PostgreSQL
 */

export async function fetchTopLeaderboard(limit = 25) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('id, name, kingdom_id, class_id, level, exp, gold, created_at, last_active_at')
      .order('level', { ascending: false })
      .order('exp', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Leaderboard fetch warning:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Leaderboard fetch exception:', err);
    return [];
  }
}

export async function checkCharacterNameAvailable(name) {
  try {
    const cleanName = name.trim();
    if (!cleanName) return false;
    const { data, error } = await supabase
      .from('characters')
      .select('id')
      .ilike('name', cleanName)
      .limit(1);

    if (error) {
      console.warn('Name availability check warning:', error.message);
      return true; // Don't block offline play
    }
    return !data || data.length === 0;
  } catch (err) {
    console.error('Name check exception:', err);
    return true;
  }
}

export async function fetchCharacterByUserId(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Fetch character by user_id warning:', error.message);
      return null;
    }
    return data ? mapCloudCharacterToPlayer(data) : null;
  } catch (err) {
    console.error('Fetch character exception:', err);
    return null;
  }
}

export async function saveCharacterToCloud(player, userId = null) {
  if (!player || !player.name) return { success: false, error: 'Karakter bilgisi eksik.' };

  const cloudPayload = {
    name: player.name,
    kingdom_id: player.kingdomId || 'sylvaen',
    class_id: player.classId || 'okcu',
    gender: player.gender || 'female',
    level: Number(player.level) || 1,
    exp: Number(player.exp) || 0,
    gold: Number(player.gold) || 0,
    crystals: Number(player.crystals) || 0,
    hp: Number(player.hp) || 500,
    max_hp: Number(player.maxHp) || 500,
    mana: Number(player.mana) || 500,
    max_mana: Number(player.maxMana) || 500,
    stat_points: Number(player.statPoints) || 0,
    allocated_stats: player.allocatedStats || { hp: 0, str: 0, agi: 0, int: 0 },
    equipped: player.equipped || {},
    inventory: player.inventory || [],
    skills: player.skills || [],
    active_buffs: player.activeBuffs || [],
    last_active_at: new Date().toISOString(),
  };

  if (userId) {
    cloudPayload.user_id = userId;
  }

  try {
    const { error } = await supabase
      .from('characters')
      .upsert(cloudPayload, { onConflict: 'name' });

    if (error) {
      console.warn('Cloud save warning:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('Cloud save exception:', err);
    return { success: false, error: err.message };
  }
}

// Convert DB snake_case columns to app player state
export function mapCloudCharacterToPlayer(cloudChar) {
  if (!cloudChar) return null;
  return {
    id: cloudChar.id,
    userId: cloudChar.user_id,
    name: cloudChar.name,
    kingdomId: cloudChar.kingdom_id,
    kingdomName:
      cloudChar.kingdom_id === 'sylvaen'
        ? 'Sylvaen Orman Hanedanı'
        : cloudChar.kingdom_id === 'ithilmar'
        ? 'Ithilmar Ay Krallığı'
        : 'Lorvathiel Gölge Muhafızları',
    classId: cloudChar.class_id,
    className:
      cloudChar.class_id === 'okcu'
        ? 'Orman Okçusu'
        : cloudChar.class_id === 'druid'
        ? 'Kadim Druid'
        : cloudChar.class_id === 'suikastci'
        ? 'Gölge Suikastçısı'
        : cloudChar.class_id === 'savasci'
        ? 'Ithilmar Muhafızı'
        : 'Ay Büyücüsü',
    gender: cloudChar.gender || 'female',
    level: Number(cloudChar.level) || 1,
    exp: Number(cloudChar.exp) || 0,
    gold: Number(cloudChar.gold) || 0,
    crystals: Number(cloudChar.crystals) || 0,
    hp: Number(cloudChar.hp) || 500,
    maxHp: Number(cloudChar.max_hp) || 500,
    mana: Number(cloudChar.mana) || 500,
    maxMana: Number(cloudChar.max_mana) || 500,
    statPoints: Number(cloudChar.stat_points) || 0,
    allocatedStats: cloudChar.allocated_stats || { hp: 0, str: 0, agi: 0, int: 0 },
    equipped: cloudChar.equipped || {},
    inventory: cloudChar.inventory || [],
    skills: cloudChar.skills || [],
    activeBuffs: cloudChar.active_buffs || [],
    createdAt: cloudChar.created_at,
    lastActiveAt: cloudChar.last_active_at,
  };
}

let syncTimeout = null;
let lastSyncTime = 0;

export function debouncedSyncPlayerToCloud(player, userId = null, delay = 5000) {
  if (!player || !player.name) return;
  if (syncTimeout) clearTimeout(syncTimeout);

  const now = Date.now();
  const effectiveDelay = now - lastSyncTime > 60000 ? 1000 : delay;

  syncTimeout = setTimeout(() => {
    lastSyncTime = Date.now();
    saveCharacterToCloud(player, userId);
  }, effectiveDelay);
}

export async function updatePlayerHeartbeat(characterName) {
  if (!characterName) return;
  try {
    await supabase
      .from('characters')
      .update({ last_active_at: new Date().toISOString() })
      .ilike('name', characterName.trim());
  } catch (e) {
    // ignore background heartbeat errors
  }
}

export async function fetchPlayerCounts() {
  try {
    // 1. Toplam Oyuncu Sayısı: characters tablosundaki net toplam satır sayısı
    const { count: total, error: totalErr } = await supabase
      .from('characters')
      .select('id', { count: 'exact', head: true });

    const totalCount = !totalErr && typeof total === 'number' ? total : 0;

    // 2. Online Oyuncu Sayısı: Son 5 dakika içinde aktif olan karakterler
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: online, error: onlineErr } = await supabase
      .from('characters')
      .select('id', { count: 'exact', head: true })
      .gte('last_active_at', fiveMinutesAgo);

    const onlineCount = !onlineErr && typeof online === 'number' ? online : 0;

    return {
      totalCount,
      onlineCount,
    };
  } catch (err) {
    console.warn('Error fetching player counts from DB:', err);
    return {
      totalCount: 0,
      onlineCount: 0,
    };
  }
}


