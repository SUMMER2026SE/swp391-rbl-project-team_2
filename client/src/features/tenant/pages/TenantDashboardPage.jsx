import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Heart, MessageSquare, Home, AlertCircle, Calendar } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { ROUTES } from '../../../constants';
import { useTranslation } from 'react-i18next';
import { rentalRequestService } from '../services/rentalRequestService';
import './TenantDashboardPage.css';

const TenantDashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [expiringContracts, setExpiringContracts] = useState([]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await rentalRequestService.getMyContracts();
        const data = response.data || response;
        const contracts = Array.isArray(data) ? data : (data.data || []);
        
        const now = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(now.getDate() + 60);

        const expiring = contracts.filter(c => {
          if (c.status !== 'active') return false;
          if (c.isRenewed || c.is_renewed) return false;
          if (c.renewalRequest && c.renewalRequest.status === 'COMPLETED') return false; // Already signed new one
          const endDate = new Date(c.endDate || c.end_date);
          return endDate <= sixtyDaysFromNow && endDate > now;
        });
        
        setExpiringContracts(expiring);
      } catch (err) {
        console.error('Error fetching contracts for dashboard:', err);
      }
    };
    fetchContracts();
  }, []);

  return (
    <div className="tenant-dashboard-page">
      <div className="dashboard-header">
        <h1>{t('tenantDashboard.welcomeBack', 'Welcome back')}, {user?.fullName || 'Tenant'}!</h1>
        <p>{t('tenantDashboard.overview', 'Here is an overview of your rental activity.')}</p>
      </div>

      {expiringContracts.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.1)' }}>
          <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
            <AlertCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#92400e', fontWeight: 600 }}>Thông báo hợp đồng sắp hết hạn!</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#b45309', lineHeight: 1.5 }}>
              Bạn có <strong>{expiringContracts.length}</strong> hợp đồng thuê sắp hết hạn trong vòng 60 ngày tới. Vui lòng xác nhận gia hạn hoặc thông báo trả phòng để tránh bị mất cọc hoặc mất chỗ ở.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expiringContracts.map(c => {
                const diffDays = Math.ceil((new Date(c.endDate || c.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={c.contractId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: 500 }}>
                      <Calendar size={16} /> Phòng {c.room?.title || c.roomId} (Còn {diffDays} ngày)
                    </div>
                    <Link to="/tenant/requests" style={{ background: '#d97706', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}>
                      Xử lý ngay
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <Link to="/tenant/requests" className="stat-card">
          <div className="stat-icon-wrapper requests">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <h3>{t('tenantDashboard.myRequests', 'My Requests')}</h3>
            <p>{t('tenantDashboard.viewRequests', 'View maintenance/rental requests')}</p>
          </div>
        </Link>

        <Link to={ROUTES.TENANT.FAVORITES} className="stat-card">
          <div className="stat-icon-wrapper favorites">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h3>{t('tenantDashboard.savedRooms', 'Saved Rooms')}</h3>
            <p>{t('tenantDashboard.viewFavorites', 'View your favorite properties')}</p>
          </div>
        </Link>

        <Link to="/messages" className="stat-card">
          <div className="stat-icon-wrapper messages">
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <h3>{t('tenantDashboard.messages', 'Messages')}</h3>
            <p>{t('tenantDashboard.chatLandlords', 'Chat with landlords')}</p>
          </div>
        </Link>

        <Link to={ROUTES.ROOMS} className="stat-card">
          <div className="stat-icon-wrapper explore">
            <Home size={24} />
          </div>
          <div className="stat-info">
            <h3>{t('tenantDashboard.explore', 'Explore')}</h3>
            <p>{t('tenantDashboard.findHome', 'Find your next home')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TenantDashboardPage;
