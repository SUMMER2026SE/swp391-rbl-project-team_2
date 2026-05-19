import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Heart, User, Menu, Grid } from 'lucide-react';
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
            <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
            <div className="header-avatar">
              <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" />
            </div>
            <button className="icon-btn mobile-menu"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer-minimal">
        <div className="container footer-minimal-content">
          <div className="footer-left">
            &copy; 2024 SmartBoard AI. Modern housing for modern people.
          </div>
          <div className="footer-right">
            <Link to="#">Terms</Link>
            <Link to="#">Privacy</Link>
            <Link>Support</Link>
            <span>English</span>
            <button className="grid-icon-btn"><Grid size={20} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
