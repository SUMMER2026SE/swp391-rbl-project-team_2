import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import {
  CheckCheck,
  AlertCircle,
  Wrench,
  Lightbulb,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ClipboardList,
  CreditCard
} from 'lucide-react';
import Button from '../../../components/common/Button';
import { landlordService } from '../services/landlordService';
import './LandlordNotificationsPage.css';

const LandlordNotificationsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await landlordService.getNotifications();
      const apiNotifications = res.data || [];
      
      const mapped = apiNotifications.map(item => {
        let category = 'System';
        let icon = <CheckCircle2 size={18} />;
        let iconClass = 'icon-info';
        let headerClass = 'text-info';
        let type = 'Hệ thống';
        let hasRedAccent = false;

        const notifType = item.notificationType?.toUpperCase();
        if (notifType === 'RENTAL_REQUEST' || notifType === 'REQUEST' || notifType === 'BOOKING') {
          category = 'Requests';
          icon = <ClipboardList size={18} />;
          iconClass = 'icon-warning';
          headerClass = 'text-warning';
          type = 'Yêu cầu';
        } else if (notifType === 'PAYMENT') {
          category = 'Payments';
          icon = <CreditCard size={18} />;
          iconClass = 'icon-success';
          headerClass = 'text-success';
          type = 'Thanh toán';
        } else if (notifType === 'COMPLAINT') {
          category = 'System';
          icon = <AlertCircle size={18} />;
          iconClass = 'icon-danger';
          headerClass = 'text-danger';
          type = 'Khiếu nại';
          hasRedAccent = true;
        } else if (notifType === 'CONTRACT') {
          category = 'System';
          icon = <CheckCircle2 size={18} />;
          iconClass = 'icon-info';
          headerClass = 'text-info';
          type = 'Hợp đồng';
        }

        // Format relative time
        const dateObj = new Date(item.createdAt);
        const diffHrs = Math.floor((new Date() - dateObj) / 3600000);
        let timeStr = dateObj.toLocaleDateString('vi-VN');
        if (diffHrs === 0) timeStr = t('landlord.dashboard.recentActivity.justNow', 'Vừa xong');
        else if (diffHrs < 24) timeStr = t('landlord.dashboard.recentActivity.hoursAgo', '{{count}} giờ trước', { count: diffHrs });
        else if (diffHrs < 48) timeStr = t('landlord.dashboard.recentActivity.yesterday', 'Hôm qua');

        return {
          id: item.notificationId,
          category,
          icon,
          iconClass,
          headerClass,
          type,
          hasRedAccent,
          isUnread: !item.isRead,
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const tabs = ['All Alerts', 'Requests', 'Payments', 'System'];

  const handleMarkAllRead = async () => {
    try {
      await landlordService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(item => ({ ...item, isUnread: false })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleToggleRead = async (id, isUnread) => {
    if (!isUnread) return; // Only mark as read if currently unread
    try {
      await landlordService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(item => item.id === id ? { ...item, isUnread: false } : item));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'All Alerts') return true;
    if (activeTab === 'Requests') return item.category === 'Requests';
    if (activeTab === 'Payments') return item.category === 'Payments';
    if (activeTab === 'System') return item.category === 'System';
    return true;
  });

  return (
    <div className="notifications-page">
      {/* Notifications Header */}
      <header className="notifications-header">
        <div className="header-titles">
          <h1 className="notifications-title">{t('landlordNotifications.notifications', 'Thông báo')}</h1>
          <p className="notifications-subtitle">{t('landlordNotifications.stayUpdatedOnYourProperties', 'Cập nhật hoạt động của các phòng trọ và khách thuê của bạn.')}</p>
        </div>

        <button className="btn-mark-all" onClick={handleMarkAllRead}>
          <CheckCheck size={16} />
          <span>{t('landlordNotifications.markAllAsRead', 'Đánh dấu đã đọc tất cả')}</span>
        </button>
      </header>

      {/* Tabs / Pills Filter */}
      <div className="notifications-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'All Alerts' ? t('landlordNotifications.allAlerts', 'Tất cả') :
             tab === 'Requests' ? t('landlordNotifications.requestsTab', 'Yêu cầu') :
             tab === 'Payments' ? t('landlordNotifications.paymentsTab', 'Thanh toán') :
             t('landlordNotifications.systemTab', 'Hệ thống')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {loading ? (
          <div className="empty-notifications">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              className={`notification-card ${item.hasRedAccent ? 'card-accent-red' : ''} ${item.isUnread ? 'unread' : ''}`}
              onClick={() => handleToggleRead(item.id, item.isUnread)}
              style={{ cursor: 'pointer' }}
            >
              {/* Left Colored Icon box */}
              <div className="card-left-section">
                <div className={`notification-icon-wrapper ${item.iconClass}`}>
                  {item.icon}
                </div>
              </div>

              {/* Center Content */}
              <div className="card-center-section">
                <div className="notification-meta">
                  <span className={`notification-type ${item.headerClass}`}>{item.type}</span>
                  <span className="meta-bullet">•</span>
                  <span className="notification-time">{item.time}</span>
                </div>
                <h3 className="notification-card-title">{item.title}</h3>
                <p className="notification-card-desc">{item.description}</p>
              </div>

              {/* Right Blue unread dot indicator */}
              {item.isUnread && (
                <div className="card-right-section">
                  <div className="unread-dot"></div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <Sparkles size={48} className="empty-icon" />
            <h3>{t('landlordNotifications.allCaughtUp', 'Tuyệt vời!')}</h3>
            <p>{t('landlordNotifications.noNewNotificationsInThis', 'Không có thông báo mới nào trong danh mục này.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordNotificationsPage;
