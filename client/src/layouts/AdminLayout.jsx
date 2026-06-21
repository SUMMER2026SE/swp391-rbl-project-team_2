import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import {
  MessageSquare,
  LogOut,
  Menu,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ThemeToggle from '../components/ui/ThemeToggle';
import { ROUTES } from '../constants';
import useAuthStore from '../store/useAuthStore';
import { supabase } from '../config/supabase';
import { API_URL } from '../config';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const isLandlord = location.pathname.startsWith('/landlord');
  const isAdmin = location.pathname.startsWith('/admin');
  const isTenant = !isLandlord && !isAdmin;
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
            <div className="topbar-left-actions" style={{ flex: 1 }}>
              <button className="sidebar-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                <Menu size={20} />
              </button>
            </div>

            {isLandlord && (
              <div className="topbar-center-actions" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="topbar-nav-links" style={{ marginLeft: 0 }}>
                  <NavLink to={ROUTES.LANDLORD.LISTINGS} className="topbar-nav-link">Listing</NavLink>
                  <NavLink to={ROUTES.LANDLORD.SCHEDULES} className="topbar-nav-link">Viewing Schedule</NavLink>
                  <NavLink to={ROUTES.LANDLORD.DEPOSITS} className="topbar-nav-link">Deposit</NavLink>
                  <NavLink to={ROUTES.LANDLORD.CONTRACTS} className="topbar-nav-link">Contract</NavLink>
                </div>
              </div>
            )}

            <div className="topbar-actions" style={{ flex: 1, justifyContent: 'flex-end' }}>
              <ThemeToggle />

              {/* Chat Icon */}
              <Link
                to={messagesPath}
                className={`topbar-icon-btn ${isMessagesActive ? 'active-chat-icon' : ''}`}
              >
                <MessageSquare size={20} />
              </Link>


              {/* Dynamic Avatar */}
              <div className="user-avatar-container" onClick={() => navigate(profilePath)}>
                <img src={getAvatarUrl()} alt="User Avatar" className="admin-avatar-img" />
              </div>

              <button
                onClick={handleLogout}
                style={{ background: 'transparent', color: '#6C3AED', border: '1px solid #6C3AED', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginLeft: '0.5rem' }}
              >
                Logout
              </button>
            </div>
          </header>

        {/* Dynamic Route Content */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>


    </div>
  );
};

export default AdminLayout;
