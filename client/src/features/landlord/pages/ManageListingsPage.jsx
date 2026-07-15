import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../constants';
import {
  Building2,
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, loading: roomsLoading, error: roomsError, createRoom, updateRoom, deleteRoom, uploadImage, deleteImage } = useRooms({ limit: 100 });
  const [formImageFiles, setFormImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (rooms) {
      const mapped = rooms.map(room => {
        // Find covers or primary image
        let coverImg = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80';
        if (room.images && room.images.length > 0) {
          const primary = room.images.find(img => img.is_primary || img.isPrimary);
          const imgUrl = primary ? (primary.image_url || primary.url) : (room.images[0].image_url || room.images[0].url);
          coverImg = imgUrl && imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl?.startsWith('/') ? '' : '/'}${imgUrl?.replace(/\\/g, '/')}`;
        } else if (room.thumbnailUrl || room.thumbnail_url) {
          const thumb = room.thumbnailUrl || room.thumbnail_url;
          coverImg = thumb && thumb.startsWith('http') ? thumb : `http://localhost:5000${thumb?.startsWith('/') ? '' : '/'}${thumb?.replace(/\\/g, '/')}`;
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
          status: (room.status || '').toLowerCase() === 'available' ? 'available' :
            ['rented', 'unavailable'].includes((room.status || '').toLowerCase()) ? 'occupied' :
              (room.status || '').toLowerCase() === 'pending' ? 'pending' :
                (room.status || '').toLowerCase() === 'rejected' ? 'rejected' :
                  (room.status || '').toLowerCase() === 'maintenance' ? 'maintenance' : 'inactive',
          type: 'Private Room',
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
  const [formRoomNumber, setformRoomNumber] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('available');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formNearbyTags, setFormNearbyTags] = useState('');
  const [formMaxOccupants, setFormMaxOccupants] = useState('');
  const [formAreaSqm, setFormAreaSqm] = useState('');
  const [priceError, setPriceError] = useState('');
  const [occupantsError, setOccupantsError] = useState('');
  const [areaError, setAreaError] = useState('');

  const [sortOrder, setSortOrder] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
      statusFilter === 'all' || item.status === statusFilter;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const itemDate = new Date(item.rawRoom?.createdAt || item.rawRoom?.created_at || new Date());
      if (dateFrom && new Date(dateFrom) > itemDate) matchesDate = false;
      if (dateTo && new Date(dateTo) < itemDate) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const dateA = new Date(a.rawRoom?.createdAt || a.rawRoom?.created_at || 0);
    const dateB = new Date(b.rawRoom?.createdAt || b.rawRoom?.created_at || 0);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Group listings by property
  const groupedListings = filteredListings.reduce((acc, listing) => {
    let propertyName = listing.rawRoom?.property?.name;
    if (!propertyName) {
      propertyName = listing.address ? `${listing.address} (Independent)` : "Independent Rooms"; 
    }
    if (!acc[propertyName]) {
      acc[propertyName] = [];
    }
    acc[propertyName].push(listing);
    return acc;
  }, {});

  const resetForm = () => {
    setformRoomNumber('');
    setFormQuantity('');
    setFormTitle('');
    setFormDescription('');
    setFormAddress('');
    setFormPrice('');
    setFormStatus('Available');

    setFormImage('');
    setFormTags('');
    setFormNearbyTags('');
    setFormMaxOccupants('');
    setFormAreaSqm('');
    setFormImageFiles([]);
    setPreviewImages([]);
    setPriceError('');
    setOccupantsError('');
    setAreaError('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomPayload = {
        title: formTitle,
        description: formDescription,
        pricePerMonth: Number(formPrice),
        roomType: 'private_room',
        address: formAddress,
        maxOccupants: formMaxOccupants ? Number(formMaxOccupants) : 4,
        areaSqm: formAreaSqm ? Number(formAreaSqm) : null,
        roomNumber: formRoomNumber,
        quantity: formQuantity ? Number(formQuantity) : 1,
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
      toast.error(err.message || t('landlordListings.failedCreate'));
    }
  };

  const handleEditClick = (listing) => {
    setSelectedListing(listing);
    setformRoomNumber(listing.rawRoom?.room_number || listing.rawRoom?.roomNumber || '');
    setFormTitle(listing.title);
    setFormDescription(listing.rawRoom?.description || listing.description || '');

    const raw = listing.rawRoom;
    const fullAddress = [listing.address, raw?.ward, listing.district, listing.city].filter(Boolean).join(', ');
    setFormAddress(fullAddress || listing.address);

    setFormPrice(listing.price);
    setFormStatus(listing.status);
    setFormImage(listing.image);

    const facilities = raw?.facilities || [];
    const roomFacs = facilities.filter(f => f.category === 'room' || !f.category).map(f => f.facilityName || f.facility_name).join(', ');
    const nearbyFacs = facilities.filter(f => f.category === 'nearby').map(f => f.facilityName || f.facility_name).join(', ');

    setFormTags(roomFacs);
    setFormNearbyTags(nearbyFacs);
    setFormMaxOccupants(raw?.maxOccupants || raw?.max_occupants || '');
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
        roomType: 'private_room',
        maxOccupants: formMaxOccupants ? Number(formMaxOccupants) : 4,
        areaSqm: formAreaSqm ? Number(formAreaSqm) : null,
        roomNumber: formRoomNumber,
      };

      if (selectedListing.rawRoom?.status !== 'pending' && selectedListing.rawRoom?.status !== 'rejected') {
        roomPayload.status = formStatus === 'available' ? 'available' :
          formStatus === 'occupied' ? 'rented' : 'inactive';
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
            type: 'Private Room',
            image: formImage || item.image,
            tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : item.tags,
            rawRoom: {
              ...item.rawRoom,
              description: formDescription,
              maxOccupants: formMaxOccupants ? Number(formMaxOccupants) : 4,
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
      toast.error(err.message || t('landlordListings.failedUpdate'));
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm(t('landlordListings.confirmDelete', { id }))) {
      try {
        await deleteRoom(id);
        setListings(listings.filter(item => item.id !== id));
      } catch (err) {
        toast.error(err.message || t('landlordListings.failedDelete'));
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
          <h1 className="manage-listings__title">{t('landlordListings.title')}</h1>
          <p className="manage-listings__subtitle">{t('landlordListings.subtitle')}</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => navigate(ROUTES.LANDLORD.NEW_LISTING)}
        >
          {t('landlordListings.addNewListing')}
        </Button>
      </div>

      {/* Filter Bar Row */}
      <div className="manage-listings__filter-bar">
        {/* Search */}
        <div className="filter-search">
          <Search size={18} className="filter-search__icon" />
          <input
            type="text"
            placeholder={t('landlordListings.searchPlaceholder')}
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
            <span>{statusFilter === 'all' ? t('landlordListings.allStatuses') : t(`landlordListings.${statusFilter}`)}</span>
            <ChevronDown size={16} />
          </button>
          {showStatusDropdown && (
            <div className="filter-dropdown-menu">
              {['all', 'available', 'occupied', 'pending', 'rejected', 'inactive'].map((st) => (
                <button
                  key={st}
                  className={`filter-dropdown-item ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter(st);
                    setShowStatusDropdown(false);
                  }}
                >
                  {st === 'all' ? t('landlordListings.allStatuses') : t(`landlordListings.${st}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* More Filters button */}
        <button
          className="filter-more-btn"
          onClick={() => {
            setStatusFilter('all');
            setSearchTerm('');
          }}
          title={t('landlordListings.moreFilters')}
        >
          <SlidersHorizontal size={16} />
          <span>{t('landlordListings.moreFilters')}</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {roomsLoading && (
        <div className="manage-listings__loading">
          <div className="spinner-loader"></div>
          <p>{t('landlordListings.loading')}</p>
        </div>
      )}

      {roomsError && (
        <div className="manage-listings__error">
          <p>⚠️ {t('landlordListings.errorLoading')} {roomsError}</p>
        </div>
      )}

      {/* Grid of Listings */}
      {!roomsLoading && !roomsError && (
        filteredListings.length > 0 ? (
          <div className="manage-listings__grouped-container">
            {Object.entries(groupedListings).map(([propertyName, items]) => (
              <div key={propertyName} className="manage-listings__property-group">
                <h2 className="manage-listings__property-title">
                  <Building2 size={20} className="property-icon" />
                  {propertyName}
                  <span className="property-count">{items.length} {items.length === 1 ? t('landlordListings.roomSingular') : t('landlordListings.rooms')}</span>
                </h2>
                <div className="manage-listings__grid">
                  {items.map((listing) => (
              <div className="listing-card" key={listing.id}>
                {/* Image & Badges */}
                <div className="listing-card__image-container">
                  <img src={listing.image} alt={listing.title} className="listing-card__img" />

                  {/* Status Badge */}
                  <div className={`listing-card__badge-status status-${listing.status}`}>
                    <span className="badge-status-dot"></span>
                    <span>{t(`landlordListings.${listing.status}`)}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="listing-card__badge-price">
                    <span className="price-amount">{listing.price.toLocaleString('vi-VN')} VNĐ</span>
                    <span className="price-unit">{t('landlordListings.perMonth')}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="listing-card__body">
                  <div className="listing-card__id">{t('landlordListings.room')} {listing.rawRoom?.room_number || listing.rawRoom?.roomNumber || listing.id}</div>
                  <h3 className="listing-card__title">{listing.title}</h3>

                  {listing.status === 'rejected' && listing.rawRoom?.rejection_reason && (
                    <div className="listing-card__rejection-reason" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.5rem', border: '1px solid #fca5a5' }}>
                      <strong>{t('landlordListings.rejectionReason')}</strong> {listing.rawRoom.rejection_reason}
                    </div>
                  )}

                  <div className="listing-card__address">
                    <MapPin size={15} />
                    <span>{listing.address}</span>
                  </div>

                  {/* Room Description */}
                  <div className="listing-card__description" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                    {listing.rawRoom?.description || t('landlordListings.noDescription')}
                  </div>

                  <div className="listing-card__tags">
                    {listing.tags.map((tag, idx) => (
                      <span key={idx} className="listing-card__tag-pill">{t(`facilities.${tag}`, tag)}</span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="listing-card__footer">
                  <button
                    className="btn-performance-link"
                    onClick={() => navigate(`/rooms/${listing.id}`)}
                  >
                    <span>{t('landlordListings.viewRoomListing')}</span>
                    <ArrowUpRight size={16} />
                  </button>

                  <div className="listing-card__actions">
                    <button
                      className="action-icon-btn btn-edit"
                      title={t('landlordListings.editListing')}
                      onClick={() => handleEditClick(listing)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="action-icon-btn btn-delete"
                      title={t('landlordListings.deleteListing')}
                      onClick={() => handleDeleteClick(listing.id)}
                      disabled={['occupied'].includes(listing.status)}
                      style={['occupied'].includes(listing.status) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manage-listings__empty">
            <div className="empty-icon-wrapper">🏡</div>
            <h3>{t('landlordListings.noListings')}</h3>
            <p>{t('landlordListings.noListingsDesc')}</p>
          </div>
        )
      )}

      {/* Add New Listing Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t('landlordListings.createNewListing')}</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>{t('landlordListings.roomNumber')}</label>
                    <input
                      type="text"
                      placeholder="e.g. 101, A2"
                      value={formRoomNumber}
                      onChange={(e) => setformRoomNumber(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('landlordListings.monthlyRent')}</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1200"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('landlordListings.quantityOfRooms')}</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.listingTitle')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunny Studio in Downtown"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.propertyDescription')}</label>
                  <textarea
                    placeholder={t('landlordListings.descPlaceholder')}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.fullAddress')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 124 Main St, Floor 4"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>



                <div className="form-group">
                  <label>{t('landlordListings.roomImages')}</label>
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
                        <span className="bold-instruction-text">{t('landlordListings.clickToUpload')}</span> {t('landlordListings.orDragAndDrop')}
                      </div>
                      <span className="upload-limit-info">{t('landlordListings.uploadLimit')}</span>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="media-preview-container">
                      <h4 className="preview-section-title">{t('landlordListings.selectedImages', {count: previewImages.length})}</h4>
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
                            {idx === 0 && <span className="featured-image-tag">{t('landlordListings.cover')}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.tagsAmenities')}</label>
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
                  {t('landlordListings.cancel')}
                </Button>
                <Button variant="primary" type="submit">
                  {t('landlordListings.createListing')}
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
              <h3>{t('landlordListings.editListingTitle', {id: selectedListing?.id})}</h3>
              <button className="modal-close-btn" onClick={() => {
                setIsEditModalOpen(false);
                setSelectedListing(null);
              }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>{t('landlordListings.roomNumber')}</label>
                    <input
                      type="text"
                      placeholder="e.g. 101, A2"
                      value={formRoomNumber}
                      onChange={(e) => setformRoomNumber(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{t('landlordListings.status')}</label>
                    <div className="form-select-wrapper">
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="form-input-select"
                      >
                        <option value="available">{t('landlordListings.available')}</option>
                        <option value="occupied">{t('landlordListings.occupiedRented')}</option>
                        <option value="inactive">{t('landlordListings.inactive')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.listingTitle')}</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.propertyDescription')}</label>
                  <textarea
                    placeholder={t('landlordListings.descPlaceholder')}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.fullAddress')}</label>
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
                    <label>{t('landlordListings.monthlyRent')}</label>
                    <input
                      type="text"
                      required
                      value={formPrice}
                      className={priceError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormPrice(val);
                        if (val !== '' && !/^\d+$/.test(val)) {
                          setPriceError(t('landlordListings.priceError'));
                        } else if (val !== '' && Number(val) <= 0) {
                          setPriceError(t('landlordListings.priceGt0'));
                        } else {
                          setPriceError('');
                        }
                      }}
                    />
                    {priceError && <div className="invalid-feedback d-block">{priceError}</div>}
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>{t('landlordListings.maxOccupants')}</label>
                    <input
                      type="text"
                      value={formMaxOccupants}
                      className={occupantsError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormMaxOccupants(val);
                        if (val !== '' && !/^\d+$/.test(val)) {
                          setOccupantsError(t('landlordListings.occupantsError'));
                        } else if (val !== '' && Number(val) <= 0) {
                          setOccupantsError(t('landlordListings.occupantsGt0'));
                        } else {
                          setOccupantsError('');
                        }
                      }}
                    />
                    {occupantsError && <div className="invalid-feedback d-block">{occupantsError}</div>}
                  </div>
                </div>

                <div className="form-group-row">

                  <div className="form-group">
                    <label>{t('landlordListings.sizeSqm')} (m<sup>2</sup>)</label>
                    <input
                      type="text"
                      value={formAreaSqm}
                      className={areaError ? 'is-invalid' : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormAreaSqm(val);
                        if (val !== '' && !/^\d+(\.\d+)?$/.test(val)) {
                          setAreaError(t('landlordListings.areaError'));
                        } else if (val !== '' && Number(val) <= 0) {
                          setAreaError(t('landlordListings.areaGt0'));
                        } else {
                          setAreaError('');
                        }
                      }}
                    />
                    {areaError && <div className="invalid-feedback d-block">{areaError}</div>}
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('landlordListings.updateImages')}</label>
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
                        <span className="bold-instruction-text">{t('landlordListings.clickToUploadNew')}</span>
                      </div>
                      <span className="upload-limit-info">{t('landlordListings.uploadLimit')}</span>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="media-preview-container">
                      <h4 className="preview-section-title">{t('landlordListings.newImages', {count: previewImages.length})}</h4>
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
                    <label>{t('landlordListings.roomFacilities')}</label>
                    <input
                      type="text"
                      disabled
                      className="disabled-input"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('landlordListings.nearbyFacilities')}</label>
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
                  {t('landlordListings.cancel')}
                </Button>
                <Button variant="primary" type="submit" disabled={!!priceError || !!occupantsError || !!areaError}>
                  {t('landlordListings.saveChanges')}
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
              <h3>{t('landlordListings.performance')} {selectedListing.title}</h3>
              <button className="modal-close-btn" onClick={() => {
                setIsPerfModalOpen(false);
                setSelectedListing(null);
              }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p className="perf-id-sub">{t('landlordListings.listingId')} {selectedListing.id} • {selectedListing.address}</p>

              <div className="perf-stats-grid">
                <div className="perf-stat-box">
                  <div className="perf-stat-icon-wrapper blue">
                    <Eye size={20} />
                  </div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">{t('landlordListings.pageViews')}</span>
                    <span className="perf-stat-val">{selectedListing.performance.views}</span>
                  </div>
                </div>

                <div className="perf-stat-box">
                  <div className="perf-stat-icon-wrapper green">
                    <Calendar size={20} />
                  </div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">{t('landlordListings.leasingInquiries')}</span>
                    <span className="perf-stat-val">{selectedListing.performance.inquiries}</span>
                  </div>
                </div>

                <div className="perf-stat-box">
                  <div className="perf-stat-icon-wrapper purple">
                    <DollarSign size={20} />
                  </div>
                  <div className="perf-stat-info">
                    <span className="perf-stat-label">{t('landlordListings.monthlyRevenue')}</span>
                    <span className="perf-stat-val">{selectedListing.performance.revenue.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>
              </div>

              {/* Graphic chart illustration */}
              <div className="perf-chart-box">
                <h4>{t('landlordListings.inquiryTrend')}</h4>
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
                  <span>{t('landlordListings.mon')}</span>
                  <span>{t('landlordListings.tue')}</span>
                  <span>{t('landlordListings.wed')}</span>
                  <span>{t('landlordListings.thu')}</span>
                  <span>{t('landlordListings.fri')}</span>
                  <span>{t('landlordListings.sat')}</span>
                  <span>{t('landlordListings.sun')}</span>
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

