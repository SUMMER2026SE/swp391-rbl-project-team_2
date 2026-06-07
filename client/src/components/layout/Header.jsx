import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, Bell, MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { ROUTES } from '../../constants';
import ThemeToggle from '../ui/ThemeToggle';
import { API_URL } from '../../config';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchParams] = useSearchParams();
  const keywordParam = searchParams.get('keyword') || '';
  const [quickSearch, setQuickSearch] = React.useState(keywordParam);

  React.useEffect(() => {
    setQuickSearch(keywordParam);
  }, [keywordParam]);

  const isNotificationsPage = location.pathname === ROUTES.TENANT.NOTIFICATIONS;

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      // If it's a relative path from our server
      if (user.avatarUrl.startsWith('/uploads')) {
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${user.avatarUrl}`;
      }
      // If it's a full URL (e.g., from Google)
      return user.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`;
  };

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
          {isAuthenticated && (
            <button className="sidebar-toggle-btn" onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Menu size={22} />
            </button>
          )}
          <Link to={ROUTES.HOME} className="logo">
            RentalRoom
          </Link>
          {!isNotificationsPage && (
            <div className="header-search-bar">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (quickSearch.trim()) {
                      navigate(`${ROUTES.ROOMS}?keyword=${encodeURIComponent(quickSearch.trim())}`);
                    } else {
                      navigate(ROUTES.ROOMS);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>

        <nav className="header-tabs">
          {isAuthenticated && user?.role === 'LANDLORD' ? (
            <>
              <Link to="/landlord/dashboard" className={`tab-link ${location.pathname === '/landlord/dashboard' || location.pathname === '/landlord' ? 'active' : ''}`} style={{ fontWeight: '700', color: '#2563EB' }}>Landlord Dashboard</Link>
              <Link to={ROUTES.LANDLORD.LISTINGS} className={`tab-link ${location.pathname === ROUTES.LANDLORD.LISTINGS ? 'active' : ''}`}>My Listings</Link>
              <Link to={ROUTES.LANDLORD.MESSAGES} className={`tab-link ${location.pathname === ROUTES.LANDLORD.MESSAGES ? 'active' : ''}`}>Messages</Link>
            </>
          ) : (
            <>
              <Link to={ROUTES.HOME} className={`tab-link ${location.pathname === ROUTES.HOME ? 'active' : ''}`}>Home</Link>
              <Link to={ROUTES.ROOMS} className={`tab-link ${location.pathname === ROUTES.ROOMS ? 'active' : ''}`}>Explore</Link>
              {isAuthenticated && user?.role !== 'ADMIN' && (
                <>
                  <Link to={ROUTES.TENANT.FAVORITES} className={`tab-link ${location.pathname === ROUTES.TENANT.FAVORITES ? 'active' : ''}`}>Favorites</Link>
                  <Link to="/tenant/requests" className={`tab-link ${location.pathname === '/tenant/requests' ? 'active' : ''}`}>Requests</Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="header-right">
          <ThemeToggle />
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to={ROUTES.TENANT.NOTIFICATIONS}
                className={`header-bell-btn ${isNotificationsPage ? 'active' : ''}`}
              >
                <Bell size={20} />
                <span className="bell-badge-dot"></span>
              </Link>
              <Link
                to="/messages"
                className={`header-bell-btn ${location.pathname.startsWith('/messages') ? 'active' : ''}`}
              >
                <MessageSquare size={20} />
              </Link>
            </div>
          )}
          {!isAuthenticated ? (
            <Link to={ROUTES.LOGIN} className="sign-in-btn">Sign In</Link>
          ) : (
            <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user?.role === 'LANDLORD' && (
                <Link 
                  to="/landlord/dashboard" 
                  className="sign-in-btn" 
                  style={{ background: '#2563EB', color: 'white', border: 'none', padding: '0.4rem 0.9rem', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', borderRadius: '4px' }}
                >
                  Landlord Portal
                </Link>
              )}
              <Link to={user?.role === 'LANDLORD' ? ROUTES.LANDLORD.PROFILE : ROUTES.TENANT.PROFILE}>
                <div className="header-avatar" title="Profile">
                  <img src={getAvatarUrl()} alt="Avatar" />
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
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
