import React, { useState } from 'react';
import { 
  Download, Plus, Search, Filter, Calendar, 
  MoreVertical, DollarSign, Clock, RefreshCcw 
} from 'lucide-react';
import './DepositManagementPage.css';

const mockKPIs = [
  {
    id: 'total-collected',
    title: 'Total Collected',
    value: '$142,500.00',
    subtitle: 'Currently held securely',
    subtitleColor: '#10B981', // green
    icon: <DollarSign size={24} color="#0054B5" />,
    bgColor: '#EFF6FF'
  },
  {
    id: 'pending-deposits',
    title: 'Pending Deposits',
    value: '$8,200.00',
    subtitle: 'Across 6 properties',
    subtitleColor: '#64748B', // slate
    icon: <Clock size={24} color="#F59E0B" />,
    bgColor: '#FEF3C7'
  },
  {
    id: 'refunded-ytd',
    title: 'Refunded (YTD)',
    value: '$34,150.00',
    subtitle: '24 completed transactions',
    subtitleColor: '#64748B',
    icon: <RefreshCcw size={24} color="#64748B" />,
    bgColor: '#F1F5F9'
  }
];

const mockTransactions = [
  {
    id: 'TX-1001',
    date: 'Oct 24, 2024',
    tenantInitial: 'JS',
    tenantName: 'Jessica Smith',
    property: 'Oakwood Res. / Apt 4B',
    amount: '$1,200.00',
    status: 'Received'
  },
  {
    id: 'TX-1002',
    date: 'Oct 23, 2024',
    tenantInitial: 'MD',
    tenantName: 'Marcus Davis',
    property: 'Pine Studios / Unit 12',
    amount: '$850.00',
    status: 'Pending'
  },
  {
    id: 'TX-1003',
    date: 'Oct 20, 2024',
    tenantInitial: 'EL',
    tenantName: 'Elena Lopez',
    property: 'Maple Lofts / Room 3',
    amount: '$1,500.00',
    status: 'Refunded'
  },
  {
    id: 'TX-1004',
    date: 'Oct 18, 2024',
    tenantInitial: 'RJ',
    tenantName: 'Robert Johnson',
    property: 'Oakwood Res. / Apt 2A',
    amount: '$1,200.00',
    status: 'Received'
  }
];

const getStatusStyles = (status) => {
  switch (status) {
    case 'Received':
      return { bg: '#D1FAE5', text: '#065F46' };
    case 'Pending':
      return { bg: '#FEF3C7', text: '#92400E' };
    case 'Refunded':
      return { bg: '#F1F5F9', text: '#475569' };
    default:
      return { bg: '#F1F5F9', text: '#475569' };
  }
};

const getAvatarColor = (initials) => {
  const colors = ['#8AACFE', '#FCD34D', '#FCA5A5', '#A7F3D0', '#C4B5FD'];
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
};

const DepositManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="deposit-page">
      <div className="deposit-header">
        <div className="header-info">
          <h1 className="page-title">Deposit Management</h1>
          <p className="page-subtitle">Track and manage tenant security deposits across all properties.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button className="btn-primary">
            <Plus size={18} />
            <span>New Record</span>
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {mockKPIs.map((kpi) => (
          <div className="kpi-card" key={kpi.id}>
            <div className="kpi-icon-wrapper" style={{ backgroundColor: kpi.bgColor }}>
              {kpi.icon}
            </div>
            <div className="kpi-content">
              <span className="kpi-title">{kpi.title}</span>
              <h3 className="kpi-value">{kpi.value}</h3>
              <p className="kpi-subtitle" style={{ color: kpi.subtitleColor }}>
                {kpi.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="transactions-section">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by tenant, room, or amount..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-actions">
            <button className="btn-filter">
              <Filter size={16} />
              <span>Filter Status</span>
            </button>
            <button className="btn-filter">
              <Calendar size={16} />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tenant Name</th>
                <th>Property / Room</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-muted">{tx.date}</td>
                  <td>
                    <div className="tenant-info">
                      <div 
                        className="tenant-avatar"
                        style={{ backgroundColor: getAvatarColor(tx.tenantInitial) }}
                      >
                        {tx.tenantInitial}
                      </div>
                      <span className="tenant-name">{tx.tenantName}</span>
                    </div>
                  </td>
                  <td className="text-muted">{tx.property}</td>
                  <td className="font-semibold">{tx.amount}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusStyles(tx.status).bg,
                        color: getStatusStyles(tx.status).text
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepositManagementPage;
