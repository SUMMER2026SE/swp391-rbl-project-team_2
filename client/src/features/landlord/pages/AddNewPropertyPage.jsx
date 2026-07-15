import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import GoogleMapPicker from '../../../components/common/GoogleMapPicker';
import useAuthStore from '../../../store/useAuthStore';
import './AddNewPropertyPage.css';

// Helper to normalize strings for accent-insensitive search in Vietnamese
const normalizeString = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d");
};

// Helper to remove administrative noise words for robust matching
const cleanAdministrativeNoise = (str) => {
  if (!str) return '';
  return normalizeString(str)
    .replace(/\b(quan|huyen|thanh pho|tp|phuong|xa|thi xa|thi tran|ward|district|city|town|commune|province)\b/g, '')
    .trim();
};

const AddNewPropertyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Block unverified landlords from posting rooms (Real-time check)
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await landlordService.getProfile();
        const profileData = response.data || response;
        const status = profileData.verificationStatus || profileData.verification_status;
        
        // Sync to Zustand store to keep global state updated
        updateUser({
          verificationStatus: status,
          verification_status: status,
        });

        if (status !== 'verified') {
          toast.error('Tài khoản của bạn chưa được xác thực. Vui lòng hoàn tất xác thực thông tin cá nhân (CCCD) để có quyền đăng tin phòng.');
          navigate(ROUTES.LANDLORD.PROFILE || '/landlord/profile');
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Failed to verify landlord status:', err);
        navigate(ROUTES.LANDLORD.PROFILE || '/landlord/profile');
      }
    };

    checkVerification();
  }, [navigate, updateUser]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [propertyInherited, setPropertyInherited] = useState(false);
  const propertyIdParam = searchParams.get('propertyId');
  const pendingDistrictRef = useRef(null);
  const [existingRooms, setExistingRooms] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    roomNumber: '',
    description: '',
    size: '',
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
    images: [],
    latitude: null,
    longitude: null,
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
    if (propertyIdParam) {
      landlordService.getPropertyDetails(propertyIdParam)
        .then(res => {
          const property = res.data?.property || res.data;
          if (property) {
            if (property.district) {
              pendingDistrictRef.current = property.district;
            }
            setFormData(prev => ({
              ...prev,
              address: property.address || prev.address,
              city: property.city || prev.city,
              district: property.district || prev.district,
            }));
            setExistingRooms(property.rooms || []);
            setPropertyInherited(true);
          }
        })
        .catch(err => console.error("Error fetching property details", err));
    }
  }, [propertyIdParam]);

  useEffect(() => {
    let selectedProv = provincesList.find(p => p.full_name === formData.city);
    
    // Normalize and match city if exact match fails
    if (!selectedProv && formData.city && provincesList.length > 0) {
      const normCity = normalizeString(formData.city);
      selectedProv = provincesList.find(p => 
        normalizeString(p.full_name).includes(normCity) || 
        normCity.includes(normalizeString(p.full_name))
      );
      if (selectedProv) {
        setFormData(prev => ({ ...prev, city: selectedProv.full_name }));
        return;
      }
    }

    if (selectedProv) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProv.id}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) {
            setDistrictsList(data.data);
            
            // Asynchronously match the pending district after city loads its districts
            let matchedDistName = '';
            
            // 1. Try matching using pendingDistrictRef
            if (pendingDistrictRef.current) {
              const cleanPending = cleanAdministrativeNoise(pendingDistrictRef.current);
              if (cleanPending) {
                const matchedDist = data.data.find(d => {
                  const cleanDbDist = cleanAdministrativeNoise(d.full_name);
                  return cleanDbDist.includes(cleanPending) || cleanPending.includes(cleanDbDist);
                });
                if (matchedDist) {
                  matchedDistName = matchedDist.full_name;
                }
              }
            }
            
            // 2. Fallback: Try extracting/matching from the address string
            if (!matchedDistName && formData.address) {
              const normAddress = normalizeString(formData.address);
              // Sort districts by length descending to match longer names first
              const sortedDistricts = [...data.data].sort((a, b) => b.full_name.length - a.full_name.length);
              
              const matchedDist = sortedDistricts.find(d => {
                const cleanDbDist = cleanAdministrativeNoise(d.full_name);
                return cleanDbDist && normAddress.includes(cleanDbDist);
              });
              
              if (matchedDist) {
                matchedDistName = matchedDist.full_name;
              }
            }
            
            if (matchedDistName) {
              setFormData(prev => ({ ...prev, district: matchedDistName }));
              if (formErrors.district) setFormErrors(prev => ({ ...prev, district: null }));
            }
            pendingDistrictRef.current = null;
          }
        })
        .catch(err => console.error("Error fetching districts", err));
    } else {
      setDistrictsList([]);
    }
  }, [formData.city, provincesList]);

  // Room Amenities
  const roomAmenitiesList = [
    { id: 'wifi', label: t('amenity.wifi', 'WiFi'), icon: <Wifi size={18} />, dbType: 'utility' },
    { id: 'airConditioner', label: t('amenity.airConditioner', 'Air Conditioner'), icon: <Sparkles size={18} />, dbType: 'appliance' },
    { id: 'parking', label: t('amenity.parking', 'Parking'), icon: <Layers size={18} />, dbType: 'utility' },
    { id: 'privateBathroom', label: t('amenity.privateBathroom', 'Private Bathroom'), icon: <Info size={18} />, dbType: 'utility' },
    { id: 'balcony', label: t('amenity.balcony', 'Balcony'), icon: <MapPin size={18} />, dbType: 'utility' },
    { id: 'bed', label: t('amenity.bed', 'Bed'), icon: <FileText size={18} />, dbType: 'furniture' },
    { id: 'wardrobe', label: t('amenity.wardrobe', 'Wardrobe'), icon: <Layers size={18} />, dbType: 'furniture' },
    { id: 'kitchen', label: t('amenity.kitchen', 'Kitchen'), icon: <FileText size={18} />, dbType: 'utility' },
    { id: 'securityCamera', label: t('amenity.securityCamera', 'Security Camera'), icon: <Shield size={18} />, dbType: 'security' },
  ];

  // Nearby Amenities
  const nearbyAmenitiesList = [
    { id: 'nearUniversity', label: t('amenity.nearUniversity', 'Near University'), icon: <MapPin size={18} />, dbType: 'education' },
    { id: 'nearHospital', label: t('amenity.nearHospital', 'Near Hospital'), icon: <MapPin size={18} />, dbType: 'hospital' },
    { id: 'nearSupermarket', label: t('amenity.nearSupermarket', 'Near Supermarket'), icon: <MapPin size={18} />, dbType: 'shopping' },
    { id: 'nearBusStation', label: t('amenity.nearBusStation', 'Near Bus Station'), icon: <MapPin size={18} />, dbType: 'transport' },
    { id: 'nearMarket', label: t('amenity.nearMarket', 'Near Market'), icon: <MapPin size={18} />, dbType: 'shopping' },
    { id: 'nearPark', label: t('amenity.nearPark', 'Near Park'), icon: <MapPin size={18} />, dbType: 'recreation' },
    { id: 'nearConvenienceStore', label: t('amenity.nearConvenienceStore', 'Near Convenience Store'), icon: <MapPin size={18} />, dbType: 'shopping' },
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
    } else if (name === 'roomNumber') {
      const trimmed = value.toString().trim().toLowerCase();
      const duplicate = existingRooms.some(r => {
        if (!r.roomNumber) return false;
        const existingStr = r.roomNumber.toString().trim().toLowerCase();
        const cleanExisting = existingStr.replace(/phòng|phong/g, '').trim();
        const cleanInput = trimmed.replace(/phòng|phong/g, '').trim();
        return cleanExisting === cleanInput || existingStr === trimmed;
      });
      if (duplicate) {
        setFormErrors(prev => ({ ...prev, roomNumber: 'Room is already exist' }));
      } else {
        setFormErrors(prev => ({ ...prev, roomNumber: null }));
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
      if (formData.size && Number(formData.size) <= 0) errors.size = 'Size must be a positive number';
      if (!formData.maxOccupants) errors.maxOccupants = 'Please select max occupants';
      if (formData.roomNumber && formData.roomNumber.trim()) {
        const trimmed = formData.roomNumber.trim().toLowerCase();
        const duplicate = existingRooms.some(r => {
          if (!r.roomNumber) return false;
          const existingStr = r.roomNumber.toString().trim().toLowerCase();
          const cleanExisting = existingStr.replace(/phòng|phong/g, '').trim();
          const cleanInput = trimmed.replace(/phòng|phong/g, '').trim();
          return cleanExisting === cleanInput || existingStr === trimmed;
        });
        if (duplicate) {
          errors.roomNumber = 'Room is already exist';
        }
      }
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
      let roomType = 'private_room';

      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('address', formData.address);
      fd.append('city', formData.city);
      fd.append('district', formData.district);
      fd.append('pricePerMonth', Number(formData.rent));
      fd.append('areaSqm', Number(formData.size) || 0);
      fd.append('roomType', roomType);
      fd.append('maxOccupants', parseInt(formData.maxOccupants) || 4);

      const propertyId = searchParams.get('propertyId');
      const floor = searchParams.get('floor');
      
      if (propertyId) fd.append('propertyId', propertyId);
      if (floor) fd.append('floor', floor);
      if (formData.roomNumber) fd.append('roomNumber', formData.roomNumber);
      if (formData.latitude) fd.append('latitude', formData.latitude);
      if (formData.longitude) fd.append('longitude', formData.longitude);

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
      toast.error(err.response?.data?.message || err.message || 'Failed to publish listing');
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate(ROUTES.LANDLORD.LISTINGS);
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem', color: '#4f46e5' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontWeight: '600' }}>Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  return (
    <div className="add-property-container" id="add-property-page">

      {/* Header Section */}
      <div className="add-property-header">
        <h1 className="add-property-main-title">{t('addNewProperty.mainTitle', 'Add New Listing')}</h1>
        <p className="add-property-subtitle">{t('addNewProperty.mainSubtitle', 'Provide detailed information to attract the right tenants.')}</p>
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
              <h2 className="form-step-title">{t('addNewProperty.step1Title', 'Basic Information')}</h2>
              <p className="form-step-subtitle">{t('addNewProperty.step1Subtitle', 'Start with the essential details of the property.')}</p>
            </div>

            <div className="form-row-double-cols">
              <div className="form-group-field">
                <label className="form-input-label">{t('addNewProperty.listingTitle', 'Listing Title')} <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.title ? 'error' : ''}`}
                  placeholder={t('addNewProperty.listingTitlePlaceholder', 'e.g. Spacious Studio in Downtown')}
                />
                {formErrors.title && <span className="form-field-error-msg">{formErrors.title}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">{t('addNewProperty.roomNumber', 'Room Number')}</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.roomNumber ? 'error' : ''}`}
                  placeholder={t('addNewProperty.roomNumberPlaceholder', 'e.g. 101, A2')}
                />
                {formErrors.roomNumber && <span className="form-field-error-msg">{formErrors.roomNumber}</span>}
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">{t('addNewProperty.propertyDescription', 'Property Description')} <span className="text-danger">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea-field ${formErrors.description ? 'error' : ''}`}
                rows={5}
                placeholder={t('addNewProperty.propertyDescriptionPlaceholder', "Describe the property's key features, atmosphere, and neighborhood...")}
              />
              {formErrors.description && <span className="form-field-error-msg">{formErrors.description}</span>}
            </div>

            <div className="form-row-double-cols">
              <div className="form-group-field">
                <label className="form-input-label">{t('addNewProperty.size', 'Size')} (m<sup>2</sup>)</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.size ? 'error' : ''}`}
                  placeholder={t('addNewProperty.sizePlaceholder', 'e.g. 25')}
                  min="0"
                />
                {formErrors.size && <span className="form-field-error-msg">{formErrors.size}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">{t('addNewProperty.maxOccupants', 'Max Occupants')} <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="maxOccupants"
                    value={formData.maxOccupants}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.maxOccupants ? 'error' : ''}`}
                  >
                    <option value="">{t('addNewProperty.selectMaxOccupants', 'Select Max Occupants')}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
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
              <h2 className="form-step-title">{t('addNewProperty.step2Title', 'Location & Price')}</h2>
              <p className="form-step-subtitle">{t('addNewProperty.step2Subtitle', 'Specify where your rental is situated and set your pricing.')}</p>
              {propertyInherited && (
                <div className="inherited-property-banner" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  <span>{t('addNewProperty.inheritedAddress', 'The address is automatically inherited from the parent property.')}</span>
                </div>
              )}
            </div>

            <div className="form-group-field">
              <label className="form-input-label">{t('addNewProperty.streetAddress', 'Street Address')} <span className="text-danger">*</span></label>
              {propertyInherited ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`form-input-text ${formErrors.address ? 'error' : ''} disabled-input`}
                  placeholder={t('addNewProperty.streetAddressPlaceholder', 'e.g., 123 Nguyen Van Linh St')}
                  disabled={true}
                  style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
                />
              ) : (
                <GoogleMapPicker
                  address={formData.address}
                  onAddressChange={(val) => {
                    setFormData(prev => ({ ...prev, address: val }));
                    if (formErrors.address) setFormErrors(prev => ({ ...prev, address: null }));
                  }}
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                   onLocationChange={({ lat, lng, address: addr, city: rawCity, district: rawDistrict }) => {
                    let matchedCityName = '';
                    let matchedDistrictName = '';
                    
                    if (rawCity) {
                      const normCityInput = normalizeString(rawCity);
                      const matchedProv = provincesList.find(p => 
                        normalizeString(p.full_name).includes(normCityInput) || 
                        normCityInput.includes(normalizeString(p.full_name))
                      );
                      if (matchedProv) {
                        matchedCityName = matchedProv.full_name;
                        if (rawDistrict) {
                          if (formData.city === matchedCityName && districtsList.length > 0) {
                            const cleanInput = cleanAdministrativeNoise(rawDistrict);
                            const matchedDist = districtsList.find(d => {
                              const cleanDb = cleanAdministrativeNoise(d.full_name);
                              return cleanDb.includes(cleanInput) || cleanInput.includes(cleanDb);
                            });
                            if (matchedDist) {
                              matchedDistrictName = matchedDist.full_name;
                            }
                          } else {
                            pendingDistrictRef.current = rawDistrict;
                          }
                        }
                      }
                    }

                    setFormData(prev => ({
                      ...prev,
                      address: addr,
                      latitude: lat,
                      longitude: lng,
                      ...(matchedCityName ? { city: matchedCityName } : {}),
                      ...(matchedDistrictName ? { district: matchedDistrictName } : (matchedCityName && formData.city !== matchedCityName ? { district: '' } : {}))
                    }));
                    
                    if (formErrors.address) setFormErrors(prev => ({ ...prev, address: null }));
                    if (matchedCityName && formErrors.city) setFormErrors(prev => ({ ...prev, city: null }));
                  }}
                  placeholder={t('addNewProperty.streetAddressPlaceholder', 'e.g., 123 Nguyen Van Linh St')}
                  className={formErrors.address ? 'error' : ''}
                  height="280px"
                  inputId="room-address-input"
                />
              )}
              {formErrors.address && <span className="form-field-error-msg">{formErrors.address}</span>}
            </div>

            <div className="form-row-double-cols">
              <div className="form-group-field">
                <label className="form-input-label">{t('addNewProperty.cityProvince', 'City/ Province')} <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.city ? 'error' : ''}`}
                    disabled={propertyInherited}
                    style={propertyInherited ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}}
                  >
                    <option value="">{t('addNewProperty.selectCityProvince', 'Select City / Province')}</option>
                    {provincesList.map((city, index) => (
                      <option key={index} value={city.full_name}>{city.full_name}</option>
                    ))}
                  </select>
                </div>
                {formErrors.city && <span className="form-field-error-msg">{formErrors.city}</span>}
              </div>

              <div className="form-group-field">
                <label className="form-input-label">{t('addNewProperty.districtWard', 'District / Ward')} <span className="text-danger">*</span></label>
                <div className="form-select-wrapper">
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`form-input-select ${formErrors.district ? 'error' : ''}`}
                    disabled={propertyInherited || !formData.city || districtsList.length === 0}
                    style={propertyInherited ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}}
                  >
                    <option value="">{t('addNewProperty.selectDistrictWard', 'Select District / Ward')}</option>
                    {districtsList.map((district, index) => (
                      <option key={index} value={district.full_name}>{district.full_name}</option>
                    ))}
                  </select>
                </div>
                {formErrors.district && <span className="form-field-error-msg">{formErrors.district}</span>}
              </div>
            </div>

            <div className="form-group-field">
              <label className="form-input-label">{t('addNewProperty.monthlyRent', 'Monthly Rent (VNĐ)')} <span className="text-danger">*</span></label>
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
              <h2 className="form-step-title">{t('addNewProperty.step3Title', 'Amenities & Photos')}</h2>
              <p className="form-step-subtitle">{t('addNewProperty.step3Subtitle', 'Select features and upload high-quality images of your property.')}</p>
            </div>

            <div className="form-group-field" style={{ marginBottom: '2rem' }}>
              <label className="form-input-label">{t('addNewProperty.roomAmenities', 'Room Amenities')}</label>
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
              <label className="form-input-label">{t('addNewProperty.nearbyAmenities', 'Nearby Amenities')}</label>
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
              <label className="form-input-label">{t('addNewProperty.propertyPhotos', 'Property Photos')}</label>
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
                    <span className="bold-instruction-text">{t('addNewProperty.clickToUpload', 'Click to upload')}</span> or drag and drop
                  </div>
                  <span className="upload-limit-info">{t('addNewProperty.uploadLimitInfo', 'PNG, JPG, JPEG up to 10MB')}</span>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="media-preview-container">
                  <h4 className="preview-section-title">{t('addNewProperty.uploadedImages', 'Uploaded Images')} ({formData.images.length})</h4>
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
                        {idx === 0 && <span className="featured-image-tag">{t('addNewProperty.cover', 'Cover')}</span>}
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
              <span>{t('addNewProperty.nextStep', 'Next Step')}</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handlePublish}
              isLoading={isSubmitting}
            >
              <span>{t('addNewProperty.publishListing', 'Publish Listing')}</span>
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
            <h2 className="success-modal-title">{t('addNewProperty.successTitle', 'Listing Published!')}</h2>
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
