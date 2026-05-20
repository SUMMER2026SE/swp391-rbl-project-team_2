import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Sliders,
  CreditCard,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { ROUTES } from '../constants';
import Button from '../components/common/Button';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(ROUTES.LOGIN);
  };

  const handleExploreRooms = () => {
    navigate(ROUTES.ROOMS);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        
        {/* Full-width Background Image on the right with smooth fade-out gradient to the left */}
        <div className="hero-bg-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&h=800&q=80" 
            alt="Cozy clean bedroom interior" 
            className="hero-bg-img"
          />
          <div className="hero-bg-overlay"></div>
        </div>

        <div className="container hero-container">
          
          {/* Left Column: Text & Stats */}
          <div className="hero-text-side">
            <div className="ai-badge">
              <Sparkles size={16} className="ai-badge-icon" />
              <span>AI-Powered Matching</span>
            </div>
            
            <h1 className="hero-title">
              Find your perfect stay with AI<span className="hero-title-dot">.</span>
            </h1>
            
            <p className="hero-subtitle">
              Smart room rental platform for students and young professionals. Discover verified listings tailored to your lifestyle and budget, instantly.
            </p>
            
            <div className="hero-actions">
              <Button variant="primary" size="lg" onClick={handleGetStarted}>
                Get Started
              </Button>
              <Button variant="outline" size="lg" onClick={handleExploreRooms}>
                Explore Rooms
              </Button>
            </div>
            
            <div className="hero-divider-line"></div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.9/5</span>
                <span className="stat-label">App Store Rating</span>
              </div>
            </div>
          </div>
          
          {/* Right Column: Floating AI Card on top of Background Image */}
          <div className="hero-graphic-side">
            <div className="floating-ai-card">
              <div className="ai-card-header">
                <div className="ai-search-icon-circle">
                  <Search size={18} />
                </div>
                <div className="ai-search-info">
                  <span className="ai-search-title">Smart Search Active</span>
                  <span className="ai-search-desc">Finding matches near Downtown...</span>
                </div>
              </div>
              
              <div className="ai-progress-container">
                <div className="ai-progress-bar">
                  <div className="ai-progress-fill"></div>
                </div>
                <div className="ai-progress-labels">
                  <span>Scanning verified listings</span>
                  <span className="percentage-text">68%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Floating Search Filter Bar at bottom of Hero */}
        <div className="container filter-bar-container">
          <div className="search-filter-bar">
            
            {/* Location Field */}
            <div className="filter-field">
              <div className="filter-field-icon">
                <MapPin size={18} />
              </div>
              <div className="filter-field-text">
                <span className="field-label">Location</span>
                <input 
                  type="text" 
                  placeholder="Where are you moving?" 
                  className="field-input" 
                />
              </div>
            </div>
            
            <div className="filter-divider"></div>
            
            {/* Move-in Date Field */}
            <div className="filter-field">
              <div className="filter-field-icon">
                <Calendar size={18} />
              </div>
              <div className="filter-field-text">
                <span className="field-label">Move-in Date</span>
                <input 
                  type="text" 
                  placeholder="Add dates" 
                  className="field-input" 
                />
              </div>
            </div>
            
            <div className="filter-divider"></div>
            
            {/* Budget Field */}
            <div className="filter-field">
              <div className="filter-field-icon">
                <DollarSign size={18} />
              </div>
              <div className="filter-field-text">
                <span className="field-label">Budget</span>
                <input 
                  type="text" 
                  placeholder="Monthly max" 
                  className="field-input" 
                />
              </div>
            </div>
            
            {/* Search Action Button */}
            <button className="filter-search-btn" onClick={handleExploreRooms}>
              <Search size={18} />
              <span>Search</span>
            </button>
            
          </div>
        </div>
      </section>

      {/* Why Choose Smart Stay Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2>Why choose Smart Stay?</h2>
            <p>We've reimagined the rental experience to be seamless, secure, and tailored exactly to your needs.</p>
          </div>
          
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={26} />
              </div>
              <h3>Verified Listings</h3>
              <p>Every room is physically inspected and verified by our team to ensure it meets our quality standards.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <Sliders size={26} />
              </div>
              <h3>AI Matchmaking</h3>
              <p>Our algorithm considers your lifestyle, commute, and preferences to suggest the perfect housemates.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box">
                <CreditCard size={26} />
              </div>
              <h3>Seamless Payments</h3>
              <p>Handle rent, utilities, and deposits through our secure, transparent digital platform with no hidden fees.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Chat Widget Circle Button (Bottom Right) */}
      <button className="floating-chat-widget" onClick={() => navigate(ROUTES.TENANT.CHAT)}>
        <Sparkles size={24} />
      </button>
    </div>
  );
};

export default HomePage;
