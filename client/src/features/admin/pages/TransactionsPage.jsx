import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, DollarSign, CornerUpLeft, Activity } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import StatCard from '../components/StatCard';
import adminService from '../../../services/adminService';
import { formatCurrency } from '../../../utils/format';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllTransactions();
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter logic
    const txStatus = tx.status.toLowerCase();
    const matchesStatus = filterStatus === 'All' || 
      txStatus === filterStatus.toLowerCase() || 
      (filterStatus === 'Success' && txStatus === 'completed');

    // Date filter logic
    let matchesDate = true;
    if (startDate || endDate) {
      const txDate = new Date(tx.date);
      // Reset time for accurate day comparison
      txDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (txDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (txDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalCollected = transactions
    .filter(tx => tx.status.toLowerCase() === 'success' || tx.status.toLowerCase() === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Payment & Transaction Management</h1>
        <p className="admin-page-subtitle">Review deposits, track invoices, and manage refund statuses across all properties.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="transactions-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          icon={<DollarSign size={24} />}
          isCurrency={true}
        />
        <StatCard
          title="Total Transactions"
          value={transactions.length}
          icon={<Activity size={24} />}
        />
      </div>

      <div className="transactions-content-area">
        {/* Toolbar */}
        <div className="transactions-toolbar">
          <div className="toolbar-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID or Tenant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}
              />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#64748b' }}
              />
            </div>

            <div className="filter-dropdown">
              <Filter size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            </div>

        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">Loading transactions...</div>
        ) : (
          <TransactionTable 
            transactions={filteredTransactions} 
            onViewInvoice={(tx) => setSelectedTx(tx)}
          />
        )}

        {/* Pagination */}
        <div className="pagination-container">
          <span className="pagination-info">Showing {filteredTransactions.length} of {transactions.length} entries</span>
          <div className="pagination-controls">
            <button className="btn-page" disabled>Previous</button>
            <button className="btn-page active">1</button>
            <button className="btn-page">Next</button>
          </div>
        </div>
      </div>

      {selectedTx && (
        <div className="modal-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Invoice {selectedTx.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedTx(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '32px', color: '#16a34a', margin: '10px 0' }}>{formatCurrency(selectedTx.amount)}</h1>
                <span className={`status-badge status-${selectedTx.status.toLowerCase()}`}>{selectedTx.status}</span>
              </div>
              <div style={{ display: 'grid', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Date</span>
                  <span style={{ fontWeight: '500' }}>{new Date(selectedTx.date).toLocaleString('vi-VN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Tenant</span>
                  <span style={{ fontWeight: '500' }}>{selectedTx.tenant}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Property</span>
                  <span style={{ fontWeight: '500', textAlign: 'right', maxWidth: '200px' }}>{selectedTx.property}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Type</span>
                  <span style={{ fontWeight: '500' }}>{selectedTx.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Platform Fee (5%)</span>
                  <span style={{ fontWeight: '600', color: '#16a34a' }}>{formatCurrency(selectedTx.amount * 0.05)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
