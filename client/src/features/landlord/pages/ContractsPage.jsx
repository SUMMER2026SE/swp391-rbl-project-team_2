import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  X,
  Calendar,
  FileText,
  AlertCircle,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  Timer
} from 'lucide-react';
import { useContracts } from '../hooks/useContracts';
import Button from '../../../components/common/Button';
import Loading from '../../../components/ui/Loading';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import ContractDocument from '../../../components/ContractDocument';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ContractsPage.css';

const ContractsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [renewData, setRenewData] = useState({ duration: 12 });
  const [terminateReason, setTerminateReason] = useState('');

  const navigate = useNavigate();
  const { contracts, loading, error, renewContract, terminateContract, updateContract, fetchContracts } = useContracts();

  const filteredContracts = contracts.filter(contract => {
    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch = !searchLower ||
      (contract.tenantName || '').toLowerCase().includes(searchLower) ||
      (contract.roomTitle || '').toLowerCase().includes(searchLower) ||
      (contract.contractNumber || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'All' || (contract.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const contractDate = new Date(contract.createdAt || contract.start_date || new Date());
      if (dateFrom && new Date(dateFrom) > contractDate) matchesDate = false;
      if (dateTo && new Date(dateTo) < contractDate) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.start_date || 0);
    const dateB = new Date(b.createdAt || b.start_date || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const getStatusDisplay = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'active':
        return { icon: <CheckCircle2 size={16} />, color: '#059669', bg: '#d1fae5', label: 'Active' };
      case 'pending':
      case 'pending_signature':
        return { icon: <FileSignature size={16} />, color: '#b45309', bg: '#fef3c7', label: 'Pending Signature' };
      case 'pending_payment':
        return { icon: <Clock size={16} />, color: '#7c3aed', bg: '#ede9fe', label: 'Pending Payment' };
      case 'completed':
        return { icon: <CheckCircle2 size={16} />, color: '#059669', bg: '#d1fae5', label: 'Completed' };
      case 'expired':
        return { icon: <Timer size={16} />, color: '#64748b', bg: '#f1f5f9', label: 'Expired' };
      case 'terminated':
      case 'cancelled':
        return { icon: <Ban size={16} />, color: '#dc2626', bg: '#fee2e2', label: 'Cancelled' };
      case 'draft':
        return { icon: <FileText size={16} />, color: '#64748b', bg: '#f1f5f9', label: 'Draft' };
      default:
        return { icon: null, color: '#64748b', bg: '#f1f5f9', label: status };
    }
  };

  const handleRenew = async () => {
    if (!renewData.duration || renewData.duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    try {
      await renewContract(selectedContract.id, renewData);
      setShowRenewModal(false);
      setShowDetailModal(false);
      setSelectedContract(null);
      setRenewData({ duration: 12 });
    } catch (err) {
      alert(err.message || 'Failed to renew contract');
    }
  };

  const handleTerminate = async () => {
    if (!terminateReason.trim()) {
      alert('Please provide a reason for termination');
      return;
    }

    try {
      await terminateContract(selectedContract.id, terminateReason);
      setShowTerminateModal(false);
      setShowDetailModal(false);
      setSelectedContract(null);
      setTerminateReason('');
    } catch (err) {
      alert(err.message || 'Failed to terminate contract');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="contracts">
      {/* Header */}
      <div className="contracts__header">
        <div>
          <h1 className="contracts__title">{t('contracts.contracts', 'Contracts')}</h1>
          <p className="contracts__subtitle">{t('contracts.manageRentalContractsAndAgreements', 'Manage rental contracts and agreements')}</p>
        </div>
        <Button variant="primary">
          <Plus size={18} />{t('contracts.newContract', 'New Contract')}</Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="contracts__filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div className="filter-search" style={{ minWidth: '250px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder={t('contracts.searchByTenantRoomOrPlaceholder', 'Search by tenant, room, or contract number...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '0.65rem 1rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{t('contracts.from', 'From:')}</span>
          <input type="date" lang="en-GB" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer' }} />
        </div>

        <div className="filter-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '0.65rem 1rem', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{t('contracts.to', 'To:')}</span>
          <input type="date" lang="en-GB" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer' }} />
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            <ChevronDown size={16} />
          </button>
          {showSortDropdown && (
            <div className="filter-dropdown-menu">
              <button className={`filter-dropdown-item ${sortOrder === 'newest' ? 'active' : ''}`} onClick={() => { setSortOrder('newest'); setShowSortDropdown(false); }}>{t('contracts.newestFirst', 'Newest First')}</button>
              <button className={`filter-dropdown-item ${sortOrder === 'oldest' ? 'active' : ''}`} onClick={() => { setSortOrder('oldest'); setShowSortDropdown(false); }}>{t('contracts.oldestFirst', 'Oldest First')}</button>
            </div>
          )}
        </div>

        <div className="filter-dropdown-container">
          <button
            className="filter-dropdown-btn"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <span>{statusFilter === 'All' ? 'All' : statusFilter.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['All', 'active', 'pending_signature', 'pending_payment', 'completed', 'expired', 'terminated', 'cancelled', 'draft'].map(status => (
                <button
                  key={status}
                  className={`filter-dropdown-item ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contracts Table */}
      {filteredContracts.length > 0 ? (
        <div className="contracts__table-container" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table className="contracts__table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('contracts.tenant', 'Tenant')}</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('contracts.room', 'Room')}</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('contracts.moveinDate', 'Move-in Date')}</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('contracts.duration', 'Duration')}</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('contracts.status', 'Status')}</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '14px' }}>{t('contracts.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(contract => (
                <tr key={contract.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                        {contract.tenant?.avatar_url ? (
                          <img src={contract.tenant.avatar_url} alt={contract.tenantName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 600, fontSize: '16px' }}>
                            {contract.tenantName ? contract.tenantName.charAt(0) : 'T'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#2563eb', marginBottom: '2px' }}>{contract.tenantName}</div>
                        <div style={{ fontSize: '13px', color: '#2563eb' }}>{contract.tenantEmail || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#2563eb' }}>
                    <span 
                      onClick={() => navigate(`/rooms/${contract.roomId}`)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {contract.roomTitle}
                    </span>
                    {contract.assignedRoomNumber && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Room: {contract.assignedRoomNumber}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                    {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                    {contract.duration} months
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div 
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '9999px',
                        backgroundColor: getStatusDisplay(contract.status).bg,
                        color: getStatusDisplay(contract.status).color,
                        fontWeight: '600', fontSize: '12px',
                        border: `1px solid ${getStatusDisplay(contract.status).color}33`
                      }}
                    >
                      {getStatusDisplay(contract.status).icon}
                      {getStatusDisplay(contract.status).label}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowContractModal(true);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1',
                        borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: 500
                      }}
                    >
                      <FileText size={14} />{t('contracts.viewContract', 'View Contract')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="📄"
          title="No contracts found"
          description="Create your first contract to get started"
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedContract && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-content--large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('contracts.contractDetails', 'Contract Details')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Contract Header */}
              <div className="detail-section">
                <div className="contract-header-display">
                  <div>
                    <h4>{selectedContract.contractNumber}</h4>
                    <p>{selectedContract.roomTitle}</p>
                  </div>
                  <div 
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '9999px',
                      backgroundColor: getStatusDisplay(selectedContract.status).bg,
                      color: getStatusDisplay(selectedContract.status).color,
                      fontWeight: '700', fontSize: '0.85rem',
                      border: `1px solid ${getStatusDisplay(selectedContract.status).color}33`
                    }}
                  >
                    {getStatusDisplay(selectedContract.status).icon}
                    {getStatusDisplay(selectedContract.status).label}
                  </div>
                </div>
              </div>

              {/* Room Info */}
              {selectedContract.room && (
                <div className="detail-section">
                  <h4 className="section-title">{t('contracts.roomInformation', 'Room Information')}</h4>
                  <div className="detail-grid">
                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                      <label>{t('contracts.address', 'Address')}</label>
                      <div className="detail-value" style={{ fontSize: '0.9rem' }}>
                        {[selectedContract.room.address, selectedContract.room.ward, selectedContract.room.district, selectedContract.room.city].filter(Boolean).join(', ')}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>{t('contracts.roomType', 'Room Type')}</label>
                      <div className="detail-value" style={{ textTransform: 'capitalize' }}>{t('contracts.phngCNhn', 'Phòng cá nhân')}</div>
                    </div>
                    <div className="detail-item">
                      <label>{t('contracts.assignedRoom', 'Assigned Room')}</label>
                      <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedContract.assignedRoomNumber || 'Chưa gán số'}
                        <button
                          className="btn-icon"
                          onClick={async () => {
                            const num = prompt('Nhập số phòng thực tế (ví dụ: Phòng 101):', selectedContract.assignedRoomNumber || '');
                            if (num !== null && num.trim() !== '') {
                              try {
                                await updateContract(selectedContract.id, { assignedRoomNumber: num.trim() });
                                toast.success('Đã cập nhật số phòng thành công!');
                                setSelectedContract({ ...selectedContract, assignedRoomNumber: num.trim() });
                                fetchContracts();
                              } catch (err) {
                                toast.error(err.message || 'Lỗi khi cập nhật số phòng');
                              }
                            }
                          }}
                          title="Gán/Sửa số phòng"
                          style={{ padding: 4, background: '#f1f5f9', borderRadius: 4, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Edit size={14} color="#64748b" />
                        </button>
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>{t('contracts.maxOccupants', 'Max Occupants')}</label>
                      <div className="detail-value">{selectedContract.room.max_occupants}</div>
                    </div>
                    <div className="detail-item">
                      <label>{t('contracts.area', 'Area')}</label>
                      <div className="detail-value">{selectedContract.room.area_sqm} m²</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tenant Info */}
              <div className="detail-section">
                <h4 className="section-title">{t('contracts.tenantInformation', 'Tenant Information')}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t('contracts.name', 'Name')}</label>
                    <div className="detail-value">{selectedContract.tenantName}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('contracts.email', 'Email')}</label>
                    <div className="detail-value">{selectedContract.tenantEmail}</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('contracts.phone', 'Phone')}</label>
                    <div className="detail-value">{selectedContract.tenantPhone}</div>
                  </div>
                </div>
              </div>

              {/* Contract Terms */}
              <div className="detail-section">
                <h4 className="section-title">{t('contracts.contractTerms', 'Contract Terms')}</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">{t('contracts.startDate', 'Start Date')}</span>
                    <span className="detail-value">
                      <Calendar size={14} />
                      {new Date(selectedContract.startDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('contracts.endDate', 'End Date')}</span>
                    <span className="detail-value">
                      <Calendar size={14} />
                      {new Date(selectedContract.endDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>{t('contracts.duration', 'Duration')}</label>
                    <div className="detail-value">{selectedContract.duration} months</div>
                  </div>
                  <div className="detail-item">
                    <label>{t('contracts.monthlyRent', 'Monthly Rent')}</label>
                    <div className="detail-value">{selectedContract.monthlyRent?.toLocaleString()} đ</div>
                  </div>
                </div>
              </div>

              {/* Additional Terms */}
              {selectedContract.terms && (
                <div className="detail-section">
                  <h4 className="section-title">{t('contracts.additionalTerms', 'Additional Terms')}</h4>
                  <div className="terms-box">{selectedContract.terms}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Contract Document Modal */}
      {showContractModal && selectedContract && (
        <div className="modal-backdrop" onClick={() => setShowContractModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', padding: '40px 20px', overflowY: 'auto', display: 'block' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowContractModal(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
            >
              <X size={20} color="#475569" />
            </button>
            <ContractDocument 
              contract={selectedContract}
              role="landlord"
              onTerminate={() => {
                setShowContractModal(false);
                setShowTerminateModal(true);
              }}
              onRenew={() => {
                setShowContractModal(false);
                setShowRenewModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && selectedContract && (
        <div className="modal-backdrop" onClick={() => setShowRenewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('contracts.renewContract', 'Renew Contract')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowRenewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="renew-info">
                Renew the contract for {selectedContract.tenantName} in {selectedContract.roomTitle}
              </p>
              <div className="form-group">
                <label>Renewal Duration (months)</label>
                <input
                  type="number"
                  min="1"
                  value={renewData.duration}
                  onChange={(e) => setRenewData({ duration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowRenewModal(false)}
              >{t('contracts.cancel', 'Cancel')}</Button>
              <Button
                variant="primary"
                onClick={handleRenew}
              >{t('contracts.renewContract', 'Renew Contract')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Modal */}
      {showTerminateModal && selectedContract && (
        <div className="modal-backdrop" onClick={() => setShowTerminateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('contracts.terminateContract', 'Terminate Contract')}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowTerminateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="terminate-info">{t('contracts.pleaseProvideAReasonFor', 'Please provide a reason for terminating this contract.')}</p>
              <textarea
                className="terminate-textarea"
                placeholder={t('contracts.enterTerminationReasonPlaceholder', 'Enter termination reason...')}
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                rows="5"
              />
            </div>

            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowTerminateModal(false)}
              >{t('contracts.cancel', 'Cancel')}</Button>
              <Button
                variant="danger"
                onClick={handleTerminate}
              >{t('contracts.terminateContract', 'Terminate Contract')}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsPage;
