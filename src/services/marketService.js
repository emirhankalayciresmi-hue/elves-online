import { MAX_STALL_SLOTS } from '@/core/config/marketData';
import { supabase } from '@/core/supabase/supabaseClient';

/**
 * Envanterden 20 slotluk tezgaha eşya yerleştirme
 */
export function listItemToStallService(player, playerStall, item, price, targetSlotIndex = null) {
  if (!player || !item) {
    return { success: false, error: 'Oyuncu veya eşya bilgisi eksik.' };
  }

  const numericPrice = Math.floor(Number(price));
  if (!numericPrice || numericPrice <= 0) {
    return { success: false, error: 'Lütfen geçerli bir altın satış fiyatı belirleyin!' };
  }

  const currentStall = playerStall || { items: [] };
  const stallItems = Array.isArray(currentStall.items) ? currentStall.items : [];

  if (stallItems.length >= MAX_STALL_SLOTS) {
    return { success: false, error: `Pazar tezgahınız tamamen dolu! (Maksimum ${MAX_STALL_SLOTS} eşya koyabilirsiniz).` };
  }

  // Boş slot belirleme
  const occupiedSlots = new Set(stallItems.map((si) => si.slotIndex));
  let chosenSlot = targetSlotIndex;

  if (chosenSlot === null || chosenSlot === undefined || occupiedSlots.has(chosenSlot)) {
    // İlk boş slotu bul (0..19)
    chosenSlot = -1;
    for (let i = 0; i < MAX_STALL_SLOTS; i++) {
      if (!occupiedSlots.has(i)) {
        chosenSlot = i;
        break;
      }
    }
  }

  if (chosenSlot === -1 || chosenSlot >= MAX_STALL_SLOTS) {
    return { success: false, error: 'Uygun boş pazar slotu bulunamadı.' };
  }

  // Eşyayı oyuncu envanterinden çıkar
  const inventory = Array.isArray(player.inventory) ? player.inventory : [];
  const itemIndex = inventory.findIndex(
    (inv) => (inv.instanceId && inv.instanceId === item.instanceId) || inv.id === item.id
  );

  if (itemIndex === -1) {
    return { success: false, error: 'Bu eşya envanterinizde bulunamadı.' };
  }

  const updatedInventory = [...inventory];
  const [removedItem] = updatedInventory.splice(itemIndex, 1);

  // Tezgaha eklenecek nesne
  const newStallItem = {
    id: 'stall_item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    slotIndex: chosenSlot,
    price: numericPrice,
    listedAt: new Date().toISOString(),
    item: removedItem,
    offers: [],
  };

  const updatedStall = {
    ...currentStall,
    items: [...stallItems, newStallItem],
  };

  const updatedPlayer = {
    ...player,
    inventory: updatedInventory,
  };

  return {
    success: true,
    player: updatedPlayer,
    playerStall: updatedStall,
    stallItem: newStallItem,
    message: `[${removedItem.name}] ${numericPrice.toLocaleString()} Altın fiyatıyla ${chosenSlot + 1}. pazar slotuna yerleştirildi!`,
  };
}

/**
 * Tezgahtan eşyayı geri alıp envantere koyma
 */
export function unlistItemFromStallService(player, playerStall, stallItemId) {
  if (!player || !playerStall) {
    return { success: false, error: 'Geçersiz pazar veya oyuncu verisi.' };
  }

  const stallItems = Array.isArray(playerStall.items) ? playerStall.items : [];
  const foundIndex = stallItems.findIndex((si) => si.id === stallItemId);

  if (foundIndex === -1) {
    return { success: false, error: 'Eşya pazar tezgahınızda bulunamadı.' };
  }

  const targetStallItem = stallItems[foundIndex];
  const updatedStallItems = stallItems.filter((si) => si.id !== stallItemId);

  const updatedInventory = [...(player.inventory || []), targetStallItem.item];

  const updatedStall = {
    ...playerStall,
    items: updatedStallItems,
  };

  const updatedPlayer = {
    ...player,
    inventory: updatedInventory,
  };

  return {
    success: true,
    player: updatedPlayer,
    playerStall: updatedStall,
    message: `[${targetStallItem.item.name}] tezgahtan geri alındı ve envanterinize eklendi.`,
  };
}

/**
 * Pazardan bir eşyayı doğrudan satın alma
 */
export function buyMarketItemService(buyer, stallId, stallItemId, allStalls, historyList) {
  if (!buyer) return { success: false, error: 'Alıcı oyuncu bulunamadı.' };

  const stallIndex = allStalls.findIndex((s) => s.id === stallId);
  if (stallIndex === -1) {
    return { success: false, error: 'Pazar tezgahı bulunamadı veya kapatılmış olabilir.' };
  }

  const stall = allStalls[stallIndex];
  if (stall.sellerName.toLowerCase() === (buyer.name || '').toLowerCase()) {
    return { success: false, error: 'Kendi pazar tezgahınızdaki eşyayı satın alamazsınız!' };
  }

  const itemIndex = (stall.items || []).findIndex((it) => it.id === stallItemId);
  if (itemIndex === -1) {
    return { success: false, error: 'Bu eşya tezgahta artık mevcut değil (başkası satın almış olabilir).' };
  }

  const targetItem = stall.items[itemIndex];
  const price = targetItem.price;

  if ((buyer.gold || 0) < price) {
    return {
      success: false,
      error: `Yetersiz altın! Bu eşyayı satın almak için ${price.toLocaleString()} Altın gereklidir (Mevcut: ${(buyer.gold || 0).toLocaleString()} Altın).`,
    };
  }

  // Alıcıdan altın düş, envanterine eşyayı ekle
  const updatedBuyer = {
    ...buyer,
    gold: (buyer.gold || 0) - price,
    inventory: [...(buyer.inventory || []), targetItem.item],
  };

  // Tezgahtan eşyayı kaldır
  const updatedStallItems = stall.items.filter((it) => it.id !== stallItemId);
  const updatedStalls = [...allStalls];
  updatedStalls[stallIndex] = {
    ...stall,
    items: updatedStallItems,
  };

  // Piyasa geçmişine yeni satış kaydı ekle
  const newHistoryRecord = {
    id: 'hist_' + Date.now(),
    itemName: targetItem.item.name,
    price: price,
    seller: stall.sellerName,
    buyer: buyer.name || 'Gizemli Alıcı',
    soldAt: new Date().toISOString(),
    image: targetItem.item.image || '/assets/items/warrior_weapon.svg',
    category: targetItem.item.slotName || targetItem.item.slot || 'Eşya',
  };

  const updatedHistory = [newHistoryRecord, ...(historyList || [])];

  return {
    success: true,
    buyer: updatedBuyer,
    stalls: updatedStalls,
    history: updatedHistory,
    transaction: newHistoryRecord,
    message: `[${targetItem.item.name}] başarıyla ${price.toLocaleString()} Altın karşılığında satın alındı!`,
  };
}

/**
 * Bir eşyaya pazarlık / fiyat teklifi verme
 */
export function makeOfferService(buyer, stallId, stallItemId, offerAmount, allStalls) {
  if (!buyer) return { success: false, error: 'Oyuncu bulunamadı.' };

  const stallIndex = allStalls.findIndex((s) => s.id === stallId);
  if (stallIndex === -1) {
    return { success: false, error: 'Pazar tezgahı bulunamadı.' };
  }

  const stall = allStalls[stallIndex];
  if (stall.sellerName.toLowerCase() === (buyer.name || '').toLowerCase()) {
    return { success: false, error: 'Kendi eşyanıza teklif veremezsiniz!' };
  }

  const itemIndex = (stall.items || []).findIndex((it) => it.id === stallItemId);
  if (itemIndex === -1) {
    return { success: false, error: 'Eşya tezgahta bulunamadı.' };
  }

  const targetItem = stall.items[itemIndex];
  const numOffer = Math.floor(Number(offerAmount));

  if (!numOffer || numOffer <= 0) {
    return { success: false, error: 'Lütfen geçerli bir teklif tutarı girin!' };
  }

  if (numOffer >= targetItem.price) {
    return {
      success: false,
      error: `Teklifiniz zaten satış fiyatına (${targetItem.price.toLocaleString()} Altın) eşit veya daha yüksek. Doğrudan 'Satın Al' butonunu kullanabilirsiniz.`,
    };
  }

  if ((buyer.gold || 0) < numOffer) {
    return {
      success: false,
      error: `Cüzdanınızda teklif ettiğiniz kadar (${numOffer.toLocaleString()} Altın) altın bulunmuyor!`,
    };
  }

  const newOffer = {
    buyerName: buyer.name || 'Gizemli Elf',
    offerAmount: numOffer,
    createdAt: new Date().toISOString(),
  };

  // Mevcut teklifleri güncelle (aynı alıcı teklif vermişse güncelle)
  const existingOffers = Array.isArray(targetItem.offers) ? targetItem.offers : [];
  const filteredOffers = existingOffers.filter(
    (o) => o.buyerName.toLowerCase() !== (buyer.name || '').toLowerCase()
  );

  const updatedItem = {
    ...targetItem,
    offers: [newOffer, ...filteredOffers],
  };

  const updatedStallItems = [...stall.items];
  updatedStallItems[itemIndex] = updatedItem;

  const updatedStalls = [...allStalls];
  updatedStalls[stallIndex] = {
    ...stall,
    items: updatedStallItems,
  };

  return {
    success: true,
    stalls: updatedStalls,
    offer: newOffer,
    message: `[${targetItem.item.name}] için satıcı ${stall.sellerName}'e ${numOffer.toLocaleString()} Altın teklifiniz iletildi! 🤝`,
  };
}

/**
 * Satıcının gelen teklifi kabul etmesi (Eşya satılır, altın kazanılır)
 */
export function acceptOfferService(seller, playerStall, stallItemId, offerIndex, allStalls, historyList) {
  if (!seller || !playerStall) {
    return { success: false, error: 'Satıcı veya tezgah bilgisi eksik.' };
  }

  const itemIndex = (playerStall.items || []).findIndex((it) => it.id === stallItemId);
  if (itemIndex === -1) {
    return { success: false, error: 'Eşya bulunamadı.' };
  }

  const targetItem = playerStall.items[itemIndex];
  const offers = targetItem.offers || [];
  const offer = offers[offerIndex];

  if (!offer) {
    return { success: false, error: 'Teklif bulunamadı veya süresi dolmuş.' };
  }

  const acceptedAmount = offer.offerAmount;

  // Satıcıya altın ekle
  const updatedSeller = {
    ...seller,
    gold: (seller.gold || 0) + acceptedAmount,
  };

  // Tezgahtan eşyayı kaldır
  const updatedStallItems = playerStall.items.filter((it) => it.id !== stallItemId);
  const updatedStall = {
    ...playerStall,
    items: updatedStallItems,
  };

  // Genel tezgah listesini de güncelle
  const updatedAllStalls = allStalls.map((s) => (s.id === playerStall.id ? updatedStall : s));

  // Piyasa geçmişine ekle
  const transaction = {
    id: 'hist_' + Date.now(),
    itemName: targetItem.item.name,
    price: acceptedAmount,
    seller: seller.name || 'Satıcı',
    buyer: offer.buyerName,
    soldAt: new Date().toISOString(),
    image: targetItem.item.image || '/assets/items/warrior_weapon.svg',
    category: targetItem.item.slotName || 'Eşya',
    isOfferAccepted: true,
  };

  const updatedHistory = [transaction, ...(historyList || [])];

  return {
    success: true,
    seller: updatedSeller,
    playerStall: updatedStall,
    stalls: updatedAllStalls,
    history: updatedHistory,
    message: `[${targetItem.item.name}] için [${offer.buyerName}] tarafından yapılan ${acceptedAmount.toLocaleString()} Altın teklifini kabul ettiniz! Altın cüzdanınıza aktarıldı.`,
  };
}

/**
 * Satıcının teklifi reddetmesi
 */
export function declineOfferService(playerStall, stallItemId, offerIndex, allStalls) {
  if (!playerStall) return { success: false, error: 'Tezgah bulunamadı.' };

  const itemIndex = (playerStall.items || []).findIndex((it) => it.id === stallItemId);
  if (itemIndex === -1) {
    return { success: false, error: 'Eşya bulunamadı.' };
  }

  const targetItem = playerStall.items[itemIndex];
  const updatedOffers = [...(targetItem.offers || [])];
  const removedOffer = updatedOffers.splice(offerIndex, 1)[0];

  const updatedItem = {
    ...targetItem,
    offers: updatedOffers,
  };

  const updatedStallItems = [...playerStall.items];
  updatedStallItems[itemIndex] = updatedItem;

  const updatedStall = {
    ...playerStall,
    items: updatedStallItems,
  };

  const updatedAllStalls = (allStalls || []).map((s) => (s.id === playerStall.id ? updatedStall : s));

  return {
    success: true,
    playerStall: updatedStall,
    stalls: updatedAllStalls,
    message: `[${removedOffer?.buyerName}] tarafından yapılan teklif reddedildi.`,
  };
}

/**
 * Supabase'den aktif oyuncu pazarlarını çeker
 */
export async function fetchCloudMarketStalls() {
  try {
    const { data, error } = await supabase
      .from('market_stalls')
      .select('*')
      .eq('is_open', true)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('Cloud market fetch warning:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      sellerName: row.seller_name,
      sellerKingdom: row.seller_kingdom || '',
      stallTitle: row.stall_title,
      motto: row.motto || '',
      isOpen: row.is_open,
      createdAt: row.created_at,
      items: Array.isArray(row.items) ? row.items : [],
    }));
  } catch (err) {
    console.error('Cloud market fetch exception:', err);
    return [];
  }
}

/**
 * Oyuncu tezgahını Supabase bulutuna senkronize eder
 */
export async function syncPlayerStallToCloud(playerStall, sellerKingdom = '') {
  if (!playerStall || !playerStall.sellerName) return;
  try {
    const payload = {
      seller_name: playerStall.sellerName,
      seller_kingdom: sellerKingdom,
      stall_title: playerStall.stallTitle || `${playerStall.sellerName} Pazarı`,
      motto: playerStall.motto || '',
      items: playerStall.items || [],
      is_open: playerStall.isOpen !== false,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('market_stalls')
      .upsert(payload, { onConflict: 'seller_name' });

    if (error) {
      console.warn('Stall sync to cloud warning:', error.message);
    }
  } catch (err) {
    console.error('Stall sync exception:', err);
  }
}

/**
 * Pazar tezgahları realtime dinleyicisi
 */
export function subscribeToRealtimeMarket(onUpdate) {
  try {
    const channel = supabase
      .channel('market_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_stalls' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Market realtime subscription error:', err);
    return () => {};
  }
}

export {
  loadMarketStalls,
  saveMarketStalls,
  loadMarketHistory,
  saveMarketHistory,
  loadPlayerStall,
  savePlayerStall,
} from '@/core/config/marketData';

