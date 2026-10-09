import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sword,
  Sparkles,
  Users,
  Trophy,
  BookOpen,
  Mail,
  Info,
  LogIn,
  Play,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Compass,
  ArrowRight,
  RefreshCw,
  Crown,
  Flame,
  HelpCircle,
  Gem,
  Coins,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../../services/authService';
import { fetchTopLeaderboard } from '../../services/cloudCharacterService';

export default function LandingPortal({
  onEnterGame,
  currentUser,
  savedCharacter,
  onSignOut,
}) {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'guide' | 'leaderboard' | 'about' | 'contact'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'email' | 'guest'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Guest name input
  const [guestName, setGuestName] = useState('');

  // Contact form state
  const [contactSubject, setContactSubject] = useState('Geri Bildirim');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Live Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const data = await fetchTopLeaderboard(20);
    setLeaderboard(data);
    setLoadingLeaderboard(false);
  };

  useEffect(() => {
    if (activeTab === 'leaderboard' || activeTab === 'home') {
      loadLeaderboard();
    }
  }, [activeTab]);

  // Handle Google OAuth
  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setAuthError(
        res.error.includes('provider is not enabled')
          ? 'Google ile oturum açma sağlayıcısı Supabase panelinde henüz etkinleştirilmedi. Dilerseniz E-posta veya Hızlı Giriş ile hemen oynayabilirsiniz!'
          : res.error
      );
      setAuthLoading(false);
    }
  };

  // Handle Email login / register
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Lütfen geçerli e-posta ve şifre girin.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    const res = isRegistering
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || 'İşlem başarısız oldu.');
    } else {
      setShowAuthModal(false);
      onEnterGame();
    }
  };

  // Handle Guest start
  const handleGuestStart = (e) => {
    e.preventDefault();
    setShowAuthModal(false);
    onEnterGame(guestName.trim() || null);
  };

  // Submit feedback
  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactMessage('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#040709] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-[#070b0e]/90 to-[#030507]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#060a0d]/90 backdrop-blur-md border-b border-amber-500/20 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all">
              <div className="w-full h-full bg-[#070c0e] rounded-[7px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                  ELVES ONLINE
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-semibold uppercase tracking-wider">
                  Açık Beta
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 -mt-0.5 tracking-wider hidden sm:block">
                Han Gaming Studio • Emirhan Kalaycı
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'home', label: 'Ana Sayfa', icon: Globe },
              { id: 'guide', label: 'Rehber (Oynayış)', icon: BookOpen },
              { id: 'leaderboard', label: 'Sıralama', icon: Trophy },
              { id: 'about', label: 'Hakkımızda', icon: Info },
              { id: 'contact', label: 'İletişim', icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Status / Action Buttons */}
          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded hidden sm:inline-block">
                  {currentUser.email || 'Giriş Yapıldı'}
                </span>
                <button
                  onClick={onSignOut}
                  className="px-2.5 py-1.5 rounded text-xs font-cinzel text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('google');
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-cinzel font-semibold tracking-wider text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Giriş Yap</span>
              </button>
            )}

            <button
              onClick={() => onEnterGame()}
              className="px-4 py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-1.5 cursor-pointer group active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
              <span>{savedCharacter ? 'Oyuna Dön' : 'Oyuna Başla'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around gap-1 pt-2.5 mt-2 border-t border-amber-500/10">
          {[
            { id: 'home', label: 'Ana Sayfa', icon: Globe },
            { id: 'guide', label: 'Rehber', icon: BookOpen },
            { id: 'leaderboard', label: 'Sıralama', icon: Trophy },
            { id: 'about', label: 'Hakkımızda', icon: Info },
            { id: 'contact', label: 'İletişim', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-1 text-[11px] font-cinzel transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 sm:py-12">
        {/* ========================================================= */}
        {/* TAB 1: ANA SAYFA (HOME HERO) */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fadeIn">
            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#070d10] p-6 sm:p-12 lg:p-16 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none scale-105"
                style={{ backgroundImage: "url('/assets/backgrounds/lorvathiel_landscape.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#040709] via-[#040709]/80 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>AÇIK BETA SÜRÜMÜ • CANLI ÇEVRİMİÇİ SUNUCU</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 leading-tight">
                    ELVES ONLINE
                  </h1>
                  <p className="font-cinzel text-lg sm:text-2xl text-slate-300 font-light tracking-wide">
                    Kadim Elflerin Çağı Başlıyor.
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl font-normal">
                  Üç kadim hanedanın kadim güç savaşına adım atın. Kolaylaştırılmış modern mobil oyunlara inat;
                  <span className="text-amber-300 font-semibold"> %5 zorlu ganimet oranı</span>,
                  <span className="text-amber-300 font-semibold"> serbest stat geliştirme</span>, canlı pazar ekonomisi ve
                  emek odaklı gerçek bir MMORPG deneyimi.
                </p>

                {/* Quick Info Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                  <div className="bg-[#0b1216]/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">Sunucu Durumu</div>
                      <div className="text-xs font-bold text-emerald-400">🟢 Çevrimiçi (Frankfurt)</div>
                    </div>
                  </div>
                  <div className="bg-[#0b1216]/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                    <Sword className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">Zorluk Seviyesi</div>
                      <div className="text-xs font-bold text-amber-300">Hardcore MMORPG</div>
                    </div>
                  </div>
                  <div className="bg-[#0b1216]/80 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2 col-span-2 sm:col-span-1">
                    <Gem className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono">Eşya Düşme Oranı</div>
                      <div className="text-xs font-bold text-sky-300">Net %5 (Değerli Eşyalar)</div>
                    </div>
                  </div>
                </div>

                {/* Call To Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => {
                      if (currentUser || savedCharacter) {
                        onEnterGame();
                      } else {
                        setAuthMode('google');
                        setShowAuthModal(true);
                      }
                    }}
                    className="px-6 py-3.5 rounded-xl text-sm font-cinzel font-bold tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all flex items-center gap-2.5 cursor-pointer group active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                    <span>{savedCharacter ? 'Karakterinle Devam Et' : 'Hemen Oyuna Katıl'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('guide')}
                    className="px-5 py-3.5 rounded-xl text-sm font-cinzel font-semibold tracking-wider text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/80 hover:border-amber-400/50 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Oynayış Rehberi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-amber-200 mb-2">3 Kadim Krallık</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sylvaen Orman Elfleri, Ithilmar Ay Elfleri ve Lorvathiel Gölge Muhafızları. Kendi krallığını seç, topraklarını savun ve krallık savaşlarında şan kazan.
                </p>
              </div>

              <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-emerald-200 mb-2">Canlı Pazar & 20 Slotluk Tezgahlar</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tüm eşyaların değerli olduğu bir ekonomi. Kendi pazar tezgahını kur, diğer oyuncularla gerçek zamanlı ticaret yap, teklifleri kabul et veya reddet.
                </p>
              </div>

              <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-indigo-200 mb-2">Gerçek Emek & Liderlik Sıralaması</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Her seviyede kazanılan 6 serbest stat puanı. 24 saat aktif oynanışta dahi maksimum 30. seviyeye ulaşılabilen rekabetçi ve zorlu ilerleme eğrisi.
                </p>
              </div>
            </div>

            {/* Quick Leaderboard Preview on Home */}
            <div className="bg-[#070c0e] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="font-cinzel text-base font-bold text-slate-100">
                    Canlı Sunucu Liderleri (Top 5)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Tümünü Gör</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {leaderboard.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  {loadingLeaderboard
                    ? 'Sıralama verileri sunucudan yükleniyor...'
                    : 'Açık Beta yeni başladı! İlk kahramanlar henüz sıralamaya yerleşiyor.'}
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {leaderboard.slice(0, 5).map((char, idx) => (
                    <div
                      key={char.id || idx}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold font-mono ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-200">{char.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono capitalize">
                            {char.kingdom_id} • {char.class_id}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-400">Lv. {char.level}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {Number(char.gold || 0).toLocaleString()} Altın
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REHBER (OYNAYIŞ REHBERİ) */}
        {/* ========================================================= */}
        {activeTab === 'guide' && (
          <div className="space-y-10 animate-fadeIn max-w-4xl mx-auto">
            <div className="text-center space-y-3 pb-6 border-b border-amber-500/20">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                KADİM ELFLER KÜTÜPHANESİ
              </span>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                Resmi Oynayış Rehberi
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Elves Online dünyasında hayatta kalmak ve efsanevi bir kahramana dönüşmek için bilmeniz gereken tüm kadim kurallar.
              </p>
            </div>

            {/* Guide Section 1: Karakter & Stat Dağılımı */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Crown className="w-5 h-5" />
                <h3 className="font-cinzel text-lg font-bold">1. Başlangıç Özellikleri ve Stat Sistemi</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tüm oyuncular oyuna mutlak eşitlik ilkeleriyle başlar. Eski sistemdeki otomatik savaş güçleri ve karmaşık oranlar kaldırılmış, oyuncu kararlarına tam özgürlük tanınmıştır:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Başlangıç Canı</div>
                  <div className="text-emerald-400 font-bold text-sm">500 HP</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Başlangıç Manası</div>
                  <div className="text-sky-400 font-bold text-sm">500 Mana</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Temel Statlar</div>
                  <div className="text-amber-400 font-bold text-sm">0 STR / 0 AGI / 0 INT</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-center">
                  <div className="text-slate-500 text-[10px]">Seviye Başına Puan</div>
                  <div className="text-yellow-300 font-bold text-sm">+6 Stat Puanı</div>
                </div>
              </div>
              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">• Güç (STR):</span>
                  <span>Doğrudan saf fiziksel saldırı hasarına dönüşür. Silahınızın gücünü katlar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">• Çeviklik (AGI):</span>
                  <span>Saldırılardan kaçınma şansını, kritik darbe olasılığını ve ek savunmayı yükseltir.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">• Zeka (INT):</span>
                  <span>Büyü yeteneklerinin hasarını ve mana yenilenmesini artırır.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">• Can (HP):</span>
                  <span>Maksimum sağlık havuzunuzu genişleterek ölümcül boss darbelerine karşı dayanıklılık sağlar.</span>
                </div>
              </div>
            </div>

            {/* Guide Section 2: Zorlu İlerleme ve %5 Drop Oranı */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Flame className="w-5 h-5" />
                <h3 className="font-cinzel text-lg font-bold">2. Zorlu Seviye Eğrisi & %5 Eşya Düşme Oranı</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Elves Online, herkesin bir günde son seviyeye ulaştığı modern oyun yapısını reddeder. Gerçek bir MMORPG sabır ve strateji gerektirir:
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-red-200">
                  <span className="font-bold">⚠️ Seviye Sınırı Felsefesi:</span> 24 saat kesintisiz ve aktif olarak zindanlarda savaşan bir oyuncu en fazla ~30. seviyeye ulaşabilir. Her canavarın ve görevin tecrübe puanı özenle dengelenmiştir.
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-amber-200">
                  <span className="font-bold">💎 Net %5 Eşya Düşme Oranı:</span> Zindanlar, maden kazıları ve canavarlardan eşya düşme olasılığı tüm içeriklerde %5 olarak sabitlenmiştir. Bu sayede elde ettiğiniz her zırh, kılıç veya yay pazarda gerçek bir servet değerindedir.
                </div>
              </div>
            </div>

            {/* Guide Section 3: Kadim Bosslar ve Zindanlar */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Sword className="w-5 h-5" />
                <h3 className="font-cinzel text-lg font-bold">3. Kadim Bosslar & 6 Saatlik Bekleme Süresi</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kadim Bosslar diyarlarda dehşet saçmaktadır. Bir Kadim Boss mağlup edildikten sonra yeniden belirmesi tam <span className="text-amber-300 font-bold">6 saat</span> sürer. Grup kurarak takım arkadaşlarınızla birlikte avlanmanız önerilir.
              </p>
            </div>

            {/* Guide Section 4: Pazar ve Ticaret */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Coins className="w-5 h-5" />
                <h3 className="font-cinzel text-lg font-bold">4. Canlı Pazar & 20 Slotluk Kişisel Tezgahlar</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Her oyuncu dilediği zaman 20 slotluk kendi pazar tezgahını açabilir. Pazarınız sunucudaki tüm oyuncular tarafından görülebilir. Eşyalarınıza gelen altın tekliflerini inceleyebilir, pazarlık yapabilir veya doğrudan satışa sunabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SIRALAMA (LEADERBOARD) */}
        {/* ========================================================= */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                  CANLI SUNUCU SIRALAMASI
                </span>
                <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100">
                  En Yüksek Seviyeli Kahramanlar
                </h2>
              </div>
              <button
                onClick={loadLeaderboard}
                disabled={loadingLeaderboard}
                className="px-3.5 py-2 rounded-lg text-xs font-mono text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLeaderboard ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
            </div>

            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b1216] border-b border-amber-500/20 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Sıra</th>
                      <th className="py-3 px-4">Kahraman</th>
                      <th className="py-3 px-4">Krallık</th>
                      <th className="py-3 px-4">Sınıf</th>
                      <th className="py-3 px-4 text-center">Seviye</th>
                      <th className="py-3 px-4 text-right">Altın</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          {loadingLeaderboard
                            ? 'Liderlik tablosu yükleniyor...'
                            : 'Henüz kayıtlı kahraman bulunmuyor. İlk kahramanı sen oluştur!'}
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((char, index) => (
                        <tr
                          key={char.id || index}
                          className="hover:bg-amber-500/5 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded ${
                                index === 0
                                  ? 'bg-amber-400 text-slate-950 font-extrabold'
                                  : index === 1
                                  ? 'bg-slate-300 text-slate-950 font-bold'
                                  : index === 2
                                  ? 'bg-amber-700 text-white font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                            <span>{char.name}</span>
                            {index === 0 && <Crown className="w-3.5 h-3.5 text-amber-400 inline" />}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-300">
                            {char.kingdom_id === 'sylvaen'
                              ? 'Sylvaen'
                              : char.kingdom_id === 'ithilmar'
                              ? 'Ithilmar'
                              : 'Lorvathiel'}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-400">
                            {char.class_id}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-amber-400">
                            Lv. {char.level}
                          </td>
                          <td className="py-3.5 px-4 text-right text-yellow-300/80">
                            {Number(char.gold || 0).toLocaleString()} G
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: HAKKIMIZDA */}
        {/* ========================================================= */}
        {activeTab === 'about' && (
          <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
            <div className="text-center space-y-3 pb-6 border-b border-amber-500/20">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                HAN GAMING STUDIO
              </span>
              <h2 className="font-cinzel text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                Elves Online Hakkında
              </h2>
            </div>

            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  <strong className="text-amber-300">Elves Online</strong>, kadim fantezi dünyasını ve eski nesil MMORPG’lerin özlenen emek ve strateji dolu ruhunu modern web ve mobil cihazlara taşıyan bağımsız bir projedir.
                </p>
                <p>
                  Yapımcımız <strong className="text-amber-300">Emirhan Kalaycı</strong> ve <strong className="text-amber-300">Han Gaming Studio</strong> ekibi olarak amacımız; oyunculara otomatik tıklamalarla her şeyin anında verildiği sıradan oyunlar yerine, kazanılan her kılıcın, her seviyenin ve her pazar satışının gerçek bir başarı sayıldığı unutulmaz bir diyar sunmaktır.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Yapımcı & Tasarım</div>
                  <div className="text-sm font-cinzel font-bold text-amber-300">Emirhan Kalaycı</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Geliştirici Stüdyo</div>
                  <div className="text-sm font-cinzel font-bold text-amber-300">Han Gaming Studio</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Oyun Durumu</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">Açık (Beta) v1.0</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Altyapı & Barındırma</div>
                  <div className="text-sm font-mono font-bold text-sky-400">Supabase + Vercel Cloud</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: İLETİŞİM & GERİ BİLDİRİM */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
            <div className="text-center space-y-3 pb-6 border-b border-amber-500/20">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                İLETİŞİM & TOPLULUK
              </span>
              <h2 className="font-cinzel text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                Geliştirici ile İletişim
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Açık Beta sürecinde karşılaştığınız her türlü öneri, denge fikri veya hata bildirimini bize doğrudan iletebilirsiniz.
              </p>
            </div>

            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 sm:p-8 space-y-6">
              {contactSent ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-cinzel text-base font-bold text-emerald-300">
                    Geri Bildiriminiz Alındı!
                  </h4>
                  <p className="text-xs text-slate-300">
                    Mesajınız Han Gaming Studio ekibine başarıyla iletildi. Katkınız için teşekkür ederiz.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Konu</label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                    >
                      <option value="Geri Bildirim">Açık Beta Geri Bildirimi</option>
                      <option value="Hata Bildirimi">Hata Bildirimi (Bug Report)</option>
                      <option value="Denge & Öneri">Oyun Dengesi & Stat Önerisi</option>
                      <option value="İş Birliği">İş Birliği & Genel</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">E-posta Adresiniz (Opsiyonel)</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="adiniz@example.com"
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Mesajınız</label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Düşüncelerinizi buraya yazın..."
                      required
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg text-xs font-cinzel font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mesajı Gönder</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="relative z-10 border-t border-amber-500/10 bg-[#030608] py-8 px-4 text-center text-xs text-slate-500 font-mono space-y-2">
        <div className="flex items-center justify-center gap-3">
          <span className="text-amber-400 font-cinzel font-semibold">ELVES ONLINE</span>
          <span>•</span>
          <span>Yapımcı: Emirhan Kalaycı</span>
          <span>•</span>
          <span>Han Gaming Studio</span>
        </div>
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} Han Gaming Studio. Tüm hakları saklıdır. Açık Beta Sürümü.
        </p>
      </footer>

      {/* ========================================================= */}
      {/* AUTHENTICATION MODAL */}
      {/* ========================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#070c0e] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-5">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-2">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-xl font-bold text-amber-200">
                Elves Online Giriş
              </h3>
              <p className="text-xs text-slate-400">
                Kadim diyara katılmak için oturum yönteminizi seçin.
              </p>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('google');
                  setAuthError('');
                }}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  authMode === 'google'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('email');
                  setAuthError('');
                }}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  authMode === 'email'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                E-posta
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('guest');
                  setAuthError('');
                }}
                className={`py-1.5 rounded transition-all cursor-pointer ${
                  authMode === 'guest'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hızlı Oyna
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-tight">{authError}</span>
              </div>
            )}

            {/* TAB: GOOGLE OAUTH */}
            {authMode === 'google' && (
              <div className="space-y-4 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs tracking-wider flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google ile Devam Et</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center font-mono">
                  Oturumunuz Supabase Cloud ile güvenli bir şekilde saklanır.
                </p>
              </div>
            )}

            {/* TAB: EMAIL / PASSWORD */}
            {authMode === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">E-posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ornek@mail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Şifre</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-lg text-xs font-cinzel font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isRegistering ? 'Kayıt Ol & Giriş Yap' : 'Giriş Yap'}
                </button>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[11px] font-mono text-amber-400 hover:underline cursor-pointer"
                  >
                    {isRegistering
                      ? 'Zaten bir hesabın var mı? Giriş Yap'
                      : 'Hesabın yok mu? Yeni Hesap Oluştur'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB: GUEST QUICK START */}
            {authMode === 'guest' && (
              <form onSubmit={handleGuestStart} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    Hızlı Kahraman Adı (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Örn: SylvaenMuhafiz"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                  Hesap açmadan hızlıca açık betayı deneyimleyin. İlerlemeniz yerel tarayıcınızda ve bulut sıralamasında saklanır.
                </p>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-xs font-cinzel font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 transition-all cursor-pointer"
                >
                  Hemen Oyuna Başla
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
