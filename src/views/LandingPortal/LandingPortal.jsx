import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  Trophy,
  BookOpen,
  Mail,
  Info,
  Globe,
  RefreshCw,
  Crown,
  Flame,
  Gem,
  Coins,
  Send,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  X,
  Swords,
  ChevronRight,
  LogOut,
  User,
  Lock,
  LogIn,
  KeyRound,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from '../../services/authService';
import { fetchTopLeaderboard, fetchPlayerCounts } from '../../services/cloudCharacterService';
import { ASSETS } from '../../config/assets';

// 4 Krallık Tanımları: Mini Hikaye, Bayrak, Manzara ve Büyük Elf Ağacı
const KINGDOM_SHOWCASE = [
  {
    id: 'aeltherin',
    name: 'Aeltherin Krallığı',
    title: 'Güneş & Kadim Işık Elfleri',
    description: 'Yüksek altın kuleleri ve saf kadim ışığın koruyucuları. Asil hanedanların ve diplomatik dehanın beşiği.',
    flagName: 'Aeltherin Krallığı Sancağı',
    flagImg: ASSETS.kingdoms.aeltherin.crest,
    landscapeImg: ASSETS.kingdoms.aeltherin.banner,
    treeImg: ASSETS.trees.aeltherin,
    treeTitle: 'Kadim Altın Işık Ağacı',
    treeDescription: 'Aeltherin Krallığı’nın gökyüzüne uzanan altın yapraklı kutsal ağacı. Saf güneş ışığının ve kadim hanedanların koruyucusu.',
    badgeColor: 'from-amber-400/20 to-amber-600/10 text-amber-300 border-amber-500/40',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'sylvandar',
    name: 'Sylvandar Krallığı',
    title: 'Kadim Zümrüt Orman Elfleri',
    description: 'Yüzyıllık kutsal ağaçların gölgesinde yaşayan, doğanın ve kadim yaratıkların kadim sırlarına hükmeden halk.',
    flagName: 'Sylvandar Krallığı Sancağı',
    flagImg: ASSETS.kingdoms.sylvandar.crest,
    landscapeImg: ASSETS.kingdoms.sylvandar.banner,
    treeImg: ASSETS.trees.sylvandar,
    treeTitle: 'Kutsal Zümrüt Yaşam Ağacı',
    treeDescription: 'Yüzyıllık kutsal ormanın kalbinde parıldayan devasa zümrüt hayat ağacı. Tüm doğanın ve kadim yaratıkların yaşam kaynağı.',
    badgeColor: 'from-emerald-400/20 to-emerald-600/10 text-emerald-300 border-emerald-500/40',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'lorvathiel',
    name: 'Lorvathiel Krallığı',
    title: 'Gece & Hilal Muhafızları',
    description: 'Gümüş yıldızların ve sessiz gölgelerin elfleri. Gece göğünün gizemli bilgeliğini ve soğuk çeliğini kuşanmışlardır.',
    flagName: 'Lorvathiel Krallığı Sancağı',
    flagImg: ASSETS.kingdoms.lorvathiel.crest,
    landscapeImg: ASSETS.kingdoms.lorvathiel.banner,
    treeImg: ASSETS.trees.lorvathiel,
    treeTitle: 'Hilal & Gümüş Gece Ağacı',
    treeDescription: 'Gümüş yıldızların ve parıldayan hilal ayın altında parlayan mistik gece ağacı. Sessiz gölgelerin ve kadim bilgeliğin beşiği.',
    badgeColor: 'from-indigo-400/20 to-indigo-600/10 text-indigo-300 border-indigo-500/40',
    accentColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.25)',
  },
  {
    id: 'ithilmar',
    name: 'Ithilmar Krallığı',
    title: 'Kristal Sis & Okyanus Elfleri',
    description: 'Köpüren denizlerin ve el değmemiş kristal kıyıların efendileri. Derin suların fısıltısını duyarlar.',
    flagName: 'Ithilmar Krallığı Sancağı',
    flagImg: ASSETS.kingdoms.ithilmar.crest,
    landscapeImg: ASSETS.kingdoms.ithilmar.banner,
    treeImg: ASSETS.trees.ithilmar,
    treeTitle: 'Kristal Sis & Okyanus Ağacı',
    treeDescription: 'Köpüren masmavi dalgaların ve parıldayan kristallerin ortasında yükselen kadim okyanus ağacı. Derin suların fısıltısını taşır.',
    badgeColor: 'from-sky-400/20 to-sky-600/10 text-sky-300 border-sky-500/40',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
  },
];

// 3 Karakter Sınıfı Tanımları
const CLASSES_SHOWCASE = [
  {
    id: 'warrior',
    name: 'Savaşçı',
    title: 'Asil Muhafız & Şövalye',
    description: 'Zarif elven zırhları ve çift elli kılıçlarıyla cephenin en ön saflarında dimdik duran onurlu savaşçılar. Yüksek fiziksel savunma ve sarsılmaz dayanıklılıkla düşman ordularını tek başına karşılarlar.',
    image: ASSETS.classes.warrior.showcase,
    avatars: [
      { gender: 'Kadın', src: ASSETS.classes.warrior.female },
      { gender: 'Erkek', src: ASSETS.classes.warrior.male },
    ],
    features: ['Ağır Zırh ve Kalkan', 'Ön Cephe Hakimiyeti', 'Yüksek Sağlık (HP)'],
    themeBorder: 'border-amber-500/40',
    themeText: 'text-amber-300',
  },
  {
    id: 'ninja',
    name: 'Ninja',
    title: 'Gölge Hançeri & Suikastçı',
    description: 'Sessizlik içinde süzülen, rüzgar kadar hızlı ve ölümcül vuruşlarıyla hedeflerini göz açıp kapayıncaya kadar avlayan gölge ustaları. Çift hançer ve kritik darbe ustalığıyla en tehlikeli tehditleri ortadan kaldırırlar.',
    image: ASSETS.classes.assassin.showcase,
    avatars: [
      { gender: 'Kadın', src: ASSETS.classes.assassin.female },
      { gender: 'Erkek', src: ASSETS.classes.assassin.male },
    ],
    features: ['Çift Hançer & Gizlilik', 'Ölümcül Kritik Vuruş', 'Kusursuz Çeviklik (AGI)'],
    themeBorder: 'border-purple-500/40',
    themeText: 'text-purple-300',
  },
  {
    id: 'mage',
    name: 'Büyücü',
    title: 'Yüksek Arkanist',
    description: 'Kadim rünlerin ve elementlerin enerjisini zarafetle şekillendiren, gerçekliğin dokusunu değiştirebilen kadim büyücüler. Alan etkili yıkıcı arkan fırtınaları ve koruyucu enerji kalkanlarıyla savaşı uzaktan yönetirler.',
    image: ASSETS.classes.mage.showcase,
    avatars: [
      { gender: 'Kadın', src: ASSETS.classes.mage.female },
      { gender: 'Erkek', src: ASSETS.classes.mage.male },
    ],
    features: ['Yıkıcı Alan Büyüleri', 'Kadim Rün Kalkanları', 'Yüksek Zeka (INT)'],
    themeBorder: 'border-sky-500/40',
    themeText: 'text-sky-300',
  },
];

export default function LandingPortal({
  onEnterGame,
  currentUser,
  savedCharacter,
  onSignOut,
}) {
  // Tab sync: 'home' | 'guide' | 'leaderboard' | 'about' | 'contact'
  const [activeTab, setActiveTab] = useState('home');

  // Google Login state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auth Modal & Email Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [providerHelpOpen, setProviderHelpOpen] = useState(false);

  // Live Player Counts (Veritabanından doğrudan çekilir)
  const [playerCounts, setPlayerCounts] = useState({ onlineCount: 0, totalCount: 0 });

  // Lightbox Preview Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Contact form state
  const [contactSubject, setContactSubject] = useState('Geri Bildirim');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // URL Path <-> Tab synchronization
  const getTabFromPath = (path) => {
    const clean = decodeURIComponent(path || '').toLowerCase();
    if (clean.includes('/rehber')) return 'guide';
    if (clean.includes('/sıralama') || clean.includes('/siralama')) return 'leaderboard';
    if (clean.includes('/hakkimizda') || clean.includes('/hakkımızda')) return 'about';
    if (clean.includes('/iletisim') || clean.includes('/iletişim')) return 'contact';
    return 'home';
  };

  const getPathForTab = (tabId) => {
    switch (tabId) {
      case 'guide':
        return '/rehber';
      case 'leaderboard':
        return '/sıralama';
      case 'about':
        return '/hakkimizda';
      case 'contact':
        return '/iletisim';
      case 'home':
      default:
        return '/anasayfa';
    }
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    const newPath = getPathForTab(tabId);
    window.history.pushState(null, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const initialTab = getTabFromPath(window.location.pathname);
    setActiveTab(initialTab);

    // Ana sayfa için URL'yi daima /anasayfa olarak senkronize et
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState(null, '', '/anasayfa');
    }

    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Live Player Counts
  useEffect(() => {
    let isMounted = true;
    const loadCounts = async () => {
      const counts = await fetchPlayerCounts();
      if (isMounted && counts) {
        setPlayerCounts(counts);
      }
    };
    loadCounts();
    const timer = setInterval(loadCounts, 25000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Load Leaderboard on tab switch
  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);
    const data = await fetchTopLeaderboard(25);
    setLeaderboard(data);
    setLoadingLeaderboard(false);
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab]);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setAuthError('');
    setGoogleLoading(true);
    const res = await signInWithGoogle();
    setGoogleLoading(false);
    if (!res.success) {
      if (res.isProviderDisabled || res.error?.includes('provider is not enabled') || res.error?.includes('validation_failed')) {
        setAuthError('Google sağlayıcısı Supabase panelinde henüz etkinleştirilmedi. Dilerseniz E-posta ile giriş yapabilir veya doğrudan oyuna başlayabilirsiniz.');
        setProviderHelpOpen(true);
        setShowAuthModal(true);
      } else {
        setAuthError(res.error);
      }
    }
  };

  // Handle Supabase Email & Password Login / Register
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }
    setAuthError('');
    setAuthSuccessMsg('');
    setAuthActionLoading(true);

    if (authMode === 'login') {
      const res = await signInWithEmail(authEmail, authPassword);
      setAuthActionLoading(false);
      if (!res.success) {
        setAuthError(res.error || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
      } else {
        setAuthSuccessMsg('Giriş başarılı! Karakter dünyasına aktarılıyorsunuz...');
        setTimeout(() => {
          setShowAuthModal(false);
          onEnterGame?.();
        }, 700);
      }
    } else {
      const res = await signUpWithEmail(authEmail, authPassword);
      setAuthActionLoading(false);
      if (!res.success) {
        setAuthError(res.error || 'Kayıt oluşturulamadı.');
      } else {
        setAuthSuccessMsg('Hesabınız oluşturuldu! Oyuna yönlendiriliyorsunuz...');
        setTimeout(() => {
          setShowAuthModal(false);
          onEnterGame?.();
        }, 900);
      }
    }
  };

  // Handle Contact Feedback
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-[#060a0d]/90 to-[#020406]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#060a0d]/95 backdrop-blur-md border-b border-amber-500/20 px-4 lg:px-8 py-3.5 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand -> Navigates to /anasayfa */}
          <div
            onClick={() => switchTab('home')}
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

          {/* Navigation Links: /anasayfa, /rehber, /sıralama, /hakkimizda, /iletisim */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {[
              { id: 'home', label: 'Ana Sayfa', icon: Globe, path: '/anasayfa' },
              { id: 'guide', label: 'Rehber', icon: BookOpen, path: '/rehber' },
              { id: 'leaderboard', label: 'Sıralama', icon: Trophy, path: '/sıralama' },
              { id: 'about', label: 'Hakkımızda', icon: Info, path: '/hakkimizda' },
              { id: 'contact', label: 'İletişim', icon: Mail, path: '/iletisim' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Auth Action & Play Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daima Erişilebilir Oyuna Başla Butonu */}
            <button
              onClick={onEnterGame}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-cinzel font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer active:scale-95"
            >
              <Swords className="w-3.5 h-3.5 text-slate-950" />
              <span>{savedCharacter?.name ? `Karakterime Git` : 'Oyuna Başla'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[120px] truncate">{currentUser.email || 'Hesap'}</span>
                </div>

                <button
                  onClick={onSignOut}
                  title="Çıkış Yap"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700/60 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError('');
                  setShowAuthModal(true);
                }}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-cinzel font-bold tracking-wider text-slate-200 bg-[#0c151c] hover:bg-[#13222d] border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.5)]"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Giriş / Hesap</span>
                <span className="sm:hidden">Giriş</span>
              </button>
            )}
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
                onClick={() => switchTab(tab.id)}
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

      {/* Auth Error Toast */}
      {authError && (
        <div className="max-w-3xl mx-auto px-4 pt-4 w-full">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setAuthError('')}
              className="text-red-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Body Content */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 sm:py-10">
        {/* ========================================================================= */}
        {/* TAB 1: ANA SAYFA (SADECE KULLANICININ İSTEDİĞİ BİLEŞENLER) */}
        {/* ========================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fadeIn">
            {/* A. CANLI OYUNCU SAYAÇLARI BANNERI */}
            <div className="relative rounded-2xl bg-gradient-to-r from-[#071116] via-[#09151c] to-[#071116] border border-amber-500/30 p-5 sm:p-7 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>CANLI SUNUCU METRİKLERİ • AÇIK BETA</span>
                  </div>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-300">
                    Elves Online Dünyası
                  </h2>
                  <div className="pt-1 flex items-center justify-center sm:justify-start gap-2.5">
                    <button
                      onClick={onEnterGame}
                      className="px-4 py-2 rounded-lg text-xs font-cinzel font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 border border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Swords className="w-3.5 h-3.5 text-slate-950" />
                      <span>{savedCharacter?.name ? `Karakterimle Oyuna Başla (${savedCharacter.name})` : 'Hemen Oyuna Katıl — Ücretsiz Oyna'}</span>
                    </button>
                  </div>
                </div>

                {/* Online ve Toplam Oyuncu Sayacı */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full sm:w-auto">
                  {/* Online Oyuncu Sayısı */}
                  <div className="bg-[#04080a]/90 border border-emerald-500/30 rounded-xl px-5 py-3.5 min-w-[170px] flex items-center gap-3.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <div className="relative flex items-center justify-center">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80">
                        Online Oyuncu Sayısı :
                      </div>
                      <div className="font-cinzel text-2xl font-extrabold text-emerald-300 tracking-wider">
                        {playerCounts.onlineCount}
                      </div>
                    </div>
                  </div>

                  {/* Toplam Oyuncu Sayısı */}
                  <div className="bg-[#04080a]/90 border border-amber-500/30 rounded-xl px-5 py-3.5 min-w-[170px] flex items-center gap-3.5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80">
                        Toplam Oyuncu Sayısı :
                      </div>
                      <div className="font-cinzel text-2xl font-extrabold text-amber-300 tracking-wider">
                        {Number(playerCounts.totalCount).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* B. 4 ADET BÜYÜK ELF AĞACI VE KRALLIKLAR BÖLÜMÜ */}
            <div className="space-y-10">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono text-amber-400 tracking-[0.25em] uppercase">
                  KADİM HANEDANLAR VE KUTSAL AĞAÇLAR
                </span>
                <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200">
                  4 Büyük Elf Ağacı & Krallıklar
                </h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
              </div>

              {/* 4 Krallık Listesi */}
              <div className="space-y-12">
                {KINGDOM_SHOWCASE.map((k, idx) => (
                  <div
                    key={k.id}
                    className="relative rounded-2xl bg-[#060c0f] border border-amber-500/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all hover:border-amber-400/60"
                  >
                    {/* Üst Başlık & Bayrak / Sancak Şeridi */}
                    <div className="bg-[#091318] border-b border-amber-500/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Krallık Sancağı / Bayrağı */}
                        <div
                          onClick={() => setPreviewImage({ src: k.flagImg, title: k.flagName })}
                          className="relative w-12 h-12 rounded-lg border-2 border-amber-400/70 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 cursor-pointer group"
                        >
                          <img
                            src={k.flagImg}
                            alt={k.flagName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200">
                              {k.name}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hidden sm:inline-block">
                              {k.flagName}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-cinzel text-amber-400 font-semibold tracking-wide">
                            {k.title}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Kadim Kutsal Ağaç</span>
                        <span className="text-xs font-cinzel font-bold text-emerald-400">
                          {k.treeTitle}
                        </span>
                      </div>
                    </div>

                    {/* Ana Gövde: Büyük Elf Ağacı Fotoğrafı & Krallık Fotoğrafı & Mini Hikaye */}
                    <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      {/* SOL / BÜYÜK GÖRSEL: BÜYÜK ELF AĞACI FOTOĞRAFI (16:9 Geniş & Yüksek Kalite) */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                          <span className="flex items-center gap-1.5 font-cinzel font-bold">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            {k.name} - {k.treeTitle}
                          </span>
                          <span className="text-[10px] text-slate-400">Büyük Elf Ağacı Fotoğrafı</span>
                        </div>

                        <div
                          onClick={() => setPreviewImage({ src: k.treeImg, title: `${k.name} - ${k.treeTitle}` })}
                          className="relative rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-[0_0_30px_rgba(0,0,0,0.9)] aspect-video cursor-pointer group"
                        >
                          <img
                            src={k.treeImg}
                            alt={`${k.name} Büyük Elf Ağacı`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="px-3 py-1.5 rounded-lg bg-black/75 border border-amber-400 text-amber-300 text-xs font-cinzel flex items-center gap-1.5">
                              <ZoomIn className="w-4 h-4" />
                              <span>Tam Boyut Görüntüle</span>
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-left">
                            <p className="text-xs text-slate-200 font-sans line-clamp-2 drop-shadow-md">
                              {k.treeDescription}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SAĞ: MİNİ HİKAYE VE KRALLIK MANZARA FOTOĞRAFI */}
                      <div className="lg:col-span-5 space-y-5">
                        {/* Mini Hikaye Bölümü */}
                        <div className="bg-[#0a1419]/80 border border-slate-800 rounded-xl p-5 space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 block">
                            Krallık Hakkında Mini Hikaye
                          </span>
                          <blockquote className="text-sm sm:text-base font-cormorant italic text-slate-200 leading-relaxed border-l-2 border-amber-400 pl-3.5">
                            "{k.description}"
                          </blockquote>
                        </div>

                        {/* Krallık Fotoğrafı (Landscape / Manzara) */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>Krallık Fotoğrafı & Başkent</span>
                            <span className="text-[10px] text-amber-400/80">Manzara</span>
                          </div>

                          <div
                            onClick={() => setPreviewImage({ src: k.landscapeImg, title: `${k.name} Başkenti` })}
                            className="relative rounded-xl overflow-hidden border border-amber-500/30 aspect-[16/9] cursor-pointer group shadow-lg"
                          >
                            <img
                              src={k.landscapeImg}
                              alt={`${k.name} Manzarası`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm border border-amber-500/30 text-[11px] font-cinzel text-amber-200">
                              {k.name} Manzarası
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* C. OYUNDAKİ 3 KARAKTER SINIFININ ANLATIMI VE FOTOĞRAFLARI (SAVAŞÇI, NİNJA, BÜYÜCÜ) */}
            <div className="space-y-8 pt-4">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono text-amber-400 tracking-[0.25em] uppercase">
                  KADİM SAVAŞ DİSİPLİNLERİ
                </span>
                <h2 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200">
                  Oyundaki 3 Karakter Sınıfı
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                  Savaşçı, Ninja ve Büyücü. Kendi savaş stilinizi seçin, elven yeteneklerinizle diyara adınızı yazdırın.
                </p>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
              </div>

              {/* 3 Karakter Kartları Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {CLASSES_SHOWCASE.map((cls) => (
                  <div
                    key={cls.id}
                    className="rounded-2xl bg-[#060c0f] border border-amber-500/30 overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.8)] flex flex-col group hover:border-amber-400 transition-all"
                  >
                    {/* Sınıf Fotoğrafı (Büyük Yüksek Kalite Poster) */}
                    <div
                      onClick={() => setPreviewImage({ src: cls.image, title: `${cls.name} Sınıfı` })}
                      className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    >
                      <img
                        src={cls.image}
                        alt={`${cls.name} Sınıfı Fotoğrafı`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060c0f] via-transparent to-transparent opacity-90" />

                      {/* Rozet */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-300 font-cinzel text-xs font-bold">
                        {cls.name}
                      </div>

                      {/* Zoom Butonu */}
                      <div className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 text-slate-300 group-hover:text-amber-300 group-hover:bg-black/80 transition-all">
                        <ZoomIn className="w-4 h-4" />
                      </div>

                      {/* Başlık Overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-cinzel text-2xl font-bold text-amber-100">
                          {cls.name}
                        </h3>
                        <p className={`text-xs font-cinzel font-semibold ${cls.themeText}`}>
                          {cls.title}
                        </p>
                      </div>
                    </div>

                    {/* Sınıf Anlatımı ve Detayları */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* Anlatım Metni */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                        {cls.description}
                      </p>

                      {/* Özellik Maddeleri */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        {cls.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Avatar Seçenekleri (Kadın / Erkek Görselleri) */}
                      <div className="pt-3 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                          Seçilebilir Portreler:
                        </span>
                        <div className="flex items-center gap-3">
                          {cls.avatars.map((av, aIdx) => (
                            <div
                              key={aIdx}
                              onClick={() => setPreviewImage({ src: av.src, title: `${cls.name} (${av.gender}) Portresi` })}
                              className="flex items-center gap-2 bg-[#091216] border border-slate-800 hover:border-amber-500/40 rounded-lg p-1.5 cursor-pointer transition-all"
                            >
                              <img
                                src={av.src}
                                alt={`${cls.name} ${av.gender}`}
                                className="w-9 h-9 rounded object-cover"
                              />
                              <span className="text-xs font-cinzel text-slate-300 pr-1.5">
                                {av.gender}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REHBER (/rehber) */}
        {/* ========================================================================= */}
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
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-lg font-bold">1. Başlangıç Özellikleri ve Stat Dağılımı</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tüm oyuncular oyuna mutlak eşitlik ilkeleriyle başlar. Otomatik kazanımlar yerine her seviyede verilen 6 serbest stat puanıyla kendi kahramanınızı şekillendirirsiniz:
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
                  <span>Doğrudan fiziksel hasarınızı artırır. Savaşçı sınıfının temel gücüdür.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">• Çeviklik (AGI):</span>
                  <span>Saldırılardan kaçınma, kritik darbe olasılığı ve savunma kazandırır. Ninja sınıfının can damarıdır.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sky-400 font-bold">• Zeka (INT):</span>
                  <span>Büyü yeteneklerinin hasarını ve mana yenilenmesini katlar. Büyücü sınıfı için esastır.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">• Can (HP):</span>
                  <span>Maksimum sağlık havuzunuzu genişleterek ölümcül darbelere karşı dayanıklılık sağlar.</span>
                </div>
              </div>
            </div>

            {/* Guide Section 2: %5 Drop Oranı */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-lg font-bold">2. Zorlu Seviye Eğrisi & Net %5 Eşya Düşme Oranı</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Elves Online, herkesin bir günde son seviyeye ulaştığı kolaylaştırılmış oyun tarzını reddeder:
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 bg-red-950/20 border border-red-500/30 rounded text-red-200">
                  <span className="font-bold">⚠️ Seviye Sınırı Felsefesi:</span> 24 saat kesintisiz ve aktif olarak zindanlarda savaşan bir oyuncu en fazla ~30. seviyeye ulaşabilir. Her canavarın ve görevin tecrübe puanı özenle dengelenmiştir.
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-amber-200">
                  <span className="font-bold">💎 Net %5 Eşya Düşme Oranı:</span> Zindanlar, maden kazıları ve canavarlardan eşya düşme olasılığı %5 olarak sabitlenmiştir. Bu sayede elde ettiğiniz her zırh, kılıç veya asa pazarda gerçek bir servet değerindedir.
                </div>
              </div>
            </div>

            {/* Guide Section 3: Kadim Bosslar ve Zindanlar */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Swords className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-lg font-bold">3. Kadim Bosslar & 6 Saatlik Bekleme Süresi</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kadim Bosslar diyarlarda dehşet saçmaktadır. Bir Kadim Boss mağlup edildikten sonra yeniden belirmesi tam <span className="text-amber-300 font-bold">6 saat</span> sürer. Grup kurarak takım arkadaşlarınızla birlikte avlanmanız önerilir.
              </p>
            </div>

            {/* Guide Section 4: Pazar ve Ticaret */}
            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="font-cinzel text-lg font-bold">4. Canlı Pazar & 20 Slotluk Kişisel Tezgahlar</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Her oyuncu dilediği zaman 20 slotluk kendi pazar tezgahını açabilir. Pazarınız sunucudaki tüm oyuncular tarafından görülebilir. Eşyalarınıza gelen altın tekliflerini inceleyebilir, pazarlık yapabilir veya doğrudan satışa sunabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SIRALAMA (/sıralama) */}
        {/* ========================================================================= */}
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
                            {char.kingdom_id === 'aeltherin'
                              ? 'Aeltherin'
                              : char.kingdom_id === 'sylvandar'
                              ? 'Sylvandar'
                              : char.kingdom_id === 'lorvathiel'
                              ? 'Lorvathiel'
                              : 'Ithilmar'}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-400">
                            {char.class_id === 'assassin' ? 'Ninja' : char.class_id === 'mage' ? 'Büyücü' : 'Savaşçı'}
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

        {/* ========================================================================= */}
        {/* TAB 4: HAKKIMIZDA (/hakkimizda) */}
        {/* ========================================================================= */}
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

            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
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
                  <div className="text-sm font-mono font-bold text-emerald-400">Açık Beta v1.0</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">Altyapı & Barındırma</div>
                  <div className="text-sm font-mono font-bold text-sky-400">Supabase + Vercel Cloud</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: İLETİŞİM (/iletisim) */}
        {/* ========================================================================= */}
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

            <div className="bg-[#070c0e] border border-amber-500/20 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
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
      <footer className="relative z-10 border-t border-amber-500/10 bg-[#030608] py-8 px-4 text-center text-xs text-slate-500 font-mono space-y-2 mt-auto">
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

      {/* 4. Full-Size Image Preview Modal (Lightbox) */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#070c0e] border border-amber-500/40 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)]"
          >
            <div className="p-3 bg-[#0a1216] border-b border-amber-500/20 flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-amber-300">
                {previewImage.title}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 sm:p-4 flex items-center justify-center bg-black/60 max-h-[80vh] overflow-hidden">
              <img
                src={previewImage.src}
                alt={previewImage.title}
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Comprehensive Authentication Modal */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#080e12] border border-amber-500/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-amber-200">
                    Elves Online Giriş
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Kadim Elf Krallıklarına Adım Atın
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Feedback */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )}
            {authSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {/* Mode Tabs: Giriş Yap vs Kayıt Ol */}
            <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-cinzel font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                E-posta ile Giriş
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-cinzel font-bold rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Yeni Hesap Aç
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="ornek@gmail.com"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Şifre</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authActionLoading}
                className="w-full py-2.5 rounded-lg text-xs font-cinzel font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>
                  {authActionLoading
                    ? 'İşleniyor...'
                    : authMode === 'login'
                    ? 'Hesabımla Giriş Yap'
                    : 'Hesabımı Oluştur'}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] font-mono text-slate-500 uppercase">veya</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Google OAuth Option */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-cinzel font-bold text-slate-200 bg-[#0f172a] hover:bg-[#1e293b] border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{googleLoading ? 'Bağlanılıyor...' : 'Google ile Giriş Yap'}</span>
              </button>

              {/* Provider Information Box */}
              {providerHelpOpen && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] space-y-2">
                  <div className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Supabase Google Provider Bilgilendirmesi</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Supabase panelinde Google OAuth sağlayıcısı henüz aktif edilmemiş. Google ile giriş yapmak için:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 font-mono text-[10px]">
                    <li>Supabase Dashboard → Authentication → Providers → Google</li>
                    <li>Google sağlayıcısını <b>Enabled</b> yapın</li>
                    <li>Google Cloud Console'dan <b>Client ID</b> ve <b>Client Secret</b> girin</li>
                    <li>Callback URL: <code className="text-amber-300">https://ujalovcddzrmljckyavc.supabase.co/auth/v1/callback</code></li>
                  </ol>
                  <p className="text-emerald-400 font-semibold pt-1">
                    💡 İpucu: Bu ayarı tamamlayana kadar yukarıdaki E-posta formuyla veya aşağıdaki butona basarak doğrudan oyuna başlayabilirsiniz!
                  </p>
                </div>
              )}
            </div>

            {/* Guest / Direct Entry */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  onEnterGame?.();
                }}
                className="w-full py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-amber-300 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span>Giriş Yapmadan Oyuna Başla (Misafir Oyna) →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
