import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Check,
  MapPin,
  Wifi,
  Shield,
  FileText,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import { landlordService } from '../services/landlordService';
import './AddNewPropertyPage.css';


const AddNewPropertyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    category: '',
    size: '',
    bedrooms: '',
    maxOccupants: '',

    // Step 2: Location & Price
    address: '',
    city: '',
    district: '',
    rent: '',

    // Step 3: Amenities & Photos
    // Room Amenities
    wifi: false,
    airConditioner: false,
    parking: false,
    privateBathroom: false,
    balcony: false,
    bed: false,
    wardrobe: false,
    kitchen: false,
    securityCamera: false,

    // Nearby Amenities
    nearUniversity: false,
    nearHospital: false,
    nearSupermarket: false,
    nearBusStation: false,
    nearMarket: false,
    nearPark: false,
    nearConvenienceStore: false,
    images: []
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvincesList(data.data);
      })
      .catch(err => console.error("Error fetching provinces", err));
  }, []);

  useEffect(() => {
    const selectedProv = provincesList.find(p => p.full_name === formData.city);
    if (selectedProv) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProv.id}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) setDistrictsList(data.data);
        })
        .catch(err => console.error("Error fetching districts", err));
    } else {
      setDistrictsList([]);
    }
  }, [formData.city, provincesList]);

  // Room Amenities
  const roomAmenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi size={18} />, dbType: 'utility' },
    { id: 'airConditioner', label: 'Air Conditioner', icon: <Sparkles size={18} />, dbType: 'appliance' },
    { id: 'parking', label: 'Parking', icon: <Layers size={18} />, dbType: 'utility' },
    { id: 'privateBathroom', label: 'Private Bathroom', icon: <Info size={18} />, dbType: 'utility' },
    { id: 'balcony', label: 'Balcony', icon: <MapPin size={18} />, dbType: 'utility' },
    { id: 'bed', label: 'Bed', icon: <FileText size={18} />, dbType: 'furniture' },
    { id: 'wardrobe', label: 'Wardrobe', icon: <Layers size={18} />, dbType: 'furniture' },
    { id: 'kitchen', label: 'Kitchen', icon: <FileText size={18} />, dbType: 'utility' },
    { id: 'securityCamera', label: 'Security Camera', icon: <Shield size={18} />, dbType: 'security' },
  ];

  // Nearby Amenities
  const nearbyAmenitiesList = [
    { id: 'nearUniversity', label: 'Near University', icon: <MapPin size={18} />, dbType: 'education' },
    { id: 'nearHospital', label: 'Near Hospital', icon: <MapPin size={18} />, dbType: 'hospital' },
    { id: 'nearSupermarket', label: 'Near Supermarket', icon: <MapPin size={18} />, dbType: 'shopping' },
    { id: 'nearBusStation', label: 'Near Bus Station', icon: <MapPin size={18} />, dbType: 'transport' },
    { id: 'nearMarket', label: 'Near Market', icon: <MapPin size={18} />, dbType: 'shopping' },
    { id: 'nearPark', label: 'Near Park', icon: <MapPin size={18} />, dbType: 'recreation' },
    { id: 'nearConvenienceStore', label: 'Near Convenience Store', icon: <MapPin size={18} />, dbType: 'shopping' },
  ];

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'city') newData.district = '';
      return newData;
    });
    
    if (name === 'size' && value !== '' && Number(value) <= 0) {
      setFormErrors(prev => ({ ...prev, size: 'Size must be a positive number' }));
    } else if (name === 'rent') {
      const numericRent = Number(value);
      if (value !== '' && numericRent <= 0) {
        setFormErrors(prev => ({ ...prev, rent: 'Please enter a valid monthly rent (must be > 0)' }));
      } else if (formErrors.rent) {
        setFormErrors(prev => ({ ...prev, rent: null }));
      }
    } else if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmenityToggle = (id) => {
    setFormData(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Step Validation
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.title.trim()) errors.title = 'Listing Title is required';
      if (!formData.description.trim()) errors.description = 'Property Description is required';
      if (!formData.category) errors.category = 'Property Category is required';
      if (formData.size && Number(formData.size) <= 0) errors.size = 'Size must be a positive number';
      if (!formData.bedrooms) errors.bedrooms = 'Please select the number of bedrooms';
      if (!formData.maxOccupants) errors.maxOccupants = 'Please select max occupants';
    } else if (step === 2) {
      if (!formData.address.trim()) errors.address = 'Street Address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.district.trim()) errors.district = 'District/Ward is required';
      const rawRent = formData.rent ? Number(formData.rent) : 0;
      if (!formData.rent || rawRent <= 0) errors.rent = 'Please enter a valid monthly rent (must be > 0)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      let roomType = formData.category || 'single';

      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('address', formData.address);
      fd.append('city', formData.city);
      fd.append('district', formData.district);
      fd.append('pricePerMonth', Number(formData.rent));
      fd.append('areaSqm', Number(formData.size) || 0);
      fd.append('bedrooms', parseInt(formData.bedrooms) || 1);
      fd.append('roomType', roomType);
      fd.append('maxOccupants', parseInt(formData.maxOccupants) || 1);

      if (selectedFiles && selectedFiles.length > 0) {
        // Appending the first image as 'image' for multer upload.single('image')
        fd.append('image', selectedFiles[0]);
      }

      const result = await landlordService.createRoom(fd);
      const newRoom = result.data || result;
      const roomId = newRoom.roomId || newRoom.room_id;

      if (!roomId) {
        throw new Error('Failed to retrieve Room ID from server response.');
      }

      // If there are additional images, upload them via the legacy image uploader
      if (selectedFiles && selectedFiles.length > 1) {
        for (let i = 1; i < selectedFiles.length; i++) {
          try {
            await landlordService.uploadRoomImage(roomId, selectedFiles[i]);
          } catch (uploadErr) {
            console.error('Error uploading extra room image:', uploadErr);
          }
        }
      }

      const selectedAmenities = [];
      [...roomAmenitiesList, ...nearbyAmenitiesList].forEach(amenity => {
        if (formData[amenity.id]) {
          selectedAmenities.push({ 
            name: amenity.label, 
            type: amenity.dbType || 'other',
            category: roomAmenitiesList.some(r => r.id === amenity.id) ? 'room' : 'nearby'
          });
        }
      });

      for (const amenity of selectedAmenities) {
        try {
          await landlordService.addFacility(roomId, {
            facilityName: amenity.name,
            facilityType: amenity.type,
            category: amenity.category
          });
        } catch (facilityErr) {
          console.error('Error adding facility:', facilityErr);
        }
      }

      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.message || 'Failed to publish listing');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(ROUTES.LANDLORD.LISTINGS);
  };

  return (
    <div className="add-property-container" id="add-property-page">

      {/* Header Section */}
      <div className="add-property-header">
        <h1 className="add-property-main-title">Add New Listing</h1>
        <p className="add-property-subtitle">Provide detailed information to attract the right tenants.</p>
      </div>

      {/* Stepper Wizard Indicator (New Style) */}
      <div className="property-stepper-container">
        <div className="stepper-progress-bg">
          <div
            className="stepper-progress-fill"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
        <div className="stepper-labels">
          <div className={`step-label ${currentStep >= 1 ? 'active' : ''}`}>
            1. Basic Info
          </div>
          <div className={`step-label ${currentStep >= 2 ? 'active' : ''}`}>
            2. Location &amp; Price
          </div>
          <div className={`step-label ${currentStep >= 3 ? 'active' : ''}`}>
            3. Amenities &amp; Photos
          </div>
        </div>
      </div>

      {/* Main Form Content Card */}
      <div className="property-form-card">

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Basic Information</h2>
              <p className="form-step-subtitle">Start with the essential details of the property.</p>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Listing Title <span className="text-danger">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input-text ${formErrors.title ? 'error' : ''}`}
                placeholder="e.g. Spacious Studio in Downtown"
              />
              {formErrors.title && <span className="form-field-error-msg">{formErrors.title}</span>}
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Property Description <span className="text-danger">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea-field ${formErrors.description ? 'error' : ''}`}
                rows={5}
                placeholder="Describe the property's key features, atmosphere, and neighborhood..."
              />
              {formErrors.description && <span className="form-field-error-msg">{formErrors.description}</span>}
            </div>

            <div className="form-row-double-cols">
              <div className="form-group-field">
                <label className="form-input-label">Room Category <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.category ? 'error' : ''}`}
                  >
                    <option value="">Select Category</option>
                    <option value="single">Single Room</option>
                    <option value="double">Double Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                  </select>
                </div>
                {formErrors.category && <span className="form-field-error-msg">{formErrors.category}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">Size (m<sup>2</sup>)</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.size ? 'error' : ''}`}
                  placeholder="e.g. 25"
                  min="0"
                />
                {formErrors.size && <span className="form-field-error-msg">{formErrors.size}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">Bedrooms <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.bedrooms ? 'error' : ''}`}
                  >
                    <option value="">Select Bedrooms</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>
                {formErrors.bedrooms && <span className="form-field-error-msg">{formErrors.bedrooms}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">Max Occupants <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="maxOccupants"
                    value={formData.maxOccupants}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.maxOccupants ? 'error' : ''}`}
                  >
                    <option value="">Select Max Occupants</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>
                {formErrors.maxOccupants && <span className="form-field-error-msg">{formErrors.maxOccupants}</span>}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location & Price */}
        {currentStep === 2 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Location &amp; Price</h2>
              <p className="form-step-subtitle">Specify where your rental is situated and set your pricing.</p>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Street Address <span className="text-danger">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-input-text ${formErrors.address ? 'error' : ''}`}
                placeholder="e.g., 123 Nguyen Van Linh St"
              />
              {formErrors.address && <span className="form-field-error-msg">{formErrors.address}</span>}
            </div>

            <div className="form-row-double-cols">
              <div className="form-group-field">
                <label className="form-input-label">City/ Province <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.city ? 'error' : ''}`}
                  >
                    <option value="">Select City / Province</option>
                    {provincesList.map((city, index) => (
                      <option key={index} value={city.full_name}>{city.full_name}</option>
                    ))}
                  </select>
                </div>
                {formErrors.city && <span className="form-field-error-msg">{formErrors.city}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">District / Ward <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.district ? 'error' : ''}`}
                    disabled={!formData.city || districtsList.length === 0}
                  >
                    <option value="">Select District / Ward</option>
                    {districtsList.map((district, index) => (
                      <option key={index} value={district.full_name}>{district.full_name}</option>
                    ))}
                  </select>
                </div>
                {formErrors.district && <span className="form-field-error-msg">{formErrors.district}</span>}
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Monthly Rent (VNĐ) <span className="text-danger">*</span></label>
              <div className="form-input-currency-wrapper">
                <span className="currency-prefix-symbol">VNĐ</span>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleInputChange}
                  className={`form-input-text form-input-currency ${formErrors.rent ? 'error' : ''}`}
                  placeholder="1200000"
                />
              </div>
              {formErrors.rent && <span className="form-field-error-msg">{formErrors.rent}</span>}
            </div>
          </div>
        )}

        {/* Step 3: Amenities & Photos */}
        {currentStep === 3 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Amenities &amp; Photos</h2>
              <p className="form-step-subtitle">Select features and upload high-quality images of your property.</p>
            </div>

            <div className="form-group-field" style={{ marginBottom: '2rem' }}>
              <label className="form-input-label">Room Amenities</label>
              <div className="amenities-selection-grid">
                {roomAmenitiesList.map(amenity => (
                  <div
                    key={amenity.id}
                    className={`amenity-select-card ${formData[amenity.id] ? 'selected' : ''}`}
                    onClick={() => handleAmenityToggle(amenity.id)}
                  >
                    <div className="amenity-card-icon">
                      {amenity.icon}
                    </div>
                    <span className="amenity-card-label">{amenity.label}</span>
                    <div className="amenity-card-checkbox">
                      {formData[amenity.id] && <Check size={12} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group-field" style={{ marginBottom: '2rem' }}>
              <label className="form-input-label">Nearby Amenities</label>
              <div className="amenities-selection-grid">
                {nearbyAmenitiesList.map(amenity => (
                  <div
                    key={amenity.id}
                    className={`amenity-select-card ${formData[amenity.id] ? 'selected' : ''}`}
                    onClick={() => handleAmenityToggle(amenity.id)}
                  >
                    <div className="amenity-card-icon">
                      {amenity.icon}
                    </div>
                    <span className="amenity-card-label">{amenity.label}</span>
                    <div className="amenity-card-checkbox">
                      {formData[amenity.id] && <Check size={12} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Property Photos</label>
              <div className="media-drag-drop-zone">
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload-input" className="drag-drop-label-wrapper">
                  <div className="drag-drop-cloud-icon">
                    <Upload size={32} />
                  </div>
                  <div className="drag-drop-text-instructions">
                    <span className="bold-instruction-text">Click to upload</span> or drag and drop
                  </div>
                  <span className="upload-limit-info">PNG, JPG, JPEG up to 10MB</span>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="media-preview-container">
                  <h4 className="preview-section-title">Uploaded Images ({formData.images.length})</h4>
                  <div className="media-previews-grid">
                    {formData.images.map((src, idx) => (
                      <div className="preview-image-card" key={idx}>
                        <img src={src} alt={`Upload ${idx}`} />
                        <button
                          type="button"
                          className="remove-preview-image-btn"
                          onClick={() => removeImage(idx)}
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

          </div>
        )}

        {/* Form Footer Action Area */}
        <div className="property-form-footer">
          {currentStep === 1 ? (
            <button
              type="button"
              className="btn-draft-save"
              onClick={() => navigate(ROUTES.LANDLORD.LISTINGS)}
            >
              Save Draft
            </button>
          ) : (
            <button
              type="button"
              className="btn-draft-save"
              onClick={handleBack}
            >
              Back
            </button>
          )}

          {currentStep < 3 ? (
            <Button variant="primary" onClick={handleNext}>
              <span>Next Step</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handlePublish}
              isLoading={isSubmitting}
            >
              <span>Publish Listing</span>
              <Check size={16} />
            </Button>
          )}
        </div>

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="property-success-overlay">
          <div className="property-success-modal-card">
            <div className="success-modal-icon-circle">
              <Check size={32} />
            </div>
            <h2 className="success-modal-title">Listing Published!</h2>
            <p className="success-modal-message">
              Your new room listing has been successfully published and is now visible to potential tenants.
            </p>
            <button
              className="btn-success-modal-close"
              onClick={handleCloseSuccessModal}
            >
              Go to Listings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddNewPropertyPage;
