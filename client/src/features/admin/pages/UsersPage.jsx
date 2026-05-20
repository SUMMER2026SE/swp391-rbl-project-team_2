import React, { useState } from 'react';
import { Search, UserCheck, UserX, MoreVertical, Shield } from 'lucide-react';
import './UsersPage.css';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Nguyen Van A', email: 'nguyenvana@email.com', role: 'TENANT', status: 'Active', joined: '2025-01-15', rooms: 1 },
  { id: 'USR-002', name: 'Tran Thi B', email: 'tranthib@email.com', role: 'TENANT', status: 'Active', joined: '2025-02-20', rooms: 1 },
  { id: 'USR-003', name: 'Le Van C', email: 'levanc@email.com', role: 'LANDLORD', status: 'Active', joined: '2024-11-10', rooms: 5 },
  { id: 'USR-004', name: 'Pham Thi D', email: 'phamthid@email.com', role: 'TENANT', status: 'Suspended', joined: '2025-03-05', rooms: 0 },
  { id: 'USR-005', name: 'Hoang Van E', email: 'hoangvane@email.com', role: 'LANDLORD', status: 'Active', joined: '2024-09-22', rooms: 3 },
];

const ROLE_COLORS = {
  TENANT: 'role-tenant',
  LANDLORD: 'role-landlord',
  ADMIN: 'role-admin',
};

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = MOCK_USERS.filter((u) => {
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
                        {user.name.charAt(0)}
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
                      <button className="btn-action-icon" title="Activate">
                        <UserCheck size={18} />
                      </button>
                      <button className="btn-action-icon" title="Suspend">
                        <UserX size={18} />
                      </button>
                      <button className="btn-action-icon" title="More">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <span className="pagination-info">Showing {filtered.length} of {MOCK_USERS.length} users</span>
          <div className="pagination-controls">
            <button className="btn-page" disabled>Previous</button>
            <button className="btn-page active">1</button>
            <button className="btn-page">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
