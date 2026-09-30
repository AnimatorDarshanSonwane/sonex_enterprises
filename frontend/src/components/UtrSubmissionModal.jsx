import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  FileCheck,
  ImageIcon
} from 'lucide-react';

export default function UtrSubmissionModal({
  isOpen,
  onClose,
  order,
  onSubmitUtr
}) {
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !order) return null;

  const upiId = '9404692375@ybl';

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Screenshot file size must be under 10MB');
        return;
      }
      setErrorMsg('');
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleProof = () => {
    // Generate a clean sample SVG preview for quick testing
    const sampleProof = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f1f5f9"/><text x="150" y="80" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23059669" text-anchor="middle">✓ UPI Payment Successful</text><text x="150" y="110" font-family="sans-serif" font-size="12" fill="%230f172a" text-anchor="middle">Amount: ' + order.total + '</text><text x="150" y="140" font-family="sans-serif" font-size="11" fill="%2364748b" text-anchor="middle">Ref UTR: 426819028491</text></svg>';
    setScreenshotPreview(sampleProof);
    if (!utrNumber) {
      setUtrNumber('426819028491');
    }
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setErrorMsg('Please enter the 12-digit UTR / Transaction Reference number.');
      return;
    }
    if (!screenshotPreview) {
      setErrorMsg('Please attach the payment screenshot proof.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitUtr({
        orderId: order.id,
        utrNumber: utrNumber.trim(),
        screenshotUrl: screenshotPreview,
        submittedAt: new Date().toLocaleString()
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="utr-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close UTR modal">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="utr-modal-header">
          <div className="utr-badge">
            <FileCheck size={14} />
            <span>PAYMENT VERIFICATION</span>
          </div>
          <h3 className="utr-modal-title">Submit Payment UTR &amp; Screenshot</h3>
          <p className="utr-order-summary">
            Order <strong>{order.id}</strong> • Amount Payable: <strong className="utr-amount-tag">{order.total}</strong>
          </p>
        </div>

        {/* UPI Payment Instructions Box */}
        <div className="upi-payment-info-box">
          <div className="upi-details-col">
            <span className="info-box-label">Scan &amp; Pay via Any UPI App</span>
            <div className="upi-id-row">
              <span className="upi-id-text">{upiId}</span>
              <button 
                type="button" 
                className="copy-upi-btn"
                onClick={handleCopyUpi}
                title="Copy UPI ID"
              >
                {copiedUpi ? <CheckCircle2 size={14} color="#059669" /> : <Copy size={14} />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="upi-supported-apps">
              Google Pay, PhonePe, Paytm, BHIM, Cred, or Net Banking
            </p>
          </div>

          <div className="upi-qr-placeholder">
            <QrCode size={48} className="qr-icon" />
            <span className="qr-label">UPI QR</span>
          </div>
        </div>

        {/* UTR & Screenshot Form */}
        <form onSubmit={handleSubmit} className="utr-form-body">
          {errorMsg && (
            <div className="utr-error-banner">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* UTR Input */}
          <div className="utr-input-group">
            <label className="utr-label">
              <span>12-Digit UTR / Transaction Reference Number</span>
              <span className="required-star">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. 426819028491 or UPI Ref ID"
              value={utrNumber}
              onChange={(e) => {
                setUtrNumber(e.target.value);
                setErrorMsg('');
              }}
              className="utr-text-input"
            />
            <span className="utr-field-hint">
              Found on your UPI / Net Banking payment confirmation receipt
            </span>
          </div>

          {/* Screenshot Upload Field */}
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
                    <span>Proof Screenshot Attached</span>
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
                <div className="dropzone-icon-circle">
                  <Upload size={22} />
                </div>
                <span className="dropzone-title">Click to upload payment receipt</span>
                <span className="dropzone-subtitle">PNG, JPG, or JPEG up to 10MB</span>
              </div>
            )}
          </div>

          {/* Expiration & Policy Notice */}
          <div className="utr-expiry-warning-box">
            <AlertCircle size={15} className="warning-icon" />
            <p>
              <strong>5-Day Payment Window:</strong> Payment must be submitted within 5 days of placing the order, otherwise the order will be automatically cancelled. Our team will verify the UTR and call you to confirm your tailored fit.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="utr-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Submitting Reference...</span>
            ) : (
              <>
                <span>Submit UTR for Atelier Verification</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="utr-modal-footer">
          <ShieldCheck size={14} />
          <span>Manual bank verification ensures 100% secure payment matching without gateway surcharges.</span>
        </div>
      </div>
    </div>
  );
}
