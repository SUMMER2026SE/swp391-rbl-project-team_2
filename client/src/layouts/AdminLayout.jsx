import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  Search,
  LogOut,
  Menu,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import SearchOverlay from '../components/ui/SearchOverlay';
import ThemeToggle from '../components/ui/ThemeToggle';
import { ROUTES } from '../constants';
import useAuthStore from '../store/useAuthStore';
import { API_URL } from '../config';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const isLandlord = location.pathname.startsWith('/landlord');
  const isAdmin = location.pathname.startsWith('/admin');
  const isTenant = !isLandlord && !isAdmin;

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isTenant);

  // Route Protection: Keep users in their proper role area
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.warn('🔴 Route Protection: User not authenticated, redirecting to login');
      navigate(ROUTES.LOGIN, { state: { from: location.pathname }, replace: true });
      return;
    }

    const userRole = user.role || 'TENANT';
    
    if (isLandlord && userRole !== 'LANDLORD') {
      console.warn(`🔴 Route Protection: Role [${userRole}] cannot access landlord dashboard. Redirecting home.`);
      navigate(ROUTES.HOME, { replace: true });
      return;
    }

    if (isAdmin && userRole !== 'ADMIN') {
      console.warn(`🔴 Route Protection: Role [${userRole}] cannot access admin dashboard. Redirecting home.`);
      navigate(ROUTES.HOME, { replace: true });
      return;
    }
  }, [isAuthenticated, user, location.pathname, isLandlord, isAdmin, navigate]);



  if (!isAuthenticated || !user) {
    return null; // Don't render anything while redirecting
  }

  const userRole = user.role || 'TENANT';
  if (isLandlord && userRole !== 'LANDLORD') return null;
  if (isAdmin && userRole !== 'ADMIN') return null;

  // Dynamic route references based on role
  const notificationsPath = isLandlord ? ROUTES.LANDLORD.NOTIFICATIONS : isAdmin ? ROUTES.ADMIN.NOTIFICATIONS : ROUTES.TENANT.NOTIFICATIONS;
  const messagesPath = isLandlord ? ROUTES.LANDLORD.MESSAGES : isAdmin ? ROUTES.ADMIN.MESSAGES : '/messages';
  const helpPath = isLandlord ? ROUTES.LANDLORD.HELP : isAdmin ? ROUTES.ADMIN.HELP : ROUTES.HELP;
  const profilePath = isLandlord ? ROUTES.LANDLORD.PROFILE : isAdmin ? ROUTES.ADMIN.SETTINGS : ROUTES.TENANT.PROFILE;

  const isMessagesActive = location.pathname === messagesPath;

  // Remove hideTopbar completely so all pages get the Topbar and the hamburger menu
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

  return (
    <div className={`admin-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Left Sidebar */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={() => setIsCollapsed(!isCollapsed)} />

      {/* Main Content Area */}
      <div className="admin-main-container">

        {/* Topbar */}
        <header className="admin-topbar">
            <div className="topbar-left-actions">
              <button className="sidebar-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                <Menu size={20} />
              </button>
              <div
                className="topbar-search"
                onClick={() => setShowSearchOverlay(true)}
                style={{ cursor: 'pointer' }}
              >
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search..." readOnly style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <div className="topbar-actions">
              <ThemeToggle />
              {/* Notification Bell */}
              <Link to={notificationsPath} className="topbar-icon-btn">
                <Bell size={20} />
                <span className="badge-dot"></span>
              </Link>

              {/* Chat Icon */}
              <Link
                to={messagesPath}
                className={`topbar-icon-btn ${isMessagesActive ? 'active-chat-icon' : ''}`}
              >
                <MessageSquare size={20} />
              </Link>

              <div className="divider-vertical"></div>

              {/* Support link */}
              <Link to={helpPath} className="btn-support">Support</Link>

              {/* Exit Dashboard — navigates to public home page */}
              <button 
                className="btn-exit-dashboard"
                onClick={() => navigate('/')}
              >
                <LogOut size={16} />
                <span>Exit Dashboard</span>
              </button>

              {/* Dynamic Avatar */}
              <div className="user-avatar-container" onClick={() => navigate(profilePath)}>
                <img src={getAvatarUrl()} alt="User Avatar" className="admin-avatar-img" />
              </div>
            </div>
          </header>

        {/* Dynamic Route Content */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>

      {showSearchOverlay && (
        <SearchOverlay
          onClose={() => setShowSearchOverlay(false)}
          onSearchSubmit={(query) => {
            console.log('Search submitted:', query);
          }}
        />
      )}
    </div>
  );
};

export default AdminLayout;
