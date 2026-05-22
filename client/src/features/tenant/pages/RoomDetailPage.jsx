import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Share2, Heart, Wifi, Snowflake, Key, 
  Coffee, Compass, Dumbbell, Grid, ChevronDown, ChevronLeft 
} from 'lucide-react';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  // Booking Card States
  const [moveIn, setMoveIn] = useState('2024-10-01');
  const [moveOut, setMoveOut] = useState('2025-04-01');
  const [guests, setGuests] = useState('1 Guest');

  // Hardcoded mockup data matching the Figma layout exactly
  const roomData = {
    title: 'Premium Co-living Suite with Smart Tech',
    price: 1850,
    rating: 4.92,
    reviewsCount: 128,
    location: 'Downtown Innovation District, San Francisco',
    specs: ['2 Guests', '1 Bedroom', '1 Private Bath'],
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&auto=format&fit=crop&q=80', // Main Living Room
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500&auto=format&fit=crop&q=80',  // Bedroom
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',  // Kitchen
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',  // Bathroom
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80'   // Lounge/Cinema Room
    ],
    host: {
      name: 'RentalRoom Properties',
      badge: 'Superhost',
      responseTime: 'Responds within an hour',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' // Professional Avatar
    },
    about: 'Experience seamless urban living in our premium smart suite. Designed for professionals seeking both efficiency and comfort, this space integrates cutting-edge technology with high-end design.\n\nEnjoy keyless entry, climate control via our proprietary app, and gigabit fiber internet. The suite includes a dedicated workspace, a fully equipped kitchenette, and access to premium communal areas.',
    amenities: [
      { name: 'Gigabit High-Speed Wi-Fi', icon: Wifi },
      { name: 'Dedicated Kitchenette', icon: Coffee },
      { name: 'Smart Climate Control', icon: Snowflake },
      { name: 'Ergonomic Workspace', icon: Compass },
      { name: 'Keyless Smart Entry', icon: Key },
      { name: 'On-site Gym Access', icon: Dumbbell }
    ]
  };

  const handleSendRequest = () => {
    // Navigate to payment/deposit page or display success
    navigate('/payment');
  };

  return (
    <div className="room-detail-page container">
      {/* Back button for convenient navigation */}
      <button className="back-btn" onClick={() => navigate('/rooms')}>
        <ChevronLeft size={16} />
        <span>Back to Explore</span>
      </button>

      {/* Gallery Section */}
      <section className="detail-gallery">
        <div className="gallery-main">
          <img src={roomData.images[0]} alt="Main space" />
        </div>
        <div className="gallery-grid">
          <div className="gallery-item"><img src={roomData.images[1]} alt="Bedroom" /></div>
          <div className="gallery-item"><img src={roomData.images[2]} alt="Kitchen" /></div>
          <div className="gallery-item"><img src={roomData.images[3]} alt="Bathroom" /></div>
          <div className="gallery-item relative">
            <img src={roomData.images[4]} alt="Lounge" />
            <button className="show-photos-btn">
              <Grid size={16} />
              <span>Show all photos</span>
            </button>
          </div>
        </div>
      </section>

      {/* Content Column Layout */}
      <div className="detail-layout">
        {/* Left Side: Room Details */}
        <div className="detail-content-main">
          <div className="detail-header-section">
            <div className="title-row">
              <h1>{roomData.title}</h1>
              <div className="header-actions">
                <button className="circle-action-btn" title="Share">
                  <Share2 size={18} />
                </button>
                <button 
                  className={`circle-action-btn ${isFavorite ? 'favorite-active' : ''}`} 
                  onClick={() => setIsFavorite(!isFavorite)}
                  title="Save"
                >
                  <Heart size={18} fill={isFavorite ? "#EF4444" : "none"} />
                </button>
              </div>
            </div>
            
            <div className="location-row">
              <MapPin size={16} className="location-icon" />
              <span>{roomData.location}</span>
            </div>

            <div className="meta-specs-row">
              <span className="rating-span">
                <Star size={14} className="star-icon" />
                <strong>{roomData.rating}</strong> ({roomData.reviewsCount} reviews)
              </span>
              <span className="spec-dot">•</span>
              {roomData.specs.map((spec, index) => (
                <React.Fragment key={index}>
                  <span>{spec}</span>
                  {index < roomData.specs.length - 1 && <span className="spec-dot">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <hr className="section-divider" />

          {/* Host Card Section */}
          <section className="host-card">
            <div className="host-info">
              <img src={roomData.host.avatar} alt={roomData.host.name} className="host-avatar" />
              <div className="host-text">
                <h3>Managed by {roomData.host.name}</h3>
                <p>{roomData.host.badge} • {roomData.host.responseTime}</p>
              </div>
            </div>
            <button className="contact-host-btn">Contact</button>
          </section>

          <hr className="section-divider" />

          {/* About Section */}
          <section className="about-section">
            <h2>About this space</h2>
            <div className={`about-text ${showMoreAbout ? 'expanded' : ''}`}>
              <p>{roomData.about}</p>
            </div>
            <button 
              className="show-more-link" 
              onClick={() => setShowMoreAbout(!showMoreAbout)}
            >
              {showMoreAbout ? 'Show less' : 'Show more'} <ChevronDown size={14} className={showMoreAbout ? 'rotate-180' : ''} />
            </button>
          </section>

          <hr className="section-divider" />

          {/* Amenities Section */}
          <section className="amenities-section">
            <h2>What this place offers</h2>
            <div className="amenities-grid">
              {roomData.amenities.map((amenity, idx) => {
                const IconComponent = amenity.icon;
                return (
                  <div className="amenity-item" key={idx}>
                    <IconComponent size={20} className="amenity-icon" />
                    <span>{amenity.name}</span>
                  </div>
                );
              })}
            </div>
            <button className="show-amenities-btn">Show all 32 amenities</button>
          </section>
        </div>

        {/* Right Side: Booking Card */}
        <aside className="detail-sidebar">
          <div className="booking-card">
            <div className="booking-price-row">
              <span className="booking-price">${roomData.price.toLocaleString()}</span>
              <span className="booking-period">/ month</span>
            </div>

            <div className="booking-form-box">
              <div className="date-fields-row">
                <div className="date-field">
                  <label>MOVE IN</label>
                  <input 
                    type="date" 
                    value={moveIn} 
                    onChange={(e) => setMoveIn(e.target.value)} 
                  />
                </div>
                <div className="date-field border-left">
                  <label>MOVE OUT</label>
                  <input 
                    type="date" 
                    value={moveOut} 
                    onChange={(e) => setMoveOut(e.target.value)} 
                  />
                </div>
              </div>
              <div className="guests-field">
                <label>GUESTS</label>
                <div className="guests-dropdown">
                  <span>{guests}</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <button className="send-request-btn" onClick={handleSendRequest}>
              Send Request
            </button>
            
            <p className="booking-disclaimer">You won't be charged yet</p>

            <hr className="booking-divider" />

            <div className="booking-estimate-row">
              <span>Total Monthly Estimate</span>
              <span>${roomData.price.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailPage;
