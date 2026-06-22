import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  Landmark, 
  Clock, 
  Wallet
} from 'lucide-react';
import api from '../../../services/api';
import './DepositManagementPage.css';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';

const DepositManagementPage = () => {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await api.get('/landlord/payments?paymentType=deposit&status=completed&limit=100');
        if (response.success) {
          const mappedData = response.data.map(p => {
            const originalAmount = parseFloat(p.amount) || 0;
            const platformFee = p.platformFee != null ? parseFloat(p.platformFee) : originalAmount * 0.05;
            const netAmount = p.netAmount != null ? parseFloat(p.netAmount) : originalAmount * 0.95;
            
            // Map status
            let uiStatus = p.payout_status || p.payoutStatus || 'pending';
            // Capitalize first letter
            uiStatus = uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1);

            return {
              id: p.transactionId ? `#VNP-${p.transactionId}` : `#PAY-${p.paymentId || p.payment_id}`,
              roomId: p.room_id || p.room?.room_id,
              tenantName: p.tenant?.full_name || 'Unknown Tenant',
              property: p.room?.title || 'Unknown Property',
              originalAmount,
              platformFee,
              netAmount,
              status: uiStatus,
              date: new Date(p.createdAt || p.created_at).toLocaleDateString('vi-VN')
            };
          });
          setPayouts(mappedData);
        }
      } catch (err) {
        console.error('Failed to fetch payouts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  // Filtering logic
  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = 
      p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = 
      activeTab === 'All' ||
      p.status.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const totalCollected = payouts.reduce((sum, p) => sum + p.originalAmount, 0); 
  const pendingPayouts = payouts
    .filter(p => p.status.toLowerCase() === 'pending' || p.status.toLowerCase() === 'processing')
    .reduce((sum, p) => sum + p.netAmount, 0); 
  const completedPayouts = payouts
    .filter(p => p.status.toLowerCase() === 'completed')
    .reduce((sum, p) => sum + p.netAmount, 0); 

  const pendingCount = payouts.filter(p => p.status.toLowerCase() === 'pending' || p.status.toLowerCase() === 'processing').length;

  return (
    <div className="deposit-page-container" id="deposit-management-page">
      
      {/* Top Header Block */}
      <div className="deposit-header-row">
        <div>
          <h1 className="deposit-main-title">Escrow Payouts</h1>
          <p className="deposit-sub-title">Track your 95% payouts from contract deposits (escrow). The platform transfers funds to you after the tenant signs the lease.</p>
        </div>
        <div className="deposit-header-actions">
          <button className="btn-export-csv" onClick={() => toast.success('Exporting payout data to CSV...')}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="deposit-stats-grid">
        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">CONTRACT DEPOSITS (100%)</span>
              <h2 className="deposit-stat-value">{totalCollected.toLocaleString('vi-VN')} đ</h2>
            </div>
            <div className="deposit-stat-icon-box landmark-blue">
              <Landmark size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">Total contract deposits held securely in escrow</span>
          </div>
        </div>

        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">PENDING PAYOUTS (95%)</span>
              <h2 className="deposit-stat-value">{pendingPayouts.toLocaleString('vi-VN')} đ</h2>
            </div>
            <div className="deposit-stat-icon-box clock-gold">
              <Clock size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">{pendingCount} payouts awaiting admin transfer</span>
          </div>
        </div>

        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">COMPLETED PAYOUTS</span>
              <h2 className="deposit-stat-value">{completedPayouts.toLocaleString('vi-VN')} đ</h2>
            </div>
            <div className="deposit-stat-icon-box check-blue">
              <Wallet size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">Funds successfully transferred to you</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Tab Area */}
      <div className="deposit-table-filter-bar">
        <div className="deposit-search-box">
          <Search size={18} className="deposit-search-icon" />
          <input 
            type="text" 
            placeholder="Search by tenant name, property, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="deposit-status-tabs-group">
          {['All', 'Pending', 'Processing', 'Completed'].map(tab => (
            <button 
              key={tab} 
              className={`deposit-tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
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
              <th>Tenant & ID</th>
              <th>Property</th>
              <th>Deposit Amount</th>
              <th>Platform Fee (5%)</th>
              <th>Net Payout (95%)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayouts.length > 0 ? (
              filteredPayouts.map((p, index) => (
                <tr key={p.id + index} className="deposit-table-row">
                  <td className="deposit-date-cell">
                    {p.date}
                  </td>
                  <td className="deposit-tenant-cell">
                    <span className="tenant-display-name">{p.tenantName}</span>
                    <span className="tenant-id-sub">{p.id}</span>
                  </td>
                  <td className="deposit-property-cell">
                    {p.roomId ? (
                      <span 
                        onClick={() => navigate(`${ROUTES.ROOMS}/${p.roomId}`)}
                        style={{ cursor: 'pointer', color: '#2563eb', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {p.property}
                      </span>
                    ) : (
                      p.property
                    )}
                  </td>
                  <td className="deposit-amount-cell" style={{color: '#6b7280'}}>{p.originalAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="deposit-amount-cell" style={{color: '#ef4444'}}>-{p.platformFee.toLocaleString('vi-VN')} đ</td>
                  <td className="deposit-amount-cell" style={{color: '#16a34a', fontWeight: 'bold'}}>{p.netAmount.toLocaleString('vi-VN')} đ</td>
                  <td className="deposit-status-cell">
                    <span className={`deposit-status-pill badge-${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="table-empty-row-state">
                  <div className="table-empty-box-icon">💼</div>
                  <h3>No payouts found</h3>
                  <p>Try resetting the filters or modifying your search query.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositManagementPage;
