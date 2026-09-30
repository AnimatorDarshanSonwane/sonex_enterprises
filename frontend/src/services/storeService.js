import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { DRESSES_DATA } from '../constants/dressesData';
import apiClient from './apiClient';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const LOCAL_PRODUCTS_KEY = 'sonex_products_canvas_v4';

/**
 * Helper to get default initial products
 */
export function getDefaultProducts() {
  const stockMap = {
    'dress-1': 8,
    'dress-2': 6,
    'dress-3': 12,
    'dress-4': 5,
    'dress-5': 9,
    'dress-6': 7,
    'dress-7': 10,
    'dress-8': 8,
    'dress-9': 6,
    'dress-10': 11
  };
  return DRESSES_DATA.map(item => ({
    ...item,
    category: 'Navratri Special',
    material: item.material || 'Pure Cotton & Gamthi Threadwork',
    hidden: item.hidden || false,
    stock: item.stock !== undefined && item.stock !== null && !isNaN(item.stock) 
      ? Math.max(0, Number(item.stock)) 
      : (stockMap[item.id] ?? 10),
    updatedAt: new Date().toISOString()
  }));
}

/**
 * Fetch all products from Firestore with seamless local cache fallback
 */
export async function fetchAllProducts() {
  const defaultItems = getDefaultProducts();

  // 1. Primary: Decoupled REST API / Cloud Functions
  try {
    const res = await apiClient.getProducts();
    if (res && res.success && Array.isArray(res.data) && res.data.length >= 10) {
      const enriched = defaultItems.map(def => {
        const p = res.data.find(d => d.id === def.id);
        if (!p) return def;
        return {
          ...def,
          ...p,
          framesFolder: def.framesFolder || p.framesFolder || null,
          videoSrc: def.videoSrc,
          sizeVideos: def.sizeVideos,
          category: 'Navratri Special',
          material: (p.material || def.material).trim(),
          hidden: p.hidden || false
        };
      });
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(enriched));
      return enriched;
    }
  } catch (apiErr) {
    console.info('[StoreService] Client API offline or fallback, using direct Firestore:', apiErr.message);
  }

  try {
    // 2. Fallback: Try fetching directly from Firestore
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);

    if (!snapshot.empty) {
      const fetchedMap = {};
      snapshot.forEach(docSnap => {
        fetchedMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });

      const merged = defaultItems.map(def => {
        const remote = fetchedMap[def.id];
        if (!remote) return def;
        return {
          ...def,
          ...remote,
          framesFolder: def.framesFolder || remote.framesFolder || null,
          videoSrc: def.videoSrc,
          sizeVideos: def.sizeVideos,
          category: 'Navratri Special',
          material: (remote.material || def.material).trim(),
          hidden: remote.hidden || false
        };
      });

      // Update local cache
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(merged));
      return merged;
    }

    // 3. If Firestore is empty, auto-seed with default catalog
    try {
      for (const item of defaultItems) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, item.id), item);
      }
    } catch (seedErr) {
      console.warn("Could not write initial seed to Firestore (Check rules):", seedErr);
    }

    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(defaultItems));
    return defaultItems;
  } catch (error) {
    console.warn("Firestore fetchProducts error, falling back to local storage cache:", error);
    try {
      const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return defaultItems;
  }
}

/**
 * Real-time listener for Product catalog (stock changes, price updates, visibility)
 * Enables zero-refresh real-time updates when Admin adjusts stock or details.
 */
export function subscribeToProducts(callback) {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(productsRef, (snapshot) => {
      const defaultItems = getDefaultProducts();
      if (!snapshot.empty) {
        const fetchedMap = {};
        snapshot.forEach(docSnap => {
          fetchedMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
        });

        const merged = defaultItems.map(def => {
          const remote = fetchedMap[def.id];
          if (!remote) return def;
          return {
            ...def,
            ...remote,
            framesFolder: def.framesFolder || remote.framesFolder || null,
            videoSrc: def.videoSrc,
            sizeVideos: def.sizeVideos,
            category: 'Navratri Special',
            material: (remote.material || def.material).trim(),
            hidden: remote.hidden || false
          };
        });

        localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(merged));
        callback(merged);
      } else {
        callback(defaultItems);
      }
    }, (err) => {
      console.warn("subscribeToProducts listener error:", err);
    });
  } catch (e) {
    console.warn("subscribeToProducts error:", e);
    return () => {};
  }
}

/**
 * Add or update a product in Firestore and local cache
 */
export async function saveProductToStore(product) {
  const productId = product.id || `dress-${Date.now()}`;
  const parsedStock = Number(product.stock);
  const completeProduct = {
    ...product,
    id: productId,
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    material: (product.material || 'Pure Mulberry Silk').trim(),
    hidden: Boolean(product.hidden),
    stock: Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 10,
    updatedAt: new Date().toISOString()
  };

  // Update Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await setDoc(docRef, completeProduct, { merge: true });
  } catch (err) {
    console.warn("Firestore saveProduct error (updating locally):", err);
  }

  // Update Local Cache
  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    let list = cached ? JSON.parse(cached) : getDefaultProducts();
    const idx = list.findIndex(p => p.id === productId);
    if (idx >= 0) {
      list[idx] = completeProduct;
    } else {
      list.unshift(completeProduct);
    }
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn(e);
  }

  return completeProduct;
}

/**
 * Quick update for stock quantity of a product in Firestore and local cache
 */
export async function updateProductStockInStore(productId, newStock) {
  const stockNum = Math.max(0, parseInt(newStock, 10) || 0);

  // Update Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, { stock: stockNum, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Firestore updateProductStock error (updating locally):", err);
  }

  // Update Local Cache
  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      const updated = list.map(p => p.id === productId ? { ...p, stock: stockNum } : p);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

/**
 * Toggle hide/show status of a product
 */
export async function toggleProductVisibility(productId, isHidden) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, { hidden: isHidden, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Firestore toggle visibility error (updating locally):", err);
  }

  // Update local cache
  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      const updated = list.map(p => p.id === productId ? { ...p, hidden: isHidden } : p);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

/**
 * Delete a product from Firestore and local cache
 */
export async function deleteProductFromStore(productId) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete error (removing locally):", err);
  }

  try {
    const cached = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (cached) {
      const list = JSON.parse(cached);
      const updated = list.filter(p => p.id !== productId);
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
      return updated;
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

/**
 * Fetch orders strictly for the current logged-in user.
 * ZERO DATA LEAKAGE: A customer can ONLY view orders where order.userId === currentUserId.
 */
export async function fetchUserOrders(userId) {
  if (!userId) return [];

  const localKey = `sonex_orders_${userId}`;

  // 1. Primary: Decoupled REST API / Cloud Functions
  try {
    const res = await apiClient.getUserOrders(userId);
    if (res && res.success && Array.isArray(res.data)) {
      localStorage.setItem(localKey, JSON.stringify(res.data));
      return res.data;
    }
  } catch (apiErr) {
    console.info('[StoreService] Client API getUserOrders offline or fallback, using Firestore direct:', apiErr.message);
  }

  try {
    // 2. Fallback: Direct Firestore
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      localStorage.setItem(localKey, JSON.stringify(items));
      return items;
    }
  } catch (err) {
    console.warn("Firestore fetchUserOrders error, reading local cache:", err);
  }

  try {
    const local = localStorage.getItem(localKey);
    if (local) return JSON.parse(local);
  } catch (e) {
    console.warn(e);
  }

  return [];
}

/**
 * Fetch user's private data (profile, wishlist, cart) from Firestore with user-scoped local fallback
 */
export async function fetchUserData(userId) {
  if (!userId) return { profile: null, wishlist: [], cart: [] };

  const profileKey = `sonex_profile_${userId}`;
  const wishlistKey = `sonex_favorites_${userId}`;
  const cartKey = `sonex_cart_${userId}`;

  let profile = null;
  let wishlist = [];
  let cart = [];

  // 1. Try local cache first for instant UI response
  try {
    const p = localStorage.getItem(profileKey);
    if (p) profile = JSON.parse(p);
    const w = localStorage.getItem(wishlistKey);
    if (w) wishlist = JSON.parse(w);
    const c = localStorage.getItem(cartKey);
    if (c) cart = JSON.parse(c);
  } catch (e) {
    console.warn(e);
  }

  // 2. Primary: Decoupled REST API for user profile and wishlist
  try {
    const profileRes = await apiClient.getUserProfile(userId);
    if (profileRes && profileRes.success && profileRes.data) {
      profile = { ...profile, ...profileRes.data };
      localStorage.setItem(profileKey, JSON.stringify(profile));
    }
  } catch (apiErr) {
    console.info('[StoreService] Client API getUserProfile offline or fallback:', apiErr.message);
  }

  try {
    const wishlistRes = await apiClient.getUserWishlist(userId);
    if (wishlistRes && wishlistRes.success && Array.isArray(wishlistRes.data)) {
      wishlist = wishlistRes.data;
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    }
  } catch (apiErr) {
    console.info('[StoreService] Client API getUserWishlist offline or fallback:', apiErr.message);
  }

  // 3. Fallback: Sync with private Firestore document /users/{userId}
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.profile) {
        profile = { ...profile, ...data.profile };
        localStorage.setItem(profileKey, JSON.stringify(profile));
      }
      if (Array.isArray(data.wishlist)) {
        wishlist = data.wishlist;
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
      }
      if (Array.isArray(data.cart)) {
        cart = data.cart;
        localStorage.setItem(cartKey, JSON.stringify(cart));
      }
    }
  } catch (err) {
    console.warn("Firestore fetchUserData error:", err);
  }

  return { profile, wishlist, cart };
}

/**
 * Save user profile data strictly to /users/{userId}
 */
export async function saveUserProfile(userId, profile) {
  if (!userId) return;
  const profileKey = `sonex_profile_${userId}`;
  try {
    localStorage.setItem(profileKey, JSON.stringify(profile));

    // Decoupled REST API call
    try {
      await apiClient.saveUserProfile(userId, profile);
    } catch (apiErr) {
      console.info('[StoreService] Client API saveUserProfile offline or fallback:', apiErr.message);
    }

    await setDoc(doc(db, 'users', userId), { 
      profile, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (err) {
    console.warn("saveUserProfile error:", err);
  }
}

/**
 * Save user wishlist strictly to /users/{userId}
 */
export async function saveUserWishlist(userId, wishlist) {
  if (!userId) return;
  const wishlistKey = `sonex_favorites_${userId}`;
  try {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

    // Decoupled REST API call
    try {
      await apiClient.saveUserWishlist(userId, wishlist);
    } catch (apiErr) {
      console.info('[StoreService] Client API saveUserWishlist offline or fallback:', apiErr.message);
    }

    await setDoc(doc(db, 'users', userId), { 
      wishlist, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (err) {
    console.warn("saveUserWishlist error:", err);
  }
}

/**
 * Save user cart strictly to /users/{userId}
 */
export async function saveUserCart(userId, cart) {
  if (!userId) return;
  const cartKey = `sonex_cart_${userId}`;
  try {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    await setDoc(doc(db, 'users', userId), { 
      cart, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (err) {
    console.warn("saveUserCart error:", err);
  }
}

/**
 * Submit UTR reference via Decoupled REST API with Firestore fallback
 */
export async function submitOrderUtr(orderId, utrNumber, payerApp = 'UPI', screenshotUrl = '') {
  // 1. Primary: Decoupled REST API
  try {
    const res = await apiClient.submitUTR(orderId, utrNumber, payerApp);
    if (res && res.success) {
      return res.data;
    }
  } catch (apiErr) {
    console.info('[StoreService] Client API submitUTR offline or fallback, using direct Firestore:', apiErr.message);
  }

  // 2. Fallback: Direct Firestore update
  const patch = {
    status: 'utr_submitted',
    utrNumber,
    payerApp,
    screenshotUrl,
    utrSubmittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, patch);
  } catch (err) {
    console.warn("Firestore submitOrderUtr error:", err);
  }
  return patch;
}

/**
 * Fetch all orders (Fallback / Admin sync)
 */
export async function fetchAllOrders() {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersRef);

    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return items;
    }
  } catch (err) {
    console.warn("Firestore fetchOrders error:", err);
  }
  return [];
}

/**
 * Save / Create an order strictly associated with the user's uid
 */
export async function saveOrderToStore(order, userId = null) {
  const orderId = order.id || `SS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const finalUserId = userId || order.userId || 'anonymous';
  const completeOrder = {
    ...order,
    id: orderId,
    userId: finalUserId,
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Primary: Decoupled REST API / Cloud Functions
  try {
    await apiClient.createOrder(completeOrder);
  } catch (apiErr) {
    console.info('[StoreService] Client API createOrder offline or fallback, using direct Firestore:', apiErr.message);
  }

  try {
    // 2. Fallback / direct sync: Firestore
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(docRef, completeOrder, { merge: true });
  } catch (err) {
    console.warn("Firestore saveOrder error (updating locally):", err);
  }

  // Save to user's isolated local order list
  if (finalUserId && finalUserId !== 'anonymous') {
    const localKey = `sonex_orders_${finalUserId}`;
    try {
      const local = localStorage.getItem(localKey);
      let list = local ? JSON.parse(local) : [];
      const idx = list.findIndex(o => o.id === orderId);
      if (idx >= 0) {
        list[idx] = completeOrder;
      } else {
        list.unshift(completeOrder);
      }
      localStorage.setItem(localKey, JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }
  }

  return completeOrder;
}

/**
 * Update order status
 */
export async function updateOrderStatusInStore(orderId, newStatus, notes = '', userId = null) {
  const patch = {
    status: newStatus,
    adminNotes: notes,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, patch);
  } catch (err) {
    console.warn("Firestore updateOrderStatus error (updating locally):", err);
  }

  if (userId) {
    const localKey = `sonex_orders_${userId}`;
    try {
      const local = localStorage.getItem(localKey);
      if (local) {
        const list = JSON.parse(local);
        const updated = list.map(o => o.id === orderId ? { ...o, ...patch } : o);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return updated;
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return null;
}

/**
 * Verify or Reject UTR
 */
export async function verifyOrderUtr(orderId, isApproved, remarks = '') {
  const newStatus = isApproved ? 'payment_confirmed' : 'utr_rejected';
  return updateOrderStatusInStore(orderId, newStatus, remarks || (isApproved ? 'UTR payment verified by Admin' : 'UTR invalid / rejected'));
}

/**
 * Default Social Media Links
 */
export const DEFAULT_SOCIAL_LINKS = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com',
    enabled: true
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com',
    enabled: true
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    url: 'https://twitter.com',
    enabled: true
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com',
    enabled: true
  }
};

const LOCAL_SOCIAL_LINKS_KEY = 'sonex_social_links_v1';

/**
 * Fetch Social Links from Firestore with local fallback
 */
export async function fetchSocialLinks() {
  let links = { ...DEFAULT_SOCIAL_LINKS };

  try {
    const cached = localStorage.getItem(LOCAL_SOCIAL_LINKS_KEY);
    if (cached) {
      links = { ...links, ...JSON.parse(cached) };
    }
  } catch (e) {
    console.warn(e);
  }

  try {
    const docRef = doc(db, 'settings', 'social_links');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      links = { ...links, ...data };
      localStorage.setItem(LOCAL_SOCIAL_LINKS_KEY, JSON.stringify(links));
    }
  } catch (err) {
    console.warn("Firestore fetchSocialLinks error:", err);
  }

  return links;
}

/**
 * Save Social Links to Firestore and local cache
 */
export async function saveSocialLinks(links) {
  try {
    localStorage.setItem(LOCAL_SOCIAL_LINKS_KEY, JSON.stringify(links));
    const docRef = doc(db, 'settings', 'social_links');
    await setDoc(docRef, links, { merge: true });
  } catch (err) {
    console.warn("saveSocialLinks error:", err);
  }
  return links;
}

/**
 * Real-time listener for Social Links so client site updates immediately when Admin toggles show/hide or edits URL
 */
export function subscribeToSocialLinks(callback) {
  try {
    const docRef = doc(db, 'settings', 'social_links');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const merged = { ...DEFAULT_SOCIAL_LINKS, ...data };
        localStorage.setItem(LOCAL_SOCIAL_LINKS_KEY, JSON.stringify(merged));
        callback(merged);
      }
    }, (err) => {
      console.warn("subscribeToSocialLinks listener error:", err);
    });
  } catch (e) {
    console.warn("subscribeToSocialLinks error:", e);
    return () => {};
  }
}

// --------------------------------------------------------------------------
// Checkout Pricing, Shipping & GST Settings
// --------------------------------------------------------------------------
export const DEFAULT_CHECKOUT_PRICING = {
  shippingPrice: 49, // Updated default: ₹49 standard delivery
  isFreeShipping: false, // If true, shipping is always ₹0
  freeShippingThreshold: 25000, // Free shipping if subtotal >= this threshold
  enableFreeShippingThreshold: true, // Whether threshold applies
  gstPercentage: 5, // 5% GST
  gstCalculationMode: 'product_plus_shipping', // GST calculated on Product Price + Shipping Price
  updatedAt: new Date().toISOString()
};

export const LOCAL_CHECKOUT_PRICING_KEY = 'sonex_checkout_pricing_v1';

/**
 * Fetch Checkout Pricing & GST Settings from REST API & Firestore with local cache fallback
 */
export async function fetchCheckoutPricing() {
  let pricing = { ...DEFAULT_CHECKOUT_PRICING };

  // 1. Try local cache
  try {
    const cached = localStorage.getItem(LOCAL_CHECKOUT_PRICING_KEY);
    if (cached) {
      pricing = { ...pricing, ...JSON.parse(cached) };
    }
  } catch (e) {
    console.warn(e);
  }

  // 2. Primary: Decoupled REST API (from local or cloud backend)
  try {
    const res = await apiClient.getSettings();
    if (res?.data?.checkoutPricing) {
      pricing = { ...pricing, ...res.data.checkoutPricing };
      localStorage.setItem(LOCAL_CHECKOUT_PRICING_KEY, JSON.stringify(pricing));
      return pricing;
    }
  } catch (apiErr) {
    console.info('[StoreService] getSettings API fallback:', apiErr.message);
  }

  // 3. Fallback: Firestore document
  try {
    const docRef = doc(db, 'settings', 'checkout_pricing');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      pricing = { ...pricing, ...data };
      localStorage.setItem(LOCAL_CHECKOUT_PRICING_KEY, JSON.stringify(pricing));
    }
  } catch (err) {
    console.warn("Firestore fetchCheckoutPricing error:", err);
  }

  return pricing;
}

/**
 * Save Checkout Pricing, Shipping & GST Settings to Firestore and local cache
 */
export async function saveCheckoutPricing(pricingData) {
  const merged = {
    ...DEFAULT_CHECKOUT_PRICING,
    ...pricingData,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(LOCAL_CHECKOUT_PRICING_KEY, JSON.stringify(merged));
    const docRef = doc(db, 'settings', 'checkout_pricing');
    await setDoc(docRef, merged, { merge: true });
  } catch (err) {
    console.warn("saveCheckoutPricing error:", err);
  }

  return merged;
}

/**
 * Real-time listener for Checkout Pricing changes so client Cart & Checkout update immediately
 */
export function subscribeToCheckoutPricing(callback) {
  // Sync immediately from API
  fetchCheckoutPricing().then(pricing => {
    if (pricing) callback(pricing);
  });

  // Re-sync on window focus (e.g. user changes setting in admin and switches back to store)
  const handleFocus = () => {
    fetchCheckoutPricing().then(pricing => {
      if (pricing) callback(pricing);
    });
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus);
  }

  // Real-time Firestore snapshot listener if available
  let unsubFirestore = () => {};
  try {
    const docRef = doc(db, 'settings', 'checkout_pricing');
    unsubFirestore = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const merged = { ...DEFAULT_CHECKOUT_PRICING, ...data };
        localStorage.setItem(LOCAL_CHECKOUT_PRICING_KEY, JSON.stringify(merged));
        callback(merged);
      }
    }, (err) => {
      console.warn("subscribeToCheckoutPricing listener error:", err);
    });
  } catch (e) {
    console.warn("subscribeToCheckoutPricing error:", e);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleFocus);
    }
    if (unsubFirestore) unsubFirestore();
  };
}



