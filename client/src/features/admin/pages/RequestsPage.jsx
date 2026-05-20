import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import './RequestsPage.css';

const MOCK_REQUESTS = [
  { id: 'REQ-001', tenant: 'Nguyen Van A', property: 'Room 101, Sunrise Tower', type: 'Maintenance', subject: 'Air conditioner not working', priority: 'High', status: 'Pending', date: '2026-05-18' },
  { id: 'REQ-002', tenant: 'Tran Thi B', property: 'Room 205, Ocean View', type: 'Booking', subject: 'Request to extend lease by 3 months', priority: 'Medium', status: 'In Review', date: '2026-05-17' },
  { id: 'REQ-003', tenant: 'Le Van C', property: 'Room 302, Sunrise Tower', type: 'Complaint', subject: 'Noise complaint from neighbor', priority: 'High', status: 'Resolved', date: '2026-05-16' },
  { id: 'REQ-004', tenant: 'Pham Thi D', property: 'Room 104, Green Park', type: 'Inquiry', subject: 'Question about parking policy', priority: 'Low', status: 'Resolved', date: '2026-05-15' },
  { id: 'REQ-005', tenant: 'Hoang Van E', property: 'Room 401, Ocean View', type: 'Maintenance', subject: 'Leaking faucet in bathroom', priority: 'Medium', status: 'Pending', date: '2026-05-14' },
];

const TYPE_CLASSES = {
  Maintenance: 'type-maintenance',
  Booking: 'type-booking',
  Complaint: 'type-complaint',
  Inquiry: 'type-inquiry',
};

const PRIORITY_CLASSES = {
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

const RequestsPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch = r.tenant.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Requests Management</h1>
        <p className="admin-page-subtitle">Review and manage tenant requests, maintenance issues, and complaints.</p>
      </div>

      <div className="requests-content-area">
        <div className="requests-toolbar">
          <div className="toolbar-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by ID or tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="toolbar-filters">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Tenant</th>
                <th>Property</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td className="tx-id">#{req.id}</td>
                  <td>{req.tenant}</td>
                  <td className="td-muted">{req.property}</td>
                  <td>
                    <span className={`request-type-badge ${TYPE_CLASSES[req.type]}`}>
                      {req.type}
                    </span>
                  </td>
                  <td>{req.subject}</td>
                  <td>
                    <span className={PRIORITY_CLASSES[req.priority]}>{req.priority}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      req.status === 'Resolved' ? 'status-active' :
                      req.status === 'Pending' ? 'status-pending' : 'status-occupied'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="td-muted">{new Date(req.date).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action-icon" title="View"><Eye size={18} /></button>
                      <button className="btn-action-icon" title="Approve"><CheckCircle size={18} /></button>
                      <button className="btn-action-icon" title="Reject"><XCircle size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-container">
          <span className="pagination-info">Showing {filtered.length} of {MOCK_REQUESTS.length} requests</span>
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

export default RequestsPage;
