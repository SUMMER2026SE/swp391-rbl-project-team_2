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
  Home,
  CreditCard
} from 'lucide-react';
import { ROUTES } from '../../constants';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
    { icon: <BarChart3 size={20} />, label: 'Reports & Analytics', path: ROUTES.LANDLORD.ANALYTICS },
    { icon: <CreditCard size={20} />, label: 'Payment & Transaction', path: ROUTES.LANDLORD.TRANSACTIONS },
    { icon: <Users size={20} />, label: 'Users', path: ROUTES.LANDLORD.USERS },
    { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
    { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
    { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.LANDLORD.SETTINGS },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <Home className="brand-icon" size={24} />
          <span className="brand-text">SmartBoarding</span>
        </div>
      </div>

      <div className="console-label">ADMIN CONSOLE</div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <ul>
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.path}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer with Buttons & Help */}
      <div className="sidebar-footer">
        <div className="new-listing-btn-container">
          <Link to={ROUTES.LANDLORD.NEW_LISTING} className="btn-new-listing">
            <Plus size={18} />
            <span>New Listing</span>
          </Link>
        </div>

        <ul className="footer-links">
          <li>
            <Link 
              to={ROUTES.LANDLORD.HELP} 
              className={`sidebar-link ${isActive(ROUTES.LANDLORD.HELP) ? 'active' : ''}`}
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
      </div>
    </aside>
  );
};

export default Sidebar;
