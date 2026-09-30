import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import AppHeader from './components/AppHeader';
import DressCatalog from './components/DressCatalog';
import InteractiveDressPreview from './components/InteractiveDressPreview';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import UtrSubmissionModal from './components/UtrSubmissionModal';
import ToastNotification from './components/ToastNotification';
import AtelierFooter from './components/AtelierFooter';
import HowToOrderSection from './components/HowToOrderSection';
import PolicyTermsModal from './components/PolicyTermsModal';
import SplashScreen from './components/SplashScreen';
import VideoPreloaderModal from './components/VideoPreloaderModal';
import { loadAndCacheVideo, isVideoCached, loadAndCacheMedia, isMediaCached } from './services/videoCacheService';
import { DRESSES_DATA } from './constants/dressesData';
import { playSound } from './utils/audio';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  fetchAllProducts,
  subscribeToProducts,
  saveProductToStore,
  toggleProductVisibility,
  deleteProductFromStore,
  fetchUserOrders,
  fetchUserData,
  saveUserProfile,
  saveUserWishlist,
  saveUserCart,
  saveOrderToStore,
  updateOrderStatusInStore,
  verifyOrderUtr,
  submitOrderUtr,
  getDefaultProducts,
  DEFAULT_CHECKOUT_PRICING,
  fetchCheckoutPricing,
  subscribeToCheckoutPricing
} from './services/storeService';

export default function App() {
  // Search query in top app bar
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Product Catalog (Synced with Firestore & localStorage)
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('sonex_products_navratri_v3');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return getDefaultProducts();
  });

  // Dynamic Shipping & GST Tax Settings (Configured via Admin Portal)
  const [checkoutPricing, setCheckoutPricing] = useState(() => {
    try {
      const saved = localStorage.getItem('sonex_checkout_pricing_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_CHECKOUT_PRICING;
  });

  // User Authentication State (Google / Gmail Authentication)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('atelier_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn && (parsed.email || parsed.uid)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      name: '',
      email: '',
      phone: '',
      rawPhone: '',
      alternatePhone: '',
      address: '',
      landmark: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      isLoggedIn: false,
      tier: 'Atelier Guest',
      points: 0
    };
  });

  // Favorites / Wishlist: Strictly isolated per user UID (Empty for guests)
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedUser = localStorage.getItem('atelier_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.isLoggedIn && parsed?.uid) {
          const userFavs = localStorage.getItem(`sonex_favorites_${parsed.uid}`);
          if (userFavs) return JSON.parse(userFavs);
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // Shopping Cart items: Strictly isolated per user UID (Empty for guests)
  const [cart, setCart] = useState(() => {
    try {
      const savedUser = localStorage.getItem('atelier_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.isLoggedIn && parsed?.uid) {
          const userCart = localStorage.getItem(`sonex_cart_${parsed.uid}`);
          if (userCart) {
            const parsedCart = JSON.parse(userCart);
            return parsedCart.map(item => {
              const fresh = DRESSES_DATA.find(d => String(d.id) === String(item.id));
              const fallbackColor = fresh?.colors?.[0]?.name || (typeof fresh?.colors?.[0] === 'string' ? fresh.colors[0] : 'Standard');
              const fallbackSize = fresh?.defaultSize || (Array.isArray(fresh?.sizes) && fresh.sizes[0]) || 'M';
              return fresh 
                ? { ...fresh, selectedSize: item.selectedSize || fallbackSize, selectedColor: item.selectedColor || fallbackColor, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) } 
                : { ...item, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) };
            });
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // Orders List: Strictly isolated per user UID (Empty for guests, zero cross-user leakage)
  const [orders, setOrders] = useState(() => {
    try {
      const savedUser = localStorage.getItem('atelier_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.isLoggedIn && parsed?.uid) {
          const userOrders = localStorage.getItem(`sonex_orders_${parsed.uid}`);
          if (userOrders) return JSON.parse(userOrders);
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  // Active / Selected Dress for 360 Turnaround Showcase Preview
  const [selectedDress, setSelectedDress] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') return null;
      if (hash.startsWith('dress-')) {
        const found = DRESSES_DATA.find(d => d.id === hash);
        if (found) return found;
      } else if (hash === 'showcase-2') {
        return DRESSES_DATA[0];
      } else if (hash === 'showcase-1') {
        return DRESSES_DATA[1];
      }
    }
    return null;
  });

  // Modal & Drawer visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('orders');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isUtrModalOpen, setIsUtrModalOpen] = useState(false);
  const [selectedOrderForUtr, setSelectedOrderForUtr] = useState(null);
  const [authRedirectAction, setAuthRedirectAction] = useState(null);

  // Direct Manufacturer Policy & Terms Modal
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyActiveTab, setPolicyActiveTab] = useState('bundle-pooling');

  const handleOpenPolicyModal = useCallback((tab = 'bundle-pooling') => {
    setPolicyActiveTab(tab);
    setIsPolicyModalOpen(true);
    playSound('click');
  }, []);

  const handleSelectFooterCategory = useCallback((catName) => {
    if (selectedDress) {
      setSelectedDress(null);
    }
    setSearchQuery(catName);
    playSound('click');
    setToast({
      title: 'Viewing Collection',
      message: `Showing manufacturer collection for "${catName}".`,
      type: 'info'
    });
    // Smooth scroll to catalog section
    window.scrollTo({ top: 380, behavior: 'smooth' });
  }, [selectedDress]);

  // Full-Screen Luxury Brand Splash Screen on page load / entry
  const [showSplash, setShowSplash] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Pending action to replay immediately after user authenticates (e.g. adding a dress to cart or wishlist)
  const [pendingAction, setPendingAction] = useState(null);

  // On-demand 360 turnaround video downloading & browser caching state
  const [videoLoadingState, setVideoLoadingState] = useState(null);

  // --------------------------------------------------------------------------
  // Fetch Products Catalog on mount (Public catalog)
  // Note: Client NEVER fetches all users' orders; only the logged-in user's orders are fetched below!
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchAllProducts().then(res => {
      if (res && res.length > 0) {
        setProducts(res);
      }
    });

    const unsubscribe = subscribeToProducts((freshProducts) => {
      if (freshProducts && freshProducts.length > 0) {
        setProducts(freshProducts);
        // Automatically sync active selected dress stock in real time
        setSelectedDress(curr => {
          if (!curr) return null;
          const updated = freshProducts.find(p => p.id === curr.id);
          return updated ? { ...curr, ...updated } : curr;
        });
      }
    });

    // Real-time synchronization for Admin Shipping & GST Rates
    fetchCheckoutPricing().then(res => {
      if (res) setCheckoutPricing(res);
    });
    const unsubPricing = subscribeToCheckoutPricing((freshPricing) => {
      if (freshPricing) setCheckoutPricing(freshPricing);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubPricing) unsubPricing();
    };
  }, []);

  // Persist State Strictly to User-Scoped Storage & Firestore
  useEffect(() => {
    if (user?.isLoggedIn && user?.uid) {
      saveUserWishlist(user.uid, favorites);
    }
  }, [favorites, user?.isLoggedIn, user?.uid]);

  useEffect(() => {
    if (user?.isLoggedIn && user?.uid) {
      saveUserCart(user.uid, cart);
    }
  }, [cart, user?.isLoggedIn, user?.uid]);

  useEffect(() => {
    if (user?.isLoggedIn && user?.uid) {
      try {
        localStorage.setItem('atelier_user', JSON.stringify(user));
        localStorage.setItem(`sonex_profile_${user.uid}`, JSON.stringify(user));
        saveUserProfile(user.uid, user);
      } catch (e) {
        console.warn('Failed to save user', e);
      }
    }
  }, [user]);

  // Sync with Firebase Authentication state changes & strictly isolate personal data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const uid = fbUser.uid;
        // Fetch user's isolated data (profile, wishlist, cart)
        const { profile, wishlist, cart: savedCart } = await fetchUserData(uid);

        setUser(prev => {
          const updated = {
            ...prev,
            uid: uid,
            email: fbUser.email || prev.email,
            name: fbUser.displayName || (profile && profile.name) || prev.name || (fbUser.email ? fbUser.email.split('@')[0] : 'Atelier Member'),
            photoURL: fbUser.photoURL || (profile && profile.photoURL) || prev.photoURL || '',
            phone: (profile && profile.phone) || prev.phone || '',
            rawPhone: (profile && profile.rawPhone) || prev.rawPhone || '',
            alternatePhone: (profile && profile.alternatePhone) || prev.alternatePhone || '',
            address: (profile && profile.address) || prev.address || '',
            streetAddress: (profile && profile.streetAddress) || prev.streetAddress || '',
            landmark: (profile && profile.landmark) || prev.landmark || '',
            city: (profile && profile.city) || prev.city || '',
            state: (profile && profile.state) || prev.state || 'Maharashtra',
            pincode: (profile && profile.pincode) || prev.pincode || '',
            isLoggedIn: true,
            tier: (profile && profile.tier) || prev.tier || 'Atelier Registered Member',
            points: (profile && profile.points) ?? prev.points ?? 2850
          };
          try {
            localStorage.setItem('atelier_user', JSON.stringify(updated));
            localStorage.setItem(`sonex_profile_${uid}`, JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
          return updated;
        });

        // Load isolated wishlist for this user
        if (Array.isArray(wishlist)) {
          setFavorites(wishlist);
        } else {
          setFavorites([]);
        }

        // Load isolated cart for this user
        if (Array.isArray(savedCart)) {
          const hydrated = savedCart.map(item => {
            const fresh = DRESSES_DATA.find(d => String(d.id) === String(item.id));
            const fallbackColor = fresh?.colors?.[0]?.name || (typeof fresh?.colors?.[0] === 'string' ? fresh.colors[0] : 'Standard');
            const fallbackSize = fresh?.defaultSize || (Array.isArray(fresh?.sizes) && fresh.sizes[0]) || 'M';
            return fresh 
              ? { ...fresh, selectedSize: item.selectedSize || fallbackSize, selectedColor: item.selectedColor || fallbackColor, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) } 
              : { ...item, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) };
          });
          setCart(hydrated);
        } else {
          setCart([]);
        }

        // Strictly fetch user's private orders (ZERO cross-user leakage)
        const userOrders = await fetchUserOrders(uid);
        setOrders(userOrders || []);
      } else {
        // When unauthenticated, ensure no customer's private data is in view
        setUser(prev => {
          if (!prev.isLoggedIn) return prev;
          return {
            name: '',
            email: '',
            phone: '',
            rawPhone: '',
            alternatePhone: '',
            address: '',
            landmark: '',
            city: '',
            state: 'Maharashtra',
            pincode: '',
            isLoggedIn: false,
            tier: 'Atelier Guest',
            points: 0
          };
        });
        setFavorites([]);
        setCart([]);
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('dress-')) {
        const found = products.find(d => d.id === hash) || DRESSES_DATA.find(d => d.id === hash);
        if (found) setSelectedDress(found);
      } else if (hash === 'showcase-2') {
        setSelectedDress(products[0] || DRESSES_DATA[0]);
      } else if (hash === 'showcase-1') {
        setSelectedDress(products[1] || DRESSES_DATA[1]);
      } else if (!hash) {
        setSelectedDress(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [products]);

  // Open 360 interactive preview with instant launch if cached, or luxury preloader until 100% cached
  const handleSelectDress = useCallback(async (dress) => {
    if (!dress) return;

    // Check if 360 media (frames or video) is already cached in memory or browser CacheStorage
    const isCached = await isMediaCached(dress, dress.colors?.[0], dress.defaultSize || dress.sizes?.[0]);
    if (isCached) {
      setSelectedDress(dress);
      window.location.hash = `#${dress.id}`;
      playSound('zoom');
      return;
    }

    // Show Luxury Preloader Modal until media is fully downloaded and cached
    setVideoLoadingState({
      isOpen: true,
      dress,
      progress: 0,
      size: dress.defaultSize || 'L'
    });

    try {
      await loadAndCacheMedia(
        dress,
        dress.colors?.[0],
        dress.defaultSize || dress.sizes?.[0],
        (progress) => {
          setVideoLoadingState(prev => prev ? { ...prev, progress } : null);
        }
      );
      // Brief smooth transition when hitting 100%
      setTimeout(() => {
        setVideoLoadingState(null);
        setSelectedDress(dress);
        window.location.hash = `#${dress.id}`;
        playSound('zoom');
      }, 200);
    } catch (err) {
      console.warn('Preloader failed, opening directly:', err);
      setVideoLoadingState(null);
      setSelectedDress(dress);
      window.location.hash = `#${dress.id}`;
    }
  }, []);

  // Return to homepage collection
  const handleBackToHome = useCallback(() => {
    setSelectedDress(null);
    window.location.hash = '';
    playSound('mode');
  }, []);

  // Toggle favorite (Protected: Login required so favorites belong strictly to the authenticated user)
  const handleToggleFavorite = useCallback((dress) => {
    if (!user?.isLoggedIn) {
      setPendingAction({ type: 'favorite', dress });
      setAuthRedirectAction('favorite');
      setIsAuthModalOpen(true);
      setToast({
        title: 'Sign In Required',
        message: 'Please sign in with your Google account to save dresses to your personal wishlist.',
        type: 'info'
      });
      return;
    }

    setFavorites(prev => {
      const exists = prev.includes(dress.id);
      if (exists) {
        setToast({
          title: 'Removed from Wishlist',
          message: `${dress.title} was removed from your saved items.`,
          type: 'info'
        });
        playSound('click');
        return prev.filter(id => id !== dress.id);
      } else {
        setToast({
          title: 'Saved to Wishlist',
          message: `${dress.title} added to your wishlist.`,
          type: 'favorite'
        });
        playSound('zoom');
        return [...prev, dress.id];
      }
    });
  }, [user?.isLoggedIn]);

  // Add dress to cart (Protected: Login required so shopping bag belongs strictly to the authenticated user)
  const handleAddToCart = useCallback((dress) => {
    if (!dress) return;

    // Normalize size
    const chosenSize = (
      dress.selectedSize ||
      dress.defaultSize ||
      (Array.isArray(dress.sizes) && dress.sizes[0]) ||
      'M'
    ).toString().trim();

    // Normalize color
    let chosenColor = dress.selectedColor;
    if (chosenColor && typeof chosenColor === 'object') {
      chosenColor = chosenColor.name || 'Standard';
    } else if (typeof chosenColor === 'string' && chosenColor.trim()) {
      chosenColor = chosenColor.trim();
    } else if (Array.isArray(dress.colors) && dress.colors.length > 0) {
      const first = dress.colors[0];
      chosenColor = typeof first === 'object' ? (first.name || 'Standard') : String(first);
    } else {
      chosenColor = 'Standard';
    }

    if (!user?.isLoggedIn) {
      setPendingAction({ 
        type: 'cart', 
        dress: { ...dress, selectedSize: chosenSize, selectedColor: chosenColor } 
      });
      setAuthRedirectAction('cart');
      setIsAuthModalOpen(true);
      setToast({
        title: 'Sign In Required',
        message: 'Please sign in with your Google account to add dresses to your personal shopping bag.',
        type: 'info'
      });
      return;
    }

    let nextQuantity = 1;

    setCart(prev => {
      // 1. Check for exact match: same Product ID + same Size + same Color
      let matchIdx = prev.findIndex(item => 
        String(item.id) === String(dress.id) &&
        String(item.selectedSize || '').toLowerCase() === chosenSize.toLowerCase() &&
        String(item.selectedColor || '').toLowerCase() === chosenColor.toLowerCase()
      );

      // 2. If no exact match and the product was added from quick action without specific size/color overrides,
      // match existing item with same Product ID
      if (matchIdx === -1 && !dress.selectedSize && !dress.selectedColor) {
        matchIdx = prev.findIndex(item => String(item.id) === String(dress.id));
      }

      if (matchIdx > -1) {
        // EXACT USER REQUIREMENT: Every time "add to cart" is hit on the same product, increment quantity strictly by 1
        const currentQty = Math.max(1, parseInt(prev[matchIdx].quantity, 10) || 1);
        nextQuantity = currentQty + 1;

        return prev.map((item, idx) => {
          if (idx === matchIdx) {
            return {
              ...item,
              quantity: nextQuantity
            };
          }
          return item;
        });
      } else {
        // First time adding this product -> quantity 1
        nextQuantity = 1;
        return [
          ...prev,
          {
            ...dress,
            selectedSize: chosenSize,
            selectedColor: chosenColor,
            quantity: 1
          }
        ];
      }
    });

    setToast({
      title: nextQuantity > 1 ? `Bag Updated (${nextQuantity}x)` : 'Added to Shopping Bag',
      message: nextQuantity > 1 
        ? `${dress.title} quantity increased to ${nextQuantity} in your shopping bag.`
        : `${dress.title} (${chosenSize}, ${chosenColor}) added to your personal bag.`,
      type: 'cart'
    });
    playSound('chime');
  }, [user?.isLoggedIn]);

  // Update item quantity in cart (+1 / -1 stepper)
  const handleUpdateQuantity = useCallback((index, changeOrNewQty) => {
    setCart(prev => {
      if (!prev[index]) return prev;
      const currentQty = Math.max(1, parseInt(prev[index].quantity, 10) || 1);

      let nextQty;
      // Handle delta (-1 or +1)
      if (changeOrNewQty === -1 || changeOrNewQty === 1) {
        nextQty = currentQty + changeOrNewQty;
      } else if (typeof changeOrNewQty === 'number') {
        // Handle explicit new quantity (e.g. from item.quantity - 1 or item.quantity + 1)
        if (changeOrNewQty === currentQty + 1 || changeOrNewQty === currentQty - 1) {
          nextQty = changeOrNewQty;
        } else if (changeOrNewQty <= 0) {
          nextQty = 0;
        } else {
          nextQty = changeOrNewQty;
        }
      } else {
        nextQty = currentQty;
      }

      // If quantity drops to 0 or below, remove from cart
      if (nextQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }

      return prev.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            quantity: Math.max(1, Math.floor(nextQty))
          };
        }
        return item;
      });
    });
    playSound('click');
  }, []);

  // Remove specific item from cart
  const handleRemoveCartItem = useCallback((index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    playSound('click');
  }, []);

  // Proceed to Checkout (Guards: Requires Google login, mobile entered at checkout)
  const handleProceedToCheckout = useCallback(() => {
    setIsCartOpen(false);
    if (!user?.isLoggedIn) {
      setAuthRedirectAction('checkout');
      setIsAuthModalOpen(true);
      setToast({
        title: 'Sign In Required',
        message: 'Please sign in with your Google account to proceed with checkout.',
        type: 'info'
      });
    } else {
      setIsCheckoutModalOpen(true);
    }
  }, [user]);

  // Authentication Login Success Handler (Google / Gmail)
  const handleLoginSuccess = useCallback(async (userData) => {
    setUser(userData);
    const uid = userData.uid;

    // Load isolated profile, wishlist, cart for this user
    const { profile, wishlist, cart: savedCart } = await fetchUserData(uid);

    if (profile) {
      setUser(prev => ({
        ...prev,
        ...profile,
        uid: uid,
        isLoggedIn: true
      }));
    }

    if (Array.isArray(wishlist)) {
      setFavorites(wishlist);
    } else {
      setFavorites([]);
    }

    if (Array.isArray(savedCart)) {
      const hydrated = savedCart.map(item => {
        const fresh = DRESSES_DATA.find(d => d.id === item.id);
        return fresh ? { ...fresh, selectedSize: item.selectedSize || 'M', selectedColor: item.selectedColor || 'Pure Pearl', quantity: item.quantity || 1 } : item;
      });
      setCart(hydrated);
    } else {
      setCart([]);
    }

    // Load user's private orders strictly
    const userOrders = await fetchUserOrders(uid);
    setOrders(userOrders || []);

    try {
      localStorage.setItem('atelier_user', JSON.stringify(userData));
      localStorage.setItem(`sonex_profile_${uid}`, JSON.stringify(userData));
    } catch (e) {
      console.warn(e);
    }

    setToast({
      title: userData.name ? `Welcome, ${userData.name}` : `Signed in: ${userData.email}`,
      message: 'Signed in successfully. Your personal wishlist, cart, and orders are loaded.',
      type: 'info'
    });
    playSound('mode');

    // Handle any queued pending action
    if (pendingAction) {
      if (pendingAction.type === 'favorite' && pendingAction.dress) {
        setFavorites(prev => {
          if (!prev.includes(pendingAction.dress.id)) {
            return [...prev, pendingAction.dress.id];
          }
          return prev;
        });
        setToast({
          title: 'Saved to Wishlist',
          message: `${pendingAction.dress.title} added to your wishlist.`,
          type: 'favorite'
        });
      } else if (pendingAction.type === 'cart' && pendingAction.dress) {
        setCart(prev => [...prev, { ...pendingAction.dress, quantity: 1 }]);
        setToast({
          title: 'Added to Shopping Bag',
          message: `${pendingAction.dress.title} added to your personal bag.`,
          type: 'cart'
        });
      }
      setPendingAction(null);
    }

    // Trigger post-auth action redirection
    if (authRedirectAction === 'checkout') {
      setAuthRedirectAction(null);
      setIsCheckoutModalOpen(true);
    } else if (authRedirectAction === 'wishlist') {
      setAuthRedirectAction(null);
      setIsWishlistOpen(true);
    } else if (authRedirectAction === 'cart') {
      setAuthRedirectAction(null);
      setIsCartOpen(true);
    } else if (authRedirectAction === 'profile') {
      setAuthRedirectAction(null);
      setProfileActiveTab('orders');
      setIsProfileOpen(true);
    }
  }, [authRedirectAction, pendingAction]);

  // User Logout - Immediate and complete isolation cleanup
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    const emptyUser = {
      name: '',
      email: '',
      phone: '',
      rawPhone: '',
      alternatePhone: '',
      address: '',
      landmark: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      isLoggedIn: false,
      tier: 'Atelier Guest',
      points: 0
    };
    setUser(emptyUser);
    setFavorites([]);
    setCart([]);
    setOrders([]);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsProfileOpen(false);
    setIsCheckoutModalOpen(false);
    try {
      localStorage.removeItem('atelier_user');
    } catch (e) {
      console.warn(e);
    }
    setToast({
      title: 'Signed Out',
      message: 'You have signed out. Personal cart, wishlist, and orders cleared.',
      type: 'info'
    });
    playSound('click');
  }, []);

  // Order Placed Handler (Saves strictly to Firestore with user.uid & updates state)
  const handlePlaceOrder = useCallback(async (newOrder) => {
    const finalUserId = user?.uid || 'anonymous';
    const orderWithUser = {
      ...newOrder,
      userId: finalUserId
    };
    await saveOrderToStore(orderWithUser, finalUserId);
    setOrders(prev => [orderWithUser, ...prev]);
    setCart([]); // Clear in-memory cart
    if (user?.uid) {
      saveUserCart(user.uid, []);
    }
    playSound('zoom');
    setToast({
      title: 'Order Placed Successfully!',
      message: `Order #${newOrder.id} placed. Full order details available under My Orders.`,
      type: 'cart'
    });
  }, [user?.uid]);

  // View Orders after placing order (Switches directly to full order history tab in profile)
  const handleViewOrdersFromCheckout = useCallback(() => {
    setIsCheckoutModalOpen(false);
    setProfileActiveTab('orders');
    setIsProfileOpen(true);
  }, []);

  // Open UTR Submission Modal
  const handleOpenUtrModal = useCallback((order) => {
    setSelectedOrderForUtr(order);
    setIsUtrModalOpen(true);
    playSound('click');
  }, []);

  // Submit UTR & Screenshot (Syncs with Firestore)
  const handleSubmitUtr = useCallback(async ({ orderId, utrNumber, screenshotUrl, submittedAt }) => {
    // Decoupled REST API / Cloud Functions call
    await submitOrderUtr(orderId, utrNumber, 'UPI', screenshotUrl);

    const patch = {
      id: orderId,
      status: 'utr_submitted',
      utrNumber,
      screenshotUrl,
      utrSubmittedAt: submittedAt || new Date().toISOString()
    };

    await saveOrderToStore(patch, user?.uid);
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          ...patch
        };
      }
      return ord;
    }));

    setToast({
      title: 'UTR Proof Submitted',
      message: `UTR #${utrNumber} received for Order #${orderId}. Accounts team is verifying.`,
      type: 'info'
    });
    playSound('zoom');
  }, [user?.uid]);

  // Admin Verification Simulator (for Manual Testing from profile)
  const handleVerifyOrderAdmin = useCallback(async (orderId) => {
    await updateOrderStatusInStore(orderId, 'payment_confirmed', 'Verified via quick test');
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status: 'payment_confirmed' } : ord));
    setToast({
      title: 'Order Payment Confirmed!',
      message: `Order #${orderId} verified. Garment moved to quality check & packing.`,
      type: 'info'
    });
    playSound('mode');
  }, []);

  // --------------------------------------------------------------------------
  // Admin Operations (Save product, toggle hide/show, delete, verify order)
  // --------------------------------------------------------------------------
  const handleSaveProductAdmin = useCallback(async (productPayload) => {
    const saved = await saveProductToStore(productPayload);
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setToast({
      title: 'Dress Saved to Store',
      message: `"${saved.title}" saved successfully to Firebase & Store.`,
      type: 'info'
    });
    playSound('zoom');
  }, []);

  const handleToggleProductVisibilityAdmin = useCallback(async (productId, isHidden) => {
    await toggleProductVisibility(productId, isHidden);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, hidden: isHidden } : p));
    setToast({
      title: isHidden ? 'Dress Hidden' : 'Dress Live in Store',
      message: isHidden ? 'This dress is now hidden from the client catalog.' : 'This dress is now live in the client catalog.',
      type: 'info'
    });
    playSound('click');
  }, []);

  const handleDeleteProductAdmin = useCallback(async (productId) => {
    await deleteProductFromStore(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setToast({
      title: 'Dress Deleted',
      message: 'Product removed from Sonex Enterprises catalog.',
      type: 'info'
    });
    playSound('mode');
  }, []);

  const handleUpdateOrderStatusAdmin = useCallback(async (orderId, newStatus, notes) => {
    await updateOrderStatusInStore(orderId, newStatus, notes);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, adminNotes: notes } : o));
    setToast({
      title: 'Order Status Updated',
      message: `Order #${orderId} updated to ${newStatus.replace('_', ' ').toUpperCase()}.`,
      type: 'info'
    });
    playSound('mode');
  }, []);

  const handleVerifyOrderUtrAdmin = useCallback(async (orderId, isApproved, notes) => {
    await verifyOrderUtr(orderId, isApproved, notes);
    const newStatus = isApproved ? 'payment_confirmed' : 'utr_rejected';
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, adminNotes: notes } : o));
    setToast({
      title: isApproved ? 'UTR Verified & Approved' : 'UTR Rejected',
      message: isApproved ? `Payment verified for Order #${orderId}. Moved to Quality Check.` : `UTR rejected for Order #${orderId}.`,
      type: isApproved ? 'info' : 'favorite'
    });
    playSound('zoom');
  }, []);

  const handleRefreshCloudData = useCallback(async () => {
    const freshProducts = await fetchAllProducts();
    if (freshProducts && freshProducts.length > 0) setProducts(freshProducts);
    if (user?.isLoggedIn && user?.uid) {
      const freshOrders = await fetchUserOrders(user.uid);
      if (freshOrders) setOrders(freshOrders);
      const { wishlist, cart: freshCart } = await fetchUserData(user.uid);
      if (wishlist) setFavorites(wishlist);
      if (freshCart) setCart(freshCart);
    }
    setToast({
      title: 'Cloud Database Synced',
      message: 'Refreshed latest data from Firebase Firestore.',
      type: 'info'
    });
    playSound('chime');
  }, [user?.isLoggedIn, user?.uid]);

  // Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  }, [cart]);

  const favoriteDressesList = useMemo(() => {
    return products.filter(d => favorites.includes(d.id));
  }, [products, favorites]);

  // Dynamic Auth Redirect Message
  const authModalRedirectMessage = useMemo(() => {
    if (authRedirectAction === 'checkout') return 'Sign in to confirm delivery details & place your couture order.';
    if (authRedirectAction === 'cart') return 'Sign in with your Google account to access your personal shopping bag.';
    if (authRedirectAction === 'wishlist') return 'Sign in with your Google account to access your personal wishlist.';
    if (authRedirectAction === 'favorite') return 'Sign in with your Google account to save garments to your wishlist.';
    if (authRedirectAction === 'profile') return 'Sign in with your Google account to view your account & order history.';
    return undefined;
  }, [authRedirectAction]);

  // --------------------------------------------------------------------------
  // Default Client Store View
  // --------------------------------------------------------------------------
  return (
    <div className="app-root-shell light-theme-root">
      {/* Full-Screen Animated Brand Splash Screen Reveal */}
      {showSplash && (
        <SplashScreen 
          duration={2800} 
          onFinish={() => setShowSplash(false)} 
        />
      )}

      {/* Top App Bar Header with SonexBrandLogo */}
      <AppHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        favoritesCount={favorites.length}
        cartCount={cart.reduce((a, b) => a + (Number(b.quantity) || 1), 0)}
        cartTotal={cartTotal}
        onOpenWishlist={() => {
          if (!user?.isLoggedIn) {
            setAuthRedirectAction('wishlist');
            setIsAuthModalOpen(true);
            setToast({
              title: 'Sign In Required',
              message: 'Please sign in with your Google account to view your personal wishlist.',
              type: 'info'
            });
          } else {
            setIsWishlistOpen(true);
            playSound('click');
          }
        }}
        onOpenCart={() => {
          fetchCheckoutPricing().then(res => {
            if (res) setCheckoutPricing(res);
          });
          if (!user?.isLoggedIn) {
            setAuthRedirectAction('cart');
            setIsAuthModalOpen(true);
            setToast({
              title: 'Sign In Required',
              message: 'Please sign in with your Google account to view your personal shopping bag.',
              type: 'info'
            });
          } else {
            setIsCartOpen(true);
            playSound('click');
          }
        }}
        onOpenProfile={(tab = 'orders') => {
          if (!user?.isLoggedIn) {
            setAuthRedirectAction('profile');
            setIsAuthModalOpen(true);
            setToast({
              title: 'Sign In Required',
              message: 'Please sign in with your Google account to view your account & order history.',
              type: 'info'
            });
          } else {
            setProfileActiveTab(tab);
            setIsProfileOpen(true);
          }
          playSound('click');
        }}
        onOpenAuth={() => {
          setAuthRedirectAction('profile');
          setIsAuthModalOpen(true);
          playSound('click');
        }}
        onLogout={handleLogout}
        onSelectCategory={handleSelectFooterCategory}
        onOpenPolicyModal={handleOpenPolicyModal}
        onLogoClick={handleBackToHome}
      />

      {/* Main Content Area */}
      {selectedDress ? (
        /* Interactive 360 Turnaround Showcase Preview */
        <InteractiveDressPreview
          dress={selectedDress}
          onBack={handleBackToHome}
          isFavorite={favorites.includes(selectedDress.id)}
          onToggleFavorite={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          playSound={playSound}
          user={user}
          onOpenProfile={(tab) => {
            setProfileActiveTab(tab || 'measurements');
            setIsProfileOpen(true);
            playSound('click');
          }}
        />
      ) : (
        /* Home Page: Dresses Collection Grid (Controlled via Admin) */
        <main className="app-main-layout">
          <DressCatalog
            dresses={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onSelectDress={handleSelectDress}
          />
        </main>
      )}

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleProceedToCheckout}
          onSelectDress={handleSelectDress}
          checkoutPricing={checkoutPricing}
        />
      )}

      {/* Wishlist / Favorites Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        favoriteDresses={favoriteDressesList}
        onRemoveFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onSelectDress={handleSelectDress}
      />

      {/* User Profile & Orders Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        orders={orders}
        initialTab={profileActiveTab}
        onOpenUtrModal={handleOpenUtrModal}
        onVerifyOrderAdmin={handleVerifyOrderAdmin}
        onLogout={handleLogout}
        onUpdateUser={(updated) => setUser(updated)}
      />

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        redirectMessage={authModalRedirectMessage}
      />

      {/* Checkout & Order Placement Modal */}
      {isCheckoutModalOpen && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          cartItems={cart}
          user={user}
          checkoutPricing={checkoutPricing}
          onUpdateUser={(updated) => setUser(updated)}
          onOpenAuth={() => {
            setIsCheckoutModalOpen(false);
            setAuthRedirectAction('checkout');
            setIsAuthModalOpen(true);
          }}
          onPlaceOrder={handlePlaceOrder}
          onOpenUtrModal={handleOpenUtrModal}
          onViewOrders={handleViewOrdersFromCheckout}
        />
      )}

      {/* UTR Reference & Screenshot Submission Modal */}
      <UtrSubmissionModal
        isOpen={isUtrModalOpen}
        onClose={() => setIsUtrModalOpen(false)}
        order={selectedOrderForUtr}
        onSubmitUtr={handleSubmitUtr}
      />

      {/* Toast Notification Alert */}
      <ToastNotification
        toast={toast}
        onDismiss={() => setToast(null)}
      />

      {/* On-Demand 360 Turnaround Video Preloader & Cache Modal */}
      <VideoPreloaderModal
        isOpen={Boolean(videoLoadingState?.isOpen)}
        onClose={() => setVideoLoadingState(null)}
        dress={videoLoadingState?.dress}
        progress={videoLoadingState?.progress || 0}
        size={videoLoadingState?.size || 'L'}
        onSkip={() => {
          const d = videoLoadingState?.dress;
          setVideoLoadingState(null);
          if (d) {
            setSelectedDress(d);
            window.location.hash = `#${d.id}`;
          }
        }}
      />

      {/* How to Order on Our Platform */}
      {!selectedDress && <HowToOrderSection />}

      {/* Direct Manufacturer Policy, Terms & 100% Refund Modal */}
      <PolicyTermsModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        initialTab={policyActiveTab}
      />

      {/* Comprehensive Professional Luxury Footer */}
      {!selectedDress && (
        <AtelierFooter 
          onOpenProfile={() => {
            if (!user?.isLoggedIn) {
              setIsAuthModalOpen(true);
            } else {
              setIsProfileOpen(true);
            }
          }}
          onSelectCategory={handleSelectFooterCategory}
          onOpenPolicyModal={handleOpenPolicyModal}
        />
      )}
    </div>
  );
}
