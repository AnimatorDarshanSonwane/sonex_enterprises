import React from 'react';
import { X, Heart, ShoppingBag, RotateCw, Trash2, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function WishlistDrawer({
  isOpen,
  onClose,
  favoriteDresses = [],
  onRemoveFavorite,
  onAddToCart,
  onSelectDress
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Heart size={20} className="drawer-title-icon heart-icon-rose" fill="#f43f5e" color="#f43f5e" />
            <h2 className="drawer-title">Wishlist &amp; Saved</h2>
            <span className="drawer-item-count">({favoriteDresses.length})</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close wishlist">
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="drawer-body">
          {favoriteDresses.length > 0 ? (
            <div className="wishlist-items-list">
              {favoriteDresses.map((dress) => (
                <div key={dress.id} className="wishlist-item-card">
                  <div 
                    className="wishlist-item-media"
                    onClick={() => {
                      onSelectDress(dress);
                      onClose();
                    }}
                  >
                    <img src={dress.image} alt={dress.title} className="wishlist-item-img" />
                    <span className="wishlist-360-tag">
                      <RotateCw size={11} />
                      <span>360°</span>
                    </span>
                  </div>

                  <div className="wishlist-item-info">
                    <div className="wishlist-info-top">
                      <div className="wishlist-meta-group">
                        <span className="wishlist-category">{dress.category}</span>
                        {dress.material && (
                          <span className="wishlist-material-tag" title={`Fabric: ${dress.material}`}>
                            🧵 {dress.material}
                          </span>
                        )}
                      </div>
                      <button 
                        className="wishlist-remove-btn"
                        onClick={() => onRemoveFavorite(dress)}
                        title="Remove from favorites"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h4 
                      className="wishlist-title"
                      onClick={() => {
                        onSelectDress(dress);
                        onClose();
                      }}
                    >
                      {dress.title}
                    </h4>

                    <div className="wishlist-price-row">
                      <span className="current-price">{formatINR(dress.price)}</span>
                      {dress.originalPrice && (
                        <span className="original-price">{formatINR(dress.originalPrice)}</span>
                      )}
                      {dress.discount && (
                        <span className="discount-pill">{dress.discount}</span>
                      )}
                    </div>

                    <div className="wishlist-actions-row">
                      <button
                        className="wishlist-add-bag-btn"
                        onClick={() => {
                          onAddToCart(dress);
                        }}
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Bag</span>
                      </button>

                      <button
                        className="wishlist-preview-btn"
                        onClick={() => {
                          onSelectDress(dress);
                          onClose();
                        }}
                      >
                        <RotateCw size={13} />
                        <span>View 360°</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="drawer-empty-state">
              <div className="empty-cart-circle">
                <Heart size={36} color="#94a3b8" />
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Save your favorite dresses while exploring our 360° runway collection to view them later.</p>
              <button className="continue-shopping-btn" onClick={onClose}>
                Explore Collection
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {favoriteDresses.length > 0 && (
          <div className="drawer-footer">
            <button 
              className="checkout-btn"
              onClick={() => {
                // Add all to cart
                favoriteDresses.forEach(d => onAddToCart(d));
              }}
            >
              <span>Add All to Shopping Bag</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
