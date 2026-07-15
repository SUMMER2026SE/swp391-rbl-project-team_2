import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, AlertCircle, Shield, Search, Bell, Mail, MessageSquare } from 'lucide-react';
import adminService from '../../../services/adminService';
import './ViolationManagementPage.css';

const ViolationManagementPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [disputeOutcome, setDisputeOutcome] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, dispRes] = await Promise.all([
        adminService.getAllComplaints(),
        adminService.getAllDisputes()
      ]);
      if (compRes.success) setComplaints(compRes.data);
      if (dispRes.success) setDisputes(dispRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Map complaints and disputes to alerts
  const complaintAlerts = complaints.map((c, index) => ({
    id: c.complaint_id,
    type: 'complaint',
    severity: index % 3 === 0 ? 'critical' : index % 3 === 1 ? 'warning' : 'info',
    title: t('adminDisputes.complaintTitle', { tenant: c.tenant?.full_name || 'Tenant', room: c.room?.title || 'Room' }),
    description: c.description,
    time: new Date(c.created_at).toLocaleString('vi-VN'),
    actionLabel: t('adminDisputes.reviewCase'),
    secondaryAction: 'Dismiss',
    status: c.status,
    raw: c
  }));

  const disputeAlerts = disputes.filter(d => d.status === 'disputed').map(d => ({
    id: d.schedule_id,
    type: 'dispute',
    severity: 'critical',
    title: t('adminDisputes.disputeTitle', { tenant: d.tenant?.full_name, room: d.room?.title }),
    description: d.dispute_reason || d.notes,
    time: new Date(d.updated_at).toLocaleString('vi-VN'),
    actionLabel: t('adminDisputes.resolveDispute'),
    secondaryAction: 'Ignore',
    status: d.status,
    raw: d
  }));

  const alerts = [...complaintAlerts, ...disputeAlerts].sort((a, b) => new Date(b.time) - new Date(a.time));

  // Resolved disputes history
  const resolvedDisputes = disputes.filter(d => d.status === 'dispute_resolved').map(d => ({
    id: d.schedule_id,
    type: 'dispute',
    title: t('adminDisputes.resolvedDisputeTitle', { room: d.room?.title || 'Unknown' }),
    description: t('adminDisputes.resolvedDisputeDesc', { tenant: d.tenant?.full_name, landlord: d.landlordSchedule?.full_name }),
    time: new Date(d.updated_at).toLocaleString('vi-VN'),
    status: t('adminDisputes.resolvedStatus'),
    raw: d
  }));

  const history = [...resolvedDisputes].sort((a, b) => new Date(b.time) - new Date(a.time));

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

  if (loading) {
    return <div className="violation-management-page"><div className="loading-state">{t('adminDisputes.loading')}</div></div>;
  }

  return (
    <div className="violation-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="violation-header-content">
          <h1>{t('adminDisputes.title')}</h1>
          <p>{t('adminDisputes.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">📊 {t('adminDisputes.export')}</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem' }}>
        <button 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'transparent', 
            border: 'none', 
            borderBottom: activeTab === 'pending' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'pending' ? '700' : '500',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onClick={() => setActiveTab('pending')}
        >
          {t('adminDisputes.pendingDisputes')}
        </button>
        <button 
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: 'transparent', 
            border: 'none', 
            borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'history' ? '700' : '500',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onClick={() => setActiveTab('history')}
        >
          {t('adminDisputes.resolutionHistory')}
        </button>
      </div>

      {/* Main Feed Container */}
      <div className="feed-timeline-container">
        
        {activeTab === 'pending' && (
          <div className="alerts-feed">
            <h2 className="feed-title">
              {t('adminDisputes.activeDisputes')}
            </h2>

            {alerts.length > 0 ? alerts.map((alert) => (
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
                      onClick={() => {
                        if (alert.type === 'dispute') {
                          setSelectedDispute(alert.raw);
                          setDisputeOutcome('');
                        } else {
                          setSelectedComplaint(alert);
                        }
                      }}
                    >
                      {alert.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 py-4 text-center" style={{ color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>{t('adminDisputes.noActiveComplaints')}</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="alerts-feed">
            <h2 className="feed-title">
              {t('adminDisputes.resolutionHistory')}
            </h2>

            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="alert-item" style={{ opacity: 0.9 }}>
                <div className="alert-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                  <Shield size={24} />
                </div>

                <div className="alert-content">
                  <div className="alert-header">
                    <h4 className="alert-title">{item.title}</h4>
                    <span className="alert-time">{item.time}</span>
                  </div>
                  <p className="alert-description">{item.description}</p>
                  
                  <div className="alert-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="resolution-status" style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#10B981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem'
                    }}>
                      {item.status}
                    </span>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedDispute(item.raw);
                      }}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      {t('adminDisputes.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 py-4 text-center" style={{ color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>{t('adminDisputes.noResolutionHistory')}</p>
            )}
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="complaint-modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="complaint-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('adminDisputes.complaintDetails')}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>{t('adminDisputes.complaintId')}</label>
                <p>#{selectedComplaint.id}</p>
              </div>
              <div className="detail-group">
                <label>{t('adminDisputes.subject')}</label>
                <p>{selectedComplaint.title}</p>
              </div>
              <div className="detail-group">
                <label>{t('adminDisputes.dateSubmitted')}</label>
                <p>{selectedComplaint.time}</p>
              </div>
              <div className="detail-group">
                <label>{t('adminDisputes.severity')}</label>
                <p style={{textTransform: 'capitalize'}}>{selectedComplaint.severity}</p>
              </div>
              <div className="detail-group full-width">
                <label>{t('adminDisputes.description')}</label>
                <div className="description-box">
                  {selectedComplaint.description}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedComplaint(null)}>{t('adminDisputes.close')}</button>
              <button className="btn-primary" onClick={() => {
                toast.success(t('adminDisputes.actionSuccess'));
                setSelectedComplaint(null);
              }}>{t('adminDisputes.takeAction')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="complaint-modal-overlay" onClick={() => setSelectedDispute(null)}>
          <div className="complaint-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{t('adminDisputes.resolveRoomDispute')}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedDispute(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>{t('adminDisputes.scheduleId')}</label>
                <p>#{selectedDispute.schedule_id}</p>
              </div>
              <div className="detail-group">
                <label>{t('adminDisputes.room')}</label>
                <p>{selectedDispute.room?.title}</p>
              </div>
              <div className="detail-group">
                <label>{t('adminDisputes.tenant')}</label>
                <p>{selectedDispute.tenant?.full_name} ({selectedDispute.tenant?.email})</p>
              </div>
              <div className="detail-group">
                <label>{t('adminDisputes.landlord')}</label>
                <p>{selectedDispute.landlordSchedule?.full_name}</p>
              </div>
              <div className="detail-group full-width">
                <label>{t('adminDisputes.disputeReason')}</label>
                <div className="description-box" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDispute.dispute_reason || selectedDispute.notes}
                </div>
              </div>

              {selectedDispute.status === 'disputed' ? (
                <div className="detail-group full-width" style={{ marginTop: '20px' }}>
                  <label>{t('adminDisputes.resolutionOutcome')}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="outcome" value="A" checked={disputeOutcome === 'A'} onChange={e => setDisputeOutcome(e.target.value)} />
                        <div>
                          {t('adminDisputes.outcomeA')}
                        </div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="outcome" value="B" checked={disputeOutcome === 'B'} onChange={e => setDisputeOutcome(e.target.value)} />
                        <div>
                          {t('adminDisputes.outcomeB')}
                        </div>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="outcome" value="C" checked={disputeOutcome === 'C'} onChange={e => setDisputeOutcome(e.target.value)} />
                        <div>
                          {t('adminDisputes.outcomeC')}
                        </div>
                      </label>
                  </div>
                </div>
              ) : (
                <div className="detail-group full-width" style={{ marginTop: '20px' }}>
                  <label>{t('adminDisputes.status')}</label>
                  <p style={{ color: '#10B981', fontWeight: 'bold' }}>{t('adminDisputes.resolvedStatus')}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedDispute(null)}>{t('adminDisputes.close')}</button>
              {selectedDispute.status === 'disputed' && (
                <button 
                  className="btn-primary" 
                  disabled={!disputeOutcome}
                  style={{ opacity: !disputeOutcome ? 0.5 : 1 }}
                  onClick={async () => {
                    try {
                      await adminService.resolveDispute(selectedDispute.schedule_id, disputeOutcome);
                      toast.success(t('adminDisputes.disputeSuccess'));
                      setSelectedDispute(null);
                      fetchData();
                    } catch (err) {
                      toast.error(t('adminDisputes.disputeFailed'));
                    }
                  }}
                >
                  {t('adminDisputes.confirmResolution')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationManagementPage;
