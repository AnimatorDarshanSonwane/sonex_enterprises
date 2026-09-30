import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SplashScreen({ onFinish, duration = 2800 }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // 1. Progress Bar Animation
    const intervalTime = 25;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // 2. Trigger smooth exit transition 450ms before duration ends
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(duration - 500, 1000));

    // 3. Complete and unmount
    const finishTimer = setTimeout(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 300);
  };

  return (
    <aside 
      className={`sonex-splash-overlay ${isExiting ? 'splash-fade-out' : ''}`}
      aria-label="Loading Sonex Enterprises Atelier"
      role="status"
    >
      {/* Background Ambient Aura & Grid Glow */}
      <div className="splash-ambient-aura" />
      <div className="splash-light-beam" />

      {/* Floating Gold Particles */}
      <div className="splash-particles">
        <span className="particle p1" />
        <span className="particle p2" />
        <span className="particle p3" />
        <span className="particle p4" />
        <span className="particle p5" />
      </div>

      {/* Quick Skip Intro Button (Accessible & Convenient) */}
      <button 
        type="button" 
        onClick={handleSkip} 
        className="splash-skip-btn"
        aria-label="Skip intro animation"
      >
        <span>Enter Atelier</span>
        <ArrowRight size={13} />
      </button>

      {/* Main Center Brand Card */}
      <div className="splash-content-box">
        {/* Animated Golden Logo Mark */}
        <div className="splash-logo-container">
          <div className="splash-logo-halo" />
          <div className="splash-logo-circle">
            <div className="splash-sheen-sweep" />
            {!imgError ? (
              <img 
                src="/brand/sonex_logo.png" 
                alt="Sonex Enterprises Official Emblem" 
                onError={() => setImgError(true)}
                className="splash-logo-image"
              />
            ) : (
              <svg 
                width="72" 
                height="72" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="splash-logo-svg"
              >
                <defs>
                  <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff8db" />
                    <stop offset="35%" stopColor="#f5d061" />
                    <stop offset="70%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#aa7c11" />
                  </linearGradient>
                </defs>
                <path 
                  d="M32 30 C32 20, 68 18, 68 32 C68 44, 32 46, 32 68 C32 82, 68 80, 68 70" 
                  stroke="url(#splashGoldGrad)" 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <line x1="50" y1="18" x2="50" y2="82" stroke="url(#splashGoldGrad)" strokeWidth="3" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="6" fill="url(#splashGoldGrad)" />
              </svg>
            )}
          </div>
        </div>

        {/* Brand Headline Typography */}
        <div className="splash-typography">
          <div className="splash-tag-pill">
            <Sparkles size={13} />
            <span>EST. 2026 • DIRECT TEXTILE MANUFACTURER</span>
          </div>

          <h1 className="splash-brand-title">
            <span className="brand-word-sonex">SONEX</span>
            <span className="brand-word-enterprises">ENTERPRISES</span>
          </h1>

          <p className="splash-brand-subtitle">
            360° Luxury Turnaround Atelier • Surat Textile Market, India
          </p>
        </div>

        {/* Progress Loading Bar & Status */}
        <div className="splash-loader-area">
          <div className="splash-progress-track">
            <div 
              className="splash-progress-fill" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          <div className="splash-status-row">
            <span className="splash-status-text">
              {progress < 35 
                ? 'Connecting to Surat Loom Network...' 
                : progress < 75 
                ? 'Calibrating 60 FPS 360° Fitting Engine...' 
                : 'Welcome to Sonex Direct Atelier...'}
            </span>
            <span className="splash-percent-text">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Credentials */}
      <footer className="splash-bottom-credentials">
        <span>GENUINE SURAT FACTORY WHOLESALE PRICING • 100% REFUND POOLING GUARANTEE</span>
      </footer>
    </aside>
  );
}
