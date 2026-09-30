import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onSelectDress,
  checkoutPricing
}) {
  // Compute Total Original MRP vs Selling Price
  const totalOriginalMRP = cartItems.reduce((acc, item) => {
    const orig = Number(item.originalPrice) || (Number(item.price) ? Math.round(Number(item.price) * 1.43) : 0);
    return acc + (orig * (Number(item.quantity) || 1));
  }, 0);

  const subtotal = cartItems.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const totalMrpSavings = Math.max(0, totalOriginalMRP - subtotal);
  const mrpDiscountPercentage = totalOriginalMRP > 0 ? Math.round((totalMrpSavings / totalOriginalMRP) * 100) : 30;

  // Seasonal promo code is ALREADY APPLIED based on MRP vs Selling Price percentage
  const defaultPromoCode = `SEASON${mrpDiscountPercentage || 30}`;
  const [promoCode, setPromoCode] = useState(defaultPromoCode);
  const [promoApplied, setPromoApplied] = useState(true);
  const [promoError, setPromoError] = useState('');
  const [extraDiscount, setExtraDiscount] = useState(0);

  useEffect(() => {
    if (!promoCode || promoCode.startsWith('SEASON')) {
      setPromoCode(`SEASON${mrpDiscountPercentage || 30}`);
      setPromoApplied(true);
    }
  }, [mrpDiscountPercentage]);

  const discountedSubtotal = Math.max(0, subtotal - extraDiscount);

  // Dynamic Shipping Configuration
  const isAlwaysFree = Boolean(checkoutPricing?.isFreeShipping);
  const hasThreshold = Boolean(checkoutPricing?.enableFreeShippingThreshold !== false);
  const shippingThreshold = Number(checkoutPricing?.freeShippingThreshold ?? 25000);
  const configuredShippingPrice = Number(checkoutPricing?.shippingPrice ?? 49);

  const freeShipping = isAlwaysFree || (hasThreshold && discountedSubtotal >= shippingThreshold) || discountedSubtotal === 0;
  const shippingCost = freeShipping ? 0 : configuredShippingPrice;
  const amountToFreeShipping = hasThreshold && !isAlwaysFree ? Math.max(0, shippingThreshold - discountedSubtotal) : 0;
  const shippingProgress = hasThreshold && !isAlwaysFree ? Math.min(100, (discountedSubtotal / shippingThreshold) * 100) : 100;

  // CRITICAL: Calculate GST on (Product Price + Shipping Price) as requested
  const gstRate = Number(checkoutPricing?.gstPercentage ?? 5);
  const taxBase = discountedSubtotal + shippingCost;
  const estimatedTax = Math.round(taxBase * (gstRate / 100));
  const total = discountedSubtotal + shippingCost + estimatedTax;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;
    if (cleanCode.startsWith('SEASON') || cleanCode === 'SONEX' || cleanCode === 'SONEX30' || cleanCode === 'SONEXVIP' || cleanCode === 'SEASONSALE') {
      setPromoApplied(true);
      setPromoError('');
    } else if (cleanCode === 'VIP10' || cleanCode === 'EXTRA10') {
      setPromoApplied(true);
      setExtraDiscount(Math.round(subtotal * 0.10));
      setPromoError('');
    } else {
      setPromoError('Promo code not recognized. Seasonal sale discount is already active!');
    }
  };

  // Critical Guard: Do not render drawer if isOpen is false
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={20} className="drawer-title-icon" />
            <h2 className="drawer-title">Shopping Bag</h2>
            <span className="drawer-item-count">({cartItems.reduce((a, b) => a + (Number(b.quantity) || 1), 0)})</span>
          </div>
          <button 
            type="button" 
            className="drawer-close-btn" 
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }} 
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="free-shipping-box">
          <div className="free-shipping-text">
            {isAlwaysFree ? (
              <span className="shipping-qualified">
                <Sparkles size={14} />
                <span><strong>100% Free Express Atelier Delivery</strong> applied to all orders!</span>
              </span>
            ) : freeShipping ? (
              <span className="shipping-qualified">
                <Sparkles size={14} />
                <span>You've unlocked <strong>Free Express Atelier Shipping</strong>!</span>
              </span>
            ) : (
              <span>Add <strong>{formatINR(amountToFreeShipping)}</strong> more for Free Atelier Delivery</span>
            )}
          </div>
          {!isAlwaysFree && (
            <div className="shipping-progress-track">
              <div
                className="shipping-progress-bar"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="drawer-body">
          {cartItems.length > 0 ? (
            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="cart-item-card">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="cart-item-thumb"
                    onClick={() => {
                      onSelectDress(item);
                      onClose();
                    }}
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-title-row">
                      <h4
                        className="cart-item-title"
                        onClick={() => {
                          onSelectDress(item);
                          onClose();
                        }}
                      >
                        {item.title}
                      </h4>
                      <button
                        className="cart-item-remove"
                        onClick={() => onRemoveItem(index)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="cart-item-options">
                      {item.selectedSize && (
                        <span className="opt-chip">Size: {item.selectedSize}</span>
                      )}
                      {item.selectedColor && (
                        <span className="opt-chip">Color: {item.selectedColor}</span>
                      )}
                      {item.material && (
                        <span className="opt-chip material-chip">🧵 {item.material}</span>
                      )}
                    </div>

                    <div className="cart-item-price-quantity">
                      <div className="cart-item-price-col" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span className="cart-item-price">{formatINR((Number(item.price) || 0) * (Number(item.quantity) || 1))}</span>
                        {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                              {formatINR((Number(item.originalPrice) || 0) * (Number(item.quantity) || 1))}
                            </span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>
                              {Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="quantity-stepper">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(index, -1)}
                          disabled={(Number(item.quantity) || 1) <= 1}
                          aria-label="Decrease quantity"
                          title="Decrease quantity by 1"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{Number(item.quantity) || 1}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(index, 1)}
                          aria-label="Increase quantity"
                          title="Increase quantity by 1"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="drawer-empty-state">
              <div className="empty-cart-circle">
                <ShoppingBag size={36} />
              </div>
              <h3>Your shopping bag is empty</h3>
              <p>Explore our seasonal 360° collection to find your next statement dress.</p>
              <button 
                type="button" 
                className="continue-shopping-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClose) onClose();
                }}
              >
                Explore Dresses
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Form - Already Applied based on Original MRP vs Selling Price */}
            <form onSubmit={handleApplyPromo} className="promo-code-form">
              <div
                className={`promo-input-group ${promoApplied ? 'is-applied' : ''}`}
                style={promoApplied ? {
                  background: '#f0fdf4',
                  borderColor: '#86efac',
                  borderWidth: '1.5px'
                } : {}}
              >
                <Tag size={16} className="promo-icon" color={promoApplied ? '#059669' : undefined} />
                <input
                  type="text"
                  placeholder={`Promo code (SEASON${mrpDiscountPercentage || 30})`}
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    if (promoError) setPromoError('');
                  }}
                  className="promo-input"
                  style={promoApplied ? { color: '#065f46', fontWeight: 700, letterSpacing: '0.5px' } : {}}
                />
                <button
                  type="submit"
                  className="promo-submit-btn"
                  style={promoApplied ? {
                    color: '#047857',
                    background: '#dcfce7',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700,
                    border: '1px solid #bbf7d0'
                  } : {}}
                >
                  {promoApplied ? (
                    <>
                      <Check size={13} color="#059669" />
                      <span>Applied</span>
                    </>
                  ) : 'Apply'}
                </button>
              </div>

              {promoError && <p className="promo-error">{promoError}</p>}

              {promoApplied && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  color: '#047857',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Sparkles size={13} color="#059669" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>{mrpDiscountPercentage}% Seasonal Discount Already Applied</strong> ({formatINR(totalMrpSavings)} saved on MRP).
                  </span>
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="cart-totals-breakdown">
              <div className="total-row" style={{ color: '#64748b' }}>
                <span>Total Original MRP</span>
                <span style={{ textDecoration: 'line-through' }}>{formatINR(totalOriginalMRP)}</span>
              </div>
              <div className="total-row discount-row" style={{ color: '#059669' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="#059669" />
                  <span>Season Sale Discount ({mrpDiscountPercentage}% OFF)</span>
                </span>
                <span style={{ fontWeight: 700 }}>Already Applied (-{formatINR(totalMrpSavings)})</span>
              </div>
              {extraDiscount > 0 && (
                <div className="total-row discount-row" style={{ color: '#059669' }}>
                  <span>Extra Promo Voucher</span>
                  <span>-{formatINR(extraDiscount)}</span>
                </div>
              )}
              <div className="total-row" style={{ fontWeight: 600 }}>
                <span>Subtotal (Sale Price)</span>
                <span>{formatINR(discountedSubtotal)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{freeShipping ? 'FREE' : formatINR(shippingCost)}</span>
              </div>
              <div className="total-row">
                <span>Estimated GST ({gstRate}%)</span>
                <span>{formatINR(estimatedTax)}</span>
              </div>
              <div className="total-row final-total-row">
                <span>Estimated Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            {totalMrpSavings > 0 && (
              <div style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#047857',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} color="#059669" />
                <span>You save {formatINR(totalMrpSavings + extraDiscount)} ({mrpDiscountPercentage}% OFF) on this order!</span>
              </div>
            )}

            {/* Checkout Button */}
            <button className="checkout-btn" onClick={onCheckout}>
              <span>Proceed to Checkout • {formatINR(total)}</span>
              <ArrowRight size={18} />
            </button>

            <div className="checkout-security-tag">
              <ShieldCheck size={14} />
              <span>Encrypted 256-Bit SSL Atelier Checkout</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
