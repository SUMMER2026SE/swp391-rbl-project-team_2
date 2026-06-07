import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Star, 
  ArrowRight, 
  Wifi, 
  Dumbbell,
  ArrowUpRight
} from 'lucide-react';
import { ROUTES } from '../constants';
import Button from '../components/common/Button';
import useAuthStore from '../store/useAuthStore';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'LANDLORD') {
      navigate('/landlord/dashboard', { replace: true });
    } else if (isAuthenticated && user?.role === 'ADMIN') {
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSearch = () => {
    const params = searchQuery ? `?keyword=${encodeURIComponent(searchQuery)}` : '';
    navigate(`${ROUTES.ROOMS}${params}`);
  };

  const handleCustomSearch = () => {
    navigate(ROUTES.TENANT.CHAT);
  };

  return (
    <div className="home-page">
      {/* Background Decorators */}
      <div className="bg-glow-blur bg-glow-primary"></div>
      <div className="bg-glow-blur bg-glow-secondary"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find your perfect stay, <span className="text-gradient">smarter.</span>
            </h1>
            <p className="hero-subtitle">
              Use our advanced AI to discover modern boarding houses that match your exact lifestyle and budget.
            </p>

            {/* Quick Filters */}
            <div className="quick-filters">
              <button className="filter-chip">Under 3M/month</button>
              <button className="filter-chip">Near Metro Station</button>
              <button className="filter-chip">Pet Friendly</button>
              <button className="filter-chip">Private Bathroom</button>
            </div>

            {/* AI Search Bar */}
            <div className="ai-search-wrapper">
              <div className="ai-search-bar">
                <Sparkles size={20} className="ai-icon" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder='Ask our AI: "I need a room under 4M near District 1"' 
                  className="ai-search-input"
                />
                <Button variant="primary" className="search-btn" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header">
            <div>
              <h2 className="featured-title">Featured Listings</h2>
              <p className="featured-subtitle">Top-rated modern spaces tailored for you.</p>
            </div>
            <Button variant="outline" className="view-all-btn" onClick={() => navigate(ROUTES.ROOMS)}>
              View all <ArrowRight size={16} />
            </Button>
          </div>

          <div className="bento-grid">
            
            {/* Promo Card (4 cols) */}
            <div className="bento-card promo-card">
              <div className="promo-content">
                <div className="promo-icon-wrapper">
                  <Sparkles size={28} className="promo-icon" />
                </div>
                <div className="promo-text">
                  <h3 className="promo-title">Can't find the perfect match?</h3>
                  <p className="promo-desc">Let our AI agent do the heavy lifting. Tell us what you need.</p>
                </div>
                <Button variant="primary" className="custom-search-btn" onClick={handleCustomSearch}>
                  Start Custom Search <ArrowUpRight size={16} />
                </Button>
              </div>
            </div>

            {/* Nexus Urban Lofts (8 cols) */}
            <div className="bento-card large-card" onClick={() => navigate(ROUTES.ROOM_DETAIL)}>
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" 
                  alt="The Nexus Urban Lofts" 
                />
                <div className="price-tag-overlay">
                  $650<span className="price-mo">/mo</span>
                </div>
              </div>
              <div className="card-info">
                <div className="card-main-info">
                  <h3 className="card-title">The Nexus Urban Lofts</h3>
                  <div className="card-location">
                    <MapPin size={14}/> District 1, Tech Hub
                  </div>
                  <div className="card-amenities">
                    <span className="amenity-badge"><Wifi size={14}/> High-Speed Wi-Fi</span>
                    <span className="amenity-badge"><Dumbbell size={14}/> Gym Access</span>
                  </div>
                </div>
                <div className="card-divider"></div>
                <div className="card-footer">
                  <div className="rating">
                    <Star size={16} className="star-icon" fill="currentColor"/> 
                    <span className="rating-score">4.9</span>
                    <span className="reviews">(128 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Oakwood Studios (4 cols) */}
            <div className="bento-card small-card" onClick={() => navigate(ROUTES.ROOM_DETAIL)}>
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80" 
                  alt="Oakwood Studios" 
                />
                <div className="price-tag-overlay">
                  $420<span className="price-mo">/mo</span>
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">Oakwood Studios</h3>
                <div className="card-location">
                  <MapPin size={14}/> District 3, Cultural Area
                </div>
                <div className="card-divider"></div>
                <div className="card-footer">
                  <div className="rating">
                    <Star size={14} className="star-icon" fill="currentColor"/> 
                    <span className="rating-score">4.7</span>
                  </div>
                  <div className="room-type">Private Room</div>
                </div>
              </div>
            </div>

            {/* Vertex Co-Living (4 cols) */}
            <div className="bento-card small-card" onClick={() => navigate(ROUTES.ROOM_DETAIL)}>
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=600&q=80" 
                  alt="Vertex Co-Living" 
                />
                <div className="price-tag-overlay">
                  $550<span className="price-mo">/mo</span>
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">Vertex Co-Living</h3>
                <div className="card-location">
                  <MapPin size={14}/> District 7, Riverside
                </div>
                <div className="card-divider"></div>
                <div className="card-footer">
                  <div className="rating">
                    <Star size={14} className="star-icon" fill="currentColor"/> 
                    <span className="rating-score">4.8</span>
                  </div>
                  <div className="room-type">Studio</div>
                </div>
              </div>
            </div>

            {/* Eco Sharehouse (4 cols) */}
            <div className="bento-card small-card" onClick={() => navigate(ROUTES.ROOM_DETAIL)}>
              <div className="card-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80" 
                  alt="Eco Sharehouse" 
                />
                <div className="price-tag-overlay">
                  $380<span className="price-mo">/mo</span>
                </div>
              </div>
              <div className="card-info">
                <h3 className="card-title">Eco Sharehouse</h3>
                <div className="card-location">
                  <MapPin size={14}/> District 2, Minimalist Hub
                </div>
                <div className="card-divider"></div>
                <div className="card-footer">
                  <div className="rating">
                    <Star size={14} className="star-icon" fill="currentColor"/> 
                    <span className="rating-score">4.6</span>
                  </div>
                  <div className="room-type">Shared Room</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Popular Areas Section */}
      <section className="popular-areas-section">
        <div className="container">
          <h2 className="popular-areas-title">Popular Areas</h2>
          
          <div className="areas-grid">
            {/* District 1 */}
            <div className="area-card" onClick={() => navigate(ROUTES.ROOMS)}>
              <div className="area-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1596443686812-2717610be2cb?auto=format&fit=crop&w=600&q=80" 
                  alt="District 1" 
                />
                <div className="area-overlay"></div>
              </div>
              <div className="area-info">
                <h3 className="area-name">District 1</h3>
                <p className="area-places">142 places</p>
              </div>
            </div>

            {/* District 2 */}
            <div className="area-card" onClick={() => navigate(ROUTES.ROOMS)}>
              <div className="area-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1549925232-a5e2f98e6c40?auto=format&fit=crop&w=600&q=80" 
                  alt="District 2" 
                />
                <div className="area-overlay"></div>
              </div>
              <div className="area-info">
                <h3 className="area-name">District 2</h3>
                <p className="area-places">85 places</p>
              </div>
            </div>

            {/* District 3 */}
            <div className="area-card" onClick={() => navigate(ROUTES.ROOMS)}>
              <div className="area-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80" 
                  alt="District 3" 
                />
                <div className="area-overlay"></div>
              </div>
              <div className="area-info">
                <h3 className="area-name">District 3</h3>
                <p className="area-places">110 places</p>
              </div>
            </div>

            {/* District 7 */}
            <div className="area-card" onClick={() => navigate(ROUTES.ROOMS)}>
              <div className="area-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80" 
                  alt="District 7" 
                />
                <div className="area-overlay"></div>
              </div>
              <div className="area-info">
                <h3 className="area-name">District 7</h3>
                <p className="area-places">94 places</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
