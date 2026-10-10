import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Store,
  Tag,
  Coins,
  User,
  Sparkles,
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  Trash2,
  History,
  TrendingUp,
  ArrowRight,
  Clock,
  Shield,
  Swords,
  Eye,
  Send,
} from 'lucide-react';
import OrnateFrame from '../../components/OrnateFrame';
import SubmenuBar from '../../components/SubmenuBar';
import ElvenButton from '../../components/ElvenButton';
import PlayerBadge from '../../components/PlayerBadge';
import { ALL_MENUS } from '../../config/gameData';
import {
  MAX_STALL_SLOTS,
  MARKET_TAX_PERCENT,
  loadMarketStalls,
  saveMarketStalls,
  loadMarketHistory,
  saveMarketHistory,
  loadPlayerStall,
  savePlayerStall,
  getLatestBenchmarkPrice,
} from '../../config/marketData';
import {
  listItemToStallService,
  unlistItemFromStallService,
  buyMarketItemService,
  makeOfferService,
  acceptOfferService,
  declineOfferService,
  fetchCloudMarketStalls,
  syncPlayerStallToCloud,
  subscribeToRealtimeMarket,
} from '../../services/marketService';

export default function MarketView({
  player,
  layoutMode = 'mobile',
  onUpdatePlayer,
  onBroadcast,
}) {
  const isPC = layoutMode === 'pc';

  // Submenu yönetimi ('browse' | 'my_stall' | 'history')
  const [activeSubmenu, setActiveSubmenu] = useState('browse');

  const submenus = useMemo(() => {
    return ALL_MENUS.find((m) => m.id === 'market')?.submenus || [
      { id: 'browse', label: 'Pazar Alanı' },
      { id: 'my_stall', label: 'Pazar Kur / Tezgahım' },
      { id: 'history', label: 'Piyasa Geçmişi' },
    ];
  }, []);

  // Ana State'ler
  const [marketStalls, setMarketStalls] = useState(() => loadMarketStalls());
  const [marketHistory, setMarketHistory] = useState(() => loadMarketHistory());
  const [playerStall, setPlayerStall] = useState(() => loadPlayerStall(player?.name));
  const [toast, setToast] = useState(null); // { text, type: 'success' | 'error' }

  // Arama & Filtreleme (Pazar Alanı)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Geçmiş Arama
  const [historySearch, setHistorySearch] = useState('');

  // Modallar & Seçimler
  const [listingModalItem, setListingModalItem] = useState(null); // Envanterden tezgaha koymak için seçilen eşya
  const [listingPriceInput, setListingPriceInput] = useState('');
  const [inspectingStall, setInspectingStall] = useState(null); // İncelenen başka bir oyuncu tezgahı
  const [inspectedItem, setInspectedItem] = useState(null); // Tezgaha tıklandığında incelenen eşya
  const [offerPriceInput, setOfferPriceInput] = useState(''); // Teklif verme inputu

  // ESC tuşuyla pazar pencerelerini kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setListingModalItem(null);
        setInspectingStall(null);
        setInspectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const lastMarketFetchRef = useRef(0);
  const stallSyncTimeoutRef = useRef(null);

  // Supabase Cloud Pazar Senkronizasyonu (Throttled)
  useEffect(() => {
    fetchCloudMarketStalls().then((cloudStalls) => {
      if (cloudStalls && cloudStalls.length > 0) {
        setMarketStalls(cloudStalls);
        saveMarketStalls(cloudStalls);
      }
    });

    const unsubscribe = subscribeToRealtimeMarket(() => {
      const now = Date.now();
      // En az 5 saniye aralıkla sorgula (istek fırtınalarını engeller)
      if (now - lastMarketFetchRef.current < 5000) return;
      lastMarketFetchRef.current = now;

      fetchCloudMarketStalls().then((updated) => {
        if (updated) {
          setMarketStalls(updated);
          saveMarketStalls(updated);
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Oyuncu kendi tezgahını güncellediğinde buluta senkronize et (Debounced 2.5s)
  useEffect(() => {
    if (playerStall && player?.name) {
      if (stallSyncTimeoutRef.current) clearTimeout(stallSyncTimeoutRef.current);
      stallSyncTimeoutRef.current = setTimeout(() => {
        syncPlayerStallToCloud(playerStall, player?.kingdomName);
      }, 2500);
    }
    return () => {
      if (stallSyncTimeoutRef.current) clearTimeout(stallSyncTimeoutRef.current);
    };
  }, [playerStall, player?.name, player?.kingdomName]);


  // Birleşik Tezgah Listesi (Diğer oyuncular + Oyuncunun kendi tezgahı açıksa)
  const allDisplayStalls = useMemo(() => {
    const others = marketStalls.filter(
      (s) => s.sellerName.toLowerCase() !== (player?.name || '').toLowerCase()
    );
    if (playerStall && playerStall.items.length > 0) {
      return [playerStall, ...others];
    }
    return others;
  }, [marketStalls, playerStall, player?.name]);

  // Filtrelenmiş Tezgahlar
  const filteredStalls = useMemo(() => {
    return allDisplayStalls.filter((stall) => {
      const matchSearch =
        stall.stallTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stall.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stall.items.some((it) => it.item.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        categoryFilter === 'all' ||
        stall.items.some(
          (it) =>
            (it.item.slotName && it.item.slotName.toLowerCase() === categoryFilter.toLowerCase()) ||
            (it.item.slot && it.item.slot.toLowerCase() === categoryFilter.toLowerCase())
        );

      return matchSearch && matchCategory;
    });
  }, [allDisplayStalls, searchQuery, categoryFilter]);

  // Filtrelenmiş Satış Geçmişi
  const filteredHistory = useMemo(() => {
    return marketHistory.filter((hist) => {
      const q = historySearch.toLowerCase();
      return (
        hist.itemName.toLowerCase().includes(q) ||
        hist.seller.toLowerCase().includes(q) ||
        hist.buyer.toLowerCase().includes(q)
      );
    });
  }, [marketHistory, historySearch]);

  // Oyuncunun tezgahındaki toplam bekleyen teklif sayısı
  const pendingOffersCount = useMemo(() => {
    if (!playerStall || !playerStall.items) return 0;
    return playerStall.items.reduce((sum, it) => sum + (it.offers?.length || 0), 0);
  }, [playerStall]);

  // ----------------------- EYLEYİMLER -----------------------

  // 1. Envanterden Tezgaha Eşya Koyma
  const handleOpenListingModal = (invItem) => {
    setListingModalItem(invItem);
    // Piyasa geçmişinden en son satış fiyatını (benchmark) ara
    const benchmark = getLatestBenchmarkPrice(invItem.name, marketHistory);
    if (benchmark && benchmark.price) {
      setListingPriceInput(String(benchmark.price));
    } else {
      setListingPriceInput('');
    }
  };

  const handleConfirmListing = (e) => {
    e.preventDefault();
    if (!listingModalItem) return;

    const res = listItemToStallService(player, playerStall, listingModalItem, listingPriceInput);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setPlayerStall(res.playerStall);
    savePlayerStall(res.playerStall);

    if (onUpdatePlayer) onUpdatePlayer(res.player);

    showToast(res.message, 'success');
    setListingModalItem(null);
    setListingPriceInput('');
  };

  // 2. Tezgahtan Eşyayı Çıkarma (Geri Alma)
  const handleUnlistItem = (stallItemId) => {
    const res = unlistItemFromStallService(player, playerStall, stallItemId);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setPlayerStall(res.playerStall);
    savePlayerStall(res.playerStall);

    if (onUpdatePlayer) onUpdatePlayer(res.player);

    showToast(res.message, 'success');
  };

  // 3. Pazardan Satın Alma
  const handleBuyItem = (stall, item) => {
    const res = buyMarketItemService(player, stall.id, item.id, marketStalls, marketHistory);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setMarketStalls(res.stalls);
    saveMarketStalls(res.stalls);

    setMarketHistory(res.history);
    saveMarketHistory(res.history);

    if (onUpdatePlayer) onUpdatePlayer(res.buyer);

    showToast(res.message, 'success');

    if (onBroadcast) {
      onBroadcast(
        `💰 [${player.name}] oyuncusu [${stall.sellerName}] tezgahından "${item.item.name}" eşyasını ${item.price.toLocaleString()} Altın karşılığında satın aldı!`,
        'normal'
      );
    }

    // Modal açıksa güncelle
    if (inspectingStall && inspectingStall.id === stall.id) {
      const updatedInspecting = res.stalls.find((s) => s.id === stall.id);
      setInspectingStall(updatedInspecting || null);
      setInspectedItem(null);
    }
  };

  // 4. Teklif Verme
  const handleMakeOffer = (stall, item) => {
    const res = makeOfferService(player, stall.id, item.id, offerPriceInput, marketStalls);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setMarketStalls(res.stalls);
    saveMarketStalls(res.stalls);

    showToast(res.message, 'success');

    if (onBroadcast) {
      onBroadcast(
        `🤝 [${player.name}] tarafından [${stall.sellerName}] pazarına "${item.item.name}" için ${Number(offerPriceInput).toLocaleString()} Altın teklif verildi!`,
        'normal'
      );
    }

    setOfferPriceInput('');
    // Modal açıksa güncelle
    const updatedInspecting = res.stalls.find((s) => s.id === stall.id);
    setInspectingStall(updatedInspecting || null);
    if (inspectedItem && inspectedItem.id === item.id) {
      const updatedItem = (updatedInspecting?.items || []).find((it) => it.id === item.id);
      setInspectedItem(updatedItem || null);
    }
  };

  // 5. Satıcının Teklifi Kabul Etmesi
  const handleAcceptOffer = (stallItemId, offerIndex) => {
    const res = acceptOfferService(player, playerStall, stallItemId, offerIndex, marketStalls, marketHistory);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setPlayerStall(res.playerStall);
    savePlayerStall(res.playerStall);

    setMarketStalls(res.stalls);
    saveMarketStalls(res.stalls);

    setMarketHistory(res.history);
    saveMarketHistory(res.history);

    if (onUpdatePlayer) onUpdatePlayer(res.seller);

    showToast(res.message, 'success');

    if (onBroadcast) {
      onBroadcast(
        `🎉 [${player.name}] pazarlık teklifini kabul etti! Eşya yeni sahibine ulaştı.`,
        'normal'
      );
    }
  };

  // 6. Satıcının Teklifi Reddetmesi
  const handleDeclineOffer = (stallItemId, offerIndex) => {
    const res = declineOfferService(playerStall, stallItemId, offerIndex, marketStalls);
    if (!res.success) {
      showToast(res.error, 'error');
      return;
    }

    setPlayerStall(res.playerStall);
    savePlayerStall(res.playerStall);

    setMarketStalls(res.stalls);
    saveMarketStalls(res.stalls);

    showToast(res.message, 'success');
  };

  // Zaman formatlayıcı
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Az önce';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} sa önce`;
    return `${Math.floor(diffHours / 24)} gün önce`;
  };

  return (
    <div className={`space-y-4 pb-20 animate-fadeIn ${isPC ? 'w-full max-w-7xl mx-auto px-4' : ''}`}>
      {/* Toast Bildirimi */}
      {toast && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg border text-xs shadow-2xl flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/60 text-red-200'
              : 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
          <span className="font-cormorant font-semibold text-sm">{toast.text}</span>
        </div>
      )}

      {/* Submenu Seçici */}
      <SubmenuBar
        submenus={submenus}
        activeSubmenu={activeSubmenu}
        onSelect={setActiveSubmenu}
      />

      {/* -------------------- 1. SEKME: PAZAR ALANI (DİĞER OYUNCULARIN TEZGAHLARI) -------------------- */}
      {activeSubmenu === 'browse' && (
        <div className="space-y-4">
          {/* Arama & Kategori Başlığı */}
          <OrnateFrame className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Arama Çubuğu */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pazar adı, satıcı veya eşya ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-elven-gold/30 rounded pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 font-cormorant"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-200 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Kategori Filtresi */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['all', 'Silah', 'Zırh', 'Kalkan', 'Miğfer', 'Yüzük'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] font-cinzel transition-all whitespace-nowrap border ${
                      categoryFilter === cat
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'bg-black/40 text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/20'
                    }`}
                  >
                    {cat === 'all' ? 'Tüm Eşyalar' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-cormorant text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>{filteredStalls.length} Aktif Tezgah Açık</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Pazar Vergi Oranı: %{MARKET_TAX_PERCENT} (Kraliyet Hazinesi)
              </span>
            </div>
          </OrnateFrame>

          {/* Tezgah Kartları Izgarası (Minik Önizleme Resimleriyle) */}
          {filteredStalls.length === 0 ? (
            <OrnateFrame className="p-8 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-amber-400/30 mx-auto" />
              <h4 className="font-cinzel text-sm text-amber-200 font-bold">Açık Pazar Tezgahı Bulunamadı</h4>
              <p className="text-xs text-slate-400 font-cormorant max-w-sm mx-auto">
                Arama kriterlerinizi değiştirebilir veya kendi 20 slotluk tezgahınızı kurarak satışa başlayabilirsiniz.
              </p>
              <ElvenButton
                size="sm"
                icon={Store}
                onClick={() => setActiveSubmenu('my_stall')}
              >
                Kendi Pazarını Kur
              </ElvenButton>
            </OrnateFrame>
          ) : (
            <div className={`gap-3.5 ${isPC ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}`}>
              {filteredStalls.map((stall) => {
                const isMyStall = stall.sellerName.toLowerCase() === (player?.name || '').toLowerCase();
                const itemCount = stall.items?.length || 0;

                return (
                  <OrnateFrame
                    key={stall.id}
                    className={`p-4 flex flex-col justify-between transition-all hover:border-amber-500/50 ${
                      isMyStall ? 'ring-1 ring-amber-400/60 bg-amber-950/10' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Üst Bilgi: Başlık & Satıcı */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                            {stall.kingdom || 'Kadim Elfler'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                            {itemCount} / {MAX_STALL_SLOTS} Eşya
                          </span>
                        </div>

                        <h4 className="font-cinzel font-bold text-sm text-slate-100 tracking-wide mt-1.5 flex items-center justify-between">
                          <span>{stall.stallTitle}</span>
                          {isMyStall && (
                            <span className="text-[9px] font-cinzel text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/50">
                              SENİN PAZARIN
                            </span>
                          )}
                        </h4>

                        <div className="flex items-center justify-between text-xs font-cormorant text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-amber-400 inline" />
                            Satıcı: <PlayerBadge name={stall.sellerName} isMobile={!isPC} />
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatTimeAgo(stall.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* MİNİK RESİMLER: Pazarın İçindeki Eşyaların Görsel Önizlemesi */}
                      <div className="bg-black/60 border border-white/5 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-cinzel text-slate-400">
                          <span>Pazardaki Eşyalar (Önizleme)</span>
                          <span className="text-amber-400 font-mono">{itemCount} Adet</span>
                        </div>

                        {itemCount === 0 ? (
                          <div className="py-3 text-center text-slate-500 font-cormorant text-xs italic">
                            Tezgahta henüz eşya yok
                          </div>
                        ) : (
                          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                            {stall.items.slice(0, 10).map((si) => (
                              <div
                                key={si.id}
                                onClick={() => {
                                  setInspectingStall(stall);
                                  setInspectedItem(si);
                                }}
                                title={`${si.item.name} - ${si.price.toLocaleString()} Altın (İncelemek için tıkla)`}
                                className="group relative aspect-square rounded border border-amber-500/25 bg-black/80 p-1 flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:border-amber-400 hover:shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                              >
                                <img
                                  src={si.item.image}
                                  alt={si.item.name}
                                  className="w-full h-full object-contain drop-shadow"
                                />
                                {/* Minik Fiyat Rozeti */}
                                <div className="absolute -bottom-1 -right-1 bg-amber-950/90 border border-amber-500/40 rounded px-1 text-[8px] font-mono text-amber-300 scale-90">
                                  {si.price >= 1000 ? `${Math.round(si.price / 1000)}k` : si.price}
                                </div>
                              </div>
                            ))}
                            {itemCount > 10 && (
                              <div
                                onClick={() => setInspectingStall(stall)}
                                className="aspect-square rounded border border-white/10 bg-white/5 flex items-center justify-center cursor-pointer text-[10px] font-cinzel font-bold text-amber-300 hover:bg-white/10"
                              >
                                +{itemCount - 10}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alt Buton: Pazara Gir */}
                    <div className="pt-3 mt-3 border-t border-white/5">
                      <ElvenButton
                        size="sm"
                        variant={isMyStall ? 'secondary' : 'primary'}
                        icon={isMyStall ? Store : Eye}
                        fullWidth
                        onClick={() => {
                          if (isMyStall) {
                            setActiveSubmenu('my_stall');
                          } else {
                            setInspectingStall(stall);
                            setInspectedItem(stall.items?.[0] || null);
                          }
                        }}
                      >
                        {isMyStall ? 'Tezgahımı Düzenle' : 'Tezgaha Göz At & İncele'}
                      </ElvenButton>
                    </div>
                  </OrnateFrame>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------- 2. SEKME: PAZAR KUR / TEZGAHIM (20 SLOT + ENVANTER) -------------------- */}
      {activeSubmenu === 'my_stall' && (
        <div className="space-y-4">
          {/* Pazar Başlık Yönetimi & Slot Kapasitesi */}
          <OrnateFrame className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-400" />
                  <h3 className="font-cinzel text-base font-bold text-amber-200">
                    {playerStall.stallTitle || `${player?.name || 'Kahraman'}'ın Pazar Yeri`}
                  </h3>
                  <span className="text-[10px] font-cinzel text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    Yayında & Açık
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-cormorant mt-0.5">
                  Maksimum {MAX_STALL_SLOTS} adet eşyayı tezgahınıza yerleştirebilir, piyasa referans fiyatlarına göre satabilirsiniz.
                </p>
              </div>

              {/* Slot Sayacı */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] font-cinzel text-slate-400">Tezgah Doluluğu</div>
                  <div className="text-sm font-mono font-bold text-amber-300">
                    {playerStall.items.length} / {MAX_STALL_SLOTS} Slot
                  </div>
                </div>
                <div className="w-24 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${(playerStall.items.length / MAX_STALL_SLOTS) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pazar Başlığı ve Motto Düzenleme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-cormorant">
              <div>
                <label className="block text-slate-300 mb-1 font-cinzel text-[11px]">Pazar Başlığı</label>
                <input
                  type="text"
                  maxLength={35}
                  value={playerStall.stallTitle}
                  onChange={(e) => {
                    const updated = { ...playerStall, stallTitle: e.target.value };
                    setPlayerStall(updated);
                    savePlayerStall(updated);
                  }}
                  className="w-full bg-black/60 border border-elven-gold/30 rounded px-3 py-1.5 text-amber-100 font-cormorant focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-cinzel text-[11px]">Pazar Sloganı (Motto)</label>
                <input
                  type="text"
                  maxLength={50}
                  value={playerStall.motto}
                  onChange={(e) => {
                    const updated = { ...playerStall, motto: e.target.value };
                    setPlayerStall(updated);
                    savePlayerStall(updated);
                  }}
                  className="w-full bg-black/60 border border-elven-gold/30 rounded px-3 py-1.5 text-amber-100 font-cormorant focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </OrnateFrame>

          {/* GELEN TEKLİFLER BÖLÜMÜ (Eğer oyuncunun eşyalarına teklif verilmişse) */}
          {pendingOffersCount > 0 && (
            <OrnateFrame className="p-4 space-y-3 border-amber-500/50 bg-amber-950/20 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
                    Gelen Pazarlık Teklifleri ({pendingOffersCount})
                  </h4>
                </div>
                <span className="text-[10px] text-amber-300 font-mono">
                  Teklifi kabul ederseniz eşya hemen satılır ve altın cüzdanınıza geçer.
                </span>
              </div>

              <div className="space-y-2">
                {playerStall.items
                  .filter((it) => it.offers && it.offers.length > 0)
                  .map((stallItem) => (
                    <div key={stallItem.id} className="space-y-2">
                      {stallItem.offers.map((offer, offIdx) => (
                        <div
                          key={offIdx}
                          className="bg-black/60 border border-amber-500/30 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded border border-amber-500/40 bg-black/80 p-1 flex-shrink-0">
                              <img
                                src={stallItem.item.image}
                                alt={stallItem.item.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <h5 className="font-cinzel text-xs font-bold text-slate-100">
                                {stallItem.item.name}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                                <span className="text-slate-400 line-through">
                                  {stallItem.price.toLocaleString()} Altın
                                </span>
                                <span className="text-amber-400 font-bold">
                                  ➔ {offer.offerAmount.toLocaleString()} Altın
                                </span>
                                <span className="text-slate-400">
                                  ({offer.buyerName})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => handleAcceptOffer(stallItem.id, offIdx)}
                              className="px-3 py-1.5 rounded text-xs font-cinzel font-bold text-emerald-200 bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900 transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Kabul Et
                            </button>
                            <button
                              onClick={() => handleDeclineOffer(stallItem.id, offIdx)}
                              className="px-3 py-1.5 rounded text-xs font-cinzel text-red-300 bg-red-950/60 border border-red-500/40 hover:bg-red-900 transition-colors flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5 text-red-400" /> Reddet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </OrnateFrame>
          )}

          {/* ÇİFT PANEL DÜZENİ: SOLDA 20 SLOTLUK TEZGAH, SAĞDA OYUNCUNUN ENVANTERİ */}
          <div className={`gap-4 ${isPC ? 'grid grid-cols-12' : 'space-y-4'}`}>
            {/* SOL TARAF: 20 SLOTLUK PAZAR YERİ IZGARASI */}
            <div className={isPC ? 'col-span-7' : 'w-full'}>
              <OrnateFrame className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-400" />
                    Pazar Tezgahı (Tam 20 Slot)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {playerStall.items.length} / 20 Dolu
                  </span>
                </div>

                {/* 20 Adet Slot (4x5 Izgara) */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                  {Array.from({ length: MAX_STALL_SLOTS }).map((_, slotIdx) => {
                    const stallItem = playerStall.items.find((si) => si.slotIndex === slotIdx);

                    return (
                      <div
                        key={slotIdx}
                        className={`group relative aspect-square rounded-lg border p-1.5 flex flex-col items-center justify-between transition-all ${
                          stallItem
                            ? 'bg-black/80 border-amber-500/40 hover:border-amber-400 shadow-md'
                            : 'bg-black/30 border-white/10 border-dashed hover:border-white/30'
                        }`}
                      >
                        {/* Slot Numarası */}
                        <div className="absolute top-1 left-1.5 text-[9px] font-mono text-slate-500 pointer-events-none">
                          #{slotIdx + 1}
                        </div>

                        {stallItem ? (
                          <>
                            {/* Eşya Resmi */}
                            <div className="w-full flex-1 flex items-center justify-center p-1">
                              <img
                                src={stallItem.item.image}
                                alt={stallItem.item.name}
                                className="w-full h-full object-contain drop-shadow"
                              />
                            </div>

                            {/* Fiyat Rozeti */}
                            <div className="w-full text-center bg-black/90 rounded border border-amber-500/30 py-0.5">
                              <span className="text-[9px] font-mono font-bold text-amber-300">
                                {stallItem.price >= 1000 ? `${Math.round(stallItem.price / 1000)}k` : stallItem.price} G
                              </span>
                            </div>

                            {/* Teklif Bildirimi Rozeti */}
                            {stallItem.offers && stallItem.offers.length > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-mono flex items-center justify-center shadow">
                                {stallItem.offers.length}
                              </div>
                            )}

                            {/* Hover Eylemi: Geri Çıkar */}
                            <button
                              onClick={() => handleUnlistItem(stallItem.id)}
                              title="Tezgahtan çıkar ve envantere geri al"
                              className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-red-300 text-[10px] font-cinzel"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                              <span>Geri Al</span>
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-[10px] font-cinzel">
                            <span>Boş</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </OrnateFrame>
            </div>

            {/* SAĞ TARAF: OYUNCUNUN ENVANTERİ (EŞYA SEÇİP PAZARA EKLEME) */}
            <div className={isPC ? 'col-span-5' : 'w-full'}>
              <OrnateFrame className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    Envanterden Eşya Seç
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(player?.inventory || []).length} Eşya Mevcut
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-cormorant">
                  Tezgaha eklemek istediğiniz eşyaya tıklayın. Fiyatlandırma penceresinde son satış fiyatını görebilirsiniz.
                </p>

                {(player?.inventory || []).length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-cormorant text-xs">
                    Envanterinizde satılabilecek eşya bulunmuyor. Zindan veya maden yaparak eşya toplayabilirsiniz.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[380px] overflow-y-auto pr-1">
                    {(player?.inventory || []).map((invItem) => (
                      <div
                        key={invItem.instanceId || invItem.id}
                        onClick={() => handleOpenListingModal(invItem)}
                        className="group aspect-square rounded-lg border border-amber-500/20 bg-black/60 p-2 flex flex-col items-center justify-between cursor-pointer hover:border-amber-400 hover:bg-amber-950/20 transition-all hover:scale-105"
                      >
                        <div className="w-full flex-1 flex items-center justify-center">
                          <img
                            src={invItem.image}
                            alt={invItem.name}
                            className="w-full h-full object-contain drop-shadow"
                          />
                        </div>
                        <span className="text-[9px] font-cinzel text-slate-200 truncate w-full text-center">
                          {invItem.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </OrnateFrame>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. SEKME: PİYASA GEÇMİŞİ (SON SATIŞLAR) -------------------- */}
      {activeSubmenu === 'history' && (
        <div className="space-y-4">
          <OrnateFrame className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-amber-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Satış geçmişinde eşya, alıcı veya satıcı ara..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-black/60 border border-elven-gold/30 rounded pl-9 pr-3 py-1.5 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 font-cormorant"
                />
              </div>

              <span className="text-xs text-amber-300 font-cinzel flex items-center gap-1.5 self-center">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Piyasa Fiyat Endeksi</span>
              </span>
            </div>
          </OrnateFrame>

          {filteredHistory.length === 0 ? (
            <OrnateFrame className="p-8 text-center text-slate-400 font-cormorant text-xs">
              Eşleşen satış kaydı bulunamadı.
            </OrnateFrame>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((hist) => (
                <OrnateFrame
                  key={hist.id}
                  className="p-3 flex items-center justify-between gap-3 transition-all hover:border-amber-500/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded border border-amber-500/30 bg-black/80 p-1 flex-shrink-0">
                      <img
                        src={hist.image}
                        alt={hist.itemName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h5 className="font-cinzel text-xs font-bold text-slate-100">
                        {hist.itemName}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] font-cormorant text-slate-400 mt-0.5">
                        <span className="text-amber-400">Satıcı: {hist.seller}</span>
                        <span>➔</span>
                        <span className="text-emerald-400">Alıcı: {hist.buyer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-amber-300">
                      {hist.price.toLocaleString()} Altın
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatTimeAgo(hist.soldAt)}
                    </div>
                  </div>
                </OrnateFrame>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------- FİYATLANDIRMA MODALI (ENVANTERDEN TEZGAHA EKLEME & REFERANS FİYAT) -------------------- */}
      {listingModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setListingModalItem(null);
          }}
        >
          <OrnateFrame className="w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <h4 className="font-cinzel text-sm font-bold text-amber-200">
                  Pazara Eşya Yerleştir
                </h4>
              </div>
              <button
                onClick={() => setListingModalItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seçilen Eşya Özeti */}
            <div className="flex items-center gap-3 bg-black/50 p-3 rounded-lg border border-white/10">
              <div className="w-14 h-14 rounded border border-amber-500/40 bg-black/80 p-1 flex-shrink-0">
                <img
                  src={listingModalItem.image}
                  alt={listingModalItem.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h5 className="font-cinzel text-xs font-bold text-slate-100">
                  {listingModalItem.name}
                </h5>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/30 inline-block mt-1">
                  {listingModalItem.slotName || listingModalItem.slot || 'Ekipman'}
                </span>
                <p className="text-[11px] text-slate-400 font-cormorant line-clamp-1 mt-0.5">
                  {listingModalItem.desc || 'Kadim elf yapımı değerli eşya.'}
                </p>
              </div>
            </div>

            {/* EN SON SATIŞ FİYATI REFERANSI (BENCHMARK) */}
            {(() => {
              const benchmark = getLatestBenchmarkPrice(listingModalItem.name, marketHistory);
              if (benchmark) {
                return (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-cinzel font-bold text-amber-200 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        Son Satış Fiyatı Referansı
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTimeAgo(benchmark.soldAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-mono font-bold text-amber-300">
                          {benchmark.price.toLocaleString()} Altın
                        </div>
                        <div className="text-[10px] text-slate-400 font-cormorant">
                          Satıcı: {benchmark.seller} ➔ Alıcı: {benchmark.buyer}
                        </div>
                      </div>

                      {/* Hızlı Buton: Bu Fiyatı Uygula */}
                      <button
                        type="button"
                        onClick={() => setListingPriceInput(String(benchmark.price))}
                        className="px-2.5 py-1 rounded text-xs font-cinzel text-amber-300 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 transition-colors"
                      >
                        Bu Fiyatı Uygula
                      </button>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs text-slate-400 font-cormorant flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Bu eşya için henüz kayıtlı son satış geçmişi bulunmuyor. Dilediğiniz fiyatı belirleyebilirsiniz.</span>
                  </div>
                );
              }
            })()}

            {/* Satış Fiyatı Giriş Formu */}
            <form onSubmit={handleConfirmListing} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-cinzel text-xs mb-1.5 flex items-center justify-between">
                  <span>Satış Fiyatı (Altın)</span>
                  <span className="text-[10px] text-slate-500 font-mono">%3 Pazar Vergisi Kesilir</span>
                </label>
                <div className="relative">
                  <Coins className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="Örn: 15000"
                    value={listingPriceInput}
                    onChange={(e) => setListingPriceInput(e.target.value)}
                    className="w-full bg-black/80 border border-elven-gold/40 rounded pl-9 pr-3 py-2 text-sm text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setListingModalItem(null)}
                  className="px-4 py-2 rounded text-xs font-cinzel text-slate-300 bg-white/5 hover:bg-white/10"
                >
                  İptal
                </button>
                <ElvenButton
                  size="md"
                  type="submit"
                  icon={Store}
                >
                  Tezgaha Ekle (Slot {playerStall.items.length + 1})
                </ElvenButton>
              </div>
            </form>
          </OrnateFrame>
        </div>
      )}

      {/* -------------------- PAZAR TEFTİŞ & SATIN AL / TEKLİF VER MODALI -------------------- */}
      {inspectingStall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInspectingStall(null);
              setInspectedItem(null);
            }
          }}
        >
          <OrnateFrame className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-400" />
                  <h3 className="font-cinzel text-base font-bold text-amber-200">
                    {inspectingStall.stallTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-cormorant text-slate-400 mt-0.5">
                  <span>Satıcı: <PlayerBadge name={inspectingStall.sellerName} isMobile={!isPC} /></span>
                  <span>•</span>
                  <span>{inspectingStall.kingdom}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setInspectingStall(null);
                  setInspectedItem(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* İki Bölüm: Eşyalar Izgarası + Seçili Eşya & Satın Al / Teklif Ver Paneli */}
            <div className={`gap-4 ${isPC ? 'grid grid-cols-12' : 'space-y-4'}`}>
              {/* Sol: Tezgahtaki Tüm Eşyalar */}
              <div className={isPC ? 'col-span-7' : 'w-full'}>
                <h5 className="font-cinzel text-xs font-bold text-slate-300 uppercase mb-2">
                  Tezgahtaki Eşyalar ({inspectingStall.items?.length || 0})
                </h5>

                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {(inspectingStall.items || []).map((si) => {
                    const isSelected = inspectedItem?.id === si.id;
                    return (
                      <div
                        key={si.id}
                        onClick={() => setInspectedItem(si)}
                        className={`aspect-square rounded-lg border p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                            : 'bg-black/60 border-white/10 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="w-full flex-1 flex items-center justify-center">
                          <img
                            src={si.item.image}
                            alt={si.item.name}
                            className="w-full h-full object-contain drop-shadow"
                          />
                        </div>
                        <span className="text-[9px] font-mono font-bold text-amber-300 bg-black/90 px-1 rounded">
                          {si.price >= 1000 ? `${Math.round(si.price / 1000)}k` : si.price} G
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sağ: Seçili Eşyanın Detayları + Satın Al & Teklif Ver */}
              <div className={isPC ? 'col-span-5' : 'w-full'}>
                {inspectedItem ? (
                  <div className="bg-black/60 border border-amber-500/40 rounded-lg p-3.5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded border border-amber-500/50 bg-black/80 p-1 flex-shrink-0">
                        <img
                          src={inspectedItem.item.image}
                          alt={inspectedItem.item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-cinzel text-xs font-bold text-slate-100">
                          {inspectedItem.item.name}
                        </h4>
                        <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          {inspectedItem.item.slotName || 'Ekipman'}
                        </div>
                        <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                          {inspectedItem.price.toLocaleString()} Altın
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-cormorant border-t border-white/10 pt-2">
                      {inspectedItem.item.desc || 'Kadim elflerin zanaatkarlık eseri.'}
                    </p>

                    {/* SATIN AL BUTONU */}
                    <div className="pt-2 border-t border-white/10">
                      <ElvenButton
                        size="md"
                        icon={Coins}
                        fullWidth
                        onClick={() => handleBuyItem(inspectingStall, inspectedItem)}
                      >
                        Hemen Satın Al ({inspectedItem.price.toLocaleString()} G)
                      </ElvenButton>
                    </div>

                    {/* TEKLİF VER BÖLÜMÜ (YANINDA PARA GİRME KISMI İLE) */}
                    <div className="bg-amber-950/20 border border-amber-500/30 rounded p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-200">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-amber-400" /> Teklif Ver (Pazarlık)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Mevcut: {(player?.gold || 0).toLocaleString()} G
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Teklifiniz (Altın)..."
                          value={offerPriceInput}
                          onChange={(e) => setOfferPriceInput(e.target.value)}
                          className="flex-1 bg-black/80 border border-elven-gold/40 rounded px-2.5 py-1.5 text-xs text-amber-100 font-mono focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleMakeOffer(inspectingStall, inspectedItem)}
                          className="px-3 py-1.5 rounded text-xs font-cinzel font-bold text-amber-200 bg-amber-500/30 border border-amber-500/60 hover:bg-amber-500/40 transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <Send className="w-3 h-3 text-amber-400" /> Teklif Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 font-cormorant text-xs">
                    Detayları görmek, satın almak veya teklif vermek için sol taraftan bir eşyaya tıklayın.
                  </div>
                )}
              </div>
            </div>
          </OrnateFrame>
        </div>
      )}
    </div>
  );
}
