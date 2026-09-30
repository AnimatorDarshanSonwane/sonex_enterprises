import React from 'react';
import { 
  PackageCheck, 
  PhoneCall, 
  BadgeCheck, 
  ClipboardCheck, 
  Package, 
  Truck,
  Sparkles
} from 'lucide-react';

export default function HowToOrderSection() {
  const steps = [
    {
      id: 1,
      name: 'Selection & Order',
      color: '#f97316', // Orange
      lightBg: '#fff7ed',
      borderColor: '#fdba74',
      icon: PackageCheck,
      description: 'Choose your dress with 360° interactive turnaround & place order'
    },
    {
      id: 2,
      name: 'Order Process',
      color: '#ef4444', // Red / Coral
      lightBg: '#fef2f2',
      borderColor: '#fca5a5',
      icon: PhoneCall,
      description: 'Atelier concierge calls on phone to verify measurements & fit'
    },
    {
      id: 3,
      name: 'Confirm & Pay',
      color: '#a855f7', // Purple
      lightBg: '#faf5ff',
      borderColor: '#d8b4fe',
      icon: BadgeCheck,
      description: 'Pay via UPI/Bank, submit 12-digit UTR & payment screenshot'
    },
    {
      id: 4,
      name: 'Quality Check',
      color: '#6366f1', // Indigo / Violet
      lightBg: '#eef2ff',
      borderColor: '#a5b4fc',
      icon: ClipboardCheck,
      description: 'Direct manufacturer inspection of fabric weave & hand-stitching'
    },
    {
      id: 5,
      name: 'Packing',
      color: '#0284c7', // Sky Blue
      lightBg: '#f0f9ff',
      borderColor: '#7dd3fc',
      icon: Package,
      description: 'Bespoke atelier luxury boxing with protective garment dust bag'
    },
    {
      id: 6,
      name: 'Delivery',
      color: '#10b981', // Emerald / Teal
      lightBg: '#ecfdf5',
      borderColor: '#6ee7b7',
      icon: Truck,
      description: 'Insured express doorstep delivery with live door-to-door tracking'
    }
  ];

  return (
    <section className="how-to-order-section" id="how-to-order-platform">
      <div className="how-to-order-container">
        {/* Header */}
        <div className="how-to-order-header">
          <div className="platform-brand-pill">
            <Sparkles size={14} />
            <span>SONEX ENTERPRISES DIRECT MANUFACTURING</span>
          </div>

          <h2 className="how-to-order-title">
            How to Order on Our Platform
          </h2>

          {/* Ornamental Divider inspired by the original graphic */}
          <div className="ornamental-divider">
            <svg width="260" height="24" viewBox="0 0 260 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 12H80M180 12H260" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3"/>
              {/* Left diamond */}
              <polygon points="88,12 94,6 100,12 94,18" fill="none" stroke="#0f172a" strokeWidth="1.5"/>
              {/* Center decorative cluster */}
              <polygon points="106,12 112,7 118,12 112,17" fill="#0f172a"/>
              <polygon points="120,12 130,4 140,12 130,20" fill="none" stroke="#0f172a" strokeWidth="2"/>
              <circle cx="130" cy="12" r="3" fill="#e11d48"/>
              <polygon points="142,12 148,7 154,12 148,17" fill="#0f172a"/>
              {/* Right diamond */}
              <polygon points="160,12 166,6 172,12 166,18" fill="none" stroke="#0f172a" strokeWidth="1.5"/>
            </svg>
          </div>

          <p className="how-to-order-subtext">
            Transparent, zero-middleman ordering directly from our manufacturing atelier to your wardrobe.
          </p>
        </div>

        {/* Process Steps Bar & Timeline Flow */}
        <div className="order-process-timeline-wrap">
          {/* Continuous Multi-Color Connecting Bar (Desktop) */}
          <div className="process-connecting-track">
            <div className="track-segment" style={{ backgroundColor: '#f97316' }} />
            <div className="track-segment" style={{ backgroundColor: '#ef4444' }} />
            <div className="track-segment" style={{ backgroundColor: '#a855f7' }} />
            <div className="track-segment" style={{ backgroundColor: '#6366f1' }} />
            <div className="track-segment" style={{ backgroundColor: '#0284c7' }} />
            <div className="track-segment" style={{ backgroundColor: '#10b981' }} />
          </div>

          {/* Process Steps List */}
          <div className="process-steps-grid">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div key={step.id} className="process-step-card">
                  {/* Step Bubble Indicator */}
                  <div className="step-circle-wrapper">
                    <div 
                      className="step-circle-outer"
                      style={{ 
                        borderColor: step.color,
                        boxShadow: `0 8px 20px -4px ${step.color}35`
                      }}
                    >
                      <div 
                        className="step-circle-inner"
                        style={{ backgroundColor: step.lightBg }}
                      >
                        <IconComp size={28} color={step.color} strokeWidth={2.2} />
                      </div>
                    </div>

                    {/* Small Node on Track */}
                    <div 
                      className="step-track-node"
                      style={{ backgroundColor: '#ffffff', borderColor: step.color }}
                    >
                      <span className="step-number" style={{ color: step.color }}>{step.id}</span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="step-info-block">
                    <h3 
                      className="step-title-text"
                      style={{ color: step.color }}
                    >
                      {step.name}
                    </h3>
                    <p className="step-desc-text">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Badges Bar below the process */}
        <div className="platform-direct-guarantee-bar">
          <div className="guarantee-chip">
            <span className="bullet-dot" style={{ backgroundColor: '#f97316' }} />
            <span><strong>Zero Middlemen:</strong> Factory-direct pricing</span>
          </div>
          <div className="guarantee-chip">
            <span className="bullet-dot" style={{ backgroundColor: '#a855f7' }} />
            <span><strong>Manual UTR Match:</strong> 100% verified accounting</span>
          </div>
          <div className="guarantee-chip">
            <span className="bullet-dot" style={{ backgroundColor: '#10b981' }} />
            <span><strong>Fitting Call:</strong> Personal concierge measurement check</span>
          </div>
        </div>
      </div>
    </section>
  );
}
