import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  Building, 
  User, 
  Megaphone, 
  Lock, 
  TrendingUp, 
  Check, 
  Calendar, 
  ShieldCheck, 
  Coins,
  MapPin,
  DollarSign,
  Home as HomeIcon,
  Grid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Zap,
  Thermometer,
  VolumeX,
  Droplets,
  TreePine
} from 'lucide-react';
import { ROUTES } from '../constants';
import Button from '../components/common/Button';
import useAuthStore from '../store/useAuthStore';
import './HomePage.css';

import downtownImg from '../assets/images/downtown.png';
import techDistrictImg from '../assets/images/tech-district.png';
import authHeroImg from '../assets/images/auth-room-hero.png';
import hanoiImg from '../assets/images/hanoi.png';
import hcmImg from '../assets/images/hcm.png';
import danangImg from '../assets/images/danang.png';
import canthoImg from '../assets/images/cantho.png';
import haiphongImg from '../assets/images/haiphong.png';
import { roomService } from '../features/tenant/services/roomService';
import PropertyCard from '../features/tenant/components/PropertyCard';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [priceRange, setPriceRange] = useState('-');
  const [facilities, setFacilities] = useState([]);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showNearbyFacilities, setShowNearbyFacilities] = useState(false);
  
  const [newRooms, setNewRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchNewRooms = async () => {
      try {
        setLoadingRooms(true);
        const response = await roomService.searchProperties({ limit: 8, sort: 'newest' });
        const mappedProperties = response.data.map(prop => ({
          id: prop.id,
          title: prop.title,
          address: prop.address,
          district: prop.district,
          city: prop.city,
          thumbnailUrl: prop.thumbnailUrl ? (prop.thumbnailUrl.startsWith('http') ? prop.thumbnailUrl : `http://localhost:5000${prop.thumbnailUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
          minPrice: prop.minPrice,
          maxPrice: prop.maxPrice,
          totalRooms: prop.totalRooms,
          availableRooms: prop.availableRooms,
        }));
        setNewRooms(mappedProperties);
      } catch (err) {
        console.error("Error fetching new rooms", err);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchNewRooms();
  }, []);

  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const facilitiesRef = useRef(null);
  const nearbyRef = useRef(null);

  const roomFacilitiesList = [
    'WiFi', 'Air Conditioner', 'Parking', 'Private Bathroom', 
    'Balcony', 'Bed', 'Wardrobe', 'Kitchen', 'Security Camera'
  ];

  const nearbyFacilitiesList = [
    'Near University', 'Near Hospital', 'Near Supermarket', 
    'Near Bus Station', 'Near Market', 'Near Park', 'Near Convenience Store'
  ];

  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvincesList(data.data);
      })
      .catch(err => console.error("Error fetching provinces", err));
  }, []);

  useEffect(() => {
    const selectedProv = provincesList.find(p => p.full_name === city);
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
  }, [city, provincesList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (facilitiesRef.current && !facilitiesRef.current.contains(event.target)) {
        setShowFacilities(false);
      }
      if (nearbyRef.current && !nearbyRef.current.contains(event.target)) {
        setShowNearbyFacilities(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = () => {
    let params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);
    if (district) params.append('district', district);
    if (priceRange && priceRange !== '-') {
      const [min, max] = priceRange.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }
    if (facilities.length > 0) params.append('facilities', facilities.join(','));
    if (nearbyFacilities.length > 0) params.append('nearbyFacilities', nearbyFacilities.join(','));
    
    navigate(`${ROUTES.ROOMS}?${params.toString()}`);
  };

  // Redirect role-specific users
  useEffect(() => {
    if (isAuthenticated && user?.role === 'LANDLORD') {
      navigate('/landlord/dashboard', { replace: true });
    } else if (isAuthenticated && user?.role === 'ADMIN') {
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="home-page">
      {/* Background Decorators */}
      <div className="bg-glow-blur bg-glow-primary"></div>
      <div className="bg-glow-blur bg-glow-secondary"></div>

      {/* Advanced Hero Search Section */}
      <section className="hero-search-section">
        {/* Background Image & Overlay */}
        <div className="hero-search-bg" style={{ backgroundImage: "url('/src/assets/images/auth-room-hero.png')" }}>
          <div className="hero-search-overlay"></div>
          
       
        
        </div>

        <div className="container hero-search-content">
          <h1 className="hero-search-title">
            Tìm phòng trọ ưng ý <br />
            <span style={{ color: '#2563EB' }}>nhanh chóng, dễ dàng</span>
          </h1>
          <p className="hero-search-subtitle">
            Tìm kiếm nhanh · Lọc thông minh · Không mất phí môi giới
          </p>

          <div className="search-widget-glass">
             {/* Text Search */}
             <div className="search-top-row">
               <Search className="search-icon-blue" size={24} color="#2563EB" />
               <input 
                 type="text" 
                 placeholder="Bạn muốn tìm phòng ở đâu?" 
                 className="search-input-main" 
                 value={keyword}
                 onChange={(e) => setKeyword(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') handleSearchSubmit();
                 }}
               />
             </div>
             
             {/* Filters */}
             <div className="search-bottom-row">
               <div className="filter-select-wrapper">
                 <MapPin className="filter-icon" size={18} color="#2563EB" />
                 <select className="filter-select" value={city} onChange={e => { setCity(e.target.value); setDistrict(''); }}>
                   <option value="">Tỉnh / Thành</option>
                   {provincesList.map((prov, index) => (
                     <option key={index} value={prov.full_name}>{prov.full_name}</option>
                   ))}
                 </select>
               </div>
               
               <div className="filter-select-wrapper">
                 <MapPin className="filter-icon" size={18} color="#2563EB" />
                 <select className="filter-select" value={district} onChange={e => setDistrict(e.target.value)} disabled={!city || districtsList.length === 0}>
                   <option value="">Quận / Huyện</option>
                   {districtsList.map((dist, index) => (
                     <option key={index} value={dist.full_name}>{dist.full_name}</option>
                   ))}
                 </select>
               </div>

               <div className="filter-select-wrapper">
                 <DollarSign className="filter-icon" size={18} color="#2563EB" />
                 <select className="filter-select" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                    <option value="-">Mọi mức giá</option>
                    <option value="0-1000000">&lt; 1 triệu VNĐ</option>
                    <option value="1000000-2000000">1 - 2 triệu VNĐ</option>
                    <option value="2000000-3000000">2 - 3 triệu VNĐ</option>
                    <option value="3000000-4000000">3 - 4 triệu VNĐ</option>
                    <option value="4000000-5000000">4 - 5 triệu VNĐ</option>
                    <option value="5000000-">&gt; 5 triệu VNĐ</option>
                 </select>
               </div>

               <div className="filter-dropdown-wrapper" ref={facilitiesRef}>
                 <div className="filter-dropdown-btn" onClick={() => setShowFacilities(!showFacilities)}>
                   <Grid className="filter-icon" size={18} color="#2563EB" />
                   <span className="dropdown-label">Tiện ích {facilities.length > 0 && `(${facilities.length})`}</span>
                   <ChevronDown className="dropdown-icon" size={16} />
                 </div>
                 {showFacilities && (
                   <div className="facilities-dropdown-menu">
                     {roomFacilitiesList.map(f => (
                       <label key={f} className="facility-checkbox-label">
                         <input 
                           type="checkbox" 
                           checked={facilities.includes(f)} 
                           onChange={(e) => {
                             if(e.target.checked) setFacilities([...facilities, f]);
                             else setFacilities(facilities.filter(x => x !== f));
                           }}
                         />
                         {f}
                       </label>
                     ))}
                   </div>
                 )}
               </div>

               <div className="filter-dropdown-wrapper" ref={nearbyRef}>
                 <div className="filter-dropdown-btn" onClick={() => setShowNearbyFacilities(!showNearbyFacilities)}>
                   <TreePine className="filter-icon" size={18} color="#2563EB" />
                   <span className="dropdown-label">Lân cận {nearbyFacilities.length > 0 && `(${nearbyFacilities.length})`}</span>
                   <ChevronDown className="dropdown-icon" size={16} />
                 </div>
                 {showNearbyFacilities && (
                   <div className="facilities-dropdown-menu">
                     {nearbyFacilitiesList.map(f => (
                       <label key={f} className="facility-checkbox-label">
                         <input 
                           type="checkbox" 
                           checked={nearbyFacilities.includes(f)} 
                           onChange={(e) => {
                             if(e.target.checked) setNearbyFacilities([...nearbyFacilities, f]);
                             else setNearbyFacilities(nearbyFacilities.filter(x => x !== f));
                           }}
                         />
                         {f}
                       </label>
                     ))}
                   </div>
                 )}
               </div>

               <button className="search-submit-btn" onClick={handleSearchSubmit}>
                 <Search size={20} /> Tìm Kiếm
               </button>
             </div>
          </div>

          <div className="amenities-carousel">
             <button className="carousel-arrow" onClick={() => {
                const container = document.getElementById('amenities-scroll');
                if(container) container.scrollBy({ left: -200, behavior: 'smooth' });
             }}>
               <ChevronLeft size={18} />
             </button>
             <div className="amenities-tags" id="amenities-scroll" style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[
                  "WiFi", "Air Conditioner", "Parking", "Private Bathroom", "Balcony",
                  "Bed", "Wardrobe", "Kitchen", "Security Camera", "Near University",
                  "Near Hospital", "Near Supermarket", "Near Bus Station", "Near Market",
                  "Near Park", "Near Convenience Store"
                ].map((amenity, idx) => {
                  const paramKey = amenity.startsWith('Near') ? 'nearbyFacilities' : 'facilities';
                  return (
                    <span 
                      key={idx} 
                      className="amenity-tag" 
                      onClick={() => navigate(`${ROUTES.ROOMS}?${paramKey}=${encodeURIComponent(amenity)}`)}
                    >
                      {amenity}
                    </span>
                  );
                })}
             </div>
             <button className="carousel-arrow" onClick={() => {
                const container = document.getElementById('amenities-scroll');
                if(container) container.scrollBy({ left: 200, behavior: 'smooth' });
             }}>
               <ChevronRight size={18} />
             </button>
          </div>
          

        </div>
      </section>

      {/* Trending Locations Section */}
      <section className="trending-locations-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Địa điểm nổi bật</h2>
            <p>Khám phá các phòng trọ tại các thành phố lớn</p>
          </div>
          
          <div className="locations-carousel-wrapper">
            <button className="location-arrow left" onClick={() => {
              const container = document.getElementById('locations-scroll');
              if(container) container.scrollBy({ left: -300, behavior: 'smooth' });
            }}>
              <ChevronLeft size={24} />
            </button>

            <div className="locations-scroll-container" id="locations-scroll">
              {[
                { name: 'Hà Nội', param: 'Thành phố Hà Nội', image: hanoiImg },
                { name: 'Hồ Chí Minh', param: 'Thành phố Hồ Chí Minh', image: hcmImg },
                { name: 'Đà Nẵng', param: 'Thành phố Đà Nẵng', image: danangImg },
                { name: 'Cần Thơ', param: 'Thành phố Cần Thơ', image: canthoImg },
                { name: 'Hải Phòng', param: 'Thành phố Hải Phòng', image: haiphongImg },
              ].map((city, idx) => (
                <div 
                  key={idx} 
                  className="location-card"
                  onClick={() => navigate(`${ROUTES.ROOMS}?city=${encodeURIComponent(city.param)}`)}
                >
                  <img src={city.image} alt={city.name} className="location-image" />
                  <div className="location-overlay">
                    <h3 className="location-name">{city.name}</h3>
                  </div>
                </div>
              ))}
            </div>

            <button className="location-arrow right" onClick={() => {
              const container = document.getElementById('locations-scroll');
              if(container) container.scrollBy({ left: 300, behavior: 'smooth' });
            }}>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* New Room Listings Section */}
      <section className="new-rooms-section">
        <div className="container">
          <div className="section-header text-center mb-10">
            <h2>New Room Listings</h2>
            <p>Discover the latest properties added to our platform</p>
          </div>
          
          {loadingRooms ? (
            <div className="loading-state py-12 text-center text-gray-500">Loading new rooms...</div>
          ) : newRooms.length > 0 ? (
            <div className="new-rooms-grid">
              {newRooms.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="empty-state py-12 text-center text-gray-500">No new rooms available right now.</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
            <button 
              className="view-all-btn-bottom" 
              onClick={() => navigate(ROUTES.ROOMS)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              View All Rooms <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>How It Works</h2>
            <p>Find your perfect room in 3 simple steps</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-decor-line"></div>
              <div className="step-number">1</div>
              <div className="step-icon-inner bg-indigo-light text-indigo">
                <Search size={24} />
              </div>
              <h3>Search & Filter</h3>
              <p>Tell our AI what you need or use our advanced filters to browse verified listings.</p>
            </div>
            <div className="step-card">
              <div className="step-decor-line"></div>
              <div className="step-number">2</div>
              <div className="step-icon-inner bg-amber-light text-amber">
                <Calendar size={24} />
              </div>
              <h3>Schedule a Viewing</h3>
              <p>Book a time to see the room in person completely for free.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-inner bg-green-light text-green">
                <Check size={24} />
              </div>
              <h3>Move In</h3>
              <p>Sign the contract, pay the rent, and move into your new home with peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Why Choose Us</h2>
            <p>We make renting easier and safer for everyone.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <Sparkles size={24} className="benefit-icon" />
              </div>
              <h4>AI-Powered Matching</h4>
              <p>Our smart system finds the best rooms that fit your lifestyle and budget instantly.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <ShieldCheck size={24} className="benefit-icon" />
              </div>
              <h4>Verified Landlords</h4>
              <p>Every landlord is vetted to ensure you have a safe and reliable renting experience.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <Coins size={24} className="benefit-icon" />
              </div>
              <h4>Transparent Pricing</h4>
              <p>No hidden fees. What you see is what you pay. Protect your deposits with our secure platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to find your next home?</h2>
            <p>Join thousands of users who have already found their perfect space.</p>
            <div className="cta-buttons">
              <Button variant="primary" size="large" onClick={() => navigate(ROUTES.ROOMS)} className="btn-cta-primary">
                Browse Rooms Now
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" size="large" onClick={() => navigate('/register')} className="btn-cta-outline">
                  Sign Up for Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
