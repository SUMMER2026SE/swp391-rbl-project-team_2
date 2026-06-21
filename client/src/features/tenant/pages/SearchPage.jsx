import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Loader, Search, ChevronDown, ChevronUp, Check, RotateCcw, Filter } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import { roomService } from '../services/roomService';
import { favoriteService } from '../services/favoriteService';
import useAuthStore from '../../../store/useAuthStore';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  const [roomType, setRoomType] = useState(searchParams.get('roomType') ? searchParams.get('roomType').split(',') : []);
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [maxOccupants, setMaxOccupants] = useState(searchParams.get('maxOccupants') || '');
  const [facilities, setFacilities] = useState(searchParams.get('facilities') ? searchParams.get('facilities').split(',') : []);
  const [nearbyFacilities, setNearbyFacilities] = useState(searchParams.get('nearbyFacilities') ? searchParams.get('nearbyFacilities').split(',') : []);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    basic: true,
    details: false,
    facilities: false,
    nearby: false
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
  const { isAuthenticated } = useAuthStore();

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
      limit: 12,
    };

    if (keyword) params.keyword = keyword;
    if (city) params.city = city;
    if (district) params.district = district;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minArea) params.minArea = minArea;
    if (maxArea) params.maxArea = maxArea;
    if (roomType.length > 0) params.roomType = roomType.join(',');
    if (bedrooms) params.bedrooms = bedrooms;
    if (maxOccupants) params.maxOccupants = maxOccupants;
    if (facilities.length > 0) params.facilities = facilities.join(',');
    if (nearbyFacilities.length > 0) params.nearbyFacilities = nearbyFacilities.join(',');
    if (sort) params.sort = sort;

    return params;
  }, [keyword, city, district, minPrice, maxPrice, minArea, maxArea, roomType, bedrooms, maxOccupants, facilities, nearbyFacilities, sort]);

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
      
      const response = await roomService.searchRooms(params);
      
      let favoriteIds = [];
      if (isAuthenticated) {
        try {
          const favResponse = await favoriteService.getFavorites();
          const favs = favResponse.data || favResponse || [];
          favoriteIds = favs.map(f => parseInt(f.room_id) || parseInt(f.roomId));
        } catch (e) {
          console.error("Could not fetch favorites", e);
        }
      }

      const mappedRooms = response.data.map(room => ({
        id: room.roomId,
        title: room.title,
        price: room.pricePerMonth,
        location: [room.address, room.district, room.city].filter(Boolean).join(', '),
        specs: [
          { icon: 'bed', text: `${room.bedrooms || 1} Beds` },
          { icon: 'square', text: `${room.areaSqm || 0} m²` }
        ],
        imageTags: room.status === 'available' ? [{ text: 'Available', type: 'primary' }] : [],
        isFavorite: favoriteIds.includes(parseInt(room.roomId)),
        image: room.thumbnailUrl ? (room.thumbnailUrl && room.thumbnailUrl.startsWith('http') ? room.thumbnailUrl : `http://localhost:5000${room.thumbnailUrl}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      }));

      if (!append) {
        setRooms(mappedRooms);
      } else {
        setRooms(prev => [...prev, ...mappedRooms]);
      }
      setTotalPages(response.pagination?.pages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      if (!append) setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams, isAuthenticated]);

  useEffect(() => {
    fetchRooms(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = () => {
    const params = buildSearchParams(1);
    updateUrlParams(params);
    fetchRooms(1, false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
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
  }, [keyword, city, district, minPrice, maxPrice, minArea, maxArea, roomType, bedrooms, maxOccupants, facilities, nearbyFacilities, sort]); 

  const handleReset = () => {
    setKeyword('');
    setSearchInput('');
    setCity('');
    setDistrict('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setRoomType([]);
    setBedrooms('');
    setMaxOccupants('');
    setFacilities([]);
    setNearbyFacilities([]);
    setSort('newest');
    
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

  const roomTypeMap = [
    { id: 'single', label: 'Single Room' },
    { id: 'double', label: 'Double Room' },
    { id: 'shared', label: 'Shared Room' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'house', label: 'House' }
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
                <h3>Filters</h3>
              </div>
              <button className="clear-all-btn flex items-center gap-1" onClick={handleReset}>
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Section 1: Basic Filters */}
            <div className="accordion-section">
              <button 
                type="button" 
                className="accordion-trigger" 
                onClick={() => toggleSection('basic')}
              >
                <span>Basic Criteria</span>
                {sectionsExpanded.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {sectionsExpanded.basic && (
                <div className="accordion-content animate-slide-down">
                  <div className="filter-item-group">
                    <label className="filter-item-label">Location</label>
                    <div className="flex flex-col gap-2">
                      <select className="w-full p-2 border border-gray-300 rounded select-input" value={city} onChange={e => { setCity(e.target.value); setDistrict(''); }}>
                        <option value="">Select City / Province</option>
                        {provincesList.map((prov, index) => (
                          <option key={index} value={prov.full_name}>{prov.full_name}</option>
                        ))}
                      </select>
                      <select className="w-full p-2 border border-gray-300 rounded select-input" value={district} onChange={e => setDistrict(e.target.value)} disabled={!city || districtsList.length === 0}>
                        <option value="">Select District / Ward</option>
                        {districtsList.map((dist, index) => (
                          <option key={index} value={dist.full_name}>{dist.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="filter-item-group">
                    <label className="filter-item-label">Price Range</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={priceRange} onChange={handlePriceChange}>
                      <option value="-">Any Price</option>
                      <option value="0-1000000">&lt; 1 million VNĐ</option>
                      <option value="1000000-2000000">1 - 2 million VNĐ</option>
                      <option value="2000000-3000000">2 - 3 million VNĐ</option>
                      <option value="3000000-4000000">3 - 4 million VNĐ</option>
                      <option value="4000000-5000000">4 - 5 million VNĐ</option>
                      <option value="5000000-">&gt; 5 million VNĐ</option>
                    </select>
                  </div>

                  <div className="filter-item-group">
                    <label className="filter-item-label">Area Range</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={areaRange} onChange={handleAreaChange}>
                      <option value="-">Any Area</option>
                      <option value="0-20">&lt; 20 m²</option>
                      <option value="20-30">20 - 30 m²</option>
                      <option value="30-40">30 - 40 m²</option>
                      <option value="40-">&gt; 40 m²</option>
                    </select>
                  </div>

                  <div className="filter-item-group">
                    <label className="filter-item-label">Room Type</label>
                    <div className="pill-list-selector">
                      {roomTypeMap.map(type => {
                        const isSelected = roomType.includes(type.id);
                        return (
                          <button
                            key={type.id}
                            type="button"
                            className={`pill-select-item ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleArrayItem(setRoomType, roomType, type.id)}
                          >
                            {isSelected && <Check size={12} />}
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Room Details */}
            <div className="accordion-section">
              <button 
                type="button" 
                className="accordion-trigger" 
                onClick={() => toggleSection('details')}
              >
                <span>Room Specifications</span>
                {sectionsExpanded.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {sectionsExpanded.details && (
                <div className="accordion-content animate-slide-down">
                  <div className="filter-item-group">
                    <label className="filter-item-label">Bedrooms</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                      <option value="">Any</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4+ Bedrooms</option>
                    </select>
                  </div>
                  
                  <div className="filter-item-group">
                    <label className="filter-item-label">Max Occupants</label>
                    <select className="w-full p-2 border border-gray-300 rounded select-input" value={maxOccupants} onChange={(e) => setMaxOccupants(e.target.value)}>
                      <option value="">Any</option>
                      <option value="1">1 Person</option>
                      <option value="2">2 People</option>
                      <option value="3">3 People</option>
                      <option value="4">4 People</option>
                      <option value="5">5+ People</option>
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
                <span>Room Facilities</span>
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
                          <span>{fac}</span>
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
                <span>Nearby Facilities</span>
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
                          <span>{fac}</span>
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
            <form className="ask-ai-container" onSubmit={(e) => e.preventDefault()}>
              <Search className="sparkles-icon" size={20} style={{color: '#6B7280'}} />
              <input 
                type="text" 
                placeholder="Search by keyword (e.g. Da Nang, title, address)" 
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setKeyword(e.target.value);
                }}
                className="ask-ai-input"
              />
              <button type="submit" className="ask-ai-btn">Search</button>
            </form>

            <div className="results-header flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Available Rooms</h2>
                {loading && page === 1 ? (
                  <p className="text-gray-500">Loading...</p>
                ) : (
                  <p className="text-gray-500">Showing {rooms.length} results</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium">Sort by:</label>
                <select className="p-2 border border-gray-300 rounded" value={sort} onChange={(e) => { setSort(e.target.value); setTimeout(handleApplyFilters, 0); }}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Lowest Price</option>
                  <option value="price_desc">Highest Price</option>
                  <option value="area_desc">Largest Area</option>
                </select>
              </div>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="rooms-grid">
              {rooms.length > 0 ? (
                rooms.map(room => (
                  <RoomCard key={room.id} room={room} variant="standard" />
                ))
              ) : (
                !loading && <div className="col-span-full py-12 text-center text-gray-500">No rooms found matching your criteria. Try adjusting your filters.</div>
              )}
            </div>

            {page < totalPages && (
              <div className="load-more-container mt-8 text-center">
                <button 
                  className="load-more-btn px-6 py-2 border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50 transition" 
                  onClick={() => fetchRooms(page + 1, true)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Rooms'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
