import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, Lock, FileText, Calendar, User, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { rentalRequestService } from '../services/rentalRequestService';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../../../config';
import useAuthStore from '../../../store/useAuthStore';
import './RentalRequestPage.css';

const RentalRequestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const searchParams = new URLSearchParams(location.search);
  
  const roomId = searchParams.get('roomId');
  const initialMoveIn = searchParams.get('moveIn') || '';

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_URL}/listings/${roomId}`);
        if (res.data?.success) {
          setProperty(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch room details:', err);
      } finally {
        setProperty(prev => prev || null); // prevent infinite loading if empty
        setLoading(false);
      }
    };
    if (roomId) {
      fetchRoom();
    } else {
      setLoading(false);
    }
  }, [roomId]);

  const [formData, setFormData] = useState({
    moveInDate: initialMoveIn,
    leaseDuration: '6',
    tenantName: user?.full_name || '',
    tenantIc: '',
    tenantIcIssueDate: '',
    tenantIcIssuePlace: 'Cục Cảnh sát Quản lý hành chính về trật tự xã hội',
    tenantPermanentAddress: '',
    message: '',
    agreeToTerms: true
  });

  useEffect(() => {
    if (user && !formData.tenantName) {
      setFormData(prev => ({ ...prev, tenantName: user.full_name || '' }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.moveInDate) {
      toast.error('Vui lòng chọn ngày nhận phòng.');
      return;
    }

    const selectedDate = new Date(formData.moveInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Ngày nhận phòng không thể ở quá khứ.');
      return;
    }

    if (!formData.tenantName || !formData.tenantIc || !formData.tenantIcIssueDate || !formData.tenantIcIssuePlace || !formData.tenantPermanentAddress) {
      toast.error('Vui lòng nhập đầy đủ thông tin cá nhân của bạn phục vụ cho hợp đồng.');
      return;
    }

    if (formData.tenantIc.length !== 12 || !/^\d{12}$/.test(formData.tenantIc)) {
      toast.error('Số CCCD phải có đúng 12 chữ số.');
      return;
    }

    try {
      setLoading(true);
      const response = await rentalRequestService.createRequest({
        roomId: parseInt(roomId, 10),
        message: formData.message,
        requestedMoveInDate: formData.moveInDate,
        leaseDurationMonths: parseInt(formData.leaseDuration, 10),
        tenantName: formData.tenantName,
        tenantIc: formData.tenantIc,
        tenantIcIssueDate: formData.tenantIcIssueDate,
        tenantIcIssuePlace: formData.tenantIcIssuePlace,
        tenantPermanentAddress: formData.tenantPermanentAddress
      });

      if (response.success) {
        toast.success('Gửi yêu cầu thuê phòng thành công!');
        navigate('/tenant/requests');
      }
    } catch (err) {
      toast.error('Gửi yêu cầu thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#4f46e5' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ fontWeight: '600' }}>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ gap: '1rem' }}>
        <p className="text-red-500 font-semibold" style={{ fontSize: '1.2rem' }}>Property/Room not found</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}>
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>
    );
  }

  const imageUrl = property.images?.length > 0 
    ? (property.images[0].image_url && property.images[0].image_url.startsWith('http') ? property.images[0].image_url : `http://localhost:5000${property.images[0].image_url}`)
    : (property.thumbnailUrl ? (property.thumbnailUrl && property.thumbnailUrl.startsWith('http') ? property.thumbnailUrl : `http://localhost:5000${property.thumbnailUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60');

  return (
    <div className="rental-request-page">
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        <div className="request-content-layout">
          
          {/* Left Column: Room Info Card (Compact) */}
          <div className="request-left-summary">
            <div className="property-summary-card">
              <div className="property-image-wrapper">
                <img src={imageUrl} alt={property.title} />
              </div>
              <div className="property-details">
                <h2 className="property-title">{property.title}</h2>
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.address}</span>
                </div>
                <hr className="divider" />
                <div className="property-price-section">
                  <span className="price-label">Giá Thuê Hằng Tháng</span>
                  <div className="price-value">
                    <span className="amount">{property.pricePerMonth?.toLocaleString('vi-VN') || property.price_per_month?.toLocaleString('vi-VN')} đ</span>
                    <span className="period"> / tháng</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="trust-badge-card">
              <div className="trust-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="trust-content">
                <h3>{t('rentalRequest.landlordVerified', 'Landlord Verified')}</h3>
                <p>Tin đăng được liên kết trực tiếp với chủ trọ đã xác thực qua CCCD. Tiền đặt cọc của bạn được đảm bảo an toàn tuyệt đối qua hệ thống.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Request Rental Contract Form */}
          <div className="request-right-form">
            <div className="contract-request-card">
              <div className="contract-request-header">
                <div className="header-icon-circle">
                  <FileText size={20} className="header-icon" />
                </div>
                <h1 className="header-title">Request Rental Contract</h1>
              </div>

              {/* Green alert info box */}
              <div className="green-alert-box">
                <p className="alert-room-info"><strong>Room:</strong> {property.title}</p>
                <p className="alert-sub-info">You will pay the security deposit and first month's rent when you sign the contract.</p>
              </div>

              <form onSubmit={handleSubmit} className="rental-request-form-body">
                <div className="form-double-cols">
                  <div className="form-group-field">
                    <label className="form-input-label">Move-in Date <span className="text-danger">*</span></label>
                    <input 
                      type="date" 
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      className="form-text-input"
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label className="form-input-label">Duration (Months) <span className="text-danger">*</span></label>
                    <div className="form-select-wrapper">
                      <select 
                        name="leaseDuration" 
                        value={formData.leaseDuration}
                        onChange={handleChange}
                        className="form-select-input"
                      >
                        <option value="3">3 Months</option>
                        <option value="6">6 Months</option>
                        <option value="9">9 Months</option>
                        <option value="12">12 Months</option>
                        <option value="18">18 Months</option>
                        <option value="24">24 Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section-separator">
                  <span className="section-separator-title">Tenant Information (For Contract)</span>
                  <div className="separator-line"></div>
                </div>

                <div className="form-group-field">
                  <label className="form-input-label">Full Name <span className="text-danger">*</span></label>
                  <div className="input-with-icon">
                    <User size={16} className="input-inner-icon" />
                    <input 
                      type="text" 
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleChange}
                      className="form-text-input has-icon"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                </div>

                <div className="form-double-cols">
                  <div className="form-group-field">
                    <label className="form-input-label">CCCD/CMND (12 digits) <span className="text-danger">*</span></label>
                    <input 
                      type="text" 
                      name="tenantIc"
                      value={formData.tenantIc}
                      onChange={handleChange}
                      maxLength={12}
                      className="form-text-input"
                      placeholder="012345678901"
                      required
                    />
                  </div>
                  <div className="form-group-field">
                    <label className="form-input-label">Issue Date <span className="text-danger">*</span></label>
                    <input 
                      type="date" 
                      name="tenantIcIssueDate"
                      value={formData.tenantIcIssueDate}
                      onChange={handleChange}
                      className="form-text-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group-field">
                  <label className="form-input-label">Issue Place <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    name="tenantIcIssuePlace"
                    value={formData.tenantIcIssuePlace}
                    onChange={handleChange}
                    className="form-text-input"
                    placeholder="Cục Cảnh sát Quản lý hành chính về trật tự xã hội"
                    required
                  />
                </div>

                <div className="form-group-field">
                  <label className="form-input-label">Permanent Address <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    name="tenantPermanentAddress"
                    value={formData.tenantPermanentAddress}
                    onChange={handleChange}
                    className="form-text-input"
                    placeholder="123 Duong ABC, Phuong XYZ, Quan 1, TP HCM"
                    required
                  />
                </div>

                <div className="form-group-field">
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Optional message to the landlord..."
                    rows="3"
                    className="form-textarea-input"
                  />
                </div>

                <div className="form-actions-buttons">
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)} 
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                  >
                    Send Contract Request
                  </button>
                </div>

                <div className="security-notice">
                  <Lock size={12} />
                  <span>Thông tin cá nhân của bạn được mã hóa bảo mật tuyệt đối</span>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RentalRequestPage;
