import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Wifi, 
  Lock, 
  History, 
  Building,
  ArrowRight,
  HelpCircle,
  Cpu
} from 'lucide-react';
import downtownImg from '../../assets/images/downtown.png';
import techDistrictImg from '../../assets/images/tech-district.png';
import './SearchOverlay.css';

const SearchOverlay = ({ onClose, onSearchSubmit }) => {
  // Input Query
  const [searchQuery, setSearchQuery] = useState('');

  // Active Category Pills
  const [activeCategories, setActiveCategories] = useState({
    Studio: true,
    'Co-living': false,
    'Entire Home': false,
    'Pet Friendly': true
  });

  // Selectable Keyboard Indices
  // 0: Wifi Card, 1: Smart Lock Card, 2: Recent 1, 3: Recent 2, 4: Recent 3
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const inputRef = useRef(null);

  // List of selectable items for keyboard mapping
  const selectableItems = [
    { type: 'suggestion', label: 'High-Speed Wi-Fi Rooms', desc: 'Properties optimized for remote work with high bandwidth.' },
    { type: 'suggestion', label: 'Smart Lock Access', desc: 'Keyless entry properties for contactless seamless onboarding.' },
    { type: 'recent', label: 'Studio apartments in Downtown' },
    { type: 'recent', label: 'Pet-friendly monthly rentals' },
    { type: 'recent', label: 'Tech Hub Campus proximity' }
  ];

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Keyboard navigation event listener (ESC, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setKeyboardIndex((prev) => (prev + 1) % selectableItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setKeyboardIndex((prev) => (prev - 1 + selectableItems.length) % selectableItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (keyboardIndex >= 0 && keyboardIndex < selectableItems.length) {
          const selected = selectableItems[keyboardIndex];
          setSearchQuery(selected.label);
          setKeyboardIndex(-1);
        } else if (searchQuery.trim()) {
          if (onSearchSubmit) {
            onSearchSubmit(searchQuery);
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyboardIndex, searchQuery, onClose, onSearchSubmit]);

  // Click handler to select card
  const handleItemSelect = (label) => {
    setSearchQuery(label);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Toggle Category Pill active state
  const toggleCategory = (cat) => {
    setActiveCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  return (
    <div className="search-overlay-backdrop" onClick={onClose}>
      
      {/* Search Modal Card Capsule */}
      <div className="search-overlay-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Block */}
        <header className="search-overlay-header">
          <div className="search-input-capsule">
            <Search size={20} className="search-input-icon" />
            <input 
              type="text" 
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for rooms, locations, amenities or smart features..."
              className="search-overlay-input-field"
            />
          </div>
          
          <div className="search-header-actions-right">
            <kbd className="esc-key-badge">ESC</kbd>
            <button className="btn-close-search" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Split columns layout */}
        <div className="search-overlay-body-grid">
          
          {/* Left Column: Smart Suggestions & Recents */}
          <div className="search-body-left-pane">
            
            {/* Smart Suggestions */}
            <div className="search-pane-section">
              <h4 className="search-section-label">Smart Suggestions</h4>
              <div className="smart-suggestions-row">
                
                {/* Suggestion 1: Wifi Rooms */}
                <div 
                  onClick={() => handleItemSelect('High-Speed Wi-Fi Rooms')}
                  className={`suggestion-card ${keyboardIndex === 0 ? 'keyboard-focused' : ''}`}
                >
                  <div className="suggestion-icon-wrap wifi-blue">
                    <Wifi size={18} />
                  </div>
                  <div className="suggestion-meta">
                    <h5>High-Speed Wi-Fi Rooms</h5>
                    <p>Properties optimized for remote work with...</p>
                  </div>
                </div>

                {/* Suggestion 2: Smart Locks */}
                <div 
                  onClick={() => handleItemSelect('Smart Lock Access')}
                  className={`suggestion-card ${keyboardIndex === 1 ? 'keyboard-focused' : ''}`}
                >
                  <div className="suggestion-icon-wrap lock-indigo">
                    <Lock size={18} />
                  </div>
                  <div className="suggestion-meta">
                    <h5>Smart Lock Access</h5>
                    <p>Keyless entry properties for...</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Searches */}
            <div className="search-pane-section">
              <h4 className="search-section-label">Recent Searches</h4>
              <ul className="recents-list-stack">
                {selectableItems.slice(2).map((item, idx) => {
                  const actualIdx = idx + 2;
                  return (
                    <li 
                      key={idx}
                      onClick={() => handleItemSelect(item.label)}
                      className={`recent-search-row ${keyboardIndex === actualIdx ? 'keyboard-focused' : ''}`}
                    >
                      <History size={16} className="recent-clock-icon" />
                      <span className="recent-query-text">{item.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>

          {/* Right Column: Trending Locations & Categories */}
          <div className="search-body-right-pane">
            
            {/* Trending Locations */}
            <div className="search-pane-section">
              <h4 className="search-section-label">Trending Locations</h4>
              <div className="trending-locations-stack">
                
                {/* Location 1: Downtown Metro */}
                <div 
                  onClick={() => handleItemSelect('Downtown Metro')}
                  className="trending-location-card"
                  style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.5)), url(${downtownImg})` }}
                >
                  <div className="trending-meta-text">
                    <h5>Downtown Metro</h5>
                    <span>142 Properties</span>
                  </div>
                </div>

                {/* Location 2: Tech District */}
                <div 
                  onClick={() => handleItemSelect('Tech District')}
                  className="trending-location-card"
                  style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.5)), url(${techDistrictImg})` }}
                >
                  <div className="trending-meta-text">
                    <h5>Tech District</h5>
                    <span>89 Properties</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Categories */}
            <div className="search-pane-section">
              <h4 className="search-section-label">Categories</h4>
              <div className="categories-pills-flow">
                {Object.keys(activeCategories).map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`category-pill-chip ${activeCategories[cat] ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer actions bar */}
        <footer className="search-overlay-footer">
          <div className="keyboard-navigation-guide">
            <span className="kbd-badge-wrap">
              <kbd className="kbd-icon-badge">↑↓</kbd>
              <span className="kbd-label-text">to navigate</span>
            </span>
            <span className="kbd-badge-wrap">
              <kbd className="kbd-icon-badge enter-kbd">Enter</kbd>
              <span className="kbd-label-text">to select</span>
            </span>
          </div>

          <button 
            onClick={() => {
              if (onSearchSubmit) onSearchSubmit(searchQuery || 'Smart Lock Access');
              onClose();
            }}
            className="btn-advanced-search-action"
          >
            Advanced Search
          </button>
        </footer>

      </div>
    </div>
  );
};

export default SearchOverlay;
