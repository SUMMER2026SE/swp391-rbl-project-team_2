import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, MoreVertical, Shield } from 'lucide-react';
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
      setError('Failed to fetch users. Please try again.');
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
        toast.success(`User successfully ${action}d!`);
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      toast.error('Failed to update user status.');
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
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-page-subtitle">Manage tenants, landlords, and admin accounts.</p>
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
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="toolbar-filters">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
                  <option value="All">All Roles</option>
                  <option value="TENANT">Tenant</option>
                  <option value="LANDLORD">Landlord</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="users-table-container">
              {loading ? (
                <div className="loading-state">Loading users...</div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Rooms</th>
                      <th>Joined</th>
                      <th className="th-actions">Actions</th>
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
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-hidden'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="td-center">{user.rooms}</td>
                        <td className="td-muted">{new Date(user.joined).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action-icon" 
                              title="Activate"
                              onClick={() => handleUpdateStatus(user.rawId, 'activate')}
                              disabled={user.status === 'Active' || user.role === 'ADMIN'}
                            >
                              <UserCheck size={18} />
                            </button>
                            <button 
                              className="btn-action-icon" 
                              title="Suspend"
                              onClick={() => handleUpdateStatus(user.rawId, 'suspend')}
                              disabled={user.status === 'Suspended' || user.role === 'ADMIN'}
                            >
                              <UserX size={18} />
                            </button>
                            <button className="btn-action-icon" title="More" disabled={user.role === 'ADMIN'}>
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pagination-container">
              <span className="pagination-info">
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} users
              </span>
              <div className="pagination-controls">
                <button 
                  className="btn-page" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
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
                  Next
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
          <Modal.Title>Confirm User Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to <strong>{confirmDialog.action}</strong> this user?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirmDialog}>
            Cancel
          </Button>
          <Button variant={confirmDialog.action === 'suspend' ? 'danger' : 'primary'} onClick={executeStatusUpdate}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Detail verification modal */}
      <Modal show={!!selectedVerif && !showRejectModal} onHide={() => setSelectedVerif(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Hồ sơ Xác thực CCCD Chủ trọ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVerif && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* User details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Họ và tên chủ nhà</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedVerif.fullName}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Email liên hệ</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedVerif.email}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Số điện thoại</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedVerif.phone || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Ngày gửi hồ sơ</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{new Date(selectedVerif.submittedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {/* CCCD details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ gridColumn: 'span 2', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#334155' }}>Thông tin thẻ CCCD</h4>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Số CCCD</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600, fontSize: '1.05rem', color: '#0f172a' }}>{selectedVerif.icNumber}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Ngày cấp</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedVerif.icIssueDate ? new Date(selectedVerif.icIssueDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Nơi cấp</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedVerif.icIssuePlace}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Địa chỉ thường trú</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontWeight: 600 }}>{selectedVerif.permanentAddress}</p>
                </div>
              </div>

              {/* Photos comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#334155' }}>Hình ảnh đối chiếu (Nhấp để xem ảnh gốc)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  
                  {/* CCCD Front */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Mặt trước CCCD</span>
                    <a href={selectedVerif.cccdFrontUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '150px' }}>
                      <img src={selectedVerif.cccdFrontUrl} alt="Mặt trước CCCD" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  </div>

                  {/* CCCD Back */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Mặt sau CCCD</span>
                    <a href={selectedVerif.cccdBackUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '150px' }}>
                      <img src={selectedVerif.cccdBackUrl} alt="Mặt sau CCCD" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  </div>

                  {/* Face selfie */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Ảnh chân dung</span>
                    <a href={selectedVerif.facePhotoUrl} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '150px' }}>
                      <img src={selectedVerif.facePhotoUrl} alt="Ảnh chân dung" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  </div>

                </div>
              </div>

            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" disabled={actionLoading} onClick={() => setShowRejectModal(true)}>
            Từ chối duyệt
          </Button>
          <Button variant="success" disabled={actionLoading} onClick={() => handleApproveVerification(selectedVerif.userId)}>
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
