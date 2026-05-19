import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Home, 
  ShieldAlert, 
  RefreshCw, 
  Download, 
  ArrowRight, 
  Share2, 
  ExternalLink 
} from 'lucide-react';
import { ROUTES } from '../constants';
import './ErrorPage.css';

const ErrorPage = () => {
  const navigate = useNavigate();

  // 1. Email Verification Code State
  const [emailCode, setEmailCode] = useState(['4', '8', '2', '', '', '']);
  const inputRefs = useRef([]);

  // Email Code input change handler
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...emailCode];
    newCode[index] = value.slice(-1); // Take only the last digit typed
    setEmailCode(newCode);

    // Auto-focus next input if a value is typed
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace key handler
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Email Verification Feedback State
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleVerifyEmail = () => {
    setEmailLoading(true);
    setTimeout(() => {
      setEmailLoading(false);
      setEmailVerified(true);
      setTimeout(() => setEmailVerified(false), 3000);
    }, 1200);
  };

  // 2. Resend Code Countdown (starting at 45s)
  const [countdown, setCountdown] = useState(45);
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendCode = () => {
    if (countdown === 0) {
      setCountdown(45);
    }
  };

  // 3. SMS Verification State
  const [smsSent, setSmsSent] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);

  const handleSendSms = () => {
    setSmsLoading(true);
    setTimeout(() => {
      setSmsLoading(false);
      setSmsSent(true);
      setTimeout(() => setSmsSent(false), 4000);
    }, 1000);
  };

  // 4. Deposit Card actions
  const [receiptDownloading, setReceiptDownloading] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  const handleDownloadReceipt = () => {
    setReceiptDownloading(true);
    setTimeout(() => {
      setReceiptDownloading(false);
      setReceiptDownloaded(true);
      setTimeout(() => setReceiptDownloaded(false), 3000);
    }, 1500);
  };

  // 5. Listing share actions
  const [shareCopied, setShareCopied] = useState(false);
  const handleShareListing = () => {
    navigator.clipboard.writeText(window.location.origin + ROUTES.ROOMS);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  return (
    <div className="error-showcase-container">
      {/* Top Navigation / Brand Row */}
      <header className="showcase-header">
        <div className="header-left">
          <h1 className="showcase-title">Verification & Modals</h1>
          <p className="showcase-subtitle">Showcase of security flows and confirmation states.</p>
        </div>
        <div className="header-right">
          <div className="brand-badge">
            <ShieldAlert className="brand-logo-icon" size={18} />
            <span className="brand-logo-text">SmartBoarding</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="showcase-grid">
        
        {/* Left Column: Security/Verification Flows */}
        <section className="showcase-column">
          
          {/* Card 1: Check your email */}
          <article className="showcase-card email-verification-card">
            <div className="card-icon-wrapper blue-icon">
              <Mail size={24} />
            </div>
            
            <h2 className="card-title">Check your email</h2>
            <p className="card-description">
              We've sent a 6-digit verification code to <strong className="highlight-text">alex@example.com</strong>
            </p>

            {/* Verification Code Input Boxes */}
            <div className="verification-code-grid">
              {emailCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`code-input-box ${digit ? 'filled' : ''} ${index === 3 ? 'active-focus' : ''}`}
                  placeholder="-"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Verify Email Action Button */}
            <button 
              onClick={handleVerifyEmail}
              disabled={emailLoading || emailCode.some(d => !d)}
              className={`primary-btn verify-btn ${emailVerified ? 'success' : ''}`}
            >
              {emailLoading ? (
                <span className="loading-spinner"></span>
              ) : emailVerified ? (
                'Verified Successfully!'
              ) : (
                'Verify Email'
              )}
            </button>

            {/* Resend Action Footer */}
            <div className="card-footer-resend">
              <span>Didn't receive the code?</span>
              <button 
                onClick={handleResendCode}
                disabled={countdown > 0}
                className={`resend-action-link ${countdown === 0 ? 'active' : ''}`}
              >
                <RefreshCw size={14} className={countdown > 0 ? '' : 'spin-on-hover'} />
                <span>
                  {countdown > 0 ? `Resend in 0:${countdown.toString().padStart(2, '0')}` : 'Resend Code Now'}
                </span>
              </button>
            </div>
          </article>

          {/* Card 2: Verify via SMS */}
          <article className="showcase-card sms-verification-card">
            <div className="sms-card-content">
              <div className="card-icon-wrapper blue-icon flex-shrink-0">
                <MessageSquare size={20} />
              </div>
              <div className="sms-text-block">
                <h3 className="sms-title">Verify via SMS</h3>
                <p className="sms-subtext">Send code to ***-***-8912</p>
              </div>
            </div>
            <button 
              onClick={handleSendSms}
              disabled={smsLoading || smsSent}
              className={`secondary-btn sms-btn ${smsSent ? 'success-text' : ''}`}
            >
              {smsLoading ? (
                <span className="loading-spinner dark"></span>
              ) : smsSent ? (
                'Code Sent!'
              ) : (
                'Send SMS'
              )}
            </button>
          </article>

        </section>

        {/* Right Column: Confirmation/Success Modals */}
        <section className="showcase-column">
          
          {/* Card 3: Deposit Successful */}
          <article className="showcase-card deposit-success-card">
            {/* Top accent green border bar is styled via CSS border-top */}
            <div className="card-icon-wrapper green-icon">
              <CheckCircle2 size={24} />
            </div>

            <h2 className="card-title">Deposit Successful</h2>
            <p className="card-description max-w-sm">
              Your holding deposit of $500 has been securely processed for The Metropolitan Loft.
            </p>

            {/* Transaction Receipt info sheet */}
            <div className="receipt-details-panel">
              <div className="receipt-row">
                <span className="receipt-label">Transaction ID</span>
                <span className="receipt-value font-mono">#TRX-88291A</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Date</span>
                <span className="receipt-value">Oct 24, 2023 • 14:32</span>
              </div>
            </div>

            {/* Action buttons row */}
            <div className="receipt-actions-row">
              <button 
                onClick={handleDownloadReceipt}
                disabled={receiptDownloading}
                className="secondary-btn flex-1 download-receipt-btn"
              >
                {receiptDownloading ? (
                  <span className="loading-spinner dark"></span>
                ) : receiptDownloaded ? (
                  'Downloaded!'
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download Receipt</span>
                  </>
                )}
              </button>
              
              <button 
                onClick={() => navigate(ROUTES.HOME)}
                className="primary-btn flex-1 dashboard-redirect-btn"
              >
                <span>View Dashboard</span>
              </button>
            </div>
          </article>

          {/* Card 4: Listing Published */}
          <article className="showcase-card listing-published-card">
            {/* Top accent blue border bar is styled via CSS border-top */}
            <div className="card-icon-wrapper house-icon">
              <div className="house-icon-container">
                <Home size={24} />
                <span className="badge-check">✓</span>
              </div>
            </div>

            <h2 className="card-title">Listing Published!</h2>
            <p className="card-description max-w-sm">
              “Sunny Studio in Downtown” is now live and visible to potential tenants.
            </p>

            {/* Share listing button */}
            <button 
              onClick={handleShareListing}
              className={`primary-btn share-listing-btn ${shareCopied ? 'success-copied' : ''}`}
            >
              <Share2 size={16} />
              <span>{shareCopied ? 'Link Copied to Clipboard!' : 'Share Listing'}</span>
            </button>

            {/* Preview link footer */}
            <button 
              onClick={() => navigate(ROUTES.ROOMS)}
              className="preview-tenant-link"
              aria-label="Preview listing as a tenant"
            >
              <span>Preview as Tenant</span>
              <ArrowRight size={14} className="preview-arrow-icon" />
            </button>
          </article>

        </section>

      </main>
    </div>
  );
};

export default ErrorPage;
