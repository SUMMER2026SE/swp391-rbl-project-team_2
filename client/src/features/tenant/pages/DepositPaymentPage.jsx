import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Star, MapPin, CreditCard, Landmark, Wallet, ShieldCheck, Lock, Info, Loader } from 'lucide-react';
import { roomService } from '../services/roomService';
import Button from '../../../components/common/Button';
import './DepositPaymentPage.css';

const DepositPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setError("No room specified for payment.");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        const response = await roomService.getRoomById(roomId);
        if (response.data.success) {
          setRoom(response.data.data);
        } else {
          setError("Failed to load room details.");
        }
      } catch (err) {
        setError("Error loading room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  const handlePayment = () => {
    alert("Payment successful! This is a mock implementation.");
    navigate('/tenant/requests');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <Info size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleCancel} className="w-full">Go Back</Button>
        </div>
      </div>
    );
  }

  // Calculate costs based on real data
  const basePrice = parseFloat(room.pricePerMonth) || 0;
  // Usually deposit is 1 month rent
  const securityDeposit = basePrice;
  const serviceFee = 45.00;
  const taxes = 12.50;
  const totalAmount = securityDeposit + serviceFee + taxes;

  const roomImage = room.images?.length > 0 
    ? `http://localhost:5000${room.images[0].image_url}` 
    : (room.thumbnailUrl ? `http://localhost:5000${room.thumbnailUrl}` : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80');

  return (
    <div className="payment-page">
      {/* Minimal Header */}
      <header className="payment-header">
        <div className="container payment-header-content">
          <div className="logo font-bold text-xl text-primary">RentalRoom</div>
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
                  src={roomImage} 
                  alt={room.title} 
                  className="summary-image"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'; }}
                />
                <div className="summary-rating">
                  <Star size={14} className="star-icon" />
                  <span>4.9</span>
                </div>
              </div>

              <div className="summary-content">
                <h3 className="summary-room-title">{room.title}</h3>
                <div className="summary-location">
                  <MapPin size={14} />
                  <span>{room.address}, {room.city}</span>
                </div>

                <div className="summary-breakdown">
                  <div className="breakdown-row">
                    <span>Security Deposit (1 Month)</span>
                    <span>${securityDeposit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Taxes</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Total Due Now</span>
                  <span className="total-amount">${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>

            <div className="secure-badge">
              <div className="secure-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="secure-text">
                <h4>Secure Payment</h4>
                <p>Your payment is encrypted and securely processed.<br/>RentalRoom does not store your full card details.</p>
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

              <Button variant="primary" fullWidth size="lg" className="btn-pay" onClick={handlePayment}>
                <Lock size={16} /> Pay ${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DepositPaymentPage;
