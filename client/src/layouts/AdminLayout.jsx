import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building, 
  Inbox, 
  BarChart2, 
  Users, 
  Settings, 
  LifeBuoy, 
  LogOut 
} from 'lucide-react';
import { ROUTES } from '../constants';
import './AdminLayout.css';

const AdminLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { name: 'Listings', path: ROUTES.LANDLORD.LISTINGS, icon: <Building size={18} /> },
    { name: 'Requests', path: ROUTES.LANDLORD.REQUESTS, icon: <Inbox size={18} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="admin-profile-photo">
            {/* Placeholder for admin avatar */}
          </div>
          <div className="admin-info">
            <h1 className="admin-title">Management<br/>Portal</h1>
            <p className="admin-subtitle">Smart Boarding Admin</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-support">
            <LifeBuoy size={16} />
            Support Center
          </button>
          
          <div className="footer-links">
            <NavLink to="/admin/help" className="footer-nav-item">
              <LifeBuoy size={18} />
              <span>Help</span>
            </NavLink>
            <button className="footer-nav-item btn-signout">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
