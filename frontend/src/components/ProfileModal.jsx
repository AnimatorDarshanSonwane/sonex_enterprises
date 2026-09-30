import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Package, 
  Award, 
  Ruler, 
  MapPin, 
  Settings, 
  LogOut, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  PhoneCall, 
  ArrowRight,
  Eye,
  Check,
  Edit3,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { formatINR } from '../utils/currency';

const DEFAULT_MEASUREMENTS = {
  bust: 34,
  waist: 26,
  hips: 36,
  heightFeet: 5,
  heightInches: 9,
  recommendedSize: 'M',
  recommendedLabel: 'Size M (US 6 / UK 10)'
};

const SIZE_PRESETS = [
  { size: 'S', label: 'Size S (US 4)', bust: 32, waist: 24, hips: 34, heightFeet: 5, heightInches: 6 },
  { size: 'M', label: 'Size M (US 6)', bust: 34, waist: 26, hips: 36, heightFeet: 5, heightInches: 7 },
  { size: 'L', label: 'Size L (US 8)', bust: 36, waist: 28, hips: 38, heightFeet: 5, heightInches: 8 },
  { size: 'XL', label: 'Size XL (US 10)', bust: 38, waist: 30, hips: 40, heightFeet: 5, heightInches: 9 },
  { size: 'XXL', label: 'Size XXL (US 12)', bust: 41, waist: 33, hips: 43, heightFeet: 5, heightInches: 9 },
  { size: 'XXXL', label: 'Size XXXL (US 14)', bust: 44, waist: 36, hips: 46, heightFeet: 5, heightInches: 9 }
];

function calculateRecommendedSize(bustVal, waistVal, hipsVal) {
  const bust = Number(bustVal) || 34;
  const waist = Number(waistVal) || 26;
  const hips = Number(hipsVal) || 36;
  
  if (bust <= 33 && waist <= 25 && hips <= 35) {
    return { size: 'S', label: 'Size S (US 4 / UK 8)' };
  } else if (bust <= 35 && waist <= 27 && hips <= 38) {
    return { size: 'M', label: 'Size M (US 6 / UK 10)' };
  } else if (bust <= 38 && waist <= 30 && hips <= 41) {
    return { size: 'L', label: 'Size L (US 8 / UK 12)' };
  } else if (bust <= 41 && waist <= 33 && hips <= 44) {
    return { size: 'XL', label: 'Size XL (US 10 / UK 14)' };
  } else if (bust <= 44 && waist <= 36 && hips <= 47) {
    return { size: 'XXL', label: 'Size XXL (US 12 / UK 16)' };
  } else {
    return { size: 'XXXL', label: 'Size XXXL (US 14 / UK 18)' };
  }
}

function formatOrderItemsText(items) {
  if (!items) return 'Haute Couture Ensemble';
  if (typeof items === 'string') return items;
  if (Array.isArray(items)) {
    return items.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const title = item.title || 'Haute Couture Ensemble';
        const specs = [
          item.selectedSize ? `Size: ${item.selectedSize}` : null,
          item.selectedColor ? `Color: ${item.selectedColor}` : null,
          item.quantity ? `x${item.quantity}` : null
        ].filter(Boolean).join(', ');
        return specs ? `${title} (${specs})` : title;
      }
      return String(item);
    }).join('; ');
  }
  return String(items);
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  orders = [],
  initialTab = 'orders',
  onOpenUtrModal,
  onVerifyOrderAdmin,
  onLogout,
  onUpdateUser
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'orders');

  // 360 Custom Fitting Measurements State
  const [measurements, setMeasurements] = useState(() => {
    if (user?.measurements) {
      return { ...DEFAULT_MEASUREMENTS, ...user.measurements };
    }
    try {
      const saved = localStorage.getItem('sonex_measurements');
      if (saved) {
        return { ...DEFAULT_MEASUREMENTS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_MEASUREMENTS;
  });

  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [editForm, setEditForm] = useState(measurements);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  useEffect(() => {
    if (user?.measurements) {
      setMeasurements({ ...DEFAULT_MEASUREMENTS, ...user.measurements });
      setEditForm({ ...DEFAULT_MEASUREMENTS, ...user.measurements });
    }
  }, [user?.measurements]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'orders');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close profile">
          <X size={20} />
        </button>

        {/* Profile Header Banner */}
        <div className="profile-hero-banner">
          <div className="profile-avatar-large">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user?.name || 'Client Avatar'} 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <span className="avatar-initials">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : (user?.email ? user.email.slice(0, 2).toUpperCase() : 'SX')}
              </span>
            )}
            <div className="avatar-verified-badge" title="Google Verified Account">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="profile-meta-col">
            <div className="profile-name-row">
              <h3 className="profile-user-name">
                {user?.name || (user?.email ? user.email.split('@')[0] : 'Atelier Client')}
              </h3>
              <span className="profile-tier-badge">
                <Sparkles size={12} />
                <span>{user?.tier || 'VIP Atelier Member'}</span>
              </span>
            </div>
            <p className="profile-user-email">
              {user?.email && <span>{user.email}</span>}
              {user?.phone ? (
                <span> • Mobile: <strong>{user.phone}</strong></span>
              ) : (
                <span style={{ color: '#d97706', fontSize: '11px', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', fontWeight: 600 }}>
                  10-digit mobile required at checkout
                </span>
              )}
            </p>
            <div className="profile-points-pill">
              <Award size={13} />
              <span><strong>{user?.points || 2850}</strong> Sonex Rewards Points (₹12,000 credit)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs-nav">
          <button 
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} />
            <span>Order History ({orders.length})</span>
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'measurements' ? 'active' : ''}`}
            onClick={() => setActiveTab('measurements')}
          >
            <Ruler size={16} />
            <span>Saved Measurements</span>
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={16} />
            <span>Delivery Addresses</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-body">
          {activeTab === 'orders' && (
            <div className="orders-tab-content">
              <div className="orders-header-row">
                <h4 className="tab-section-title">Your Haute Couture Orders</h4>
                <span className="orders-badge-count">{orders.length} total</span>
              </div>

              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((ord) => {
                    const isPending = ord.status === 'pending_payment';
                    const isUtrSubmitted = ord.status === 'utr_submitted';
                    const isConfirmed = ord.status === 'confirmed' || ord.status === 'Delivered';
                    const isCancelled = ord.status === 'cancelled';

                    return (
                      <div key={ord.id} className="order-history-card">
                        {/* Order Header */}
                        <div className="order-card-header">
                          <div>
                            <span className="order-id">{ord.id}</span>
                            <span className="order-date">• {ord.date}</span>
                          </div>

                          {/* Dynamic Status Badges */}
                          <div className="order-status-group">
                            {isPending && (
                              <span className="order-status-badge status-pending">
                                <Clock size={12} />
                                <span>PENDING PAYMENT</span>
                              </span>
                            )}
                            {isUtrSubmitted && (
                              <span className="order-status-badge status-verifying">
                                <FileCheck size={12} />
                                <span>UTR VERIFYING</span>
                              </span>
                            )}
                            {isConfirmed && (
                              <span className="order-status-badge status-confirmed">
                                <CheckCircle2 size={12} />
                                <span>CONFIRMED &amp; TAILORING</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className="order-status-badge status-cancelled">
                                <span>EXPIRED / CANCELLED</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Body */}
                        <div className="order-card-body">
                          {Array.isArray(ord.itemsList) && ord.itemsList.length > 0 ? (
                            <div className="order-items-list-compact">
                              {ord.itemsList.map((item, idx) => (
                                <div key={item.id ? `${item.id}-${idx}` : idx} className="order-item-compact-row">
                                  <span className="order-item-title-text">{item.title || 'Haute Couture Ensemble'}</span>
                                  <div className="order-item-chips">
                                    {item.selectedSize && <span className="order-spec-chip">Size: {item.selectedSize}</span>}
                                    {item.selectedColor && <span className="order-spec-chip">Color: {item.selectedColor}</span>}
                                    {item.material && <span className="order-spec-chip order-spec-material">🧵 {item.material}</span>}
                                    <span className="order-spec-chip order-chip-qty">Qty: {item.quantity || 1}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : Array.isArray(ord.items) && ord.items.some(i => typeof i === 'object') ? (
                            <div className="order-items-list-compact">
                              {ord.items.map((item, idx) => {
                                if (typeof item === 'object' && item !== null) {
                                  return (
                                    <div key={item.id ? `${item.id}-${idx}` : idx} className="order-item-compact-row">
                                      <span className="order-item-title-text">{item.title || 'Haute Couture Ensemble'}</span>
                                      <div className="order-item-chips">
                                        {item.selectedSize && <span className="order-spec-chip">Size: {item.selectedSize}</span>}
                                        {item.selectedColor && <span className="order-spec-chip">Color: {item.selectedColor}</span>}
                                        {item.material && <span className="order-spec-chip order-spec-material">🧵 {item.material}</span>}
                                        <span className="order-spec-chip order-chip-qty">Qty: {item.quantity || 1}</span>
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <p key={idx} className="order-items-text">{String(item)}</p>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="order-items-text">
                              {typeof ord.items === 'string' ? ord.items : formatOrderItemsText(ord.items)}
                            </p>
                          )}

                          <div className="order-pricing-row">
                            <span className="order-total-price">Total: {ord.total || (ord.totalRaw ? formatINR(ord.totalRaw) : '₹0')}</span>
                            {ord.address && (
                              <span className="order-dest-text">Deliver to: {ord.address}</span>
                            )}
                          </div>

                          {/* Concierge Call Notice */}
                          <div className="order-call-status-notice">
                            <PhoneCall size={13} className="notice-icon-call" />
                            <span>
                              <strong>Atelier Verification Call:</strong> Our executive will call <strong>{ord.phone || user?.phone}</strong> to confirm fitting.
                            </span>
                          </div>

                          {/* State 1: PENDING PAYMENT (Needs UTR within 5 days) */}
                          {isPending && (
                            <div className="order-pending-action-box">
                              <div className="pending-warning-text">
                                <AlertCircle size={14} color="#d97706" />
                                <span>
                                  <strong>Payment Deadline:</strong> Submit payment within <strong>5 days</strong> (before {ord.expiryDate || 'expiry'}) or order will auto-cancel.
                                </span>
                              </div>
                              <button 
                                className="order-submit-utr-btn"
                                onClick={() => onOpenUtrModal(ord)}
                              >
                                <FileCheck size={14} />
                                <span>Submit UTR &amp; Payment Screenshot</span>
                              </button>
                            </div>
                          )}

                          {/* State 2: UTR SUBMITTED (Verification in Progress) */}
                          {isUtrSubmitted && (
                            <div className="order-utr-submitted-box">
                              <div className="utr-ref-details">
                                <span className="utr-ref-label">Submitted UTR Reference:</span>
                                <strong className="utr-ref-val">{ord.utrNumber || '426819028491'}</strong>
                                <span className="utr-sub-date">Submitted: {ord.submittedAt || ord.date}</span>
                              </div>

                              {ord.screenshotUrl && (
                                <div className="utr-proof-thumb-wrap">
                                  <img src={ord.screenshotUrl} alt="Payment Receipt" className="proof-mini-img" />
                                  <span className="proof-attached-tag">
                                    <Check size={11} /> Screenshot Attached
                                  </span>
                                </div>
                              )}

                              <p className="utr-verifying-note">
                                Our accounts department is matching the transaction reference with our bank ledger. Upon confirmation, tailoring starts immediately.
                              </p>

                              {/* Admin Simulator Button for Manual Testing */}
                              {onVerifyOrderAdmin && (
                                <button 
                                  className="admin-verify-test-btn"
                                  onClick={() => onVerifyOrderAdmin(ord.id)}
                                  title="Manual Testing Action: Confirm order as bank verified"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>[Admin Test Action] Verify &amp; Confirm Payment</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* State 3: CONFIRMED */}
                          {isConfirmed && (
                            <div className="order-confirmed-box">
                              <CheckCircle2 size={15} color="#059669" />
                              <span>Payment Verified via UTR. Garment in bespoke cutting &amp; atelier fitting.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-orders-view">
                  <Package size={36} color="#94a3b8" />
                  <p>You have not placed any couture orders yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'measurements' && (() => {
            const bustCm = Math.round(Number(measurements.bust) * 2.54);
            const waistCm = Math.round(Number(measurements.waist) * 2.54);
            const hipsCm = Math.round(Number(measurements.hips) * 2.54);
            const heightCm = Math.round((Number(measurements.heightFeet) * 12 + Number(measurements.heightInches)) * 2.54);
            const currentRec = calculateRecommendedSize(measurements.bust, measurements.waist, measurements.hips);

            const editBustCm = Math.round(Number(editForm.bust) * 2.54);
            const editWaistCm = Math.round(Number(editForm.waist) * 2.54);
            const editHipsCm = Math.round(Number(editForm.hips) * 2.54);
            const editHeightCm = Math.round((Number(editForm.heightFeet) * 12 + Number(editForm.heightInches)) * 2.54);
            const editRec = calculateRecommendedSize(editForm.bust, editForm.waist, editForm.hips);

            const handleSave = () => {
              const rec = calculateRecommendedSize(editForm.bust, editForm.waist, editForm.hips);
              const updated = {
                bust: Number(editForm.bust) || 34,
                waist: Number(editForm.waist) || 26,
                hips: Number(editForm.hips) || 36,
                heightFeet: Number(editForm.heightFeet) || 5,
                heightInches: Number(editForm.heightInches) || 9,
                bustCm: Math.round(Number(editForm.bust) * 2.54),
                waistCm: Math.round(Number(editForm.waist) * 2.54),
                hipsCm: Math.round(Number(editForm.hips) * 2.54),
                heightCm: Math.round((Number(editForm.heightFeet) * 12 + Number(editForm.heightInches)) * 2.54),
                recommendedSize: rec.size,
                recommendedLabel: rec.label,
                updatedAt: new Date().toISOString()
              };
              
              setMeasurements(updated);
              setIsEditingMeasurements(false);
              setSaveSuccessMsg(true);
              setTimeout(() => setSaveSuccessMsg(false), 4000);

              try {
                localStorage.setItem('sonex_measurements', JSON.stringify(updated));
                const currentUserStr = localStorage.getItem('atelier_user');
                const currentUser = currentUserStr ? JSON.parse(currentUserStr) : {};
                const updatedUser = {
                  ...(user || currentUser),
                  measurements: updated
                };
                localStorage.setItem('atelier_user', JSON.stringify(updatedUser));
                if (updatedUser.uid) {
                  localStorage.setItem(`sonex_profile_${updatedUser.uid}`, JSON.stringify(updatedUser));
                }
                if (onUpdateUser) {
                  onUpdateUser(updatedUser);
                }
              } catch (e) {
                console.warn('Failed saving measurements:', e);
              }
            };

            return (
              <div className="measurements-tab-content">
                <div className="tab-section-header-row">
                  <div>
                    <h4 className="tab-section-title">Saved 360° Custom Fitting Profile</h4>
                    <p className="tab-subtitle">These measurements automatically highlight your recommended dress size across our 360° showroom.</p>
                  </div>
                  {!isEditingMeasurements ? (
                    <button
                      type="button"
                      className="btn-edit-measurements-trigger"
                      onClick={() => {
                        setEditForm(measurements);
                        setIsEditingMeasurements(true);
                        setSaveSuccessMsg(false);
                      }}
                      title="Edit body measurements"
                    >
                      <Edit3 size={14} />
                      <span>Edit Measurements</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={() => setIsEditingMeasurements(false)}
                      title="Cancel editing"
                    >
                      <X size={14} />
                      <span>Close Editor</span>
                    </button>
                  )}
                </div>

                {/* Save Feedback Banner */}
                {saveSuccessMsg && (
                  <div className="measurements-saved-banner">
                    <CheckCircle2 size={16} />
                    <span>Fit Profile updated successfully! Recommended fit calibrated to <strong>Size {measurements.recommendedSize || currentRec.size}</strong>.</span>
                  </div>
                )}

                {/* VIEW MODE: 4 Sleek Measurement Cards */}
                {!isEditingMeasurements ? (
                  <>
                    <div className="measurements-grid">
                      <div
                        className="measurement-box interactive-box"
                        onClick={() => {
                          setEditForm(measurements);
                          setIsEditingMeasurements(true);
                        }}
                        title="Click to edit Bust measurement"
                      >
                        <div className="box-header-row">
                          <span className="m-label">Bust</span>
                          <span className="edit-pill-hint">Edit</span>
                        </div>
                        <span className="m-value">{measurements.bust} in / {bustCm} cm</span>
                      </div>

                      <div
                        className="measurement-box interactive-box"
                        onClick={() => {
                          setEditForm(measurements);
                          setIsEditingMeasurements(true);
                        }}
                        title="Click to edit Waist measurement"
                      >
                        <div className="box-header-row">
                          <span className="m-label">Waist</span>
                          <span className="edit-pill-hint">Edit</span>
                        </div>
                        <span className="m-value">{measurements.waist} in / {waistCm} cm</span>
                      </div>

                      <div
                        className="measurement-box interactive-box"
                        onClick={() => {
                          setEditForm(measurements);
                          setIsEditingMeasurements(true);
                        }}
                        title="Click to edit Hips measurement"
                      >
                        <div className="box-header-row">
                          <span className="m-label">Hips</span>
                          <span className="edit-pill-hint">Edit</span>
                        </div>
                        <span className="m-value">{measurements.hips} in / {hipsCm} cm</span>
                      </div>

                      <div
                        className="measurement-box interactive-box"
                        onClick={() => {
                          setEditForm(measurements);
                          setIsEditingMeasurements(true);
                        }}
                        title="Click to edit Height measurement"
                      >
                        <div className="box-header-row">
                          <span className="m-label">Height</span>
                          <span className="edit-pill-hint">Edit</span>
                        </div>
                        <span className="m-value">{measurements.heightFeet}'{measurements.heightInches}" / {heightCm} cm</span>
                      </div>
                    </div>

                    <div className="recommended-size-callout">
                      <CheckCircle2 size={16} />
                      <span>Your optimal atelier fit is <strong>{measurements.recommendedLabel || currentRec.label}</strong></span>
                    </div>
                  </>
                ) : (
                  /* EDIT MODE: Interactive Steppers, Direct Numeric Inputs & Quick Size Presets */
                  <div className="measurements-edit-container">
                    {/* Quick Standard Size Presets */}
                    <div className="size-preset-picker-row">
                      <span className="preset-label">Standard Size Presets:</span>
                      <div className="preset-chips">
                        {SIZE_PRESETS.map((preset) => (
                          <button
                            key={preset.size}
                            type="button"
                            className={`preset-size-pill ${editRec.size === preset.size ? 'active' : ''}`}
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                bust: preset.bust,
                                waist: preset.waist,
                                hips: preset.hips,
                                heightFeet: preset.heightFeet,
                                heightInches: preset.heightInches
                              });
                            }}
                          >
                            Size {preset.size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* The 4 Editable Measurement Boxes */}
                    <div className="measurements-grid editing">
                      {/* Bust */}
                      <div className="measurement-box edit-mode">
                        <label className="m-label" htmlFor="edit-bust">Bust (Inches)</label>
                        <div className="stepper-input-row">
                          <button 
                            type="button" 
                            className="stepper-btn"
                            onClick={() => setEditForm(prev => ({ ...prev, bust: Math.max(20, (Number(prev.bust) || 34) - 1) }))}
                            aria-label="Decrease bust"
                          >-</button>
                          <input
                            id="edit-bust"
                            type="number"
                            min="20"
                            max="65"
                            step="0.5"
                            className="m-input"
                            value={editForm.bust}
                            onChange={(e) => setEditForm({ ...editForm, bust: e.target.value })}
                          />
                          <button 
                            type="button" 
                            className="stepper-btn"
                            onClick={() => setEditForm(prev => ({ ...prev, bust: Math.min(65, (Number(prev.bust) || 34) + 1) }))}
                            aria-label="Increase bust"
                          >+</button>
                        </div>
                        <span className="m-subtext">≈ {editBustCm} cm</span>
                      </div>

                      {/* Waist */}
                      <div className="measurement-box edit-mode">
                        <label className="m-label" htmlFor="edit-waist">Waist (Inches)</label>
                        <div className="stepper-input-row">
                          <button 
                            type="button" 
                            className="stepper-btn"
                            onClick={() => setEditForm(prev => ({ ...prev, waist: Math.max(18, (Number(prev.waist) || 26) - 1) }))}
                            aria-label="Decrease waist"
                          >-</button>
                          <input
                            id="edit-waist"
                            type="number"
                            min="18"
                            max="60"
                            step="0.5"
                            className="m-input"
                            value={editForm.waist}
                            onChange={(e) => setEditForm({ ...editForm, waist: e.target.value })}
                          />
                          <button 
                            type="button" 
                            className="stepper-btn"
                            onClick={() => setEditForm(prev => ({ ...prev, waist: Math.min(60, (Number(prev.waist) || 26) + 1) }))}
                            aria-label="Increase waist"
                          >+</button>
                        </div>
                        <span className="m-subtext">≈ {editWaistCm} cm</span>
                      </div>

                      {/* Hips */}
                      <div className="measurement-box edit-mode">
                        <label className="m-label" htmlFor="edit-hips">Hips (Inches)</label>
                        <div className="stepper-input-row">
                          <button 
                            type="button" 
                            className="stepper-btn"
                            onClick={() => setEditForm(prev => ({ ...prev, hips: Math.max(22, (Number(prev.hips) || 36) - 1) }))}
                            aria-label="Decrease hips"
                          >-</button>
                          <input
                            id="edit-hips"
                            type="number"
                            min="22"
                            max="70"
                            step="0.5"
                            className="m-input"
                            value={editForm.hips}
                            onChange={(e) => setEditForm({ ...editForm, hips: e.target.value })}
                          />
                          <button 
                            type="button" 
                            className="stepper-btn"
                            onClick={() => setEditForm(prev => ({ ...prev, hips: Math.min(70, (Number(prev.hips) || 36) + 1) }))}
                            aria-label="Increase hips"
                          >+</button>
                        </div>
                        <span className="m-subtext">≈ {editHipsCm} cm</span>
                      </div>

                      {/* Height */}
                      <div className="measurement-box edit-mode">
                        <label className="m-label">Height (Ft / In)</label>
                        <div className="height-input-dual-row">
                          <div className="height-field">
                            <input
                              type="number"
                              min="4"
                              max="7"
                              className="m-input-compact"
                              value={editForm.heightFeet}
                              onChange={(e) => setEditForm({ ...editForm, heightFeet: e.target.value })}
                              aria-label="Height feet"
                            />
                            <span className="unit-label">ft</span>
                          </div>
                          <div className="height-field">
                            <input
                              type="number"
                              min="0"
                              max="11"
                              className="m-input-compact"
                              value={editForm.heightInches}
                              onChange={(e) => setEditForm({ ...editForm, heightInches: e.target.value })}
                              aria-label="Height inches"
                            />
                            <span className="unit-label">in</span>
                          </div>
                        </div>
                        <span className="m-subtext">≈ {editHeightCm} cm</span>
                      </div>
                    </div>

                    {/* Live Rec Size Indicator */}
                    <div className="recommended-size-callout editing">
                      <Sparkles size={16} />
                      <span>Calibrating atelier fit: <strong>{editRec.label}</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="edit-measurements-actions">
                      <button
                        type="button"
                        className="btn-save-measurements"
                        onClick={handleSave}
                      >
                        <Check size={16} />
                        <span>Save Fitting Profile</span>
                      </button>
                      <button
                        type="button"
                        className="btn-reset-measurements"
                        onClick={() => setEditForm(DEFAULT_MEASUREMENTS)}
                        title="Reset to default couture measurements"
                      >
                        <RotateCcw size={14} />
                        <span>Reset Defaults</span>
                      </button>
                      <button
                        type="button"
                        className="btn-cancel-measurements"
                        onClick={() => setIsEditingMeasurements(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'addresses' && (
            <div className="addresses-tab-content">
              <h4 className="tab-section-title">Primary Atelier Delivery Address</h4>
              {user?.address ? (
                <div className="address-card-selected">
                  <div className="address-badge">Default Delivery</div>
                  <h5>{user?.name || 'Valued Client'}</h5>
                  <p>{user?.address}</p>
                  <p className="phone-line">Primary Phone: <strong>{user?.phone}</strong></p>
                  {user?.alternatePhone && (
                    <p className="phone-line">Alternate Contact: <strong>{user?.alternatePhone}</strong></p>
                  )}
                  {user?.email && (
                    <p className="phone-line">Email: {user?.email}</p>
                  )}
                </div>
              ) : (
                <div className="empty-orders-view" style={{ padding: '36px 16px', textAlign: 'center' }}>
                  <MapPin size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                  <p style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>No Delivery Address Saved Yet</p>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', maxWidth: '340px', margin: '0 auto' }}>
                    Your delivery address and alternate contact number will be automatically captured via GPS or manual entry when you place an order.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="profile-modal-footer">
          <button className="profile-secondary-btn" onClick={onClose}>
            <Settings size={15} />
            <span>Preferences</span>
          </button>
          <button 
            className="profile-signout-btn" 
            onClick={() => {
              if (onLogout) onLogout();
              onClose();
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
