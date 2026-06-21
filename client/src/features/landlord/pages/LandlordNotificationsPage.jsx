import React, { useState } from 'react';
import {
  CheckCheck,
  AlertCircle,
  Wrench,
  Lightbulb,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Button from '../../../components/common/Button';
import './LandlordNotificationsPage.css';

const MOCK_NOTIFICATIONS = [];


const LandlordNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const tabs = ['All Alerts', 'Requests', 'Payments', 'System'];

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isUnread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, isUnread: !item.isUnread } : item));
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
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">Stay updated on your properties and resident activity.</p>
        </div>

        <button className="btn-mark-all" onClick={handleMarkAllRead}>
          <CheckCheck size={16} />
          <span>Mark all as read</span>
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
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(item => (
            <div
              key={item.id}
              className={`notification-card ${item.hasRedAccent ? 'card-accent-red' : ''} ${item.isUnread ? 'unread' : ''}`}
              onClick={() => handleToggleRead(item.id)}
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

                {/* Optional Bottom Actions */}
                {item.actions && (
                  <div className="notification-actions" onClick={e => e.stopPropagation()}>
                    {item.actions.map((act, index) => (
                      <Button
                        key={index}
                        variant={act.variant}
                        className={act.isSolid ? 'btn-solid-action' : 'btn-outline-action'}
                      >
                        {act.text}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Optional Gold Insight Link */}
                {item.link && (
                  <a
                    href={item.link.href}
                    className="insight-link"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    {item.link.text}
                  </a>
                )}
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
            <h3>All caught up!</h3>
            <p>No new notifications in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordNotificationsPage;
