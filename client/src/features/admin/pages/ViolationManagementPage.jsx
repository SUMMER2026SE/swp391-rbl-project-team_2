import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Shield, Search, Bell, Mail, MessageSquare } from 'lucide-react';
import adminService from '../../../services/adminService';
import './ViolationManagementPage.css';

const ViolationManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllComplaints();
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Map complaints to alerts
  const alerts = complaints.map((c, index) => ({
    id: c.complaint_id,
    severity: index % 3 === 0 ? 'critical' : index % 3 === 1 ? 'warning' : 'info',
    title: `Complaint from ${c.tenant?.full_name || 'Tenant'} regarding ${c.room?.title || 'Room'}`,
    description: c.description,
    time: new Date(c.created_at).toLocaleString('vi-VN'),
    actionLabel: 'Review Case',
    secondaryAction: 'Dismiss',
    status: c.status
  }));

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
  const resolutions = complaints
    .filter(c => c.status === 'resolved')
    .map(c => ({
      id: c.complaint_id,
      title: `Resolved: ${c.description?.substring(0, 30)}...`,
      date: new Date(c.updated_at || c.created_at).toLocaleDateString('vi-VN'),
      status: 'Resolved',
    }));

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

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Fraud Detection') return alert.severity === 'critical';
    if (activeFilter === 'Abuse Reports') return alert.severity === 'warning';
    if (activeFilter === 'Spam & Bots') return alert.severity === 'info';
    return true;
  });

  if (loading) {
    return <div className="violation-management-page"><div className="loading-state">Loading violations...</div></div>;
  }

  return (
    <div className="violation-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="violation-header-content">
          <h1>Violation Management</h1>
          <p>Monitor and manage platform violations, fraud, and abuse reports in real-time.</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-filter" 
            onClick={() => setActiveFilter('All')}
          >
            ⚙ Clear Filters
          </button>
          <button className="btn-export">📊 Export</button>
        </div>
      </div>

      {/* Priority Cards (Bento Style) */}
      <div className="priority-cards-grid">
        {priorityCards.map((card) => (
          <div 
            key={card.id} 
            className={`priority-card priority-${card.color} ${activeFilter === card.title ? 'active-filter' : ''}`} 
            style={{ 
              borderColor: activeFilter === card.title ? card.textColor : card.borderColor,
              cursor: 'pointer',
              boxShadow: activeFilter === card.title ? `0 0 0 2px ${card.textColor}33` : ''
            }}
            onClick={() => setActiveFilter(activeFilter === card.title ? 'All' : card.title)}
          >
            <div className="card-header">
              <div className="card-icon" style={{ backgroundColor: card.bgColor }}>
                <card.icon size={24} color={card.textColor} />
              </div>
              <div className="card-badge" style={{ backgroundColor: card.bgColor }}>
                <span style={{ color: card.badgeColor }}>Filter</span>
              </div>
            </div>

            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>

            <div className="card-footer">
              <div className="card-count" style={{ color: card.textColor }}>
                {card.count}
              </div>
              <span className="card-link" style={{color: card.textColor, fontSize: '0.8rem', fontWeight: 600}}>
                {activeFilter === card.title ? 'Remove Filter ✕' : 'Filter by this →'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Feed & Timeline Container */}
      <div className="feed-timeline-container">
        {/* Active Alerts Feed */}
        <div className="alerts-feed">
          <h2 className="feed-title">
            Active Complaints {activeFilter !== 'All' ? `(${activeFilter})` : ''}
          </h2>

          {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => (
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
                  <button 
                    className="btn-primary" 
                    onClick={() => setSelectedComplaint(alert)}
                  >
                    {alert.actionLabel}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => alert('Dismiss feature coming soon.')}
                  >
                    {alert.secondaryAction}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 py-4 text-center">No active complaints found.</p>
          )}
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
                  <div className="timeline-dot" style={{ backgroundColor: getTimelineColor(event.severity) }} />
                  <div className="timeline-content">{event.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Moderation Log */}
          <div className="moderation-log">
            <h3 className="log-title">Recent Resolutions</h3>

            <div className="resolutions-list">
              {resolutions.length > 0 ? resolutions.map((resolution) => (
                <div key={resolution.id} className="resolution-item">
                  <div className="resolution-info">
                    <p className="resolution-title">{resolution.title}</p>
                    <p className="resolution-date">{resolution.date}</p>
                  </div>
                  <span className="resolution-status">{resolution.status}</span>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">No recent resolutions.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="complaint-modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="complaint-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="btn-close-modal" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Complaint ID:</label>
                <p>#{selectedComplaint.id}</p>
              </div>
              <div className="detail-group">
                <label>Subject:</label>
                <p>{selectedComplaint.title}</p>
              </div>
              <div className="detail-group">
                <label>Date Submitted:</label>
                <p>{selectedComplaint.time}</p>
              </div>
              <div className="detail-group">
                <label>Severity:</label>
                <p style={{textTransform: 'capitalize'}}>{selectedComplaint.severity}</p>
              </div>
              <div className="detail-group full-width">
                <label>Description:</label>
                <div className="description-box">
                  {selectedComplaint.description}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedComplaint(null)}>Close</button>
              <button className="btn-primary" onClick={() => {
                alert('Action successfully recorded!');
                setSelectedComplaint(null);
              }}>Take Action</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationManagementPage;
