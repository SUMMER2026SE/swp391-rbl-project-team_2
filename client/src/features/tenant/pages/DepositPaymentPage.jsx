import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Star, MapPin, CreditCard, Landmark, Wallet, ShieldCheck, Lock, Info, Loader } from 'lucide-react';
import { roomService } from '../services/roomService';
import Button from '../../../components/common/Button';
import api from '../../../services/api';
import './DepositPaymentPage.css';

const DepositPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
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
        if (response.success) {
          setRoom(response.data);
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

  const handlePayment = async () => {
    try {
      const response = await api.post('/tenant/payments/create_payment_url', {
        amount: Math.round(totalAmount), // VNPay needs integer amount in VND
        roomId: roomId,
        bankCode: 'NCB', // Default for sandbox
        language: 'vn'
      });
      if (response.success && response.url) {
        window.location.href = response.url;
        return;
      } else {
        toast.error('Failed to generate VNPay URL: ' + response.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Payment initialization failed: ' + (err?.response?.data?.message || err.message));
    }
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
  const totalAmount = securityDeposit;

  const roomImage = room.images?.length > 0 
    ? (room.images[0].image_url && room.images[0].image_url.startsWith('http') ? room.images[0].image_url : `http://localhost:5000${room.images[0].image_url}`) 
    : (room.thumbnailUrl ? (room.thumbnailUrl && room.thumbnailUrl.startsWith('http') ? room.thumbnailUrl : `http://localhost:5000${room.thumbnailUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80');

  return (
    <div className="payment-page">
      {/* Minimal Header */}
      <header className="payment-header">
        <div className="container payment-header-content">
          <div className="logo font-bold text-xl text-primary">RentWise</div>
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
                    <span>{securityDeposit.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Total Due Now</span>
                  <span className="total-amount">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="secure-badge">
              <div className="secure-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="secure-text">
                <h4>Secure Payment</h4>
                <p>Your payment is encrypted and securely processed.<br/>RentWise does not store your full card details.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="payment-form-section">
            <div className="payment-form-card">
              <h2 className="form-title">Payment Method</h2>
              
              <div className="payment-methods">
                <button 
                  className={`method-tab ${paymentMethod === 'vnpay' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('vnpay')}
                  style={{ fontWeight: paymentMethod === 'vnpay' ? 'bold' : 'normal' }}
                >
                  <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/oxqpsemggw1z1686814746087.png" alt="VNPay" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                  <span>VNPay (Sandbox)</span>
                </button>
              </div>

              <div className="payment-terms">
                By selecting 'Pay Now', you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </div>

              <Button variant="primary" fullWidth size="lg" className="btn-pay" onClick={handlePayment}>
                <Lock size={16} /> Pay {totalAmount.toLocaleString('vi-VN')} VNĐ
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DepositPaymentPage;
