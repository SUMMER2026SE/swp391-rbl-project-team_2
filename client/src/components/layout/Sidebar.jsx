import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  Building2,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  // Navigation Links ordered exactly as Figma design, including Deposits:
  // Dashboard -> Deposits -> Listings -> Requests -> Messages -> Analytics -> Users -> Settings
  const navLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
    { icon: <Wallet size={20} />, label: 'Deposits', path: ROUTES.LANDLORD.DEPOSITS },
    { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
    { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: ROUTES.LANDLORD.MESSAGES },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: ROUTES.LANDLORD.ANALYTICS },
    { icon: <Users size={20} />, label: 'Users', path: ROUTES.LANDLORD.USERS },
    { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.LANDLORD.SETTINGS },
  ];

  return (
    <aside className="admin-sidebar">
      {/* User Header Profile (Matches Figma Management Portal Brand Element) */}
      <div className="sidebar-brand-profile">
        <div className="profile-avatar">
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80" alt="Admin Profile" />
        </div>
        <div className="profile-info">
          <span className="profile-title">Management Portal</span>
          <span className="profile-subtitle">Smart Boarding Admin</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

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
        <div className="support-btn-container">
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
