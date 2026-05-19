import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bell, Mail, MessageSquare, Search } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { ROUTES } from '../constants';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="admin-main-container">
        
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="topbar-actions">
            {/* Support Text link */}
            <Link to={ROUTES.LANDLORD.HELP} className="btn-support">Support</Link>
            
            {/* Filled Blue Quick Action button */}
            <button className="btn-quick-action-solid">
              Quick Action
            </button>

            {/* Notification Bell wrapped in a link to Notifications page */}
            <Link to={ROUTES.LANDLORD.NOTIFICATIONS} className="topbar-icon-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </Link>

            {/* Email Icon */}
            <button className="topbar-icon-btn">
              <Mail size={20} />
            </button>

            {/* Chat Icon */}
            <button className="topbar-icon-btn">
              <MessageSquare size={20} />
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
