import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame, Swords, Clock, Sparkles, Coins, Award,
  Skull, RefreshCw, AlertCircle, CheckCircle2,
  Users, Globe, Zap, Heart, RotateCcw
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import { ALL_MENUS, calculatePlayerStats } from '../../config/gameData';
import { calculateBadgeStats } from '../../config/questData';
import { ALL_BOSSES, rollBossRewards, BOSS_COOLDOWN_MS } from '../../config/bossData';

export default function BossView({
  player,
  layoutMode = 'mobile',
  onBossVictory,
}) {
  const [activeSubmenu, setActiveSubmenu] = useState('solo');
  const [activeBattleBoss, setActiveBattleBoss] = useState(null);
  const [battleState, setBattleState] = useState(null); // 'fighting' | 'victory' | 'defeat'
  const [battleLog, setBattleLog] = useState([]);
  const [bossCurrentHp, setBossCurrentHp] = useState(0);
  const [playerCurrentHp, setPlayerCurrentHp] = useState(player?.hp || 500);
  const [potionsLeft, setPotionsLeft] = useState(3);
  const [battleRewards, setBattleRewards] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const isPC = layoutMode === 'pc';
  const submenus = ALL_MENUS.find((m) => m.id === 'boss')?.submenus || [
    { id: 'solo', label: 'Tek Kişilik Boss' },
    { id: 'group', label: 'Grup Boss' },
    { id: 'world', label: 'Dünya Bossu' },
  ];

  // 1-second interval for real-time countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cooldown calculation for active category (6 hours)
  const categoryCooldownEnd = (player?.bossCooldowns?.[activeSubmenu] || 0) + BOSS_COOLDOWN_MS;
  const remainingCooldownMs = Math.max(0, categoryCooldownEnd - currentTime);
  const isCategoryReady = remainingCooldownMs === 0;

  // Format cooldown timer HH:MM:SS
  const formatCooldown = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}s ${minutes.toString().padStart(2, '0')}dk ${seconds.toString().padStart(2, '0')}sn`;
  };

  const bosses = ALL_BOSSES[activeSubmenu] || [];

  // Player combat stats
  const playerLevel = player?.level || 1;
  const badgeBonus = useMemo(() => calculateBadgeStats(player?.questState?.badgeProgress), [player?.questState?.badgeProgress]);
  const playerStats = useMemo(() => calculatePlayerStats(player, badgeBonus), [player, badgeBonus]);
  const playerMaxHp = playerStats.maxHp;
  const equippedCount = Object.keys(player?.equipped || {}).length;
  const playerBaseAtk = playerStats.physicalDamage + Math.round(equippedCount * 25);
  const playerBaseDef = playerStats.defense + Math.round(equippedCount * 20 + playerLevel * 2);

  // Start Boss Battle Arena
  const handleStartFight = (boss) => {
    setActiveBattleBoss(boss);
    setBossCurrentHp(boss.hp);
    setPlayerCurrentHp(playerMaxHp);
    setPotionsLeft(3);
    setBattleState('fighting');
    setBattleLog([
      `⚔️ ${boss.name} (Seviye ${boss.level}) ile savaş başladı!`,
      `📊 Boss: ⚔️ ${boss.attack?.toLocaleString('tr-TR')} Saldırı | 🛡️ ${boss.defense?.toLocaleString('tr-TR')} Defans | ❤️ ${boss.hp?.toLocaleString('tr-TR')} Can`,
      `🛡️ Kahraman Canı: ${playerMaxHp.toLocaleString('tr-TR')} HP | Kırmızı İksir: 3 Adet`,
    ]);
    setBattleRewards(null);
  };

  // Perform round / attack in battle
  const handleAttackRound = () => {
    if (!activeBattleBoss || battleState !== 'fighting') return;

    // 1. Player attack (Çeviklikten gelen kritik şansı + Güçten gelen direkt hasar)
    const critChance = playerStats.criticalChance || 0;
    const isCrit = Math.random() * 100 < critChance;
    const variance = 0.9 + Math.random() * 0.22;
    const rawPlayerDamage = Math.round(playerBaseAtk * (isCrit ? 1.85 : 1.0) * variance);

    // Boss defense mitigates player damage
    const bossDef = activeBattleBoss.defense || 50;
    const bossMitigation = 2500 / (2500 + bossDef * 0.85);
    const finalPlayerDamage = Math.max(50, Math.round(rawPlayerDamage * bossMitigation));

    const newBossHp = Math.max(0, bossCurrentHp - finalPlayerDamage);
    setBossCurrentHp(newBossHp);

    const newLogs = [
      ...battleLog,
      `💥 ${player?.name || 'Kahraman'} ${isCrit ? '🔥 KRİTİK VURUŞ:' : 'saldırdı:'} ${finalPlayerDamage.toLocaleString('tr-TR')} hasar verdi!`,
    ];

    if (newBossHp <= 0) {
      // Victory!
      handleVictory(newLogs);
      return;
    }

    // 2. Boss counter-attack (Çeviklikten gelen kaçınma şansı & savunma)
    const isDodge = Math.random() * 100 < (playerStats.dodgeChance || 0);
    const bossAtk = activeBattleBoss.attack || 50;
    const bossRawDamage = Math.round(bossAtk * (0.85 + Math.random() * 0.3));
    const playerMitigation = 1500 / (1500 + playerBaseDef * 0.85);
    const finalBossDamage = isDodge ? 0 : Math.max(15, Math.round(bossRawDamage * playerMitigation));

    const newPlayerHp = Math.max(0, playerCurrentHp - finalBossDamage);
    setPlayerCurrentHp(newPlayerHp);

    if (isDodge) {
      newLogs.push(`💨 ${player?.name || 'Kahraman'} çevikliğiyle patronun darbesinden KAÇINDI! (0 Hasar)`);
    } else {
      newLogs.push(`⚡ ${activeBattleBoss.name} karşılık verdi: ${finalBossDamage.toLocaleString('tr-TR')} hasar!`);
    }

    if (newPlayerHp <= 0) {
      // Defeat!
      handleDefeat(newLogs);
    } else {
      setBattleLog(newLogs.slice(-6));
    }
  };

  // Potion usage: restores 40% of max HP
  const handleUsePotion = () => {
    if (battleState !== 'fighting' || potionsLeft <= 0) return;
    const healAmount = Math.round(playerMaxHp * 0.40);
    const newHp = Math.min(playerMaxHp, playerCurrentHp + healAmount);
    const actualHealed = newHp - playerCurrentHp;
    setPlayerCurrentHp(newHp);
    const remaining = potionsLeft - 1;
    setPotionsLeft(remaining);
    setBattleLog((prev) => [
      ...prev,
      `🧪 Kırmızı İksir içildi: +${actualHealed.toLocaleString('tr-TR')} Can tazelendi! (${remaining} iksir kaldı)`,
    ].slice(-6));
  };

  const handleVictory = (logs) => {
    setBattleState('victory');
    const rewards = rollBossRewards(activeBattleBoss, player?.classId || 'warrior');
    setBattleRewards(rewards);

    setBattleLog([
      ...logs,
      `🏆 ZAFER! ${activeBattleBoss.name} yenildi!`,
      `💰 Kazanılan: +${rewards.gold.toLocaleString('tr-TR')} Altın, +${rewards.exp.toLocaleString('tr-TR')} EXP!`,
      rewards.droppedItems.length > 0
        ? `🎁 Ganimet: ${rewards.droppedItems.length} parça efsanevi ekipman heybenize eklendi!`
        : `🎁 Ekipman bu sefer düşmedi.`,
    ]);

    // Apply rewards and activate 6-hour cooldown immediately
    onBossVictory?.(activeBattleBoss, rewards);
  };

  const handleDefeat = (logs) => {
    setBattleState('defeat');
    setBattleLog([
      ...logs,
      `☠️ MAĞLUBİYET! Canınız tükendi ve ${activeBattleBoss.name} karşısında yenildiniz!`,
      `💡 Bekleme süreniz yanmadı. İksirlerinizi hazırlayarak veya güçlenerek tekrar deneyebilirsiniz.`,
    ]);
  };

  // Restart battle after defeat
  const handleRestartFight = () => {
    if (!activeBattleBoss) return;
    setBossCurrentHp(activeBattleBoss.hp);
    setPlayerCurrentHp(playerMaxHp);
    setPotionsLeft(3);
    setBattleState('fighting');
    setBattleLog([
      `🔄 Savaş yeniden başlatıldı! Canınız ve iksirleriniz tazelendi.`,
      `⚔️ ${activeBattleBoss.name} ile mücadele devam ediyor!`,
    ]);
  };

  const handleCloseArena = () => {
    setActiveBattleBoss(null);
    setBattleState(null);
    setBattleRewards(null);
  };

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* Submenu Bar (Tek Kişilik, Grup, Dünya Bossu) */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* 6-Hour Cooldown Header Banner */}
      <OrnateFrame className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {activeSubmenu === 'solo' && <Flame className="w-5 h-5 text-amber-400" />}
              {activeSubmenu === 'group' && <Users className="w-5 h-5 text-sky-400" />}
              {activeSubmenu === 'world' && <Globe className="w-5 h-5 text-rose-400" />}
              <h2 className="text-base sm:text-lg font-bold font-cinzel text-amber-100 gold-text-glow">
                {activeSubmenu === 'solo' && 'Tek Kişilik Bosslar (20 Adet)'}
                {activeSubmenu === 'group' && 'Grup Bossları (20 Adet)'}
                {activeSubmenu === 'world' && 'Dünya Bossları (20 Adet - Tüm Krallıklar)'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-cormorant">
              Her kategoriye <span className="text-amber-300 font-semibold font-mono">6 saatte 1 kez</span> giriş hakkınız bulunmaktadır. Yüksek EXP, Altın ve %50 - %100 arası ekipman ganimeti kazanırsınız.
            </p>
          </div>

          {/* Cooldown Status Badge & Reset Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCategoryReady ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-xs shadow-lg animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Giriş Hazır (Savaşa Açık)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs shadow-lg">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Bekleme: <strong>{formatCooldown(remainingCooldownMs)}</strong></span>
              </div>
            )}
          </div>
        </div>
      </OrnateFrame>

      {/* 20 Bosses Grid (Responsive) */}
      <div className={`gap-3.5 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4' : 'space-y-3.5'}`}>
        {bosses.map((boss) => {
          const isPlayerLevelReady = (player?.level || 1) >= boss.level;

          return (
            <OrnateFrame
              key={boss.id}
              className="p-3.5 flex flex-col justify-between space-y-3 hover:border-amber-400/70 transition-all duration-200 group"
            >
              <div className="space-y-2.5">
                {/* Boss Portrait Header */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-amber-500/30 bg-black/80 shadow-inner group-hover:border-amber-400/80 transition-all">
                  <img
                    src={boss.image}
                    alt={boss.name}
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

                  {/* Level & Category Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-500/50 shadow">
                      Seviye {boss.level}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-500/30">
                      #{boss.num}
                    </span>
                  </div>

                  {/* Stat Badges on Image Bottom: Saldırı, Defans, Can (Zindandaki gibi) */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] sm:text-[11px] font-mono bg-black/85 px-2 py-1 rounded border border-white/10 backdrop-blur-xs shadow-md">
                    <span className="text-rose-400 font-bold flex items-center gap-1" title="Saldırı">
                      <span>⚔️</span> {boss.attack?.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-blue-400 font-bold flex items-center gap-1" title="Defans">
                      <span>🛡️</span> {boss.defense?.toLocaleString('tr-TR')}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1" title="Can">
                      <span>❤️</span> {boss.hp?.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Boss Details */}
                <div>
                  <h3 className="font-cinzel font-bold text-sm sm:text-base text-amber-100 gold-text-glow leading-snug">
                    {boss.name}
                  </h3>
                  <p className="text-[10px] font-mono text-amber-400/80">
                    "{boss.title}"
                  </p>
                  <p className="text-xs text-slate-300 font-cormorant leading-relaxed italic line-clamp-2 mt-1">
                    {boss.lore}
                  </p>
                </div>

                {/* Stats & Rewards Breakdown */}
                <div className="p-2 rounded bg-black/50 border border-white/5 space-y-1.5 text-[11px] font-mono">
                  {/* Savaş Gücü Stat Çizgisi */}
                  <div className="flex items-center justify-between text-slate-300 pb-1 border-b border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Boss Gücü:</span>
                    <div className="flex items-center gap-2 font-bold text-[10px] sm:text-[11px]">
                      <span className="text-rose-400" title="Saldırı">⚔️ {boss.attack?.toLocaleString('tr-TR')}</span>
                      <span className="text-blue-400" title="Defans">🛡️ {boss.defense?.toLocaleString('tr-TR')}</span>
                      <span className="text-emerald-400" title="Can">❤️ {boss.hp?.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Sparkles className="w-3 h-3" /> EXP:
                    </span>
                    <span className="text-amber-200 font-bold">
                      ~{boss.minExp.toLocaleString('tr-TR')} - {boss.maxExp.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Coins className="w-3 h-3" /> Altın:
                    </span>
                    <span className="text-yellow-200 font-bold">
                      ~{boss.minGold.toLocaleString('tr-TR')} - {boss.maxGold.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 border-t border-white/5 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Award className="w-3 h-3" /> Eşya Oranı:
                    </span>
                    <span className="text-emerald-300 font-bold">
                      %{Math.round(boss.dropRate * 100)} ({boss.minDrops}-{boss.maxDrops} Parça)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-white/10">
                <ElvenButton
                  size="sm"
                  fullWidth
                  icon={Swords}
                  onClick={() => handleStartFight(boss)}
                  disabled={!isCategoryReady}
                >
                  {isCategoryReady ? 'Savaşı Başlat (Giriş)' : `Bekleme: ${formatCooldown(remainingCooldownMs)}`}
                </ElvenButton>
              </div>
            </OrnateFrame>
          );
        })}
      </div>

      {/* Epic Boss Arena Battle Modal */}
      {activeBattleBoss && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#070b0e] border-2 border-amber-400 rounded-xl p-4 sm:p-6 shadow-2xl shadow-black space-y-4 my-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                  {activeBattleBoss.category === 'solo' && 'Tek Kişilik Boss Arenası'}
                  {activeBattleBoss.category === 'group' && 'Grup Boss Akını'}
                  {activeBattleBoss.category === 'world' && 'Dünya Bossu Meydan Okuması'}
                </span>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-amber-100 gold-text-glow mt-1">
                  {activeBattleBoss.name} (Seviye {activeBattleBoss.level})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCloseArena}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-black/60 border border-slate-700 cursor-pointer"
              >
                Kapat
              </button>
            </div>

            {/* Duel Presentation (Player vs Boss) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center">
              {/* Left: Player Profile */}
              <div className="p-3 rounded-lg bg-black/60 border border-emerald-500/30 text-center space-y-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-emerald-400 overflow-hidden shadow-lg">
                  <img
                    src={player?.classImage || '/assets/avatars/female_warrior.jpg'}
                    alt={player?.name || 'Karakter'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-cinzel font-bold text-xs sm:text-sm text-slate-100">
                    {player?.name || 'Kadim Kahraman'}
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Seviye {playerLevel} {player?.className || 'Savaşçı'}
                  </span>
                </div>

                {/* Player Stat Badges */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono bg-black/40 py-1 px-2 rounded border border-white/5">
                  <span className="text-rose-400 font-bold" title="Oyuncu Saldırısı">
                    ⚔️ {playerBaseAtk.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-blue-400 font-bold" title="Oyuncu Savunması">
                    🛡️ {playerBaseDef.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-300">
                    <span>Can</span>
                    <span className="text-emerald-300 font-bold">
                      {playerCurrentHp.toLocaleString('tr-TR')} / {playerMaxHp.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-emerald-900">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, (playerCurrentHp / playerMaxHp) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Boss Profile */}
              <div className="p-3 rounded-lg bg-black/60 border border-rose-500/30 text-center space-y-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-rose-500 overflow-hidden shadow-lg">
                  <img
                    src={activeBattleBoss.image}
                    alt={activeBattleBoss.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="font-cinzel font-bold text-xs sm:text-sm text-amber-100">
                    {activeBattleBoss.name}
                  </h4>
                  <span className="text-[10px] font-mono text-rose-400">
                    Seviye {activeBattleBoss.level} Boss
                  </span>
                </div>

                {/* Boss Stat Badges */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono bg-black/40 py-1 px-2 rounded border border-white/5">
                  <span className="text-rose-400 font-bold" title="Boss Saldırısı">
                    ⚔️ {activeBattleBoss.attack?.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-blue-400 font-bold" title="Boss Savunması">
                    🛡️ {activeBattleBoss.defense?.toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-300">
                    <span>Boss Canı</span>
                    <span className="text-amber-300 font-bold">
                      {bossCurrentHp.toLocaleString('tr-TR')} / {activeBattleBoss.hp.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-rose-900">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, (bossCurrentHp / activeBattleBoss.hp) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Combat Log Box */}
            <div className="p-3 rounded-lg bg-black/80 border border-white/10 font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
              {battleLog.map((log, i) => (
                <p key={i} className="text-slate-300 leading-relaxed">
                  {log}
                </p>
              ))}
            </div>

            {/* Defeat Screen Banner */}
            {battleState === 'defeat' && (
              <div className="p-4 rounded-lg bg-rose-950/60 border-2 border-rose-500/70 space-y-3 animate-fadeIn text-center">
                <div className="flex items-center justify-center gap-2 text-rose-300 font-cinzel font-bold text-base sm:text-lg">
                  <Skull className="w-6 h-6 text-rose-400 animate-pulse" />
                  <span>SAVAŞ KAYBEDİLDİ - YENİLGİ!</span>
                </div>
                <p className="text-xs text-slate-300 font-cormorant max-w-md mx-auto">
                  {activeBattleBoss.name} karşısında canınız tükendi. Giriş hakkınız (bekleme süresi) yanmadı.
                  Ekipmanlarınızı güçlendirip veya savaşta kırmızı iksirlerinizi doğru zamanda kullanarak tekrar meydan okuyabilirsiniz!
                </p>
                <div className="flex items-center justify-center gap-3 pt-1">
                  <ElvenButton
                    size="sm"
                    variant="secondary"
                    icon={RotateCcw}
                    onClick={handleRestartFight}
                  >
                    Tekrar Dene (Canı Yenile)
                  </ElvenButton>
                  <button
                    type="button"
                    onClick={handleCloseArena}
                    className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white bg-black/60 border border-slate-700 rounded-lg cursor-pointer transition-all"
                  >
                    Arenadan Ayrıl
                  </button>
                </div>
              </div>
            )}

            {/* Victory Screen / Drops Display */}
            {battleState === 'victory' && battleRewards && (
              <div className="p-4 rounded-lg bg-emerald-950/40 border-2 border-emerald-500/60 space-y-3 animate-fadeIn text-center">
                <div className="flex items-center justify-center gap-2 text-amber-300 font-cinzel font-bold text-base sm:text-lg">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span>BOSS YENİLDİ & GANİMET KAZANILDI!</span>
                </div>

                <div className="flex justify-center gap-6 font-mono text-xs">
                  <span className="text-amber-300">
                    +{(battleRewards.exp).toLocaleString('tr-TR')} EXP
                  </span>
                  <span className="text-yellow-300">
                    +{(battleRewards.gold).toLocaleString('tr-TR')} Altın
                  </span>
                </div>

                {/* Dropped Equipment Cards */}
                {battleRewards.droppedItems.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[11px] font-mono text-emerald-400 block text-center">
                      Düşen Ekipmanlar (Heybenize Otomatik Eklendi):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {battleRewards.droppedItems.map((item) => (
                        <div
                          key={item.instanceId}
                          className="p-2 rounded bg-black/70 border border-amber-500/40 flex items-center gap-2.5"
                        >
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-contain p-0.5 rounded bg-black/50 border border-amber-400/50" />
                          <div className="overflow-hidden">
                            <h5 className="font-cinzel text-xs font-bold text-amber-100 truncate">
                              {item.name}
                            </h5>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                              <span className="text-amber-300">{item.setName}</span>
                              <span>•</span>
                              <span>{item.slotName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-mono text-slate-400 italic">
                  6 saatlik bekleme süresi başladı. Yeni giriş hakkınız geri sayıyor.
                </div>
              </div>
            )}

            {/* Battle Control Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              {battleState === 'fighting' ? (
                <>
                  <ElvenButton
                    size="md"
                    className="flex-1"
                    icon={Swords}
                    onClick={handleAttackRound}
                  >
                    Saldır (Hamle Yap)
                  </ElvenButton>

                  <button
                    type="button"
                    onClick={handleUsePotion}
                    disabled={potionsLeft <= 0 || playerCurrentHp >= playerMaxHp}
                    className={`px-3.5 py-2.5 text-xs font-mono rounded-lg border flex items-center gap-1.5 transition-all ${
                      potionsLeft > 0 && playerCurrentHp < playerMaxHp
                        ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-500/50 cursor-pointer shadow-sm'
                        : 'bg-black/40 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                    }`}
                    title="Kırmızı İksir: +%40 Can Yeniler"
                  >
                    <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30" />
                    <span>İksir ({potionsLeft})</span>
                  </button>
                </>
              ) : battleState === 'victory' ? (
                <ElvenButton
                  size="md"
                  fullWidth
                  onClick={handleCloseArena}
                >
                  Tamamla ve Kapat
                </ElvenButton>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
