import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, Search, ChevronDown } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import SearchOverlay from '../components/ui/SearchOverlay';
import { ROUTES } from '../constants';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Detect role context from current URL
  const isLandlord = location.pathname.startsWith('/landlord');

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

              {/* Quick Action button */}
              <button className="btn-quick-action">
                <span>Quick Action</span>
                <ChevronDown size={14} />
              </button>

              {/* Avatar */}
              <div className="user-avatar-container">
                <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" className="admin-avatar-img" />
              </div>
            </div>
          </header>
        )}

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
