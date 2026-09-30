import React from 'react';
import { 
  X, 
  User, 
  ShoppingBag, 
  Heart, 
  Package, 
  Ruler, 
  MapPin, 
  Settings, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Building2, 
  FileText, 
  CreditCard, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import SonexBrandLogo from './SonexBrandLogo';

export default function MobileAppDrawer({
  isOpen,
  onClose,
  user,
  favoritesCount = 0,
  cartCount = 0,
  cartTotal = 0,
  onOpenWishlist,
  onOpenCart,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  onSelectCategory,
  onOpenPolicyModal
}) {
  if (!isOpen) return null;

  const handleAction = (callback, arg) => {
    if (typeof callback === 'function') {
      callback(arg);
    }
    onClose();
  };

  return (
    <div className="mobile-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="mobile-app-drawer-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Logo & Close Button */}
        <div className="drawer-top-bar">
          <SonexBrandLogo size="xs" subtitle="TEXTILE ATELIER" />
          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card (Header as requested in audio) */}
        <div className="drawer-profile-card">
          {user?.isLoggedIn ? (
            <div className="drawer-user-info-row">
              <div className="drawer-user-avatar">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name || 'User'} className="avatar-img" />
                ) : (
                  <span className="avatar-letter">
                    {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'S')}
                  </span>
                )}
                <div className="verified-dot" title="Verified Account">
                  <CheckCircle2 size={12} />
                </div>
              </div>

              <div className="drawer-user-details">
                <div className="user-name-line">
                  <h4 className="user-display-name">{user.name || 'Atelier Client'}</h4>
                  <span className="drawer-tier-pill">
                    <Sparkles size={11} />
                    <span>{user.tier || 'VIP'}</span>
                  </span>
                </div>
                <p className="user-display-email">{user.email || 'Google Account Synced'}</p>
                {user.phone && <p className="user-display-phone">📱 {user.phone}</p>}
                
                <button 
                  type="button" 
                  className="drawer-view-profile-link"
                  onClick={() => handleAction(onOpenProfile, 'orders')}
                >
                  <span>Manage Profile &amp; History</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="drawer-guest-box">
              <div className="guest-intro-row">
                <div className="guest-icon-box">
                  <User size={22} />
                </div>
                <div>
                  <h4 className="guest-title">Guest Shopper</h4>
                  <p className="guest-desc">Sign in with Google to sync your personal bag, favorites &amp; track batch orders.</p>
                </div>
              </div>

              <button 
                type="button" 
                className="drawer-google-signin-btn"
                onClick={() => handleAction(onOpenAuth)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="drawer-scroll-body">
          {/* 1. Core Shopping Actions (Wishlist & Cart as requested in audio) */}
          <div className="drawer-menu-group">
            <span className="drawer-group-title">MY SHOPPING &amp; BAG</span>

            {/* Shopping Bag / Cart */}
            <button 
              type="button" 
              className="drawer-nav-item primary-action"
              onClick={() => handleAction(onOpenCart)}
            >
              <div className="item-icon-circle cart-theme">
                <ShoppingBag size={18} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Shopping Bag / Cart</span>
                <span className="item-sub-desc">
                  {cartCount > 0 ? `${cartCount} items selected • ${formatINR(cartTotal)}` : 'Your bag is empty'}
                </span>
              </div>
              <div className="item-right-badge">
                {cartCount > 0 ? (
                  <span className="badge-count cart-badge">{cartCount}</span>
                ) : (
                  <ChevronRight size={16} className="chevron-muted" />
                )}
              </div>
            </button>

            {/* Wishlist & Favorites */}
            <button 
              type="button" 
              className="drawer-nav-item primary-action"
              onClick={() => handleAction(onOpenWishlist)}
            >
              <div className="item-icon-circle heart-theme">
                <Heart size={18} className={favoritesCount > 0 ? 'heart-filled' : ''} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Wishlist &amp; Favorites</span>
                <span className="item-sub-desc">
                  {favoritesCount > 0 ? `${favoritesCount} saved garments` : 'Save items for later'}
                </span>
              </div>
              <div className="item-right-badge">
                {favoritesCount > 0 ? (
                  <span className="badge-count heart-badge">{favoritesCount}</span>
                ) : (
                  <ChevronRight size={16} className="chevron-muted" />
                )}
              </div>
            </button>
          </div>

          {/* 2. Order History & Settings Tabs (as requested in audio) */}
          <div className="drawer-menu-group">
            <span className="drawer-group-title">ORDERS &amp; CLIENT SETTINGS</span>

            {/* Order History Tab */}
            <button 
              type="button" 
              className="drawer-nav-item"
              onClick={() => handleAction(onOpenProfile, 'orders')}
            >
              <div className="item-icon-circle neutral-theme">
                <Package size={17} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Order History &amp; Batch Status</span>
                <span className="item-sub-desc">Track bundle quotas, UTR approval &amp; dispatch</span>
              </div>
              <ChevronRight size={16} className="chevron-muted" />
            </button>

            {/* Saved Measurements Tab */}
            <button 
              type="button" 
              className="drawer-nav-item"
              onClick={() => handleAction(onOpenProfile, 'measurements')}
            >
              <div className="item-icon-circle neutral-theme">
                <Ruler size={17} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Custom Measurements &amp; Sizing</span>
                <span className="item-sub-desc">Bespoke tailoring, bust, waist &amp; length</span>
              </div>
              <ChevronRight size={16} className="chevron-muted" />
            </button>

            {/* Saved Delivery Addresses Tab */}
            <button 
              type="button" 
              className="drawer-nav-item"
              onClick={() => handleAction(onOpenProfile, 'addresses')}
            >
              <div className="item-icon-circle neutral-theme">
                <MapPin size={17} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Delivery Addresses</span>
                <span className="item-sub-desc">Manage shipping destination &amp; pincode</span>
              </div>
              <ChevronRight size={16} className="chevron-muted" />
            </button>
          </div>

          {/* 3. Indian Season & Festive Collections (Quick Filters) */}
          <div className="drawer-menu-group">
            <span className="drawer-group-title">INDIAN SEASON COLLECTIONS</span>
            <div className="drawer-season-chips-grid">
              {[
                'Navratri Special',
                'Diwali Silk',
                'Wedding Trousseau',
                'Eid Collection',
                'Sarees',
                'Lehengas',
                'Kurtis & Coords',
                'Sherwanis'
              ].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="drawer-season-chip"
                  onClick={() => handleAction(onSelectCategory, cat)}
                >
                  <Sparkles size={11} className="chip-sparkle" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Direct Manufacturer Policies & Trust */}
          <div className="drawer-menu-group">
            <span className="drawer-group-title">MANUFACTURER POLICIES &amp; TRUST</span>

            <button 
              type="button" 
              className="drawer-nav-item policy-item"
              onClick={() => handleAction(onOpenPolicyModal, 'bundle-pooling')}
            >
              <div className="item-icon-circle gold-theme">
                <RotateCcw size={17} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Bundle Pooling &amp; 100% Refund</span>
                <span className="item-sub-desc">Zero deduction full money-back guarantee</span>
              </div>
              <span className="drawer-policy-tag">100% REFUND</span>
            </button>

            <button 
              type="button" 
              className="drawer-nav-item policy-item"
              onClick={() => handleAction(onOpenPolicyModal, 'manufacturer-pricing')}
            >
              <div className="item-icon-circle green-theme">
                <Building2 size={17} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">Direct Surat Mill Pricing</span>
                <span className="item-sub-desc">Wholesale factory rates for 1 or 2 pieces</span>
              </div>
              <ChevronRight size={16} className="chevron-muted" />
            </button>

            <button 
              type="button" 
              className="drawer-nav-item policy-item"
              onClick={() => handleAction(onOpenPolicyModal, 'upi-verification')}
            >
              <div className="item-icon-circle blue-theme">
                <CreditCard size={17} />
              </div>
              <div className="item-text-col">
                <span className="item-main-title">UPI Payment &amp; UTR Guide</span>
                <span className="item-sub-desc">Google Pay, PhonePe, Paytm (9404692375@ybl)</span>
              </div>
              <ChevronRight size={16} className="chevron-muted" />
            </button>
          </div>

          {/* 5. Sign Out Button (if logged in) */}
          {user?.isLoggedIn && (
            <div className="drawer-logout-row">
              <button 
                type="button" 
                className="drawer-logout-btn"
                onClick={() => handleAction(onLogout)}
              >
                <LogOut size={16} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer Information */}
        <footer className="drawer-bottom-footer">
          <div className="footer-location-line">
            <MapPin size={13} />
            <span>Surat Textile Market, Gujarat, India</span>
          </div>
          <div className="footer-support-line">
            <Clock size={13} />
            <span>Concierge: Mon – Sat 9:00 AM – 8:30 PM IST</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
