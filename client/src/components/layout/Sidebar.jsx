import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ClipboardList, 
  MessageSquare,
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
    { icon: <Users size={20} />, label: 'Users', path: ROUTES.LANDLORD.USERS },
    { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
    { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: ROUTES.LANDLORD.MESSAGES },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: ROUTES.LANDLORD.ANALYTICS },
    { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.LANDLORD.SETTINGS },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <Home className="brand-icon" size={24} />
          <span className="brand-text">SmartBoarding</span>
        </div>
        <div className="console-label-sub">Admin Console</div>
      </div>

      {/* New Listing Button - Placed ABOVE the Navigation Links as requested in the new Figma mock */}
      <div className="new-listing-btn-container-top">
        <Link to={ROUTES.LANDLORD.NEW_LISTING} className="btn-new-listing-top">
          <Plus size={18} />
          <span>New Listing</span>
        </Link>
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

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <ul className="footer-links">
          <li>
            <Link 
              to={ROUTES.LANDLORD.HELP} 
              className={`sidebar-link ${location.pathname === ROUTES.LANDLORD.HELP ? 'active-help' : ''}`}
            >
              <HelpCircle size={20} />
              <span>Help Center</span>
            </Link>
          </li>
          <li>
            <Link to={ROUTES.LOGIN} className="sidebar-link logout-link">
              <LogOut size={20} />
              <span>Logout</span>
            </Link>
          </li>
        </ul>

        {/* Expanded User Profile Details at the bottom left corner as per the new Figma layout */}
        <div className="sidebar-avatar-container">
          <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="sidebar-avatar-img" />
          <div className="sidebar-avatar-info">
            <span className="avatar-name">Admin User</span>
            <span className="avatar-email">admin@smartboarding.com</span>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
