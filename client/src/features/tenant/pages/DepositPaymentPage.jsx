import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Star, MapPin, CreditCard, Landmark, Wallet, ShieldCheck, Lock, Info } from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import './DepositPaymentPage.css';

const DepositPaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  return (
    <div className="payment-page">
      {/* Minimal Header */}
      <header className="payment-header">
        <div className="container payment-header-content">
          <div className="logo">SmartBoard</div>
          <button className="btn-cancel" onClick={handleCancel}>
            <X size={18} /> Cancel
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="payment-main container">
        <div className="payment-layout">
          
          {/* Left Column: Summary */}
          <div className="payment-summary-section">
            <h1 className="payment-title">Confirm & Pay</h1>
            <p className="payment-subtitle">Complete your deposit payment to secure your stay.</p>

            <div className="summary-card">
              <div className="summary-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600" 
                  alt="The Downtown Haven Studio" 
                  className="summary-image" 
                />
                <div className="summary-rating">
                  <Star size={14} className="star-icon" />
                  <span>4.9</span>
                </div>
              </div>

              <div className="summary-content">
                <h3 className="summary-room-title">The Downtown Haven Studio</h3>
                <div className="summary-location">
                  <MapPin size={14} />
                  <span>1204 Market Street, City Center</span>
                </div>

                <div className="summary-breakdown">
                  <div className="breakdown-row">
                    <span>Security Deposit</span>
                    <span>$1,200.00</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Service Fee</span>
                    <span>$45.00</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Taxes</span>
                    <span>$12.50</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Total Due Now</span>
                  <span className="total-amount">$1,257.50</span>
                </div>
              </div>
            </div>

            <div className="secure-badge">
              <div className="secure-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="secure-text">
                <h4>Secure Payment</h4>
                <p>Your payment is encrypted and securely processed.<br/>SmartBoard does not store your full card details.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="payment-form-section">
            <div className="payment-form-card">
              <h2 className="form-title">Payment Method</h2>
              
              <div className="payment-methods">
                <button 
                  className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} />
                  <span>Credit / Debit</span>
                </button>
                <button 
                  className={`method-tab ${paymentMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <Landmark size={20} />
                  <span>Bank Transfer</span>
                </button>
                <button 
                  className={`method-tab ${paymentMethod === 'wallet' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <Wallet size={20} />
                  <span>E-Wallet</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Name on Card</label>
                    <input type="text" placeholder="e.g. Jane Doe" />
                  </div>
                  
                  <div className="form-group">
                    <label>Card Number</label>
                    <div className="input-with-icon">
                      <input type="text" placeholder="0000 0000 0000 0000" />
                      <CreditCard size={18} className="input-icon" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Expiration Date</label>
                      <input type="text" placeholder="MM/YY" />
                    </div>
                    <div className="form-group half">
                      <label>CVV</label>
                      <div className="input-with-icon">
                        <input type="text" placeholder="123" />
                        <Info size={16} className="input-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="payment-terms">
                By selecting 'Pay Now', you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </div>

              <Button variant="primary" fullWidth size="lg" className="btn-pay">
                <Lock size={16} /> Pay $1,257.50
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DepositPaymentPage;
