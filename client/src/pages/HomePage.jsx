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
import api from '../services/api';
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
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [priceRange, setPriceRange] = useState('-');
  const [facilities, setFacilities] = useState([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState('');

  const aiSuggestions = [
    "Phòng trọ dưới 3 triệu ở Quận 1 có WiFi và máy lạnh",
    "Căn hộ dịch vụ Quận Bình Thạnh có ban công, tủ lạnh",
    "Phòng trọ gần Đại học Bách Khoa chỗ để xe rộng",
    "Quy trình đặt cọc tiền phòng và ký hợp đồng như thế nào?"
  ];

  const handleSuggestionClick = (suggestionText) => {
    setKeyword(suggestionText);
  };
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

  const handleSearchSubmit = async () => {
    if (isAIMode) {
      if (!keyword.trim()) return;
      
      setLoadingAI(true);
      setAiLoadingMessage('AI đang phân tích yêu cầu...');
      
      try {
        const response = await api.post('/ai/search', { query: keyword });
        
        if (response.success) {
          if (response.isConversational) {
            setAiLoadingMessage('Đang mở trợ lý ảo trả lời...');
            // Kích hoạt sự kiện custom để chatbot hiển thị câu trả lời
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('inject-ai-message', {
                detail: { query: keyword, reply: response.reply }
              }));
              setLoadingAI(false);
            }, 800);
          } else {
            setAiLoadingMessage('Tìm thấy phòng phù hợp! Đang chuyển hướng...');
            const data = response.data || {};
            
            // Xây dựng URL parameters từ các bộ lọc trích xuất được
            let params = new URLSearchParams();
            if (data.keyword) params.append('keyword', data.keyword);
            if (data.city) params.append('city', data.city);
            if (data.district) params.append('district', data.district);
            if (data.priceMin) params.append('minPrice', data.priceMin);
            if (data.priceMax) params.append('maxPrice', data.priceMax);
            
            if (data.facilities && data.facilities.length > 0) {
              params.append('facilities', data.facilities.join(','));
            }
            if (data.nearbyFacilities && data.nearbyFacilities.length > 0) {
              params.append('nearbyFacilities', data.nearbyFacilities.join(','));
            }
            
            // Thêm aiQuery để tự động mở chatbot tại trang kết quả và tiếp tục hội thoại
            params.append('aiQuery', keyword);
            
            setTimeout(() => {
              setLoadingAI(false);
              navigate(`${ROUTES.ROOMS}?${params.toString()}`);
            }, 800);
          }
        } else {
          throw new Error('Failed to search');
        }
      } catch (err) {
        console.error("AI Search Error", err);
        setAiLoadingMessage('Có lỗi xảy ra. Đang chuyển về tìm kiếm từ khóa thường...');
        setTimeout(() => {
          setLoadingAI(false);
          // Fallback to standard keyword search
          let params = new URLSearchParams();
          params.append('keyword', keyword);
          navigate(`${ROUTES.ROOMS}?${params.toString()}`);
        }, 1200);
      }
    } else {
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
    }
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
            {t('home.heroTitle1', 'Tìm phòng trọ ưng ý')} <br />
            <span style={{ color: '#2563EB' }}>{t('home.heroTitle2', 'nhanh chóng, dễ dàng')}</span>
          </h1>
          <p className="hero-search-subtitle">
            {t('home.heroSubtitle', 'Tìm kiếm nhanh · Lọc thông minh · Không mất phí môi giới')}
          </p>

          <div className={`search-widget-glass ${isAIMode ? 'ai-active' : ''}`}>
             {/* Text Search */}
             <div className="search-top-row">
               <Search className={isAIMode ? "search-icon-pink" : "search-icon-blue"} size={24} color={isAIMode ? "#EC4899" : "#2563EB"} />
               <input 
                 type="text" 
                 placeholder={isAIMode ? t('home.searchPlaceholderAI', 'Mô tả phòng bạn muốn tìm bằng AI (ví dụ: phòng dưới 4 triệu quận 1 có điều hòa)...') : t('home.searchPlaceholder', 'Bạn muốn tìm phòng ở đâu?')} 
                 className="search-input-main" 
                 value={keyword}
                 onChange={(e) => setKeyword(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') handleSearchSubmit();
                 }}
                 disabled={loadingAI}
               />
               <button 
                 type="button" 
                 className={`ai-toggle-pill ${isAIMode ? 'active' : ''}`}
                 onClick={() => setIsAIMode(!isAIMode)}
                 disabled={loadingAI}
                 title="Chuyển chế độ tìm kiếm AI"
               >
                 <Sparkles size={16} className={isAIMode ? 'sparkle-pulse' : ''} />
                 <span>AI Mode</span>
               </button>
             </div>
             
             {/* Dynamic loading scanner overlay */}
             {loadingAI && (
               <div className="ai-loading-overlay animate-fade-in">
                 <div className="ai-loading-scanner"></div>
                 <div className="ai-loading-text flex items-center gap-2">
                   <Sparkles className="animate-spin text-pink-500" size={18} />
                   <span>{aiLoadingMessage}</span>
                 </div>
               </div>
             )}

             {/* Dynamic content under search input based on Mode */}
             {!isAIMode ? (
               /* Standard Filters Row */
               <div className="search-bottom-row">
                 <div className="filter-select-wrapper">
                   <MapPin className="filter-icon" size={18} color="#2563EB" />
                   <select className="filter-select" value={city} onChange={e => { setCity(e.target.value); setDistrict(''); }}>
                     <option value="">{t('home.province', 'Tỉnh / Thành')}</option>
                     {provincesList.map((prov, index) => (
                       <option key={index} value={prov.full_name}>{prov.full_name}</option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="filter-select-wrapper">
                   <MapPin className="filter-icon" size={18} color="#2563EB" />
                   <select className="filter-select" value={district} onChange={e => setDistrict(e.target.value)} disabled={!city || districtsList.length === 0}>
                     <option value="">{t('home.district', 'Quận / Huyện')}</option>
                     {districtsList.map((dist, index) => (
                       <option key={index} value={dist.full_name}>{dist.full_name}</option>
                     ))}
                   </select>
                 </div>

                 <div className="filter-select-wrapper">
                   <DollarSign className="filter-icon" size={18} color="#2563EB" />
                   <select className="filter-select" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
                      <option value="-">{t('home.allPrices', 'Mọi mức giá')}</option>
                      <option value="0-1000000">{t('home.price1', '< 1 triệu VNĐ')}</option>
                      <option value="1000000-2000000">{t('home.price2', '1 - 2 triệu VNĐ')}</option>
                      <option value="2000000-3000000">{t('home.price3', '2 - 3 triệu VNĐ')}</option>
                      <option value="3000000-4000000">{t('home.price4', '3 - 4 triệu VNĐ')}</option>
                      <option value="4000000-5000000">{t('home.price5', '4 - 5 triệu VNĐ')}</option>
                      <option value="5000000-">{t('home.price6', '> 5 triệu VNĐ')}</option>
                   </select>
                 </div>

                 <div className="filter-dropdown-wrapper" ref={facilitiesRef}>
                   <div className="filter-dropdown-btn" onClick={() => setShowFacilities(!showFacilities)}>
                     <Grid className="filter-icon" size={18} color="#2563EB" />
                     <span className="dropdown-label">{t('home.amenities', 'Tiện ích')} {facilities.length > 0 && `(${facilities.length})`}</span>
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
                           {t(`facilities.${f}`, f)}
                         </label>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="filter-dropdown-wrapper" ref={nearbyRef}>
                   <div className="filter-dropdown-btn" onClick={() => setShowNearbyFacilities(!showNearbyFacilities)}>
                     <TreePine className="filter-icon" size={18} color="#2563EB" />
                     <span className="dropdown-label">{t('home.nearby', 'Lân cận')} {nearbyFacilities.length > 0 && `(${nearbyFacilities.length})`}</span>
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
                           {t(`facilities.${f}`, f)}
                         </label>
                       ))}
                     </div>
                   )}
                 </div>

                 <button className="search-submit-btn" onClick={handleSearchSubmit}>
                   <Search size={20} /> {t('home.searchBtn', 'Tìm Kiếm')}
                 </button>
               </div>
             ) : (
               /* AI Suggestions & Submit Row */
               <div className="ai-suggestions-row animate-fade-in flex flex-col gap-4">
                 <div className="ai-suggestions-content">
                   <div className="ai-suggestions-title flex items-center gap-1.5 mb-2">
                     <Sparkles size={14} color="#EC4899" />
                     <span>Gợi ý câu lệnh AI:</span>
                   </div>
                   <div className="ai-suggestions-list">
                     {aiSuggestions.map((s, idx) => (
                       <button
                         key={idx}
                         type="button"
                         className="ai-suggestion-tag"
                         onClick={() => handleSuggestionClick(s)}
                         disabled={loadingAI}
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                 </div>
                 <div className="ai-search-submit-row flex justify-end">
                   <button 
                     className="ai-search-submit-btn flex items-center gap-1.5" 
                     onClick={handleSearchSubmit}
                     disabled={loadingAI}
                   >
                     <Sparkles size={18} className={loadingAI ? 'animate-spin' : ''} />
                     <span>Tìm bằng AI</span>
                   </button>
                 </div>
               </div>
             )}
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
                      {t(`facilities.${amenity}`, amenity)}
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
            <h2>{t('home.trendingTitle', 'Địa điểm nổi bật')}</h2>
            <p>{t('home.trendingSubtitle', 'Khám phá các phòng trọ tại các thành phố lớn')}</p>
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
            <h2>{t('home.newRoomsTitle', 'New Room Listings')}</h2>
            <p>{t('home.newRoomsSubtitle', 'Discover the latest properties added to our platform')}</p>
          </div>
          
          {loadingRooms ? (
            <div className="loading-state py-12 text-center text-gray-500">{t('home.loadingRooms', 'Loading new rooms...')}</div>
          ) : newRooms.length > 0 ? (
            <div className="new-rooms-grid">
              {newRooms.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="empty-state py-12 text-center text-gray-500">{t('home.noNewRooms', 'No new rooms available right now.')}</div>
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
              {t('home.viewAllRooms', 'View All Rooms')} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>{t('home.howItWorksTitle', 'How It Works')}</h2>
            <p>{t('home.howItWorksSubtitle', 'Find your perfect room in 3 simple steps')}</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-decor-line"></div>
              <div className="step-number">1</div>
              <div className="step-icon-inner bg-indigo-light text-indigo">
                <Search size={24} />
              </div>
              <h3>{t('home.step1Title', 'Search & Filter')}</h3>
              <p>{t('home.step1Desc', 'Tell our AI what you need or use our advanced filters to browse verified listings.')}</p>
            </div>
            <div className="step-card">
              <div className="step-decor-line"></div>
              <div className="step-number">2</div>
              <div className="step-icon-inner bg-amber-light text-amber">
                <Calendar size={24} />
              </div>
              <h3>{t('home.step2Title', 'Schedule a Viewing')}</h3>
              <p>{t('home.step2Desc', 'Book a time to see the room in person completely for free.')}</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-inner bg-green-light text-green">
                <Check size={24} />
              </div>
              <h3>{t('home.step3Title', 'Move In')}</h3>
              <p>{t('home.step3Desc', 'Sign the contract, pay the rent, and move into your new home with peace of mind.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>{t('home.whyChooseUsTitle', 'Why Choose Us')}</h2>
            <p>{t('home.whyChooseUsSubtitle', 'We make renting easier and safer for everyone.')}</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <Sparkles size={24} className="benefit-icon" />
              </div>
              <h4>{t('home.benefit1Title', 'AI-Powered Matching')}</h4>
              <p>{t('home.benefit1Desc', 'Our smart system finds the best rooms that fit your lifestyle and budget instantly.')}</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <ShieldCheck size={24} className="benefit-icon" />
              </div>
              <h4>{t('home.benefit2Title', 'Verified Landlords')}</h4>
              <p>{t('home.benefit2Desc', 'Every landlord is vetted to ensure you have a safe and reliable renting experience.')}</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <Coins size={24} className="benefit-icon" />
              </div>
              <h4>{t('home.benefit3Title', 'Transparent Pricing')}</h4>
              <p>{t('home.benefit3Desc', 'No hidden fees. What you see is what you pay. Protect your deposits with our secure platform.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t('home.ctaTitle', 'Ready to find your next home?')}</h2>
            <p>{t('home.ctaSubtitle', 'Join thousands of users who have already found their perfect space.')}</p>
            <div className="cta-buttons">
              <Button variant="primary" size="large" onClick={() => navigate(ROUTES.ROOMS)} className="btn-cta-primary">
                {t('home.ctaBrowseBtn', 'Browse Rooms Now')}
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" size="large" onClick={() => navigate('/register')} className="btn-cta-outline">
                  {t('home.ctaSignupBtn', 'Sign Up for Free')}
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
