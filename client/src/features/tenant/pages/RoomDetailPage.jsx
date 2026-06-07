import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Star, Share2, Heart, Wifi, Snowflake, Key, 
  Coffee, Compass, Dumbbell, Grid, ChevronDown, ChevronLeft, MessageSquare, CheckCircle 
} from 'lucide-react';
import { favoriteService } from '../services/favoriteService';
import { rentalRequestService } from '../services/rentalRequestService';
import { ROUTES } from '../../../constants';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  
  // Booking Card States
  const [bookingMode, setBookingMode] = useState('viewing'); // 'viewing' | 'renting'
  const [viewingDate, setViewingDate] = useState('');
  const [moveIn, setMoveIn] = useState('');
  const [moveOut, setMoveOut] = useState('');
  const [guests, setGuests] = useState('1 Adult');

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
        if (response.data.success) {
          setRoomData(response.data.data);
        }
        
        // Fetch favorite status if logged in
        if (getToken()) {
          const isFav = await favoriteService.checkFavoriteStatus(id);
          setIsFavorite(isFav);
        }
      } catch (err) {
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const getToken = () => {
    try {
      const authStorage = JSON.parse(sessionStorage.getItem('auth-storage'));
      return authStorage?.state?.token || null;
    } catch { return null; }
  };

  const handleBookingRequest = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      if (bookingMode === 'viewing') {
        if (!viewingDate) {
          alert('Please select a viewing date.');
          return;
        }
        if (viewingDate < todayDate) {
          alert('Viewing date must be today or a future date.');
          return;
        }

        const response = await rentalRequestService.createRequest({
          roomId: parseInt(id, 10),
          message: `Viewing request for ${viewingDate} at 10:00. Requested from room detail page.`,
          requestedMoveInDate: viewingDate,
        });
        if (response.success) {
          alert('Viewing request sent!');
        }
      } else {
        // renting mode
        if (!moveIn) {
          alert('Please select a move in date.');
          return;
        }
        if (!moveOut) {
          alert('Please select a move out date.');
          return;
        }
        if (moveIn < todayDate) {
          alert('Move in date must be today or a future date.');
          return;
        }
        if (moveOut <= moveIn) {
          alert('Move out date must be after Move in date.');
          return;
        }

        // Validate 1 month minimum
        const mIn = new Date(moveIn);
        const mOut = new Date(moveOut);
        
        // Add 1 month to move in date
        const minMoveOut = new Date(mIn);
        minMoveOut.setMonth(minMoveOut.getMonth() + 1);

        // Reset times to compare dates properly
        minMoveOut.setHours(0, 0, 0, 0);
        mOut.setHours(0, 0, 0, 0);

        if (mOut < minMoveOut) {
          alert('Minimum rental duration is 1 month. Please select a valid move out date.');
          return;
        }

        navigate(`${ROUTES.TENANT.RENTAL_REQUEST}?roomId=${id}&moveIn=${moveIn}&moveOut=${moveOut}&guests=${encodeURIComponent(guests)}`);
      }
    } catch (err) {
      alert('Failed to send request. ' + (err.response?.data?.message || err.message));
    }
  };

  const handleChatWithLandlord = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      // First, get or create conversation
      const landlordId = roomData.landlordId ?? roomData.landlord?.user_id;
      if (!landlordId) {
        alert('Failed to start chat. Landlord information is unavailable.');
        return;
      }
      const response = await axios.post('http://localhost:5000/api/chat/conversations', {
        participantId: landlordId,
        roomId: roomData.roomId ?? parseInt(id, 10),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const convId = response.data.data.conversationId;
        navigate(`/messages?conversationId=${convId}`);
      }
    } catch (err) {
      alert('Failed to start chat. ' + (err.response?.data?.message || ''));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !roomData) return <div className="p-8 text-center text-red-500">{error || 'Listing not found'}</div>;

  const images = roomData.images?.length > 0 
    ? roomData.images.map(img => `http://localhost:5000${img.image_url}`)
    : (roomData.thumbnailUrl ? [`http://localhost:5000${roomData.thumbnailUrl}`] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60']);
    
  // Ensure we have at least 5 images for the grid
  while (images.length < 5) {
    images.push(images[0]);
  }

  return (
    <div className="room-detail-page container pt-20">
      {/* Back button for convenient navigation */}
      <button className="back-btn" onClick={() => navigate('/listings')}>
        <ChevronLeft size={16} />
        <span>Back to Explore</span>
      </button>

      {/* Gallery Section */}
      <section className="detail-gallery">
        <div className="gallery-main">
          <img src={images[0]} alt="Main space" />
        </div>
        <div className="gallery-grid">
          <div className="gallery-item"><img src={images[1]} alt="Bedroom" /></div>
          <div className="gallery-item"><img src={images[2]} alt="Kitchen" /></div>
          <div className="gallery-item"><img src={images[3]} alt="Bathroom" /></div>
          <div className="gallery-item relative">
            <img src={images[4]} alt="Lounge" />
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
                  onClick={toggleFavorite}
                  title="Save"
                >
                  <Heart size={18} fill={isFavorite ? "#EF4444" : "none"} />
                </button>
              </div>
            </div>
            
            <div className="location-row">
              <MapPin size={16} className="location-icon" />
              <span>{roomData.address}</span>
            </div>

            <div className="meta-specs-row">
              <span className="rating-span">
                <Star size={14} className="star-icon" />
                <strong>5.0</strong> (12 reviews)
              </span>
              <span className="spec-dot">•</span>
              <span>1 Bedroom</span>
              <span className="spec-dot">•</span>
              <span>{roomData.areaSqm || 0} sqm</span>
            </div>
          </div>

          <hr className="section-divider" />

          {/* Host Card Section */}
          <section className="host-card">
            <div className="host-info">
              <img src={roomData.landlord?.avatar_url ? (roomData.landlord.avatar_url.startsWith('http') ? roomData.landlord.avatar_url : `http://localhost:5000${roomData.landlord.avatar_url}`) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} alt={roomData.landlord?.full_name || 'Landlord'} className="host-avatar" />
              <div className="host-text">
                <h3>Managed by {roomData.landlord?.full_name || 'Landlord'}</h3>
                <p>Phone: {roomData.landlord?.phone || 'N/A'}</p>
              </div>
            </div>
            <button className="contact-host-btn flex items-center justify-center gap-2" onClick={handleChatWithLandlord}>
              <MessageSquare size={16} /> [Chat with Landlord]
            </button>
          </section>

          <hr className="section-divider" />

          {/* About Section */}
          <section className="about-section">
            <h2>About this space</h2>
            <div className={`about-text ${showMoreAbout ? 'expanded' : ''}`}>
              <p>{roomData.description}</p>
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
              {roomData.facilities?.map((amenity, idx) => {
                return (
                  <div className="amenity-item" key={idx}>
                    <CheckCircle size={20} className="amenity-icon" />
                    <span>{amenity.facility_name}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Side: Booking Card */}
        <aside className="detail-sidebar">
          <div className="booking-card">
            <div className="booking-mode-tabs">
              <button 
                className={`booking-tab ${bookingMode === 'viewing' ? 'active' : ''}`}
                onClick={() => setBookingMode('viewing')}
              >
                View Room
              </button>
              <button 
                className={`booking-tab ${bookingMode === 'renting' ? 'active' : ''}`}
                onClick={() => setBookingMode('renting')}
              >
                Rent Room
              </button>
            </div>

            <div className="booking-price-row mt-4">
              <span className="booking-price">${roomData.pricePerMonth?.toLocaleString() || 0}</span>
              <span className="booking-period">/ month</span>
            </div>

            {bookingMode === 'viewing' ? (
              <div className="booking-form-box">
                <div className="date-fields-row">
                  <div className="date-field" style={{ width: '100%' }}>
                    <label>VIEWING DATE</label>
                    <input 
                      type="date" 
                      value={viewingDate} 
                      min={todayDate}
                      onChange={(e) => setViewingDate(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="booking-form-box">
                <div className="date-fields-row">
                  <div className="date-field">
                    <label>MOVE IN</label>
                    <input 
                      type="date" 
                      value={moveIn} 
                      min={todayDate}
                      onChange={(e) => setMoveIn(e.target.value)} 
                    />
                  </div>
                  <div className="date-field border-left">
                    <label>MOVE OUT</label>
                    <input 
                      type="date" 
                      value={moveOut} 
                      min={moveIn || todayDate}
                      onChange={(e) => setMoveOut(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="guests-field">
                  <label>GUESTS</label>
                  <div className="guests-dropdown" style={{ position: 'relative' }}>
                    <select 
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', appearance: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: '0.25rem 0' }}
                    >
                      <option value="1 Adult">1 Adult</option>
                      <option value="2 Adults">2 Adults</option>
                      <option value="1 Adult, 1 Child">1 Adult, 1 Child</option>
                      <option value="2 Adults, 1 Child">2 Adults, 1 Child</option>
                      <option value="3+ Guests">3+ Guests</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button className="send-request-btn" onClick={handleBookingRequest}>
                {bookingMode === 'viewing' ? '[Request Viewing]' : '[Request Rent / Deposit]'}
              </button>
            </div>
            
            <p className="booking-disclaimer">You won't be charged yet</p>

            <hr className="booking-divider" />

            <div className="booking-estimate-row">
              <span>Total Monthly Estimate</span>
              <span>${roomData.pricePerMonth?.toLocaleString() || 0}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetailPage;
