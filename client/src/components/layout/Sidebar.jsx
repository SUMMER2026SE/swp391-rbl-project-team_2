import React, { useState, useEffect } from 'react';
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
  FileText,
  Wallet,
  Heart,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Compass,
  Home,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { API_URL } from '../../config';
import adminService from '../../services/adminService';
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
  { icon: <Wallet size={20} />, label: 'Payouts', path: ROUTES.ADMIN.PAYOUTS },
  { icon: <FileText size={20} />, label: 'System Logs', path: ROUTES.ADMIN.LOGS },
  { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.ADMIN.SETTINGS },
];

const TENANT_NAV = [
  { icon: <Home size={20} />, label: 'Home', path: ROUTES.HOME },
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.TENANT.DASHBOARD },
  { icon: <Compass size={20} />, label: 'Explore', path: ROUTES.ROOMS },
  { icon: <ClipboardList size={20} />, label: 'Requests', path: '/tenant/requests' },
  { icon: <Heart size={20} />, label: 'Favorites', path: ROUTES.TENANT.FAVORITES },
  { icon: <MessageSquare size={20} />, label: 'Messages', path: '/messages' },
  { icon: <UserCircle size={20} />, label: 'Profile', path: ROUTES.TENANT.PROFILE },
  { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.TENANT.SETTINGS },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);

  // Detect role context from current URL
  const isLandlord = location.pathname.startsWith('/landlord');
  const isAdmin = location.pathname.startsWith('/admin');
  const isTenant = !isLandlord && !isAdmin;

  useEffect(() => {
    if (isAdmin) {
      adminService.getDashboardStats().then(res => {
        if (res.success && res.data.pendingListings) {
          setPendingCount(res.data.pendingListings);
        }
      }).catch(err => console.error('Failed to fetch pending count for sidebar', err));
    }
  }, [isAdmin, location.pathname]); // refetch occasionally when path changes

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      if (user.avatarUrl.startsWith('/uploads')) {
        const baseUrl = API_URL.replace('/api', '');
        return `${baseUrl}${user.avatarUrl}`;
      }
      return user.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`;
  };

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

  const navLinks = isLandlord ? LANDLORD_NAV : isAdmin ? ADMIN_NAV : TENANT_NAV;

  const helpPath = isLandlord ? ROUTES.LANDLORD.HELP : isAdmin ? ROUTES.ADMIN.HELP : ROUTES.HELP;
  const profilePath = isLandlord ? ROUTES.LANDLORD.PROFILE : isAdmin ? ROUTES.ADMIN.SETTINGS : ROUTES.TENANT.PROFILE;

  const brandTitle = isLandlord ? 'Landlord Portal' : isAdmin ? 'Admin Portal' : 'Tenant Portal';
  const brandSubtitle = isLandlord ? 'Room Management' : isAdmin ? 'System Management' : 'My Account';

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <Link to={profilePath} className="sidebar-brand-profile-link">
        <div className="sidebar-brand-profile">
          <img
            src={getAvatarUrl()}
            alt="User"
            className="sidebar-brand-avatar"
          />
          {!isCollapsed && (
            <div className="profile-info">
              <span className="profile-title">{brandTitle}</span>
              <span className="profile-subtitle">{brandSubtitle}</span>
            </div>
          )}
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
                title={isCollapsed ? link.label : ''}
              >
                {link.icon}
                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                    <span>{link.label}</span>
                    {isAdmin && link.label === 'Listings' && pendingCount > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {pendingCount}
                      </span>
                    )}
                  </div>
                )}
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
                to="/"
                className="sidebar-link"
                title={isCollapsed ? "Back to Home" : ""}
              >
                <LogOut size={20} style={{ transform: 'rotate(180deg)' }} />
                {!isCollapsed && <span>Back to Home</span>}
              </Link>
          </li>
          <li>
              <Link
                to={helpPath}
                className={`sidebar-link ${isActive(helpPath) ? 'active' : ''}`}
                title={isCollapsed ? "Help" : ""}
              >
                <HelpCircle size={20} />
                {!isCollapsed && <span>Help</span>}
              </Link>
          </li>
          <li>
            <a href="#" onClick={handleLogout} className="sidebar-link logout-link" title={isCollapsed ? "Sign Out" : ""}>
              <LogOut size={20} />
              {!isCollapsed && <span>Sign Out</span>}
            </a>
          </li>
        </ul>
        {!isCollapsed && (
          <div className="support-btn-container" style={{ marginTop: '0.75rem' }}>
            <Link to={helpPath} className="btn-support-center">
              Support Center
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
