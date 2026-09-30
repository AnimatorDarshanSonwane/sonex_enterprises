import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import SonexBrandLogo from './SonexBrandLogo';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectMessage = 'Please sign in with your Google / Gmail account to proceed with your couture order.'
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Real Firebase Google Sign-In Popup
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg('');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      // Check if user already has an isolated profile for this UID
      let existingProfile = {};
      try {
        const saved = localStorage.getItem(`sonex_profile_${fbUser.uid}`);
        if (saved) existingProfile = JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }

      const userData = {
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || existingProfile.name || fbUser.email.split('@')[0],
        photoURL: fbUser.photoURL || existingProfile.photoURL || '',
        phone: existingProfile.phone || '',
        rawPhone: existingProfile.rawPhone || '',
        alternatePhone: existingProfile.alternatePhone || '',
        address: existingProfile.address || '',
        streetAddress: existingProfile.streetAddress || '',
        landmark: existingProfile.landmark || '',
        city: existingProfile.city || '',
        state: existingProfile.state || 'Maharashtra',
        pincode: existingProfile.pincode || '',
        isLoggedIn: true,
        tier: existingProfile.tier || 'Atelier Registered Member',
        loginTime: new Date().toISOString()
      };

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      setIsSigningIn(false);
      onClose();
    } catch (err) {
      console.error('Firebase Google Auth Error:', err);
      setIsSigningIn(false);

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Sign-in cancelled. Please click the button below to continue.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console. You can use the Quick Demo Google Login below.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups or use Demo Login.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google. Please try again.');
      }
    }
  };

  // Instant Demo Google Sign In (Guarantees testing is never blocked by browser popup restrictions)
  const handleQuickDemoGoogleLogin = (demoEmail = 'couture.client@gmail.com', demoName = 'Priya Sharma') => {
    setIsSigningIn(true);
    setTimeout(() => {
      const demoUid = 'demo_user_' + demoEmail.replace(/[^a-zA-Z0-9]/g, '_');
      let existingProfile = {};
      try {
        const saved = localStorage.getItem(`sonex_profile_${demoUid}`);
        if (saved) existingProfile = JSON.parse(saved);
      } catch (e) {
        console.warn(e);
      }

      const userData = {
        uid: demoUid,
        email: demoEmail,
        name: demoName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        phone: existingProfile.phone || (demoName === 'Priya Sharma' ? '+91 94046 92375' : '+91 98765 43210'),
        rawPhone: existingProfile.rawPhone || (demoName === 'Priya Sharma' ? '9404692375' : '9876543210'),
        alternatePhone: existingProfile.alternatePhone || '',
        address: existingProfile.address || (demoName === 'Priya Sharma' ? 'Plot 42, Altamount Road, Cumballa Hill, Mumbai 400026' : 'Villa 18, Koregaon Park Annexe, Pune 411001'),
        streetAddress: existingProfile.streetAddress || '',
        landmark: existingProfile.landmark || '',
        city: existingProfile.city || (demoName === 'Priya Sharma' ? 'Mumbai' : 'Pune'),
        state: existingProfile.state || 'Maharashtra',
        pincode: existingProfile.pincode || (demoName === 'Priya Sharma' ? '400026' : '411001'),
        isLoggedIn: true,
        tier: existingProfile.tier || 'VIP Atelier Member',
        loginTime: new Date().toISOString()
      };

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      setIsSigningIn(false);
      onClose();
    }, 400);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close authentication modal">
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div className="auth-modal-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SonexBrandLogo size="md" showText={false} />
          <h3 className="auth-title" style={{ marginTop: '12px', fontSize: '20px', fontWeight: 800 }}>
            Sign In with Google / Gmail
          </h3>
          <p className="auth-subtitle" style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: '4px auto 0 auto' }}>
            {redirectMessage || 'Sign in using your Google account to access your haute couture showroom & orders.'}
          </p>
        </div>

        {errorMsg && (
          <div className="utr-error-banner" style={{ margin: '0 24px 16px 24px' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Sign-In Body */}
        <div className="auth-form-body" style={{ padding: '0 24px 24px 24px' }}>
          {/* Official Google Sign In Button */}
          <button
            type="button"
            className="google-auth-button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px 20px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isSigningIn ? 'not-allowed' : 'pointer',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSigningIn ? (
              <>
                <RefreshCw size={18} className="spin-animate" />
                <span>Connecting to Google Auth...</span>
              </>
            ) : (
              <>
                {/* Official Multi-Color Google G Logo */}
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google / Gmail</span>
              </>
            )}
          </button>

          {/* Quick Demo Option for Development */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Or quick test
            </span>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleQuickDemoGoogleLogin('priya.sharma@gmail.com', 'Priya Sharma')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Priya Sharma (priya@gmail.com)
              </button>
              <button
                type="button"
                className="demo-pill-btn"
                onClick={() => handleQuickDemoGoogleLogin('elena.rostova@gmail.com', 'Elena Rostova')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Elena Rostova (elena@gmail.com)
              </button>
            </div>
          </div>

          {/* Security & Benefits Badges */}
          <div style={{
            marginTop: '20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '12px',
            color: '#475569'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 700 }}>
              <ShieldCheck size={16} color="#059669" />
              <span>Firebase Authentication Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={13} color="#0284c7" />
              <span>Direct Google OAuth with zero password maintenance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={13} color="#0284c7" />
              <span>Your favorites, measurements &amp; orders sync across devices</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={13} color="#0284c7" />
              <span>Mobile number will be securely captured during checkout</span>
            </div>
          </div>

          {/* Terms Footer */}
          <p style={{
            fontSize: '11px',
            color: '#94a3b8',
            textAlign: 'center',
            marginTop: '16px',
            lineHeight: 1.4,
            marginBottom: 0
          }}>
            By continuing, you authenticate with Sonex Enterprises atelier in accordance with our luxury concierge terms &amp; privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
