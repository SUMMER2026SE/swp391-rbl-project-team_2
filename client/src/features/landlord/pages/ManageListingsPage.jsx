import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { 
  Plus, 
  Search, 
  MapPin, 
  ArrowUpRight, 
  Pencil, 
  Trash2, 
  SlidersHorizontal,
  ChevronDown,
  X,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import Button from '../../../components/common/Button';
import './ManageListingsPage.css';

// Initial Mock Listings
const INITIAL_LISTINGS = [
  {
    id: 'APT-104A',
    title: 'Sunny Studio in Downtown',
    address: '124 Main St, Floor 4',
    price: 1200,
    status: 'Available',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80',
    tags: ['High-Speed Wi-Fi', 'In-unit W/D'],
    performance: {
      views: 450,
      inquiries: 28,
      revenue: 1200
    }
  },
  {
    id: 'COL-20B',
    title: 'Premium Co-living Suite',
    address: '88 Oak Ave, Tech District',
    price: 850,
    status: 'Occupied',
    type: 'Co-living',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80',
    tags: ['Private Bath', 'Cleaning Incl.'],
    performance: {
      views: 310,
      inquiries: 15,
      revenue: 850
    }
  },
  {
    id: 'APT-205C',
    title: 'Modern Minimalist Loft',
    address: '42 Pine St, Arts District',
    price: 1500,
    status: 'Available',
    type: 'Apartment',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
    tags: ['Balcony', 'Gym Access', 'Pet Friendly'],
    performance: {
      views: 620,
      inquiries: 42,
      revenue: 0
    }
  },
  {
    id: 'HOU-12A',
    title: 'Spacious Suburban House',
    address: '15 Maple Dr, Green Suburbs',
    price: 2200,
    status: 'Available',
    type: 'House',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&auto=format&fit=crop&q=80',
    tags: ['Backyard', 'Garage', 'Family Friendly'],
    performance: {
      views: 280,
      inquiries: 12,
      revenue: 2200
    }
  }
];

const ManageListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState(INITIAL_LISTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('Property Type');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPerfModalOpen, setIsPerfModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [formType, setFormType] = useState('Apartment');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');

  // Dropdown states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Filter listings
  const filteredListings = listings.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All Statuses' || item.status === statusFilter;

    const matchesType = 
      typeFilter === 'Property Type' || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const resetForm = () => {
    setFormId('');
    setFormTitle('');
    setFormAddress('');
    setFormPrice('');
    setFormStatus('Available');
    setFormType('Apartment');
    setFormImage('');
    setFormTags('');
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newId = formId.trim() || `APT-${Math.floor(100 + Math.random() * 900)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const defaultImage = formImage.trim() || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80';
    
    const newListing = {
      id: newId,
      title: formTitle,
      address: formAddress,
      price: Number(formPrice) || 1000,
      status: formStatus,
      type: formType,
      image: defaultImage,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      performance: {
        views: 0,
        inquiries: 0,
        revenue: formStatus === 'Occupied' ? Number(formPrice) : 0
      }
    };

    setListings([newListing, ...listings]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditClick = (listing) => {
    setSelectedListing(listing);
    setFormId(listing.id);
    setFormTitle(listing.title);
    setFormAddress(listing.address);
    setFormPrice(listing.price);
    setFormStatus(listing.status);
    setFormType(listing.type);
    setFormImage(listing.image);
    setFormTags(listing.tags.join(', '));
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setListings(listings.map(item => {
      if (item.id === selectedListing.id) {
        return {
          ...item,
          title: formTitle,
          address: formAddress,
          price: Number(formPrice),
          status: formStatus,
          type: formType,
          image: formImage || item.image,
          tags: formTags.split(',').map(t => t.trim()).filter(Boolean)
        };
      }
      return item;
    }));
    setIsEditModalOpen(false);
    setSelectedListing(null);
    resetForm();
  };

  const handleDeleteClick = (id) => {
    if (window.confirm(`Are you sure you want to delete listing ${id}?`)) {
      setListings(listings.filter(item => item.id !== id));
    }
  };

  const handlePerfClick = (listing) => {
    setSelectedListing(listing);
    setIsPerfModalOpen(true);
  };

  return (
    <div className="manage-listings">
      {/* Top Header Row */}
      <div className="manage-listings__header">
        <div>
          <h1 className="manage-listings__title">Manage Listings</h1>
          <p className="manage-listings__subtitle">View, edit, and monitor your property portfolio.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />} 
          onClick={() => navigate(ROUTES.LANDLORD.NEW_LISTING)}
        >
          Add New Listing
        </Button>
      </div>

      {/* Filter Bar Row */}
      <div className="manage-listings__filter-bar">
        {/* Search */}
        <div className="filter-search">
          <Search size={18} className="filter-search__icon" />
          <input 
            type="text" 
            placeholder="Search by address, ID, or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search__input"
          />
        </div>

        {/* Dropdown 1: All Statuses */}
        <div className="filter-dropdown-container">
          <button 
            className="filter-dropdown-btn"
            onClick={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowTypeDropdown(false);
            }}
          >
            <span>{statusFilter}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['All Statuses', 'Available', 'Occupied'].map((st) => (
                <button 
                  key={st} 
                  className={`filter-dropdown-item ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(st);
                    setShowStatusDropdown(false);
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown 2: Property Type */}
        <div className="filter-dropdown-container">
          <button 
            className="filter-dropdown-btn"
            onClick={() => {
              setShowTypeDropdown(!showTypeDropdown);
              setShowStatusDropdown(false);
            }}
          >
            <span>{typeFilter}</span>
            <ChevronDown size={16} />
          </button>
          {showTypeDropdown && (
            <div className="filter-dropdown-menu">
              {['Property Type', 'Apartment', 'Co-living', 'House'].map((tp) => (
                <button 
                  key={tp} 
                  className={`filter-dropdown-item ${typeFilter === tp ? 'active' : ''}`}
                  onClick={() => {
                    setTypeFilter(tp);
                    setShowTypeDropdown(false);
                  }}
                >
                  {tp}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* More Filters button */}
        <button 
          className="filter-more-btn"
          onClick={() => {
            setStatusFilter('All Statuses');
            setTypeFilter('Property Type');
            setSearchTerm('');
          }}
          title="Reset all filters"
        >
          <SlidersHorizontal size={16} />
          <span>More Filters</span>
        </button>
      </div>

      {/* Grid of Listings */}
      {filteredListings.length > 0 ? (
        <div className="manage-listings__grid">
          {filteredListings.map((listing) => (
            <div className="listing-card" key={listing.id}>
              {/* Image & Badges */}
              <div className="listing-card__image-container">
                <img src={listing.image} alt={listing.title} className="listing-card__img" />
                
                {/* Status Badge */}
                <div className={`listing-card__badge-status status-${listing.status.toLowerCase()}`}>
                  <span className="badge-status-dot"></span>
                  <span>{listing.status}</span>
                </div>

                {/* Price Tag */}
                <div className="listing-card__badge-price">
                  <span className="price-amount">${listing.price.toLocaleString()}</span>
                  <span className="price-unit">/mo</span>
                </div>
              </div>

              {/* Body */}
              <div className="listing-card__body">
                <div className="listing-card__id">ID: {listing.id}</div>
                <h3 className="listing-card__title">{listing.title}</h3>
                
                <div className="listing-card__address">
                  <MapPin size={15} />
                  <span>{listing.address}</span>
                </div>

                <div className="listing-card__tags">
                  {listing.tags.map((tag, idx) => (
                    <span key={idx} className="listing-card__tag-pill">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="listing-card__footer">
                <button 
                  className="btn-performance-link"
                  onClick={() => handlePerfClick(listing)}
                >
                  <span>View Performance</span>
                  <ArrowUpRight size={16} />
                </button>

                <div className="listing-card__actions">
                  <button 
                    className="action-icon-btn btn-edit" 
                    title="Edit Listing"
                    onClick={() => handleEditClick(listing)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button 
                    className="action-icon-btn btn-delete" 
                    title="Delete Listing"
                    onClick={() => handleDeleteClick(listing.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="manage-listings__empty">
          <div className="empty-icon-wrapper">🏡</div>
          <h3>No listings found</h3>
          <p>Try adjusting your search criteria or add a new listing to get started.</p>
        </div>
      )}

      {/* Add New Listing Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Listing</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Listing ID (optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. APT-104A"
                      value={formId} 
                      onChange={(e) => setFormId(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Rent (USD) *</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="e.g. 1200"
                      value={formPrice} 
                      onChange={(e) => setFormPrice(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Property Title *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Sunny Studio in Downtown"
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Full Address *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 124 Main St, Floor 4"
                    value={formAddress} 
                    onChange={(e) => setFormAddress(e.target.value)} 
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Property Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                      <option value="Apartment">Apartment</option>
                      <option value="Co-living">Co-living</option>
                      <option value="House">House</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Listing Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input 
                    type="text" 
                    placeholder="https://unsplash.com/..." 
                    value={formImage} 
                    onChange={(e) => setFormImage(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Tags / Amenities (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Private Bath, High-Speed Wi-Fi, Gym Access" 
                    value={formTags} 
                    onChange={(e) => setFormTags(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Listing Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Listing {selectedListing?.id}</h3>
              <button className="modal-close-btn" onClick={() => {
                setIsEditModalOpen(false);
                setSelectedListing(null);
              }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Property Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Full Address *</label>
                  <input 
                    type="text" 
                    required 
                    value={formAddress} 
                    onChange={(e) => setFormAddress(e.target.value)} 
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Monthly Rent (USD) *</label>
                    <input 
                      type="number" 
                      required 
                      value={formPrice} 
                      onChange={(e) => setFormPrice(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Property Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                      <option value="Apartment">Apartment</option>
                      <option value="Co-living">Co-living</option>
                      <option value="House">House</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Listing Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input 
                      type="text" 
                      value={formImage} 
                      onChange={(e) => setFormImage(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags / Amenities (comma separated)</label>
                  <input 
                    type="text" 
                    value={formTags} 
                    onChange={(e) => setFormTags(e.target.value)} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" type="button" onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedListing(null);
                }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {isPerfModalOpen && selectedListing && (
        <div className="modal-backdrop">
          <div className="modal-content modal-content--performance">
            <div className="modal-header">
              <h3>Performance: {selectedListing.title}</h3>
              <button className="modal-close-btn" onClick={() => {
                setIsPerfModalOpen(false);
                setSelectedListing(null);
              }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="perf-id-sub">Listing ID: {selectedListing.id} • {selectedListing.address}</p>
              
              <div className="perf-stats-grid">
                <div className="perf-stat-box">
                  <div className="perf-stat-icon-wrapper blue">
                    <Eye size={20} />
                  </div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Page Views</span>
                    <span className="perf-stat-val">{selectedListing.performance.views}</span>
                  </div>
                </div>

                <div className="perf-stat-box">
                  <div className="perf-stat-icon-wrapper green">
                    <Calendar size={20} />
                  </div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Leasing Inquiries</span>
                    <span className="perf-stat-val">{selectedListing.performance.inquiries}</span>
                  </div>
                </div>

                <div className="perf-stat-box">
                  <div className="perf-stat-icon-wrapper purple">
                    <DollarSign size={20} />
                  </div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">Monthly Revenue</span>
                    <span className="perf-stat-val">${selectedListing.performance.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Graphic chart illustration */}
              <div className="perf-chart-box">
                <h4>Inquiry Trend (Last 7 Days)</h4>
                <div className="perf-svg-container">
                  <svg viewBox="0 0 400 120" className="mini-chart-svg">
                    <defs>
                      <linearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 20 100 Q 80 80 140 40 T 260 60 T 380 20 L 380 100 L 20 100 Z" 
                      fill="url(#miniChartGrad)" 
                    />
                    <path 
                      d="M 20 100 Q 80 80 140 40 T 260 60 T 380 20" 
                      fill="none" 
                      stroke="#3B82F6" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />
                    <circle cx="20" cy="100" r="4" fill="#3B82F6" />
                    <circle cx="80" cy="88" r="4" fill="#3B82F6" />
                    <circle cx="140" cy="40" r="4" fill="#3B82F6" />
                    <circle cx="200" cy="50" r="4" fill="#3B82F6" />
                    <circle cx="260" cy="60" r="4" fill="#3B82F6" />
                    <circle cx="320" cy="35" r="4" fill="#3B82F6" />
                    <circle cx="380" cy="20" r="4" fill="#3B82F6" />
                  </svg>
                </div>
                <div className="chart-days-row">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="primary" onClick={() => {
                setIsPerfModalOpen(false);
                setSelectedListing(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageListingsPage;
