import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, AlertCircle, Shield, Search, Bell, Mail, MessageSquare } from 'lucide-react';
import adminService from '../../../services/adminService';
import ContractDocumentModal from '../../tenant/components/ContractDocumentModal';
import './ViolationManagementPage.css';

const ViolationManagementPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [terminationDisputes, setTerminationDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [selectedTermDispute, setSelectedTermDispute] = useState(null);
  const [disputeOutcome, setDisputeOutcome] = useState('');
  const [showFullContract, setShowFullContract] = useState(false);
  
  // States for Termination Dispute Modal
  const [termRefund, setTermRefund] = useState('0');
  const [termRetained, setTermRetained] = useState('0');
  const [termComp, setTermComp] = useState('0');
  const [termNote, setTermNote] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, dispRes, termDispRes] = await Promise.all([
        adminService.getAllComplaints(),
        adminService.getAllDisputes(),
        adminService.getTerminationDisputes()
      ]);
      if (compRes.success) setComplaints(compRes.data);
      if (dispRes.success) setDisputes(dispRes.data);
      if (termDispRes?.success) setTerminationDisputes(termDispRes.data);
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

  const termDisputeAlerts = terminationDisputes.map(d => ({
    id: `term-${d.request_id}`,
    type: 'termination_dispute',
    severity: 'critical',
    title: `Tranh chấp Hợp đồng #${d.contract?.contract_number} (${d.contract?.room?.title})`,
    description: `Lý do: ${d.reason}\nGhi chú: ${d.review_note}`,
    time: new Date(d.updated_at).toLocaleString('vi-VN'),
    actionLabel: 'Giải quyết Hợp đồng',
    secondaryAction: 'Ignore',
    status: d.status,
    raw: d
  }));

  const alerts = [...complaintAlerts, ...disputeAlerts, ...termDisputeAlerts].sort((a, b) => new Date(b.time) - new Date(a.time));

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
                        } else if (alert.type === 'termination_dispute') {
                          setSelectedTermDispute(alert.raw);
                          setTermRefund(String(alert.raw.contract?.deposit_amount || 0));
                          setTermRetained('0');
                          setTermComp('0');
                          setTermNote('');
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

      {/* Termination Dispute Resolution Modal */}
      {selectedTermDispute && (
        <div className="complaint-modal-overlay" onClick={() => setSelectedTermDispute(null)}>
          <div className="complaint-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Giải quyết Tranh chấp Hợp đồng</h3>
              <button className="btn-close-modal" onClick={() => setSelectedTermDispute(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <label>Hợp đồng</label>
                <p>#{selectedTermDispute.contract?.contract_number} - {selectedTermDispute.contract?.room?.title}</p>
              </div>
              <div className="detail-group">
                <label>Khách thuê</label>
                <p>{selectedTermDispute.contract?.tenant?.full_name}</p>
              </div>
              <div className="detail-group">
                <label>Chủ nhà</label>
                <p>{selectedTermDispute.contract?.landlordContract?.full_name}</p>
              </div>
              <div className="detail-group full-width">
                <label>Nội dung tranh chấp</label>
                <div className="description-box" style={{ whiteSpace: 'pre-wrap' }}>
                  <strong>Lý do gốc:</strong> {selectedTermDispute.reason}<br/>
                  <strong>Ghi chú tranh chấp:</strong> {selectedTermDispute.review_note}
                  
                  {(() => {
                    const renderUrls = (urlsRaw, title) => {
                      let urls = [];
                      if (Array.isArray(urlsRaw)) urls = urlsRaw;
                      else if (typeof urlsRaw === 'string') {
                        try {
                          urls = JSON.parse(urlsRaw);
                          if (!Array.isArray(urls)) urls = [urlsRaw];
                        } catch(e) { urls = [urlsRaw]; }
                      }
                      if (!urls || urls.length === 0) return null;
                      return (
                        <div style={{ marginTop: 12 }}>
                          <strong style={{ fontSize: 13, color: '#475569' }}>{title}:</strong>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                            {urls.map((u, i) => {
                              const fullUrl = u.startsWith('http') || u.startsWith('data:') ? u : `http://localhost:5000${u.startsWith('/') ? '' : '/'}${u}`;
                              return (
                                <a key={i} href={fullUrl} target="_blank" rel="noreferrer" style={{ width: 60, height: 60, borderRadius: 6, overflow: 'hidden', border: '1px solid #cbd5e1', display: 'block' }}>
                                  <img src={fullUrl} alt="evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style="font-size:10px;text-align:center;padding-top:20px;">FILE</div>'; }} />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      );
                    };
                    return (
                      <>
                        {renderUrls(selectedTermDispute.evidence_urls, 'Bằng chứng của bên Yêu cầu')}
                        {renderUrls(selectedTermDispute.reject_evidence_urls, 'Bằng chứng của bên Từ chối')}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="detail-group full-width" style={{ marginTop: '20px', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ color: '#0f172a', fontSize: '1rem', margin: 0 }}>Thông tin Hợp đồng</label>
                  <button 
                    onClick={() => setShowFullContract(true)}
                    style={{ padding: '4px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}
                  >
                    Xem Bản Gốc Hợp Đồng
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Ngày bắt đầu:</span><br/>
                    <strong style={{ color: '#0f172a' }}>{selectedTermDispute.contract?.start_date ? new Date(selectedTermDispute.contract.start_date).toLocaleDateString('vi-VN') : 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Ngày kết thúc:</span><br/>
                    <strong style={{ color: '#0f172a' }}>{selectedTermDispute.contract?.end_date ? new Date(selectedTermDispute.contract.end_date).toLocaleDateString('vi-VN') : 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Tiền cọc đã nộp:</span><br/>
                    <strong style={{ color: '#0f172a' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTermDispute.contract?.deposit_amount || selectedTermDispute.contract?.deposit || 0)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Tiền phòng mỗi tháng:</span><br/>
                    <strong style={{ color: '#0f172a' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTermDispute.contract?.monthly_rent || selectedTermDispute.contract?.room?.price_per_month || 0)}</strong>
                  </div>
                </div>
                {selectedTermDispute.contract?.terms_and_conditions && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 4 }}>Điều khoản hợp đồng:</span>
                    <div style={{ fontSize: 13, color: '#334155', maxHeight: '100px', overflowY: 'auto', background: '#fff', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1', whiteSpace: 'pre-wrap' }}>
                      {selectedTermDispute.contract.terms_and_conditions}
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-group full-width" style={{ marginTop: '20px' }}>
                <label style={{ color: '#d97706', fontSize: '1.1rem', marginBottom: 12 }}>Phán quyết Tài chính (VND)</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Tiền hoàn trả cho Tenant</label>
                    <input 
                      type="number" 
                      value={termRefund}
                      onChange={e => setTermRefund(e.target.value)}
                      className="tm-input"
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Tiền Chủ nhà giữ lại</label>
                    <input 
                      type="number" 
                      value={termRetained}
                      onChange={e => setTermRetained(e.target.value)}
                      className="tm-input"
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Tiền bồi thường (nếu có)</label>
                    <input 
                      type="number" 
                      value={termComp}
                      onChange={e => setTermComp(e.target.value)}
                      className="tm-input"
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>Ghi chú phán quyết (Bắt buộc)</label>
                    <textarea 
                      rows={3}
                      value={termNote}
                      onChange={e => setTermNote(e.target.value)}
                      className="tm-input"
                      placeholder="Nhập ghi chú hoặc lý do giải quyết..."
                      style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: 4 }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedTermDispute(null)}>Đóng</button>
              <button 
                className="btn-primary" 
                disabled={loading || !termNote.trim()}
                style={{ opacity: (!termNote.trim() || loading) ? 0.5 : 1, background: '#dc2626' }}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await adminService.resolveTerminationDispute(selectedTermDispute.request_id, {
                      depositRefund: termRefund,
                      depositRetained: termRetained,
                      compensation: termComp,
                      adminNote: termNote
                    });
                    toast.success('Đã giải quyết tranh chấp hợp đồng thành công!');
                    setSelectedTermDispute(null);
                    fetchData();
                  } catch (err) {
                    toast.error('Lỗi khi giải quyết tranh chấp.');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Xác nhận Phán quyết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Contract Document Modal */}
      {selectedTermDispute?.contract && (
        <ContractDocumentModal 
          isOpen={showFullContract} 
          onClose={() => setShowFullContract(false)} 
          contract={selectedTermDispute.contract} 
          readOnly={true} 
        />
      )}
    </div>
  );
};

export default ViolationManagementPage;
