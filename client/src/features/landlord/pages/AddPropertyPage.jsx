import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Upload,
  Check,
  Layers,
  Shield,
  Car,
  Wifi,
  Camera,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import { landlordService } from '../services/landlordService';
import toast from 'react-hot-toast';
import GoogleMapPicker from '../../../components/common/GoogleMapPicker';
import useAuthStore from '../../../store/useAuthStore';
import './AddPropertyPage.css';

const buildingAmenities = [
  { id: 'elevator', label: 'Elevator', icon: <Layers size={14} /> },
  { id: 'security', label: 'Security Guard', icon: <Shield size={14} /> },
  { id: 'parking', label: 'Parking', icon: <Car size={14} /> },
  { id: 'cctv', label: 'CCTV', icon: <Camera size={14} /> },
  { id: 'wifi_common', label: 'Common WiFi', icon: <Wifi size={14} /> },
];

// Helper to normalize strings for accent-insensitive search in Vietnamese
const normalizeString = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d");
};

const AddPropertyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const propertyIdParam = searchParams.get('id') || searchParams.get('propertyId');
  const isEdit = !!propertyIdParam;

  // Block unverified landlords from posting properties
  useEffect(() => {
    if (user && (user.verificationStatus || user.verification_status) !== 'verified') {
      toast.error('Tài khoản của bạn chưa được xác thực. Vui lòng hoàn tất xác thực thông tin cá nhân (CCCD) để có quyền tạo căn hộ/dự án.');
      navigate(ROUTES.LANDLORD.PROFILE || '/landlord/profile');
    }
  }, [user, navigate]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const pendingDistrictRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    totalFloors: 1,
    amenities: [],
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvincesList(data.data);
      })
      .catch(err => console.error('Error fetching provinces', err));
  }, []);

  useEffect(() => {
    if (isEdit && propertyIdParam) {
      landlordService.getPropertyById(propertyIdParam)
        .then(res => {
          const property = res.data?.property || res.data;
          if (property) {
            setFormData({
              name: property.name || '',
              description: property.description || '',
              address: property.address || '',
              city: property.city || '',
              district: property.district || '',
              ward: property.ward || '',
              totalFloors: property.totalFloors || property.total_floors || 1,
              amenities: property.amenities || [],
              latitude: property.latitude || null,
              longitude: property.longitude || null,
            });
            if (property.thumbnailUrl) {
              setPreviewUrl(property.thumbnailUrl.startsWith('http') ? property.thumbnailUrl : `http://localhost:5000${property.thumbnailUrl}`);
            }
          }
        })
        .catch(err => {
          console.error("Error fetching property details", err);
          toast.error("Failed to load property details");
        });
    }
  }, [isEdit, propertyIdParam]);

  useEffect(() => {
    const selectedProv = provincesList.find(p => p.full_name === formData.city);
    if (selectedProv) {
      fetch(`https://esgoo.net/api-tinhthanh/2/${selectedProv.id}.htm`)
        .then(res => res.json())
        .then(data => {
          if (data.error === 0) {
            setDistrictsList(data.data);
            
            // Asynchronously match the pending district after city loads its districts
            if (pendingDistrictRef.current) {
              const normDistrictInput = normalizeString(pendingDistrictRef.current);
              const matchedDist = data.data.find(d => 
                normalizeString(d.full_name).includes(normDistrictInput) || 
                normDistrictInput.includes(normalizeString(d.full_name))
              );
              if (matchedDist) {
                setFormData(prev => ({ ...prev, district: matchedDist.full_name }));
              }
              pendingDistrictRef.current = null;
            }
          }
        })
        .catch(err => console.error('Error fetching districts', err));
    } else {
      setDistrictsList([]);
    }
  }, [formData.city, provincesList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'city') newData.district = '';
      return newData;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmenityToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Property name is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.city.trim()) errs.city = 'City/Province is required';
    if (!formData.totalFloors || formData.totalFloors < 1) errs.totalFloors = 'Must have at least 1 floor';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('address', formData.address);
      fd.append('city', formData.city);
      fd.append('district', formData.district);
      fd.append('ward', formData.ward);
      fd.append('totalFloors', formData.totalFloors);
      if (formData.latitude) fd.append('latitude', formData.latitude);
      if (formData.longitude) fd.append('longitude', formData.longitude);

      if (selectedFile) {
        fd.append('image', selectedFile);
      }

      if (isEdit) {
        await landlordService.updateProperty(propertyIdParam, fd);
        toast.success('Property updated successfully!');
        navigate(`/landlord/properties/${propertyIdParam}/dashboard`);
      } else {
        const result = await landlordService.createProperty(fd);
        const newPropertyId = result?.data?.propertyId;
        toast.success('Property created successfully!');
        if (newPropertyId) {
          navigate(`/landlord/properties/${newPropertyId}/dashboard`);
        } else {
          navigate(ROUTES.LANDLORD.PROPERTIES);
        }
      }
    } catch (error) {
      toast.error(error.message || (isEdit ? 'Failed to update property' : 'Failed to create property'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-property-page" id="add-property-page">
      {/* Header */}
      <div className="add-property-page-header">
        <button className="add-property-page-back" onClick={() => navigate(ROUTES.LANDLORD.PROPERTIES)}>
          <ArrowLeft size={16} />{t('addProperty.backToProperties', 'Back to Properties')}</button>
        <h1>{isEdit ? t('addProperty.editProperty', 'Cập nhật căn hộ') : t('addProperty.addNewProperty', 'Add New Property')}</h1>
        <p>{isEdit ? t('addProperty.editPropertySubtitle', 'Chỉnh sửa thông tin căn hộ, tòa nhà của bạn.') : t('addProperty.createANewBuildingOr', 'Create a new building or house to start managing rooms.')}</p>
      </div>

      {/* Form */}
      <div className="add-property-form-card">
        {/* Basic Info */}
        <div className="add-property-form-section">
          <h3 className="add-property-section-title">
            <Building2 size={18} />{t('addProperty.basicInformation', 'Basic Information')}</h3>

          <div className="ap-form-group">
            <label className="ap-form-label">{t('addProperty.propertyName', 'Property Name')}<span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              className={`ap-form-input ${errors.name ? 'error' : ''}`}
              placeholder={t('addProperty.egNhTrBnhMinhPlaceholder', 'e.g. Nhà trọ Bình Minh, Chung cư mini A...')}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="ap-form-error">{errors.name}</span>}
          </div>

          <div className="ap-form-group">
            <label className="ap-form-label">{t('addProperty.description', 'Description')}</label>
            <textarea
              name="description"
              className="ap-form-textarea"
              placeholder={t('addProperty.describeYourPropertyPlaceholder', 'Describe your property...')}
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="ap-form-group">
            <label className="ap-form-label">{t('addProperty.numberOfFloors', 'Number of Floors')}<span className="required">*</span>
            </label>
            <input
              type="number"
              name="totalFloors"
              className={`ap-form-input ${errors.totalFloors ? 'error' : ''}`}
              min="1"
              max="50"
              value={formData.totalFloors}
              onChange={handleChange}
            />
            {errors.totalFloors && <span className="ap-form-error">{errors.totalFloors}</span>}
          </div>
        </div>

        {/* Location */}
        <div className="add-property-form-section">
          <h3 className="add-property-section-title">
            <MapPin size={18} />{t('addProperty.location', 'Location')}</h3>

          <div className="ap-form-group">
            <label className="ap-form-label">{t('addProperty.streetAddress', 'Street Address')}<span className="required">*</span>
            </label>
            <GoogleMapPicker
              address={formData.address}
              onAddressChange={(val) => {
                setFormData(prev => ({ ...prev, address: val }));
                if (errors.address) setErrors(prev => ({ ...prev, address: null }));
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
                        const normDistrictInput = normalizeString(rawDistrict);
                        const matchedDist = districtsList.find(d => 
                          normalizeString(d.full_name).includes(normDistrictInput) || 
                          normDistrictInput.includes(normalizeString(d.full_name))
                        );
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
                
                if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                if (matchedCityName && errors.city) setErrors(prev => ({ ...prev, city: null }));
              }}
              placeholder={t('addProperty.eg123NguyenVanLinhPlaceholder', 'e.g. 123 Nguyen Van Linh St')}
              className={errors.address ? 'error' : ''}
              height="280px"
              inputId="property-address-input"
            />
            {errors.address && <span className="ap-form-error">{errors.address}</span>}
          </div>

          <div className="ap-form-row">
            <div className="ap-form-group">
              <label className="ap-form-label">{t('addProperty.cityProvince', 'City / Province')}<span className="required">*</span>
              </label>
              <select
                name="city"
                className={`ap-form-select ${errors.city ? 'error' : ''}`}
                value={formData.city}
                onChange={handleChange}
              >
                <option value="">{t('addProperty.selectCityProvince', 'Select City / Province')}</option>
                {provincesList.map((city, idx) => (
                  <option key={idx} value={city.full_name}>{city.full_name}</option>
                ))}
              </select>
              {errors.city && <span className="ap-form-error">{errors.city}</span>}
            </div>

            <div className="ap-form-group">
              <label className="ap-form-label">{t('addProperty.districtWard', 'District / Ward')}</label>
              <select
                name="district"
                className="ap-form-select"
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.city || districtsList.length === 0}
              >
                <option value="">{t('addProperty.selectDistrict', 'Select District')}</option>
                {districtsList.map((d, idx) => (
                  <option key={idx} value={d.full_name}>{d.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Building Amenities */}
        <div className="add-property-form-section">
          <h3 className="add-property-section-title">
            <Shield size={18} />{t('addProperty.buildingAmenities', 'Building Amenities')}</h3>
          <div className="ap-amenity-chips">
            {buildingAmenities.map(amenity => (
              <div
                key={amenity.id}
                className={`ap-amenity-chip ${formData.amenities.includes(amenity.id) ? 'selected' : ''}`}
                onClick={() => handleAmenityToggle(amenity.id)}
              >
                {amenity.icon}
                <span>{amenity.label}</span>
                {formData.amenities.includes(amenity.id) && <Check size={12} />}
              </div>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div className="add-property-form-section">
          <h3 className="add-property-section-title">
            <Upload size={18} />{t('addProperty.propertyPhoto', 'Property Photo')}</h3>

          {previewUrl ? (
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 12 }}
              />
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                style={{
                  position: 'absolute', top: 8, right: 8, background: '#ef4444', color: '#fff',
                  border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="ap-upload-zone">
              <input
                type="file"
                id="property-photo-upload"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="property-photo-upload" style={{ cursor: 'pointer' }}>
                <Upload size={32} />
                <p><span className="bold">{t('addProperty.clickToUpload', 'Click to upload')}</span>{t('addProperty.aPhotoOfYourProperty', 'a photo of your property')}</p>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ap-form-actions">
          <button className="btn-ap-cancel" onClick={() => navigate(ROUTES.LANDLORD.PROPERTIES)}>{t('addProperty.cancel', 'Cancel')}</button>
          <button
            className="btn-ap-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (
              <>
                <Check size={16} />{isEdit ? t('addProperty.saveChanges', 'Lưu thay đổi') : t('addProperty.createProperty', 'Create Property')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyPage;
