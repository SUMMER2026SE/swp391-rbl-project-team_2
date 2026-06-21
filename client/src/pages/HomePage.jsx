import React, { useEffect } from 'react';
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
  Coins
} from 'lucide-react';
import { ROUTES } from '../constants';
import Button from '../components/common/Button';
import useAuthStore from '../store/useAuthStore';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container-centered">
          <div className="badge-promo">
            <span className="badge-glowing-dot"></span>
            <Sparkles size={14} className="text-indigo" />
            <span>AI-Powered Smart Rental Matching</span>
          </div>
          <h1 className="hero-title">
            Find your perfect stay, <span className="text-gradient">smarter.</span>
          </h1>
          <p className="hero-subtitle">
            Find and secure the perfect student room or boarding house near your university with ease. Connect with verified landlords directly.
          </p>
          <div className="hero-action-buttons">
            <Button 
              variant="primary" 
              size="large" 
              onClick={() => navigate(ROUTES.ROOMS)}
              className="hero-primary-btn"
            >
              Find a Room <ArrowRight size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="large" 
              onClick={() => navigate('/register?role=landlord')}
              className="hero-secondary-btn"
            >
              List Your Property
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="hero-metrics">
            <div className="metric-item">
              <span className="metric-num">5k+</span>
              <span className="metric-label">Active Students</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-num">1.2k+</span>
              <span className="metric-label">Verified Rooms</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-num">98.4%</span>
              <span className="metric-label">Match Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Features Section */}
      <section className="role-features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Select Your Path</h2>
            <p>Designed to satisfy both landlords looking to rent out and tenants looking for a home.</p>
          </div>
          <div className="role-grid">
            {/* Landlord Card */}
            <div className="role-card landlord-card">
              <div className="role-card-content">
                <div className="role-icon-wrapper landlord">
                  <Building size={32} />
                </div>
                <h3 className="role-title">I am a Landlord</h3>
                <p className="role-desc">
                  Post your rooms, manage listings, and reach thousands of students searching for accommodation.
                </p>
                
                <div className="role-bullets">
                  <div className="bullet-item">
                    <div className="bullet-icon landlord-bullet">
                      <Megaphone size={16} />
                    </div>
                    <span>Easy room listing & management</span>
                  </div>
                  <div className="bullet-item">
                    <div className="bullet-icon landlord-bullet">
                      <Lock size={16} />
                    </div>
                    <span>Reach active tenants</span>
                  </div>
                  <div className="bullet-item">
                    <div className="bullet-icon landlord-bullet">
                      <TrendingUp size={16} />
                    </div>
                    <span>Boost visibility & bookings</span>
                  </div>
                </div>
                
                <button 
                  className="role-action-btn landlord-btn" 
                  onClick={() => navigate('/register?role=landlord')}
                >
                  Start Listing Rooms &rarr;
                </button>
              </div>

              {/* Landlord Mock Mini Widget */}
              <div className="role-mock-widget landlord-mock">
                <div className="widget-header">
                  <span>Dashboard Overview</span>
                  <span className="dot-green-pulse"></span>
                </div>
                <div className="widget-stats-grid">
                  <div className="widget-stat">
                    <span className="stat-lbl">Active Listings</span>
                    <span className="stat-val text-amber">3 Rooms</span>
                  </div>
                  <div className="widget-stat">
                    <span className="stat-lbl">Secured Deposit</span>
                    <span className="stat-val text-indigo">4.2M VND</span>
                  </div>
                </div>
                <div className="widget-graph">
                  <div className="graph-bar bar1"></div>
                  <div className="graph-bar bar2"></div>
                  <div className="graph-bar bar3"></div>
                  <div className="graph-bar bar4"></div>
                  <div className="graph-bar bar5"></div>
                </div>
                <div className="widget-graph-caption">Views count increased by 15.4%</div>
              </div>
            </div>

            {/* Tenant Card */}
            <div className="role-card tenant-card">
              <div className="role-card-content">
                <div className="role-icon-wrapper tenant">
                  <User size={32} />
                </div>
                <h3 className="role-title">I am a Tenant</h3>
                <p className="role-desc">
                  Find the perfect boarding room, verify landlord listings, and secure your room deposit safely.
                </p>
                
                <div className="role-bullets">
                  <div className="bullet-item">
                    <div className="bullet-icon tenant-bullet">
                      <Search size={16} />
                    </div>
                    <span>Search rooms by location & budget</span>
                  </div>
                  <div className="bullet-item">
                    <div className="bullet-icon tenant-bullet">
                      <ShieldCheck size={16} />
                    </div>
                    <span>Secure deposit holding protection</span>
                  </div>
                  <div className="bullet-item">
                    <div className="bullet-icon tenant-bullet">
                      <Calendar size={16} />
                    </div>
                    <span>Book in-person viewing slots</span>
                  </div>
                </div>
                
                <button 
                  className="role-action-btn tenant-btn" 
                  onClick={() => navigate(ROUTES.ROOMS)}
                >
                  Find a Room Now &rarr;
                </button>
              </div>

              {/* Tenant Mock Mini Widget */}
              <div className="role-mock-widget tenant-mock">
                <div className="widget-header">
                  <span>Viewing Schedule</span>
                  <span className="badge-booking-status">APPROVED</span>
                </div>
                <div className="widget-booking-details">
                  <div className="booking-info">
                    <span className="booking-room">Green Villa Studio, Room 302</span>
                    <span className="booking-time">Sun, June 21 at 15:30</span>
                  </div>
                  <div className="booking-landlord">
                    <span className="landlord-lbl">Landlord:</span>
                    <span className="landlord-val">Minh Hoang</span>
                  </div>
                </div>
                <div className="widget-booking-action">
                  <span>Status: Confirmed & Deposit Paid</span>
                </div>
              </div>
            </div>
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
              <p>Book a time to see the room in person and pay a small deposit to secure your slot.</p>
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
