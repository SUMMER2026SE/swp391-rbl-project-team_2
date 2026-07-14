import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Loader, Search, ChevronDown, ChevronUp, Check, RotateCcw, Filter, ChevronLeft, ChevronRight, X, ArrowRight, Clock } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { roomService } from '../services/roomService';
import useAuthStore from '../../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import './SearchPage.css';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
<<<<<<< Updated upstream
=======
  const navigate = useNavigate();
  const [isAIMode, setIsAIMode] = useState(() => {
    if (searchParams.get('ai') === 'true') return true;
    return localStorage.getItem('rentwise_ai_mode_active') === 'true';
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiLoadingMessage, setAiLoadingMessage] = useState('');
>>>>>>> Stashed changes

  // AI summary card states
  const [aiSummary, setAiSummary] = useState('');
  const [showAISummaryCard, setShowAISummaryCard] = useState(false);
  const [totalAIMatched, setTotalAIMatched] = useState(0);

  // Keyword mapping from URL or local state
  const initialKeyword = searchParams.get('keyword') || '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchInput, setSearchInput] = useState(initialKeyword);

  useEffect(() => {
    const keywordParam = searchParams.get('keyword') || '';
    if (keywordParam !== keyword) {
      setKeyword(keywordParam);
      setSearchInput(keywordParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('ai') === 'true' && searchInput) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('ai');
      setSearchParams(newParams, { replace: true });
      
      handleSearchSubmit(null, searchInput, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem('rentwise_ai_mode_active', isAIMode);
  }, [isAIMode]);

  // Provinces/Districts States
  const [provincesList, setProvincesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  // Filter States
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minArea, setMinArea] = useState(searchParams.get('minArea') || '');
  const [maxArea, setMaxArea] = useState(searchParams.get('maxArea') || '');

  const [maxOccupants, setMaxOccupants] = useState(searchParams.get('maxOccupants') || '');
  const [facilities, setFacilities] = useState(searchParams.get('facilities') ? searchParams.get('facilities').split(',') : []);
  const [nearbyFacilities, setNearbyFacilities] = useState(searchParams.get('nearbyFacilities') ? searchParams.get('nearbyFacilities').split(',') : []);
  const [landlordId, setLandlordId] = useState(searchParams.get('landlordId') || '');
  const [sectionsExpanded, setSectionsExpanded] = useState({
    basic: true,
    details: false,
    facilities: searchParams.get('facilities') ? true : false,
    nearby: searchParams.get('nearbyFacilities') ? true : false
  });

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Select Ranges derived states
  const areaRange = `${minArea}-${maxArea}`;
  const priceRange = `${minPrice}-${maxPrice}`;

  // Results State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated, user } = useAuthStore();
  const userId = user?.user_id || 'guest';

  // AI search history states
  const [aiSearchHistory, setAiSearchHistory] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Load AI search history
  useEffect(() => {
    try {
      const historyKey = `rentwise-search-ai-history-${userId}`;
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        setAiSearchHistory(JSON.parse(saved));
      } else {
        setAiSearchHistory([]);
      }
    } catch (e) {
      console.error('Failed to load AI search history:', e);
    }
  }, [userId]);

  // Save AI search history query
  const saveSearchHistory = (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const trimmed = queryText.trim();
    setAiSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        const historyKey = `rentwise-search-ai-history-${userId}`;
        localStorage.setItem(historyKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save AI search history:', e);
      }
      return updated;
    });
  };

  // Clear AI search history
  const clearSearchHistory = (e) => {
    if (e) e.stopPropagation();
    setAiSearchHistory([]);
    try {
      const historyKey = `rentwise-search-ai-history-${userId}`;
      localStorage.removeItem(historyKey);
    } catch (e) {
      console.error('Failed to clear AI search history:', e);
    }
  };

  const isFirstRender = useRef(true);
  const debounceRef = useRef(null);

  // Fetch Provinces
  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh/1/0.htm')
      .then(res => res.json())
      .then(data => {
        if (data.error === 0) setProvincesList(data.data);
      })
      .catch(err => console.error("Error fetching provinces", err));
  }, []);

  // Fetch Districts when city changes
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

  const buildSearchParams = useCallback((currentPage = 1) => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    if (keyword) params.keyword = keyword;
    if (city) params.city = city;
    if (district) params.district = district;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minArea) params.minArea = minArea;
    if (maxArea) params.maxArea = maxArea;

    if (maxOccupants) params.maxOccupants = maxOccupants;
    if (facilities.length > 0) params.facilities = facilities.join(',');
    if (nearbyFacilities.length > 0) params.nearbyFacilities = nearbyFacilities.join(',');
    if (sort) params.sort = sort;
    if (landlordId) params.landlordId = landlordId;

    return params;
  }, [keyword, city, district, minPrice, maxPrice, minArea, maxArea, maxOccupants, facilities, nearbyFacilities, sort, landlordId]);

  const updateUrlParams = useCallback((params) => {
    const searchObj = {};
    for (const key in params) {
      if (params[key] && key !== 'limit' && key !== 'page') {
        searchObj[key] = params[key];
      }
    }
    setSearchParams(searchObj);
  }, [setSearchParams]);

  const fetchRooms = useCallback(async (currentPage = 1, append = false) => {
    try {
      setLoading(true);
      const params = buildSearchParams(currentPage);

      const response = await roomService.searchProperties(params);

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

      if (!append) {
        setRooms(mappedProperties);
      } else {
        setRooms(prev => [...prev, ...mappedProperties]);
      }
      setTotalPages(response.pagination?.pages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      if (!append) setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams]);

  useEffect(() => {
    fetchRooms(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = () => {
    const params = buildSearchParams(1);
    updateUrlParams(params);
    fetchRooms(1, false);
  };

<<<<<<< Updated upstream
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
=======
  const handleSearchSubmit = async (e, queryOverride, forceAIMode = false) => {
    if (e) e.preventDefault();
    
    const queryToSearch = queryOverride || searchInput;
    if (isAIMode || forceAIMode) {
      if (!queryToSearch.trim()) return;
      
      setLoadingAI(true);
      setAiLoadingMessage('AI đang phân tích yêu cầu...');
      
      try {
        const response = await api.post('/ai/search', { query: queryToSearch });
        
        if (response.success) {
          if (response.openChatbot) {
            setAiLoadingMessage('Đang chuyển hướng sang Chatbot...');
            let params = new URLSearchParams(searchParams);
            params.set('aiQuery', queryToSearch);
            setSearchParams(params, { replace: true });
            setTimeout(() => {
              setLoadingAI(false);
            }, 800);
            return;
          }

          setAiLoadingMessage('Đang tổng hợp kết quả tìm kiếm...');
          const data = response.data || {};
            
            // Cập nhật các trạng thái AI Summary Card
            setAiSummary(response.aiSummary || '');
            setTotalAIMatched(response.totalMatched || 0);
            setShowAISummaryCard(true);

            // Lưu lịch sử tìm kiếm AI
            saveSearchHistory(queryToSearch);

            // Cập nhật local filter states
            if (data.keyword !== undefined) {
              setKeyword(data.keyword || '');
              setSearchInput(queryToSearch); // Keep the search query in the input
            }
            if (data.city !== undefined) setCity(data.city || '');
            if (data.district !== undefined) setDistrict(data.district || '');
            
            if (data.priceMin !== undefined || data.priceMax !== undefined) {
              setMinPrice(data.priceMin || '');
              setMaxPrice(data.priceMax || '');
            }
            
            if (data.facilities !== undefined) {
              setFacilities(data.facilities || []);
            }
            
            if (data.nearbyFacilities !== undefined) {
              setNearbyFacilities(data.nearbyFacilities || []);
            }
            
            // Xây dựng URL params để update URL
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
            
            setSearchParams(params, { replace: true });
            
            setTimeout(() => {
              setLoadingAI(false);
            }, 800);
        } else {
          throw new Error('AI Search failed');
        }
      } catch (err) {
        console.error("SearchPage AI Search Error", err);
        setAiLoadingMessage('Lỗi tìm kiếm AI. Đang chuyển về tìm kiếm từ khóa...');
        setTimeout(() => {
          setLoadingAI(false);
          setKeyword(searchInput);
        }, 1200);
      }
    } else {
      setKeyword(searchInput);
    }
>>>>>>> Stashed changes
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleApplyFilters();
    }, 500);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, city, district, minPrice, maxPrice, minArea, maxArea, maxOccupants, facilities, nearbyFacilities, sort, landlordId]);

  const handleReset = () => {
    setKeyword('');
    setSearchInput('');
    setCity('');
    setDistrict('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');

    setMaxOccupants('');
    setFacilities([]);
    setNearbyFacilities([]);
    setSort('newest');
    setLandlordId('');

    // Clear AI States
    setAiSummary('');
    setTotalAIMatched(0);
    setShowAISummaryCard(false);

    setTimeout(() => {
      fetchRooms(1, false);
      setSearchParams({});
    }, 0);
  };

  const toggleArrayItem = (setter, state, item) => {
    if (state.includes(item)) {
      setter(state.filter(i => i !== item));
    } else {
      setter([...state, item]);
    }
  };

  const handleAreaChange = (e) => {
    const val = e.target.value;
    if (!val || val === '-') {
      setMinArea('');
      setMaxArea('');
    } else {
      const [min, max] = val.split('-');
      setMinArea(min);
      setMaxArea(max);
    }
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    if (!val || val === '-') {
      setMinPrice('');
      setMaxPrice('');
    } else {
      const [min, max] = val.split('-');
      setMinPrice(min);
      setMaxPrice(max);
    }
  };

  const roomFacilitiesList = [
    'WiFi', 'Air Conditioner', 'Parking', 'Private Bathroom',
    'Balcony', 'Bed', 'Wardrobe', 'Kitchen', 'Security Camera'
  ];

  const nearbyFacilitiesList = [
    'Near University', 'Near Hospital', 'Near Supermarket',
    'Near Bus Station', 'Near Market', 'Near Park', 'Near Convenience Store'
  ];



  return (
    <div className="search-page">
      <div className="container">
        <div className="search-layout">
          {/* Sidebar Filters */}
          <aside className="search-sidebar">
            <div className="sidebar-header">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-indigo" />
                <h3>{t('search.filters', 'Filters')}</h3>
              </div>
              <button className="clear-all-btn flex items-center gap-1" onClick={handleReset}>
                <RotateCcw size={14} />
                <span>{t('search.reset', 'Reset')}</span>
              </button>
            </div>

            {/* Section 1: Basic Filters */}
            <div className="accordion-section">
              <button
                type="button"
                className="accordion-trigger"
                onClick={() => toggleSection('basic')}
              >
                <span>{t('search.basicCriteria', 'Basic Criteria')}</span>
                {sectionsExpanded.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {sectionsExpanded.basic && (
                <div className="accordion-content animate-slide-down">
                  <div className="filter-item-group">
                    <label className="filter-item-label">{t('search.location', 'Location')}</label>
                    <div className="flex flex-col gap-2">
                      <select className="w-full p-2 border border-gray-300 rounded select-input" value={city} onChange={e => { setCity(e.target.value); setDistrict(''); }}>
                        <option value="">{t('search.selectCity', 'Select City / Province')}</option>
                        {provincesList.map((prov, index) => (
                          <option key={index} value={prov.full_name}>{prov.full_name}</option>
                        ))}
                      </select>
                      <select className="w-full p-2 border border-gray-300 rounded select-input" value={district} onChange={e => setDistrict(e.target.value)} disabled={!city || districtsList.length === 0}>
                        <option value="">{t('search.selectDistrict', 'Select District / Ward')}</option>
                        {districtsList.map((dist, index) => (
                          <option key={index} value={dist.full_name}>{dist.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="filter-item-group">
                    <label className="filter-item-label">{t('search.priceRange', 'Price Range')}</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={priceRange} onChange={handlePriceChange}>
                      <option value="-">{t('search.anyPrice', 'Any Price')}</option>
                      <option value="0-1000000">{t('search.price1', '< 1 million VNĐ')}</option>
                      <option value="1000000-2000000">{t('search.price2', '1 - 2 million VNĐ')}</option>
                      <option value="2000000-3000000">{t('search.price3', '2 - 3 million VNĐ')}</option>
                      <option value="3000000-4000000">{t('search.price4', '3 - 4 million VNĐ')}</option>
                      <option value="4000000-5000000">{t('search.price5', '4 - 5 million VNĐ')}</option>
                      <option value="5000000-">{t('search.price6', '> 5 million VNĐ')}</option>
                    </select>
                  </div>

                  <div className="filter-item-group">
                    <label className="filter-item-label">{t('search.areaRange', 'Area Range')}</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={areaRange} onChange={handleAreaChange}>
                      <option value="-">{t('search.anyArea', 'Any Area')}</option>
                      <option value="0-20">{t('search.area1', '< 20 m²')}</option>
                      <option value="20-30">{t('search.area2', '20 - 30 m²')}</option>
                      <option value="30-40">{t('search.area3', '30 - 40 m²')}</option>
                      <option value="40-">{t('search.area4', '> 40 m²')}</option>
                    </select>
                  </div>

                  <div className="filter-item-group">
                    <label className="filter-item-label">{t('search.maxOccupant', 'Max occupant')}</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={maxOccupants} onChange={(e) => setMaxOccupants(e.target.value)}>
                      <option value="">{t('search.any', 'Any')}</option>
                      <option value="1">{t('search.person1', '1 Person')}</option>
                      <option value="2">{t('search.person2', '2 People')}</option>
                      <option value="3">{t('search.person3', '3 People')}</option>
                      <option value="4">{t('search.person4', '4 People')}</option>
                      <option value="5">{t('search.person5', '5+ People')}</option>
                    </select>
                  </div>

                </div>
              )}
            </div>

            {/* Section 3: Room Facilities */}
            <div className="accordion-section">
              <button
                type="button"
                className="accordion-trigger"
                onClick={() => toggleSection('facilities')}
              >
                <span>{t('search.roomFacilities', 'Room Facilities')}</span>
                {sectionsExpanded.facilities ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {sectionsExpanded.facilities && (
                <div className="accordion-content animate-slide-down">
                  <div className="pill-list-selector">
                    {roomFacilitiesList.map(fac => {
                      const isSelected = facilities.includes(fac);
                      return (
                        <button
                          key={fac}
                          type="button"
                          className={`pill-select-item ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleArrayItem(setFacilities, facilities, fac)}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{t(`facilities.${fac}`, fac)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Nearby Facilities */}
            <div className="accordion-section">
              <button
                type="button"
                className="accordion-trigger"
                onClick={() => toggleSection('nearby')}
              >
                <span>{t('search.nearbyFacilities', 'Nearby Facilities')}</span>
                {sectionsExpanded.nearby ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {sectionsExpanded.nearby && (
                <div className="accordion-content animate-slide-down">
                  <div className="pill-list-selector">
                    {nearbyFacilitiesList.map(fac => {
                      const isSelected = nearbyFacilities.includes(fac);
                      return (
                        <button
                          key={fac}
                          type="button"
                          className={`pill-select-item ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleArrayItem(setNearbyFacilities, nearbyFacilities, fac)}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{t(`facilities.${fac}`, fac)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Results Area */}
          <div className="search-results-area">
            {/* Top Search Bar Row */}
<<<<<<< Updated upstream
            <form className="ask-ai-container" onSubmit={(e) => e.preventDefault()}>
              <Search className="sparkles-icon" size={20} style={{ color: '#6B7280' }} />
=======
            <form className={`ask-ai-container ${isAIMode ? 'ai-active' : ''}`} style={{ position: 'relative' }} onSubmit={handleSearchSubmit}>
              <Search className={isAIMode ? "sparkles-icon text-pink-500" : "sparkles-icon"} size={20} style={{ color: isAIMode ? '#EC4899' : '#6B7280' }} />
>>>>>>> Stashed changes
              <input
                type="text"
                placeholder={t('search.searchPlaceholder', 'Search by keyword (e.g. Da Nang, title, address)')}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setKeyword(e.target.value);
                }}
                onFocus={() => isAIMode && setShowHistoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowHistoryDropdown(false), 250)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setShowHistoryDropdown(false);
                    handleSearchSubmit(e);
                  }
                }}
                className="ask-ai-input"
              />
<<<<<<< Updated upstream
              <button type="submit" className="ask-ai-btn" onClick={handleSearchSubmit}>{t('search.searchBtn', 'Search')}</button>
            </form>

=======
              <button 
                type="button" 
                className={`ai-toggle-pill-inline ${isAIMode ? 'active' : ''}`}
                onClick={() => {
                  setIsAIMode(!isAIMode);
                  setShowHistoryDropdown(false);
                }}
                disabled={loadingAI}
                title="Chuyển chế độ tìm kiếm AI"
              >
                <Sparkles size={14} className={isAIMode ? 'sparkle-pulse' : ''} />
                <span>AI Mode</span>
              </button>
              <button type="submit" className={isAIMode ? "ask-ai-btn ai-btn-glowing" : "ask-ai-btn"} disabled={loadingAI}>
                {isAIMode ? <Sparkles size={16} className={loadingAI ? 'animate-spin' : ''} /> : null}
                <span>{isAIMode ? t('search.searchBtnAI', 'AI Search') : t('search.searchBtn', 'Search')}</span>
              </button>

              {/* AI Search History Dropdown */}
              {isAIMode && showHistoryDropdown && aiSearchHistory.length > 0 && (
                <div className="ai-search-history-dropdown">
                  <div className="history-dropdown-header">
                    <span>LỊCH SỬ TÌM KIẾM AI</span>
                    <button type="button" onMouseDown={clearSearchHistory} className="clear-history-btn">
                      Xóa lịch sử
                    </button>
                  </div>
                  <ul className="history-dropdown-list">
                    {aiSearchHistory.map((hist, idx) => (
                      <li 
                        key={idx} 
                        onMouseDown={() => {
                          setSearchInput(hist);
                          handleSearchSubmit(null, hist);
                        }}
                      >
                        <Clock size={13} className="history-item-icon" />
                        <span className="history-item-text">{hist}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>

            {/* SearchPage loading overlay */}
            {loadingAI && (
              <div className="searchpage-ai-loading-overlay animate-fade-in mb-6">
                <div className="ai-loading-scanner"></div>
                <div className="ai-loading-text flex items-center gap-2 justify-center py-4">
                  <Sparkles className="animate-spin text-pink-500" size={18} />
                  <span>{aiLoadingMessage}</span>
                </div>
              </div>
            )}

            {/* AI Summary Card */}
            {showAISummaryCard && (
              <div className="ai-summary-card animate-slide-down mb-8">
                <button 
                  type="button"
                  className="ai-summary-close-btn" 
                  onClick={() => setShowAISummaryCard(false)}
                  title="Đóng kết quả AI"
                >
                  <X size={16} />
                </button>
                
                <div className="ai-summary-header">
                  <div className="ai-summary-badge">
                    <Sparkles size={13} className="sparkle-pulse" />
                    <span>KẾT QUẢ RENTWISE AI</span>
                  </div>
                  <h4>Tìm thấy {totalAIMatched} phòng phù hợp</h4>
                </div>

                <div className="ai-summary-body mb-0">
                  <p className="ai-summary-text">{aiSummary}</p>
                </div>
              </div>
            )}

>>>>>>> Stashed changes
            <div className="results-header flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{t('search.availableProperties', 'Available Properties')}</h2>
                {loading && page === 1 ? (
                  <p className="text-gray-500">{t('search.loading', 'Loading...')}</p>
                ) : (
                  <p className="text-gray-500">{t('search.showingResults', { count: rooms.length, defaultValue: `Showing ${rooms.length} results` })}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">{t('search.sortBy', 'Sort by:')}</label>
                <select className="p-2 border border-gray-300 rounded" value={sort} onChange={(e) => { setSort(e.target.value); setTimeout(handleApplyFilters, 0); }}>
                  <option value="newest">{t('search.sortNewest', 'Newest')}</option>
                  <option value="price_asc">{t('search.sortPriceAsc', 'Lowest Price')}</option>
                  <option value="price_desc">{t('search.sortPriceDesc', 'Highest Price')}</option>
                  <option value="area_desc">{t('search.sortAreaDesc', 'Largest Area')}</option>
                </select>
              </div>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="rooms-grid">
              {rooms.length > 0 ? (
                rooms.map(prop => (
                  <PropertyCard key={prop.id} property={prop} />
                ))
              ) : (
                !loading && <div className="col-span-full py-12 text-center text-gray-500">{t('search.noPropertiesFound', 'No properties found matching your criteria. Try adjusting your filters.')}</div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="search-pagination-container">
                {page > 1 && (
                  <button
                    className="pagination-btn"
                    onClick={() => { fetchRooms(page - 1, false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={loading}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${page === p ? 'active' : ''}`}
                    onClick={() => { fetchRooms(p, false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={loading}
                  >
                    {p}
                  </button>
                ))}

                {page < totalPages && (
                  <button
                    className="pagination-btn"
                    onClick={() => { fetchRooms(page + 1, false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={loading}
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
