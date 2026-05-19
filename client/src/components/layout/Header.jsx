import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
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
          <nav className="header-tabs">
            <Link to={ROUTES.ROOMS} className={`tab-link ${location.pathname === ROUTES.ROOMS ? 'active' : ''}`}>Explore</Link>
            <Link to={ROUTES.TENANT.FAVORITES} className={`tab-link ${location.pathname === ROUTES.TENANT.FAVORITES ? 'active' : ''}`}>Favorites</Link>
            <Link to="#" className="tab-link">Requests</Link>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-search-wrapper">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
          <div className="header-avatar">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
