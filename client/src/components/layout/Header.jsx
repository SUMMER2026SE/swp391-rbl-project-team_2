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
          <button className="icon-btn search-btn">
            <Search size={20} />
          </button>
          <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
          <div className="header-avatar">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
