import React, { useState } from 'react';
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
  Image as ImageIcon,
  DollarSign,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import './AddNewPropertyPage.css';

const AddNewPropertyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    type: '',
    rent: '',
    description: '',
    // Step 2: Location
    address: '',
    city: '',
    district: '',
    zip: '',
    // Step 3: Amenities (boolean toggles)
    wifi: false,
    ac: false,
    parking: false,
    gym: false,
    kitchen: false,
    security: false,
    bathroom: false,
    balcony: false,
    // Step 4: Images
    images: []
  });

  const [formErrors, setFormErrors] = useState({});

  // Amenities mock list
  const amenitiesList = [
    { id: 'wifi', label: 'Wi-Fi Internet', icon: <Wifi size={18} /> },
    { id: 'ac', label: 'Air Conditioning', icon: <Sparkles size={18} /> },
    { id: 'parking', label: 'Free Parking', icon: <Layers size={18} /> },
    { id: 'kitchen', label: 'Full Kitchen', icon: <FileText size={18} /> },
    { id: 'security', label: '24/7 Security', icon: <Shield size={18} /> },
    { id: 'bathroom', label: 'Private Bathroom', icon: <Info size={18} /> },
    { id: 'balcony', label: 'Balcony / Terrace', icon: <MapPin size={18} /> },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmenityToggle = (id) => {
    setFormData(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Step Validation
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.title.trim()) errors.title = 'Property Title is required';
      if (!formData.type) errors.type = 'Property Type is required';
      if (!formData.rent || Number(formData.rent) <= 0) errors.rent = 'Please enter a valid monthly rent';
    } else if (step === 2) {
      if (!formData.address.trim()) errors.address = 'Street Address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.district.trim()) errors.district = 'District/Ward is required';
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

  const handlePublish = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(ROUTES.LANDLORD.LISTINGS);
  };

  return (
    <div className="add-property-container" id="add-property-page">
      
      {/* Back button */}
      <button 
        className="add-property-back-link"
        onClick={() => navigate(ROUTES.LANDLORD.LISTINGS)}
      >
        <ArrowLeft size={16} />
        <span>Back to Listings</span>
      </button>

      <h1 className="add-property-main-title">Add New Property</h1>

      {/* Stepper Wizard Indicator */}
      <div className="property-stepper-box">
        {[
          { step: 1, label: 'Basic Info' },
          { step: 2, label: 'Location' },
          { step: 3, label: 'Amenities' },
          { step: 4, label: 'Images' }
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <div className={`stepper-node ${currentStep >= item.step ? 'active' : ''} ${currentStep === item.step ? 'current' : ''}`}>
              <div className="stepper-circle">
                {currentStep > item.step ? <Check size={16} /> : item.step}
              </div>
              <span className="stepper-label">{item.label}</span>
            </div>
            {index < 3 && (
              <div className={`stepper-connector-line ${currentStep > item.step ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Form Content Card */}
      <div className="property-form-card">
        
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Basic Information</h2>
              <p className="form-step-subtitle">Provide the primary details for your rental property.</p>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Property Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input-text ${formErrors.title ? 'error' : ''}`}
                placeholder="e.g., Modern Loft in Downtown" 
              />
              {formErrors.title && <span className="form-field-error-msg">{formErrors.title}</span>}
            </div>

            <div className="form-row-double-cols">
              <div className="form-group-field">
                <label className="form-input-label">Property Type *</label>
                <div className="form-select-wrapper">
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.type ? 'error' : ''}`}
                  >
                    <option value="">Select Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Room">Private Room</option>
                    <option value="Studio">Studio Apartment</option>
                    <option value="Loft">Loft</option>
                    <option value="House">House</option>
                  </select>
                </div>
                {formErrors.type && <span className="form-field-error-msg">{formErrors.type}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">Monthly Rent ($) *</label>
                <div className="form-input-currency-wrapper">
                  <span className="currency-prefix-symbol">$</span>
                  <input 
                    type="number" 
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    className={`form-input-text form-input-currency ${formErrors.rent ? 'error' : ''}`}
                    placeholder="1200" 
                  />
                </div>
                {formErrors.rent && <span className="form-field-error-msg">{formErrors.rent}</span>}
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Property Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea-field"
                rows={5}
                placeholder="Describe the key features, neighborhood, and vibe of the property..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Location Info */}
        {currentStep === 2 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Location Details</h2>
              <p className="form-step-subtitle">Specify where your rental property is situated.</p>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Street Address *</label>
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
                <label className="form-input-label">City *</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.city ? 'error' : ''}`}
                  placeholder="e.g., Da Nang" 
                />
                {formErrors.city && <span className="form-field-error-msg">{formErrors.city}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">District / Ward *</label>
                <input 
                  type="text" 
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.district ? 'error' : ''}`}
                  placeholder="e.g., Ngu Hanh Son" 
                />
                {formErrors.district && <span className="form-field-error-msg">{formErrors.district}</span>}
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">Postal / ZIP Code</label>
              <input 
                type="text" 
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="form-input-text"
                placeholder="e.g., 550000" 
              />
            </div>
          </div>
        )}

        {/* Step 3: Amenities Select */}
        {currentStep === 3 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Amenities & Utilities</h2>
              <p className="form-step-subtitle">Select the key features and services included in the property.</p>
            </div>

            <div className="amenities-selection-grid">
              {amenitiesList.map(amenity => (
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
        )}

        {/* Step 4: Image Drag & Drop Upload */}
        {currentStep === 4 && (
          <div className="form-step-content animation-fade-in">
            <div className="form-step-header">
              <h2 className="form-step-title">Property Media</h2>
              <p className="form-step-subtitle">Upload high-quality images of your property to attract tenants.</p>
            </div>

            {/* Drag and Drop Container */}
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

            {/* Previews grid */}
            {formData.images.length > 0 && (
              <div className="media-preview-container">
                <h4 className="preview-section-title">Uploaded Images ({formData.images.length})</h4>
                <div className="media-previews-grid">
                  {formData.images.map((src, idx) => (
                    <div className="preview-image-card" key={idx}>
                      <img src={src} alt={`Property Upload ${idx}`} />
                      <button 
                        type="button" 
                        className="remove-preview-image-btn"
                        onClick={() => removeImage(idx)}
                      >
                        <X size={14} />
                      </button>
                      {idx === 0 && <span className="featured-image-tag">Cover Photo</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              Save as Draft
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-wizard-back"
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {currentStep < 4 ? (
            <Button variant="primary" onClick={handleNext}>
              <span>Continue</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handlePublish}
              isLoading={isSubmitting}
            >
              <span>Publish Property</span>
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
            <h2 className="success-modal-title">Property Published!</h2>
            <p className="success-modal-message">
              Your new listing has been successfully published and is now visible to potential tenants.
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
