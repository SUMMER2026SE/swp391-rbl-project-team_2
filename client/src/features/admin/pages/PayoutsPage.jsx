import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  CheckCircle, 
  Clock, 
  Percent, 
  AlertCircle,
  FileText,
  Upload,
  ArrowUpRight,
  XCircle,
  Eye,
  CheckCircle2,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../../services/adminService';
import { formatCurrency } from '../../../utils/format';
import './PayoutsPage.css';

const PayoutsPage = () => {
  const navigate = useNavigate();

  // Data states
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    totalPlatformRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalEscrowBalance: 0
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWithdrawalsAndStats();
  }, []);

  const fetchWithdrawalsAndStats = async () => {
    try {
      setLoading(true);
      // Fetch withdrawal requests
      const listRes = await adminService.getWithdrawals();
      if (listRes.success) {
        setWithdrawals(listRes.data || []);
      }

      // Fetch statistics
      const statsRes = await adminService.getFinanceStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to load withdrawals / stats:', error);
      toast.error('Không thể tải danh sách yêu cầu rút tiền.');
    } finally {
      setLoading(false);
    }
  };

  // Map VietQR bank codes
  const getBankCode = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('vietcom') || lower.includes('vcb')) return 'vcb';
    if (lower.includes('vietin') || lower.includes('icb')) return 'icb';
    if (lower.includes('techcom') || lower.includes('tcb')) return 'tcb';
    if (lower.includes('mbbank') || lower.includes('mb') || lower.includes('quan doi')) return 'mb';
    if (lower.includes('bidv')) return 'bidv';
    if (lower.includes('agri') || lower.includes('vba')) return 'vba';
    if (lower.includes('sacom') || lower.includes('stb')) return 'stb';
    if (lower.includes('vp') || lower.includes('vpb')) return 'vpb';
    if (lower.includes('acb')) return 'acb';
    if (lower.includes('tp') || lower.includes('tpb') || lower.includes('tien phong')) return 'tpb';
    if (lower.includes('shb')) return 'shb';
    if (lower.includes('vib')) return 'vib';
    if (lower.includes('hd') || lower.includes('hdb')) return 'hdb';
    if (lower.includes('exim') || lower.includes('eib')) return 'eib';
    if (lower.includes('msb') || lower.includes('hang hai')) return 'msb';
    if (lower.includes('sea') || lower.includes('seab')) return 'seab';
    if (lower.includes('lpbank') || lower.includes('lpb') || lower.includes('lien viet')) return 'lpb';
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  // Actions
  const handleProcess = async (id) => {
    try {
      setSubmitting(true);
      const res = await adminService.processWithdrawal(id);
      if (res.success) {
        toast.success('Đã duyệt yêu cầu rút tiền. Trạng thái chuyển sang Đang xử lý.');
        // Refresh local list
        setWithdrawals(prev => prev.map(w => w.withdrawal_id === id ? { ...w, status: 'processing' } : w));
        // Open modal immediately to let admin pay
        const updated = withdrawals.find(w => w.withdrawal_id === id);
        if (updated) {
          setSelectedWithdrawal({ ...updated, status: 'processing' });
          setNotes('');
          setProofUrl('');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi duyệt yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!proofUrl) {
      toast.error('Vui lòng tải lên ảnh chứng từ giao dịch (Receipt Proof) để hoàn tất.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.completeWithdrawal(selectedWithdrawal.withdrawal_id, {
        transaction_proof_url: proofUrl,
        admin_notes: notes
      });

      if (res.success) {
        toast.success('Hoàn thành yêu cầu rút tiền thành công!');
        setSelectedWithdrawal(null);
        fetchWithdrawalsAndStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!notes) {
      toast.error('Vui lòng nhập lý do từ chối vào ô Ghi chú Admin.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.rejectWithdrawal(selectedWithdrawal.withdrawal_id, {
        admin_notes: notes
      });

      if (res.success) {
        toast.success('Đã từ chối yêu cầu rút tiền.');
        setSelectedWithdrawal(null);
        fetchWithdrawalsAndStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('proof', file);

    try {
      setUploading(true);
      const res = await adminService.uploadProof(formData);
      if (res.success) {
        setProofUrl(res.url);
        toast.success('Đã tải lên ảnh chứng từ thành công!');
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh chứng từ.');
    } finally {
      setUploading(false);
    }
  };

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter(w => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      w.user?.full_name?.toLowerCase().includes(searchLower) ||
      w.user?.email?.toLowerCase().includes(searchLower) ||
      w.bank_name?.toLowerCase().includes(searchLower) ||
      w.account_number?.includes(searchLower) ||
      `#wdr-${w.withdrawal_id}`.includes(searchLower);

    const matchesStatus = statusFilter === 'all' || w.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return <span className="payout-badge success">Đã chuyển</span>;
      case 'processing': return <span className="payout-badge warning">Đang chuyển</span>;
      case 'rejected': return <span className="payout-badge danger">Từ chối</span>;
      default: return <span className="payout-badge pending">Chờ duyệt</span>;
    }
  };

  return (
    <div className="payouts-page">
      {/* Page Header */}
      <div className="payouts-header">
        <div className="header-titles">
          <h1>Quản lý Rút tiền & Thanh toán</h1>
          <p>Duyệt yêu cầu rút doanh thu từ Landlords, quét mã VietQR động để chuyển khoản và lưu minh chứng giao dịch.</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => toast.success('Đang xuất báo cáo...')}>Xuất báo cáo</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-card-info">
            <p>Tổng yêu cầu chờ duyệt</p>
            <h3>{formatCurrency(stats.totalPending)}</h3>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-info">
            <p>Tổng tiền đã chuyển khoản</p>
            <h3>{formatCurrency(stats.totalPaid)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Percent size={24} />
          </div>
          <div className="stat-card-info">
            <p>Doanh thu hoa hồng (5%)</p>
            <h3>{formatCurrency(stats.totalPlatformRevenue)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Wallet size={24} />
          </div>
          <div className="stat-card-info">
            <p>Số dư Escrow giữ hộ</p>
            <h3>{formatCurrency(stats.totalEscrowBalance)}</h3>
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
              placeholder="Tìm theo landlord, số tài khoản, mã yêu cầu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-dropdowns">
            <select 
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="processing">Đang chuyển</option>
              <option value="completed">Đã chuyển</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
            Đang tải dữ liệu yêu cầu rút tiền...
          </div>
        ) : (
          <div className="payouts-table-container">
            <table className="payouts-table">
              <thead>
                <tr>
                  <th>Yêu cầu / Ngày</th>
                  <th>Landlord (Người thụ hưởng)</th>
                  <th>Tài khoản Ngân hàng</th>
                  <th>Số tiền rút</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => (
                  <tr key={w.withdrawal_id}>
                    <td>
                      <div className="id-col">
                        <span className="payout-id" style={{ fontWeight: 'bold' }}>#WDR-{w.withdrawal_id}</span>
                        <span className="payout-date">{new Date(w.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-col">
                        <span className="user-name" style={{ fontWeight: 'bold' }}>{w.user?.full_name}</span>
                        <span className="user-contact">{w.user?.phone || w.user?.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="room-col">
                        <span className="room-title" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: '#1e293b' }}>
                          <Building size={14} /> {w.bank_name}
                        </span>
                        <span className="tenant-name">STK: <strong>{w.account_number}</strong> | Tên: {w.account_holder_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="amount-total" style={{ fontWeight: 'bold', color: '#10b981' }}>
                        {parseFloat(w.amount).toLocaleString('vi-VN')} đ
                      </span>
                    </td>
                    <td>{getStatusBadge(w.status)}</td>
                    <td>
                      {w.status.toLowerCase() === 'pending' && (
                        <button 
                          className="btn-process"
                          onClick={() => handleProcess(w.withdrawal_id)}
                          disabled={submitting}
                        >
                          Duyệt xử lý
                        </button>
                      )}
                      {w.status.toLowerCase() === 'processing' && (
                        <button 
                          className="btn-process"
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setNotes(w.admin_notes || '');
                            setProofUrl('');
                          }}
                          style={{ backgroundColor: '#2563eb' }}
                        >
                          Thanh toán
                        </button>
                      )}
                      {(w.status.toLowerCase() === 'completed' || w.status.toLowerCase() === 'rejected') && (
                        <button 
                          className="btn-view-receipt"
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setNotes(w.admin_notes || '');
                            setProofUrl(w.transaction_proof_url || '');
                          }}
                        >
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                      Không có yêu cầu rút tiền nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Detail & Payment Modal */}
      {selectedWithdrawal && (
        <div className="modal-overlay" onClick={() => !submitting && setSelectedWithdrawal(null)}>
          <div className="modal-content payout-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: selectedWithdrawal.status.toLowerCase() === 'processing' ? '760px' : '480px' }}>
            <div className="modal-header">
              <h3>
                Yêu cầu rút tiền #{selectedWithdrawal.withdrawal_id} 
                <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b', marginLeft: '8px' }}>
                  ({selectedWithdrawal.status})
                </span>
              </h3>
              <button 
                className="btn-close" 
                onClick={() => setSelectedWithdrawal(null)}
                disabled={submitting}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', flexDirection: selectedWithdrawal.status.toLowerCase() === 'processing' ? 'row' : 'column' }}>
                
                {/* Left Side: QR Code (only for processing status) */}
                {selectedWithdrawal.status.toLowerCase() === 'processing' && (
                  <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>Mã VietQR Chuyển Khoản Nhanh</h4>
                    <img 
                      src={`https://img.vietqr.io/image/${getBankCode(selectedWithdrawal.bank_name)}-${selectedWithdrawal.account_number}-compact2.png?amount=${selectedWithdrawal.amount}&addInfo=RUT%20TIEN%20WDR%20${selectedWithdrawal.withdrawal_id}&accountName=${encodeURIComponent(selectedWithdrawal.account_holder_name)}`} 
                      alt="VietQR Code" 
                      style={{ width: '220px', height: '220px', display: 'block', backgroundColor: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                    />
                    <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: '12px 0 0 0', lineHeight: '1.4' }}>
                      Quét mã QR bằng App Ngân hàng để tự động điền đúng STK, Số tiền và Nội dung.
                    </p>
                  </div>
                )}

                {/* Right Side: Bank and Landlord details */}
                <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="payout-summary-card" style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                      <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.account_holder_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                      <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.bank_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                      <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.account_number}</strong>
                    </div>
                    {selectedWithdrawal.branch && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>Chi nhánh:</span>
                        <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.branch}</strong>
                      </div>
                    )}
                    <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Số tiền yêu cầu rút:</span>
                      <strong style={{ color: '#10b981', fontSize: '18px' }}>
                        {parseFloat(selectedWithdrawal.amount).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>

                  {selectedWithdrawal.status.toLowerCase() === 'processing' && (
                    <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                          Ảnh chứng từ chuyển tiền (Receipt Proof)
                        </label>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#eff6ff', color: '#2563eb', border: '1px dashed #bfdbfe', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                            <Upload size={16} /> Tải ảnh lên
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleProofUpload}
                              disabled={uploading}
                              style={{ display: 'none' }}
                            />
                          </label>
                          
                          {uploading && <span style={{ fontSize: '13px', color: '#64748b' }}>Đang upload...</span>}
                          
                          {proofUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                              <CheckCircle2 size={16} /> Đã chọn ảnh
                            </div>
                          )}
                        </div>
                        {proofUrl && (
                          <img 
                            src={proofUrl} 
                            alt="Receipt Preview" 
                            style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '8px' }}
                          />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Ghi chú Admin (nếu có)</label>
                        <textarea 
                          rows="3"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Nhập ghi chú cho Landlord về giao dịch này..."
                          disabled={submitting}
                          style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
                        />
                      </div>

                      <div className="modal-footer" style={{ borderTop: 'none', padding: '10px 0 0 0', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: 'none' }}>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={handleReject}
                          disabled={submitting}
                          style={{ padding: '10px 16px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Từ chối
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary" 
                          disabled={submitting || uploading}
                          style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {submitting ? 'Đang hoàn tất...' : 'Hoàn thành & Báo đã chuyển'} <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* If already completed or rejected: show details */}
                  {(selectedWithdrawal.status.toLowerCase() === 'completed' || selectedWithdrawal.status.toLowerCase() === 'rejected') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
                      {selectedWithdrawal.status.toLowerCase() === 'completed' && selectedWithdrawal.transaction_proof_url && (
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Ảnh chứng từ giao dịch:</div>
                          <a 
                            href={selectedWithdrawal.transaction_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <img 
                              src={selectedWithdrawal.transaction_proof_url} 
                              alt="Receipt Proof" 
                              style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                            />
                          </a>
                        </div>
                      )}
                      
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Ghi chú của Admin:</div>
                        <p style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', margin: 0 }}>
                          {selectedWithdrawal.admin_notes || 'Không có ghi chú.'}
                        </p>
                      </div>

                      <div className="modal-footer" style={{ borderTop: 'none', padding: '10px 0 0 0', display: 'flex', justifyContent: 'flex-end', background: 'none' }}>
                        <button 
                          className="btn-primary" 
                          onClick={() => setSelectedWithdrawal(null)}
                          style={{ width: '100%', padding: '12px', background: '#0f172a', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                        >
                          Đóng chi tiết
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;
