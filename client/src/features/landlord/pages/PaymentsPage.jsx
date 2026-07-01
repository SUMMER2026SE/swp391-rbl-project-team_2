import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  Download,
  Eye,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import Button from '../../../components/common/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import { getAvatarUrl as getGlobalAvatar } from '../../../utils/format';
import './PaymentsPage.css';

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { payments, statistics, loading, error } = usePayments();

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.roomTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="payments">
      {/* Header */}
      <div className="payments__header">
        <div>
          <h1 className="payments__title">Payments</h1>
          <p className="payments__subtitle">Track and manage all rental payments</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="payments__stats-grid">
          <div className="stat-card">
            <div className="stat-card__header">
              <h4>Total Revenue</h4>
              <DollarSign size={20} className="stat-icon" />
            </div>
            <div className="stat-card__value">
              ${statistics.totalRevenue?.toLocaleString() || '0'}
            </div>
            <div className="stat-card__subtitle">
              {statistics.totalPayments || 0} payments
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <h4>Pending Payments</h4>
              <AlertCircle size={20} className="stat-icon stat-icon--warning" />
            </div>
            <div className="stat-card__value">
              ${statistics.pendingAmount?.toLocaleString() || '0'}
            </div>
            <div className="stat-card__subtitle">
              {statistics.pendingCount || 0} pending
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <h4>This Month</h4>
              <TrendingUp size={20} className="stat-icon stat-icon--success" />
            </div>
            <div className="stat-card__value">
              ${statistics.monthlyRevenue?.toLocaleString() || '0'}
            </div>
            <div className="stat-card__subtitle">
              {statistics.monthlyPayments || 0} payments
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <h4>Average Payment</h4>
              <DollarSign size={20} className="stat-icon stat-icon--info" />
            </div>
            <div className="stat-card__value">
              ${statistics.averagePayment?.toLocaleString() || '0'}
            </div>
            <div className="stat-card__subtitle">Per transaction</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="payments__filter-bar">
        <div className="filter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by tenant, room, or transaction ID..."
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
              {['All', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'].map(status => (
                <button
                  key={status}
                  className={`filter-dropdown-item ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button variant="secondary">
          <Download size={16} />
          Export
        </Button>
      </div>

      {/* Payments Table */}
      {filteredPayments.length > 0 ? (
        <div className="payments__table-container">
          <table className="payments__table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="payment-row">
                  <td>
                    <div className="tenant-info">
                      <div className="tenant-avatar">
                        <img src={getGlobalAvatar(payment.tenantName, payment.tenantAvatar)} alt={payment.tenantName || 'Unknown'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      </div>
                      <div>
                        <div className="tenant-name">{payment.tenantName}</div>
                        <div className="tenant-email">{payment.tenantEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="room-info">
                      <div className="room-title">{payment.roomTitle}</div>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <DollarSign size={14} />
                      ${payment.amount?.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={14} />
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <Badge variant={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="💳"
          title="No payments found"
          description="You don't have any payments yet"
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Payment Status */}
              <div className="detail-section">
                <div className="status-display">
                  <Badge variant={getStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>

              {/* Payment Info */}
              <div className="detail-section">
                <h4 className="section-title">Payment Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Transaction ID</label>
                    <div className="detail-value">{selectedPayment.transactionId}</div>
                  </div>
                  <div className="detail-item">
                    <label>Amount</label>
                    <div className="detail-value">
                      <DollarSign size={14} />
                      ${selectedPayment.amount?.toLocaleString()}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Payment Date</label>
                    <div className="detail-value">
                      <Calendar size={14} />
                      {new Date(selectedPayment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Payment Method</label>
                    <div className="detail-value">{selectedPayment.paymentMethod}</div>
                  </div>
                </div>
              </div>

              {/* Tenant Info */}
              <div className="detail-section">
                <h4 className="section-title">Tenant Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <div className="detail-value">{selectedPayment.tenantName}</div>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <div className="detail-value">{selectedPayment.tenantEmail}</div>
                  </div>
                </div>
              </div>

              {/* Room Info */}
              <div className="detail-section">
                <h4 className="section-title">Room Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Room</label>
                    <div className="detail-value">{selectedPayment.roomTitle}</div>
                  </div>
                  <div className="detail-item">
                    <label>Rental Period</label>
                    <div className="detail-value">
                      {new Date(selectedPayment.rentalStartDate).toLocaleDateString()} -{' '}
                      {new Date(selectedPayment.rentalEndDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPayment.notes && (
                <div className="detail-section">
                  <h4 className="section-title">Notes</h4>
                  <div className="notes-box">{selectedPayment.notes}</div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button variant="primary">
                <Download size={16} />
                Download Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
