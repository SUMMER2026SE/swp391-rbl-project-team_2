import React, { useState } from 'react';
import { Home, CreditCard, Wrench, Clipboard, CheckCircle, Bell, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './TenantNotificationsPage.css';

import httpClient from '../../../services/httpClient';


const TenantNotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const filters = ['All', 'Requests', 'Payments', 'System'];

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await httpClient.get('/tenant/notifications');
      const apiNotifications = res.data || [];
      
      const mapped = apiNotifications.map(item => {
        let category = 'System';
        let icon = <CheckCircle size={18} />;
        let iconType = 'info';
        
        const notifType = (item.notification_type || item.notificationType || '').toLowerCase();
        
        if (notifType.includes('request')) {
          category = 'Requests';
          icon = <Clipboard size={18} />;
          iconType = 'warning';
        } else if (notifType.includes('payment')) {
          category = 'Payments';
          icon = <CreditCard size={18} />;
          iconType = 'success';
        } else if (notifType === 'viewing_confirmed') {
          category = 'Requests';
          icon = <Home size={18} />;
          iconType = 'success';
        } else if (notifType === 'contract_expiring') {
          category = 'System';
          icon = <Bell size={18} />;
          iconType = 'danger';
        }

        const dateObj = new Date(item.createdAt || item.created_at);
        const timeStr = dateObj.toLocaleDateString('vi-VN');

        return {
          id: item.notification_id || item.notificationId,
          category,
          icon,
          iconType,
          isUnread: !item.is_read && !item.isRead,
          title: item.title,
          description: item.message,
          time: timeStr
        };
      });

      setNotifications(mapped);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);
  
  const getFilterLabel = (filter) => {
    switch(filter) {
      case 'All': return t('tenantNotifications.filterAll', 'All');
      case 'Requests': return t('tenantNotifications.filterRequests', 'Requests');
      case 'Payments': return t('tenantNotifications.filterPayments', 'Payments');
      case 'System': return t('tenantNotifications.filterSystem', 'System');
      default: return filter;
    }
  };

  const handleMarkAllRead = async (e) => {
    e.preventDefault();
    try {
      await httpClient.put('/tenant/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (id, isUnread) => {
    if (!isUnread) return;
    try {
      await httpClient.put(`/tenant/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: false } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    return n.category === activeFilter;
  });

  return (
    <div className="tenant-notifications-container">
      {/* Title & Top Section */}
      <div className="notifications-page-header">
        <div className="header-text-block">
          <h1 className="notifications-main-title">{t('tenantNotifications.title', 'Notifications')}</h1>
          <p className="notifications-main-subtitle">{t('tenantNotifications.subtitle', 'Stay updated with your latest activity.')}</p>
        </div>
        <a href="#" className="mark-all-read-link" onClick={handleMarkAllRead}>
          {t('tenantNotifications.markAllRead', 'Mark all as read')}
        </a>
      </div>

      {/* Filters Section */}
      <div className="notifications-filter-bar">
        {filters.map(filter => (
          <button
            key={filter}
            className={`filter-pill-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {getFilterLabel(filter)}
          </button>
        ))}
      </div>

      {/* Notifications List Container */}
      <div className="notifications-wrapper-card">
        {filteredNotifications.length > 0 ? (
          <div className="notifications-list-group">
            {filteredNotifications.map((notif, index) => (
              <div
                key={notif.id}
                className={`notification-row-item ${notif.isUnread ? 'unread' : 'read'} ${index > 0 ? 'with-top-border' : ''}`}
                onClick={() => handleToggleRead(notif.id, notif.isUnread)}
              >
                {/* Icon Column */}
                <div className="notification-icon-col">
                  <div className={`notification-icon-circle ${notif.iconType}`}>
                    {notif.icon}
                  </div>
                </div>

                {/* Content Column */}
                <div className="notification-content-col">
                  <h3 className="notification-row-title">{notif.title}</h3>
                  <p className="notification-row-desc">{notif.description}</p>
                </div>

                {/* Date and Dot Column */}
                <div className="notification-meta-col">
                  <span className={`notification-row-time ${notif.isUnread ? 'highlight-blue' : ''}`}>
                    {notif.time}
                  </span>
                  {notif.isUnread && <span className="notification-unread-dot"></span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="notifications-empty-state">
            <Sparkles size={48} className="empty-state-sparkles" />
            <h3 className="empty-state-title">{t('tenantNotifications.allCaughtUp', 'All caught up!')}</h3>
            <p className="empty-state-desc">{t('tenantNotifications.noNewNotifs', 'No new notifications in the')} {getFilterLabel(activeFilter).toLowerCase()} category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantNotificationsPage;
