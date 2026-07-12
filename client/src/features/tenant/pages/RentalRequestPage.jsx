import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, Wifi, Waves, Dumbbell, Lock } from 'lucide-react';
import axios from 'axios';
import { rentalRequestService } from '../services/rentalRequestService';
import { useTranslation } from 'react-i18next';
import './RentalRequestPage.css';

const RentalRequestPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const roomId = searchParams.get('roomId');
  const initialMoveIn = searchParams.get('moveIn') || '';
  const initialMoveOut = searchParams.get('moveOut') || '';
  const initialGuests = searchParams.get('guests') || '1 Adult';

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_URL}/listings/${roomId}`);
        if (res.data?.success) {
          setProperty(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch room details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const [formData, setFormData] = useState({
    moveInDate: initialMoveIn,
    moveOutDate: initialMoveOut,
    occupants: initialGuests,
    message: '',
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      toast.error(t('rentalRequest.errorTerms', "Please agree to the Terms of Service to continue."));
      return;
    }
    
    try {
      const response = await rentalRequestService.createRequest({
        roomId: parseInt(roomId, 10),
        message: formData.message,
        requestedMoveInDate: formData.moveInDate,
        requestedMoveOutDate: formData.moveOutDate,
      });

      if (response.success) {
        toast.success(t('rentalRequest.success', "Rental request submitted successfully!"));
        navigate('/tenant/requests');
      }
    } catch (err) {
      toast.error(t('rentalRequest.errorSubmit', 'Failed to submit request: ') + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!property) return <div className="p-8 text-center text-red-500">Property not found</div>;

  const imageUrl = property.images?.length > 0 
    ? (property.images[0].image_url && property.images[0].image_url.startsWith('http') ? property.images[0].image_url : `http://localhost:5000${property.images[0].image_url}`)
    : (property.thumbnailUrl ? (property.thumbnailUrl && property.thumbnailUrl.startsWith('http') ? property.thumbnailUrl : `http://localhost:5000${property.thumbnailUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60');


  return (
    <div className="rental-request-page">
      <div className="container">
        
        <div className="request-header">
          <h1>{t('rentalRequest.title', 'Review & Submit Request')}</h1>
          <p>{t('rentalRequest.subtitle', 'Almost there! Confirm your details to send your application to the landlord.')}</p>
        </div>

        <div className="request-content">
          
          {/* Left Column: Property Summary */}
          <div className="request-left">
            <div className="property-summary-card">
              <div className="property-image-wrapper">
                <img src={imageUrl} alt={property.title} />
              </div>
              
              <div className="property-details">
                <h2 className="property-title">{property.title}</h2>
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.address}</span>
                </div>
                
                <hr className="divider" />
                
                <div className="property-price-section">
                  <span className="price-label">{t('rentalRequest.monthlyRent', 'MONTHLY RENT')}</span>
                  <div className="price-value">
                    <span className="amount">{property.pricePerMonth?.toLocaleString()} đ</span>
                    <span className="period">{t('rentalRequest.perMonth', ' / mo')}</span>
                  </div>
                </div>
                
                <div className="property-specs">
                  {property.facilities?.map((spec, index) => (
                    <div key={index} className="spec-badge">
                      <ShieldCheck size={14} />
                      <span>{spec.facility_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="trust-badge-card">
              <div className="trust-icon">
                <ShieldCheck size={24} />
              </div>
              <div className="trust-content">
                <h3>{t('rentalRequest.landlordVerified', 'Landlord Verified')}</h3>
                <p>{t('rentalRequest.landlordVerifiedDesc', 'This property is managed by a RentWise certified partner. Your security deposit is protected through our platform.')}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="request-right">
            <div className="application-form-card">
              <h2 className="form-title">{t('rentalRequest.applicationDetails', 'Application Details')}</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('rentalRequest.moveInDate', 'Move-in Date')}</label>
                    <input 
                      type="date" 
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('rentalRequest.moveOutDate', 'Move-out Date')}</label>
                    <input 
                      type="date" 
                      name="moveOutDate"
                      value={formData.moveOutDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="occupants">{t('rentalRequest.occupants', 'Number of Occupants')}</label>
                    <select 
                      id="occupants"
                      name="occupants" 
                      value={formData.occupants}
                      onChange={handleChange}
                    >
                      <option value="1 Adult">{t('rentalRequest.adult1', '1 Adult')}</option>
                      <option value="2 Adults">{t('rentalRequest.adult2', '2 Adults')}</option>
                      <option value="1 Adult, 1 Child">{t('rentalRequest.adult1child1', '1 Adult, 1 Child')}</option>
                      <option value="Family">{t('rentalRequest.family', 'Family')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('rentalRequest.message', 'Message to Landlord')}</label>
                  <textarea 
                    id="message"
                    name="message"
                    placeholder={t('rentalRequest.messagePlaceholder', 'Briefly introduce yourself and mention any specific requirements or questions you might have...')}
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    maxLength={500}
                  ></textarea>
                  <div className="char-count">
                    {formData.message.length} / 500 {t('rentalRequest.characters', 'characters')}
                  </div>
                </div>

                <div className="form-checkbox">
                  <input 
                    type="checkbox" 
                    id="agreeToTerms" 
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="agreeToTerms">
                    {t('rentalRequest.agreeTerms', 'I agree to the Terms of Service and acknowledge the Privacy Policy. I understand that submitting this request does not guarantee a lease agreement.')}
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-submit-request">
                  {t('rentalRequest.sendRequest', 'Send Rental Request')}
                </button>
                
                <div className="security-notice">
                  <Lock size={14} />
                  <span>{t('rentalRequest.securityNotice', 'Your personal information is secure and encrypted.')}</span>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RentalRequestPage;
