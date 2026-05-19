import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut,
  Home
} from 'lucide-react';
import { ROUTES } from '../../constants';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
    { icon: <Home size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
    { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: ROUTES.LANDLORD.ANALYTICS },
    { icon: <Users size={20} />, label: 'Users', path: ROUTES.LANDLORD.USERS },
    { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.LANDLORD.SETTINGS },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header with User Profile */}
      <div className="sidebar-brand">
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" 
          alt="Avatar" 
          className="sidebar-avatar" 
        />
        <div className="sidebar-brand-text">
          <div className="brand-text">Management Portal</div>
          <div className="brand-subtext">Smart Boarding Admin</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <ul>
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.path}
                className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer with Support Center & Help */}
      <div className="sidebar-footer">
        <div className="support-center-btn-container">
          <Link to={ROUTES.LANDLORD.HELP} className="btn-support-center">
            Support Center
          </Link>
        </div>

        <ul className="footer-links">
          <li>
            <Link 
              to={ROUTES.LANDLORD.HELP} 
              className={`sidebar-link ${location.pathname === ROUTES.LANDLORD.HELP ? 'active-help' : ''}`}
            >
              <HelpCircle size={20} />
              <span>Help</span>
            </Link>
          </li>
          <li>
            <Link to={ROUTES.LOGIN} className="sidebar-link logout-link">
              <LogOut size={20} />
              <span>Sign Out</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
