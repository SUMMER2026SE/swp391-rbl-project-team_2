import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ChevronLeft, Building, List, Home, ShieldCheck, CheckCircle2, Wifi, Car, Eye } from 'lucide-react';
import { roomService } from '../services/roomService';
import { ROUTES } from '../../../constants';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import Button from 'react-bootstrap/Button';
import RoomCard from '../components/RoomCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import GoogleMapPicker from '../../../components/common/GoogleMapPicker';
import './RoomDetailPage.css';

const PropertyDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await roomService.getPropertyById(id);
        if (response.data?.success) {
          setPropertyData(response.data.data);
        } else if (response.success) {
           setPropertyData(response.data);
        } else {
           setError(t('propertyDetail.failedToLoad', 'Failed to load property details'));
        }
      } catch (err) {
        setError(t('propertyDetail.failedToLoad', 'Failed to load property details'));
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="p-8 text-center">{t('search.loading', 'Loading...')}</div>;
  if (error || !propertyData) return <div className="p-8 text-center text-red-500">{error || t('propertyDetail.propertyNotFound', 'Property not found')}</div>;

  const allFacilities = propertyData.rooms?.flatMap(r => r.facilities || []) || [];
  const uniqueFacilitiesMap = new Map();
  allFacilities.forEach(f => uniqueFacilitiesMap.set(f.facility_name, f));
  const uniqueFacilities = Array.from(uniqueFacilitiesMap.values());
  
  const highlights = [
    { icon: <Home size={20} className="text-primary"/>, title: t('propertyDetail.entireSpace', 'Toàn bộ không gian'), subtitle: t('propertyDetail.entireSpaceSub', 'Khu vực an ninh, riêng tư') },
    { icon: <ShieldCheck size={20} className="text-success"/>, title: t('propertyDetail.guaranteedSecurity', 'An ninh đảm bảo'), subtitle: t('propertyDetail.securityCam', 'Camera an ninh 24/7') },
    { icon: <CheckCircle2 size={20} className="text-info"/>, title: t('propertyDetail.fullyEquipped', 'Tiện nghi đầy đủ'), subtitle: t('propertyDetail.newAndClean', 'Mới và sạch sẽ') }
  ];

  let displayDesc = propertyData.description;
  const isDefaultGeneratedVi = displayDesc && displayDesc.includes('là chỗ nghỉ lý tưởng tọa lạc tại') && displayDesc.includes('Khu trọ có thiết kế sạch sẽ, hiện đại và an ninh đảm bảo');
  
  if (!displayDesc || displayDesc.trim().toLowerCase() === 'sgsgsdg' || displayDesc.length < 20 || isDefaultGeneratedVi) {
      displayDesc = `${t('propertyDetail.defaultDescP1', {
          title: propertyData.title,
          district: propertyData.district || 'trung tâm',
          city: propertyData.city || 'thành phố'
      })}\n\n${t('propertyDetail.defaultDescP2', 'Khu trọ có thiết kế sạch sẽ, hiện đại và an ninh đảm bảo. Tại đây, bạn sẽ dễ dàng di chuyển đến các khu vực trung tâm, các trường đại học và khu tiện ích xung quanh.')}\n\n${t('propertyDetail.defaultDescP3', 'Đặc biệt phù hợp cho người đi làm và sinh viên cần một không gian yên tĩnh, an toàn để nghỉ ngơi sau một ngày căng thẳng.')}`;
  }

  return (
    <div className="room-detail-page container pt-20" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <Button 
        variant="outline-primary" 
        onClick={() => navigate(ROUTES.ROOMS)}
        className="mb-3 d-flex align-items-center gap-2"
        style={{ borderRadius: '20px', padding: '8px 16px', fontWeight: '500', width: 'fit-content' }}
      >
        <ChevronLeft size={18} />
        {t('propertyDetail.backToExplore', 'Back to Explore')}
      </Button>

      {/* Property Hero Section */}
      <div style={{ position: 'relative', marginBottom: '2rem', borderRadius: '16px', overflow: 'hidden', height: '400px' }}>
         <img
            className="d-block w-100"
            src={propertyData.thumbnailUrl}
            alt={propertyData.title}
            style={{ height: '400px', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60'; }}
          />
         <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '40px 30px 20px', color: 'white'
         }}>
             <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: 700 }}>{propertyData.title}</h1>
             <p style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <MapPin size={18}/> 
                 {[propertyData.address, propertyData.district, propertyData.city].filter(Boolean).join(', ')}
             </p>
         </div>
      </div>

      <div className="content-sidebar-layout">
        <div className="main-content">
          {/* Rooms List */}
          <section className="rooms-list-section" style={{ marginBottom: '2rem' }}>
             <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <List size={24} className="text-indigo" />
                     {t('propertyDetail.roomList', 'Danh sách phòng')} ({propertyData.rooms?.filter(r => !showOnlyAvailable || r.status === 'available').length || 0})
                 </div>
                 {propertyData.rooms?.some(r => r.status !== 'available') && (
                     <Button 
                        variant={showOnlyAvailable ? "primary" : "outline-primary"} 
                        size="sm" 
                        onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                        style={{ borderRadius: '20px', padding: '4px 12px' }}
                     >
                         {showOnlyAvailable ? t('propertyDetail.showAll', 'Hiển thị tất cả') : t('propertyDetail.showAvailableOnly', 'Chỉ xem phòng trống')}
                     </Button>
                 )}
             </h2>
             <div className="rooms-grid">
               {propertyData.rooms && propertyData.rooms.length > 0 ? (
                 propertyData.rooms.filter(r => !showOnlyAvailable || r.status === 'available' || (r.status === 'rented' && (r.available_from || r.availableFrom))).map(room => {
                   const mappedRoom = {
                     id: room.roomId,
                     title: room.title,
                     price: room.pricePerMonth,
                     location: room.roomNumber ? `${t('propertyDetail.roomPrefix', 'Phòng:')} ${room.roomNumber}` : t('propertyDetail.roomInBuilding', 'Phòng thuộc tòa nhà này'),
                     specs: [
                       { icon: 'bed', text: `${room.bedrooms || 1} ${t('roomDetail.bed', 'Bed')}` },
                       { icon: 'square', text: `${room.areaSqm || 0} m²` }
                     ],
                      imageTags: [{ 
                         text: room.status === 'available' 
                            ? t('roomDetail.statusAvailable', 'Available') 
                            : (room.status === 'rented' && (room.available_from || room.availableFrom)
                              ? `Sắp trống (${new Date(room.available_from || room.availableFrom).toLocaleDateString('vi-VN')})`
                              : (room.status === 'reserved' 
                                ? 'Booking in progress' 
                                : (room.status === 'rented' 
                                  ? t('roomDetail.statusOccupied', 'Occupied') 
                                  : (room.status === 'maintenance' ? 'Maintenance' : t('roomDetail.statusOccupied', 'Occupied'))))), 
                         type: room.status === 'available' 
                            ? 'primary' 
                            : (room.status === 'rented' && (room.available_from || room.availableFrom)
                              ? 'warning'
                              : (room.status === 'reserved' ? 'warning' : (room.status === 'maintenance' ? 'warning' : 'danger'))) 
                      }],
                     image: room.thumbnailUrl ? (room.thumbnailUrl.startsWith('http') ? room.thumbnailUrl : `http://localhost:5000${room.thumbnailUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
                   };
                   return <RoomCard key={mappedRoom.id} room={mappedRoom} variant="standard" />
                 })
               ) : (
                 <p>{t('propertyDetail.noRoomsAvailable', 'Không có phòng nào.')}</p>
               )}
             </div>
          </section>

          <hr className="section-divider" />

          <section className="about-section" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>{t('propertyDetail.propertyHighlights', 'Điểm nổi bật của chỗ nghỉ')}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
               {highlights.map((h, i) => (
                   <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '50%' }}>
                           {h.icon}
                       </div>
                       <div>
                           <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>{h.title}</div>
                           <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{h.subtitle}</div>
                       </div>
                   </div>
               ))}
            </div>

            <p style={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.8, fontSize: '1rem' }}>
                {displayDesc}
            </p>

            <div style={{ marginTop: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.2rem', color: '#1e293b' }}>{t('propertyDetail.popularAmenities', 'Các tiện nghi được ưa chuộng nhất')}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {uniqueFacilities.length > 0 ? uniqueFacilities.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 500 }}>
                            <CheckCircle2 size={20} />
                            {t(`facilities.${f.facility_name}`, f.facility_name)}
                        </div>
                    )) : (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 500 }}><Wifi size={20} /> {t('propertyDetail.freeWifi', 'WiFi miễn phí')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 500 }}><Car size={20} /> {t('propertyDetail.secureParking', 'Chỗ để xe an toàn')}</div>
                        </>
                    )}
                </div>
            </div>

            <hr className="section-divider" style={{ margin: '2rem 0' }} />

            {/* Google Maps Location Section */}
            <section className="location-map-section" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#1e293b' }}>
                <MapPin size={20} style={{ display: 'inline', marginRight: '8px', color: '#4f46e5' }} />
                {t('roomDetail.locationMap', 'Vị trí trên bản đồ')}
              </h2>
              <GoogleMapPicker
                address={[propertyData.address, propertyData.district, propertyData.city].filter(Boolean).join(', ')}
                latitude={propertyData.latitude}
                longitude={propertyData.longitude}
                readOnly={true}
                height="350px"
              />
            </section>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="sidebar-container">
          <div className="sidebar-sticky">
             <div className="property-host-card" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>{t('propertyDetail.hostInfo', 'Thông tin chủ nhà')}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img 
                      src={getGlobalAvatar(propertyData.landlord?.full_name, propertyData.landlord?.avatar_url, 100)} 
                      alt={propertyData.landlord?.full_name || 'Landlord'} 
                      style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 600 }}>{propertyData.landlord?.full_name}</h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{propertyData.landlord?.phone || 'N/A'}</p>
                    </div>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                       <span style={{ color: '#64748b', fontSize: '0.95rem' }}>{t('propertyDetail.lowestPrice', 'Giá thấp nhất:')}</span>
                       <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>{propertyData.minPrice?.toLocaleString('vi-VN')} đ</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ color: '#64748b', fontSize: '0.95rem' }}>{t('propertyDetail.highestPrice', 'Giá cao nhất:')}</span>
                       <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>{propertyData.maxPrice?.toLocaleString('vi-VN')} đ</span>
                   </div>
                </div>

                <Button 
                   variant="primary" 
                   className="w-100 shadow-sm" 
                   style={{ padding: '12px', fontWeight: 600, borderRadius: '8px', backgroundColor: '#3b82f6', border: 'none', transition: 'all 0.2s' }}
                   onClick={() => {
                       setShowOnlyAvailable(true);
                       document.querySelector('.rooms-list-section')?.scrollIntoView({ behavior: 'smooth' });
                   }}
                >
                   {t('propertyDetail.viewAvailableRooms', 'Xem phòng trống')}
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
