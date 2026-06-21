import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCheck, 
  AlertCircle, 
  ShieldAlert, 
  UserPlus, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';
import Button from '../../../components/common/Button';
import { ROUTES } from '../../../constants';
import '../../landlord/pages/LandlordNotificationsPage.css'; // Reusing styles

const MOCK_ADMIN_NOTIFICATIONS = [
  {
    id: 1,
    type: 'System Alert',
    category: 'System',
    time: '10 mins ago',
    title: 'High Server Load Detected',
    description: 'CPU usage exceeded 85% on the main database cluster. Auto-scaling has been triggered.',
    isUnread: true,
    hasRedAccent: true,
    icon: <AlertCircle size={20} />,
    iconClass: 'icon-danger',
    headerClass: 'text-danger',
    actions: [
      { text: 'View Metrics', variant: 'primary', isSolid: true }
    ]
  },
  {
    id: 2,
    type: 'Moderation',
    category: 'Requests',
    time: '1 hour ago',
    title: 'New Landlord Registration',
    description: 'User John Doe has registered as a Landlord and is awaiting identity verification.',
    isUnread: true,
    icon: <UserPlus size={20} />,
    iconClass: 'icon-info',
    headerClass: 'text-info',
    actions: [
      { text: 'Review Identity', variant: 'primary', isSolid: true }
    ]
  },
  {
    id: 3,
    type: 'Security',
    category: 'System',
    time: 'Yesterday',
    title: 'Multiple Failed Logins',
    description: 'Multiple failed login attempts detected from IP 192.168.1.45 targeting the Admin portal.',
    isUnread: false,
    icon: <ShieldAlert size={20} />,
    iconClass: 'icon-warning',
    headerClass: 'text-warning',
  },
  {
    id: 4,
    type: 'Approval',
    category: 'Requests',
    time: '2 days ago',
    title: 'Listing Approved',
    description: 'You approved the listing "Modern Minimalist Loft" submitted by Landlord ID #452.',
    isUnread: false,
    icon: <CheckCircle2 size={20} />,
    iconClass: 'icon-success',
    headerClass: 'text-success',
  }
];

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [notifications, setNotifications] = useState(MOCK_ADMIN_NOTIFICATIONS);

  const tabs = ['All Alerts', 'Requests', 'System'];

  const handleActionClick = (act) => {
    if (act.text === 'View Metrics') navigate(ROUTES.ADMIN.ANALYTICS);
    else if (act.text === 'Review Identity') navigate(ROUTES.ADMIN.USERS);
    else toast(`Action triggered: ${act.text}`);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isUnread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, isUnread: !item.isUnread } : item));
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'All Alerts') return true;
    if (activeTab === 'Requests') return item.category === 'Requests';
    if (activeTab === 'System') return item.category === 'System';
    return true;
  });

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div className="header-titles">
          <h1 className="notifications-title">System Notifications</h1>
          <p className="notifications-subtitle">Stay updated on platform activity, security alerts, and moderation requests.</p>
        </div>

        <button className="btn-mark-all" onClick={handleMarkAllRead}>
          <CheckCheck size={16} />
          <span>Mark all as read</span>
        </button>
      </header>

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

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(item => (
            <div 
              key={item.id} 
              className={`notification-card ${item.hasRedAccent ? 'card-accent-red' : ''} ${item.isUnread ? 'unread' : ''}`}
              onClick={() => handleToggleRead(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-left-section">
                <div className={`notification-icon-wrapper ${item.iconClass}`}>
                  {item.icon}
                </div>
              </div>

              <div className="card-center-section">
                <div className="notification-meta">
                  <span className={`notification-type ${item.headerClass}`}>{item.type}</span>
                  <span className="meta-bullet">•</span>
                  <span className="notification-time">{item.time}</span>
                </div>
                <h3 className="notification-card-title">{item.title}</h3>
                <p className="notification-card-desc">{item.description}</p>

                {item.actions && (
                  <div className="notification-actions" onClick={e => e.stopPropagation()}>
                    {item.actions.map((act, index) => (
                      <Button 
                        key={index} 
                        variant={act.variant}
                        className={act.isSolid ? 'btn-solid-action' : 'btn-outline-action'}
                        onClick={() => handleActionClick(act)}
                      >
                        {act.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

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
            <p>No new system notifications in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
