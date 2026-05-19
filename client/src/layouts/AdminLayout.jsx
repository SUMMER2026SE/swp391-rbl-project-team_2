import React from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Mail, MessageSquare, Search, ChevronDown } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
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
            <input type="text" placeholder="Search" />
          </div>

          <div className="topbar-actions">
            {/* Header Icons */}
            <button className="topbar-icon-btn">
              <Bell size={20} />
              <span className="badge-dot"></span>
            </button>
            <button className="topbar-icon-btn">
              <Mail size={20} />
            </button>
            <button className="topbar-icon-btn">
              <MessageSquare size={20} />
            </button>

            <div className="divider-vertical"></div>

            <button className="btn-support">Support</button>

            <button className="btn-quick-action">
              <span>Quick Action</span>
              <ChevronDown size={14} />
            </button>

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
    </div>
  );
};

export default AdminLayout;
