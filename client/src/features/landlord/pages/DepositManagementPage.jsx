import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Search, 
  Landmark, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  CreditCard
} from 'lucide-react';
import Button from '../../../components/common/Button';
import './DepositManagementPage.css';

// Initial Mock Deposits data
const INITIAL_DEPOSITS = [
  {
    id: '#TEN-8842',
    tenantName: 'Sarah Jenkins',
    property: 'Apt 4B, The Lumina',
    amount: 1200.00,
    status: 'Pending Refund',
    date: 'Oct 24, 2024'
  },
  {
    id: '#TEN-9105',
    tenantName: 'Marcus Thorne',
    property: 'Unit 12, Riverstone Appts',
    amount: 950.00,
    status: 'Confirmed',
    date: 'Oct 22, 2024'
  },
  {
    id: '#TEN-7731',
    tenantName: 'Emily Chen',
    property: 'Studio 2, Modern Living',
    amount: 1500.00,
    status: 'Refunded',
    date: 'Oct 20, 2024'
  },
  {
    id: '#TEN-6622',
    tenantName: 'David Alaba',
    property: 'Apt 8C, The Heights',
    amount: 2100.00,
    status: 'Pending Refund',
    date: 'Oct 18, 2024'
  },
  {
    id: '#TEN-5044',
    tenantName: 'Jane Ostin',
    property: 'Suite 3A, Horizon View',
    amount: 1750.00,
    status: 'Confirmed',
    date: 'Oct 15, 2024'
  },
  {
    id: '#TEN-4112',
    tenantName: 'Leonel Messi',
    property: 'Apt 10A, Camp Nou',
    amount: 3200.00,
    status: 'Refunded',
    date: 'Oct 11, 2024'
  }
];

const DepositManagementPage = () => {
  const [deposits, setDeposits] = useState(INITIAL_DEPOSITS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Status');
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    tenantName: '',
    id: '',
    property: '',
    amount: '',
    status: 'Confirmed',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualForm(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.tenantName || !manualForm.property || !manualForm.amount) return;

    const newEntry = {
      id: manualForm.id.trim() ? `#TEN-${manualForm.id}` : `#TEN-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantName: manualForm.tenantName,
      property: manualForm.property,
      amount: parseFloat(manualForm.amount),
      status: manualForm.status,
      date: manualForm.date
    };

    setDeposits([newEntry, ...deposits]);
    setShowManualModal(false);
    setManualForm({
      tenantName: '',
      id: '',
      property: '',
      amount: '',
      status: 'Confirmed',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  // Actions
  const handleActionClick = (id, newStatus) => {
    setDeposits(prev => prev.map(dep => {
      if (dep.id === id) {
        return { ...dep, status: newStatus };
      }
      return dep;
    }));
  };

  // Filtering logic
  const filteredDeposits = deposits.filter(dep => {
    const matchesSearch = 
      dep.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = 
      activeTab === 'All Status' ||
      (activeTab === 'Pending' && dep.status === 'Pending Refund') ||
      (activeTab === 'Refunded' && dep.status === 'Refunded') ||
      (activeTab === 'Confirmed' && dep.status === 'Confirmed');

    return matchesSearch && matchesTab;
  });

  // Calculate Stat values dynamically
  const totalHeld = deposits
    .filter(d => d.status === 'Confirmed')
    .reduce((sum, d) => sum + d.amount, 137550); // baseline to match figma's $142,500

  const pendingRefundAmount = deposits
    .filter(d => d.status === 'Pending Refund')
    .reduce((sum, d) => sum + d.amount, 5150); // baseline to match figma's $8,450

  const processed30Days = deposits
    .filter(d => d.status === 'Refunded')
    .reduce((sum, d) => sum + d.amount, 8600); // baseline to match figma's $12,200

  const pendingCount = deposits.filter(d => d.status === 'Pending Refund').length + 8; // baseline to match figma's 12

  return (
    <div className="deposit-page-container" id="deposit-management-page">
      
      {/* Top Header Block */}
      <div className="deposit-header-row">
        <div>
          <h1 className="deposit-main-title">Deposit Management</h1>
          <p className="deposit-sub-title">Track, refund, and confirm tenant security deposits.</p>
        </div>
        <div className="deposit-header-actions">
          <button className="btn-export-csv" onClick={() => alert('Exporting deposit data to CSV...')}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="btn-manual-entry" onClick={() => setShowManualModal(true)}>
            <Plus size={18} />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="deposit-stats-grid">
        {/* Stat 1 */}
        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">TOTAL DEPOSITS HELD</span>
              <h2 className="deposit-stat-value">${totalHeld.toLocaleString()}</h2>
            </div>
            <div className="deposit-stat-icon-box landmark-blue">
              <Landmark size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-trend-percent-up">
              <TrendingUp size={12} />
              <span>+4.2% from last month</span>
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">PENDING REFUNDS</span>
              <h2 className="deposit-stat-value">${pendingRefundAmount.toLocaleString()}</h2>
            </div>
            <div className="deposit-stat-icon-box clock-gold">
              <Clock size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">{pendingCount} tenants awaiting action</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">PROCESSED (30 DAYS)</span>
              <h2 className="deposit-stat-value">${processed30Days.toLocaleString()}</h2>
            </div>
            <div className="deposit-stat-icon-box check-blue">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">24 transactions completed</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Tab Area */}
      <div className="deposit-table-filter-bar">
        <div className="deposit-search-box">
          <Search size={18} className="deposit-search-icon" />
          <input 
            type="text" 
            placeholder="Search by tenant name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="deposit-status-tabs-group">
          {['All Status', 'Pending', 'Refunded', 'Confirmed'].map(tab => (
            <button 
              key={tab} 
              className={`deposit-tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Pending' ? 'Pending' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="deposit-table-wrapper">
        <table className="deposit-data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tenant Details</th>
              <th>Property</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeposits.length > 0 ? (
              filteredDeposits.map((dep, index) => (
                <tr key={dep.id + index} className="deposit-table-row">
                  <td className="deposit-date-cell">
                    <span className="date-main-part">{dep.date.split(',')[0]}</span>
                    <span className="date-year-part">{dep.date.split(',')[1]?.trim() || '2024'}</span>
                  </td>
                  <td className="deposit-tenant-cell">
                    <span className="tenant-display-name">{dep.tenantName}</span>
                    <span className="tenant-id-sub">{dep.id}</span>
                  </td>
                  <td className="deposit-property-cell">{dep.property}</td>
                  <td className="deposit-amount-cell">${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="deposit-status-cell">
                    <span className={`deposit-status-pill badge-${dep.status.toLowerCase().replace(' ', '-')}`}>
                      {dep.status}
                    </span>
                  </td>
                  <td className="deposit-actions-cell">
                    {dep.status === 'Pending Refund' && (
                      <button 
                        className="btn-table-action btn-action-refund"
                        title="Process Refund"
                        onClick={() => handleActionClick(dep.id, 'Refunded')}
                      >
                        <RefreshCw size={14} />
                        <span>Refund</span>
                      </button>
                    )}
                    {dep.status === 'Confirmed' && (
                      <button 
                        className="btn-table-action btn-action-refund-trigger"
                        title="Request Refund"
                        onClick={() => handleActionClick(dep.id, 'Pending Refund')}
                      >
                        <Clock size={14} />
                        <span>Trigger Refund</span>
                      </button>
                    )}
                    {dep.status === 'Refunded' && (
                      <span className="action-completed-label">
                        <Check size={14} />
                        <span>Done</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-empty-row-state">
                  <div className="table-empty-box-icon">💼</div>
                  <h3>No deposits found</h3>
                  <p>Try resetting the filters or modifying your search query.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="deposit-table-pagination-footer">
        <span className="pagination-entries-count">
          Showing 1 to {filteredDeposits.length} of {deposits.length} entries
        </span>
        <div className="pagination-button-box">
          <button className="pagination-arrow-btn" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="pagination-num-btn active">1</button>
          <button className="pagination-num-btn">2</button>
          <button className="pagination-num-btn">3</button>
          <button className="pagination-arrow-btn">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="modal-backdrop">
          <div className="modal-content deposit-manual-modal">
            <div className="modal-header">
              <h3>Manual Deposit Entry</h3>
              <button className="modal-close-btn" onClick={() => setShowManualModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit}>
              <div className="modal-body">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Tenant Name *</label>
                    <input 
                      type="text" 
                      name="tenantName"
                      required
                      placeholder="Sarah Jenkins"
                      value={manualForm.tenantName}
                      onChange={handleManualInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tenant ID Tag (e.g. 8842)</label>
                    <input 
                      type="text" 
                      name="id"
                      placeholder="e.g. 8842"
                      value={manualForm.id}
                      onChange={handleManualInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Property Name *</label>
                  <input 
                    type="text" 
                    name="property"
                    required
                    placeholder="e.g. Apt 4B, The Lumina"
                    value={manualForm.property}
                    onChange={handleManualInputChange}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Security Deposit Amount ($) *</label>
                    <input 
                      type="number" 
                      name="amount"
                      required
                      placeholder="1200"
                      value={manualForm.amount}
                      onChange={handleManualInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Status</label>
                    <select 
                      name="status"
                      value={manualForm.status} 
                      onChange={handleManualInputChange}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending Refund">Pending Refund</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" type="button" onClick={() => setShowManualModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Record Deposit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DepositManagementPage;
