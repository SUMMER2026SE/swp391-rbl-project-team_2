import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    typeKey: 'sysAlert',
    category: 'System',
    timeKey: 'minsAgo',
    titleKey: 'title1',
    descriptionKey: 'desc1',
    isUnread: true,
    hasRedAccent: true,
    icon: <AlertCircle size={20} />,
    iconClass: 'icon-danger',
    headerClass: 'text-danger',
    actions: [
      { textKey: 'action1', variant: 'primary', isSolid: true }
    ]
  },
  {
    id: 2,
    typeKey: 'moderation',
    category: 'Requests',
    timeKey: 'hrAgo',
    titleKey: 'title2',
    descriptionKey: 'desc2',
    isUnread: true,
    icon: <UserPlus size={20} />,
    iconClass: 'icon-info',
    headerClass: 'text-info',
    actions: [
      { textKey: 'action2', variant: 'primary', isSolid: true }
    ]
  },
  {
    id: 3,
    typeKey: 'security',
    category: 'System',
    timeKey: 'yesterday',
    titleKey: 'title3',
    descriptionKey: 'desc3',
    isUnread: false,
    icon: <ShieldAlert size={20} />,
    iconClass: 'icon-warning',
    headerClass: 'text-warning',
  },
  {
    id: 4,
    typeKey: 'approval',
    category: 'Requests',
    timeKey: 'daysAgo',
    titleKey: 'title4',
    descriptionKey: 'desc4',
    isUnread: false,
    icon: <CheckCircle2 size={20} />,
    iconClass: 'icon-success',
    headerClass: 'text-success',
  }
];

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(MOCK_ADMIN_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: t('adminNotifications.tabs.all') },
    { id: 'requests', label: t('adminNotifications.tabs.requests') },
    { id: 'system', label: t('adminNotifications.tabs.system') }
  ];

  const handleActionClick = (actionKey) => {
    if (actionKey === 'action1') navigate(ROUTES.ADMIN.ANALYTICS);
    else if (actionKey === 'action2') navigate(ROUTES.ADMIN.USERS);
    else toast(t('adminNotifications.mock.actionTriggered', { text: t(`adminNotifications.mock.${actionKey}`) }));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isUnread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(item => item.id === id ? { ...item, isUnread: !item.isUnread } : item));
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'requests') return item.category === 'Requests';
    if (activeTab === 'system') return item.category === 'System';
    return true;
  });

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <div className="header-titles">
          <h1 className="notifications-title">{t('adminNotifications.title')}</h1>
          <p className="notifications-subtitle">{t('adminNotifications.subtitle')}</p>
        </div>

        <button className="btn-mark-all" onClick={handleMarkAllRead}>
          <CheckCheck size={16} />
          <span>{t('adminNotifications.markAllRead')}</span>
        </button>
      </header>

      <div className="notifications-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-pill ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
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
                  <span className={`notification-type ${item.headerClass}`}>{t(`adminNotifications.mock.${item.typeKey}`)}</span>
                  <span className="meta-bullet">•</span>
                  <span className="notification-time">{t(`adminNotifications.mock.${item.timeKey}`)}</span>
                </div>
                <h3 className="notification-card-title">{t(`adminNotifications.mock.${item.titleKey}`)}</h3>
                <p className="notification-card-desc">{t(`adminNotifications.mock.${item.descriptionKey}`)}</p>

                {item.actions && (
                  <div className="notification-actions" onClick={e => e.stopPropagation()}>
                    {item.actions.map((act, index) => (
                      <Button 
                        key={index} 
                        variant={act.variant}
                        className={act.isSolid ? 'btn-solid-action' : 'btn-outline-action'}
                        onClick={() => handleActionClick(act.textKey)}
                      >
                        {t(`adminNotifications.mock.${act.textKey}`)}
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
            <h3>{t('adminNotifications.emptyTitle')}</h3>
            <p>{t('adminNotifications.emptyDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
