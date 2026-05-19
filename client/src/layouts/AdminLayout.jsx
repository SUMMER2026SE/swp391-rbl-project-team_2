import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, Mail, MessageSquare, Search, ChevronDown } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import SearchOverlay from '../components/ui/SearchOverlay';
import { ROUTES } from '../constants';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const isMessagesActive = location.pathname === ROUTES.LANDLORD.MESSAGES;
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  return (
    <div className="admin-layout">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="admin-main-container">

        {/* Topbar */}
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
            {/* Notification Bell wrapped in a link to Notifications page */}
            <Link to={ROUTES.LANDLORD.NOTIFICATIONS} className="topbar-icon-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </Link>

            {/* Chat Icon - highlighted if active */}
            <Link 
              to={ROUTES.LANDLORD.MESSAGES} 
              className={`topbar-icon-btn ${isMessagesActive ? 'active-chat-icon' : ''}`}
            >
              <MessageSquare size={20} />
            </Link>

            <div className="divider-vertical"></div>

            {/* Support Text link */}
            <Link to={ROUTES.LANDLORD.HELP} className="btn-support">Support</Link>
            
            {/* Outline Quick Action button with Chevron */}
            <button className="btn-quick-action">
              <span>Quick Action</span>
              <ChevronDown size={14} />
            </button>

            {/* Avatar on far right */}
            <div className="user-avatar-container">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin Avatar" className="admin-avatar-img" />
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
            console.log('Admin search submitted query:', query);
          }}
        />
      )}
    </div>
  );
};

export default AdminLayout;

