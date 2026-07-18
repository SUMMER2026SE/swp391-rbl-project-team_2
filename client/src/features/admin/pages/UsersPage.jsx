import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, UserCheck, UserX, MoreVertical, Shield, Trash2 } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import adminService from '../../../services/adminService';
import { getAvatarUrl } from '../../../utils/format';
import './UsersPage.css';

const ROLE_COLORS = {
  TENANT: 'role-tenant',
  LANDLORD: 'role-landlord',
  ADMIN: 'role-admin',
};

const UsersPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tabs state
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'verifications'
  const [verifications, setVerifications] = useState([]);
  const [verifLoading, setVerifLoading] = useState(false);
  const [selectedVerif, setSelectedVerif] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    userId: null,
    action: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'verifications') {
      fetchVerifications();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      setError(t('adminUsers.errorFetch'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      setVerifLoading(true);
      const res = await adminService.getVerifications();
      if (res.success) {
        setVerifications(res.data);
      }
    } catch (err) {
      console.error('Error fetching verifications:', err);
      toast.error('Không thể lấy danh sách xác thực.');
    } finally {
      setVerifLoading(false);
    }
  };

  const handleApproveVerification = async (userId) => {
    try {
      setActionLoading(true);
      const res = await adminService.processVerification(userId, 'verified', null);
      if (res.success) {
        toast.success('Đã phê duyệt xác thực chủ trọ thành công!');
        setSelectedVerif(null);
        fetchVerifications();
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi phê duyệt xác thực.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminService.processVerification(selectedVerif.userId, 'rejected', rejectReason);
      if (res.success) {
        toast.success('Đã từ chối yêu cầu xác thực.');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedVerif(null);
        fetchVerifications();
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi từ chối xác thực.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = (userId, action) => {
    setConfirmDialog({ show: true, userId, action });
  };

  const executeStatusUpdate = async () => {
    const { userId, action } = confirmDialog;
    setConfirmDialog({ show: false, userId: null, action: null });

    try {
      const res = await adminService.updateUserStatus(userId, action);
      if (res.success) {
        toast.success(t(`adminUsers.success${action.charAt(0).toUpperCase() + action.slice(1)}`));
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      toast.error(t('adminUsers.errorUpdate'));
      console.error(err);
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, userId: null, action: null });
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{t('adminUsers.title')}</h1>
        <p className="admin-page-subtitle">{t('adminUsers.subtitle')}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-content-area">
        {/* Custom Tab Selection */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', paddingBottom: '0.2rem' }}>
          <button 
            onClick={() => setActiveTab('users')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'users' ? '3px solid #3b82f6' : '3px solid transparent', 
              fontWeight: 600, 
              color: activeTab === 'users' ? '#3b82f6' : '#64748b',
              padding: '0.5rem 1rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            Danh sách Người dùng
          </button>
          <button 
            onClick={() => setActiveTab('verifications')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'verifications' ? '3px solid #3b82f6' : '3px solid transparent', 
              fontWeight: 600, 
              color: activeTab === 'verifications' ? '#3b82f6' : '#64748b',
              padding: '0.5rem 1rem',
              transition: 'all 0.2s',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Duyệt xác thực CCCD</span>
            {verifications.length > 0 && (
              <span style={{ 
                backgroundColor: '#ef4444', 
                color: 'white', 
                fontSize: '0.75rem', 
                padding: '2px 6px', 
                borderRadius: '50%',
                fontWeight: 700 
              }}>
                {verifications.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="users-toolbar">
              <div className="toolbar-search">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder={t('adminUsers.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="toolbar-filters">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
                  <option value="All">{t('adminUsers.allRoles')}</option>
                  <option value="TENANT">{t('adminUsers.roleTenant')}</option>
                  <option value="LANDLORD">{t('adminUsers.roleLandlord')}</option>
                  <option value="ADMIN">{t('adminUsers.roleAdmin')}</option>
                </select>
              </div>
            </div>

            <div className="users-table-container">
              {loading ? (
                <div className="loading-state">{t('adminUsers.loading')}</div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>{t('adminUsers.tableUser')}</th>
                      <th>{t('adminUsers.tableRole')}</th>
                      <th>{t('adminUsers.tableStatus')}</th>
                      <th>{t('adminUsers.tableRooms')}</th>
                      <th>{t('adminUsers.tableJoined')}</th>
                      <th className="th-actions">{t('adminUsers.tableActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-circle" style={{ overflow: 'hidden' }}>
                              <img src={getAvatarUrl(user.name, user.avatarUrl)} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <p className="user-name">{user.name}</p>
                              <p className="user-email">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${ROLE_COLORS[user.role]}`}>
                            {user.role === 'ADMIN' && <Shield size={12} />}
                            {t(`adminUsers.roles.${user.role}`, user.role)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            user.status === 'Active' ? 'status-active' : 
                            user.status === 'Deleted' ? 'status-danger' : 'status-hidden'
                          }`} style={user.status === 'Deleted' ? { backgroundColor: '#fef2f2', color: '#ef4444' } : {}}>
                            {t(`adminUsers.status.${user.status}`, user.status)}
                          </span>
                        </td>
                        <td className="td-center">{user.rooms}</td>
                        <td className="td-muted">{new Date(user.joined).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action-icon" 
                              title={t('adminUsers.activate')}
                              onClick={() => handleUpdateStatus(user.rawId, 'activate')}
                              disabled={user.status === 'Active' || user.role === 'ADMIN'}
                            >
                              <UserCheck size={18} />
                            </button>
                            <button 
                              className="btn-action-icon" 
                              title={t('adminUsers.suspend')}
                              onClick={() => handleUpdateStatus(user.rawId, 'suspend')}
                              disabled={user.status === 'Suspended' || user.role === 'ADMIN'}
                            >
                              <UserX size={18} />
                            </button>
                            <button 
                              className="btn-action-icon text-danger" 
                              title={t('adminUsers.deleteUser', 'Delete User')}
                              onClick={() => handleUpdateStatus(user.rawId, 'delete')}
                              disabled={user.status === 'Deleted' || user.role === 'ADMIN'}
                              style={{ color: '#ef4444' }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4">{t('adminUsers.noUsers')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pagination-container">
              <span className="pagination-info">
                {t('adminUsers.showing', {
                  start: filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
                  end: Math.min(currentPage * itemsPerPage, filtered.length),
                  total: filtered.length
                })}
              </span>
              <div className="pagination-controls">
                <button 
                  className="btn-page" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  {t('adminUsers.previous')}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page} 
                    className={`btn-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="btn-page" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  {t('adminUsers.next')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="users-table-container">
            {verifLoading ? (
              <div className="loading-state">Đang tải danh sách xác thực...</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Chủ nhà</th>
                    <th>Số CCCD</th>
                    <th>Địa chỉ thường trú</th>
                    <th>Ngày gửi</th>
                    <th className="th-actions">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v.userId}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-circle" style={{ overflow: 'hidden' }}>
                            <img src={getAvatarUrl(v.fullName, v.avatarUrl)} alt={v.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <p className="user-name">{v.fullName}</p>
                            <p className="user-email">{v.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{v.icNumber}</td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.permanentAddress}</td>
                      <td className="td-muted">{new Date(v.submittedAt).toLocaleDateString('vi-VN')} {new Date(v.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action-icon text-primary" 
                            title="Xem chi tiết & Duyệt"
                            onClick={() => setSelectedVerif(v)}
                            style={{ color: '#3b82f6', border: '1px solid #dbeafe', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', width: 'auto' }}
                          >
                            <span>Xem hồ sơ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {verifications.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-4">Không có yêu cầu xác thực nào đang chờ duyệt</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <Modal show={confirmDialog.show} onHide={closeConfirmDialog} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('adminUsers.confirmTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {t('adminUsers.confirmText', { action: confirmDialog.action ? t(`adminUsers.${confirmDialog.action}`) : '' })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmDialog}>
            {t('adminUsers.cancel')}
          </Button>
          <Button variant={(confirmDialog.action === 'suspend' || confirmDialog.action === 'delete') ? 'danger' : 'primary'} onClick={executeStatusUpdate}>
            {t('adminUsers.confirm')}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!selectedVerif && !showRejectModal} onHide={() => setSelectedVerif(null)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9', padding: '1.25rem 1.5rem' }}>
          <Modal.Title style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            Chi tiết Hồ sơ Xác thực CCCD Chủ trọ
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {selectedVerif && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* User details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ gridColumn: 'span 2', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Thông tin tài khoản chủ nhà
                </h4>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Họ và tên chủ nhà</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{selectedVerif.fullName}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email liên hệ</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{selectedVerif.email}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số điện thoại</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{selectedVerif.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày gửi hồ sơ</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{new Date(selectedVerif.submittedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
 
              {/* CCCD details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h4 style={{ gridColumn: 'span 2', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 1 4 3v1m-4-1H9m6-4H9m3 4h3" /></svg>
                  Thông tin thẻ CCCD từ hồ sơ
                </h4>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Số CCCD</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', letterSpacing: '0.5px' }}>{selectedVerif.icNumber}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày cấp</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>{selectedVerif.icIssueDate ? new Date(selectedVerif.icIssueDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nơi cấp</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#334155', fontSize: '0.95rem', lineHeight: 1.4 }}>{selectedVerif.icIssuePlace}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Địa chỉ thường trú</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#334155', fontSize: '0.95rem', lineHeight: 1.4 }}>{selectedVerif.permanentAddress}</p>
                </div>
              </div>
 
              {/* Photos comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Hình ảnh đối chiếu (Nhấp để xem ảnh gốc)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.25rem' }}>
                  
                  {/* CCCD Front */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Mặt trước CCCD</span>
                    <a href={selectedVerif.cccdFrontUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '150px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={selectedVerif.cccdFrontUrl} alt="Mặt trước CCCD" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  </div>
 
                  {/* CCCD Back */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Mặt sau CCCD</span>
                    <a href={selectedVerif.cccdBackUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '150px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={selectedVerif.cccdBackUrl} alt="Mặt sau CCCD" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  </div>
 
                  {/* Face selfie */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Ảnh chân dung</span>
                    <a href={selectedVerif.facePhotoUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '150px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={selectedVerif.facePhotoUrl} alt="Ảnh chân dung" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  </div>
 
                </div>
              </div>
 
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem', gap: '0.75rem' }}>
          <Button variant="danger" disabled={actionLoading} onClick={() => setShowRejectModal(true)} style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 600, boxShadow: '0 1px 2px rgba(239, 68, 68, 0.1)', transition: 'all 0.2s' }}>
            Từ chối duyệt
          </Button>
          <Button variant="success" disabled={actionLoading} onClick={() => handleApproveVerification(selectedVerif.userId)} style={{ padding: '8px 20px', borderRadius: '6px', fontWeight: 600, boxShadow: '0 1px 2px rgba(34, 197, 94, 0.1)', transition: 'all 0.2s' }}>
            {actionLoading ? 'Đang duyệt...' : 'Phê duyệt xác thực'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal dialog */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Lý do từ chối xác thực</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="edit-form-group">
            <label>Nhập lý do từ chối duyệt hồ sơ (sẽ gửi thông báo đến chủ trọ) *</label>
            <textarea 
              className="form-control"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Ảnh chân dung chụp quá mờ không nhận dạng rõ mặt, hoặc ảnh CCCD bị chói sáng..."
              rows={4}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '0.5rem' }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Quay lại
          </Button>
          <Button variant="danger" disabled={actionLoading} onClick={handleRejectVerification}>
            {actionLoading ? 'Đang gửi...' : 'Gửi từ chối'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersPage;
