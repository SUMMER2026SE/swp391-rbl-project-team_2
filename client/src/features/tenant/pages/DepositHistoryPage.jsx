import toast from 'react-hot-toast';
import React from 'react';
import { BedDouble, CheckCircle2, AlertCircle, Clock3, RotateCw, FileText, X } from 'lucide-react';
import './DepositHistoryPage.css';
import './PaymentReturnPage.css';

import api from '../../../services/api';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Success':
      return (
        <span className="status-badge status-success">
          <CheckCircle2 size={14} />
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </span>
      );
    case 'completed':
      return (
        <span className="status-badge status-success">
          <CheckCircle2 size={14} />
          <span>Completed</span>
        </span>
      );
    case 'pending':
      return (
        <span className="status-badge status-pending">
          <Clock3 size={14} />
          <span>Pending</span>
        </span>
      );
    case 'failed':
      return (
        <span className="status-badge status-failed">
          <AlertCircle size={14} />
          <span>Failed</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="status-badge status-failed">
          <AlertCircle size={14} />
          <span>Cancelled</span>
        </span>
      );
    case 'refunded':
      return (
        <span className="status-badge status-pending" style={{ color: '#059669', backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }}>
          <RotateCw size={14} />
          <span>Refunded</span>
        </span>
      );
    default:
      return null;
  }
};

const getInvoiceAction = (payment, onViewInvoice) => {
  const status = payment.status?.toLowerCase();
  if (status === 'completed' || status === 'success') {
    return (
      <button 
        className="action-btn action-download" 
        onClick={() => onViewInvoice(payment)}
        style={{ color: '#0ea5e9', backgroundColor: '#e0f2fe', borderColor: '#bae6fd', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <FileText size={16} />
        <span>View Invoice</span>
      </button>
    );
  }
  return <span className="action-text-muted">Not available</span>;
};

const DepositHistoryPage = () => {
  const [payments, setPayments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState(null);

  React.useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenant/payments');
      if (res.success) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (payment) => {
    setSelectedInvoice(payment);
    setInvoiceModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  return (
    <div className="deposit-history-page">
      <div className="container">
        
        <div className="page-header">
          <h1>Deposit History</h1>
          <p>Review your past payments, deposits, and transaction statuses.</p>
        </div>

        <div className="table-container">
          <table className="deposit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Room Name</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="align-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td className="col-date">{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td className="col-room">
                    <div className="room-info">
                      <BedDouble size={16} className="text-primary" />
                      <span>{payment.room?.title || 'Unknown Room'}</span>
                    </div>
                  </td>
                  <td className="col-amount">
                    {parseFloat(payment.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}VNĐ
                  </td>
                  <td className="col-status">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="col-invoice align-right">
                    {getInvoiceAction(payment, handleViewInvoice)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">No deposits found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {invoiceModalOpen && selectedInvoice && (
        <div 
          onClick={() => setInvoiceModalOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', padding: '0', width: '90%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}
          >
            <div className="premium-invoice" style={{ margin: 0, width: '100%', maxWidth: 'none', border: 'none', boxShadow: 'none', borderRadius: '16px 16px 0 0' }}>
              <div className="invoice-header">
                <div className="text-sm font-medium text-blue-100 uppercase tracking-wider" style={{fontSize: '0.875rem', color: '#dbeafe'}}>Payment Receipt</div>
                <div className="invoice-amount" style={{fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: 'white'}}>
                  {parseFloat(selectedInvoice.amount).toLocaleString('vi-VN')}<span style={{fontSize: '1rem', fontWeight: 500, opacity: 0.8, marginLeft: '4px'}}>VND</span>
                </div>
                <div className="text-xs text-blue-200 mt-1" style={{fontSize: '0.75rem', color: '#bfdbfe', marginTop: '4px'}}>{new Date(selectedInvoice.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</div>
              </div>
              
              <div className="invoice-body">
                <div className="invoice-divider"></div>
                
                <div className="invoice-row mt-4">
                  <span className="invoice-label">Transaction ID</span>
                  <span className="invoice-value text-blue-600 font-mono">{selectedInvoice.transaction_id || selectedInvoice.payment_id}</span>
                </div>
                
                <div className="invoice-row">
                  <span className="invoice-label">Payment Type</span>
                  <span className="invoice-pill capitalize">{selectedInvoice.payment_type?.replace('_', ' ') || 'Deposit'}</span>
                </div>
                
                <div className="invoice-section">
                  <div className="invoice-section-title">Room Details</div>
                  <div className="text-gray-900 font-semibold text-base mb-1" style={{color: '#111827', fontWeight: 600, fontSize: '1rem', marginBottom: '4px'}}>{selectedInvoice.room?.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed" style={{color: '#6b7280', fontSize: '0.75rem'}}>
                    {[selectedInvoice.room?.address, selectedInvoice.room?.ward, selectedInvoice.room?.district, selectedInvoice.room?.city].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 24px 24px 24px', background: '#fff' }}>
              <button 
                onClick={() => setInvoiceModalOpen(false)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '16px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositHistoryPage;
