import React, { useState } from 'react';
import { Search, Map, ChevronDown } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import './SearchPage.css';

const MOCK_ROOMS = [
  {
    id: 1,
    title: 'Sunlit Studio in...',
    price: 1200,
    rating: 4.9,
    location: 'Midtown Arts District',
    tags: ['Private Bath', 'Gym Access'],
    isFavorite: false,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500&auto=format&fit=crop&q=60' // Bedroom with window
  },
  {
    id: 2,
    title: 'Cozy Room near...',
    price: 950,
    rating: 4.7,
    location: 'University District',
    tags: ['Shared Bath', 'High-Speed Wi-Fi'],
    isFavorite: false,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=60' // Living room with gray sofa
  },
  {
    id: 3,
    title: 'Urban Loft...',
    price: 1500,
    rating: 5.0,
    location: 'Downtown Core',
    tags: ['Private Bath', 'In-unit Laundry'],
    isFavorite: true,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&auto=format&fit=crop&q=60' // Bedroom with brick wall
  }
];

const SearchPage = () => {
  const [aiQuery, setAiQuery] = useState('');

  return (
    <div className="search-page container">
      <div className="search-layout">
        {/* Sidebar Filters */}
        <aside className="search-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="clear-all-btn">Clear all</button>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Price Range (Monthly)</h4>
            <div className="price-inputs">
              <input type="text" placeholder="$500" className="price-input" />
              <span>-</span>
              <input type="text" placeholder="$2500+" className="price-input" />
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Room Type</h4>
            <div className="checkbox-list">
              <label className="custom-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Private Room</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Entire Studio</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Shared Room</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Amenities</h4>
            <div className="checkbox-list">
              <label className="custom-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Private Bath</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Gym Access</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>High-Speed Wi-Fi</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>In-unit Laundry</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Neighborhood</h4>
            <div className="select-dropdown-wrapper">
              <select className="neighborhood-select">
                <option>All Neighborhoods</option>
                <option>Midtown Arts District</option>
                <option>University District</option>
                <option>Downtown Core</option>
              </select>
              <ChevronDown className="select-arrow-icon" size={16} />
            </div>
          </div>
        </aside>

        {/* Main Results Area */}
        <div className="search-results-area">
          {/* Top Search & Actions Row */}
          <div className="explore-search-row">
            <div className="explore-search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Describe your ideal stay (e.g., 'Quiet studio near transit under $1500')" 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
              />
              <button className="ask-ai-btn">Ask AI</button>
            </div>
            
            <button className="map-view-btn">
              <Map className="map-icon" size={18} />
              <span>Map View</span>
            </button>

            <div className="sort-dropdown-wrapper">
              <select className="sort-select">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <ChevronDown className="select-arrow-icon" size={16} />
            </div>
          </div>

          <div className="results-header">
            <h2>Explore Rooms</h2>
            <p>Showing 24 results</p>
          </div>

          <div className="rooms-grid">
            {MOCK_ROOMS.map(room => (
              <RoomCard key={room.id} room={room} variant="standard" />
            ))}
          </div>

          <div className="load-more-container">
            <button className="load-more-btn">Load More Rooms</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
