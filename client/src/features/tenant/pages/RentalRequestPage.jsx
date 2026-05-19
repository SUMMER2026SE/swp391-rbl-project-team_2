import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, ShieldCheck, Wifi, Waves, Dumbbell, Lock } from 'lucide-react';
import './RentalRequestPage.css';

const MOCK_PROPERTY = {
  id: 1,
  title: 'Premium Corner Suite',
  location: '1240 Tech Corridor, Suite 4B, San Francisco',
  price: 3200,
  imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
  specs: [
    { icon: <Wifi size={14} />, text: 'High-Speed Wi-Fi' },
    { icon: <Waves size={14} />, text: 'In-unit Washer' },
    { icon: <Dumbbell size={14} />, text: 'Gym Access' }
  ]
};

const RentalRequestPage = () => {
  const navigate = useNavigate();
  // const { id } = useParams(); // For when we switch to dynamic route
  const property = MOCK_PROPERTY;

  const [formData, setFormData] = useState({
    moveInDate: '',
    occupants: '1 Adult',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      alert("Please agree to the Terms of Service to continue.");
      return;
    }
    console.log("Submitting Request:", formData);
    // Simulate API call and redirect
    alert("Rental request submitted successfully!");
    navigate('/tenant/requests'); // Or back to room detail
  };

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
                <img src={property.imageUrl} alt={property.title} />
              </div>
              
              <div className="property-details">
                <h2 className="property-title">{property.title}</h2>
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
                
                <hr className="divider" />
                
                <div className="property-price-section">
                  <span className="price-label">MONTHLY RENT</span>
                  <div className="price-value">
                    <span className="amount">${property.price.toLocaleString()}</span>
                    <span className="period"> / mo</span>
                  </div>
                </div>
                
                <div className="property-specs">
                  {property.specs.map((spec, index) => (
                    <div key={index} className="spec-badge">
                      {spec.icon}
                      <span>{spec.text}</span>
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
                <p>This property is managed by a SmartBoard certified partner. Your security deposit is protected through our platform.</p>
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
                    <label htmlFor="moveInDate">Desired Move-in Date</label>
                    <input 
                      type="date" 
                      id="moveInDate"
                      name="moveInDate" 
                      value={formData.moveInDate}
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
