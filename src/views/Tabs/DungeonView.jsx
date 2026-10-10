import React, { useState, useEffect } from 'react';
import {
  Skull, Swords, Clock, Award, ShieldAlert, Sparkles,
  Trophy, XCircle, Package
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import { ALL_MENUS } from '../../config/gameData';
import { DUNGEON_GROUPS, getMonsterName } from '../../config/dungeonData';

const LEVEL_BRACKET_TABS = [
  { id: 'all', label: 'Tüm Zindanlar (20)' },
  { id: '1-30', label: '1 - 30 Seviye' },
  { id: '31-60', label: '31 - 60 Seviye' },
  { id: '61-80', label: '61 - 80 Seviye' },
  { id: '81-100', label: '81 - 100 Seviye' },
];

export default function DungeonView({
  player,
  layoutMode = 'mobile',
  onStartDungeon,
  onCancelDungeon,
  onDismissReport,
}) {
  const [activeSubmenu, setActiveSubmenu] = useState('solo');
  const [selectedBracket, setSelectedBracket] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [claimCelebration, setClaimCelebration] = useState(null);

  // Sync celebration modal when dungeon finishes
  useEffect(() => {
    if (player?.lastDungeonReport) {
      setClaimCelebration(player.lastDungeonReport);
    }
  }, [player?.lastDungeonReport]);

  const isPC = layoutMode === 'pc';
  const submenus = ALL_MENUS.find((m) => m.id === 'dungeon')?.submenus || [];
  const playerLevel = player?.level || 1;

  // Real-time ticking timer for active dungeon countdown
  useEffect(() => {
    if (!player?.activeDungeon) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [player?.activeDungeon]);

  const activeDungeon = player?.activeDungeon;

  // Calculate live dungeon progress
  let elapsedSeconds = 0;
  let durationSeconds = 1800; // 30 minutes default
  let progressPercent = 0;
  let remainingSeconds = 1800;
  let isCompleted = false;
  let currentMonsterIndex = 0;

  if (activeDungeon) {
    durationSeconds = activeDungeon.durationSeconds || 1800;
    const start = activeDungeon.startTime || currentTime;
    elapsedSeconds = Math.max(0, Math.floor((currentTime - start) / 1000));
    progressPercent = Math.min(100, Math.floor((elapsedSeconds / durationSeconds) * 100));
    remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
    isCompleted = progressPercent >= 100;

    // 5 monsters: each spans 20%
    currentMonsterIndex = Math.min(4, Math.floor(progressPercent / 20));
  }

  // Filtered solo dungeons by level bracket
  const filteredDungeons = DUNGEON_GROUPS.filter((d) => {
    if (selectedBracket === 'all') return true;
    return d.bracket === selectedBracket;
  });

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulated live combat battle log
  const getBattleLogs = () => {
    if (!activeDungeon || !activeDungeon.monsters) return [];
    const m0 = getMonsterName(activeDungeon.monsters[0]);
    const m1 = getMonsterName(activeDungeon.monsters[1]);
    const m2 = getMonsterName(activeDungeon.monsters[2]);
    const m3 = getMonsterName(activeDungeon.monsters[3]);
    const m4 = getMonsterName(activeDungeon.monsters[4]);

    const logs = [
      { text: `⚔️ Zindana giriş yapıldı: "${activeDungeon.name}". Kadim rünler uyanıyor.`, type: 'info' },
      { text: `Savaş başladı: 1. Canavar slotu [${m0}] ile dövüşülüyor.`, type: 'combat' },
    ];

    if (currentMonsterIndex >= 1 || isCompleted) {
      logs.push({ text: `✓ [${m0}] mağlup edildi! Zindanın derinliklerine inildi.`, type: 'success' });
      logs.push({ text: `2. Canavar slotu [${m1}] savuşturuldu!`, type: 'combat' });
    }
    if (currentMonsterIndex >= 2 || isCompleted) {
      logs.push({ text: `✓ [${m1}] can verdi! Tecrübe kazanımı artıyor.`, type: 'success' });
      logs.push({ text: `3. Canavar slotu [${m2}] ile amansız çatışma.`, type: 'combat' });
    }
    if (currentMonsterIndex >= 3 || isCompleted) {
      logs.push({ text: `✓ [${m2}] bertaraf edildi!`, type: 'success' });
      logs.push({ text: `4. Canavar slotu [${m3}] saldırıya geçti!`, type: 'combat' });
    }
    if (currentMonsterIndex >= 4 || isCompleted) {
      logs.push({ text: `✓ [${m3}] yere serildi!`, type: 'success' });
      logs.push({ text: `🔥 SON CANAVAR [${m4}] alana girdi! Tüm güçle saldırılıyor.`, type: 'boss' });
    }
    if (isCompleted) {
      logs.push({ text: `🏆 ZAFER! [${m4}] yenildi! Zindan tamamen temizlendi!`, type: 'victory' });
    }

    return logs.slice(-5);
  };

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Level Up / Claim Celebration Modal */}
      {claimCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <OrnateFrame className="p-6 max-w-md w-full text-center space-y-4 border-amber-400 shadow-2xl shadow-amber-500/20 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center animate-bounce">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400">
                Zindan Başarıyla Temizlendi!
              </span>
              <h3 className="text-2xl font-cinzel font-bold text-amber-100 gold-text-glow">
                {claimCelebration.leveledUp ? '🎉 SEVİYE ATLANDI!' : '✨ GİZEMLİ ZAFER ÖDÜLLERİ'}
              </h3>
            </div>

            {claimCelebration.leveledUp && (
              <div className="p-3 rounded bg-amber-950/60 border border-amber-500/40 text-amber-200">
                <span className="text-xs font-mono block">YENİ SEVİYENİZ:</span>
                <span className="text-3xl font-cinzel font-bold text-amber-300">
                  SEVİYE {claimCelebration.level}
                </span>
                {claimCelebration.levelsGained > 1 && (
                  <span className="text-xs text-emerald-400 block mt-1 font-mono">
                    (+{claimCelebration.levelsGained} Seviye Birden Yükseldiniz!)
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-left font-mono text-xs">
              <div className="p-2.5 rounded bg-black/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block">Kazanılan EXP</span>
                <span className="text-sm font-bold text-amber-300">
                  +{claimCelebration.expReward?.toLocaleString('tr-TR')} EXP
                </span>
              </div>
              <div className="p-2.5 rounded bg-black/50 border border-white/5 space-y-1">
                <span className="text-slate-400 block">Kazanılan Altın</span>
                <span className="text-sm font-bold text-yellow-300">
                  +{claimCelebration.goldReward?.toLocaleString('tr-TR')} Altın
                </span>
              </div>
            </div>

            {/* Dropped Equipment Showcase */}
            {claimCelebration.droppedEquipment?.length > 0 && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-left">
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase block">
                  🎁 Düşen 1-10 Seviye Set Ekipmanları ({claimCelebration.droppedEquipment.length} Parça):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {claimCelebration.droppedEquipment.map((dropItem, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-2 rounded bg-black/70 border border-amber-500/30 flex items-center gap-2.5"
                    >
                      <img src={dropItem.image} alt={dropItem.name} className="w-10 h-10 object-contain flex-shrink-0" />
                      <div className="truncate text-left">
                        <div className="font-cinzel text-xs font-bold text-amber-100 truncate">{dropItem.name}</div>
                        <div className="text-[10px] font-mono text-emerald-300">{dropItem.setName} • {dropItem.className}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-amber-300/80 block text-center pt-0.5">
                  ✓ Tüm eşyalar Envanterinize (Elf Heybenize) aktarıldı!
                </span>
              </div>
            )}

            <ElvenButton
              size="lg"
              fullWidth
              onClick={() => {
                setClaimCelebration(null);
                if (onDismissReport) onDismissReport();
              }}
              className="mt-2"
            >
              Tamam ve Devam Et
            </ElvenButton>
          </OrnateFrame>
        </div>
      )}

      {/* Submenu Bar (Solo vs Group) */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* SOLO DUNGEONS TAB */}
      {activeSubmenu === 'solo' && (
        <div className="space-y-4">
          {/* BEKLEME SÜRESİ (COOLDOWN) UYARI BANNERI */}
          {player?.dungeonCooldownUntil && currentTime < player.dungeonCooldownUntil && !activeDungeon && (
            <OrnateFrame className="p-3.5 bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 flex-shrink-0 animate-pulse">
                    <Clock className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h4 className="font-cinzel text-xs font-bold text-rose-200 uppercase tracking-wider flex items-center gap-2">
                      <span>Zindan Dinlenme Süresi Devrede (5 Dk Ceza / Çıkış)</span>
                    </h4>
                    <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                      Karakteriniz toparlanıyor. Yeni bir zindana girmek için kalan süre:{' '}
                      <strong className="text-amber-300 font-bold">
                        {formatTime(Math.max(0, Math.ceil((player.dungeonCooldownUntil - currentTime) / 1000)))}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </OrnateFrame>
          )}

          {/* ACTIVE DUNGEON COMBAT ARENA (OTO-AV & ANLIK KASILMA) */}
          {activeDungeon ? (
            <OrnateFrame className="p-4 sm:p-6 space-y-4 border-amber-500/50 bg-gradient-to-b from-[#0a1215] via-[#080d10] to-[#04080a] shadow-xl shadow-amber-500/10">
              {/* Arena Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse">
                      <Skull className="w-3.5 h-3.5 text-rose-400" />
                      Aktif Zindan Savaşında (Oto-Av)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      Seviye {activeDungeon.levelMin} - {activeDungeon.levelMax}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 gold-text-glow">
                    {activeDungeon.name}
                  </h2>
                </div>

                {/* Kalan Sefer Süresi (30 Dakika Geri Sayım) */}
                <div className="flex items-center gap-3 bg-black/60 px-3.5 py-2 rounded-lg border border-amber-500/30">
                  <Clock className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">
                      Kalan Sefer Süresi
                    </span>
                    <span className="text-base sm:text-lg font-mono font-bold text-amber-200">
                      {formatTime(remainingSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Karakter Canı & Oto-İksir Durumu */}
              <div className="p-3 rounded-lg bg-black/50 border border-white/10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      ❤️ Kahraman Canı:
                    </span>
                    <span className="text-slate-100 font-bold">
                      {(player.hp ?? player.maxHp ?? 1500).toLocaleString('tr-TR')} / {(player.maxHp ?? 1500).toLocaleString('tr-TR')} HP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 font-bold">
                      🧪 Kırmızı İksir: {(player.hpPotions ?? 0).toLocaleString('tr-TR')} Adet
                    </span>
                    <span className="text-amber-300 text-[11px]">
                      Oto-İksir: %{player.autoPotionThreshold || 50} Can
                    </span>
                  </div>
                </div>

                {/* Live Player HP Bar */}
                <div className="w-full h-2.5 bg-black/70 rounded-full border border-rose-900/60 overflow-hidden p-[1px]">
                  <div
                    className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(2, Math.round(((player.hp ?? player.maxHp ?? 1500) / (player.maxHp ?? 1500)) * 100))}%` }}
                  />
                </div>

                {(player.hpPotions ?? 0) === 0 && (
                  <div className="p-2 rounded bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-mono font-bold text-center animate-pulse">
                    ⚠️ DİKKAT: Kırmızı iksiriniz tükendi! Canınız 0 olursa karakter ölecek ve zindan kapanacaktır!
                  </div>
                )}
              </div>

              {/* Şu Anki Dövüşülen Canavar & Sıradaki Slotlar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-cinzel text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-rose-400" />
                    Canavar Slotları (Sonsuz Akın Farmı)
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    Hedef Slot #{((activeDungeon.currentMonsterIndex || 0) + 1)} / 5
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {activeDungeon.monsters?.map((monster, idx) => {
                    const isCurrent = idx === (activeDungeon.currentMonsterIndex || 0);
                    const isBoss = idx === 4;
                    const mName = getMonsterName(monster);
                    const mAtk = monster?.attack;
                    const mDef = monster?.defense;
                    const mHp = monster?.hp;

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-gradient-to-b from-rose-950/80 to-black/90 border-rose-500 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500 scale-[1.02]'
                            : 'bg-black/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400">
                              #{idx + 1} {isBoss ? '👑 Boss' : 'Slot'}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                Savaşta ⚔️
                              </span>
                            )}
                          </div>
                          <p className={`font-cinzel font-bold text-xs line-clamp-1 ${isCurrent ? 'text-rose-200' : 'text-slate-300'}`}>
                            {mName}
                          </p>
                          {mAtk !== undefined && (
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 pt-0.5">
                              <span className="text-rose-400" title="Saldırı">⚔️ {mAtk}</span>
                              <span className="text-blue-400" title="Defans">🛡️ {mDef}</span>
                              <span className="text-emerald-400" title="Can">❤️ {mHp}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 pt-1 border-t border-white/5 text-[9px] font-mono text-center">
                          {isCurrent ? (
                            <span className="text-amber-300 font-bold">Vuruş Yapılıyor...</span>
                          ) : (
                            <span className="text-slate-500">Sırada Bekliyor</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Anlık Oturum İstatistikleri (Toplam Kills, EXP, Altın, Eşyalar) */}
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">Kesilen Canavar</span>
                  <span className="text-sm font-bold text-white">
                    {(activeDungeon.kills || 0).toLocaleString('tr-TR')} Adet
                  </span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">Kazanılan EXP</span>
                  <span className="text-sm font-bold text-amber-300">
                    +{(activeDungeon.sessionExp || 0).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">Kazanılan Altın</span>
                  <span className="text-sm font-bold text-yellow-300">
                    +{(activeDungeon.sessionGold || 0).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="p-2 rounded bg-black/60 border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block uppercase">Düşen Eşyalar</span>
                  <span className="text-sm font-bold text-emerald-300">
                    {(activeDungeon.sessionDrops?.length || 0).toLocaleString('tr-TR')} Parça
                  </span>
                </div>
              </div>

              {/* Düşen Ekipmanlar Vitrini (Varsa) */}
              {activeDungeon.sessionDrops?.length > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase block">
                    🎁 Zindanda Düşen ve Çantanıza Eklenen Eşyalar ({activeDungeon.sessionDrops.length}):
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {activeDungeon.sessionDrops.map((drop, dIdx) => (
                      <div
                        key={dIdx}
                        className="p-1.5 rounded bg-black/80 border border-amber-500/30 flex items-center gap-2 flex-shrink-0"
                      >
                        <img src={drop.image} alt={drop.name} className="w-8 h-8 object-contain" />
                        <div className="text-left font-mono">
                          <span className="text-[11px] font-bold text-amber-200 block truncate max-w-[120px]">
                            {drop.name}
                          </span>
                          <span className="text-[9px] text-emerald-300 block">
                            Envantere Eklendi ✓
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Canlı Savaş Günlüğü */}
              <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1.5 font-mono text-xs">
                <div className="text-[11px] text-amber-400/80 font-cinzel uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Canlı Savaş & Ganimet Akışı
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Her 3.5 sn'de otomatik vuruş</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                  {(activeDungeon.recentLogs?.length > 0 ? activeDungeon.recentLogs : getBattleLogs()).map((log, lIdx) => (
                    <div
                      key={lIdx}
                      className="text-[11px] flex items-center gap-1.5 text-slate-300 py-0.5 border-b border-white/5"
                    >
                      <span className="text-amber-400">›</span>
                      <span>
                        {log.text || (
                          <>
                            ⚔️ [{log.monsterName}] kesildi!{' '}
                            <strong className="text-amber-300">+{log.expGain?.toLocaleString('tr-TR')} EXP</strong>,{' '}
                            <strong className="text-yellow-300">+{log.goldGain?.toLocaleString('tr-TR')} Altın</strong>.
                            {log.damageTaken > 0 && <span className="text-rose-400 font-mono"> (-{log.damageTaken} HP)</span>}
                            {log.potionUsed && <span className="text-emerald-400 font-mono font-bold"> 🧪 Kırmızı İksir İçildi</span>}
                            {log.droppedItemName && (
                              <span className="text-amber-300 font-bold ml-1 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-500/40">
                                🎁 [{log.droppedItemName}] DÜŞTÜ!
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eylem & Kontrol Butonları */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => {
                    if (window.confirm('Zindandan çekilmek istediğinize emin misiniz? Topladığınız tüm EXP, altın ve düşen eşyalar envanterinizde kalır ancak 5 dakika dinlenme süresi başlar.')) {
                      onCancelDungeon?.();
                    }
                  }}
                  type="button"
                  className="px-3 py-1.5 text-xs font-mono font-bold rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 cursor-pointer transition-all shadow"
                >
                  <XCircle className="w-3.5 h-3.5" /> Zindandan Çekil (5 Dk Bekleme)
                </button>
              </div>
            </OrnateFrame>
          ) : (
            /* LORE & LEVEL PROGRESSION INFO BANNER */
            <OrnateFrame className="p-3.5 bg-gradient-to-r from-black/80 via-amber-950/20 to-black/80">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <Skull className="w-5 h-5 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-cinzel text-sm font-bold text-amber-100 gold-text-glow">
                    Kadim Elf Zindanları (1 - 100 Seviye)
                  </h4>
                  <p className="text-xs text-slate-300 font-cormorant leading-relaxed">
                    Zindana girdiğinizde savaş anında başlar; karakteriniz içerideki canavarları aralıksız keserek anlık <strong>EXP</strong>, <strong>Altın</strong> ve <strong>Eşya</strong> toplar. Canınız azalırsa envanterinizdeki kırmızı iksirler otomatik tüketilir; iksiriniz tükenip canınız 0 olursa zindan kapanır!
                  </p>
                </div>
              </div>
            </OrnateFrame>
          )}

          {/* RECENT COMPLETED DUNGEON REPORT (AUTO-COLLECTED) */}
          {player?.lastDungeonReport && (
            <OrnateFrame className="p-4 bg-gradient-to-r from-emerald-950/40 via-black/85 to-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center flex-shrink-0 animate-bounce">
                    <Trophy className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-cinzel font-bold text-amber-200 uppercase">
                        Zindan Zaferi (Ödüller Otomatik Toplandı)
                      </span>
                      {player.lastDungeonReport.leveledUp && (
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50 font-bold animate-pulse">
                          🎉 SEVİYE {player.lastDungeonReport.newLevel} OLUNDU!
                        </span>
                      )}
                    </div>
                    <h4 className="font-cinzel text-sm font-bold text-slate-100">
                      {player.lastDungeonReport.dungeonName}
                    </h4>
                  </div>
                </div>

                {onDismissReport && (
                  <button
                    onClick={onDismissReport}
                    type="button"
                    className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-black/50 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer"
                  >
                    ✕ Kapat
                  </button>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>+{player.lastDungeonReport.expReward?.toLocaleString('tr-TR')} EXP</span>
                </div>
                <div className="text-yellow-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span>+{player.lastDungeonReport.goldReward?.toLocaleString('tr-TR')} Altın</span>
                </div>
                {player.lastDungeonReport.droppedEquipment?.length > 0 && (
                  <div className="text-emerald-300 flex items-center gap-1 font-semibold">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+{player.lastDungeonReport.droppedEquipment.length} Parça Ekipman Envantere Eklendi</span>
                  </div>
                )}
              </div>

              {player.lastDungeonReport.droppedEquipment?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10">
                  {player.lastDungeonReport.droppedEquipment.map((dropItem, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-1.5 rounded bg-black/70 border border-emerald-500/30 flex items-center gap-2"
                    >
                      <img src={dropItem.image} alt={dropItem.name} className="w-9 h-9 object-contain" />
                      <div className="truncate text-left">
                        <div className="font-cinzel text-xs font-bold text-amber-100 truncate">{dropItem.name}</div>
                        <div className="text-[10px] font-mono text-emerald-300">{dropItem.setName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </OrnateFrame>
          )}

          {/* LEVEL BRACKET FILTER TABS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {LEVEL_BRACKET_TABS.map((tab) => {
              const isActive = selectedBracket === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedBracket(tab.id)}
                  type="button"
                  className={`px-3 py-1 rounded text-xs font-cinzel whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-elven-gold'
                      : 'bg-black/50 border-slate-800 text-slate-400 hover:text-amber-200 hover:border-amber-500/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 20 DUNGEON LEVEL GROUPS LIST */}
          <div className={`gap-3.5 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'space-y-3.5'}`}>
            {filteredDungeons.map((dungeon) => {
              const isLocked = playerLevel < dungeon.levelMin;
              const isCurrentRange = playerLevel >= dungeon.levelMin && playerLevel <= dungeon.levelMax;
              const isInActiveDungeon = activeDungeon?.dungeonId === dungeon.id;

              return (
                <OrnateFrame
                  key={dungeon.id}
                  className={`p-4 flex flex-col justify-between transition-all duration-200 ${
                    isInActiveDungeon
                      ? 'border-amber-400 ring-1 ring-amber-500/50 bg-amber-950/20'
                      : isCurrentRange
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'hover:border-amber-500/30'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Level & Duration */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        isLocked
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : isCurrentRange
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        Seviye {dungeon.levelMin} - {dungeon.levelMax}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> 30 Dk
                      </span>
                    </div>

                    {/* Dungeon Title & Desc */}
                    <div>
                      <h4 className="font-cinzel font-bold text-base text-slate-100 flex items-center gap-2">
                        <Skull className="w-4 h-4 text-amber-400/80" />
                        {dungeon.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-cormorant mt-0.5 line-clamp-2">
                        {dungeon.desc}
                      </p>
                    </div>

                    {/* 5 Monster Slots */}
                    <div className="p-2.5 rounded bg-black/50 border border-white/5 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase text-amber-400/80">
                        <span>Canavar Slotları (5 Adet)</span>
                        <span>Saldırı / Defans / Can</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-xs">
                        {dungeon.monsters.map((monster, mIdx) => {
                          const mName = getMonsterName(monster);
                          const mAtk = monster?.attack;
                          const mDef = monster?.defense;
                          const mHp = monster?.hp;

                          return (
                            <div
                              key={mIdx}
                              className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono ${
                                mIdx === 4
                                  ? 'bg-amber-950/40 text-amber-200 border border-amber-500/20 font-bold'
                                  : 'bg-black/30 text-slate-300'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="text-[9px] text-slate-500 font-bold w-3">{mIdx + 1}.</span>
                                <span className="truncate">{mName}</span>
                                {mIdx === 4 && (
                                  <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                    👑 Boss
                                  </span>
                                )}
                              </span>
                              {mAtk !== undefined ? (
                                <div className="flex items-center gap-1.5 text-[10px] font-mono flex-shrink-0 ml-1.5">
                                  <span className="text-rose-400" title="Saldırı">⚔️ {mAtk}</span>
                                  <span className="text-blue-400" title="Defans">🛡️ {mDef}</span>
                                  <span className="text-emerald-400" title="Can">❤️ {mHp}</span>
                                </div>
                              ) : (
                                mIdx === 4 && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                    Son Slot
                                  </span>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rewards Info (Variable Ranges) */}
                    <div className="p-2 rounded bg-amber-950/15 border border-amber-500/20 space-y-1 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          EXP
                        </span>
                        <span className="text-amber-200 font-semibold">
                          {dungeon.expMin.toLocaleString('tr-TR')} - {dungeon.expMax.toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center gap-1 text-yellow-300">
                          <Award className="w-3 h-3 text-yellow-400" />
                          Altın
                        </span>
                        <span className="text-yellow-200 font-semibold">
                          {dungeon.goldMin.toLocaleString('tr-TR')} - {dungeon.goldMax.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-amber-400" />
                        Eşya Düşme Şansı:
                      </span>
                      <strong className="text-amber-200 font-bold">%3 Sabit (Hardcore)</strong>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-white/5 mt-3">
                    {isInActiveDungeon ? (
                      <ElvenButton size="sm" fullWidth disabled>
                        Savaş Devam Ediyor...
                      </ElvenButton>
                    ) : activeDungeon ? (
                      <ElvenButton size="sm" fullWidth disabled>
                        Başka Zindandasınız
                      </ElvenButton>
                    ) : player?.dungeonCooldownUntil && currentTime < player.dungeonCooldownUntil ? (
                      <ElvenButton size="sm" fullWidth disabled>
                        ⏳ Dinleniyor ({formatTime(Math.max(0, Math.ceil((player.dungeonCooldownUntil - currentTime) / 1000)))})
                      </ElvenButton>
                    ) : isLocked ? (
                      <ElvenButton size="sm" fullWidth disabled>
                        🔒 Gereken: Seviye {dungeon.levelMin}
                      </ElvenButton>
                    ) : (
                      <ElvenButton
                        size="sm"
                        icon={Swords}
                        fullWidth
                        onClick={() => onStartDungeon?.(dungeon.id)}
                      >
                        Zindana Gir (Savaşı Başlat)
                      </ElvenButton>
                    )}
                  </div>
                </OrnateFrame>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
