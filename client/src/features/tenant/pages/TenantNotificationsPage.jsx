import React, { useState } from 'react';
import { Home, CreditCard, Wrench, Clipboard, CheckCircle, Bell, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './TenantNotificationsPage.css';

const INITIAL_NOTIFICATIONS = [];


const TenantNotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Requests', 'Payments', 'System'];
  
  const getFilterLabel = (filter) => {
    switch(filter) {
      case 'All': return t('tenantNotifications.filterAll', 'All');
      case 'Requests': return t('tenantNotifications.filterRequests', 'Requests');
      case 'Payments': return t('tenantNotifications.filterPayments', 'Payments');
      case 'System': return t('tenantNotifications.filterSystem', 'System');
      default: return filter;
    }
  };

  const handleMarkAllRead = (e) => {
    e.preventDefault();
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isUnread: !n.isUnread } : n));
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
                onClick={() => handleToggleRead(notif.id)}
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
