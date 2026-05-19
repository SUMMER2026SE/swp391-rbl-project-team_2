import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { ROUTES } from '../../constants';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
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
  );
};

export default Header;
