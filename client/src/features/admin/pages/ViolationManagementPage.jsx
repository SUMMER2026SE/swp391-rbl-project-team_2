import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Shield, Clock, CheckCircle, Search, Bell, Mail, MessageSquare, Settings, LogOut } from 'lucide-react';
import './ViolationManagementPage.css';

const ViolationManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Priority Cards Data
  const priorityCards = [
    {
      id: 'fraud',
      title: 'Fraud Detection',
      description: 'Suspicious payment activity and identity verification failures.',
      count: 23,
      color: 'fraud',
      icon: AlertTriangle,
      bgColor: '#FFDAD6',
      borderColor: '#FFDAD6',
      textColor: '#BA1A1A',
      badgeColor: '#93000A',
    },
    {
      id: 'abuse',
      title: 'Abuse Reports',
      description: 'Property damage, policy violations, and user conflicts.',
      count: 18,
      color: 'abuse',
      icon: AlertCircle,
      bgColor: '#FFDDB1',
      borderColor: '#FFBA49',
      textColor: '#785000',
      badgeColor: '#291800',
    },
    {
      id: 'spam',
      title: 'Spam & Bots',
      description: 'Fake listings, automated messaging, and scraped content.',
      count: 42,
      color: 'spam',
      icon: Shield,
      bgColor: '#E8E8E8',
      borderColor: '#E2E2E2',
      textColor: '#1A1C1C',
      badgeColor: '#414754',
    },
  ];

  // Active Alerts Feed Data
  const alerts = [
    {
      id: 1,
      severity: 'critical',
      title: 'Suspicious Payment Activity Detected',
      description: 'Multiple failed transactions from the same IP address within 10 minutes.',
      time: '2 hours ago',
      actionLabel: 'Review Case',
      secondaryAction: 'Dismiss',
    },
    {
      id: 2,
      severity: 'warning',
      title: 'Unusual Login Pattern Detected',
      description: 'User account accessed from 3 different countries in 24 hours.',
      time: '4 hours ago',
      actionLabel: 'Investigate',
      secondaryAction: 'Ignore',
    },
    {
      id: 3,
      severity: 'info',
      title: 'Automated Content Detection',
      description: 'Listing contains scraped content from competitor website.',
      time: '6 hours ago',
      actionLabel: 'Review',
    },
  ];

  // Timeline Events
  const timelineEvents = [
    {
      id: 1,
      time: '10:42 AM',
      title: 'Spike in failed login attempts from IP 192.168.x.x',
      severity: 'critical',
    },
    {
      id: 2,
      time: '08:15 AM',
      title: 'New admin device registered (Admin: Sarah J.)',
      severity: 'warning',
    },
    {
      id: 3,
      time: 'Yesterday, 11:30 PM',
      title: 'Automated database backup completed successfully.',
      severity: 'info',
    },
  ];

  // Moderation Log Data
  const resolutions = [
    { id: 1, title: 'Account Suspended', date: '2 hours ago', status: 'Resolved' },
    { id: 2, title: 'Listing Removed', date: '4 hours ago', status: 'Resolved' },
    { id: 3, title: 'User Warned', date: '6 hours ago', status: 'Resolved' },
  ];

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'alert-critical';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return '';
    }
  };

  const getTimelineColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#BA1A1A';
      case 'warning':
        return '#FFBA49';
      case 'info':
        return '#C1C6D6';
      default:
        return '#414754';
    }
  };

  return (
    <div className="violation-management-page">
      {/* Sidebar */}
      <aside className="violation-sidebar">
        <div className="sidebar-brand">
          <h1>SmartBoarding</h1>
          <p>Admin Console</p>
        </div>

        <button className="btn-new-listing">+ New Listing</button>

        <nav className="sidebar-nav">
          <a href="#" className="nav-link">Dashboard</a>
          <a href="#" className="nav-link">Reports</a>
          <a href="#" className="nav-link">Analytics</a>
          <a href="#" className="nav-link active">Violations</a>
          <a href="#" className="nav-link">Listings</a>
          <a href="#" className="nav-link">Users</a>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="nav-link">Help Center</a>
          <a href="#" className="nav-link">Logout</a>
        </div>
      </aside>

      {/* Top Navigation */}
      <header className="violation-topbar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search reports, users, or properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="topbar-actions">
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          <button className="icon-btn">
            <Mail size={20} />
          </button>
          <button className="icon-btn">
            <MessageSquare size={20} />
          </button>
          <div className="divider"></div>
          <button className="btn-support">Support</button>
          <button className="btn-action">Quick Action</button>
          <img src="https://i.pravatar.cc/150?img=12" alt="Admin" className="admin-avatar" />
        </div>
      </header>

      {/* Main Content */}
      <main className="violation-main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Violation Management</h1>
            <p>Monitor and manage platform violations, fraud, and abuse reports in real-time.</p>
          </div>
          <div className="header-actions">
            <button className="btn-filter">⚙ Filter</button>
            <button className="btn-export">📊 Export</button>
          </div>
        </div>

        {/* Priority Cards (Bento Style) */}
        <div className="priority-cards-grid">
          {priorityCards.map((card) => (
            <div key={card.id} className={`priority-card priority-${card.color}`} style={{ borderColor: card.borderColor }}>
              <div className="card-header">
                <div className="card-icon" style={{ backgroundColor: card.bgColor }}>
                  <card.icon size={24} color={card.textColor} />
                </div>
                <div className="card-badge" style={{ backgroundColor: card.bgColor }}>
                  <span style={{ color: card.badgeColor }}>Active</span>
                </div>
              </div>

              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>

              <div className="card-footer">
                <div className="card-count" style={{ color: card.textColor }}>
                  {card.count}
                </div>
                <a href="#" className="card-link">View All →</a>
              </div>
            </div>
          ))}
        </div>

        {/* Main Feed & Timeline Container */}
        <div className="feed-timeline-container">
          {/* Active Alerts Feed */}
          <div className="alerts-feed">
            <h2 className="feed-title">Active Alerts</h2>

            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                <div className="alert-icon">
                  {alert.severity === 'critical' && <AlertTriangle size={24} />}
                  {alert.severity === 'warning' && <AlertCircle size={24} />}
                  {alert.severity === 'info' && <Shield size={24} />}
                </div>

                <div className="alert-content">
                  <div className="alert-header">
                    <h4 className="alert-title">{alert.title}</h4>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                  <p className="alert-description">{alert.description}</p>

                  <div className="alert-actions">
                    <button className="btn-primary">{alert.actionLabel}</button>
                    <button className="btn-secondary">{alert.secondaryAction}</button>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn-load-more">Load More Alerts</button>
          </div>

          {/* Right Column: Timeline & Moderation Log */}
          <div className="right-column">
            {/* Security Timeline */}
            <div className="security-timeline">
              <h3 className="timeline-title">🔒 Security Timeline</h3>

              <div className="timeline-events">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-time">{event.time}</div>
                    <div className="timeline-dot" style={{ backgroundColor: getTimelineColor(event.severity) }}></div>
                    <div className="timeline-content">{event.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation Log */}
            <div className="moderation-log">
              <h3 className="log-title">Recent Resolutions</h3>

              <div className="resolutions-list">
                {resolutions.map((resolution) => (
                  <div key={resolution.id} className="resolution-item">
                    <div className="resolution-info">
                      <p className="resolution-title">{resolution.title}</p>
                      <p className="resolution-date">{resolution.date}</p>
                    </div>
                    <span className="resolution-status">{resolution.status}</span>
                  </div>
                ))}
              </div>

              <button className="btn-view-all">View All Resolutions</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViolationManagementPage;
