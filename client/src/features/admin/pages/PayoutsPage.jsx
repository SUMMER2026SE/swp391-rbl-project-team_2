import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, Search, CheckCircle, Clock, Percent } from 'lucide-react';
import adminService from '../../../services/adminService';
import { formatCurrency } from '../../../utils/format';
import './PayoutsPage.css';

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [commissionRate, setCommissionRate] = useState(5); // Default 5%
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPayouts();
      if (res.success) {
        setPayouts(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessing(true);
      const res = await adminService.processPayout(selectedPayout.payment_id, commissionRate);
      
      if (res.success) {
        // Update local state to reflect processed payout
        setPayouts(payouts.map(p => 
          p.payment_id === selectedPayout.payment_id 
            ? { ...p, payout_status: 'completed', platform_fee: res.data.platform_fee, net_amount: res.data.net_amount, payout_date: res.data.payout_date } 
            : p
        ));
        setSelectedPayout(null);
        toast.success('Payout processed successfully!');
      }
    } catch (error) {
      console.error('Failed to process payout:', error);
      toast.error('Failed to process payout: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  // Calculations for stats
  const totalPendingPayouts = payouts.filter(p => p.payout_status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCompletedPayouts = payouts.filter(p => p.payout_status === 'completed').reduce((sum, p) => sum + Number(p.net_amount), 0);
  const totalPlatformFees = payouts.filter(p => p.payout_status === 'completed').reduce((sum, p) => sum + Number(p.platform_fee), 0);

  const filteredPayouts = payouts.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.landlordPayment?.full_name?.toLowerCase().includes(searchLower) ||
      p.tenant?.full_name?.toLowerCase().includes(searchLower) ||
      p.room?.title?.toLowerCase().includes(searchLower) ||
      p.transaction_id?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="payout-badge success">Paid</span>;
      case 'processing': return <span className="payout-badge warning">Processing</span>;
      default: return <span className="payout-badge pending">Pending</span>;
    }
  };

  if (loading) {
    return <div className="payouts-page"><div className="loading-state">Loading payouts data...</div></div>;
  }

  return (
    <div className="payouts-page">
      {/* Page Header */}
      <div className="payouts-header">
        <div className="header-titles">
          <h1>Payouts & Settlements</h1>
          <p>Manage landlord payouts, deduct platform commissions, and settle balances.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">Export Report</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-card">
          <div className="stat-card-icon" style={{background: '#EEF2FF', color: '#4F46E5'}}>
            <Clock size={24} />
          </div>
          <div className="stat-card-info">
            <p>Pending Payouts</p>
            <h3>{formatCurrency(totalPendingPayouts)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{background: '#ECFDF5', color: '#059669'}}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-info">
            <p>Total Paid to Landlords</p>
            <h3>{formatCurrency(totalCompletedPayouts)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{background: '#FFFBEB', color: '#D97706'}}>
            <Percent size={24} />
          </div>
          <div className="stat-card-info">
            <p>Total Platform Revenue</p>
            <h3>{formatCurrency(totalPlatformFees)}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="payouts-content">
        <div className="table-controls">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by landlord, tenant, room..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-dropdowns">
            <select className="status-filter">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Paid</option>
            </select>
          </div>
        </div>

        <div className="payouts-table-container">
          <table className="payouts-table">
            <thead>
              <tr>
                <th>ID / Date</th>
                <th>Landlord</th>
                <th>Room / Tenant</th>
                <th>Total Collected</th>
                <th>Platform Fee</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.length > 0 ? filteredPayouts.map(payout => (
                <tr key={payout.payment_id}>
                  <td>
                    <div className="id-col">
                      <span className="payout-id">#{payout.payment_id}</span>
                      <span className="payout-date">{new Date(payout.paid_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-col">
                      <span className="user-name">{payout.landlordPayment?.full_name}</span>
                      <span className="user-contact">{payout.landlordPayment?.phone || payout.landlordPayment?.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="room-col">
                      <span className="room-title">{payout.room?.title}</span>
                      <span className="tenant-name">From: {payout.tenant?.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="amount-total">{formatCurrency(payout.amount)}</span>
                  </td>
                  <td>
                    <span className="amount-fee">
                      {payout.payout_status === 'completed' 
                        ? formatCurrency(payout.platform_fee) 
                        : <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Est. {formatCurrency(payout.amount * 0.05)} (5%)</span>
                      }
                    </span>
                  </td>
                  <td>
                    <span className="amount-net">
                      {payout.payout_status === 'completed' 
                        ? formatCurrency(payout.net_amount) 
                        : <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Est. {formatCurrency(payout.amount * 0.95)}</span>
                      }
                    </span>
                  </td>
                  <td>{getStatusBadge(payout.payout_status)}</td>
                  <td>
                    {payout.payout_status === 'pending' ? (
                      <button 
                        className="btn-process"
                        onClick={() => setSelectedPayout(payout)}
                      >
                        Process Payout
                      </button>
                    ) : (
                      <button className="btn-view-receipt">Receipt</button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="empty-state">No payouts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payout Modal */}
      {selectedPayout && (
        <div className="modal-overlay" onClick={() => !processing && setSelectedPayout(null)}>
          <div className="modal-content payout-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Process Landlord Payout</h3>
              <button 
                className="btn-close" 
                onClick={() => !processing && setSelectedPayout(null)}
                disabled={processing}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="payout-summary-card">
                <div className="summary-row">
                  <span>Landlord:</span>
                  <strong>{selectedPayout.landlordPayment?.full_name}</strong>
                </div>
                <div className="summary-row">
                  <span>Room:</span>
                  <strong>{selectedPayout.room?.title}</strong>
                </div>
                <div className="summary-row highlight">
                  <span>Total Collected from Tenant:</span>
                  <strong>{formatCurrency(selectedPayout.amount)}</strong>
                </div>
              </div>

              <div className="commission-input-group">
                <label>Platform Commission (%)</label>
                <div className="input-with-icon">
                  <Percent size={16} />
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    disabled={processing}
                  />
                </div>
                <p className="helper-text">This percentage will be deducted from the total amount as platform revenue.</p>
              </div>

              <div className="payout-calculation">
                <div className="calc-row text-red">
                  <span>Platform Fee (-{commissionRate}%):</span>
                  <span>-{formatCurrency((selectedPayout.amount * commissionRate) / 100)}</span>
                </div>
                <div className="calc-divider"></div>
                <div className="calc-row text-green total-payout">
                  <span>Net Amount to Pay Landlord:</span>
                  <span>{formatCurrency(selectedPayout.amount - ((selectedPayout.amount * commissionRate) / 100))}</span>
                </div>
              </div>
              
              <div className="manual-transfer-notice">
                <AlertCircle size={18} />
                <p><strong>Manual Transfer Required:</strong> Clicking 'Confirm' will only update the status in the system. You must manually transfer the Net Amount to the landlord's bank account.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setSelectedPayout(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleProcessPayout}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm & Mark as Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Temp component for missing import
const AlertCircle = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default PayoutsPage;
