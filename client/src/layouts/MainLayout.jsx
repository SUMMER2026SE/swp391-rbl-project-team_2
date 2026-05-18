import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Heart, User, Menu } from 'lucide-react';
import { ROUTES } from '../constants';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const isAuthenticated = false; // Mock state, ideally from useAuthStore

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="header-left">
            <Link to={ROUTES.HOME} className="logo">
              SmartBoard
            </Link>
            <div className="quick-search">
              <Search className="quick-search-icon" size={16} />
              <input type="text" placeholder="Quick search..." />
            </div>
          </div>
          
          <nav className="header-tabs">
            <Link to={ROUTES.ROOMS} className={`tab-link ${location.pathname === ROUTES.ROOMS ? 'active' : ''}`}>Explore</Link>
            <Link to={ROUTES.TENANT.FAVORITES} className={`tab-link ${location.pathname === ROUTES.TENANT.FAVORITES ? 'active' : ''}`}>Favorites</Link>
            <Link to="#" className="tab-link">Requests</Link>
          </nav>

          <div className="header-right">
            {isAuthenticated ? (
              <button className="user-profile-btn">
                <User size={20} />
              </button>
            ) : (
              <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
            )}
            <button className="icon-btn mobile-menu"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <h3>SmartBoard AI</h3>
            <p>Modern housing for modern people.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>About Us</h4>
              <Link to="#">Company</Link>
              <Link to="#">Terms of Service</Link>
            </div>
            <div>
              <h4>Support</h4>
              <Link to="#">Help Center</Link>
              <Link to="#">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartBoard AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
