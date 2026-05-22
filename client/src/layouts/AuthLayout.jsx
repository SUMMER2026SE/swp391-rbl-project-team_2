import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { Shield, Star, Zap } from 'lucide-react';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* ════════ LEFT BRANDING PANEL ════════ */}
      <div className="auth-brand-panel">
        {/* Animated blobs */}
        <div className="brand-blob brand-blob--1" />
        <div className="brand-blob brand-blob--2" />
        <div className="brand-blob brand-blob--3" />

        {/* Grid pattern overlay */}
        <div className="brand-grid-overlay" />

        {/* Content */}
        <div className="brand-content">
          <Link to={ROUTES.HOME} className="brand-logo">
            <span className="brand-logo-icon">⬡</span>
            RentalRoom
          </Link>

          <div className="brand-hero">
            <h1 className="brand-title">
              Find Your <br />
              <span className="brand-title-accent">Perfect Room</span>
            </h1>
            <p className="brand-subtitle">
              Smart boarding platform powered by AI. Discover, manage, and rent rooms with ease.
            </p>
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
