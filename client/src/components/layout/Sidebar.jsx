import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
  Users,
  ShieldCheck,
  Receipt,
  MessageSquare,
  Bell,
  UserCircle,
  FileText,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import './Sidebar.css';

// ── Menu configs per role ──
const LANDLORD_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
  { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
  { icon: <CreditCard size={20} />, label: 'Deposits', path: ROUTES.LANDLORD.DEPOSITS },
  { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
  { icon: <BarChart3 size={20} />, label: 'Analytics', path: ROUTES.LANDLORD.ANALYTICS },
  { icon: <MessageSquare size={20} />, label: 'Messages', path: ROUTES.LANDLORD.MESSAGES },
  { icon: <Bell size={20} />, label: 'Notifications', path: ROUTES.LANDLORD.NOTIFICATIONS },
  { icon: <UserCircle size={20} />, label: 'Profile', path: ROUTES.LANDLORD.PROFILE },
  { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.LANDLORD.SETTINGS },
];

const ADMIN_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD },
  { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.ADMIN.LISTINGS },
  { icon: <Users size={20} />, label: 'Users', path: ROUTES.ADMIN.USERS },
  { icon: <ShieldCheck size={20} />, label: 'Moderation', path: ROUTES.ADMIN.MODERATION },
  { icon: <BarChart3 size={20} />, label: 'Analytics', path: ROUTES.ADMIN.ANALYTICS },
  { icon: <Receipt size={20} />, label: 'Transactions', path: ROUTES.ADMIN.TRANSACTIONS },
  { icon: <FileText size={20} />, label: 'System Logs', path: ROUTES.ADMIN.LOGS },
  { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.ADMIN.SETTINGS },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await supabase.auth.signOut();
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error(error);
    }
  };

  // Detect role context from current URL
  const isLandlord = location.pathname.startsWith('/landlord');
  const navLinks = isLandlord ? LANDLORD_NAV : ADMIN_NAV;

  const helpPath = isLandlord ? ROUTES.LANDLORD.HELP : ROUTES.ADMIN.HELP;
  const profilePath = isLandlord ? ROUTES.LANDLORD.PROFILE : ROUTES.ADMIN.SETTINGS;

  const brandTitle = isLandlord ? 'Landlord Portal' : 'Admin Portal';
  const brandSubtitle = isLandlord ? 'Room Management' : 'System Management';

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <Link to={profilePath} className="sidebar-brand-profile-link">
        <div className="sidebar-brand-profile">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80"
            alt="User"
            className="sidebar-brand-avatar"
          />
          <div className="profile-info">
            <span className="profile-title">{brandTitle}</span>
            <span className="profile-subtitle">{brandSubtitle}</span>
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
              to={helpPath}
              className={`sidebar-link ${isActive(helpPath) ? 'active' : ''}`}
            >
              <HelpCircle size={20} />
              <span>Help</span>
            </Link>
          </li>
          <li>
            <a href="#" onClick={handleLogout} className="sidebar-link logout-link">
              <LogOut size={20} />
              <span>Sign Out</span>
            </a>
          </li>
        </ul>
        <div className="support-btn-container" style={{ marginTop: '0.75rem' }}>
          <Link to={helpPath} className="btn-support-center">
            Support Center
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
