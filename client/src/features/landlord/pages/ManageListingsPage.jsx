import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  DollarSign,
  Upload
} from 'lucide-react';
import Button from '../../../components/common/Button';
import { useRooms } from '../hooks/useRooms';
import { landlordService } from '../services/landlordService';
import './ManageListingsPage.css';
import './AddNewPropertyPage.css';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, loading: roomsLoading, error: roomsError, createRoom, updateRoom, deleteRoom, uploadImage, deleteImage } = useRooms();
  const [formImageFiles, setFormImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('Room Type');

  useEffect(() => {
    if (rooms) {
      const mapped = rooms.map(room => {
        // Find covers or primary image
        let coverImg = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80';
        if (room.images && room.images.length > 0) {
          const primary = room.images.find(img => img.is_primary || img.isPrimary);
          const imgUrl = primary ? (primary.image_url || primary.url) : (room.images[0].image_url || room.images[0].url);
          coverImg = imgUrl && imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`;
        } else if (room.thumbnailUrl || room.thumbnail_url) {
          const thumb = room.thumbnailUrl || room.thumbnail_url;
          coverImg = thumb && thumb.startsWith('http') ? thumb : `http://localhost:5000${thumb}`;
        }

        // Facilities mapping
        let tags = ['High-Speed Wi-Fi', 'Private Bath'];
        if (room.facilities && room.facilities.length > 0) {
          tags = room.facilities.map(f => f.facilityName || f.facility_name);
        }

        return {
          id: (room.roomId || room.room_id || room.id).toString(),
          title: room.title || '',
          address: room.address || '',
          city: room.city || '',
          district: room.district || '',
          price: Number(room.pricePerMonth || room.price_per_month || 0),
          status: (room.status || '').toLowerCase() === 'available' ? 'Available' :
            ['rented', 'unavailable'].includes((room.status || '').toLowerCase()) ? 'Occupied' :
              (room.status || '').toLowerCase() === 'pending' ? 'Pending' :
                (room.status || '').toLowerCase() === 'rejected' ? 'Rejected' :
                  (room.status || '').toLowerCase() === 'maintenance' ? 'Maintenance' : 'Inactive',
          type: room.roomType === 'single' ? 'Single Room' :
            room.roomType === 'double' ? 'Double Room' :
              room.roomType === 'apartment' ? 'Apartment' :
                room.roomType === 'shared' ? 'Shared Room' :
                  room.roomType === 'house' ? 'House' : 'Room',
          image: coverImg,
          tags: tags,
          performance: {
            views: Math.floor((((room.roomId || room.id || 0) * 47) % 500) + 50),
            inquiries: Math.floor((((room.roomId || room.id || 0) * 11) % 40) + 2),
            revenue: room.status === 'rented' ? Number(room.pricePerMonth || 0) : 0
          },
          rawRoom: room
        };
      });
      setListings(mapped);
    }
  }, [rooms]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && listings.length > 0) {
      const listing = listings.find(l => l.id === editId || l.rawRoom?.room_id === Number(editId) || l.rawRoom?.roomId === Number(editId));
      if (listing) {
        handleEditClick(listing);
        searchParams.delete('edit');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, listings, setSearchParams]);

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
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [formType, setFormType] = useState('apartment');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formNearbyTags, setFormNearbyTags] = useState('');
  const [formMaxOccupants, setFormMaxOccupants] = useState('');
  const [formBedrooms, setFormBedrooms] = useState('');
  const [formAreaSqm, setFormAreaSqm] = useState('');
  const [priceError, setPriceError] = useState('');
  const [occupantsError, setOccupantsError] = useState('');
  const [bedroomsError, setBedroomsError] = useState('');
  const [areaError, setAreaError] = useState('');

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
      typeFilter === 'Room Type' || (item.type || '').toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const resetForm = () => {
    setFormId('');
    setFormTitle('');
    setFormDescription('');
    setFormAddress('');
    setFormPrice('');
    setFormStatus('Available');
    setFormType('apartment');
    setFormImage('');
    setFormTags('');
    setFormNearbyTags('');
    setFormMaxOccupants('');
    setFormBedrooms('');
    setFormAreaSqm('');
    setFormImageFiles([]);
    setPreviewImages([]);
    setPriceError('');
    setOccupantsError('');
    setBedroomsError('');
    setAreaError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomPayload = {
        title: formTitle,
        description: formDescription,
        pricePerMonth: Number(formPrice),
        roomType: formType,
        address: formAddress,
        maxOccupants: formMaxOccupants ? Number(formMaxOccupants) : null,
        bedrooms: formBedrooms ? Number(formBedrooms) : null,
        areaSqm: formAreaSqm ? Number(formAreaSqm) : null,
        status: 'available'
      };

      const newRoom = await createRoom(roomPayload);
      const roomId = newRoom.roomId || newRoom.room_id || newRoom.id;
      
      if (formImageFiles && formImageFiles.length > 0 && roomId) {
        for (let file of formImageFiles) {
          await uploadImage(roomId, file);
        }
      }

      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to create room');
    }
  };

  const handleEditClick = (listing) => {
    setSelectedListing(listing);
    setFormId(listing.id);
    setFormTitle(listing.title);
    setFormDescription(listing.rawRoom?.description || listing.description || '');

    const raw = listing.rawRoom;
    const fullAddress = [listing.address, raw?.ward, listing.district, listing.city].filter(Boolean).join(', ');
    setFormAddress(fullAddress || listing.address);

    setFormPrice(listing.price);
    setFormStatus(listing.status);
    setFormType(listing.type);
    setFormImage(listing.image);

    const facilities = raw?.facilities || [];
    const roomFacs = facilities.filter(f => f.category === 'room' || !f.category).map(f => f.facilityName || f.facility_name).join(', ');
    const nearbyFacs = facilities.filter(f => f.category === 'nearby').map(f => f.facilityName || f.facility_name).join(', ');

    setFormTags(roomFacs);
    setFormNearbyTags(nearbyFacs);
    setFormMaxOccupants(raw?.maxOccupants || raw?.max_occupants || '');
    setFormBedrooms(raw?.bedrooms || '');
    setFormAreaSqm(raw?.areaSqm || raw?.area_sqm || '');
    setFormImageFiles([]);
    setPreviewImages([]);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomPayload = {
        title: formTitle,
        description: formDescription,
        pricePerMonth: Number(formPrice),
        roomType: formType,
        maxOccupants: formMaxOccupants ? Number(formMaxOccupants) : null,
        bedrooms: formBedrooms ? Number(formBedrooms) : null,
        areaSqm: formAreaSqm ? Number(formAreaSqm) : null,
      };

      if (selectedListing.rawRoom?.status !== 'pending' && selectedListing.rawRoom?.status !== 'rejected') {
        roomPayload.status = formStatus === 'Available' ? 'available' :
          formStatus === 'Occupied' ? 'rented' : 'inactive';
      }

      const roomIdToUpdate = selectedListing.rawRoom?.roomId || selectedListing.id;
      await updateRoom(roomIdToUpdate, roomPayload);

      if (formImageFiles && formImageFiles.length > 0) {
        // Delete old images first
        const oldImages = selectedListing.rawRoom?.images || [];
        for (let oldImg of oldImages) {
          try {
            await deleteImage(roomIdToUpdate, oldImg.imageId || oldImg.image_id || oldImg.id);
          } catch (e) {
            console.error('Failed to delete old image:', e);
          }
        }
        
        // Upload new images
        for (let file of formImageFiles) {
          await uploadImage(roomIdToUpdate, file);
        }
      }

      setListings(listings.map(item => {
        if (item.id === selectedListing.id) {
          return {
            ...item,
            title: formTitle,
            description: formDescription,
            address: formAddress,
            price: Number(formPrice),
            status: formStatus,
            type: formType,
            image: formImage || item.image,
            tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : item.tags,
            rawRoom: {
              ...item.rawRoom,
              description: formDescription,
              maxOccupants: formMaxOccupants ? Number(formMaxOccupants) : null,
              bedrooms: formBedrooms ? Number(formBedrooms) : null,
              areaSqm: formAreaSqm ? Number(formAreaSqm) : null,
            }
          };
        }
        return item;
      }));
      setIsEditModalOpen(false);
      setSelectedListing(null);
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to update room');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm(`Are you sure you want to delete listing ${id}?`)) {
      try {
        await deleteRoom(id);
        setListings(listings.filter(item => item.id !== id));
      } catch (err) {
        toast.error(err.message || 'Failed to delete room');
      }
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
              {['All Statuses', 'Available', 'Occupied', 'Pending', 'Rejected', 'Inactive'].map((st) => (
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

        {/* Dropdown 2: Room Type */}
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
              {['Room Type', 'Single Room', 'Double Room', 'Shared Room', 'Apartment', 'House', 'Room'].map((tp) => (
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
            setTypeFilter('Room Type');
            setSearchTerm('');
          }}
          title="Reset all filters"
        >
          <SlidersHorizontal size={16} />
          <span>More Filters</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {roomsLoading && (
        <div className="manage-listings__loading">
          <div className="spinner-loader"></div>
          <p>Loading listings from database...</p>
        </div>
      )}

      {roomsError && (
        <div className="manage-listings__error">
          <p>⚠️ Error loading listings: {roomsError}</p>
        </div>
      )}

      {/* Grid of Listings */}
      {!roomsLoading && !roomsError && (
        filteredListings.length > 0 ? (
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
                    <span className="price-amount">{listing.price.toLocaleString('vi-VN')} VNĐ</span>
                    <span className="price-unit">/tháng</span>
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
                    onClick={() => navigate(`/rooms/${listing.id}`)}
                  >
                    <span>View Room Listing</span>
                    <ArrowUpRight size={16} />
                  </button>

                  <div className="listing-card__actions">
                    <button
                      className="action-icon-btn btn-edit"
                      title="Edit Listing"
                      onClick={() => handleEditClick(listing)}
                      disabled={['Pending', 'Maintenance', 'Occupied'].includes(listing.status)}
                      style={['Pending', 'Maintenance', 'Occupied'].includes(listing.status) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="action-icon-btn btn-delete"
                      title="Delete Listing"
                      onClick={() => handleDeleteClick(listing.id)}
                      disabled={['Pending', 'Maintenance', 'Occupied'].includes(listing.status)}
                      style={['Pending', 'Maintenance', 'Occupied'].includes(listing.status) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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
        )
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
                    <label>Monthly Rent (VNĐ) *</label>
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
                  <label>Listing Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunny Studio in Downtown"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Property Description</label>
                  <textarea
                    placeholder="Describe your property..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
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
                    <label>Room Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                      <option value="single">Single Room</option>
                      <option value="double">Double Room</option>
                      <option value="shared">Shared Room</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                    </select>
                  </div>

                </div>

                <div className="form-group">
                  <label>Room Images (optional)</label>
                  <div className="media-drag-drop-zone">
                    <input
                      type="file"
                      id="add-listing-file-upload"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files);
                          setFormImageFiles(newFiles);
                          const newPreviews = newFiles.map(f => URL.createObjectURL(f));
                          setPreviewImages(newPreviews);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="add-listing-file-upload" className="drag-drop-label-wrapper">
                      <div className="drag-drop-cloud-icon">
                        <Upload size={24} />
                      </div>
                      <div className="drag-drop-text-instructions">
                        <span className="bold-instruction-text">Click to upload</span> or drag and drop
                      </div>
                      <span className="upload-limit-info">PNG, JPG, JPEG up to 10MB</span>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="media-preview-container">
                      <h4 className="preview-section-title">Selected Images ({previewImages.length})</h4>
                      <div className="media-previews-grid">
                        {previewImages.map((src, idx) => (
                          <div className="preview-image-card" key={idx}>
                            <img src={src} alt={`Preview ${idx}`} />
                            <button
                              type="button"
                              className="remove-preview-image-btn"
                              onClick={() => {
                                setFormImageFiles(prev => prev.filter((_, i) => i !== idx));
                                setPreviewImages(prev => {
                                  URL.revokeObjectURL(prev[idx]);
                                  return prev.filter((_, i) => i !== idx);
                                });
                              }}
                            >
                              <X size={14} />
                            </button>
                            {idx === 0 && <span className="featured-image-tag">Cover</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <label>Listing Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Property Description</label>
                  <textarea
                    placeholder="Describe your property..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Full Address *</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={formAddress}
                    className="disabled-input"
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Monthly Rent (VNĐ) *</label>
                    <input
                      type="text"
                      required
                      value={formPrice}
                      className={priceError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormPrice(val);
                        if (val !== '' && !/^\d+$/.test(val)) {
                          setPriceError('Please enter a valid positive number.');
                        } else if (val !== '' && Number(val) <= 0) {
                          setPriceError('Rent must be greater than 0.');
                        } else {
                          setPriceError('');
                        }
                      }}
                    />
                    {priceError && <div className="invalid-feedback d-block">{priceError}</div>}
                  </div>
                  <div className="form-group">
                    <label>Property Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                      <option value="single">Single Room</option>
                      <option value="double">Double Room</option>
                      <option value="shared">Shared Room</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Max Occupants</label>
                    <input
                      type="text"
                      value={formMaxOccupants}
                      className={occupantsError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormMaxOccupants(val);
                        if (val !== '' && !/^\d+$/.test(val)) {
                          setOccupantsError('Please enter a valid number.');
                        } else if (val !== '' && Number(val) <= 0) {
                          setOccupantsError('Max occupants must be at least 1.');
                        } else {
                          setOccupantsError('');
                        }
                      }}
                    />
                    {occupantsError && <div className="invalid-feedback d-block">{occupantsError}</div>}
                  </div>
                  <div className="form-group">
                    <label>Bedrooms</label>
                    <input
                      type="text"
                      value={formBedrooms}
                      className={bedroomsError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormBedrooms(val);
                        if (val !== '' && !/^\d+$/.test(val)) {
                          setBedroomsError('Please enter a valid number.');
                        } else if (val !== '' && Number(val) <= 0) {
                          setBedroomsError('Bedrooms must be at least 1.');
                        } else {
                          setBedroomsError('');
                        }
                      }}
                    />
                    {bedroomsError && <div className="invalid-feedback d-block">{bedroomsError}</div>}
                  </div>
                </div>

                <div className="form-group-row">

                  <div className="form-group">
                    <label>Size (m<sup>2</sup>)</label>
                    <input
                      type="text"
                      value={formAreaSqm}
                      className={areaError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormAreaSqm(val);
                        if (val !== '' && !/^\d+(\.\d+)?$/.test(val)) {
                          setAreaError('Please enter a valid number.');
                        } else if (val !== '' && Number(val) <= 0) {
                          setAreaError('Area must be greater than 0.');
                        } else {
                          setAreaError('');
                        }
                      }}
                    />
                    {areaError && <div className="invalid-feedback d-block">{areaError}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Update Images</label>
                  <div className="media-drag-drop-zone">
                    <input
                      type="file"
                      id="edit-listing-file-upload"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files);
                          setFormImageFiles(newFiles);
                          const newPreviews = newFiles.map(f => URL.createObjectURL(f));
                          setPreviewImages(newPreviews);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="edit-listing-file-upload" className="drag-drop-label-wrapper">
                      <div className="drag-drop-cloud-icon">
                        <Upload size={24} />
                      </div>
                      <div className="drag-drop-text-instructions">
                        <span className="bold-instruction-text">Click to upload</span> new images
                      </div>
                      <span className="upload-limit-info">PNG, JPG, JPEG up to 10MB</span>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="media-preview-container">
                      <h4 className="preview-section-title">New Images ({previewImages.length})</h4>
                      <div className="media-previews-grid">
                        {previewImages.map((src, idx) => (
                          <div className="preview-image-card" key={idx}>
                            <img src={src} alt={`New ${idx}`} />
                            <button
                              type="button"
                              className="remove-preview-image-btn"
                              onClick={() => {
                                setFormImageFiles(prev => prev.filter((_, i) => i !== idx));
                                setPreviewImages(prev => {
                                  URL.revokeObjectURL(prev[idx]);
                                  return prev.filter((_, i) => i !== idx);
                                });
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Room Facilities (Fixed)</label>
                    <input
                      type="text"
                      disabled
                      className="disabled-input"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nearby Facilities (Fixed)</label>
                    <input
                      type="text"
                      disabled
                      className="disabled-input"
                      value={formNearbyTags}
                      onChange={(e) => setFormNearbyTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" type="button" onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedListing(null);
                }}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={!!priceError || !!occupantsError || !!bedroomsError || !!areaError}>
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
                    <span className="perf-stat-val">{selectedListing.performance.revenue.toLocaleString('vi-VN')} VNĐ</span>
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
