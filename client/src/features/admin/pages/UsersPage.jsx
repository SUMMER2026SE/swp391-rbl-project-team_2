import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, MoreVertical, Shield } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import adminService from '../../../services/adminService';
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

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    userId: null,
    action: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">User Management</h1>
        <p className="admin-page-subtitle">Manage tenants, landlords, and admin accounts.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-content-area">
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
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-circle">
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
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
                          disabled={user.status === 'Active'}
                        >
                          <UserCheck size={18} />
                        </button>
                        <button 
                          className="btn-action-icon" 
                          title="Suspend"
                          onClick={() => handleUpdateStatus(user.rawId, 'suspend')}
                          disabled={user.status === 'Suspended'}
                        >
                          <UserX size={18} />
                        </button>
                        <button className="btn-action-icon" title="More">
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
          <span className="pagination-info">Showing {filtered.length} of {users.length} users</span>
          <div className="pagination-controls">
            <button className="btn-page" disabled>Previous</button>
            <button className="btn-page active">1</button>
            <button className="btn-page">Next</button>
          </div>
        </div>
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
    </div>
  );
};

export default UsersPage;
