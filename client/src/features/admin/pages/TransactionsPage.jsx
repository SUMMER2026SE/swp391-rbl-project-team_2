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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const matchesStatus = filterStatus === 'All' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = transactions
    .filter(tx => tx.status.toLowerCase() === 'success')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Payment & Transaction Management</h1>
        <p className="admin-page-subtitle">Review deposits, track invoices, and manage refund statuses across all properties.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="transactions-kpi-grid">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          icon={<DollarSign size={24} />}
          isCurrency={true}
        />
        <StatCard
          title="Pending Refunds"
          value={transactions.filter(tx => tx.status.toLowerCase() === 'refunded').length}
          icon={<CornerUpLeft size={24} />}
          trend="down"
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
            <button className="btn-filter-date">
              <Calendar size={18} />
              <span>Date Range</span>
            </button>

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

            <button className="btn-export">
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state">Loading transactions...</div>
        ) : (
          <TransactionTable transactions={filteredTransactions} />
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
    </div>
  );
};

export default TransactionsPage;
