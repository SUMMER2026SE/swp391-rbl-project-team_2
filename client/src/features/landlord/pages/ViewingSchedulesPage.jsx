import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
  Eye,
  UserX,
  FileSignature,
  DollarSign,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Timer,
} from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/common/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import './RentalRequestsPage.css'; // Re-use the CSS

const ViewingSchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Create contract modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState({
    startDate: '',
    endDate: '',
    monthlyRent: '',
    termsAndConditions: '',
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary'
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/landlord/viewing-schedules?limit=100');
      if (res.success) {
        setSchedules(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch viewing schedules');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const tenantName = schedule.tenant?.full_name || '';
    const tenantEmail = schedule.tenant?.email || '';
    const roomTitle = schedule.room?.title || '';
    
    const matchesSearch =
      tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || schedule.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt || b.scheduledDate || 0) - new Date(a.createdAt || a.scheduledDate || 0));

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdateStatus = (scheduleId, newStatus) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Update Status',
      message: `Are you sure you want to mark this schedule as ${newStatus}?`,
      confirmText: 'Yes, Update',
      cancelText: 'Cancel',
      type: 'primary',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const res = await api.put(`/landlord/viewing-schedules/${scheduleId}`, { status: newStatus });
          if (res.success) {
            toast.success(`Viewing schedule ${newStatus} successfully!`);
            setShowDetailModal(false);
            setSelectedSchedule(null);
            fetchSchedules();
          }
        } catch (err) {
          toast.error(err.message || `Failed to ${newStatus} schedule`);
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleConfirmViewing = (scheduleId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Tenant Visit',
      message: 'Confirm that the tenant has visited the room?',
      confirmText: 'Confirm Visit',
      cancelText: 'Cancel',
      type: 'primary',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const res = await api.put(`/landlord/viewing-schedules/${scheduleId}/confirm-viewing`);
          if (res.success) {
            toast.success('Viewing confirmed! Tenant can now decide to rent or report an issue.');
            setShowDetailModal(false);
            setSelectedSchedule(null);
            fetchSchedules();
          }
        } catch (err) {
          toast.error(err.message || 'Failed to confirm viewing');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleMarkNoShow = (scheduleId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Mark No-Show',
      message: 'Mark tenant as no-show? They will lose their deposit.',
      confirmText: 'Mark No-Show',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const res = await api.put(`/landlord/viewing-schedules/${scheduleId}/no-show`);
          if (res.success) {
            toast.success('Tenant marked as no-show. Deposit forfeited.');
            setShowDetailModal(false);
            setSelectedSchedule(null);
            fetchSchedules();
          }
        } catch (err) {
          toast.error(err.message || 'Failed to mark no-show');
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleOpenContractModal = (schedule) => {
    setContractData({
      startDate: '',
      endDate: '',
      monthlyRent: schedule.room?.price_per_month || '',
      termsAndConditions: '',
    });
    setSelectedSchedule(schedule);
    setShowContractModal(true);
    setShowDetailModal(false);
  };

  const handleCreateContract = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post(`/landlord/viewing-schedules/${selectedSchedule.scheduleId}/create-contract`, {
        termsAndConditions: contractData.termsAndConditions,
      });
      if (res.success) {
        toast.success('Contract created! Waiting for tenant to sign.');
        setShowContractModal(false);
        setSelectedSchedule(null);
        fetchSchedules();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending_payment': return 'warning';
      case 'scheduled': return 'info';
      case 'confirmed': return 'success';
      case 'contract_requested': return 'info';
      case 'contract_created': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'rejected': return 'danger';
      case 'no_show': return 'danger';
      case 'disputed': return 'warning';
      case 'dispute_resolved': return 'success';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_payment': return 'Pending Payment';
      case 'scheduled': return 'Scheduled';
      case 'confirmed': return 'Confirmed';
      case 'contract_requested': return 'Contract Requested';
      case 'contract_created': return 'Contract Created';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      case 'no_show': return 'No Show';
      case 'disputed': return 'Disputed';
      case 'dispute_resolved': return 'Dispute Resolved';
      case 'expired': return 'Expired';
      default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="rental-requests">
      {/* Header */}
      <div className="rental-requests__header">
        <div>
          <h1 className="rental-requests__title">Viewing Schedules</h1>
          <p className="rental-requests__subtitle">Review and manage tenant viewing requests, confirm visits, and create contracts</p>
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
      <div className="rental-requests__filter-bar">
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by tenant name, email, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <span>{statusFilter === 'All' ? 'All Statuses' : getStatusLabel(statusFilter)}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['All', 'pending_payment', 'scheduled', 'confirmed', 'contract_requested', 'contract_created', 'completed', 'no_show', 'disputed', 'cancelled'].map(status => (
                <button
                  key={status}
                  className={`filter-dropdown-item ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  {status === 'All' ? 'All Statuses' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requests Table */}
      {filteredSchedules.length > 0 ? (
        <>
          <div className="rental-requests__table-container">
            <table className="rental-requests__table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Room</th>
                  <th>Viewing Date</th>
                  <th>Deposit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {paginatedSchedules.map(schedule => (
                <tr key={schedule.scheduleId} className="request-row">
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-avatar">
                        {schedule.tenant?.avatar_url ? (
                          <img src={schedule.tenant.avatar_url} alt={schedule.tenant.full_name} />
                        ) : (
                          <span>{schedule.tenant?.full_name?.charAt(0) || 'T'}</span>
                        )}
                      </div>
                      <div>
                        <div className="tenant-name">{schedule.tenant?.full_name || 'Unknown'}</div>
                        <div className="tenant-email">{schedule.tenant?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="room-info">
                      <div className="room-title">{schedule.room?.title || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {schedule.scheduledDate ? new Date(schedule.scheduledDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#059669', fontSize: '13px' }}>
                      {schedule.depositAmount ? `${parseFloat(schedule.depositAmount).toLocaleString('vi-VN')} đ` : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusColor(schedule.status)}>
                      {getStatusLabel(schedule.status)}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setShowDetailModal(true);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination-container">
            <button 
              className={`btn-pagination ${currentPage === 1 ? 'disabled' : ''}`}
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className={`btn-pagination ${currentPage === totalPages ? 'disabled' : ''}`}
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
        </>
      ) : (
        <EmptyState
          icon="📅"
          title="No viewing schedules"
          description="You don't have any viewing requests or schedules yet"
        />
      )}

      {/* =================== Detail Modal =================== */}
      {showDetailModal && selectedSchedule && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Viewing Schedule Details</h3>
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
                <h4 className="section-title">Tenant Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <div className="detail-value">{selectedSchedule.tenant?.full_name || 'N/A'}</div>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <div className="detail-value">
                      <Mail size={14} />
                      {selectedSchedule.tenant?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <div className="detail-value">
                      <Phone size={14} />
                      {selectedSchedule.tenant?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <div className="detail-value">
                      <Badge variant={getStatusColor(selectedSchedule.status)}>
                        {getStatusLabel(selectedSchedule.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="detail-section">
                <h4 className="section-title">Room & Schedule</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Room Title</label>
                    <div className="detail-value">{selectedSchedule.room?.title || 'N/A'}</div>
                  </div>
                  <div className="detail-item">
                    <label>Scheduled Date</label>
                    <div className="detail-value">
                      {selectedSchedule.scheduledDate ? new Date(selectedSchedule.scheduledDate).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Deposit Amount</label>
                    <div className="detail-value" style={{ color: '#059669', fontWeight: 700 }}>
                      {selectedSchedule.depositAmount 
                        ? `${parseFloat(selectedSchedule.depositAmount).toLocaleString('vi-VN')} VND (10% of room price)` 
                        : 'N/A'}
                    </div>
                  </div>
                  {selectedSchedule.tenantDecision && selectedSchedule.tenantDecision !== 'pending' && (
                    <div className="detail-item">
                      <label>Tenant Decision</label>
                      <div className="detail-value">
                        {selectedSchedule.tenantDecision === 'want_to_rent' ? '✅ Wants to rent' : 
                         selectedSchedule.tenantDecision === 'disputed' ? '⚠️ Disputed' :
                         selectedSchedule.tenantDecision === 'rented' ? '🏠 Rented' :
                         selectedSchedule.tenantDecision}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedSchedule.notes && (
                <div className="detail-section">
                  <h4 className="section-title">Notes</h4>
                  <div className="message-box">
                    <FileText size={16} />
                    <p>{selectedSchedule.notes}</p>
                  </div>
                </div>
              )}

              {/* Dispute Reason */}
              {selectedSchedule.disputeReason && (
                <div className="detail-section">
                  <h4 className="section-title" style={{ color: '#dc2626' }}>Dispute Reason</h4>
                  <div className="message-box" style={{ background: '#fef2f2', border: '1px solid #fecdd3' }}>
                    <AlertCircle size={16} style={{ color: '#dc2626' }} />
                    <p style={{ color: '#991b1b' }}>{selectedSchedule.disputeReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== MODAL FOOTER ACTIONS ===== */}
            
            {/* Pending status: Approve or Reject */}
            {selectedSchedule.status === 'pending' && (
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus(selectedSchedule.scheduleId, 'rejected')}
                  disabled={isSubmitting}
                >
                  <X size={16} />
                  Reject Request
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus(selectedSchedule.scheduleId, 'scheduled')}
                  disabled={isSubmitting}
                >
                  <Check size={16} />
                  Approve Schedule
                </Button>
              </div>
            )}

            {/* Scheduled: Confirm Viewing or Mark No-Show */}
            {selectedSchedule.status === 'scheduled' && (
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => handleMarkNoShow(selectedSchedule.scheduleId)}
                  disabled={isSubmitting}
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecdd3' }}
                >
                  <UserX size={16} />
                  Mark No-Show
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus(selectedSchedule.scheduleId, 'cancelled')}
                  disabled={isSubmitting}
                >
                  Cancel Schedule
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleConfirmViewing(selectedSchedule.scheduleId)}
                  disabled={isSubmitting}
                  style={{ background: '#059669' }}
                >
                  <Eye size={16} />
                  Confirm Tenant Visited
                </Button>
              </div>
            )}

            {/* Contract Requested: Create Contract */}
            {selectedSchedule.status === 'contract_requested' && (
              <div className="modal-footer">
                <Button
                  variant="primary"
                  onClick={() => handleOpenContractModal(selectedSchedule)}
                  disabled={isSubmitting}
                  style={{ background: '#7c3aed' }}
                >
                  <FileSignature size={16} />
                  Create Contract
                </Button>
              </div>
            )}

            {/* Contract Created: Info only */}
            {selectedSchedule.status === 'contract_created' && (
              <div className="modal-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontWeight: 600 }}>
                  <Clock size={16} />
                  Waiting for tenant to sign the contract...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================== Create Contract Modal =================== */}
      {showContractModal && selectedSchedule && (
        <div className="modal-backdrop" onClick={() => setShowContractModal(false)}>
          <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Rental Contract</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowContractModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
                  <strong>Room:</strong> {selectedSchedule.room?.title}<br />
                  <strong>Tenant:</strong> {selectedSchedule.tenant?.full_name}<br />
                  <strong>Deposit paid:</strong> {selectedSchedule.depositAmount ? `${parseFloat(selectedSchedule.depositAmount).toLocaleString('vi-VN')} VND` : 'N/A'}<br />
                  <span style={{ fontSize: '12px', color: '#15803d' }}>
                    When tenant signs, platform retains 5% commission on deposit. 95% goes to you.
                  </span>
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  <strong>Rent Price:</strong> {selectedSchedule.room?.price_per_month?.toLocaleString('vi-VN')} VND/month (Fixed)<br />
                  {selectedSchedule.draftContract && (
                    <>
                      <strong>Move-in Date:</strong> {new Date(selectedSchedule.draftContract.start_date).toLocaleDateString('vi-VN')}<br />
                      <strong>End Date:</strong> {new Date(selectedSchedule.draftContract.end_date).toLocaleDateString('vi-VN')}<br />
                    </>
                  )}
                  <span style={{ fontSize: '13px', fontStyle: 'italic', display: 'block', marginTop: '8px', color: '#64748B' }}>
                    * The Move-in Date and Rental Duration were selected by the tenant. They will be automatically applied to this contract.
                  </span>
                </p>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Terms & Conditions</label>
                <textarea
                  value={contractData.termsAndConditions}
                  onChange={(e) => setContractData({ ...contractData, termsAndConditions: e.target.value })}
                  placeholder="Enter rental terms and conditions..."
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowContractModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateContract}
                disabled={isSubmitting}
                style={{ background: '#7c3aed' }}
              >
                <FileSignature size={16} />
                {isSubmitting ? 'Creating...' : 'Create Contract'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Dialog Modal */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-container" style={{ maxWidth: '400px', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 className="modal-title" style={{ fontSize: '18px' }}>{confirmDialog.title}</h2>
              <button 
                className="modal-close" 
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ margin: 0, fontSize: '15px', color: '#4b5563', lineHeight: 1.5 }}>
                {confirmDialog.message}
              </p>
            </div>
            
            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
              <Button
                variant="secondary"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                {confirmDialog.cancelText}
              </Button>
              <Button
                variant={confirmDialog.type === 'danger' ? 'danger' : 'primary'}
                onClick={() => {
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                }}
                style={confirmDialog.type === 'primary' ? { background: '#10b981' } : {}}
              >
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewingSchedulesPage;
