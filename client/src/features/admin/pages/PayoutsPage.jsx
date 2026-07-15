import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
      toast.error(t('adminPayouts.toastLoadFail'));
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
        toast.success(t('adminPayouts.toastProcessSuccess'));
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
      toast.error(err.response?.data?.message || t('adminPayouts.toastGenericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!proofUrl) {
      toast.error(t('adminPayouts.toastCompleteError'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.completeWithdrawal(selectedWithdrawal.withdrawal_id, {
        transaction_proof_url: proofUrl,
        admin_notes: notes
      });

      if (res.success) {
        toast.success(t('adminPayouts.toastCompleteSuccess'));
        setSelectedWithdrawal(null);
        fetchWithdrawalsAndStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('adminPayouts.toastGenericError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!notes) {
      toast.error(t('adminPayouts.toastRejectError'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminService.rejectWithdrawal(selectedWithdrawal.withdrawal_id, {
        admin_notes: notes
      });

      if (res.success) {
        toast.success(t('adminPayouts.toastRejectSuccess'));
        setSelectedWithdrawal(null);
        fetchWithdrawalsAndStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('adminPayouts.toastGenericError'));
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
        toast.success(t('adminPayouts.toastUploadSuccess'));
      }
    } catch (err) {
      toast.error(t('adminPayouts.toastUploadFail'));
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    if (filteredWithdrawals.length === 0) {
      toast.error(t('adminPayouts.noDataToExport'));
      return;
    }

    const headers = [
      t('adminPayouts.tableReqDate'),
      t('adminPayouts.tableLandlord'),
      t('adminPayouts.accountHolder'),
      t('adminPayouts.bank'),
      t('adminPayouts.accountNumber'),
      t('adminPayouts.tableAmount'),
      t('adminPayouts.tableStatus'),
      t('adminPayouts.adminNotes')
    ];

    const rows = filteredWithdrawals.map(w => [
      `WDR-${w.withdrawal_id} (${new Date(w.created_at).toLocaleDateString('vi-VN')})`,
      w.user?.full_name || '',
      w.account_holder_name || '',
      w.bank_name || '',
      `'${w.account_number || ''}`,
      parseFloat(w.amount),
      t(`adminPayouts.status${w.status.charAt(0).toUpperCase() + w.status.slice(1).toLowerCase()}`, w.status),
      w.admin_notes || ''
    ]);

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payout_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t('adminPayouts.exportSuccess'));
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
      case 'completed': return <span className="payout-badge success">{t('adminPayouts.statusCompleted')}</span>;
      case 'processing': return <span className="payout-badge warning">{t('adminPayouts.statusProcessing')}</span>;
      case 'rejected': return <span className="payout-badge danger">{t('adminPayouts.statusRejected')}</span>;
      default: return <span className="payout-badge pending">{t('adminPayouts.statusPending')}</span>;
    }
  };

  return (
    <div className="payouts-page">
      {/* Page Header */}
      <div className="payouts-header">
        <div className="header-titles">
          <h1>{t('adminPayouts.title')}</h1>
          <p>{t('adminPayouts.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>{t('adminPayouts.export')}</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-card-info">
            <p>{t('adminPayouts.totalPending')}</p>
            <h3>{formatCurrency(stats.totalPending)}</h3>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-info">
            <p>{t('adminPayouts.totalPaid')}</p>
            <h3>{formatCurrency(stats.totalPaid)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <Percent size={24} />
          </div>
          <div className="stat-card-info">
            <p>{t('adminPayouts.platformRevenue')}</p>
            <h3>{formatCurrency(stats.totalPlatformRevenue)}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Wallet size={24} />
          </div>
          <div className="stat-card-info">
            <p>{t('adminPayouts.escrowBalance')}</p>
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
              placeholder={t('adminPayouts.searchPlaceholder')}
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
              <option value="all">{t('adminPayouts.allStatus')}</option>
              <option value="pending">{t('adminPayouts.statusPending')}</option>
              <option value="processing">{t('adminPayouts.statusProcessing')}</option>
              <option value="completed">{t('adminPayouts.statusCompleted')}</option>
              <option value="rejected">{t('adminPayouts.statusRejected')}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
            {t('adminPayouts.loading')}
          </div>
        ) : (
          <div className="payouts-table-container">
            <table className="payouts-table">
              <thead>
                <tr>
                  <th>{t('adminPayouts.tableReqDate')}</th>
                  <th>{t('adminPayouts.tableLandlord')}</th>
                  <th>{t('adminPayouts.tableBankAccount')}</th>
                  <th>{t('adminPayouts.tableAmount')}</th>
                  <th>{t('adminPayouts.tableStatus')}</th>
                  <th>{t('adminPayouts.tableActions')}</th>
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
                          {t('adminPayouts.actionProcess')}
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
                          {t('adminPayouts.actionPay')}
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
                          {t('adminPayouts.actionView')}
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                      {t('adminPayouts.emptyState')}
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
                {t('adminPayouts.reqTitle', { id: selectedWithdrawal.withdrawal_id })}
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
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569' }}>{t('adminPayouts.qrTitle')}</h4>
                    <img 
                      src={`https://img.vietqr.io/image/${getBankCode(selectedWithdrawal.bank_name)}-${selectedWithdrawal.account_number}-compact2.png?amount=${selectedWithdrawal.amount}&addInfo=RUT%20TIEN%20WDR%20${selectedWithdrawal.withdrawal_id}&accountName=${encodeURIComponent(selectedWithdrawal.account_holder_name)}`} 
                      alt="VietQR Code" 
                      style={{ width: '220px', height: '220px', display: 'block', backgroundColor: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                    />
                    <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: '12px 0 0 0', lineHeight: '1.4' }}>
                      {t('adminPayouts.qrDesc')}
                    </p>
                  </div>
                )}

                {/* Right Side: Bank and Landlord details */}
                <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="payout-summary-card" style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>{t('adminPayouts.accountHolder')}</span>
                      <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.account_holder_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>{t('adminPayouts.bank')}</span>
                      <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.bank_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>{t('adminPayouts.accountNumber')}</span>
                      <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.account_number}</strong>
                    </div>
                    {selectedWithdrawal.branch && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#64748b' }}>{t('adminPayouts.branch')}</span>
                        <strong style={{ color: '#1e293b' }}>{selectedWithdrawal.branch}</strong>
                      </div>
                    )}
                    <div style={{ borderTop: '1px dashed #cbd5e1', margin: '8px 0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>{t('adminPayouts.requestedAmount')}</span>
                      <strong style={{ color: '#10b981', fontSize: '18px' }}>
                        {parseFloat(selectedWithdrawal.amount).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>

                  {selectedWithdrawal.status.toLowerCase() === 'processing' && (
                    <form onSubmit={handleComplete} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                          {t('adminPayouts.receiptProof')}
                        </label>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#eff6ff', color: '#2563eb', border: '1px dashed #bfdbfe', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                            <Upload size={16} /> {t('adminPayouts.uploadBtn')}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleProofUpload}
                              disabled={uploading}
                              style={{ display: 'none' }}
                            />
                          </label>
                          
                          {uploading && <span style={{ fontSize: '13px', color: '#64748b' }}>{t('adminPayouts.uploading')}</span>}
                          
                          {proofUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                              <CheckCircle2 size={16} /> {t('adminPayouts.uploaded')}
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
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{t('adminPayouts.adminNotes')}</label>
                        <textarea 
                          rows="3"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t('adminPayouts.adminNotesPlaceholder')}
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
                          {t('adminPayouts.rejectBtn')}
                        </button>
                        <button 
                          type="submit" 
                          className="btn-primary" 
                          disabled={submitting || uploading}
                          style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {submitting ? t('adminPayouts.completingBtn') : t('adminPayouts.completeBtn')} <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* If already completed or rejected: show details */}
                  {(selectedWithdrawal.status.toLowerCase() === 'completed' || selectedWithdrawal.status.toLowerCase() === 'rejected') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
                      {selectedWithdrawal.status.toLowerCase() === 'completed' && selectedWithdrawal.transaction_proof_url && (
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>{t('adminPayouts.receiptLabel')}</div>
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
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>{t('adminPayouts.notesLabel')}</div>
                        <p style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', margin: 0 }}>
                          {selectedWithdrawal.admin_notes || t('adminPayouts.noNotes')}
                        </p>
                      </div>

                      <div className="modal-footer" style={{ borderTop: 'none', padding: '10px 0 0 0', display: 'flex', justifyContent: 'flex-end', background: 'none' }}>
                        <button 
                          className="btn-primary" 
                          onClick={() => setSelectedWithdrawal(null)}
                          style={{ width: '100%', padding: '12px', background: '#0f172a', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                        >
                          {t('adminPayouts.closeBtn')}
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
