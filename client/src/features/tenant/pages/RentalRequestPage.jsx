import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MapPin, ShieldCheck, Wifi, Waves, Dumbbell, Lock } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { rentalRequestService } from '../services/rentalRequestService';
import './RentalRequestPage.css';

const RentalRequestPage = () => {
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
      toast.error("Please agree to the Terms of Service to continue.");
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
        toast.success("Rental request submitted successfully!");
        navigate('/tenant/requests');
      }
    } catch (err) {
      toast.error('Failed to submit request: ' + (err.response?.data?.message || err.message));
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
          <h1>Review & Submit Request</h1>
          <p>Almost there! Confirm your details to send your application to the landlord.</p>
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
                  <span className="price-label">MONTHLY RENT</span>
                  <div className="price-value">
                    <span className="amount">{property.pricePerMonth?.toLocaleString()} đ</span>
                    <span className="period"> / mo</span>
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
                <h3>Landlord Verified</h3>
                <p>This property is managed by a RentalRoom certified partner. Your security deposit is protected through our platform.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="request-right">
            <div className="application-form-card">
              <h2 className="form-title">Application Details</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Move-in Date</label>
                    <input 
                      type="date" 
                      name="moveInDate"
                      value={formData.moveInDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Move-out Date</label>
                    <input 
                      type="date" 
                      name="moveOutDate"
                      value={formData.moveOutDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="occupants">Number of Occupants</label>
                    <select 
                      id="occupants"
                      name="occupants" 
                      value={formData.occupants}
                      onChange={handleChange}
                    >
                      <option value="1 Adult">1 Adult</option>
                      <option value="2 Adults">2 Adults</option>
                      <option value="1 Adult, 1 Child">1 Adult, 1 Child</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message to Landlord</label>
                  <textarea 
                    id="message"
                    name="message"
                    placeholder="Briefly introduce yourself and mention any specific requirements or questions you might have..."
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    maxLength={500}
                  ></textarea>
                  <div className="char-count">
                    {formData.message.length} / 500 characters
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
                    I agree to the <a href="#">Terms of Service</a> and acknowledge the <a href="#">Privacy Policy</a>. I understand that submitting this request does not guarantee a lease agreement.
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-submit-request">
                  Send Rental Request
                </button>
                
                <div className="security-notice">
                  <Lock size={14} />
                  <span>Your personal information is secure and encrypted.</span>
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
