import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Share2, Heart, MessageSquare, CheckCircle, Bed, Users, Maximize, Home, Compass, ChevronLeft, ShieldCheck, ShieldAlert, FileSignature
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
import { useTranslation } from 'react-i18next';
import GoogleMapPicker from '../../../components/common/GoogleMapPicker';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
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
        toast.success(t('roomDetail.roomUpdated', "Room updated successfully!"));
        setRoomData({ ...roomData, ...payload, price_per_month: payload.pricePerMonth });
        setIsEditing(false);
      }
    } catch (e) {
      toast.error(e.message || t('roomDetail.updateFailed', "Failed to update room!"));
    }
  };
  
  const [showDateModal, setShowDateModal] = useState(false);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');

  // Rental Request States
  const [showRentalRequestModal, setShowRentalRequestModal] = useState(false);
  const [rentalRequestMessage, setRentalRequestMessage] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [leaseDuration, setLeaseDuration] = useState('6');
  const [phone, setPhone] = useState(user?.phone || '');
  const [rentalPurpose, setRentalPurpose] = useState('');
  const [tenantName, setTenantName] = useState(user?.full_name || '');
  const [tenantIc, setTenantIc] = useState('');
  const [tenantIcIssueDate, setTenantIcIssueDate] = useState('');
  const [tenantIcIssuePlace, setTenantIcIssuePlace] = useState('Cục Cảnh sát Quản lý hành chính về trật tự xã hội');
  const [tenantPermanentAddress, setTenantPermanentAddress] = useState('');

  useEffect(() => {
    if (user) {
      if (!tenantName) setTenantName(user.full_name || '');
      if (!phone) setPhone(user.phone || '');
    }
  }, [user]);

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
                  { icon: 'bed', text: `${room.bedrooms || 1} ${t('roomDetail.bed', 'Giường')}` },
                  { icon: 'square', text: `${room.areaSqm || room.area_sqm || 0} m²` }
                ],
                imageTags: [{ text: t('roomDetail.statusAvailable', 'Còn phòng'), type: 'primary' }],
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
        toast.error(t('roomDetail.selectDate', 'Please select a viewing date.'));
        return;
      }
      if (!viewingTime) {
        toast.error(t('roomDetail.selectTime', 'Please select a viewing time.'));
        return;
      }
      if (viewingDate < todayDate) {
        toast.error(t('roomDetail.invalidDate', 'Viewing date must be today or a future date.'));
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
        toast.success(t('roomDetail.scheduleSuccess', 'Viewing schedule requested successfully!'));
        setShowDateModal(false);
        navigate(ROUTES.TENANT.REQUESTS);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('roomDetail.scheduleFailed', 'Failed to schedule viewing'));
    }
  };

  const handleSendRentalRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!phone) {
      toast.error('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!moveInDate) {
      toast.error('Vui lòng chọn ngày nhận phòng.');
      return;
    }
    if (!rentalPurpose) {
      toast.error('Vui lòng nhập mục đích thuê phòng.');
      return;
    }

    const selectedDate = new Date(moveInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Ngày nhận phòng không thể ở quá khứ.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await rentalRequestService.createRequest({
        roomId: roomData.roomId || roomData.room_id,
        message: rentalRequestMessage || null,
        requestedMoveInDate: moveInDate,
        leaseDurationMonths: parseInt(leaseDuration, 10),
        phone: phone,
        rentalPurpose: rentalPurpose
      });

      if (response.success) {
        toast.success(t('roomDetail.requestSuccess', "Rental request submitted successfully!"));
        setShowRentalRequestModal(false);
        navigate(ROUTES.TENANT.REQUESTS);
      }
    } catch (err) {
      toast.error(t('roomDetail.requestFailed', 'Failed to submit request:') + ' ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
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
        toast.error(t('roomDetail.startChatFailed', 'Failed to start chat. Landlord information is unavailable.'));
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

  if (loading) return <div className="p-8 text-center">{t('search.loading', 'Loading...')}</div>;
  if (error || !roomData) return <div className="p-8 text-center text-red-500">{error || t('propertyDetail.propertyNotFound', 'Listing not found')}</div>;

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
          ? t('roomDetail.backToSchedule', 'Quay lại Lịch hẹn') 
          : (isAuthenticated && user?.role === 'LANDLORD' ? t('roomDetail.backToListings', 'Quay lại danh sách phòng') : t('propertyDetail.backToExplore', 'Quay lại Khám phá'))
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

          <div className="property-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input name="title" value={editForm.title} onChange={handleEditChange} className="form-control mb-2" style={{ fontSize: '1.8rem', fontWeight: 700 }} />
              ) : (
                <h1 className="room-detail-title" style={{ margin: 0 }}>{roomData.title}</h1>
              )}
              {roomData.roomNumber && (
                <p className="room-detail-address" style={{ marginTop: '0.4rem', marginBottom: '0.4rem', fontWeight: '500', color: '#4f46e5' }}>{t('propertyDetail.roomPrefix', 'Phòng:')} {roomData.roomNumber}</p>
              )}
              <p className="room-detail-address" style={{ margin: '0.4rem 0 0 0' }}><MapPin size={16}/> {[roomData.address, roomData.ward, roomData.district, roomData.city].filter(Boolean).join(', ')}</p>
            </div>

            {!(isAuthenticated && (user?.role === 'LANDLORD' || user?.role === 'ADMIN')) && (
              <button 
                onClick={toggleFavorite}
                className="detail-favorite-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                }}
              >
                <Heart 
                  size={24} 
                  fill={isFavorite ? '#ef4444' : 'none'} 
                  color={isFavorite ? '#ef4444' : '#64748b'} 
                />
              </button>
            )}
          </div>
          
          <div className="property-features">
            <div className="feature-card">
              <Bed className="feature-icon" />
              <span className="feature-value">{roomData.bedrooms || 1}</span>
              <span className="feature-label">{t('roomDetail.bed', 'Giường')}</span>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <span className="feature-value">{roomData.maxOccupants || roomData.max_occupants || 1}</span>
              <span className="feature-label">{t('roomDetail.maxOccupants', 'Người tối đa')}</span>
            </div>
            <div className="feature-card">
              <Maximize className="feature-icon" />
              <span className="feature-value">{roomData.areaSqm || roomData.area_sqm || 15}</span>
              <span className="feature-label">m²</span>
            </div>
            <div className="feature-card">
              <Home className="feature-icon" />
              <span className="feature-value" style={{ textTransform: 'capitalize' }}>
                {t('roomDetail.privateRoom', 'Phòng cá nhân')}
              </span>
              <span className="feature-label">{t('roomDetail.roomType', 'Loại phòng')}</span>
            </div>
          </div>

          <hr className="section-divider" />

          <hr className="section-divider" />

          {/* About Section */}
          <section className="about-section">
            <h2>{t('roomDetail.details', 'Thông tin chi tiết')}</h2>
            <div className={`about-text ${showMoreAbout ? 'expanded' : ''}`}>
              {isEditing ? (
                 <textarea name="description" value={editForm.description} onChange={handleEditChange} className="form-control" rows={6} />
              ) : (
                 <p style={{ whiteSpace: 'pre-wrap' }}>
                   {(() => {
                      const desc = roomData.description || '';
                      const isDefaultGeneratedVi = desc.includes('là chỗ nghỉ lý tưởng tọa lạc tại') && desc.includes('Khu trọ có thiết kế sạch sẽ, hiện đại và an ninh đảm bảo');
                      if (isDefaultGeneratedVi) {
                         return `${t('propertyDetail.defaultDescP1', {
                            title: roomData.title,
                            district: roomData.district || roomData.property?.district || 'trung tâm',
                            city: roomData.city || roomData.property?.city || 'thành phố'
                         })}\n\n${t('propertyDetail.defaultDescP2', 'Khu trọ có thiết kế sạch sẽ, hiện đại và an ninh đảm bảo. Tại đây, bạn sẽ dễ dàng di chuyển đến các khu vực trung tâm, các trường đại học và khu tiện ích xung quanh.')}\n\n${t('propertyDetail.defaultDescP3', 'Đặc biệt phù hợp cho người đi làm và sinh viên cần một không gian yên tĩnh, an toàn để nghỉ ngơi sau một ngày căng thẳng.')}`;
                      }
                      return desc;
                   })()}
                 </p>
              )}
            </div>
            <button 
              className="show-more-link" 
              onClick={() => setShowMoreAbout(!showMoreAbout)}
            >
              {showMoreAbout ? t('roomDetail.collapse', 'Thu gọn') : t('roomDetail.seeMore', 'Xem thêm')}
            </button>
          </section>

          <hr className="section-divider" />

          {/* Amenities Section */}
          <section className="amenities-section">
            <h2>{t('roomDetail.amenities', 'Tiện nghi & Dịch vụ')}</h2>
            
            {roomFacilities.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>Tiện ích trong phòng</h3>
                <div className="amenities-grid">
                  {roomFacilities.map((amenity, idx) => (
                    <div className="amenity-item" key={`room-${idx}`}>
                      <CheckCircle size={20} className="amenity-icon" />
                      <span>{t(`facilities.${amenity.facility_name}`, amenity.facility_name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nearbyFacilities.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>{t('roomDetail.nearbyAmenities', 'Tiện ích xung quanh')}</h3>
                <div className="amenities-grid">
                  {nearbyFacilities.map((amenity, idx) => (
                    <div className="amenity-item" key={`nearby-${idx}`}>
                      <MapPin size={20} className="amenity-icon" />
                      <span>{t(`facilities.${amenity.facility_name}`, amenity.facility_name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {roomFacilities.length === 0 && nearbyFacilities.length === 0 && (
              <p style={{ color: '#64748b' }}>{t('roomDetail.noAmenities', 'Chưa có thông tin tiện ích.')}</p>
            )}
          </section>

          {/* Google Maps Location Section */}
          {!roomData.propertyId && (
            <>
              <hr className="section-divider" />
              <section className="location-map-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
                  <MapPin size={20} style={{ display: 'inline', marginRight: '8px', color: '#4f46e5' }} />
                  {t('roomDetail.locationMap', 'Vị trí trên bản đồ')}
                </h2>
                <GoogleMapPicker
                  address={[roomData.address, roomData.ward, roomData.district, roomData.city].filter(Boolean).join(', ')}
                  latitude={roomData.latitude}
                  longitude={roomData.longitude}
                  readOnly={true}
                  height="350px"
                />
              </section>
            </>
          )}
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
                  <span className="price-unit">{t('roomDetail.perMonth', '/ tháng')}</span>
                </div>
                <span className={`status-badge ${roomData.status || 'available'} ${(roomData.status === 'rented' && (roomData.available_from || roomData.availableFrom)) ? 'prebookable' : ''}`}>
                  {roomData.status === 'available' ? t('roomDetail.statusAvailable', 'Còn phòng') : (roomData.status === 'reserved' ? 'Booking in progress' : (roomData.status === 'rented' ? (roomData.available_from || roomData.availableFrom ? `Sắp trống (${new Date(roomData.available_from || roomData.availableFrom).toLocaleDateString('vi-VN')})` : t('roomDetail.statusRented', 'Đã thuê')) : (roomData.status === 'occupied' ? t('roomDetail.statusOccupied', 'Đang ở') : t('roomDetail.statusUnavailable', 'Trống'))))}
                </span>
              </div>
              <div className="booking-info-row">
                <div className="info-col">
                  <span className="info-label">{t('roomDetail.viewingFee', 'Phí xem phòng')}</span>
                  <span className="info-val" style={{ color: '#059669', fontWeight: 700 }}>
                    {t('roomDetail.free', 'Miễn phí')}
                  </span>
                </div>
                <div className="info-col">
                  <span className="info-label">{t('roomDetail.leaseTerm', 'Thời hạn thuê')}</span>
                  <span className="info-val">{t('roomDetail.negotiable', 'Thỏa thuận')}</span>
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
                    className={`host-avatar ${
                      (roomData.landlord?.verification_status === 'verified' || roomData.landlord?.verificationStatus === 'verified') 
                        ? 'verified-border' 
                        : ''
                    }`}
                  />
                  <span className="host-status-dot"></span>
                </div>
                <div className="host-text">
                  <h3 className="flex items-center gap-1 flex-wrap" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    {t('roomDetail.managedBy', 'Quản lý bởi')} {roomData.landlord?.full_name || 'Chủ trọ'}
                    {(roomData.landlord?.verification_status === 'verified' || roomData.landlord?.verificationStatus === 'verified') ? (
                      <span className="host-verified-badge" title="Chủ trọ đã xác thực danh tính qua CCCD và tài khoản ngân hàng chính chủ">
                        <ShieldCheck size={14} fill="#1d4ed8" color="white" /> {t('profile.verification.badgeVerified', 'Đã xác thực')}
                      </span>
                    ) : (
                      <span className="host-unverified-badge" title="Chủ trọ chưa được xác thực. Hãy cẩn trọng khi giao dịch ngoài hệ thống">
                        <ShieldAlert size={14} fill="#b91c1c" color="white" /> {t('profile.verification.badgeUnverified', 'Chưa xác thực')}
                      </span>
                    )}
                  </h3>
                  <p>{t('roomDetail.hostPhone', 'SĐT:')} {roomData.landlord?.phone || 'Đang cập nhật'}</p>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>{t('roomDetail.postedRooms', 'Số phòng đăng:')} <strong>{roomData.landlord?.postCount || 0}</strong></span>
                    <span>{t('roomDetail.rentedRooms', 'Phòng đã thuê:')} <strong>{roomData.landlord?.rentedRoomCount || 0}</strong></span>
                  </div>
                </div>
              </div>
              {!(isAuthenticated && (user?.userId === roomData.landlordId || user?.userId === roomData.landlord?.user_id)) && (
                <button className="contact-host-btn flex items-center justify-center gap-2" style={{ marginBottom: '1.5rem', width: '100%' }} onClick={handleChatWithLandlord}>
                  <MessageSquare size={18} /> {t('roomDetail.chatWithHost', 'Chat với chủ trọ')}
                </button>
              )}
              
              <hr className="my-4 border-gray-200" style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
              {isAuthenticated && user?.role === 'LANDLORD' && (roomData.landlordId === user?.userId || roomData.landlord?.user_id === user?.userId) ? (
                ['rented', 'occupied', 'reserved'].includes((roomData.status || '').toLowerCase()) ? (
                  <button className="btn-schedule-viewing" disabled style={{ background: '#9ca3af', cursor: 'not-allowed' }}>
                    {t('roomDetail.cannotEditOccupied', 'Không thể sửa phòng đã cho thuê hoặc đang xử lý')}
                  </button>
                ) : isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn-schedule-viewing" onClick={handleSaveEdit} style={{ background: '#10B981' }}>
                      {t('roomDetail.saveChanges', 'Lưu thay đổi')}
                    </button>
                    <button className="btn-schedule-viewing" onClick={() => setIsEditing(false)} style={{ background: '#EF4444' }}>
                      {t('roomDetail.cancel', 'Hủy bỏ')}
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
                    {t('roomDetail.editRoom', 'Chỉnh sửa phòng trực tiếp')}
                  </button>
                )
              ) : (roomData.status === 'available' || (roomData.status === 'rented' && (roomData.available_from || roomData.availableFrom))) ? (
                <>
                  {roomData.status === 'available' && (
                    <button className="btn-schedule-viewing" onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        setShowDateModal(true);
                      }
                    }}>
                      {t('roomDetail.scheduleViewing', 'Đặt lịch xem phòng')}
                    </button>
                  )}
                  <button className="btn-schedule-viewing mt-2" onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      setShowRentalRequestModal(true);
                    }
                  }} style={{ background: '#10B981' }}>
                    {roomData.status === 'rented' ? 'Đặt phòng trước (Pre-book)' : t('roomDetail.sendRentalRequest', 'Gửi yêu cầu thuê phòng')}
                  </button>
                </>
              ) : (
                <button className="btn-schedule-viewing" disabled style={{ background: '#9ca3af', cursor: 'not-allowed' }}>
                  {roomData.status === 'reserved' ? 'Booking in progress (Đang xử lý thuê)' : (roomData.status === 'rented' ? t('roomDetail.roomIsRented', 'Phòng đã được cho thuê') : (roomData.status === 'occupied' ? t('roomDetail.roomIsOccupied', 'Phòng đang có người ở') : t('roomDetail.roomUnavailable', 'Phòng hiện không trống')))}
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
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#2563eb' }}>{t('roomDetail.suggestions', 'Gợi ý thêm cho bạn')}</h2>
            <p className="text-gray-500 text-lg">{t('roomDetail.suggestionsSub', 'Các phòng trọ có thể bạn sẽ quan tâm')}</p>
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
              {t('roomDetail.viewOtherRooms', 'Xem thêm các phòng khác')}
            </button>
          </div>
        </div>
      )}

      {showDateModal && (
        <div className="modal-overlay" onClick={() => setShowDateModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <h2>{t('roomDetail.scheduleViewing', 'Đặt lịch xem phòng')}</h2>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: 1.6 }}>
                <strong>{t('roomDetail.viewingDeposit', 'Tiền cọc xem phòng:')}</strong>{' '}
                <span style={{ fontSize: '18px', fontWeight: 700 }}>
                  {t('roomDetail.free', 'Miễn phí')}
                </span>
                <br />
                <span style={{ fontSize: '12px' }}>{t('roomDetail.payOnSuccess', 'Chỉ thanh toán khi kí hợp đồng thuê phòng thành công.')}</span>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('roomDetail.viewingDate', 'Ngày xem')}</label>
                <input 
                  type="date" 
                  value={viewingDate} 
                  min={todayDate}
                  onChange={(e) => setViewingDate(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{t('roomDetail.viewingTime', 'Giờ xem')}</label>
                <input 
                  type="time" 
                  value={viewingTime} 
                  onChange={(e) => setViewingTime(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDateModal(false)}>{t('roomDetail.cancel', 'Hủy')}</button>
              <button className="btn-confirm" onClick={handleScheduleViewing}>{t('roomDetail.bookSchedule', 'Đặt lịch')}</button>
            </div>
          </div>
        </div>
      )}

      {showRentalRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRentalRequestModal(false)} style={{ overflowY: 'auto', padding: '20px 0', zIndex: 1050 }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSignature size={20} style={{ color: '#059669' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
                {t('roomDetail.rentalRequestTitle', 'Gửi Yêu Cầu Thuê Phòng')}
              </h2>
            </div>
            
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: 1.6 }}>
                <strong>Room:</strong> {roomData?.title || 'Room Details'}<br />
                <span style={{ fontSize: '0.8rem', color: '#15803d', display: 'block', marginTop: '4px' }}>
                  {t('roomDetail.rentalRequestDesc', 'Gửi lời nhắn của bạn đến chủ trọ để đăng ký thuê phòng. Sau khi chủ trọ đồng ý yêu cầu, bạn mới thực hiện tạo hợp đồng.')}
                </span>
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Số điện thoại *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Ngày dọn vào *</label>
                <input 
                  type="date" 
                  value={moveInDate}
                  min={roomData.available_from || roomData.availableFrom || todayDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Thời hạn hợp đồng (Tháng) *</label>
                <select 
                  value={leaseDuration}
                  onChange={(e) => setLeaseDuration(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fff' }}
                >
                  <option value="3">3 tháng</option>
                  <option value="6">6 tháng</option>
                  <option value="9">9 tháng</option>
                  <option value="12">12 tháng</option>
                  <option value="18">18 tháng</option>
                  <option value="24">24 tháng</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mục đích vào ở *</label>
                <input 
                  type="text" 
                  value={rentalPurpose}
                  placeholder="Ví dụ: Đi học, Đi làm..."
                  onChange={(e) => setRentalPurpose(e.target.value)}
                  disabled={loading}
                  style={{ width: '100%', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>
            </div>

            <textarea
              style={{ width: '100%', padding: '14px', border: '2px solid #E5E7EB', borderRadius: '10px', minHeight: '100px', marginBottom: '16px', fontSize: '0.95rem', transition: 'border-color 0.2s', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder={t('roomDetail.msgPlaceholder', 'Lời nhắn cho Chủ trọ (Tùy chọn)')}
              value={rentalRequestMessage}
              onChange={(e) => setRentalRequestMessage(e.target.value)}
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowRentalRequestModal(false)}
                disabled={loading}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendRentalRequest}
                disabled={loading}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontWeight: 600, fontSize: '0.9rem' }}
              >
                {loading ? 'Sending...' : t('roomDetail.sendRentalRequestSubmit', 'Gửi Yêu Cầu Thuê')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
