import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, Bell } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { ROUTES } from '../../constants';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isNotificationsPage = location.pathname === ROUTES.TENANT.NOTIFICATIONS;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to={ROUTES.HOME} className="logo">
            RentalRoom
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
          {!isAuthenticated ? (
            <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
          ) : (
            <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to={ROUTES.TENANT.PROFILE}>
                <div className="header-avatar" title="Profile">
                  <img src={`https://ui-avatars.com/api/?name=${user?.user_metadata?.fullName || 'User'}&background=random`} alt="Avatar" />
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="sign-in-btn"
                style={{ background: 'transparent', color: '#6C3AED', border: '1px solid #6C3AED', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          )}
          <button className="mobile-menu-btn">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
