import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Button from '../../../components/common/Button';
import RoomCard from '../components/RoomCard';
import './SearchPage.css';

const MOCK_ROOMS = [
  {
    id: 1,
    title: 'Sunny Studio with Balcony',
    price: 850,
    rating: 4.9,
    location: 'University District',
    distance: '0.5 mi',
    tags: ['Wi-Fi', 'Kitchen', 'AC'],
    isFavorite: false,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'Premium Skyline Apartment',
    price: 1100,
    rating: 4.7,
    location: 'Downtown Core',
    distance: '2.1 mi',
    tags: ['Parking', 'Gym'],
    isFavorite: true,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'Campus Edge Single Room',
    price: 650,
    rating: 4.5,
    location: 'University District',
    distance: '0.1 mi',
    tags: ['Wi-Fi', 'Shared Kitchen'],
    isFavorite: false,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
  }
];

const SearchPage = () => {
  const [aiQuery, setAiQuery] = useState('');

  return (
    <div className="search-page container">
      {/* AI Search Panel */}
      <div className="ai-search-panel">
        <div className="ai-search-input-wrapper">
          <Sparkles className="ai-icon" size={20} />
          <input 
            type="text" 
            placeholder="Ask AI: 'Find a studio near university with parking'" 
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
          />
        </div>
        <Button className="ai-search-btn">Search AI</Button>
      </div>

      <div className="search-layout">
        {/* Sidebar Filters */}
        <aside className="search-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="reset-btn">
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Price Range (Monthly)</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Min" />
              <span>-</span>
              <input type="number" placeholder="Max" />
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Neighborhood</h4>
            <div className="checkbox-list">
              <label className="custom-checkbox">
                <input type="checkbox" defaultChecked />
                <span>University District</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Downtown Core</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Tech Park</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">Amenities</h4>
            <div className="checkbox-list">
              <label className="custom-checkbox">
                <input type="checkbox" defaultChecked />
                <span>High-Speed Wi-Fi</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" defaultChecked />
                <span>Air Conditioning</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Dedicated Parking</span>
              </label>
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span>Private Kitchen</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Results Area */}
        <div className="search-results-area">
          <div className="results-header">
            <h2>Available Rooms</h2>
            <p>Showing 24 results</p>
          </div>

          <div className="rooms-grid">
            {MOCK_ROOMS.map(room => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="load-more-container">
            <Button variant="outline" size="lg">Load More Rooms</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
