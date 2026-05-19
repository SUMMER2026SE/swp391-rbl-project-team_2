import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, Bell } from 'lucide-react';
import { ROUTES } from '../../constants';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const isNotificationsPage = location.pathname === ROUTES.TENANT.NOTIFICATIONS;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to={ROUTES.HOME} className="logo">
            SmartBoard
          </Link>
          {!isNotificationsPage && (
            <div className="header-search-bar">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Quick search..." />
            </div>
          )}
        </div>

        <nav className="header-tabs">
          <Link to={ROUTES.ROOMS} className={`tab-link ${location.pathname === ROUTES.ROOMS ? 'active' : ''}`}>Explore</Link>
          <Link to={ROUTES.TENANT.FAVORITES} className={`tab-link ${location.pathname === ROUTES.TENANT.FAVORITES ? 'active' : ''}`}>Favorites</Link>
          <Link to={ROUTES.TENANT.RENTAL_REQUEST || '#'} className={`tab-link ${location.pathname === ROUTES.TENANT.RENTAL_REQUEST ? 'active' : ''}`}>Requests</Link>
        </nav>

        <div className="header-right">
          {/* Notification Bell */}
          <Link 
            to={ROUTES.TENANT.NOTIFICATIONS} 
            className={`header-bell-btn ${isNotificationsPage ? 'active' : ''}`}
          >
            <Bell size={20} />
            <span className="bell-badge-dot"></span>
          </Link>
          
          <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
          <div className="header-avatar">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
          </div>
          <button className="mobile-menu-btn">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
