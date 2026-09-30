import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  RotateCcw, 
  Building2, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  CreditCard, 
  Clock, 
  Info,
  HelpCircle,
  TrendingUp,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function PolicyTermsModal({
  isOpen,
  onClose,
  initialTab = 'bundle-pooling'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync initial tab when reopened
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="policy-modal-backdrop modal-backdrop-overlay" onClick={onClose}>
      <div 
        className="policy-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
      >
        {/* Modal Header */}
        <header className="policy-modal-header">
          <div className="policy-header-badge">
            <Building2 size={15} />
            <span>SONEX ENTERPRISES • SURAT DIRECT TEXTILE MANUFACTURER</span>
          </div>
          <div className="policy-header-row">
            <div>
              <h2 id="policy-modal-title" className="policy-title">
                Manufacturer Terms, Pooling &amp; Refund Policy
              </h2>
              <p className="policy-subtitle">
                Transparent direct factory wholesale sourcing, single &amp; double piece retail pooling, and 100% money-back quota guarantee.
              </p>
            </div>
            <button 
              className="policy-close-btn" 
              onClick={onClose} 
              aria-label="Close policy modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="policy-tabs-nav" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'bundle-pooling'}
              className={`policy-tab-btn ${activeTab === 'bundle-pooling' ? 'active' : ''}`}
              onClick={() => setActiveTab('bundle-pooling')}
            >
              <Layers size={16} />
              <span>Bundle Pooling &amp; 100% Refund</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'manufacturer-pricing'}
              className={`policy-tab-btn ${activeTab === 'manufacturer-pricing' ? 'active' : ''}`}
              onClick={() => setActiveTab('manufacturer-pricing')}
            >
              <TrendingUp size={16} />
              <span>Direct Mill Pricing Model</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'terms-conditions'}
              className={`policy-tab-btn ${activeTab === 'terms-conditions' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms-conditions')}
            >
              <FileText size={16} />
              <span>Terms of Sale &amp; Dispatch</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'upi-verification'}
              className={`policy-tab-btn ${activeTab === 'upi-verification' ? 'active' : ''}`}
              onClick={() => setActiveTab('upi-verification')}
            >
              <CreditCard size={16} />
              <span>Payment &amp; UTR Verification</span>
            </button>
          </div>
        </header>

        {/* Modal Scrollable Body */}
        <div className="policy-modal-content">
          {/* TAB 1: BUNDLE POOLING & 100% REFUND POLICY */}
          {activeTab === 'bundle-pooling' && (
            <div className="policy-tab-pane">
              <div className="policy-highlight-banner gold">
                <div className="banner-icon-circle">
                  <RotateCcw size={22} />
                </div>
                <div className="banner-text">
                  <h4>100% Full Money-Back Guarantee on Unfulfilled Bundles</h4>
                  <p>
                    If an active manufacturing bundle fails to achieve its required batch quota within the production window, <strong>100% of your paid amount is refunded immediately</strong> to your original payment account without any deduction.
                  </p>
                </div>
              </div>

              <section className="policy-section">
                <h3 className="section-title">
                  <Layers size={18} className="sec-icon" />
                  1. How Manufacturer Bundle Pooling Works
                </h3>
                <p>
                  In the traditional Indian textile industry centered in Surat, primary fabric mills and garment manufacturers only cater to massive wholesale distributors buying 50 to 500-piece cartons. This typically leaves individual consumers and boutique shoppers paying 2x to 4x retail markups in physical shops.
                </p>
                <div className="policy-steps-grid">
                  <div className="step-card">
                    <span className="step-number">01</span>
                    <h5>Single / Double Piece Booking</h5>
                    <p>Retail customers can select single (1 pc) or double (2 pcs) garments at genuine Surat wholesale factory rates.</p>
                  </div>
                  <div className="step-card">
                    <span className="step-number">02</span>
                    <h5>Production Batch Pooling</h5>
                    <p>Individual retail orders are grouped into a designated manufacturer production lot (bundle quota of 10 to 25 units).</p>
                  </div>
                  <div className="step-card">
                    <span className="step-number">03</span>
                    <h5>Mill Batch Initiation</h5>
                    <p>The moment the bundle threshold is completed, the order is locked and immediately sent to our Surat factory looms for precision tailoring.</p>
                  </div>
                </div>
              </section>

              <section className="policy-section">
                <h3 className="section-title">
                  <ShieldCheck size={18} className="sec-icon" />
                  2. The 100% Money-Back Batch Guarantee
                </h3>
                <p>
                  We prioritize complete transparency and financial security for every customer:
                </p>
                <ul className="policy-checklist">
                  <li>
                    <CheckCircle2 size={16} className="check-icon" />
                    <span><strong>Zero Risk for Customers:</strong> If a seasonal design run does not achieve its minimum required bundle quota within the designated booking timeframe (normally 5–7 working days), the batch is automatically closed.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="check-icon" />
                    <span><strong>Zero Deduction Refund:</strong> 100% of your paid amount is refunded directly to your original UPI / Bank account. There are zero cancellation charges, zero processing fees, and zero hidden penalties.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="check-icon" />
                    <span><strong>Instant Ledger Notification:</strong> You receive an instant notification in your Profile &rarr; Order History tab confirming the batch closure and refund reference ID.</span>
                  </li>
                </ul>
              </section>

              <section className="policy-section">
                <h3 className="section-title">
                  <Clock size={18} className="sec-icon" />
                  3. Batch Timeline &amp; Order Status Stages
                </h3>
                <div className="timeline-stages-table-wrap">
                  <table className="policy-table">
                    <thead>
                      <tr>
                        <th>Status Badge</th>
                        <th>Stage Description</th>
                        <th>Next Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge-pill pooling">Pooling in Batch</span></td>
                        <td>Order is secured and pooled into the current manufacturer lot. Quota is accumulating.</td>
                        <td>Waiting for bundle quota to complete (typically 24–72 hrs).</td>
                      </tr>
                      <tr>
                        <td><span className="badge-pill production">Quota Met • In Production</span></td>
                        <td>Bundle quota reached! Loom cutting, master stitching, and quality inspection underway in Surat.</td>
                        <td>Dispatched to courier within 2–4 days.</td>
                      </tr>
                      <tr>
                        <td><span className="badge-pill dispatched">Dispatched</span></td>
                        <td>Shipped with premier courier (Blue Dart, Delhivery, Speed Post) with live tracking number.</td>
                        <td>Doorstep delivery in 3–6 business days across India.</td>
                      </tr>
                      <tr>
                        <td><span className="badge-pill refunded">100% Refunded</span></td>
                        <td>Bundle quota was not met within cycle; full 100% refund credited back with 0 deductions.</td>
                        <td>Amount returned to original UPI / Bank account.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: DIRECT MANUFACTURER PRICING MODEL */}
          {activeTab === 'manufacturer-pricing' && (
            <div className="policy-tab-pane">
              <div className="policy-highlight-banner green">
                <div className="banner-icon-circle">
                  <TrendingUp size={22} />
                </div>
                <div className="banner-text">
                  <h4>Factory-Direct Sourcing from Surat Textile Capital</h4>
                  <p>
                    Sonex Enterprises partners directly with primary textile looms, weaving houses, and embroidery units in Surat, Gujarat — bringing wholesale rates to your wardrobe.
                  </p>
                </div>
              </div>

              <section className="policy-section">
                <h3 className="section-title">
                  <Building2 size={18} className="sec-icon" />
                  1. Elimination of Multi-Tier Middlemen
                </h3>
                <p>
                  Typical retail clothing journeys pass through Mill &rarr; Primary Wholesaler &rarr; Regional Distributor &rarr; Local Wholesaler &rarr; City Showroom &rarr; Customer. Each layer adds a 25% to 50% profit margin, GST transit, and retail showroom air-conditioning overheads.
                </p>
                <div className="comparison-cards-grid">
                  <div className="comp-card traditional">
                    <h5>Traditional Retail Showrooms</h5>
                    <ul>
                      <li>❌ 200% – 400% retail price markup</li>
                      <li>❌ High showroom maintenance costs added to dress cost</li>
                      <li>❌ Stale inventory sitting on shelves for months</li>
                      <li>❌ Limited collection variety per city</li>
                    </ul>
                  </div>

                  <div className="comp-card direct">
                    <h5>Sonex Direct Manufacturer Model</h5>
                    <ul>
                      <li>✅ Genuine Surat factory wholesale rates</li>
                      <li>✅ Zero middleman margins — savings passed to you</li>
                      <li>✅ Freshly woven, authentic loom fabric direct to customer</li>
                      <li>✅ Single &amp; double piece accessibility at bulk prices</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="policy-section">
                <h3 className="section-title">
                  <Sparkles size={18} className="sec-icon" />
                  2. Authentic Artisanal Craftsmanship
                </h3>
                <p>
                  Every collection is woven by master artisans utilizing authentic Indian textile techniques:
                </p>
                <ul className="policy-checklist">
                  <li><strong>Surat Zari &amp; Jacquard:</strong> Premium metallic zari weaving on pure georgette, silk, and organza.</li>
                  <li><strong>Banarasi &amp; Kanjeevaram Silk:</strong> Rich pallu designs with high-density thread work.</li>
                  <li><strong>Navratri Festive Chaniya Choli:</strong> Authentic mirror-work, kutchi embroidery, and 6 to 12-meter flared kalidar skirts.</li>
                  <li><strong>Royal Groom Sherwanis:</strong> Micro-velvet, raw silk, and hand-embroidered dabka and zardozi detailing.</li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 3: TERMS & CONDITIONS OF SALE */}
          {activeTab === 'terms-conditions' && (
            <div className="policy-tab-pane">
              <section className="policy-section">
                <h3 className="section-title">
                  <FileText size={18} className="sec-icon" />
                  1. Order Booking &amp; Allocation Terms
                </h3>
                <p>
                  When you place an order on the Sonex Enterprises platform:
                </p>
                <ul className="policy-checklist">
                  <li>
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>Your order acts as an active reservation in the current manufacturing bundle lot for that specific design, size, and colorway.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>Payment must be successfully completed via verified UPI (Google Pay, PhonePe, Paytm) with a valid 12-digit UTR reference number.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="check-icon" />
                    <span>Once the bundle lot quota is achieved, the order is locked for production and cannot be cancelled or modified, as cutting and tailoring commence immediately.</span>
                  </li>
                </ul>
              </section>

              <section className="policy-section">
                <h3 className="section-title">
                  <Truck size={18} className="sec-icon" />
                  2. Dispatch, Courier &amp; Pan-India Delivery
                </h3>
                <p>
                  We ensure insured door-to-door delivery across all 19,000+ pin codes in India and international consignments worldwide:
                </p>
                <div className="policy-steps-grid">
                  <div className="step-card">
                    <h5>Production &amp; Inspection</h5>
                    <p>2 to 4 working days after bundle quota completion for tailoring, steam pressing, and dual-stage quality checking.</p>
                  </div>
                  <div className="step-card">
                    <h5>Express Dispatch</h5>
                    <p>Handed over to premier express couriers (Blue Dart, Delhivery, DTDC, India Post) directly from our Surat hub.</p>
                  </div>
                  <div className="step-card">
                    <h5>Transit Time</h5>
                    <p>Metro cities: 2–3 business days. Rest of India: 4–6 business days. Live tracking SMS and email provided.</p>
                  </div>
                </div>
              </section>

              <section className="policy-section">
                <h3 className="section-title">
                  <AlertCircle size={18} className="sec-icon" />
                  3. Damaged or Defective Item Replacement
                </h3>
                <p>
                  We take pride in our zero-defect manufacturing standards. In the unlikely event of transit damage or manufacturing discrepancy:
                </p>
                <ul className="policy-checklist">
                  <li>Please record an uncut video while opening the outer courier packaging parcel.</li>
                  <li>Notify our Surat Concierge via WhatsApp or Helpdesk within 48 hours of delivery.</li>
                  <li>A complimentary replacement or full refund will be processed promptly upon inspection.</li>
                </ul>
              </section>
            </div>
          )}

          {/* TAB 4: UPI PAYMENT & UTR VERIFICATION */}
          {activeTab === 'upi-verification' && (
            <div className="policy-tab-pane">
              <div className="policy-highlight-banner blue">
                <div className="banner-icon-circle">
                  <CreditCard size={22} />
                </div>
                <div className="banner-text">
                  <h4>Official Verified Merchant UPI: 9404692375@ybl</h4>
                  <p>
                    Pay securely using Google Pay, PhonePe, or Paytm with zero transaction surcharge.
                  </p>
                </div>
              </div>

              <section className="policy-section">
                <h3 className="section-title">
                  <CreditCard size={18} className="sec-icon" />
                  1. How to Complete UPI Checkout
                </h3>
                <div className="policy-steps-grid">
                  <div className="step-card">
                    <span className="step-number">Step 1</span>
                    <h5>Scan QR or Copy UPI ID</h5>
                    <p>In the checkout modal, scan the dynamic merchant QR code or copy the UPI ID: <code>9404692375@ybl</code>.</p>
                  </div>
                  <div className="step-card">
                    <span className="step-number">Step 2</span>
                    <h5>Pay via Google Pay / PhonePe / Paytm</h5>
                    <p>Open your banking or UPI app, pay the exact order amount, and make note of the 12-digit UTR / Ref No.</p>
                  </div>
                  <div className="step-card">
                    <span className="step-number">Step 3</span>
                    <h5>Submit 12-Digit UTR</h5>
                    <p>Enter the 12-digit numerical UTR in the checkout prompt. Your order is immediately booked into the batch pool!</p>
                  </div>
                </div>
              </section>

              <section className="policy-section">
                <h3 className="section-title">
                  <ShieldCheck size={18} className="sec-icon" />
                  2. Admin Bank Reconciliation &amp; Fraud Prevention
                </h3>
                <p>
                  Every submitted UTR is cross-verified on our live banking statement by our executive finance desk. Fake or reused UTRs are automatically flagged and rejected. Verified orders receive immediate confirmation and are allocated to the active manufacturing bundle.
                </p>
                <div className="bank-reconcile-note">
                  <Info size={18} className="info-icon" />
                  <div>
                    <strong>Need Help with UTR Verification?</strong>
                    <p>If you made a payment but didn't receive the UTR immediately, check your bank SMS or UPI app transaction details. You can also contact our Surat support desk directly on WhatsApp with your payment screenshot.</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <footer className="policy-modal-footer">
          <div className="modal-footer-left">
            <MapPin size={15} />
            <span>Surat Textile Market Hub, Ring Road, Surat, Gujarat — 395002</span>
          </div>
          <button className="policy-confirm-btn" onClick={onClose}>
            <span>I Understand &amp; Agree</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
