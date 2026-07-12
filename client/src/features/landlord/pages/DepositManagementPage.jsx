import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Search, 
  Landmark, 
  Clock, 
  Wallet,
  PlusCircle,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Building,
  TrendingUp
} from 'lucide-react';
import api from '../../../services/api';
import { landlordService } from '../services/landlordService';
import './DepositManagementPage.css';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';

const DepositManagementPage = () => {
  const navigate = useNavigate();
  
  // Data states
  const [payouts, setPayouts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedWithdrawals: 0,
    pendingWithdrawals: 0,
    availableBalance: 0
  });
  const [bankDetails, setBankDetails] = useState(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('deposits'); // 'deposits' | 'withdrawals'
  const [depositFilter, setDepositFilter] = useState('All'); // 'All' | 'Pending' | 'Processing' | 'Completed'
  const [withdrawalFilter, setWithdrawalFilter] = useState('All'); // 'All' | 'pending' | 'processing' | 'completed' | 'rejected'

  // Modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch completed lease deposit payments
      const payoutsRes = await api.get('/landlord/payments?paymentType=deposit&status=completed&limit=100');
      if (payoutsRes.success) {
        const mappedData = payoutsRes.data.map(p => {
          const originalAmount = parseFloat(p.amount) || 0;
          const platformFee = p.platformFee != null ? parseFloat(p.platformFee) : originalAmount * 0.05;
          const netAmount = p.netAmount != null ? parseFloat(p.netAmount) : originalAmount * 0.95;
          
          let uiStatus = p.payout_status || p.payoutStatus || 'pending';
          uiStatus = uiStatus.charAt(0).toUpperCase() + uiStatus.slice(1);

          return {
            id: p.transactionId ? `#TRX-${p.transactionId}` : `#PAY-${p.paymentId || p.payment_id}`,
            paymentId: p.paymentId || p.payment_id,
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

      // 2. Fetch withdrawals history & balance stats
      const withdrawalsRes = await landlordService.getWithdrawals();
      if (withdrawalsRes.success) {
        setWithdrawals(withdrawalsRes.data || []);
        if (withdrawalsRes.stats) {
          setStats(withdrawalsRes.stats);
        }
      }

      // 3. Fetch bank details config
      const bankDetailsRes = await landlordService.getBankDetails();
      if (bankDetailsRes.success) {
        setBankDetails(bankDetailsRes.data);
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Failed to load wallet dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered lease deposits
  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = 
      p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.property.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = 
      depositFilter === 'All' ||
      p.status.toLowerCase() === depositFilter.toLowerCase();

    return matchesSearch && matchesTab;
  });

  // Filtered withdrawal requests
  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = 
      w.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.account_number.includes(searchTerm) ||
      `#WDR-${w.withdrawal_id}`.includes(searchTerm);

    const matchesTab = 
      withdrawalFilter === 'All' ||
      w.status.toLowerCase() === withdrawalFilter.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Vui lòng nhập số tiền rút hợp lệ.');
      return;
    }

    if (amountNum > stats.availableBalance) {
      toast.error('Số tiền rút vượt quá số dư khả dụng.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await landlordService.createWithdrawal(amountNum);
      if (res.success) {
        toast.success('Rút tiền thành công! Tiền đã được chuyển vào tài khoản ngân hàng của bạn.');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        // Refresh data
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi rút tiền.');
    } finally {
      setSubmitting(false);
    }
  };

  const getWithdrawalStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return <span className="deposit-status-pill badge-completed">Thành công</span>;
      case 'processing':
        return <span className="deposit-status-pill badge-processing">Đang chuyển</span>;
      case 'rejected':
        return <span className="deposit-status-pill badge-failed">Từ chối</span>;
      default:
        return <span className="deposit-status-pill badge-pending">Chờ duyệt</span>;
    }
  };

  return (
    <div className="deposit-page-container" id="deposit-management-page">
      
      {/* Top Header Block */}
      <div className="deposit-header-row">
        <div>
          <h1 className="deposit-main-title">Ví doanh thu & Payouts</h1>
          <p className="deposit-sub-title">Quản lý doanh thu cọc giữ hộ (escrow) và gửi yêu cầu rút tiền về tài khoản ngân hàng thực tế của bạn.</p>
        </div>
        <div className="deposit-header-actions">
          <button className="btn-withdraw-action" onClick={() => setShowWithdrawModal(true)}>
            <PlusCircle size={16} />
            <span>Rút tiền về</span>
          </button>
          <button className="btn-export-csv" onClick={() => toast.success('Đang xuất báo cáo dữ liệu dạng CSV...')}>
            <Download size={16} />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="deposit-stats-grid">
        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">SỐ DƯ KHẢ DỤNG (95%)</span>
              <h2 className="deposit-stat-value" style={{ color: '#10b981' }}>{stats.availableBalance.toLocaleString('vi-VN')} đ</h2>
            </div>
            <div className="deposit-stat-icon-box check-blue" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">Doanh thu ròng bạn có thể rút ngay lập tức</span>
          </div>
        </div>

        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">TỔNG THU NHẬP (95%)</span>
              <h2 className="deposit-stat-value" style={{ color: '#d97706' }}>{stats.totalRevenue.toLocaleString('vi-VN')} đ</h2>
            </div>
            <div className="deposit-stat-icon-box clock-gold" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">Tổng doanh thu ròng tích lũy trên hệ thống</span>
          </div>
        </div>

        <div className="deposit-stat-card">
          <div className="stat-card-main-row">
            <div>
              <span className="deposit-stat-label">ĐÃ RÚT THÀNH CÔNG</span>
              <h2 className="deposit-stat-value" style={{ color: '#3b82f6' }}>{stats.completedWithdrawals.toLocaleString('vi-VN')} đ</h2>
            </div>
            <div className="deposit-stat-icon-box landmark-blue" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <Landmark size={20} />
            </div>
          </div>
          <div className="deposit-stat-footer">
            <span className="stat-normal-desc">Doanh thu đã được chuyển khoản thật về ngân hàng</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="wallet-navigation-tabs">
        <button 
          className={`wallet-nav-item ${activeTab === 'deposits' ? 'active' : ''}`}
          onClick={() => { setActiveTab('deposits'); setSearchTerm(''); }}
        >
          Doanh thu đặt cọc
        </button>
        <button 
          className={`wallet-nav-item ${activeTab === 'withdrawals' ? 'active' : ''}`}
          onClick={() => { setActiveTab('withdrawals'); setSearchTerm(''); }}
        >
          Lịch sử rút tiền
        </button>
      </div>

      {/* Search & Filter Tab Area */}
      <div className="deposit-table-filter-bar">
        <div className="deposit-search-box">
          <Search size={18} className="deposit-search-icon" />
          <input 
            type="text" 
            placeholder={activeTab === 'deposits' ? "Tìm theo tên khách, phòng, hoặc mã hóa đơn..." : "Tìm theo ngân hàng, số tài khoản, mã yêu cầu..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        {activeTab === 'deposits' ? (
          <div className="deposit-status-tabs-group">
            {['All', 'Pending', 'Processing', 'Completed'].map(tab => (
              <button 
                key={tab} 
                className={`deposit-tab-item ${depositFilter === tab ? 'active' : ''}`}
                onClick={() => setDepositFilter(tab)}
              >
                {tab === 'All' ? 'Tất cả' : tab}
              </button>
            ))}
          </div>
        ) : (
          <div className="deposit-status-tabs-group">
            {['All', 'pending', 'processing', 'completed', 'rejected'].map(tab => (
              <button 
                key={tab} 
                className={`deposit-tab-item ${withdrawalFilter === tab ? 'active' : ''}`}
                onClick={() => setWithdrawalFilter(tab)}
                style={{ textTransform: 'capitalize' }}
              >
                {tab === 'All' ? 'Tất cả' : (tab === 'pending' ? 'Chờ duyệt' : (tab === 'processing' ? 'Đang chuyển' : (tab === 'completed' ? 'Thành công' : 'Từ chối')))}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data Tables */}
      {loading ? (
        <div className="table-loading-spinner" style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          Đang tải dữ liệu...
        </div>
      ) : activeTab === 'deposits' ? (
        /* Lease Deposits Table */
        <div className="deposit-table-wrapper">
          <table className="deposit-data-table">
            <thead>
              <tr>
                <th>Ngày nhận</th>
                <th>Người thuê & Mã GD</th>
                <th>Phòng trọ</th>
                <th>Tổng cọc (100%)</th>
                <th>Phí Admin (5%)</th>
                <th>Thu về (95%)</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((p, index) => (
                  <tr key={p.id + index} className="deposit-table-row">
                    <td className="deposit-date-cell">{p.date}</td>
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
                        {p.status === 'Completed' ? 'Đã thanh toán' : (p.status === 'Processing' ? 'Đang chuyển' : 'Chờ xử lý')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="table-empty-row-state">
                    <div className="table-empty-box-icon">💼</div>
                    <h3>Không tìm thấy giao dịch nào</h3>
                    <p>Hãy thử thay đổi bộ lọc tìm kiếm.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Withdrawals History Table */
        <div className="deposit-table-wrapper">
          <table className="deposit-data-table">
            <thead>
              <tr>
                <th>Mã yêu cầu / Ngày</th>
                <th>Thông tin tài khoản ngân hàng thụ hưởng</th>
                <th>Số tiền rút</th>
                <th>Trạng thái</th>
                <th>Minh chứng</th>
                <th>Ghi chú Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map(w => (
                  <tr key={w.withdrawal_id} className="deposit-table-row">
                    <td className="deposit-date-cell">
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>#WDR-{w.withdrawal_id}</span>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                        {new Date(w.created_at).toLocaleString('vi-VN')}
                      </span>
                    </td>
                    <td className="deposit-tenant-cell">
                      <span className="tenant-display-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={14} color="#64748b" /> {w.bank_name}
                      </span>
                      <span className="tenant-id-sub">
                        STK: <strong>{w.account_number}</strong> | Tên: {w.account_holder_name}
                      </span>
                    </td>
                    <td className="deposit-amount-cell" style={{ color: '#1e293b', fontWeight: 'bold' }}>
                      {parseFloat(w.amount).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="deposit-status-cell">
                      {getWithdrawalStatusBadge(w.status)}
                    </td>
                    <td className="deposit-property-cell">
                      {w.transaction_proof_url ? (
                        <a 
                          href={w.transaction_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '13px' }}
                        >
                          Xem chứng từ
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '13px' }}>Chưa có</span>
                      )}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.admin_notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="table-empty-row-state">
                    <div className="table-empty-box-icon">💸</div>
                    <h3>Không tìm thấy yêu cầu rút tiền nào</h3>
                    <p>Hãy gửi yêu cầu đầu tiên của bạn bằng nút phía trên.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Rút tiền về tài khoản ngân hàng</h3>
              <button 
                className="btn-close" 
                onClick={() => setShowWithdrawModal(false)}
                disabled={submitting}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>
            
            {!bankDetails ? (
              /* No Bank Details Configured UI */
              <div className="modal-body" style={{ padding: '20px', textAlign: 'center' }}>
                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Chưa thiết lập ngân hàng thụ hưởng
                </h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                  Bạn phải cấu hình thông tin tài khoản ngân hàng nhận tiền trong phần cài đặt Cá nhân trước khi có thể thực hiện rút tiền.
                </p>
                <button 
                  className="btn-primary-withdraw"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    navigate(ROUTES.LANDLORD.PROFILE);
                  }}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: '#4f46e5', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Thiết lập tài khoản ngân hàng ngay
                </button>
              </div>
            ) : (
              /* Withdraw Form UI */
              <form onSubmit={handleWithdrawSubmit}>
                <div className="modal-body" style={{ padding: '20px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Số dư khả dụng hiện tại:</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                      {stats.availableBalance.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} /> Ngân hàng thụ hưởng:
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
                      Ngân hàng: <strong>{bankDetails.bank_name}</strong>
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '4px' }}>
                      Số tài khoản: <strong>{bankDetails.account_number}</strong>
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e293b' }}>
                      Tên chủ tài khoản: <strong>{bankDetails.account_holder_name}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '8px' }}>
                      *Nếu muốn đổi ngân hàng nhận, hãy chỉnh sửa trong trang Profile cá nhân.
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                      Số tiền rút (VND)
                    </label>
                    <input 
                      type="number"
                      placeholder="Ví dụ: 500000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      min="1"
                      max={stats.availableBalance}
                      disabled={submitting}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Tối thiểu 1 đ</span>
                      <button 
                        type="button" 
                        onClick={() => setWithdrawAmount(stats.availableBalance.toString())}
                        style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                      >
                        Rút toàn bộ
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowWithdrawModal(false)}
                    disabled={submitting}
                    style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={submitting || !withdrawAmount}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {submitting ? 'Đang rút...' : 'Rút tiền ngay'} <ArrowUpRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositManagementPage;
