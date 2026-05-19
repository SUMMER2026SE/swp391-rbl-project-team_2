import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Top Left Logo */}
      <header className="auth-header">
        <Link to={ROUTES.HOME} className="auth-logo">
          SmartBoard
        </Link>
      </header>

      {/* Center Form */}
      <div className="auth-container">
        <div className="auth-card">
          <Outlet />
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="auth-footer">
        <div className="auth-footer-content">
          <p>© 2024 SmartBoard AI. Modern housing for modern people.</p>
          <div className="auth-footer-links">
            <Link to="#">Terms</Link>
            <Link to="#">Privacy</Link>
            <Link to="#">Support</Link>
            <Link to="#">English (US)</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
