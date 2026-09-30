import React, { useState } from 'react';

/**
 * SonexBrandLogo
 * Official brand identity mark for Sonex Enterprises
 * Features the golden sculpted couture monogram with fallback SVG vector
 */
export default function SonexBrandLogo({ 
  size = 'md', 
  showText = true, 
  subtitle = 'DIRECT MANUFACTURER & ATELIER',
  className = '',
  onClick,
  darkMode = false
}) {
  const [imgError, setImgError] = useState(false);

  const sizeDimensions = {
    xs: { box: 28, img: 24, font: '0.9rem', sub: '0.55rem' },
    sm: { box: 38, img: 34, font: '1.05rem', sub: '0.62rem' },
    md: { box: 46, img: 42, font: '1.2rem', sub: '0.68rem' },
    lg: { box: 64, img: 58, font: '1.5rem', sub: '0.78rem' },
    xl: { box: 96, img: 88, font: '2rem', sub: '0.9rem' }
  };

  const dim = sizeDimensions[size] || sizeDimensions.md;

  return (
    <div 
      className={`sonex-brand-identity ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
    >
      <div 
        className="sonex-logo-mark-wrap"
        style={{
          width: `${dim.box}px`,
          height: `${dim.box}px`,
          borderRadius: '22%',
          background: '#0e2238',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 14px rgba(14, 34, 56, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        {!imgError ? (
          <img 
            src="/brand/sonex_logo.png" 
            alt="Sonex Enterprises Logo" 
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        ) : (
          <svg 
            width={dim.img} 
            height={dim.img} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elegant Golden Monogram Fallback */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2c6" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#997517" />
              </linearGradient>
            </defs>
            <path 
              d="M32 30 C32 20, 68 18, 68 32 C68 44, 32 46, 32 68 C32 82, 68 80, 68 70" 
              stroke="url(#goldGradient)" 
              strokeWidth="10" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <line x1="50" y1="18" x2="50" y2="82" stroke="url(#goldGradient)" strokeWidth="3" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="6" fill="url(#goldGradient)" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="sonex-brand-text-col" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div 
            className="sonex-brand-title" 
            style={{ 
              fontWeight: 800, 
              fontSize: dim.font, 
              letterSpacing: '0.04em',
              color: darkMode ? '#ffffff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>SONEX</span>
            <span style={{ 
              color: '#b8860b', 
              fontWeight: 400,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic'
            }}>
              ENTERPRISES
            </span>
          </div>
          {subtitle && (
            <span 
              className="sonex-brand-sub" 
              style={{ 
                fontSize: dim.sub, 
                fontWeight: 700, 
                letterSpacing: '0.12em',
                color: darkMode ? '#94a3b8' : '#64748b',
                textTransform: 'uppercase',
                marginTop: '3px'
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
