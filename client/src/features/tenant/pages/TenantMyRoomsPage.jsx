import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Calendar, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { rentalRequestService } from '../services/rentalRequestService';
import { ROUTES } from '../../../constants';

const TenantMyRoomsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rentedRooms, setRentedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentedRooms();
  }, []);

  const fetchRentedRooms = async () => {
    try {
      setLoading(true);
      const res = await rentalRequestService.getMyContracts();
      const contractsData = Array.isArray(res) ? res : (res?.data || []);
      
      // Filter for active or pre-booked contracts
      const activeContracts = contractsData.filter(
        c => c.status === 'active' || c.status === 'pre_booked_active'
      );
      
      setRentedRooms(activeContracts);
    } catch (error) {
      console.error('Error fetching rented rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageStr) => {
    if (!imageStr) return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';
    try {
      if (typeof imageStr === 'string' && imageStr.startsWith('[')) {
        const parsed = JSON.parse(imageStr);
        return parsed[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800';
      }
      return imageStr;
    } catch (e) {
      return imageStr;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="tenant-requests-page">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
          {t('tenantMyRooms.title')}
        </h1>
        <p className="page-subtitle" style={{ color: '#64748b', marginTop: '8px' }}>
          {t('tenantMyRooms.subtitle')}
        </p>
      </div>

      {rentedRooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Home size={32} color="#3b82f6" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            {t('tenantMyRooms.noRoomsTitle')}
          </h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {t('tenantMyRooms.noRoomsSubtitle')}
          </p>
          <button 
            onClick={() => navigate(ROUTES.ROOMS)}
            style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
          >
            {t('tenantMyRooms.searchNowBtn')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {rentedRooms.map((contract) => {
            const room = contract.room || {};
            const landlord = contract.landlord || {};
            
            return (
              <div key={contract.contractId} style={{ 
                background: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {/* Image Section */}
                  <div style={{ width: '280px', minHeight: '200px', flexShrink: 0 }}>
                    <img 
                      src={getImageUrl(room.images || room.image)} 
                      alt={room.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Content Section */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, paddingRight: '16px' }}>
                        {room.title || t('tenantMyRooms.updating')}
                      </h2>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: contract.status === 'active' ? '#dcfce7' : '#fef9c3',
                        color: contract.status === 'active' ? '#166534' : '#854d0e',
                        whiteSpace: 'nowrap'
                      }}>
                        {contract.status === 'active' ? t('tenantMyRooms.statusActive') : t('tenantMyRooms.statusPreBooked')}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
                      <MapPin size={16} style={{ flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.4 }}>
                        {room.address}{room.ward ? `, ${room.ward}` : ''}{room.district ? `, ${room.district}` : ''}{room.city ? `, ${room.city}` : ''}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tenantMyRooms.monthlyRent')}</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#2563eb' }}>{formatPrice(contract.monthlyRent)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tenantMyRooms.startDate')}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#64748b" />
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{formatDate(contract.startDate)}</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t('tenantMyRooms.landlord')}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{contract.landlordName || landlord?.full_name || t('tenantMyRooms.updating')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => navigate(`/listings/${room.room_id}`)}
                        style={{ 
                          padding: '10px 16px', 
                          background: 'white', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '8px', 
                          color: '#475569', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      >
                        <Home size={16} /> {t('tenantMyRooms.viewListingBtn')}
                      </button>
                      
                      <button 
                        onClick={() => navigate('/tenant/requests?tab=contracts')}
                        style={{ 
                          padding: '10px 16px', 
                          background: '#2563eb', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: 'white', 
                          fontWeight: '600', 
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                      >
                        <FileText size={16} /> {t('tenantMyRooms.manageContractBtn')} <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantMyRoomsPage;
