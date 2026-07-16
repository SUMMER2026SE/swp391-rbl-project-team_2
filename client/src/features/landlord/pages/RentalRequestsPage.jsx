import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
  Check,
  X,
  ChevronDown,
  Search,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  FileSignature,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import SignatureCanvas from 'react-signature-canvas';
import useAuthStore from '../../../store/useAuthStore';
import { useRequests } from '../hooks/useRequests';
import Button from '../../../components/common/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import './RentalRequestsPage.css';

const RentalRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  
  // Create contract modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState({
    termsAndConditions: '',
    landlordName: '',
    landlordIc: '',
    landlordIcIssueDate: '',
    landlordIcIssuePlace: '',
    landlordPermanentAddress: '',
    assignedRoomNumber: '',
  });
  const landlordSigCanvas = React.useRef({});

  const { requests, loading, error, approve, reject } = useRequests();

  const [sortOrder, setSortOrder] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredRequests = requests.filter(req => {
    const tenantName = req.tenant?.full_name || '';
    const tenantEmail = req.tenant?.email || '';
    const roomTitle = req.room?.title || '';
    
    const matchesSearch =
      tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const reqDate = new Date(req.createdAt || new Date());
      if (dateFrom && new Date(dateFrom) > reqDate) matchesDate = false;
      if (dateTo && new Date(dateTo) < reqDate) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await approve(selectedRequest.requestId);
      setShowApproveModal(false);
      setShowDetailModal(false);
      setSelectedRequest(null);
      toast.success('Request approved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenContractModal = async (request) => {
    try {
      setIsSubmitting(true);
      const res = await api.get('/landlord/profile');
      if (!res.success) throw new Error('Failed to fetch profile');
      const profile = res.data;

      if (profile.verificationStatus !== 'verified' && profile.verification_status !== 'verified') {
        toast.error('Bạn cần phải được Quản trị viên (Admin) phê duyệt xác thực danh tính CCCD trước khi tạo hợp đồng thuê phòng.', { duration: 5000 });
        navigate('/landlord/profile');
        return;
      }
      
      if (!profile.icNumber || !profile.icIssueDate || !profile.icIssuePlace || !profile.permanentAddress) {
        toast.error('Vui lòng cập nhật đầy đủ thông tin pháp lý (CCCD, Địa chỉ) trong trang Profile trước khi tạo hợp đồng.', { duration: 5000 });
        navigate('/landlord/profile');
        return;
      }

      setContractData({
        termsAndConditions: '',
        landlordName: profile.fullName || user?.full_name || '',
        landlordIc: profile.icNumber,
        landlordIcIssueDate: profile.icIssueDate ? new Date(profile.icIssueDate).toISOString().split('T')[0] : '',
        landlordIcIssuePlace: profile.icIssuePlace,
        landlordPermanentAddress: profile.permanentAddress,
        assignedRoomNumber: request.room?.room_number || '',
      });
      setSelectedRequest(request);
      setShowContractModal(true);
      setShowDetailModal(false);
    } catch (error) {
      toast.error('Không thể lấy thông tin Profile. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateContract = async () => {
    try {
      if (!contractData.landlordName || !contractData.landlordIc || !contractData.landlordIcIssueDate || !contractData.landlordIcIssuePlace || !contractData.landlordPermanentAddress) {
          toast.error('Please fill in all identity details.');
          return;
      }
      if (!contractData.assignedRoomNumber) {
        toast.error('Vui lòng gán số phòng thực tế cho hợp đồng này.');
        return;
      }
      if (contractData.landlordIc.length !== 12) {
        toast.error('CCCD/CMND must be exactly 12 digits.');
        return;
      }

      if (!landlordSigCanvas.current || landlordSigCanvas.current.isEmpty()) {
        toast.error('Vui lòng ký tên vào hợp đồng.');
        return;
      }

      const landlordSignature = landlordSigCanvas.current.getCanvas().toDataURL('image/png');

      setIsSubmitting(true);
      const res = await api.post(`/landlord/rental-requests/${selectedRequest.requestId}/create-contract`, {
        termsAndConditions: contractData.termsAndConditions,
        landlordName: contractData.landlordName,
        landlordIc: contractData.landlordIc,
        landlordIcIssueDate: contractData.landlordIcIssueDate,
        landlordIcIssuePlace: contractData.landlordIcIssuePlace,
        landlordPermanentAddress: contractData.landlordPermanentAddress,
        landlordSignature: landlordSignature,
        assignedRoomNumber: contractData.assignedRoomNumber,
      });
      
      if (res.success) {
        toast.success('Contract created and sent to tenant!');
        setShowContractModal(false);
        setSelectedRequest(null);
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setIsSubmitting(true);
      await reject(selectedRequest.requestId, rejectReason);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      toast.success('Request rejected successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
      case 'completed':
      case 'deposit_paid':
        return 'success';
      case 'rejected':
      case 'cancelled':
        return 'danger';
      case 'contract_requested':
      case 'contract_created':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) return <Loading />;

  return (
    <div className="rental-requests">
      {/* Header */}
      <div className="rental-requests__header">
        <div>
          <h1 className="rental-requests__title">{t('landlordRequests.title')}</h1>
          <p className="rental-requests__subtitle">{t('landlordRequests.subtitle')}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="rental-requests__filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div className="filter-search" style={{ minWidth: '250px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder={t('landlordRequests.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '0.65rem 1rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{t('landlordRequests.from')}</span>
          <input type="date" lang="en-GB" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer' }} />
        </div>

        <div className="filter-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '0.65rem 1rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{t('landlordRequests.to')}</span>
          <input type="date" lang="en-GB" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer' }} />
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            <ChevronDown size={16} />
          </button>
          {showSortDropdown && (
            <div className="filter-dropdown-menu">
              <button className={`filter-dropdown-item ${sortOrder === 'newest' ? 'active' : ''}`} onClick={() => { setSortOrder('newest'); setShowSortDropdown(false); }}>{t('rentalRequests.newestFirst', 'Newest First')}</button>
              <button className={`filter-dropdown-item ${sortOrder === 'oldest' ? 'active' : ''}`} onClick={() => { setSortOrder('oldest'); setShowSortDropdown(false); }}>{t('rentalRequests.oldestFirst', 'Oldest First')}</button>
            </div>
          )}
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <span>{statusFilter === 'All' ? t('landlordRequests.all') : t(`landlordRequests.statusLabels.${statusFilter}`)}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['All', 'pending', 'approved', 'contract_requested', 'contract_created', 'completed', 'rejected', 'cancelled'].map(status => (
                <button
                  key={status}
                  className={`filter-dropdown-item ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  {status === 'All' ? t('landlordRequests.all') : t(`landlordRequests.statusLabels.${status}`)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length > 0 ? (
        <div className="rental-requests__table-container">
          <table className="rental-requests__table">
            <thead>
              <tr>
                <th>{t('landlordRequests.tenant')}</th>
                <th>{t('landlordRequests.room')}</th>
                <th>{t('landlordRequests.requestDate')}</th>
                <th>{t('landlordRequests.moveInDate')}</th>
                <th>{t('landlordRequests.status')}</th>
                <th>{t('landlordRequests.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.requestId} className="request-row">
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-avatar">
                        <img src={getGlobalAvatar(request.tenant?.full_name, request.tenant?.avatar_url)} alt={request.tenant?.full_name || 'Unknown'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      </div>
                      <div>
                        <div className="tenant-name">{request.tenant?.full_name || 'Unknown'}</div>
                        <div className="tenant-email">{request.tenant?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="room-info" style={{ display: 'flex', alignItems: 'center' }}>
                      <div 
                        className="room-title" 
                        style={{ cursor: 'pointer', color: '#2563EB', textDecoration: 'underline', margin: 0 }}
                        onClick={() => navigate(`/rooms/${request.room?.room_id}`)}
                      >
                        {request.room?.title || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {request.created_at ? new Date(request.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {request.requested_move_in_date ? new Date(request.requested_move_in_date).toLocaleDateString('en-GB') : 'TBD'}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusColor(request.status)}>
                      {t(`landlordRequests.statusLabels.${request.status}`)}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailModal(true);
                      }}
                    >{t('landlordRequests.viewDetails')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title={t('landlordRequests.noRequests')}
          description={t('landlordRequests.noRequestsDesc')}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('landlordRequests.requestDetails')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Tenant Info */}
              <div className="detail-section">
                <h4 className="section-title">{t('landlordRequests.tenantInfo')}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t('landlordRequests.name')}</label>
                    <div className="detail-value">{selectedRequest.tenant?.full_name || 'N/A'}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.email')}</label>
                    <div className="detail-value">
                      <Mail size={14} />
                      {selectedRequest.tenant?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.phone')}</label>
                    <div className="detail-value">
                      <Phone size={14} />
                      {selectedRequest.tenant?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.status')}</label>
                    <div className="detail-value">
                      <Badge variant={getStatusColor(selectedRequest.status)}>
                        {t(`landlordRequests.statusLabels.${selectedRequest.status}`)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="detail-section">
                <h4 className="section-title">{t('landlordRequests.roomInfo')}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t('landlordRequests.roomTitle')}</label>
                    <div className="detail-value">{selectedRequest.room?.title || 'N/A'}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.monthlyRent')}</label>
                    <div className="detail-value">{selectedRequest.room?.price_per_month?.toLocaleString('vi-VN') || 0} {t('landlordRequests.vndPerMonth')}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.requestType')}</label>
                    <div className="detail-value">{t('landlordRequests.rentalRequest')}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.moveInDate', 'Thời gian chuyển vào')}</label>
                    <div className="detail-value">
                      {selectedRequest.requested_move_in_date || selectedRequest.requestedMoveInDate
                        ? new Date(selectedRequest.requested_move_in_date || selectedRequest.requestedMoveInDate).toLocaleDateString('vi-VN') 
                        : 'Chưa xác định'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>{t('landlordRequests.rentalDuration', 'Thời hạn thuê')}</label>
                    <div className="detail-value">
                      {selectedRequest.lease_duration_months || selectedRequest.leaseDurationMonths
                        ? `${selectedRequest.lease_duration_months || selectedRequest.leaseDurationMonths} tháng`
                        : 'Chưa xác định'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Message */}
              {selectedRequest.message && (
                <div className="detail-section">
                  <h4 className="section-title">{t('landlordRequests.messageFromTenant')}</h4>
                  <div className="message-box">
                    <FileText size={16} />
                    <p>{selectedRequest.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(true);
                  }}
                  disabled={isSubmitting}
                >
                  <X size={16} />{t('landlordRequests.rejectRequest')}</Button>
                <Button
                  variant="primary"
                  onClick={() => setShowApproveModal(true)}
                  disabled={isSubmitting}
                >
                  <Check size={16} />{t('landlordRequests.approveRequest')}</Button>
              </div>
            )}
            
            {/* Create Contract Button */}
            {selectedRequest.status === 'contract_requested' && (
              <div className="modal-footer">
                <Button
                  variant="primary"
                  onClick={() => handleOpenContractModal(selectedRequest)}
                  disabled={isSubmitting}
                  style={{ background: '#7c3aed' }}
                >
                  <FileSignature size={16} />{t('landlordRequests.createContract')}</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('landlordRequests.rejectRequest')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="reject-info">{t('landlordRequests.rejectInfo')}</p>
              <textarea
                className="reject-textarea"
                placeholder={t('landlordRequests.rejectPlaceholder')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="5"
                disabled={isSubmitting}
              />
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={isSubmitting}
              >{t('landlordRequests.cancel')}</Button>
              <Button
                variant="danger"
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('landlordRequests.rejecting') : t('landlordRequests.rejectRequest')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('landlordRequests.approveRequest')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowApproveModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{t('landlordRequests.approveConfirm')}<strong>{selectedRequest.tenant?.full_name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowApproveModal(false)}
                disabled={isSubmitting}
              >{t('landlordRequests.cancel')}</Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('landlordRequests.approving') : t('landlordRequests.yesApprove')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showContractModal && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setShowContractModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: '40px 20px', overflowY: 'auto', display: 'block' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '0', position: 'relative' }}>
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{t('landlordRequests.createContract')}</h3>
              <button className="modal-close-btn" onClick={() => setShowContractModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '1rem' }}>{t('landlordRequests.roomDetails')}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#475569' }}><strong>{t('landlordRequests.room')}:</strong> {selectedRequest.room?.title}</p>
                  <p style={{ margin: 0, color: '#475569' }}><strong>{t('landlordRequests.monthlyRent')}:</strong> {selectedRequest.room?.price_per_month?.toLocaleString('vi-VN')} {t('landlordRequests.vndPerMonth')}</p>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>{t('landlordRequests.assignRoomNumber')}</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 101, A2" 
                      value={contractData.assignedRoomNumber} 
                      onChange={(e) => setContractData({...contractData, assignedRoomNumber: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '1rem' }}>{t('landlordRequests.identityInfo')}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>{t('landlordRequests.fullName')}</label>
                      <input type="text" value={contractData.landlordName} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>{t('landlordRequests.cccd')}</label>
                      <input type="text" value={contractData.landlordIc} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>{t('landlordRequests.issueDate')}</label>
                      <input type="date" lang="en-GB" value={contractData.landlordIcIssueDate} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>{t('landlordRequests.issuePlace')}</label>
                      <input type="text" value={contractData.landlordIcIssuePlace} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label>{t('landlordRequests.permanentAddress')}</label>
                      <input type="text" value={contractData.landlordPermanentAddress} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>{t('landlordRequests.additionalTerms')}</label>
                  <textarea 
                    value={contractData.termsAndConditions} 
                    onChange={(e) => setContractData({...contractData, termsAndConditions: e.target.value})}
                    placeholder={t('landlordRequests.termsPlaceholder')}
                    rows="4"
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>{t('landlordRequests.yourSignature')}</label>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden' }}>
                    <SignatureCanvas 
                      ref={landlordSigCanvas}
                      penColor="black"
                      canvasProps={{ width: 750, height: 200, className: 'sigCanvas' }}
                      backgroundColor="#f8fafc"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="button" onClick={() => landlordSigCanvas.current.clear()} style={{ padding: '6px 12px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>{t('landlordRequests.clearSignature')}</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <Button variant="secondary" onClick={() => setShowContractModal(false)} disabled={isSubmitting}>{t('landlordRequests.cancel')}</Button>
              <Button variant="primary" onClick={handleCreateContract} disabled={isSubmitting} style={{ background: '#7c3aed' }}>
                {isSubmitting ? t('landlordRequests.sending') : t('landlordRequests.signAndSend')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalRequestsPage;
