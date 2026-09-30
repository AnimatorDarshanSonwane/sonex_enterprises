import React from 'react';
import { Heart, ShoppingBag, Eye, RotateCw, Star, Flame, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function DressCard({
  dress,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  onSelectDress
}) {
  const stockCount = dress.stock !== undefined && dress.stock !== null && !isNaN(dress.stock) 
    ? Math.max(0, Number(dress.stock)) 
    : 10;
  const isOutOfStock = stockCount === 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(dress);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(dress);
  };

  return (
    <article 
      className={`dress-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
      onClick={() => onSelectDress(dress)}
      tabIndex={0}
      role="button"
      aria-label={`View 360 preview of ${dress.title}`}
    >
      {/* Media Image Showcase Container */}
      <div className="dress-card-media">
        <img 
          src={dress.image || '/dresses/dress_1.jpg'} 
          alt={dress.title} 
          className="dress-card-img" 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/dresses/dress_1.jpg';
          }}
        />

        {/* 360 Turnaround Interactive Floating Badge */}
        <div className="dress-360-badge">
          <RotateCw size={13} className="spin-on-hover" />
          <span>360° INTERACTIVE</span>
        </div>

        {/* Discount Badge */}
        {dress.discount && (
          <div className="dress-discount-badge">
            {dress.discount}
          </div>
        )}

        {/* Sold Out Overlay Badge on Media if stock is 0 */}
        {isOutOfStock && (
          <div className="dress-sold-out-overlay">
            <span>SOLD OUT</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          className={`dress-card-fav-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart size={18} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : '#64748b'} />
        </button>

        {/* Quick Hover Overlay */}
        <div className="card-hover-overlay">
          <span className="hover-cta-pill">
            <Eye size={15} />
            <span>Open 360° Fitting</span>
          </span>
        </div>
      </div>

      {/* Dress Information & Pricing */}
      <div className="dress-card-content">
        <div className="dress-card-meta-row">
          <div className="dress-meta-left">
            <span className="dress-category-tag">{dress.category}</span>
            {dress.material && (
              <span className="dress-material-tag" title={`Fabric Material: ${dress.material}`}>
                🧵 {dress.material}
              </span>
            )}
          </div>
          <div className="dress-rating">
            <Star size={13} className="star-filled" />
            <span className="rating-val">{dress.rating}</span>
            <span className="rating-count">({dress.reviewCount})</span>
          </div>
        </div>

        <h3 className="dress-card-title">{dress.title}</h3>
        <p className="dress-card-desc">{dress.description}</p>

        {/* Colors Available preview */}
        {dress.colors && dress.colors.length > 0 && (
          <div className="dress-colors-preview">
            {dress.colors.map((c, i) => (
              <span 
                key={i} 
                className="color-dot" 
                style={{ backgroundColor: c.hex }} 
                title={c.name}
              />
            ))}
            <span className="color-count-label">+{dress.colors.length} shades</span>
          </div>
        )}

        {/* Remaining Stock Counter (Adjustable via Admin Portal) */}
        <div className={`dress-stock-strip ${isOutOfStock ? 'is-out' : isLowStock ? 'is-low' : 'is-available'}`}>
          {isOutOfStock ? (
            <>
              <span className="stock-dot out" />
              <span className="stock-text">
                <strong className="stock-highlight out">Sold Out</strong> (0 remaining)
              </span>
            </>
          ) : isLowStock ? (
            <>
              <Flame size={13} className="stock-flame" />
              <span className="stock-text">
                Only <strong className="stock-highlight low">{stockCount} left</strong> in stock!
              </span>
            </>
          ) : (
            <>
              <span className="stock-dot in" />
              <span className="stock-text">
                Remaining Stock: <strong className="stock-highlight ok">{stockCount} units</strong>
              </span>
            </>
          )}
        </div>

        {/* Pricing Row & Actions */}
        <div className="dress-card-footer">
          <div className="dress-price-box">
            <span className="current-price">{formatINR(dress.price)}</span>
            {dress.originalPrice && (
              <span className="original-price">{formatINR(dress.originalPrice)}</span>
            )}
          </div>

          <div className="card-actions-group">
            <button
              className={`quick-cart-btn ${isOutOfStock ? 'disabled-sold-out' : ''}`}
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              title={isOutOfStock ? 'Currently out of stock' : 'Add dress to cart'}
              aria-label={isOutOfStock ? 'Sold Out' : 'Add to cart'}
            >
              <ShoppingBag size={16} />
              <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
            </button>

            <button
              className="preview-360-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectDress(dress);
              }}
              title="Launch 360 Interactive Model Viewer"
            >
              <RotateCw size={15} />
              <span>360°</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
