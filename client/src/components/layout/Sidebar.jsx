import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
    { icon: <BarChart3 size={20} />, label: 'Reports & Analytics', path: ROUTES.LANDLORD.ANALYTICS },
    { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
    { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
    { icon: <CreditCard size={20} />, label: 'Deposits', path: ROUTES.LANDLORD.DEPOSITS },
    { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.LANDLORD.SETTINGS },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <Link to={ROUTES.LANDLORD.PROFILE} className="sidebar-brand-profile-link">
        <div className="sidebar-brand-profile">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80"
            alt="Admin"
            className="sidebar-brand-avatar"
          />
          <div className="profile-info">
            <span className="profile-title">Management Portal</span>
            <span className="profile-subtitle">Smart Boarding Admin</span>
          </div>
        </div>
      </Link>

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

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <ul className="footer-links">
          <li>
            <Link
              to={ROUTES.LANDLORD.HELP}
              className={`sidebar-link ${isActive(ROUTES.LANDLORD.HELP) ? 'active' : ''}`}
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
        <div className="support-btn-container" style={{ marginTop: '0.75rem' }}>
          <Link to={ROUTES.LANDLORD.HELP} className="btn-support-center">
            Support Center
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
