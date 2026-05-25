import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MapPin, Shield, Star, Home } from 'lucide-react';
import authRoomHero from '../assets/images/auth-room-hero.png';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* ════════ LEFT IMAGE PANEL ════════ */}
      <div className="auth-brand-panel">
        {/* Background image */}
        <img src={authRoomHero} alt="Modern rental room" className="brand-bg-image" />

        {/* Gradient overlay */}
        <div className="brand-overlay" />

        {/* Floating particles */}
        <div className="brand-particles">
          <div className="particle particle--1" />
          <div className="particle particle--2" />
          <div className="particle particle--3" />
          <div className="particle particle--4" />
          <div className="particle particle--5" />
        </div>

        {/* Content */}
        <div className="brand-content">
          <Link to={ROUTES.HOME} className="brand-logo">
            <Home size={22} />
            RentalRoom
          </Link>

          <div className="brand-hero">
            <h1 className="brand-title">
              Find Your <br />
              <span className="brand-title-accent">Perfect Room</span>
            </h1>
            <p className="brand-subtitle">
              Discover comfortable, verified rooms in your ideal location. Your next home is just a click away.
            </p>
          </div>

          {/* Feature pills */}
          <div className="brand-features">
            <div className="brand-feature-pill">
              <Shield size={14} />
              Verified Listings
            </div>
            <div className="brand-feature-pill">
              <MapPin size={14} />
              Prime Locations
            </div>
            <div className="brand-feature-pill">
              <Star size={14} />
              Trusted Reviews
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="brand-stats">
          <div className="brand-stat">
            <span className="stat-number">2,500+</span>
            <span className="stat-label">Active Rooms</span>
          </div>
          <div className="brand-stat-divider" />
          <div className="brand-stat">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Happy Tenants</span>
          </div>
          <div className="brand-stat-divider" />
          <div className="brand-stat">
            <span className="stat-number">4.9★</span>
            <span className="stat-label">User Rating</span>
          </div>
        </div>
      </div>

      {/* ════════ RIGHT FORM PANEL ════════ */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-card">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="auth-footer">
            <p>© 2026 RentalRoom. All rights reserved.</p>
            <div className="auth-footer-links">
              <Link to="#">Terms</Link>
              <Link to="#">Privacy</Link>
              <Link to="#">Support</Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
