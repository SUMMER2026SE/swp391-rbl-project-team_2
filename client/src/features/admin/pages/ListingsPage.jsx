import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, List, Grid, MoreHorizontal, AlertTriangle } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ListingTable from '../components/ListingTable';
import ListingGrid from '../components/ListingGrid';
import adminService from '../../../services/adminService';
import './ListingsPage.css';

const ListingsPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [cityFilter, setCityFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  
  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    roomId: null,
    status: null
  });

  useEffect(() => {
    fetchListings();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, cityFilter, districtFilter, activeTab]);

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
    


    let matchesCity = true;
    if (cityFilter !== 'All') {
      matchesCity = item.city === cityFilter || item.location?.includes(cityFilter);
    }

    let matchesDistrict = true;
    if (districtFilter !== 'All') {
      matchesDistrict = item.district === districtFilter || item.location?.includes(districtFilter);
    }

    return matchesSearch && matchesStatus && matchesCity && matchesDistrict;
  });

  // Extract unique options from listings for filters

  const uniqueCities = [...new Set(listings.map(item => item.city || (item.location ? item.location.split(', ').pop() : null)).filter(Boolean))];
  // If a city is selected, filter districts by that city, else show all
  const filteredDistricts = cityFilter !== 'All' 
    ? listings.filter(item => item.city === cityFilter || item.location?.includes(cityFilter))
    : listings;
  const uniqueDistricts = [...new Set(filteredDistricts.map(item => item.district || (item.location ? item.location.split(', ')[0] : null)).filter(Boolean))];

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentListings = filteredListings.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="listings-page-header">
        <div className="header-titles">
          <h1 className="admin-page-title">{t('adminListings.title')}</h1>
          <p className="admin-page-subtitle">{t('adminListings.subtitle')}</p>
        </div>
        <div className="header-actions">
          <button className="btn-bulk-action">{t('adminListings.bulkActions')}</button>
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
          {t('adminListings.allProperties')}
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
          {t('adminListings.pendingApprovals')}
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
              placeholder={t('adminListings.searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="toolbar-filters">


            <div className="filter-dropdown-wrapper">
              <select 
                className="filter-select"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setDistrictFilter('All'); // Reset district when city changes
                }}
              >
                <option value="All">{t('adminListings.allCities')}</option>
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>

            <div className="filter-dropdown-wrapper">
              <select 
                className="filter-select"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
              >
                <option value="All">{t('adminListings.allDistricts')}</option>
                {uniqueDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>

            <div className="filter-dropdown-wrapper">
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">{t('adminListings.allStatuses')}</option>
                <option value="available">{t('adminListings.statusActive')}</option>
                <option value="pending">{t('adminListings.statusPending')}</option>
                <option value="rented">{t('adminListings.statusOccupied')}</option>
                <option value="rejected">{t('adminListings.statusRejected')}</option>
                <option value="hidden">{t('adminListings.statusHidden')}</option>
              </select>
              <ChevronDown size={14} className="dropdown-icon" />
            </div>

            <button className="btn-more-filters">
              <MoreHorizontal size={18} />
              <span>{t('adminListings.more')}</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="loading-state">{t('adminListings.loading')}</div>
        ) : viewMode === 'list' ? (
          <ListingTable listings={currentListings} onUpdateStatus={handleUpdateStatus} />
        ) : (
          <ListingGrid listings={currentListings} onUpdateStatus={handleUpdateStatus} />
        )}

        {/* Pagination */}
        {filteredListings.length > 0 && (
          <div className="pagination-container">
            <span className="pagination-info">
              {t('adminListings.showing', { start: indexOfFirstItem + 1, end: Math.min(indexOfLastItem, filteredListings.length), total: filteredListings.length })}
            </span>
            <div className="pagination-controls">
              <button 
                className="btn-page" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                {t('adminListings.previous')}
              </button>
              <span className="page-indicator" style={{ margin: '0 10px', fontSize: '0.9rem', color: '#64748b' }}>
                {t('adminListings.pageIndicator', { current: currentPage, total: totalPages })}
              </span>
              <button 
                className="btn-page" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                {t('adminListings.next')}
              </button>
            </div>
          </div>
        )}
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
          <h3 className="confirm-modal-title">{t('adminListings.confirmTitle')}</h3>
          <p className="confirm-modal-text">
            {t('adminListings.confirmText')}
            {' '}<span className={`status-badge-inline status-${confirmDialog.status?.toLowerCase()}`}>
              {t(`adminListings.status${confirmDialog.status ? confirmDialog.status.charAt(0).toUpperCase() + confirmDialog.status.slice(1).toLowerCase() : ''}`, confirmDialog.status)}
            </span>?
          </p>
        </Modal.Body>
        <Modal.Footer className="confirm-modal-footer">
          <button className="btn-confirm-cancel" onClick={closeConfirmDialog}>
            {t('adminListings.cancel')}
          </button>
          <button className="btn-confirm-submit" onClick={executeStatusUpdate}>
            {t('adminListings.confirm')}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListingsPage;
