import React, { useState, useEffect } from 'react';
import {
  Pickaxe, Clock, CheckCircle2, XCircle, Zap, Award
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import ElvenButton from '../../components/ElvenButton';
import { ELVEN_MINES, MINING_DURATION_SECONDS } from '../../config/miningData';

const LEVEL_BRACKET_TABS = [
  { id: 'all', label: 'Tüm Madenler (20)' },
  { id: '1-30', label: '1 - 30 Seviye' },
  { id: '31-60', label: '31 - 60 Seviye' },
  { id: '61-80', label: '61 - 80 Seviye' },
  { id: '81-100', label: '81 - 100 Seviye' },
];

export default function MineView({
  player,
  layoutMode = 'mobile',
  onStartMining,
  onCancelMining,
  onDismissMineReport,
}) {
  const [selectedBracket, setSelectedBracket] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isPC = layoutMode === 'pc';

  // 1 saniyelik sayaç (Yalnızca aktif maden kazısı varsa çalışır)
  useEffect(() => {
    if (!player?.activeMine) return;
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [player?.activeMine]);

  // Aktif Kazı Durumu
  const activeMine = player?.activeMine || null;
  const activeMineData = activeMine
    ? ELVEN_MINES.find((m) => m.id === activeMine.mineId) || null
    : null;

  let elapsedSeconds = 0;
  let remainingSeconds = 0;
  let progressPercent = 0;
  let isFinished = false;

  if (activeMine) {
    const start = activeMine.startTime || currentTime;
    const duration = activeMine.durationSeconds || MINING_DURATION_SECONDS;
    elapsedSeconds = Math.max(0, Math.floor((currentTime - start) / 1000));
    remainingSeconds = Math.max(0, duration - elapsedSeconds);
    progressPercent = Math.min(100, Math.round((elapsedSeconds / duration) * 100));
    isFinished = remainingSeconds <= 0;
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Seviye sekmesine göre filtreleme
  const filteredMines = ELVEN_MINES.filter((mine) => {
    if (selectedBracket === 'all') return true;
    if (selectedBracket === '1-30') return mine.level >= 1 && mine.level <= 30;
    if (selectedBracket === '31-60') return mine.level >= 31 && mine.level <= 60;
    if (selectedBracket === '61-80') return mine.level >= 61 && mine.level <= 80;
    if (selectedBracket === '81-100') return mine.level >= 81 && mine.level <= 100;
    return true;
  });

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full' : ''}`}>
      {/* -------------------- 1. AKTİF KAZI PANELİ (ZİNDAN MANTIĞI) -------------------- */}
      {activeMine && activeMineData ? (
        <OrnateFrame className="p-4 sm:p-5 border-amber-400 bg-gradient-to-b from-[#0a1215] via-[#090e11] to-[#04080a] shadow-xl shadow-amber-500/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl border border-amber-400/80 bg-black/80 p-1.5 flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden">
                <img
                  src={activeMineData.oreImage}
                  alt={activeMineData.name}
                  className="w-full h-full object-contain animate-pulse"
                />
                <div className="absolute top-1 right-1">
                  <Pickaxe className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/40 font-bold uppercase animate-pulse">
                    Aktif Maden Kazısı
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Seviye {activeMineData.level}
                  </span>
                </div>
                <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-100 gold-text-glow">
                  {activeMineData.name}
                </h3>
              </div>
            </div>

            {/* Canlı Sayaç */}
            <div className="flex items-center gap-3 bg-black/60 px-3.5 py-2 rounded-lg border border-amber-500/30">
              <Clock className={`w-5 h-5 ${isFinished ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} style={{ animationDuration: '8s' }} />
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">
                  {isFinished ? 'Durum' : 'Kalan Süre'}
                </span>
                <span className={`text-base font-mono font-bold ${isFinished ? 'text-emerald-400' : 'text-amber-200'}`}>
                  {isFinished ? 'TAMAMLANDI' : formatTime(remainingSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Kazı İlerlemesi (10 Dk Sabit Süre)</span>
              <span className="text-amber-300 font-bold">%{progressPercent}</span>
            </div>
            <div className="w-full h-3 bg-black/80 rounded-full overflow-hidden border border-amber-500/50 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(3, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Eylemler: İptal ve Hızlı Bitir */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
            <button
              type="button"
              onClick={onCancelMining}
              className="px-3 py-1.5 text-xs font-mono text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 rounded cursor-pointer transition-all flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> İptal Et
            </button>
          </div>
        </OrnateFrame>
      ) : (
        /* Kazma Boşta Bilgi Bannerı */
        <OrnateFrame className="p-3.5 bg-gradient-to-r from-black/80 via-amber-950/20 to-black/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                <Pickaxe className="w-4 h-4 text-amber-400" />
                <span>Elf Maden Ocakları (20 Kadim Maden)</span>
              </h3>
              <p className="text-xs text-slate-300 font-cormorant">
                Zindan mantığıyla çalışır. Her maden kazısı <span className="text-amber-300 font-bold font-mono">10 dakika bekleme</span> süresine sahiptir.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40 flex items-center gap-1 flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Kazma Boşta (Maden Seçin)
            </span>
          </div>
        </OrnateFrame>
      )}

      {/* -------------------- 2. TAMAMLANAN KAZI RAPORU -------------------- */}
      {player?.lastMineReport && (
        <div className="p-4 rounded-xl border-2 border-emerald-500/70 bg-[#07130f]/95 backdrop-blur-md shadow-2xl space-y-3 animate-fadeIn text-center">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 text-emerald-300 font-cinzel font-bold text-sm sm:text-base">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>MADENCİLİK TAMAMLANDI: {player.lastMineReport.mineName}</span>
            </div>
            <button
              type="button"
              onClick={onDismissMineReport}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-black/60 border border-slate-700 cursor-pointer"
            >
              Kapat
            </button>
          </div>

          <div className="flex justify-center gap-6 font-mono text-xs">
            {player.lastMineReport.expReward > 0 ? (
              <span className="text-amber-300 font-bold">
                +{player.lastMineReport.expReward.toLocaleString('tr-TR')} EXP
              </span>
            ) : (
              <span className="text-slate-400 font-mono">
                0 EXP (Zanaat & Cevher)
              </span>
            )}
            <span className="text-yellow-300 font-bold">
              +{player.lastMineReport.goldReward.toLocaleString('tr-TR')} Altın
            </span>
          </div>

          {player.lastMineReport.droppedOres?.length > 0 && (
            <div className="space-y-2 text-left">
              <span className="text-[11px] font-mono text-emerald-400 block text-center">
                Çıkarılan Cevherler (Envanterinize Eklendi):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {player.lastMineReport.droppedOres.map((oreItem) => (
                  <div
                    key={oreItem.instanceId}
                    className="p-2 rounded-lg bg-black/70 border border-emerald-500/40 flex items-center gap-2.5 shadow"
                  >
                    <img
                      src={oreItem.image}
                      alt={oreItem.name}
                      className="w-10 h-10 object-contain p-0.5 rounded bg-emerald-950/40 border border-emerald-400/60 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h5 className="font-cinzel text-xs font-bold text-emerald-200 truncate">
                        {oreItem.name}
                      </h5>
                      <span className="text-[10px] font-mono text-yellow-300">
                        Değer: {oreItem.sellPrice} Altın
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------- 3. SEVİYE FİLTRELEME SEKMELERİ (ZİNDAN DÜZENİ) -------------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {LEVEL_BRACKET_TABS.map((tab) => {
          const isActive = selectedBracket === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedBracket(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-cinzel whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-elven-gold scale-[1.02]'
                  : 'bg-black/50 border-slate-800 text-slate-400 hover:text-amber-200 hover:border-amber-500/40'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* -------------------- 4. 20 MADEN KARTLARI (İKON VE İSİM ODAKLI) -------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredMines.map((mine) => {
          const isThisMining = activeMine?.mineId === mine.id;
          const isAnotherMining = activeMine && activeMine.mineId !== mine.id;
          const isLevelMet = (player?.level || 1) >= mine.level;

          return (
            <OrnateFrame
              key={mine.id}
              className={`p-3 flex flex-col justify-between space-y-2.5 transition-all duration-200 group text-center ${
                isThisMining
                  ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400 shadow-elven-gold scale-[1.02]'
                  : 'hover:border-amber-400/70 hover:bg-black/60'
              }`}
            >
              {/* Üst Rozetler: Numara & Seviye */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-1.5 py-0.5 rounded bg-black/70 text-amber-300 border border-amber-500/30">
                  #{mine.id}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded border font-semibold ${
                    isLevelMet
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Lv. {mine.level}
                </span>
              </div>

              {/* Maden / Cevher İkonu */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl border border-amber-500/40 bg-black/70 p-2 flex items-center justify-center shadow-elven-inner group-hover:scale-105 group-hover:border-amber-300 transition-all">
                <img
                  src={mine.oreImage}
                  alt={mine.name}
                  className="w-full h-full object-contain drop-shadow"
                  loading="lazy"
                />
              </div>

              {/* Maden İsmi */}
              <div className="min-h-[36px] flex items-center justify-center">
                <h4 className="font-cinzel font-bold text-xs sm:text-sm text-amber-100 gold-text-glow group-hover:text-amber-300 transition-colors line-clamp-2">
                  {mine.name}
                </h4>
              </div>

              {/* Kazıya Başla Butonu (10 Dk) */}
              <div className="pt-1 border-t border-white/5">
                {isThisMining ? (
                  <ElvenButton size="sm" fullWidth disabled>
                    Kazılıyor (%{progressPercent})
                  </ElvenButton>
                ) : isAnotherMining ? (
                  <ElvenButton size="sm" fullWidth disabled>
                    Başka Madendesiniz
                  </ElvenButton>
                ) : !isLevelMet ? (
                  <ElvenButton size="sm" fullWidth disabled>
                    🔒 Seviye {mine.level}
                  </ElvenButton>
                ) : (
                  <ElvenButton
                    size="sm"
                    icon={Pickaxe}
                    fullWidth
                    onClick={() => onStartMining?.(mine.id)}
                  >
                    Kaz (10 Dk)
                  </ElvenButton>
                )}
              </div>
            </OrnateFrame>
          );
        })}
      </div>
    </div>
  );
}
