import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  QrCode, 
  Copy, 
  Upload, 
  ShieldCheck, 
  CreditCard, 
  Building, 
  PhoneCall, 
  Sparkles,
  Navigation,
  Crosshair,
  Mail,
  Lock,
  RefreshCw,
  Edit2,
  FileCheck,
  Check
} from 'lucide-react';
import { formatINR } from '../utils/currency';

// Helper to determine if the user profile has all required order placement info
export const checkIsProfileComplete = (u) => {
  if (!u || !u.isLoggedIn) return false;
  const hasName = Boolean(u.name && u.name.trim().length >= 2);
  const cleanPhone = (u.phone || u.rawPhone || '').replace(/\D/g, '');
  const tenDigitPhone = cleanPhone.length > 10 ? cleanPhone.slice(-10) : cleanPhone;
  const hasPhone = tenDigitPhone.length === 10;
  const hasAddress = Boolean((u.streetAddress || u.address) && (u.streetAddress || u.address).trim().length >= 3);
  const hasCity = Boolean(u.city && u.city.trim().length >= 2);
  const hasPincode = Boolean((u.pincode || u.postalCode) && (u.pincode || u.postalCode).trim().length >= 5);
  return hasName && hasPhone && hasAddress && hasCity && hasPincode;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  user,
  checkoutPricing,
  onUpdateUser,
  onOpenAuth,
  onPlaceOrder,
  onOpenUtrModal,
  onViewOrders
}) {
  // Step state: 'auth_required' | 'address_form' | 'review_place' | 'success'
  const [step, setStep] = useState('address_form');
  const [addressInputMode, setAddressInputMode] = useState('manual'); // 'manual' | 'gps'
  
  // GPS Location state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');

  // Payment & UTR State
  const [paymentOption, setPaymentOption] = useState('pay_later'); // 'pay_later' | 'pay_now_utr'
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  
  const fileInputRef = useRef(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (!isOpen) return;

    if (!user?.isLoggedIn) {
      setStep('auth_required');
      return;
    }

    // Populate existing user info if available
    setRecipientName(user.name || '');
    
    // Extract 10-digit mobile number if existing
    const rawClean = (user.phone || user.rawPhone || '').replace(/\D/g, '');
    const tenDigit = rawClean.length > 10 ? rawClean.slice(-10) : rawClean;
    setPrimaryPhone(tenDigit);

    setAlternatePhone(user.alternatePhone ? user.alternatePhone.replace(/\D/g, '').slice(-10) : '');
    setEmail(user.email || '');
    setStreetAddress(user.streetAddress || user.address || '');
    setLandmark(user.landmark || '');
    setCity(user.city || '');
    setState(user.state || 'Maharashtra');
    setPostalCode(user.pincode || user.postalCode || '');

    const complete = checkIsProfileComplete(user);
    if (!complete) {
      setStep('address_form');
    } else {
      setStep('review_place');
    }
    setFormError('');
    setGpsStatusMsg(null);
  }, [isOpen, user]);

  const handleNavigateToOrders = () => {
    onClose();
    if (onViewOrders) {
      onViewOrders();
    }
  };

  const handleModalClose = () => {
    if (step === 'success') {
      handleNavigateToOrders();
    } else {
      onClose();
    }
  };

  // Auto-redirect to Profile Order History tab after order placement
  useEffect(() => {
    if (!isOpen || step !== 'success') {
      setRedirectCountdown(4);
      return;
    }

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNavigateToOrders();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step]);

  if (!isOpen) return null;

  const upiId = '9404692375@ybl';
  const subtotal = cartItems.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const totalOriginalMRP = cartItems.reduce((acc, item) => {
    const orig = Number(item.originalPrice) || (Number(item.price) ? Math.round(Number(item.price) * 1.43) : 0);
    return acc + (orig * (Number(item.quantity) || 1));
  }, 0);
  const totalMrpSavings = Math.max(0, totalOriginalMRP - subtotal);
  const mrpDiscountPercentage = totalOriginalMRP > 0 ? Math.round((totalMrpSavings / totalOriginalMRP) * 100) : 30;
  
  // Dynamic Shipping & Free Shipping Threshold settings
  const isAlwaysFree = Boolean(checkoutPricing?.isFreeShipping);
  const hasThreshold = Boolean(checkoutPricing?.enableFreeShippingThreshold !== false);
  const shippingThreshold = Number(checkoutPricing?.freeShippingThreshold ?? 25000);
  const configuredShippingPrice = Number(checkoutPricing?.shippingPrice ?? 49);

  const isFree = isAlwaysFree || (hasThreshold && subtotal >= shippingThreshold) || subtotal === 0;
  const shipping = isFree ? 0 : configuredShippingPrice;
  const gstRate = Number(checkoutPricing?.gstPercentage ?? 5);

  // CRITICAL REQUIREMENT: Calculate GST percentage on (Product Price + Shipping Price)
  const taxBase = subtotal + shipping;
  const tax = Math.round(taxBase * (gstRate / 100));
  const total = subtotal + shipping + tax;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyBank = () => {
    const bankDetails = `Sonex Enterprises Atelier\nBank: HDFC Bank\nA/C: 50200088921842\nIFSC: HDFC0000128\nBranch: Mumbai BKC`;
    navigator.clipboard?.writeText(bankDetails);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // --------------------------------------------------------------------------
  // GPS Address Auto-Fetch (Using HTML5 Geolocation + OpenStreetMap Reverse Geocoding)
  // --------------------------------------------------------------------------
  const handleFetchGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg({
        type: 'error',
        text: 'Geolocation is not supported by your browser. Please enter address manually.'
      });
      return;
    }

    setIsLocating(true);
    setGpsStatusMsg({
      type: 'info',
      text: 'Acquiring high-accuracy GPS coordinates...'
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setGpsStatusMsg({
            type: 'info',
            text: 'Reverse geocoding your coordinates...'
          });

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error('Reverse geocoding service unavailable');
          }

          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const house = addr.house_number || addr.building || '';
            const road = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
            const locality = addr.neighbourhood || addr.suburb || addr.residential || addr.quarter || '';
            const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
            const stateName = addr.state || 'Maharashtra';
            const rawPostcode = (addr.postcode || '').replace(/\D/g, '').slice(0, 6);

            const streetString = [house, road].filter(Boolean).join(', ') || data.display_name.split(',').slice(0, 2).join(', ');

            if (streetString) setStreetAddress(streetString);
            if (locality) setLandmark(locality);
            if (cityName) setCity(cityName);
            if (stateName) setState(stateName);
            if (rawPostcode) setPostalCode(rawPostcode);

            setAddressInputMode('gps');
            setGpsStatusMsg({
              type: 'success',
              text: `GPS Location detected: ${cityName || 'City'}, ${stateName || 'State'} ${rawPostcode ? '(' + rawPostcode + ')' : ''}. Details auto-filled below.`
            });
          } else {
            setGpsStatusMsg({
              type: 'error',
              text: 'Could not extract exact street details. Please enter address manually.'
            });
          }
        } catch (err) {
          console.warn('GPS geocoding error:', err);
          setGpsStatusMsg({
            type: 'error',
            text: 'Failed to resolve address from GPS. Please enter manually.'
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve GPS coordinates.';
        if (err.code === 1) {
          msg = 'Location permission was denied. Please allow location access or enter manually.';
        } else if (err.code === 2) {
          msg = 'Position unavailable. Please enter address manually.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please enter address manually.';
        }
        setGpsStatusMsg({
          type: 'error',
          text: msg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // --------------------------------------------------------------------------
  // Save Address & Complete Profile
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Save Address & Complete Profile
  // --------------------------------------------------------------------------
  const handleSaveAddressAndProfile = (e) => {
    e.preventDefault();
    setFormError('');

    if (!recipientName.trim() || recipientName.trim().length < 2) {
      setFormError('Please enter your full name (Recipient Name).');
      return;
    }

    const cleanPrimary = primaryPhone.replace(/\D/g, '');
    if (cleanPrimary.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number. A mobile number is mandatory to proceed with checkout and place your order.');
      return;
    }

    let formattedAlt = '';
    if (alternatePhone.trim()) {
      const cleanAlt = alternatePhone.replace(/\D/g, '');
      if (cleanAlt.length !== 10) {
        setFormError('Please enter a valid 10-digit alternate contact number, or leave it blank.');
        return;
      }
      formattedAlt = `+91 ${cleanAlt.slice(0, 5)} ${cleanAlt.slice(5)}`;
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 3) {
      setFormError('Please enter your street address / house / building number.');
      return;
    }

    if (!city.trim()) {
      setFormError('Please enter your city.');
      return;
    }

    const cleanPin = postalCode.replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setFormError('Please enter a valid 6-digit Indian PIN / Postal Code.');
      return;
    }

    const formattedPrimary = `+91 ${cleanPrimary.slice(0, 5)} ${cleanPrimary.slice(5)}`;
    const fullAddress = `${streetAddress.trim()}${landmark.trim() ? ', ' + landmark.trim() : ''}, ${city.trim()}, ${state.trim()} - ${cleanPin}`;

    const updatedUser = {
      ...user,
      name: recipientName.trim(),
      phone: formattedPrimary,
      rawPhone: cleanPrimary,
      alternatePhone: formattedAlt,
      email: email.trim() || user.email || '',
      address: fullAddress,
      streetAddress: streetAddress.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: cleanPin,
      postalCode: cleanPin,
      isLoggedIn: true,
      isProfileComplete: true
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    try {
      localStorage.setItem('atelier_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.warn(err);
    }

    setStep('review_place');
  };

  // --------------------------------------------------------------------------
  // Payment Proof Screenshot Handler
  // --------------------------------------------------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleProof = () => {
    const sampleProof = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f1f5f9"/><text x="150" y="80" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23059669" text-anchor="middle">✓ UPI Payment Successful</text><text x="150" y="110" font-family="sans-serif" font-size="12" fill="%230f172a" text-anchor="middle">Amount: ' + formatINR(total) + '</text><text x="150" y="140" font-family="sans-serif" font-size="11" fill="%2364748b" text-anchor="middle">Ref UTR: 426819028491</text></svg>';
    setScreenshotPreview(sampleProof);
    if (!utrNumber) setUtrNumber('426819028491');
    setFormError('');
  };

  // --------------------------------------------------------------------------
  // Place Order with PENDING Status
  // --------------------------------------------------------------------------
  const handleFinalOrderSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Strict validation: Mobile number MUST be 10 digits
    const cleanUserPhone = (user?.phone || user?.rawPhone || primaryPhone || '').replace(/\D/g, '').slice(-10);
    if (cleanUserPhone.length !== 10) {
      setFormError('A 10-digit mobile number is mandatory before placing your order. Please complete your contact details.');
      setStep('address_form');
      return;
    }

    if (paymentOption === 'pay_now_utr') {
      if (!utrNumber.trim() || utrNumber.trim().length < 8) {
        setFormError('Please enter your 12-digit UTR transaction reference number.');
        return;
      }
      if (!screenshotPreview) {
        setFormError('Please attach your payment confirmation screenshot.');
        return;
      }
    }

    setIsSubmitting(true);
    const orderId = `SS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000));

    // Order status is ALWAYS initially set to 'pending_payment' (or 'utr_submitted' if UTR is provided)
    const initialStatus = paymentOption === 'pay_now_utr' ? 'utr_submitted' : 'pending_payment';

    const fullAddrString = user.address || `${streetAddress}${landmark ? ', ' + landmark : ''}, ${city}, ${state} - ${postalCode}`;
    const userPhoneFormatted = user.phone || `+91 ${cleanUserPhone.slice(0, 5)} ${cleanUserPhone.slice(5)}`;

    const newOrder = {
      id: orderId,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: now.toISOString(),
      expiryDate: expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysLeft: 5,
      recipientName: user.name || recipientName,
      phone: userPhoneFormatted,
      alternatePhone: user.alternatePhone || alternatePhone,
      email: user.email || email || '',
      address: fullAddrString,
      streetAddress: user.streetAddress || streetAddress,
      landmark: user.landmark || landmark,
      city: user.city || city,
      state: user.state || state,
      postalCode: user.pincode || postalCode,
      items: cartItems.map(i => `${i.title} (${[i.selectedSize ? `Size: ${i.selectedSize}` : null, i.selectedColor ? `Color: ${i.selectedColor}` : null, i.material ? `Fabric: ${i.material}` : null].filter(Boolean).join(', ')}) x${i.quantity}`).join('; '),
      itemsList: [...cartItems],
      subtotalRaw: subtotal,
      subtotalFormatted: formatINR(subtotal),
      totalOriginalMRP,
      totalMrpSavings,
      mrpDiscountPercentage,
      shippingRaw: shipping,
      shippingFormatted: shipping === 0 ? 'FREE' : formatINR(shipping),
      taxRaw: tax,
      taxFormatted: formatINR(tax),
      gstPercentage: gstRate,
      total: formatINR(total),
      totalRaw: total,
      status: initialStatus, // PENDING STATUS UNTIL PAYMENT IS DONE
      paymentStatus: initialStatus === 'utr_submitted' ? 'UTR Submitted (Under Verification)' : 'Pending Payment',
      paymentMethod: 'UPI / Direct Bank Transfer',
      paymentOption,
      utrNumber: paymentOption === 'pay_now_utr' ? utrNumber.trim() : null,
      screenshotUrl: paymentOption === 'pay_now_utr' ? screenshotPreview : null,
      submittedAt: paymentOption === 'pay_now_utr' ? now.toLocaleString() : null,
      callScheduled: true
    };

    setTimeout(() => {
      onPlaceOrder(newOrder);
      setPlacedOrderDetails(newOrder);
      setStep('success');
      setIsSubmitting(false);
    }, 700);
  };

  // Critical Guard: Do not render modal if isOpen is false
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={handleModalClose}>
      <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Close Button */}
        <button type="button" className="modal-close-btn" onClick={handleModalClose} aria-label="Close checkout">
          <X size={20} />
        </button>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: AUTH REQUIRED (IF NOT LOGGED IN VIA GOOGLE / GMAIL)        */}
        {/* ------------------------------------------------------------------ */}
        {step === 'auth_required' && (
          <div className="checkout-auth-guard-view" style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Lock size={30} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Sign In Required to Place Order
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, maxWidth: '440px', margin: '0 auto 24px auto' }}>
              In accordance with our atelier policy, please sign in with your Google / Gmail account to proceed with your bespoke order.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="checkout-place-btn" 
                style={{ width: 'auto', padding: '12px 28px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In with Google / Gmail</span>
              </button>

              <button 
                type="button" 
                className="profile-secondary-btn"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: COMPLETE ADDRESS & CONTACT PROFILE                         */}
        {/* ------------------------------------------------------------------ */}
        {step === 'address_form' && (
          <>
            <div className="checkout-modal-header">
              <div className="checkout-brand-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                <MapPin size={13} />
                <span>DELIVERY ADDRESS &amp; CONTACT PROFILE</span>
              </div>
              <h3 className="checkout-modal-title">Enter Delivery &amp; Contact Details</h3>
              <p className="checkout-subhead">
                Signed in as: <strong>{user?.email || user?.name || 'Valued Client'}</strong>. Please provide your 10-digit mobile number and recipient address to place your couture order.
              </p>
            </div>

            <form onSubmit={handleSaveAddressAndProfile} className="checkout-form-scrollable">
              {formError && (
                <div className="utr-error-banner">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* GPS vs Manual Options Selector */}
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Choose Address Input Method:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setAddressInputMode('gps')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: addressInputMode === 'gps' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: addressInputMode === 'gps' ? '#e0f2fe' : '#ffffff',
                        color: addressInputMode === 'gps' ? '#0369a1' : '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Crosshair size={13} />
                      <span>Take from GPS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddressInputMode('manual')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: addressInputMode === 'manual' ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                        background: addressInputMode === 'manual' ? '#0f172a' : '#ffffff',
                        color: addressInputMode === 'manual' ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit2 size={13} />
                      <span>Enter Manually</span>
                    </button>
                  </div>
                </div>

                {/* GPS Trigger Banner */}
                {addressInputMode === 'gps' && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '13px' }}>
                      <Navigation size={16} />
                      <strong>GPS Auto-Detect Location</strong>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                      Click the button below to allow browser location access. We will instantly extract your house/road, city, state, and PIN code.
                    </p>
                    <button
                      type="button"
                      onClick={handleFetchGpsLocation}
                      disabled={isLocating}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: '#0284c7',
                        color: '#ffffff',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: isLocating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLocating ? (
                        <>
                          <RefreshCw size={14} className="spin-animate" />
                          <span>Acquiring GPS Position...</span>
                        </>
                      ) : (
                        <>
                          <Crosshair size={15} />
                          <span>📍 Fetch Address from Current GPS Location</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* GPS Status Message Feedback */}
                {gpsStatusMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: gpsStatusMsg.type === 'success' ? '#ecfdf5' : (gpsStatusMsg.type === 'info' ? '#eff6ff' : '#fef2f2'),
                    color: gpsStatusMsg.type === 'success' ? '#065f46' : (gpsStatusMsg.type === 'info' ? '#1e40af' : '#991b1b'),
                    border: `1px solid ${gpsStatusMsg.type === 'success' ? '#a7f3d0' : (gpsStatusMsg.type === 'info' ? '#bfdbfe' : '#fecaca')}`
                  }}>
                    {gpsStatusMsg.type === 'success' && <CheckCircle2 size={15} />}
                    {gpsStatusMsg.type === 'info' && <RefreshCw size={14} className="spin-animate" />}
                    {gpsStatusMsg.type === 'error' && <AlertCircle size={15} />}
                    <span>{gpsStatusMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Contact Profile Fields */}
              <div className="checkout-section">
                <h4 className="checkout-section-heading">
                  <User size={16} />
                  <span>Contact Information</span>
                </h4>

                <div className="checkout-input-grid">
                  {/* Name (Required) */}
                  <div className="checkout-field-full">
                    <label>
                      <span>Full Name (Recipient Name)</span>
                      <span className="required-star" style={{ color: '#e11d48' }}> *</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Priya Sharma"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="checkout-text-input"
                    />
                  </div>

                  {/* Primary Mobile (MANDATORY: 10 Digits required before checkout) */}
                  <div className="checkout-field-half">
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span>Mobile Number (10 Digits)</span>
                        <span className="required-star" style={{ color: '#e11d48' }}> *</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#b91c1c', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, border: '1px solid #fecaca' }}>
                        Required
                      </span>
                    </label>
                    <div className="phone-input-wrap" style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#475569', fontSize: '13px', zIndex: 2 }}>
                        +91
                      </span>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile"
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="checkout-text-input phone-pad"
                        style={{ paddingLeft: '46px', fontWeight: 700, letterSpacing: '0.5px' }}
                        title="10-digit mobile number is mandatory to place your order"
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                      Concierge will call this number for fitting verification.
                    </span>
                  </div>

                  {/* Alternate Contact Number (Optional) */}
                  <div className="checkout-field-half">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Alternate Contact Number</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
                    </label>
                    <div className="phone-input-wrap">
                      <Phone size={15} className="phone-icon-input" />
                      <input 
                        type="tel" 
                        maxLength={10}
                        placeholder="10-digit alternate number"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="checkout-text-input phone-pad"
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                      Backup emergency contact for delivery.
                    </span>
                  </div>

                  {/* Email ID (Google Account) */}
                  <div className="checkout-field-full">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Email Address</span>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Google Account</span>
                    </label>
                    <div className="phone-input-wrap">
                      <Mail size={15} className="phone-icon-input" />
                      <input 
                        type="email" 
                        placeholder="e.g. yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="checkout-text-input phone-pad"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address Fields */}
              <div className="checkout-section">
                <h4 className="checkout-section-heading">
                  <MapPin size={16} />
                  <span>Delivery Address Details</span>
                </h4>

                <div className="checkout-input-grid">
                  {/* Street Address */}
                  <div className="checkout-field-full">
                    <label>
                      <span>Flat / House No. / Building / Street</span>
                      <span className="required-star" style={{ color: '#e11d48' }}> *</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Flat 402, Signature Enclave, Link Road"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="checkout-text-input"
                    />
                  </div>

                  {/* Landmark / Area */}
                  <div className="checkout-field-full">
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Area / Landmark / Colony</span>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Near Grand Hyatt, Bandra Kurla Complex"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="checkout-text-input"
                    />
                  </div>

                  {/* City */}
                  <div className="checkout-field-half">
                    <label>
                      <span>City</span>
                      <span className="required-star" style={{ color: '#e11d48' }}> *</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="checkout-text-input"
                    />
                  </div>

                  {/* State */}
                  <div className="checkout-field-half">
                    <label>
                      <span>State</span>
                      <span className="required-star" style={{ color: '#e11d48' }}> *</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="checkout-text-input"
                    />
                  </div>

                  {/* PIN Code */}
                  <div className="checkout-field-full">
                    <label>
                      <span>PIN / Postal Code (6 Digits)</span>
                      <span className="required-star" style={{ color: '#e11d48' }}> *</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      placeholder="e.g. 400051"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="checkout-text-input"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="checkout-footer-action">
                <button 
                  type="submit" 
                  className="checkout-place-btn"
                >
                  <span>Save Address &amp; Review Order</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: REVIEW & PLACE ORDER (WITH PENDING PAYMENT STATUS)        */}
        {/* ------------------------------------------------------------------ */}
        {step === 'review_place' && (
          <>
            <div className="checkout-modal-header">
              <div className="checkout-brand-badge">
                <Sparkles size={14} />
                <span>CONFIRM ORDER DETAILS</span>
              </div>
              <h3 className="checkout-modal-title">Finalize Your Haute Couture Order</h3>
              <p className="checkout-subhead">
                Verified Customer: <strong>{user?.name || recipientName}</strong> ({user?.phone || primaryPhone})
              </p>
            </div>

            <form onSubmit={handleFinalOrderSubmit} className="checkout-form-scrollable">
              {formError && (
                <div className="utr-error-banner">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Items Summary Strip */}
              <div className="checkout-items-summary">
                <div className="summary-title-row">
                  <ShoppingBag size={16} />
                  <span>Order Items ({cartItems.reduce((a, b) => a + (Number(b.quantity) || 1), 0)})</span>
                  <span className="summary-total-tag">{formatINR(total)}</span>
                </div>
                <div className="summary-thumbs-row">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="checkout-item-mini" title={`${item.title} (x${item.quantity})`}>
                      <img src={item.image} alt={item.title} className="mini-thumb" />
                      <span className="mini-qty-badge">{item.quantity}</span>
                    </div>
                  ))}
                  <div className="summary-pricing-mini">
                    <span>
                      {totalMrpSavings > 0 && <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '6px' }}>MRP {formatINR(totalOriginalMRP)}</span>}
                      {totalMrpSavings > 0 && <span style={{ color: '#059669', fontWeight: 600, marginRight: '6px' }}>({mrpDiscountPercentage}% OFF)</span>}
                      Subtotal: {formatINR(subtotal)} • Shipping: {shipping === 0 ? 'FREE' : formatINR(shipping)} • GST ({gstRate}%): {formatINR(tax)}
                    </span>
                  </div>
                </div>

                {/* Itemized Garment List with Material Specifications */}
                <div className="checkout-review-items-list" style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {item.selectedSize && (
                            <span style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', color: '#475569' }}>
                              {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', color: '#475569' }}>
                              {item.selectedColor}
                            </span>
                          )}
                          {item.material && (
                            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                              🧵 {item.material}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                        {formatINR(item.price * item.quantity)} (x{item.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Delivery Address Card */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#059669" />
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Delivery Address &amp; Contact</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('address_form')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={12} />
                    <span>Change</span>
                  </button>
                </div>

                <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{user?.name || recipientName}</div>
                  <div>{user?.address || `${streetAddress}${landmark ? ', ' + landmark : ''}, ${city}, ${state} - ${postalCode}`}</div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>Primary Phone: <strong>{user?.phone || primaryPhone}</strong></span>
                    {user?.alternatePhone || alternatePhone ? (
                      <span>Alt Contact: <strong>{user?.alternatePhone || alternatePhone}</strong></span>
                    ) : null}
                    {(user?.email || email) && <span>Email: {user?.email || email}</span>}
                  </div>
                </div>
              </div>

              {/* Order Status Notice (Placed with Pending Status) */}
              <div style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <Clock size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', marginBottom: '2px', color: '#78350f' }}>
                    Order Status Policy: Placed with "PENDING PAYMENT" Status
                  </strong>
                  Your order will be registered in our database with a <strong>PENDING</strong> status. Your garment is reserved for 5 days. You can pay now via UPI QR / Bank Transfer or complete it after order placement.
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="checkout-section">
                <h4 className="checkout-section-heading">
                  <CreditCard size={16} />
                  <span>Payment &amp; Confirmation Options</span>
                </h4>

                <div className="payment-options-selector">
                  <label className={`payment-option-card ${paymentOption === 'pay_later' ? 'selected' : ''}`}>
                    <input 
                      type="radio"
                      name="payment_method"
                      value="pay_later"
                      checked={paymentOption === 'pay_later'}
                      onChange={() => setPaymentOption('pay_later')}
                    />
                    <div className="option-card-body">
                      <div className="option-title-row">
                        <span className="option-name">Place Order Now • Pay via UPI / Bank within 5 Days</span>
                        <span className="option-badge-recommended" style={{ background: '#fef3c7', color: '#92400e' }}>Standard</span>
                      </div>
                      <p className="option-desc">
                        Order is created with <strong>Pending Payment</strong> status. Our concierge will call your verified number to confirm measurements.
                      </p>
                    </div>
                  </label>

                  <label className={`payment-option-card ${paymentOption === 'pay_now_utr' ? 'selected' : ''}`}>
                    <input 
                      type="radio"
                      name="payment_method"
                      value="pay_now_utr"
                      checked={paymentOption === 'pay_now_utr'}
                      onChange={() => setPaymentOption('pay_now_utr')}
                    />
                    <div className="option-card-body">
                      <div className="option-title-row">
                        <span className="option-name">Pay Now &amp; Submit UTR Reference / Screenshot</span>
                        <span className="option-badge-recommended">Instant Verification</span>
                      </div>
                      <p className="option-desc">
                        Scan UPI QR, transfer the amount, and provide 12-digit UTR immediately to expedite tailoring.
                      </p>
                    </div>
                  </label>
                </div>

                {/* If Pay Now UTR is selected, show UPI QR & UTR inputs */}
                {paymentOption === 'pay_now_utr' && (
                  <div className="pay-now-details-container">
                    <div className="upi-payment-info-box">
                      <div className="upi-details-col">
                        <span className="info-box-label">Atelier UPI Payment ID</span>
                        <div className="upi-id-row">
                          <span className="upi-id-text">{upiId}</span>
                          <button 
                            type="button" 
                            className="copy-upi-btn"
                            onClick={handleCopyUpi}
                          >
                            {copiedUpi ? <CheckCircle2 size={14} color="#059669" /> : <Copy size={14} />}
                            <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <span className="amount-payable-chip">
                          Total Payable: <strong>{formatINR(total)}</strong>
                        </span>
                      </div>

                      <div className="upi-qr-placeholder">
                        <QrCode size={48} className="qr-icon" />
                        <span className="qr-label">UPI QR</span>
                      </div>
                    </div>

                    {/* UTR Input */}
                    <div className="utr-input-group">
                      <label className="utr-label">
                        <span>12-Digit UTR / Transaction Reference Number</span>
                        <span className="required-star">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. 426819028491"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="utr-text-input"
                      />
                    </div>

                    {/* Screenshot Upload */}
                    <div className="utr-input-group">
                      <div className="label-with-sample">
                        <label className="utr-label">
                          <span>Upload Payment Screenshot</span>
                          <span className="required-star">*</span>
                        </label>
                        <button 
                          type="button" 
                          className="sample-proof-link"
                          onClick={handleUseSampleProof}
                        >
                          + Auto-fill Sample Proof
                        </button>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />

                      {screenshotPreview ? (
                        <div className="screenshot-preview-container">
                          <img 
                            src={screenshotPreview} 
                            alt="Payment Proof Preview" 
                            className="screenshot-thumb-img" 
                          />
                          <div className="screenshot-actions">
                            <span className="screenshot-status">
                              <CheckCircle2 size={14} color="#059669" />
                              <span>Screenshot Attached</span>
                            </span>
                            <button 
                              type="button" 
                              className="change-screenshot-btn"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="screenshot-dropzone"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={20} />
                          <span>Click to attach payment confirmation receipt</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Concierge Call Notice */}
                <div className="checkout-policy-banner">
                  <PhoneCall size={16} className="policy-icon" />
                  <div className="policy-text">
                    <strong>Atelier Concierge Call:</strong> After placing your order, our executive will call <strong>{user?.phone || primaryPhone}</strong> (or alternate: {user?.alternatePhone || alternatePhone || 'N/A'}) to confirm size, fitting, and delivery date.
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="checkout-footer-action">
                <button 
                  type="submit" 
                  className="checkout-place-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Registering Order with Pending Status...</span>
                  ) : (
                    <>
                      <span>Place Order with Pending Status • {formatINR(total)}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 4: ORDER PLACEMENT SUCCESS (SHOWING PENDING STATUS)          */}
        {/* ------------------------------------------------------------------ */}
        {step === 'success' && (
          <div className="order-success-view">
            <div className="success-icon-banner" style={{ background: '#ecfdf5' }}>
              <CheckCircle2 size={54} color="#059669" />
            </div>

            <h3 className="success-title">Haute Couture Order Placed!</h3>
            <span className="success-order-id">Order Reference: <strong>{placedOrderDetails?.id}</strong></span>

            {/* Prominent Pending Status Callout */}
            <div className="success-status-box" style={{
              background: placedOrderDetails?.status === 'utr_submitted' ? '#f0fdf4' : '#fffbeb',
              borderColor: placedOrderDetails?.status === 'utr_submitted' ? '#bbf7d0' : '#fde68a'
            }}>
              <div className="status-header-row" style={{
                color: placedOrderDetails?.status === 'utr_submitted' ? '#166534' : '#92400e'
              }}>
                <Clock size={18} />
                <span>
                  ORDER STATUS: <strong>
                    {placedOrderDetails?.status === 'utr_submitted' 
                      ? 'UTR SUBMITTED (UNDER VERIFICATION)' 
                      : 'PENDING PAYMENT'}
                  </strong>
                </span>
              </div>
              <p className="status-detail-desc" style={{ color: placedOrderDetails?.status === 'utr_submitted' ? '#14532d' : '#78350f' }}>
                {placedOrderDetails?.status === 'utr_submitted' ? (
                  <>We have received your payment reference (UTR: <strong>{placedOrderDetails?.utrNumber}</strong>). Our accounts team will confirm the bank ledger entry and update your status to Confirmed.</>
                ) : (
                  <>Your order has been recorded in <strong>PENDING PAYMENT</strong> status. Your garment is reserved for <strong>5 days</strong>. Please complete payment using the UPI QR or Bank Transfer details below to confirm processing.</>
                )}
              </p>
            </div>

            {/* Payment Details Drawer / Card */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Atelier Payment Details</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#e11d48' }}>Amount Due: {placedOrderDetails?.total}</span>
              </div>

              {/* UPI ID Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700 }}>OFFICIAL UPI ID</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedUpi ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Direct Bank Account Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: 700 }}>HDFC BANK ACCOUNT</span>
                  <span style={{ fontSize: '12px', color: '#334155' }}>A/C: <strong>50200088921842</strong> • IFSC: <strong>HDFC0000128</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBank}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedBank ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Delivery Details Summary */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 16px',
              textAlign: 'left',
              fontSize: '12px',
              color: '#475569',
              lineHeight: 1.5
            }}>
              <div><strong>Deliver to:</strong> {placedOrderDetails?.recipientName}</div>
              <div>{placedOrderDetails?.address}</div>
              <div style={{ marginTop: '4px' }}>
                Contact: <strong>{placedOrderDetails?.phone}</strong> • Alt: <strong>{placedOrderDetails?.alternatePhone}</strong>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="next-steps-card">
              <div className="step-point">
                <PhoneCall size={16} color="#0f172a" />
                <div>
                  <h6>1. Concierge Verification Call</h6>
                  <p>Our tailoring specialist will call <strong>{placedOrderDetails?.phone}</strong> or alternate contact <strong>{placedOrderDetails?.alternatePhone}</strong> to verify fittings.</p>
                </div>
              </div>

              <div className="step-point">
                <ShieldCheck size={16} color="#0f172a" />
                <div>
                  <h6>2. UTR Submission in My Orders</h6>
                  <p>You can submit or view your payment UTR reference anytime in <strong>My Account &gt; Order History</strong>.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '18px' }}>
              <button 
                type="button" 
                className="success-done-btn" 
                onClick={handleNavigateToOrders}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>View Full Order History under Profile</span>
                <ArrowRight size={16} />
              </button>
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', fontWeight: 500 }}>
                Automatically opening your Order History tab in <strong>{redirectCountdown}s</strong>...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
