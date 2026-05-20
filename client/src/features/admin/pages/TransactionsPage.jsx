import React, { useState } from 'react';
import { Search, Filter, Download, Calendar, DollarSign, CornerUpLeft, Activity } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../../../utils/format';
import './TransactionsPage.css';

// Updated Mock Data based on Figma
const MOCK_TRANSACTIONS = [
  { id: 'TRX-1092', date: '2026-05-18T10:30:00Z', tenant: 'Nguyen Van A', property: 'Room 101, Sunrise Tower', type: 'Rent Payment', amount: 5500000, status: 'Success' },
  { id: 'TRX-1091', date: '2026-05-17T15:45:00Z', tenant: 'Tran Thi B', property: 'Room 205, Ocean View', type: 'Deposit', amount: 10000000, status: 'Success' },
  { id: 'TRX-1090', date: '2026-05-17T09:15:00Z', tenant: 'Le Van C', property: 'Room 302, Sunrise Tower', type: 'Rent Payment', amount: 6000000, status: 'Pending' },
  { id: 'TRX-1089', date: '2026-05-16T14:20:00Z', tenant: 'Pham Thi D', property: 'Room 104, Green Park', type: 'Maintenance Fee', amount: 500000, status: 'Success' },
  { id: 'TRX-1088', date: '2026-05-15T08:10:00Z', tenant: 'Hoang Van E', property: 'Room 401, Ocean View', type: 'Rent Payment', amount: 7500000, status: 'Refunded' },
  { id: 'TRX-1087', date: '2026-05-14T11:00:00Z', tenant: 'Vo Thi F', property: 'Room 202, Green Park', type: 'Deposit', amount: 8000000, status: 'Success' },
  { id: 'TRX-1086', date: '2026-05-14T09:30:00Z', tenant: 'Nguyen Van A', property: 'Room 101, Sunrise Tower', type: 'Utility Bill', amount: 1200000, status: 'Pending' },
];

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesSearch = tx.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || tx.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Payment & Transaction Management</h1>
        <p className="admin-page-subtitle">Review deposits, track invoices, and manage refund statuses across all properties.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="transactions-kpi-grid">
        <StatCard
          title="Total Collected (YTD)"
          value={formatCurrency(1245000000)}
          icon={<DollarSign size={24} />}
          isCurrency={true}
        />
        <StatCard
          title="Pending Refunds"
          value="14"
          icon={<CornerUpLeft size={24} />}
          trend="down"
          trendValue="Totaling 12,600,000 ₫"
        />
        <StatCard
          title="Total Transactions"
          value={3892}
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
        <TransactionTable transactions={filteredTransactions} />

        {/* Pagination placeholder */}
        <div className="pagination-container">
          <span className="pagination-info">Showing 1 to {filteredTransactions.length} of {MOCK_TRANSACTIONS.length} entries</span>
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
