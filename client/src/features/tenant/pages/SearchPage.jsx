import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Bot, Loader, Search } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import { roomService } from '../services/roomService';
import { favoriteService } from '../services/favoriteService';
import useAuthStore from '../../../store/useAuthStore';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Filter States
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [roomType, setRoomType] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [bedrooms, setBedrooms] = useState('');
  const [district, setDistrict] = useState([]);

  // Results State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuthStore();

  // Debounce timer ref
  const debounceRef = useRef(null);
  const isFirstRender = useRef(true);

  const buildSearchParams = useCallback((currentPage = 1, kwOverride = null) => {
    const params = {
      page: currentPage,
      limit: 9,
    };

    const currentKeyword = kwOverride !== null ? kwOverride : keyword;

    if (currentKeyword) params.keyword = currentKeyword;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (roomType?.length > 0) params.roomType = roomType.join(',');
    if (amenities?.length > 0) params.amenities = amenities.join(',');
    if (bedrooms) params.bedrooms = bedrooms;
    if (district?.length > 0) params.district = district.join(',');

    return params;
  }, [keyword, minPrice, maxPrice, roomType, amenities, bedrooms, district]);

  const fetchRooms = useCallback(async (currentPage = 1, kwOverride = null) => {
    try {
      setLoading(true);
      const params = buildSearchParams(currentPage, kwOverride);

      const response = await roomService.searchRooms(params);
      
      // Fetch user's favorites to cross-reference
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
        location: room.address,
        specs: [
          { icon: 'bed', text: room.roomType },
          { icon: 'square', text: `${room.areaSqm || 0} sqft` }
        ],
        imageTags: room.status === 'available' ? [{ text: 'Available', type: 'primary' }] : [],
        isFavorite: favoriteIds.includes(parseInt(room.roomId)),
        image: room.thumbnailUrl ? `http://localhost:5000${room.thumbnailUrl}` : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      }));

      if (currentPage === 1) {
        setRooms(mappedRooms);
      } else {
        setRooms(prev => [...prev, ...mappedRooms]);
      }
      setTotalPages(response.pagination?.pages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams, isAuthenticated]);

  // Initial load
  useEffect(() => {
    fetchRooms(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // AUTO-APPLY: Only watch the keyword query string from URL changes
  useEffect(() => {
    if (initialKeyword !== keyword) {
      setKeyword(initialKeyword);
      fetchRooms(1, initialKeyword);
    }
  }, [initialKeyword]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    setRoomType([]);
    setAmenities([]);
    setBedrooms('');
    setDistrict([]);
  };

  const toggleArrayItem = (setter, state, item) => {
    if (state.includes(item)) {
      setter(state.filter(i => i !== item));
    } else {
      setter([...state, item]);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-layout">
          {/* Sidebar Filters */}
        <aside className="search-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-all-btn" onClick={handleReset}>Reset</button>
          </div>

          <button 
            className="apply-filters-btn"
            onClick={() => fetchRooms(1)}
          >
            Apply Filters
          </button>

          <div className="filter-group">
            <h4 className="filter-title">Price Range (Monthly)</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Min $" className="price-input" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <span>-</span>
              <input type="number" placeholder="Max $" className="price-input" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Room Type</h4>
            <div className="checkbox-list">
              <label className="custom-checkbox">
                <input type="checkbox" checked={roomType.includes('single')} onChange={() => toggleArrayItem(setRoomType, roomType, 'single')} />
                <span>Private Room (Single)</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" checked={roomType.includes('apartment')} onChange={() => toggleArrayItem(setRoomType, roomType, 'apartment')} />
                <span>Entire Apartment</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" checked={roomType.includes('shared')} onChange={() => toggleArrayItem(setRoomType, roomType, 'shared')} />
                <span>Shared Room</span>
              </label>
            </div>
          </div>
          
          <div className="filter-group">
            <h4 className="filter-title">Bedrooms</h4>
            <select className="w-full p-2 border border-gray-300 rounded" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
              <option value="">Any</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4+">4+ Bedrooms</option>
            </select>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Amenities</h4>
            <div className="checkbox-list">
              <label className="custom-checkbox">
                <input type="checkbox" checked={amenities.includes('Air Conditioning')} onChange={() => toggleArrayItem(setAmenities, amenities, 'Air Conditioning')} />
                <span>Air Conditioning</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" checked={amenities.includes('Gym')} onChange={() => toggleArrayItem(setAmenities, amenities, 'Gym')} />
                <span>Gym Access</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" checked={amenities.includes('Wi-Fi')} onChange={() => toggleArrayItem(setAmenities, amenities, 'Wi-Fi')} />
                <span>High-Speed Wi-Fi</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" checked={amenities.includes('Washing Machine')} onChange={() => toggleArrayItem(setAmenities, amenities, 'Washing Machine')} />
                <span>In-unit Laundry</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Location / District</h4>
            <input 
              type="text" 
              placeholder="e.g. Da Nang or District 1" 
              className="w-full p-2 border border-gray-300 rounded mb-4"
              value={district.join(',')}
              onChange={(e) => setDistrict(e.target.value ? [e.target.value] : [])} 
            />
          </div>
        </aside>

        {/* Main Results Area */}
        <div className="search-results-area">
          {/* Top Search AI Row */}
          <div className="ask-ai-container">
            <Sparkles className="sparkles-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by title or address (e.g., Da Nang, Apartment)" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  alert('AI Search feature is coming soon!');
                }
              }}
              className="ask-ai-input"
            />
            <button className="ask-ai-btn" onClick={() => alert('AI Search feature is coming soon!')}>Search</button>
          </div>

          <div className="results-header">
            <h2>Available Rooms</h2>
            {loading && page === 1 ? (
              <p>Loading...</p>
            ) : (
              <p>Showing {rooms.length} results</p>
            )}
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
            <div className="load-more-container">
              <button 
                className="load-more-btn" 
                onClick={() => fetchRooms(page + 1)}
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
