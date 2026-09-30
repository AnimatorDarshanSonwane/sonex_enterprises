import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  ArrowRight, 
  Truck, 
  RotateCw, 
  RotateCcw,
  ShieldCheck, 
  Headphones, 
  Globe, 
  CheckCircle2, 
  CreditCard,
  Lock,
  ChevronDown,
  MapPin,
  Clock,
  Building2,
  Layers,
  TrendingUp,
  FileText
} from 'lucide-react';
import SonexBrandLogo from './SonexBrandLogo';
import { 
  DEFAULT_SOCIAL_LINKS, 
  fetchSocialLinks, 
  subscribeToSocialLinks 
} from '../services/storeService';

const InstagramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function AtelierFooter({
  onSelectCategory,
  onOpenProfile,
  onOpenPolicyModal,
  socialLinks: customSocialLinks
}) {
  const [internalSocialLinks, setInternalSocialLinks] = useState(() => {
    try {
      const cached = localStorage.getItem('sonex_social_links_v1');
      if (cached) return { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(cached) };
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_SOCIAL_LINKS;
  });

  useEffect(() => {
    // 1. Initial fetch from Firestore / Cache
    fetchSocialLinks().then(res => {
      if (res) setInternalSocialLinks(res);
    });

    // 2. Real-time Firestore subscription: updates instantly when Admin changes show/hide or URL
    const unsubscribe = subscribeToSocialLinks((updated) => {
      if (updated) setInternalSocialLinks(updated);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const socialLinks = customSocialLinks || internalSocialLinks;

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR (₹)');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="professional-atelier-footer">
      {/* 1. Value Pillars & Direct Manufacturer Guarantees (Trust Banner) */}
      <section className="footer-pillars-strip">
        <div className="pillars-container">
          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Building2 size={22} />
            </div>
            <div className="pillar-content">
              <h4>Direct Mill Wholesale Pricing</h4>
              <p>Sourced directly from Surat textile looms, providing factory bulk rates for single &amp; double piece retail orders.</p>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <RotateCcw size={22} />
            </div>
            <div className="pillar-content">
              <h4>Bundle Pooling &amp; 100% Refund</h4>
              <p>Orders pool into manufacturing bundles. If minimum lot quota is not met, 100% payment is refunded immediately with 0 deduction.</p>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <RotateCw size={22} />
            </div>
            <div className="pillar-content">
              <h4>Interactive 360° Fit Guarantee</h4>
              <p>Zero-guesswork sizing with digital 360° turnaround showroom inspection and genuine Indian fabric drape.</p>
            </div>
          </div>

          <div className="pillar-item">
            <div className="pillar-icon-box">
              <Truck size={22} />
            </div>
            <div className="pillar-content">
              <h4>Insured Pan-India &amp; Global Dispatch</h4>
              <p>Dispatched direct from Surat manufacturing hub across all 19,000+ Indian pincodes with live courier tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Newsletter / VIP Direct Manufacturer Circle */}
      <section className="footer-newsletter-section">
        <div className="newsletter-card-inner">
          <div className="newsletter-left">
            <div className="newsletter-badge">
              <Sparkles size={14} />
              <span>DIRECT FACTORY WHOLESALE ATELIER</span>
            </div>
            <h3 className="newsletter-headline">
              Join Our Exclusive Factory Batch &amp; Season Club
            </h3>
            <p className="newsletter-subline">
              Get early access to upcoming Indian festive production batches (Navratri Chaniya Choli, Diwali Silk Sarees, Wedding Trousseau) at direct Surat loom prices before bundle quotas fill up.
            </p>
          </div>

          <div className="newsletter-right">
            {isSubscribed ? (
              <div className="newsletter-success-box">
                <CheckCircle2 size={24} className="success-icon" />
                <div>
                  <h5>Welcome to Sonex Factory Circle</h5>
                  <p>You will now receive priority notifications for newly opened manufacturer batches.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form-group">
                <div className="newsletter-input-wrap">
                  <div className="newsletter-input-inner">
                    <Mail size={18} className="newsletter-icon" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email for batch alerts..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="newsletter-input"
                    />
                  </div>
                  <button type="submit" className="newsletter-submit-btn">
                    <span>Subscribe</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <span className="newsletter-privacy-note">
                  By subscribing, you agree to our Terms &amp; Refund Policy. No spam, only genuine wholesale batch alerts.
                </span>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. Main Multi-Column Navigation Links (Indian Manufacturer Categories) */}
      <section className="footer-navigation-columns">
        <div className="columns-grid-container">
          {/* Brand & Manufacturer Intro Column */}
          <div className="footer-column brand-info-col">
            <SonexBrandLogo size="md" subtitle="DIRECT TEXTILE MANUFACTURER & ATELIER" />
            <p className="brand-mission-text">
              Direct Indian textile manufacturer and factory-to-consumer atelier based in the textile capital of Surat, Gujarat. We source bulk loom production lots directly and pool single &amp; double piece retail orders into manufacturing bundles — passing genuine factory wholesale prices directly to you with an absolute 100% money-back batch guarantee.
            </p>
            <div className="atelier-contact-chips">
              <div className="contact-chip">
                <MapPin size={14} />
                <span>Textile Hub: Ring Road Textile Market, Surat, Gujarat - 395002</span>
              </div>
              <div className="contact-chip">
                <Clock size={14} />
                <span>Concierge: Mon – Sat 9:00 AM to 8:30 PM IST (Direct Support)</span>
              </div>
              <div className="contact-chip">
                <ShieldCheck size={14} />
                <span>Sourcing: Surat, Varanasi, Kanchipuram &amp; Chanderi Master Looms</span>
              </div>
            </div>
          </div>

          {/* Column 1: Indian Season & Festive Collections */}
          <div className="footer-column">
            <h5 className="column-title">
              <Sparkles size={14} className="col-title-icon" />
              Indian Season Collections
            </h5>
            <ul className="footer-links-list">
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Navratri Special')}
                >
                  Navratri Special Chaniya Choli
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Diwali Silk')}
                >
                  Diwali &amp; Dhanteras Royal Silk
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Wedding Trousseau')}
                >
                  Wedding Season &amp; Bridal Trousseau
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Eid Collection')}
                >
                  Eid Royal Sharara &amp; Gharara
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Karwa Chauth')}
                >
                  Karwa Chauth &amp; Teej Festive Red
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Summer Season')}
                >
                  Summer Season Lawn &amp; Chiffon
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Winter Velvet')}
                >
                  Winter Velvet &amp; Pashmina Royal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Women's Ethnic & Wear (Manufacturer Direct) */}
          <div className="footer-column">
            <h5 className="column-title">Women's Ethnic Wear</h5>
            <ul className="footer-links-list">
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Sarees')}
                >
                  Pure Silk, Banarasi &amp; Bandhani Sarees
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Lehengas')}
                >
                  Bridal &amp; Festive Designer Lehengas
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Kurtis & Coords')}
                >
                  Kurti Catalogs, Tunics &amp; Coord Sets
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Salwar Suits')}
                >
                  Readymade Salwar Suits &amp; Anarkalis
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Party Gowns')}
                >
                  Partywear Indo-Western Gowns
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Georgette & Organza')}
                >
                  Pure Georgette &amp; Organza Drapes
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Dupattas & Blouses')}
                >
                  Designer Dupattas &amp; Stitched Blouses
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Men's Ethnic & Wedding Wear */}
          <div className="footer-column">
            <h5 className="column-title">Men's Ethnic Wear</h5>
            <ul className="footer-links-list">
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Sherwanis')}
                >
                  Royal Wedding Groom Sherwanis
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Kurta Pajama')}
                >
                  Kurta Pajama &amp; Modi / Nehru Jackets
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Dhoti & Bundi')}
                >
                  Traditional Bundi &amp; Silk Dhoti Sets
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Indo-Western')}
                >
                  Designer Indo-Western Jodhpuris
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Pathani Sets')}
                >
                  Festive Pathani Sets &amp; Bandhgalas
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Royal Safas')}
                >
                  Royal Silk Safas &amp; Groom Dupattas
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onSelectCategory && onSelectCategory('Casual Ethnic')}
                >
                  Men's Everyday Handloom Kurtas
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Manufacturer Policies & Trust */}
          <div className="footer-column">
            <h5 className="column-title">Policies &amp; Trust</h5>
            <ul className="footer-links-list">
              <li>
                <button 
                  type="button"
                  className="footer-link-btn policy-highlight" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('bundle-pooling')}
                >
                  <strong>Bundle Pooling &amp; 100% Refund Policy</strong>
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('manufacturer-pricing')}
                >
                  Direct Surat Mill Wholesale Pricing
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('terms-conditions')}
                >
                  Terms &amp; Conditions of Sale
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('bundle-pooling')}
                >
                  Single &amp; Double Piece Retail Model
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('upi-verification')}
                >
                  UPI Payment &amp; UTR Verification Guide
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('bundle-pooling')}
                >
                  Batch Quota &amp; Live Status Tracking
                </button>
              </li>
              <li>
                <button 
                  type="button"
                  className="footer-link-btn" 
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('manufacturer-pricing')}
                >
                  Surat Loom Quality Certification
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Payment Methods & Security Strip */}
      <section className="footer-payment-strip">
        <div className="payment-strip-container">
          <div className="payment-security-badge">
            <Lock size={15} />
            <span>100% DIRECT FACTORY BUNDLE POOLING • VERIFIED UPI PAYMENT • 100% REFUND GUARANTEE</span>
          </div>

          <div className="payment-providers-list">
            <span className="pay-card-pill">GOOGLE PAY</span>
            <span className="pay-card-pill">PHONEPE</span>
            <span className="pay-card-pill">PAYTM</span>
            <span className="pay-card-pill upi-highlight">OFFICIAL UPI: 9404692375@ybl</span>
          </div>
        </div>
      </section>

      {/* 5. Sub-Footer Bottom Bar */}
      <section className="footer-sub-bar">
        <div className="sub-bar-container">
          {/* Region / Currency */}
          <div className="region-selector-box">
            <Globe size={15} className="globe-icon" />
            <span className="region-name">Hub: <strong>Surat, Gujarat, India (EN/HI)</strong></span>
            <span className="region-sep">•</span>
            <div className="currency-selector">
              <span>Currency:</span>
              <select 
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="currency-dropdown"
              >
                <option value="INR (₹)">INR (₹) - Indian Rupee</option>
              </select>
            </div>
          </div>

          {/* Social Icons (Controlled Dynamically via Admin Command Center) */}
          <div className="footer-social-icons">
            {socialLinks?.instagram?.enabled !== false && (
              <a 
                href={socialLinks?.instagram?.url || "https://instagram.com"} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-btn" 
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <InstagramIcon />
              </a>
            )}
            {socialLinks?.youtube?.enabled !== false && (
              <a 
                href={socialLinks?.youtube?.url || "https://youtube.com"} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-btn" 
                aria-label="YouTube"
                title="Watch Factory Looms on YouTube"
              >
                <YoutubeIcon />
              </a>
            )}
            {socialLinks?.twitter?.enabled !== false && (
              <a 
                href={socialLinks?.twitter?.url || "https://twitter.com"} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-btn" 
                aria-label="Twitter / X"
                title="Follow us on X"
              >
                <XTwitterIcon />
              </a>
            )}
            {socialLinks?.facebook?.enabled !== false && (
              <a 
                href={socialLinks?.facebook?.url || "https://facebook.com"} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-btn" 
                aria-label="Facebook"
                title="Connect on Facebook"
              >
                <FacebookIcon />
              </a>
            )}
          </div>

          {/* Copyright */}
          <div className="footer-copyright-note">
            <span>© 2026 SONEX ENTERPRISES DIRECT TEXTILE MANUFACTURER &amp; ATELIER. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </section>
    </footer>
  );
}
