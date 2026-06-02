import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  Search,
  ChevronDown,
  LayoutDashboard,
  Building2,
  ClipboardList,
  UserCircle,
  PlusCircle,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import SearchOverlay from '../components/ui/SearchOverlay';
import { ROUTES } from '../constants';
import useAuthStore from '../store/useAuthStore';
import { API_URL } from '../config';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const quickActionRef = useRef(null);

  // Detect role context from current URL
  const isLandlord = location.pathname.startsWith('/landlord');
  const isAdmin = location.pathname.startsWith('/admin');

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

  // Click outside listener for the quick action menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionRef.current && !quickActionRef.current.contains(event.target)) {
        setShowQuickAction(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return null; // Don't render anything while redirecting
  }

  const userRole = user.role || 'TENANT';
  if (isLandlord && userRole !== 'LANDLORD') return null;
  if (isAdmin && userRole !== 'ADMIN') return null;

  // Dynamic route references based on role
  const notificationsPath = isLandlord ? ROUTES.LANDLORD.NOTIFICATIONS : ROUTES.ADMIN.NOTIFICATIONS;
  const messagesPath = isLandlord ? ROUTES.LANDLORD.MESSAGES : ROUTES.ADMIN.MESSAGES;
  const helpPath = isLandlord ? ROUTES.LANDLORD.HELP : ROUTES.ADMIN.HELP;

  const isMessagesActive = location.pathname === messagesPath;

  // Hide topbar on specific pages
  const hideTopbar =
    location.pathname === ROUTES.LANDLORD.REQUESTS ||
    location.pathname === ROUTES.LANDLORD.SETTINGS ||
    location.pathname === ROUTES.ADMIN.SETTINGS;

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
    <div className="admin-layout">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="admin-main-container">

        {/* Topbar */}
        {!hideTopbar && (
          <header className="admin-topbar">
            <div
              className="topbar-search"
              onClick={() => setShowSearchOverlay(true)}
              style={{ cursor: 'pointer' }}
            >
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." readOnly style={{ cursor: 'pointer' }} />
            </div>

            <div className="topbar-actions">
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

              {/* Quick Action Dropdown (Landlord Fast Nav Shortcuts) */}
              {isLandlord ? (
                <div className="quick-action-wrapper" ref={quickActionRef}>
                  <button 
                    className="btn-quick-action"
                    onClick={() => setShowQuickAction(!showQuickAction)}
                  >
                    <span>Quick Navigation</span>
                    <ChevronDown size={14} />
                  </button>
                  
                  {showQuickAction && (
                    <div className="quick-action-dropdown">
                      <Link 
                        to={ROUTES.LANDLORD.DASHBOARD} 
                        className="quick-action-dropdown-item"
                        onClick={() => setShowQuickAction(false)}
                      >
                        <LayoutDashboard size={16} />
                        <span>Go to Dashboard</span>
                      </Link>
                      <Link 
                        to={ROUTES.LANDLORD.LISTINGS} 
                        className="quick-action-dropdown-item"
                        onClick={() => setShowQuickAction(false)}
                      >
                        <Building2 size={16} />
                        <span>Manage Listings</span>
                      </Link>
                      <Link 
                        to={ROUTES.LANDLORD.MESSAGES} 
                        className="quick-action-dropdown-item"
                        onClick={() => setShowQuickAction(false)}
                      >
                        <MessageSquare size={16} />
                        <span>Open Messages</span>
                      </Link>
                      <Link 
                        to={ROUTES.LANDLORD.REQUESTS} 
                        className="quick-action-dropdown-item"
                        onClick={() => setShowQuickAction(false)}
                      >
                        <ClipboardList size={16} />
                        <span>Manage Bookings</span>
                      </Link>
                      <div className="quick-action-dropdown-divider"></div>
                      <Link 
                        to={ROUTES.LANDLORD.PROFILE} 
                        className="quick-action-dropdown-item"
                        onClick={() => setShowQuickAction(false)}
                      >
                        <UserCircle size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link 
                        to={ROUTES.LANDLORD.NEW_LISTING} 
                        className="quick-action-dropdown-item"
                        onClick={() => setShowQuickAction(false)}
                        style={{ color: '#2563EB', fontWeight: '600' }}
                      >
                        <PlusCircle size={16} style={{ color: '#2563EB' }} />
                        <span>Add New Listing</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn-quick-action">
                  <span>Quick Action</span>
                  <ChevronDown size={14} />
                </button>
              )}

              {/* Dynamic Avatar */}
              <div className="user-avatar-container" onClick={() => navigate(isLandlord ? ROUTES.LANDLORD.PROFILE : ROUTES.ADMIN.SETTINGS)}>
                <img src={getAvatarUrl()} alt="User Avatar" className="admin-avatar-img" />
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Route Content */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>

      {/* Floating Action Menu for Landlord (Fast Mobile/Desktop Navigation Shortcuts) */}
      {isLandlord && (
        <div className="floating-shortcut-container">
          {showFloatingMenu && (
            <div className="floating-shortcut-menu">
              <Link 
                to={ROUTES.LANDLORD.DASHBOARD} 
                className="floating-shortcut-item"
                onClick={() => setShowFloatingMenu(false)}
              >
                <span>Dashboard</span>
                <div className="floating-shortcut-icon"><LayoutDashboard size={16} /></div>
              </Link>
              <Link 
                to={ROUTES.LANDLORD.LISTINGS} 
                className="floating-shortcut-item"
                onClick={() => setShowFloatingMenu(false)}
              >
                <span>Listings</span>
                <div className="floating-shortcut-icon"><Building2 size={16} /></div>
              </Link>
              <Link 
                to={ROUTES.LANDLORD.MESSAGES} 
                className="floating-shortcut-item"
                onClick={() => setShowFloatingMenu(false)}
              >
                <span>Messages</span>
                <div className="floating-shortcut-icon"><MessageSquare size={16} /></div>
              </Link>
              <Link 
                to={ROUTES.LANDLORD.REQUESTS} 
                className="floating-shortcut-item"
                onClick={() => setShowFloatingMenu(false)}
              >
                <span>Bookings</span>
                <div className="floating-shortcut-icon"><ClipboardList size={16} /></div>
              </Link>
              <Link 
                to={ROUTES.LANDLORD.PROFILE} 
                className="floating-shortcut-item"
                onClick={() => setShowFloatingMenu(false)}
              >
                <span>Profile</span>
                <div className="floating-shortcut-icon"><UserCircle size={16} /></div>
              </Link>
            </div>
          )}
          <button 
            className={`floating-action-btn ${showFloatingMenu ? 'active' : ''}`}
            onClick={() => setShowFloatingMenu(!showFloatingMenu)}
            title="Fast Navigation Shortcuts"
          >
            {showFloatingMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

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
