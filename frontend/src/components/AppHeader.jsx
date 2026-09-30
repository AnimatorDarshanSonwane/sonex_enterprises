import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Heart, 
  ShoppingBag, 
  User, 
  Sparkles, 
  Compass,
  ArrowRight,
  Menu
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import SonexBrandLogo from './SonexBrandLogo';
import MobileAppDrawer from './MobileAppDrawer';

export default function AppHeader({
  searchQuery,
  setSearchQuery,
  user = null,
  favoritesCount = 0,
  cartCount = 0,
  cartTotal = 0,
  onOpenWishlist,
  onOpenCart,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  onSelectCategory,
  onOpenPolicyModal,
  onLogoClick
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="appbar-header">
        <div className="appbar-inner">
          {/* Brand Logo / Identity */}
          <SonexBrandLogo 
            size="md" 
            subtitle="DIRECT MANUFACTURER & ATELIER" 
            onClick={onLogoClick} 
            className="appbar-brand"
          />

          {/* Global Item Search Bar */}
          <div className="appbar-search-wrapper">
            <div className="appbar-search-input-box">
              <Search size={18} className="search-icon-lens" />
              <input
                type="text"
                className="appbar-search-input"
                placeholder="Search dresses, silks, sarees, lehengas, sherwanis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button"
                  className="search-clear-btn" 
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Desktop-Only Action Buttons (Wishlist, Cart, Profile) */}
          <div className="appbar-actions appbar-actions-desktop">
            {/* Wishlist / Favorite Button */}
            <button 
              type="button"
              className="appbar-action-btn wishlist-btn" 
              onClick={onOpenWishlist}
              title="View Wishlist & Saved Dresses"
              aria-label="Wishlist"
            >
              <div className="btn-icon-wrapper">
                <Heart size={20} className={favoritesCount > 0 ? 'heart-active-fill' : ''} />
                {favoritesCount > 0 && (
                  <span className="action-badge-counter badge-favorite">{favoritesCount}</span>
                )}
              </div>
              <span className="action-btn-text">Wishlist</span>
            </button>

            {/* Add to Cart / Cart Button */}
            <button 
              type="button"
              className="appbar-action-btn cart-btn" 
              onClick={onOpenCart}
              title="View Shopping Cart & Checkout"
              aria-label="Shopping Cart"
            >
              <div className="btn-icon-wrapper">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="action-badge-counter badge-cart">{cartCount}</span>
                )}
              </div>
              <div className="cart-btn-label-group">
                <span className="action-btn-text">Cart</span>
                {cartCount > 0 && (
                  <span className="cart-quick-total">{formatINR(cartTotal)}</span>
                )}
              </div>
            </button>

            {/* Profile Button */}
            <button 
              type="button"
              className="appbar-action-btn profile-btn" 
              onClick={() => onOpenProfile && onOpenProfile('orders')}
              title={user?.isLoggedIn ? `Account (${user.email || user.name})` : 'Sign In with Google'}
              aria-label="Account Profile"
            >
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name || 'User'} 
                  className="header-avatar-thumb"
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #d4af37' }} 
                />
              ) : (
                <div className="profile-avatar-circle">
                  <User size={18} />
                  <span className={`profile-status-dot ${user?.isLoggedIn ? 'is-logged-in' : ''}`} />
                </div>
              )}
              <span className="action-btn-text profile-name-label">
                {user?.isLoggedIn ? (user.name ? user.name.split(' ')[0] : 'Account') : 'Sign In'}
              </span>
            </button>
          </div>

          {/* Tablet & Mobile Hamburger Button (3 Horizontal Lines) */}
          <button 
            type="button"
            className="appbar-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            title="Navigation Menu"
          >
            <div className="hamburger-icon-lines">
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </div>
            {(favoritesCount > 0 || cartCount > 0) && (
              <span className="hamburger-badge-dot">
                {favoritesCount + cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* App-Style Mobile/Tablet Slide-Out Navigation Drawer */}
      <MobileAppDrawer 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        favoritesCount={favoritesCount}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenWishlist={onOpenWishlist}
        onOpenCart={onOpenCart}
        onOpenProfile={onOpenProfile}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
        onSelectCategory={onSelectCategory}
        onOpenPolicyModal={onOpenPolicyModal}
      />
    </>
  );
}
