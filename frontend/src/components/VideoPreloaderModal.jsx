import React from 'react';
import { RotateCw, Sparkles, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function VideoPreloaderModal({
  isOpen,
  onClose,
  dress,
  progress = 0,
  size = 'L',
  onSkip
}) {
  if (!isOpen || !dress) return null;

  return (
    <div 
      className="modal-backdrop-luxury animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="video-preloader-card"
        style={{
          width: '100%',
          maxWidth: 'min(92vw, 440px)',
          background: 'linear-gradient(145deg, #1e293b, #0f172a)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.15)',
          padding: '28px 24px',
          color: '#f8fafc',
          boxSizing: 'border-box',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close / Dismiss */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Center Spinner Icon */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div 
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 14px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(15, 23, 42, 0) 70%)',
              border: '2px solid rgba(212, 175, 55, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
            }}
          >
            <RotateCw 
              size={28} 
              color="#d4af37" 
              style={{ animation: 'spin 2s linear infinite' }} 
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', fontSize: '11px', color: '#fde047', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            <Sparkles size={12} />
            <span>Sonex 360° Studio Turnaround Engine</span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 6px', color: '#ffffff' }}>
            {dress.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            {dress.material && <span>🧵 {dress.material}</span>}
            <span>•</span>
            <span style={{ color: '#d4af37', fontWeight: 600 }}>Size {size} Fitting</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>
            <span style={{ color: '#cbd5e1' }}>Caching 360° Studio for 60fps Turnaround</span>
            <span style={{ color: '#d4af37' }}>{progress}%</span>
          </div>

          <div 
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div 
              style={{
                width: `${Math.max(5, progress)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #d4af37, #fef08a, #d4af37)',
                backgroundSize: '200% 100%',
                borderRadius: '4px',
                transition: 'width 0.2s ease-out'
              }}
            />
          </div>
        </div>

        {/* Value Proposition Note */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '11.5px',
            color: '#94a3b8',
            lineHeight: 1.4,
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <Zap size={14} color="#eab308" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Saved securely in your browser cache. Once loaded, future 360° views and size toggles incur <strong>0 storage reads</strong>.
          </span>
        </div>

        {/* Quick Skip button */}
        <button
          type="button"
          onClick={onSkip || onClose}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Open Preview Now
        </button>
      </div>
    </div>
  );
}
