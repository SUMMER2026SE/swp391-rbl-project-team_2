import toast from 'react-hot-toast';
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
} from 'lucide-react';
import { useRequests } from '../hooks/useRequests';
import Button from '../../../components/common/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import './RentalRequestsPage.css';

const RentalRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { requests, loading, error, approve, reject } = useRequests();

  const filteredRequests = requests.filter(req => {
    const tenantName = req.tenant?.full_name || '';
    const tenantEmail = req.tenant?.email || '';
    const roomTitle = req.room?.title || '';
    
    const matchesSearch =
      tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (requestId) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        setIsSubmitting(true);
        await approve(requestId);
        setShowDetailModal(false);
        setSelectedRequest(null);
        toast.success('Request approved successfully!');
      } catch (err) {
        toast.error(err.message || 'Failed to approve request');
      } finally {
        setIsSubmitting(false);
      }
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
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="rental-requests">
      {/* Header */}
      <div className="rental-requests__header">
        <div>
          <h1 className="rental-requests__title">Rental Requests</h1>
          <p className="rental-requests__subtitle">Review and manage tenant rental applications</p>
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
            <span>{statusFilter}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['All', 'pending', 'approved', 'rejected', 'cancelled'].map(status => (
                <button
                  key={status}
                  className={`filter-dropdown-item ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
                <th>Tenant</th>
                <th>Room</th>
                <th>Request Date</th>
                <th>Move-in Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.requestId} className="request-row">
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-avatar">
                        {request.tenant?.avatar ? (
                          <img src={request.tenant.avatar} alt={request.tenant.full_name} />
                        ) : (
                          <span>{request.tenant?.full_name?.charAt(0) || 'T'}</span>
                        )}
                      </div>
                      <div>
                        <div className="tenant-name">{request.tenant?.full_name || 'Unknown'}</div>
                        <div className="tenant-email">{request.tenant?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="room-info">
                      <div className="room-title">{request.room?.title || 'N/A'}</div>
                      <div className="room-price">{request.room?.price_per_month || 0} đ/month</div>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Unknown'}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedRequest(request);
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
      ) : (
        <EmptyState
          icon="📋"
          title="No rental requests"
          description="You don't have any rental requests yet"
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rental Request Details</h3>
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
                    <div className="detail-value">{selectedRequest.tenant?.full_name || 'N/A'}</div>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <div className="detail-value">
                      <Mail size={14} />
                      {selectedRequest.tenant?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <div className="detail-value">
                      <Phone size={14} />
                      {selectedRequest.tenant?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <div className="detail-value">
                      <Badge variant={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status?.charAt(0).toUpperCase() + selectedRequest.status?.slice(1) || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="detail-section">
                <h4 className="section-title">Room Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Room Title</label>
                    <div className="detail-value">{selectedRequest.room?.title || 'N/A'}</div>
                  </div>
                  <div className="detail-item">
                    <label>Monthly Rent</label>
                    <div className="detail-value">{selectedRequest.room?.price_per_month || 0} VNĐ/month</div>
                  </div>
                  <div className="detail-item">
                    <label>Request Type</label>
                    <div className="detail-value">
                      {selectedRequest.type === 'view_request' ? 'Viewing Request' : 'Deposit'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Lease Duration</label>
                    <div className="detail-value">{selectedRequest.lease_duration_months || 12} months</div>
                  </div>
                </div>
              </div>

              {/* Request Message */}
              {selectedRequest.message && (
                <div className="detail-section">
                  <h4 className="section-title">Message from Tenant</h4>
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
                  <X size={16} />
                  Reject Request
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedRequest.requestId)}
                  disabled={isSubmitting}
                >
                  <Check size={16} />
                  Approve Request
                </Button>
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
              <h3>Reject Request</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="reject-info">
                Please provide a reason for rejecting this rental request. This will be sent to the tenant.
              </p>
              <textarea
                className="reject-textarea"
                placeholder="Enter rejection reason..."
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
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalRequestsPage;
