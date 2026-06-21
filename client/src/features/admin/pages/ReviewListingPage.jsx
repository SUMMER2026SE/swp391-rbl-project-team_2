import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, CheckCircle, Bed, Users, Maximize, Home, ChevronLeft,
  XCircle, ShieldCheck, ShieldX, AlertTriangle, Clock, Eye
} from 'lucide-react';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import Carousel from 'react-bootstrap/Carousel';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../tenant/pages/RoomDetailPage.css';
import './ReviewListingPage.css';

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ duyệt',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: Clock,
  },
  available: {
    label: 'Đang hoạt động',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    icon: ShieldCheck,
  },
  rejected: {
    label: 'Đã từ chối',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fca5a5',
    icon: ShieldX,
  },
  hidden: {
    label: 'Vi phạm / Ẩn',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    icon: AlertTriangle,
  },
  rented: {
    label: 'Đang cho thuê',
    color: '#0284c7',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    icon: Eye,
  },
};

const ReviewListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        if (response.data.success) {
          setRoomData(response.data.data);
        } else {
          setError('Không tìm thấy phòng.');
        }
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin phòng.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleAdminAction = async (status, reason = '') => {
    try {
      setActionLoading(true);
      const res = await adminService.updateRoomStatus(id, status, reason);
      if (res.success) {
        const messages = {
          available: '✅ Đã duyệt phòng thành công!',
          rejected: '❌ Đã từ chối phòng.',
          hidden: '⚠️ Đã ẩn phòng do vi phạm.',
        };
        toast.success(messages[status] || 'Cập nhật thành công!');
        setRoomData(prev => ({ ...prev, status }));
        setShowRejectModal(false);
        setRejectReason('');
      }
    } catch (err) {
      toast.error('Cập nhật thất bại: ' + (err?.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div className="spinner-border text-primary" role="status" />
          <p style={{ marginTop: 12 }}>Đang tải thông tin phòng...</p>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <XCircle size={48} style={{ marginBottom: 12 }} />
          <p>{error || 'Không tìm thấy phòng.'}</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[roomData.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  const roomFacilities = roomData.facilities?.filter(f => f.category === 'room' || !f.category) || [];
  const nearbyFacilities = roomData.facilities?.filter(f => f.category === 'nearby') || [];

  const images = roomData.images?.length > 0
    ? roomData.images.map(img => img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000${img.image_url}`)
    : (roomData.thumbnailUrl
      ? [roomData.thumbnailUrl.startsWith('http') ? roomData.thumbnailUrl : `http://localhost:5000${roomData.thumbnailUrl}`]
      : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60']);

  return (
    <div className="room-detail-page container pt-20" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

      {/* Back Button */}
      <button
        className="back-btn"
        onClick={() => navigate('/admin/listings')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontWeight: 500, marginBottom: 20, fontSize: '0.95rem' }}
      >
        <ChevronLeft size={18} />
        Quay lại danh sách phòng
      </button>

      {/* Image Carousel */}
      <div className="custom-carousel-wrapper" style={{ position: 'relative', marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden' }}>
        <Carousel>
          {images.map((img, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={img}
                alt={`Slide ${idx}`}
                style={{ height: '480px', objectFit: 'cover' }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Content Layout */}
      <div className="content-sidebar-layout">
        {/* LEFT: Main Content */}
        <div className="main-content">
          <div className="property-header">
            <h1 className="room-detail-title">{roomData.title}</h1>
            <p className="room-detail-address">
              <MapPin size={16} />
              {[roomData.address, roomData.ward, roomData.district, roomData.city].filter(Boolean).join(', ')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="property-features">
            <div className="feature-card">
              <Bed className="feature-icon" />
              <span className="feature-value">{roomData.bedrooms || 1}</span>
              <span className="feature-label">Phòng ngủ</span>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <span className="feature-value">{roomData.maxOccupants || roomData.max_occupants || 1}</span>
              <span className="feature-label">Người tối đa</span>
            </div>
            <div className="feature-card">
              <Maximize className="feature-icon" />
              <span className="feature-value">{roomData.areaSqm || roomData.area_sqm || 15}</span>
              <span className="feature-label">m²</span>
            </div>
            <div className="feature-card">
              <Home className="feature-icon" />
              <span className="feature-value" style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>
                {roomData.roomType || roomData.room_type || 'Phòng riêng'}
              </span>
              <span className="feature-label">Loại phòng</span>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Host Info */}
          <section className="host-card">
            <div className="host-info">
              <img
                src={getGlobalAvatar(roomData.landlord?.full_name, roomData.landlord?.avatar_url || roomData.landlord?.avatarUrl, 100)}
                alt={roomData.landlord?.full_name || 'Chủ trọ'}
                className="host-avatar"
              />
              <div className="host-text">
                <h3>Quản lý bởi {roomData.landlord?.full_name || 'Chủ trọ'}</h3>
                <p>SĐT: {roomData.landlord?.phone || 'Chưa cập nhật'}</p>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Email: {roomData.landlord?.email || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </section>

          <hr className="section-divider" />

          {/* About Section */}
          <section className="about-section">
            <h2>Mô tả phòng</h2>
            <div className={`about-text ${showMoreAbout ? 'expanded' : ''}`}
              style={!showMoreAbout ? { maxHeight: '120px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' } : {}}>
              <p style={{ color: '#4b5563', lineHeight: 1.7 }}>{roomData.description || 'Chưa có mô tả.'}</p>
            </div>
            {roomData.description && roomData.description.length > 200 && (
              <button
                className="show-more-link"
                onClick={() => setShowMoreAbout(!showMoreAbout)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
              >
                {showMoreAbout ? 'Thu gọn ▲' : 'Xem thêm ▼'}
              </button>
            )}
          </section>

          <hr className="section-divider" />

          {/* Amenities Section */}
          <section className="amenities-section">
            <h2>Tiện ích phòng</h2>
            {roomFacilities.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Trong phòng</h3>
                <div className="amenities-grid">
                  {roomFacilities.map((amenity, idx) => (
                    <div className="amenity-item" key={`room-${idx}`}>
                      <CheckCircle size={20} className="amenity-icon" style={{ color: '#10b981' }} />
                      <span>{amenity.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {nearbyFacilities.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Tiện ích lân cận</h3>
                <div className="amenities-grid">
                  {nearbyFacilities.map((amenity, idx) => (
                    <div className="amenity-item" key={`nearby-${idx}`}>
                      <MapPin size={20} className="amenity-icon" style={{ color: '#3b82f6' }} />
                      <span>{amenity.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {roomFacilities.length === 0 && nearbyFacilities.length === 0 && (
              <p style={{ color: '#9ca3af' }}>Chưa có tiện ích được liệt kê.</p>
            )}
          </section>
        </div>

        {/* RIGHT: Admin Action Sidebar */}
        <div className="sidebar-container">
          <div className="sidebar-sticky">

            {/* Price Card */}
            <div className="price-section" style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <div className="price-header">
                <span className="price-value">
                  {(roomData.pricePerMonth || roomData.price_per_month)?.toLocaleString('vi-VN')} đ
                </span>
                <span className="price-unit">/ tháng</span>
              </div>

              {/* Status Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: statusInfo.bg, border: `1px solid ${statusInfo.border}`,
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
              }}>
                <StatusIcon size={18} style={{ color: statusInfo.color, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: statusInfo.color, fontSize: '0.9rem' }}>
                    {statusInfo.label}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>Trạng thái hiện tại</p>
                </div>
              </div>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '0 0 16px 0' }} />

              {/* Room Info Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#9ca3af' }}>Thành phố</span>
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>{roomData.city || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#9ca3af' }}>Quận / Huyện</span>
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>{roomData.district || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#9ca3af' }}>Loại phòng</span>
                  <span style={{ fontWeight: 500, color: '#1f2937', textTransform: 'capitalize' }}>
                    {roomData.roomType || roomData.room_type || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#9ca3af' }}>Diện tích</span>
                  <span style={{ fontWeight: 500, color: '#1f2937' }}>{roomData.areaSqm || roomData.area_sqm || '—'} m²</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              {roomData.status === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="admin-action-btn approve"
                    onClick={() => handleAdminAction('available')}
                    disabled={actionLoading}
                  >
                    <ShieldCheck size={18} />
                    {actionLoading ? 'Đang xử lý...' : 'Duyệt phòng'}
                  </button>
                  <button
                    className="admin-action-btn reject"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    <ShieldX size={18} />
                    Từ chối
                  </button>
                </div>
              )}

              {roomData.status === 'available' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#ecfdf5', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={16} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 500 }}>Phòng đã được duyệt</span>
                  </div>
                  <button
                    className="admin-action-btn violation"
                    onClick={() => handleAdminAction('hidden')}
                    disabled={actionLoading}
                  >
                    <AlertTriangle size={18} />
                    Ẩn do vi phạm
                  </button>
                </div>
              )}

              {roomData.status === 'rejected' && (
                <div>
                  <div style={{ background: '#fef2f2', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <XCircle size={16} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 500 }}>Phòng đã bị từ chối</span>
                  </div>
                  <button
                    className="admin-action-btn approve"
                    onClick={() => handleAdminAction('available')}
                    disabled={actionLoading}
                  >
                    <ShieldCheck size={18} />
                    Duyệt lại phòng
                  </button>
                </div>
              )}

              {roomData.status === 'hidden' && (
                <div>
                  <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <AlertTriangle size={16} style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: '0.85rem', color: '#6d28d9', fontWeight: 500 }}>Phòng đang bị ẩn</span>
                  </div>
                  <button
                    className="admin-action-btn approve"
                    onClick={() => handleAdminAction('available')}
                    disabled={actionLoading}
                  >
                    <ShieldCheck size={18} />
                    Khôi phục phòng
                  </button>
                </div>
              )}

              {roomData.status === 'rented' && (
                <div style={{ background: '#e0f2fe', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Eye size={16} style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 500 }}>Phòng đang được thuê</span>
                </div>
              )}
            </div>

            {/* Landlord Quick Info */}
            <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: 12 }}>Thông tin chủ trọ</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={getGlobalAvatar(roomData.landlord?.full_name, roomData.landlord?.avatar_url || roomData.landlord?.avatarUrl, 80)}
                  alt={roomData.landlord?.full_name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>
                    {roomData.landlord?.full_name || 'Chủ trọ'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                    {roomData.landlord?.phone || 'Chưa có SĐT'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldX size={24} style={{ color: '#dc2626' }} />
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Từ chối phòng</h2>
            </div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#374151', fontSize: '0.9rem' }}>
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối để thông báo cho chủ trọ..."
              rows={4}
              style={{
                width: '100%', padding: 12, border: '1px solid #d1d5db',
                borderRadius: 8, fontSize: '0.95rem', resize: 'vertical',
                marginBottom: 20, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
              >
                Hủy
              </button>
              <button
                className="btn-confirm"
                style={{ background: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => handleAdminAction('rejected', rejectReason)}
                disabled={actionLoading}
              >
                <ShieldX size={16} />
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewListingPage;
