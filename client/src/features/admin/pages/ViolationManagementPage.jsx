import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Shield, Search, Bell, Mail, MessageSquare } from 'lucide-react';
import adminService from '../../../services/adminService';
import './ViolationManagementPage.css';

const ViolationManagementPage = () => {
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
    title: `Complaint from ${c.tenant?.full_name || 'Tenant'} regarding ${c.room?.title || 'Room'}`,
    description: c.description,
    time: new Date(c.created_at).toLocaleString('vi-VN'),
    actionLabel: 'Review Case',
    secondaryAction: 'Dismiss',
    status: c.status,
    raw: c
  }));

  const disputeAlerts = disputes.filter(d => d.status === 'disputed').map(d => ({
    id: d.schedule_id,
    type: 'dispute',
    severity: 'critical',
    title: `Dispute from ${d.tenant?.full_name} for room ${d.room?.title}`,
    description: d.dispute_reason || d.notes,
    time: new Date(d.updated_at).toLocaleString('vi-VN'),
    actionLabel: 'Resolve Dispute',
    secondaryAction: 'Ignore',
    status: d.status,
    raw: d
  }));

  const alerts = [...complaintAlerts, ...disputeAlerts].sort((a, b) => new Date(b.time) - new Date(a.time));

  // Resolved disputes history
  const resolvedDisputes = disputes.filter(d => d.status === 'dispute_resolved').map(d => ({
    id: d.schedule_id,
    type: 'dispute',
    title: `Resolved dispute for room ${d.room?.title || 'Unknown'}`,
    description: `Tenant: ${d.tenant?.full_name} | Landlord: ${d.landlordSchedule?.full_name}`,
    time: new Date(d.updated_at).toLocaleString('vi-VN'),
    status: 'Resolved',
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
    return <div className="violation-management-page"><div className="loading-state">Loading violations...</div></div>;
  }

  return (
    <div className="violation-management-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="violation-header-content">
          <h1>Disputes Management</h1>
          <p>Resolve disputes regarding room viewing issues and manage complaint history.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">📊 Export</button>
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
          Pending Disputes
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
          Resolution History
        </button>
      </div>

      {/* Main Feed Container */}
      <div className="feed-timeline-container">
        
        {activeTab === 'pending' && (
          <div className="alerts-feed">
            <h2 className="feed-title">
              Active Disputes & Complaints
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
              <p className="text-gray-500 py-4 text-center" style={{ color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No active complaints found.</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="alerts-feed">
            <h2 className="feed-title">
              Resolution History
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
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 py-4 text-center" style={{ color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No resolution history found.</p>
            )}
          </div>
        )}
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
                toast.success('Action successfully recorded!');
                setSelectedComplaint(null);
              }}>Take Action</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {selectedDispute && (
        <div className="complaint-modal-overlay" onClick={() => setSelectedDispute(null)}>
          <div className="complaint-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Resolve Room Dispute</h3>
              <button className="btn-close-modal" onClick={() => setSelectedDispute(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Schedule ID:</label>
                <p>#{selectedDispute.schedule_id}</p>
              </div>
              <div className="detail-group">
                <label>Room:</label>
                <p>{selectedDispute.room?.title}</p>
              </div>
              <div className="detail-group">
                <label>Tenant:</label>
                <p>{selectedDispute.tenant?.full_name} ({selectedDispute.tenant?.email})</p>
              </div>
              <div className="detail-group">
                <label>Landlord:</label>
                <p>{selectedDispute.landlordSchedule?.full_name}</p>
              </div>
              <div className="detail-group full-width">
                <label>Dispute Reason / Notes:</label>
                <div className="description-box" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDispute.dispute_reason || selectedDispute.notes}
                </div>
              </div>

              {selectedDispute.status === 'disputed' ? (
                <div className="detail-group full-width" style={{ marginTop: '20px' }}>
                  <label>Resolution Outcome:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="outcome" value="A" checked={disputeOutcome === 'A'} onChange={e => setDisputeOutcome(e.target.value)} />
                      <div>
                        <strong>Outcome A (Landlord Wrong)</strong> - 100% Refund to Tenant
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="outcome" value="B" checked={disputeOutcome === 'B'} onChange={e => setDisputeOutcome(e.target.value)} />
                      <div>
                        <strong>Outcome B (Tenant Unreasonable)</strong> - 0% Refund. Landlord gets 95%, Platform 5%
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="outcome" value="C" checked={disputeOutcome === 'C'} onChange={e => setDisputeOutcome(e.target.value)} />
                      <div>
                        <strong>Outcome C (Shared Fault)</strong> - 50% Refund to Tenant. Landlord 45%, Platform 5%
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="detail-group full-width" style={{ marginTop: '20px' }}>
                  <label>Status:</label>
                  <p style={{ color: '#10B981', fontWeight: 'bold' }}>Resolved</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedDispute(null)}>Close</button>
              {selectedDispute.status === 'disputed' && (
                <button 
                  className="btn-primary" 
                  disabled={!disputeOutcome}
                  style={{ opacity: !disputeOutcome ? 0.5 : 1 }}
                  onClick={async () => {
                    try {
                      await adminService.resolveDispute(selectedDispute.schedule_id, disputeOutcome);
                      toast.success('Dispute resolved successfully!');
                      setSelectedDispute(null);
                      fetchData();
                    } catch (err) {
                      toast.error('Failed to resolve dispute.');
                    }
                  }}
                >
                  Confirm Resolution
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
