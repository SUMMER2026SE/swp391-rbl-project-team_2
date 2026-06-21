import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Menu, Bell, MessageSquare } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { ROUTES } from '../../constants';
import ThemeToggle from '../ui/ThemeToggle';
import { API_URL } from '../../config';
import { getAvatarUrl as getGlobalAvatar } from '../../utils/format';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchParams] = useSearchParams();
  const keywordParam = searchParams.get('keyword') || '';
  const [quickSearch, setQuickSearch] = React.useState(keywordParam);
  const [hasUnreadNotifications, setHasUnreadNotifications] = React.useState(false);

  React.useEffect(() => {
    setQuickSearch(keywordParam);
  }, [keywordParam]);

  const isNotificationsPage = location.pathname === ROUTES.TENANT.NOTIFICATIONS;

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      if (user.avatarUrl.startsWith('/uploads')) {
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${user.avatarUrl}`;
      }
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
                to={user?.role === 'LANDLORD' ? ROUTES.LANDLORD.NOTIFICATIONS : ROUTES.TENANT.NOTIFICATIONS}
                className={`header-bell-btn ${isNotificationsPage ? 'active' : ''}`}
              >
                <Bell size={20} />
                {hasUnreadNotifications && <span className="bell-badge-dot"></span>}
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
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to={ROUTES.LOGIN} className="sign-in-btn" style={{ background: 'transparent', color: '#6C3AED', border: '1px solid #6C3AED', padding: '0.4rem 1rem' }}>Log In</Link>
              <Link to={ROUTES.REGISTER} className="sign-in-btn" style={{ padding: '0.4rem 1rem' }}>Sign Up</Link>
            </div>
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
                  <img src={getGlobalAvatar(user?.fullName, user?.avatarUrl)} alt="Avatar" />
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
