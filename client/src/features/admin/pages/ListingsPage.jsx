import React, { useState } from 'react';
import { Search, ChevronDown, List, Grid, MoreHorizontal } from 'lucide-react';
import ListingTable from '../components/ListingTable';
import './ListingsPage.css';

// Mock Data
const MOCK_LISTINGS = [
  {
    id: 'PRP-9021',
    title: 'Luxury Studio in D1',
    location: 'District 1, HCMC',
    price: 15000000,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=200&h=200',
    landlord: { name: 'Nguyen Van A', type: 'Verified Host' },
    status: 'Active',
    performance: { views: 1250, inquiries: 45 }
  },
  {
    id: 'PRP-9020',
    title: 'Cozy 2BR Apartment',
    location: 'Binh Thanh District, HCMC',
    price: 12000000,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1c29408447?auto=format&fit=crop&q=80&w=200&h=200',
    landlord: { name: 'Tran Thi B', type: 'New Host' },
    status: 'Occupied',
    performance: { views: 890, inquiries: 12 }
  },
  {
    id: 'PRP-9019',
    title: 'Modern Room near University',
    location: 'District 7, HCMC',
    price: 5000000,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=200&h=200',
    landlord: { name: 'Le Van C', type: null },
    status: 'Hidden',
    alert: 'Multiple user reports',
    performance: { views: 3400, inquiries: 112 }
  }
];

const ListingsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  const filteredListings = MOCK_LISTINGS.filter((item) => {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           item.id.toLowerCase().includes(searchTerm.toLowerCase());
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
              <select className="filter-select">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Occupied</option>
                <option>Hidden</option>
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
        {viewMode === 'list' ? (
          <ListingTable listings={filteredListings} />
        ) : (
          <div className="grid-placeholder">
            <p>Grid view is under construction. Please use list view.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="pagination-container">
          <span className="pagination-info">Showing 1 to {filteredListings.length} of {MOCK_LISTINGS.length} properties</span>
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

export default ListingsPage;
