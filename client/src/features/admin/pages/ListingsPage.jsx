import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, List, Grid, MoreHorizontal, AlertTriangle } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListingTable from '../components/ListingTable';
import ListingGrid from '../components/ListingGrid';
import adminService from '../../../services/adminService';
import './ListingsPage.css';

const ListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    roomId: null,
    status: null
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllRooms();
      if (res.success) {
        setListings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (roomId, status) => {
    setConfirmDialog({ show: true, roomId, status });
  };

  const executeStatusUpdate = async () => {
    const { roomId, status } = confirmDialog;
    setConfirmDialog({ show: false, roomId: null, status: null });
    
    try {
      const res = await adminService.updateRoomStatus(roomId, status);
      if (res.success) {
        toast.success('Room status updated successfully!');
        fetchListings();
      }
    } catch (err) {
      toast.error('Failed to update room status.');
      console.error(err);
    }
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, roomId: null, status: null });
  };

  const filteredListings = listings.filter((item) => {
    if (activeTab === 'pending' && item.status.toLowerCase() !== 'pending') return false;

    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = item.status.toLowerCase() === statusFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="listings-page-header">
        <div className="header-titles">
          <h1 className="admin-page-title">Listing Management</h1>
          <p className="admin-page-subtitle">Manage properties, review flagged listings, and monitor performance.</p>
        </div>
        <div className="header-actions">
          <button className="btn-bulk-action">Bulk Actions</button>
          <div className="view-mode-toggle">
            <button 
              className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
            <button 
              className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="listings-tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          className={`listing-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          style={{ 
            padding: '10px 4px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'all' ? '2px solid #4f46e5' : '2px solid transparent',
            color: activeTab === 'all' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'all' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          All Properties
        </button>
        <button 
          className={`listing-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '10px 4px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'pending' ? '2px solid #4f46e5' : '2px solid transparent',
            color: activeTab === 'pending' ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === 'pending' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Pending Approvals
          {listings.filter(l => l.status.toLowerCase() === 'pending').length > 0 && (
            <span style={{ 
              background: '#ef4444', 
              color: 'white', 
              fontSize: '0.75rem', 
              padding: '2px 8px', 
              borderRadius: '999px',
              fontWeight: '600'
            }}>
              {listings.filter(l => l.status.toLowerCase() === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <div className="listings-content-area">
        {/* Toolbar */}
        <div className="listings-toolbar">
          <div className="toolbar-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Prop ID or Title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="toolbar-filters">
            <div className="filter-dropdown-wrapper">
              <select className="filter-select">
                <option>All Property Types</option>
                <option>Apartment</option>
                <option>Studio</option>
                <option>Shared Room</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>

            <div className="filter-dropdown-wrapper">
              <select className="filter-select">
                <option>All Neighborhoods</option>
                <option>District 1</option>
                <option>Binh Thanh</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>

            <div className="filter-dropdown-wrapper">
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="available">Active / Available</option>
                <option value="pending">Pending Approval</option>
                <option value="rented">Occupied</option>
                <option value="rejected">Rejected</option>
                <option value="hidden">Hidden</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>

            <button className="btn-more-filters">
              <MoreHorizontal size={18} />
              <span>More</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="loading-state">Loading listings...</div>
        ) : viewMode === 'list' ? (
          <ListingTable listings={filteredListings} onUpdateStatus={handleUpdateStatus} />
        ) : (
          <ListingGrid listings={filteredListings} onUpdateStatus={handleUpdateStatus} />
        )}

        {/* Pagination */}
        <div className="pagination-container">
          <span className="pagination-info">Showing {filteredListings.length} of {listings.length} properties</span>
          <div className="pagination-controls">
            <button className="btn-page" disabled>Previous</button>
            <button className="btn-page active">1</button>
            <button className="btn-page">Next</button>
          </div>
        </div>
      </div>

      <Modal 
        show={confirmDialog.show} 
        onHide={closeConfirmDialog} 
        centered
        dialogClassName="custom-confirm-modal"
      >
        <Modal.Body className="confirm-modal-body">
          <div className="confirm-modal-icon-wrapper">
            <AlertTriangle className="confirm-modal-icon" size={30} />
          </div>
          <h3 className="confirm-modal-title">Confirm Status Change</h3>
          <p className="confirm-modal-text">
            Are you sure you want to change this listing's status to 
            <span className={`status-badge-inline status-${confirmDialog.status?.toLowerCase()}`}>
              {confirmDialog.status}
            </span>?
          </p>
        </Modal.Body>
        <Modal.Footer className="confirm-modal-footer">
          <button className="btn-confirm-cancel" onClick={closeConfirmDialog}>
            Cancel
          </button>
          <button className="btn-confirm-submit" onClick={executeStatusUpdate}>
            Confirm
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListingsPage;
