import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Share2, Heart, MessageSquare, CheckCircle, Bed, Users, Maximize, Home, Compass, ChevronLeft
} from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { rentalRequestService } from '../services/rentalRequestService';
import { ROUTES } from '../../../constants';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import useAuthStore from '../../../store/useAuthStore';
import toast from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../../services/api';
import RoomCard from '../components/RoomCard';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  
  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', pricePerMonth: '' });

  const handleEditChange = (e) => setEditForm({...editForm, [e.target.name]: e.target.value});

  const handleSaveEdit = async () => {
    try {
      const payload = { ...editForm, pricePerMonth: Number(editForm.pricePerMonth) };
      const response = await api.put(`/landlord/rooms/${id}`, payload);
      if (response.success) {
        toast.success("Room updated successfully!");
        setRoomData({ ...roomData, ...payload, price_per_month: payload.pricePerMonth });
        setIsEditing(false);
      }
    } catch (e) {
      toast.error(e.message || "Failed to update room!");
    }
  };
  
  const [showDateModal, setShowDateModal] = useState(false);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');

  // Rental Request States
  const [showRentalRequestModal, setShowRentalRequestModal] = useState(false);
  const [rentalRequestMessage, setRentalRequestMessage] = useState('');

  const { user, isAuthenticated } = useAuthStore();

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        if (response.data.success) {
          setRoomData(response.data.data);
        }
        
        // Fetch favorite status if logged in as TENANT
        if (isAuthenticated && user?.role === 'TENANT') {
          try {
            const isFav = await favoriteService.checkFavoriteStatus(id);
            setIsFavorite(isFav);
          } catch (favErr) {
            console.error('Failed to fetch favorite status', favErr);
          }
        }

        // Fetch suggested rooms
        try {
          const allRes = await axios.get('http://localhost:5000/api/listings');
          if (allRes.data && allRes.data.success) {
            const listings = allRes.data.data;
            const currentRoom = response.data.data;
            const available = listings.filter(r => 
              (r.status === 'available' || !r.status) && 
              r.id !== parseInt(id) && 
              r.room_id !== parseInt(id) &&
              r.roomId !== parseInt(id)
            );
            
            let suggested = available.filter(r => r.district === currentRoom?.district && r.city === currentRoom?.city);
            if (suggested.length < 6) {
              const sameCity = available.filter(r => r.city === currentRoom?.city && r.district !== currentRoom?.district);
              suggested = [...suggested, ...sameCity];
            }
            if (suggested.length < 6) {
              const other = available.filter(r => r.city !== currentRoom?.city);
              suggested = [...suggested, ...other];
            }
            
            const formattedSuggestions = suggested.slice(0, 6).map(room => {
              const imgUrl = room.thumbnailUrl || room.thumbnail_url;
              return {
                id: room.id || room.room_id || room.roomId,
                title: room.title,
                price: room.pricePerMonth || room.price_per_month || 0,
                location: [room.address, room.district, room.city].filter(Boolean).join(', '),
                specs: [
                  { icon: 'bed', text: `${room.bedrooms || 1} Giường` },
                  { icon: 'square', text: `${room.areaSqm || room.area_sqm || 0} m²` }
                ],
                imageTags: [{ text: 'Còn phòng', type: 'primary' }],
                isFavorite: false, // We'd need to check this properly if needed, but default false is fine
                image: imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60'
              };
            });
            
            setSuggestedRooms(formattedSuggestions);
          }
        } catch (sugErr) {
          console.error("Failed to fetch suggestions", sugErr);
        }
      } catch (err) {
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, isAuthenticated, user]);

  const toggleFavorite = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      toast.error('Failed to update favorite status');
    }
  };

  const getToken = () => {
    try {
      const authStorage = JSON.parse(sessionStorage.getItem('auth-storage'));
      return authStorage?.state?.token || null;
    } catch { return null; }
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleScheduleViewing = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      if (!viewingDate) {
        toast.error('Please select a viewing date.');
        return;
      }
      if (!viewingTime) {
        toast.error('Please select a viewing time.');
        return;
      }
      if (viewingDate < todayDate) {
        toast.error('Viewing date must be today or a future date.');
        return;
      }

      // Combine date and time
      const combinedDateTime = `${viewingDate}T${viewingTime}:00`;

      const response = await rentalRequestService.requestViewing({
        roomId: parseInt(id, 10),
        notes: `Viewing request for ${viewingDate} at ${viewingTime}. Requested from room detail page.`,
        scheduledDate: combinedDateTime,
      });
      if (response.success) {
        toast.success('Viewing schedule requested successfully!');
        setShowDateModal(false);
        navigate(ROUTES.TENANT.REQUESTS);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule viewing');
    }
  };

  const handleSendRentalRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await rentalRequestService.createRequest({
        roomId: roomData.roomId || roomData.room_id,
        message: rentalRequestMessage
      });

      if (response.success) {
        toast.success("Rental request submitted successfully!");
        setShowRentalRequestModal(false);
        navigate(ROUTES.TENANT.REQUESTS);
      }
    } catch (err) {
      toast.error('Failed to submit request: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChatWithLandlord = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      // First, get or create conversation
      const landlordId = roomData.landlordId ?? roomData.landlord?.user_id;
      if (!landlordId) {
        toast.error('Failed to start chat. Landlord information is unavailable.');
        return;
      }
      const response = await axios.post('http://localhost:5000/api/chat/conversations', {
        participantId: landlordId,
        roomId: roomData.roomId ?? parseInt(id, 10),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const convId = response.data.data.conversationId;
        navigate(`/messages?conversationId=${convId}`);
      }
    } catch (err) {
      toast.error('Failed to start chat. ' + (err.response?.data?.message || ''));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !roomData) return <div className="p-8 text-center text-red-500">{error || 'Listing not found'}</div>;

  const roomFacilities = roomData.facilities?.filter(f => f.category === 'room' || !f.category) || [];
  const nearbyFacilities = roomData.facilities?.filter(f => f.category === 'nearby') || [];

  const images = roomData.images?.length > 0 
    ? roomData.images.map(img => img.image_url.startsWith('http') ? img.image_url : `http://localhost:5000${img.image_url}`)
    : (roomData.thumbnailUrl ? [roomData.thumbnailUrl.startsWith('http') ? roomData.thumbnailUrl : `http://localhost:5000${roomData.thumbnailUrl}`] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60']);
    
  

  return (
    <div className="room-detail-page container pt-20 pb-20 mb-10" style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '80px', marginBottom: '80px' }}>
      
      {/* Back button for convenient navigation */}
      <Button 
        variant="outline-primary" 
        onClick={() => {
          if (location.state?.from === 'viewing_schedule') {
            navigate(ROUTES.LANDLORD.SCHEDULES);
          } else {
            navigate(isAuthenticated && user?.role === 'LANDLORD' ? ROUTES.LANDLORD.LISTINGS : ROUTES.ROOMS);
          }
        }}
        className="mb-3 d-flex align-items-center gap-2"
        style={{ borderRadius: '20px', padding: '8px 16px', fontWeight: '500', width: 'fit-content' }}
      >
        <ChevronLeft size={18} />
        {location.state?.from === 'viewing_schedule' 
          ? 'Quay lại Lịch hẹn' 
          : (isAuthenticated && user?.role === 'LANDLORD' ? 'Quay lại danh sách phòng' : 'Quay lại Khám phá')
        }
      </Button>

      {/* Content Column Layout */}
      <div className="content-sidebar-layout">
        {/* Left Side: Room Details */}
        <div className="main-content">
          {/* Gallery Section */}
          <div className="room-gallery-container">
            <div className="main-image-wrapper">
              <img 
                src={images[activeImageIndex]} 
                alt={`Room image ${activeImageIndex + 1}`} 
                className="main-image"
              />
              
              {images.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="gallery-nav-btn prev">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={handleNextImage} className="gallery-nav-btn next">
                    <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  
                  <div className="gallery-counter">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="thumbnails-wrapper custom-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`thumbnail-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="property-header">
            {isEditing ? (
              <input name="title" value={editForm.title} onChange={handleEditChange} className="form-control mb-2" style={{ fontSize: '1.8rem', fontWeight: 700 }} />
            ) : (
              <h1 className="room-detail-title">{roomData.title}</h1>
            )}
            {roomData.roomNumber && (
              <p className="room-detail-address" style={{ marginTop: '0.2rem', marginBottom: '0.5rem', fontWeight: '500', color: '#4f46e5' }}>Phòng: {roomData.roomNumber}</p>
            )}
            <p className="room-detail-address"><MapPin size={16}/> {[roomData.address, roomData.ward, roomData.district, roomData.city].filter(Boolean).join(', ')}</p>
          </div>
          
          <div className="property-features">
            <div className="feature-card">
              <Bed className="feature-icon" />
              <span className="feature-value">{roomData.bedrooms || 1}</span>
              <span className="feature-label">Giường</span>
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
              <span className="feature-value" style={{ textTransform: 'capitalize' }}>
                Phòng cá nhân
              </span>
              <span className="feature-label">Loại phòng</span>
            </div>
          </div>

          <hr className="section-divider" />

          <hr className="section-divider" />

          {/* About Section */}
          <section className="about-section">
            <h2>Thông tin chi tiết</h2>
            <div className={`about-text ${showMoreAbout ? 'expanded' : ''}`}>
              {isEditing ? (
                 <textarea name="description" value={editForm.description} onChange={handleEditChange} className="form-control" rows={6} />
              ) : (
                 <p style={{ whiteSpace: 'pre-wrap' }}>{roomData.description}</p>
              )}
            </div>
            <button 
              className="show-more-link" 
              onClick={() => setShowMoreAbout(!showMoreAbout)}
            >
              {showMoreAbout ? 'Thu gọn' : 'Xem thêm'}
            </button>
          </section>

          <hr className="section-divider" />

          {/* Amenities Section */}
          <section className="amenities-section">
            <h2>Tiện nghi & Dịch vụ</h2>
            
            {roomFacilities.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Tiện ích trong phòng</h3>
                <div className="amenities-grid">
                  {roomFacilities.map((amenity, idx) => (
                    <div className="amenity-item" key={`room-${idx}`}>
                      <CheckCircle size={20} className="amenity-icon" />
                      <span>{amenity.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nearbyFacilities.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Tiện ích xung quanh</h3>
                <div className="amenities-grid">
                  {nearbyFacilities.map((amenity, idx) => (
                    <div className="amenity-item" key={`nearby-${idx}`}>
                      <MapPin size={20} className="amenity-icon" />
                      <span>{amenity.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {roomFacilities.length === 0 && nearbyFacilities.length === 0 && (
              <p style={{ color: '#64748b' }}>Chưa có thông tin tiện ích.</p>
            )}
          </section>
        </div>

        {/* Right Side: Booking Card */}
        <div className="sidebar-container">
          <div className="sidebar-sticky">
            <div className="price-section">
              <div className="price-header">
                <div className="price-value-container">
                  {isEditing ? (
                    <input name="pricePerMonth" type="number" value={editForm.pricePerMonth} onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} onChange={handleEditChange} className="form-control" style={{ width: '150px', display: 'inline-block' }} />
                  ) : (
                    <span className="price-value">{roomData.pricePerMonth?.toLocaleString('vi-VN') || roomData.price_per_month?.toLocaleString('vi-VN')} đ</span>
                  )}
                  <span className="price-unit">/ tháng</span>
                </div>
                <span className={`status-badge ${roomData.status || 'available'}`}>
                  {roomData.status === 'available' ? 'Còn phòng' : (roomData.status === 'rented' ? 'Đã thuê' : (roomData.status === 'occupied' ? 'Đang ở' : 'Trống'))}
                </span>
              </div>
              <div className="booking-info-row">
                <div className="info-col">
                  <span className="info-label">Phí xem phòng</span>
                  <span className="info-val" style={{ color: '#059669', fontWeight: 700 }}>
                    Miễn phí
                  </span>
                </div>
                <div className="info-col">
                  <span className="info-label">Thời hạn thuê</span>
                  <span className="info-val">Thỏa thuận</span>
                </div>
              </div>
              <hr className="my-4 border-gray-200" style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
              
              {/* Host Card Section Moved Inside Price Card */}
              <div className="host-info" style={{ marginBottom: '1.25rem' }}>
                <div 
                  className="host-avatar-wrapper cursor-pointer" 
                  onClick={() => navigate(`${ROUTES.ROOMS}?landlordId=${roomData.landlord?.user_id || roomData.landlordId}`)}
                >
                  <img 
                    src={getGlobalAvatar(roomData.landlord?.full_name, roomData.landlord?.avatar_url || roomData.landlord?.avatarUrl, 100)} 
                    alt={roomData.landlord?.full_name || 'Landlord'} 
                    className="host-avatar" 
                  />
                  <span className="host-status-dot"></span>
                </div>
                <div className="host-text">
                  <h3>Quản lý bởi {roomData.landlord?.full_name || 'Chủ trọ'}</h3>
                  <p>SĐT: {roomData.landlord?.phone || 'Đang cập nhật'}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>Số phòng đăng: <strong>{roomData.landlord?.postCount || 0}</strong></span>
                    <span>Phòng đã thuê: <strong>{roomData.landlord?.rentedRoomCount || 0}</strong></span>
                  </div>
                </div>
              </div>
              {!(isAuthenticated && (user?.userId === roomData.landlordId || user?.userId === roomData.landlord?.user_id)) && (
                <button className="contact-host-btn flex items-center justify-center gap-2" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={handleChatWithLandlord}>
                  <MessageSquare size={18} /> Chat với chủ trọ
                </button>
              )}
              
              <hr className="my-4 border-gray-200" style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
              {isAuthenticated && user?.role === 'LANDLORD' && (roomData.landlordId === user?.userId || roomData.landlord?.user_id === user?.userId) ? (
                ['pending', 'maintenance', 'rented', 'occupied', 'unavailable'].includes((roomData.status || '').toLowerCase()) ? (
                  <button className="btn-schedule-viewing" disabled style={{ background: '#9ca3af', cursor: 'not-allowed' }}>
                    Không thể sửa phòng đang có khách/chờ
                  </button>
                ) : isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn-schedule-viewing" onClick={handleSaveEdit} style={{ background: '#10B981' }}>
                      Lưu thay đổi
                    </button>
                    <button className="btn-schedule-viewing" onClick={() => setIsEditing(false)} style={{ background: '#EF4444' }}>
                      Hủy bỏ
                    </button>
                  </div>
                ) : (
                  <button className="btn-schedule-viewing" onClick={() => {
                      setEditForm({
                        title: roomData.title,
                        description: roomData.description,
                        pricePerMonth: roomData.pricePerMonth || roomData.price_per_month
                      });
                      setIsEditing(true);
                    }} style={{ background: '#2563EB' }}>
                    Chỉnh sửa phòng trực tiếp
                  </button>
                )
              ) : roomData.status === 'available' ? (
                <>
                  <button className="btn-schedule-viewing" onClick={() => setShowDateModal(true)}>
                    Đặt lịch xem phòng
                  </button>
                  <button className="btn-schedule-viewing mt-2" onClick={() => setShowRentalRequestModal(true)} style={{ background: '#10B981' }}>
                    Gửi yêu cầu thuê phòng
                  </button>
                </>
              ) : (
                <button className="btn-schedule-viewing" disabled style={{ background: '#9ca3af', cursor: 'not-allowed' }}>
                  {roomData.status === 'rented' ? 'Phòng đã được cho thuê' : (roomData.status === 'occupied' ? 'Phòng đang có người ở' : 'Phòng hiện không trống')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Rooms Section */}
      {suggestedRooms.length > 0 && (
        <div className="suggested-rooms-section" style={{ marginTop: '5rem', marginBottom: '2rem' }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#2563eb' }}>Gợi ý thêm cho bạn</h2>
            <p className="text-gray-500 text-lg">Các phòng trọ có thể bạn sẽ quan tâm</p>
          </div>
          <div className="suggested-rooms-grid">
            {suggestedRooms.map(room => (
              <RoomCard key={room.id} room={room} variant="standard" />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <button 
              className="view-all-btn-bottom" 
              onClick={() => navigate(ROUTES.ROOMS)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#2563eb'; }}
            >
              Xem thêm các phòng khác
            </button>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h2>Đặt lịch xem phòng</h2>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: 1.6 }}>
                <strong>Tiền cọc xem phòng:</strong>{' '}
                <span style={{ fontSize: '18px', fontWeight: 700 }}>
                  Miễn phí
                </span>
                <br />
                <span style={{ fontSize: '12px' }}>Chỉ thanh toán khi kí hợp đồng thuê phòng thành công.</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày xem</label>
                <input 
                  type="date" 
                  value={viewingDate} 
                  min={todayDate}
                  onChange={(e) => setViewingDate(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Giờ xem</label>
                <input 
                  type="time" 
                  value={viewingTime} 
                  onChange={(e) => setViewingTime(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDateModal(false)}>Hủy</button>
              <button className="btn-confirm" onClick={handleScheduleViewing}>Đặt lịch</button>
            </div>
          </div>
        </div>
      )}

      {showRentalRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRentalRequestModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h2>Gửi yêu cầu thuê phòng</h2>
            <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
              Bạn sắp gửi yêu cầu thuê phòng đến chủ trọ. Sau khi được phê duyệt, bạn có thể yêu cầu tạo hợp đồng.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Lời nhắn cho Chủ trọ (Tùy chọn)</label>
              <textarea 
                value={rentalRequestMessage}
                onChange={(e) => setRentalRequestMessage(e.target.value)}
                placeholder="Giới thiệu ngắn gọn về bản thân và các yêu cầu cụ thể..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '100px' }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRentalRequestModal(false)}>Hủy</button>
              <button className="btn-confirm" onClick={handleSendRentalRequest} style={{ background: '#10B981' }}>Gửi yêu cầu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
