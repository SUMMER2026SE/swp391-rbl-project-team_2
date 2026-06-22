import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
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
  Calendar,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import useAuthStore from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { API_URL } from '../../config';
import adminService from '../../services/adminService';
import { landlordService } from '../../features/landlord/services/landlordService';
import './Sidebar.css';

// ── Menu configs per role ──
const LANDLORD_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
  { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
  { icon: <CreditCard size={20} />, label: 'Deposits', path: ROUTES.LANDLORD.DEPOSITS },
  { icon: <FileText size={20} />, label: 'Contracts', path: ROUTES.LANDLORD.CONTRACTS },
  { icon: <Calendar size={20} />, label: 'Viewing Schedules', path: ROUTES.LANDLORD.SCHEDULES },
  { icon: <MessageSquare size={20} />, label: 'Messages', path: ROUTES.LANDLORD.MESSAGES },
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
  { icon: <Settings size={20} />, label: 'Settings', path: ROUTES.ADMIN.SETTINGS },
];

const TENANT_NAV = [
  { icon: <Home size={20} />, label: 'Home', path: ROUTES.HOME },
  { icon: <Compass size={20} />, label: 'Explore', path: ROUTES.ROOMS },
  { icon: <ClipboardList size={20} />, label: 'Requests', path: '/tenant/requests' },
  { icon: <CreditCard size={20} />, label: 'Deposit History', path: ROUTES.TENANT.DEPOSIT_HISTORY },
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
  const [pendingSchedules, setPendingSchedules] = useState(0);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Listen for new messages
  useEffect(() => {
    if (!user) return;
    
    const socketUrl = API_URL.replace('/api', '');
    const socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true
    });

    socket.emit('join_user', user.id || user.userId);

    socket.on('new_message_notification', (message) => {
      // If we receive a message and we are not on the messages page
      if (location.pathname !== '/messages' && location.pathname !== ROUTES.LANDLORD.MESSAGES) {
        setHasUnreadMessages(true);
      }
    });

    return () => {
      socket.off('new_message_notification');
      socket.disconnect();
    };
  }, [user, location.pathname]);

  // Clear unread dot when visiting messages
  useEffect(() => {
    if (location.pathname === '/messages' || location.pathname === ROUTES.LANDLORD.MESSAGES) {
      setHasUnreadMessages(false);
    }
  }, [location.pathname]);

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
    } else if (isLandlord) {
      landlordService.getStats().then(res => {
        if (res.success && res.data.schedules?.pending) {
          setPendingSchedules(res.data.schedules.pending);
        }
      }).catch(err => console.error('Failed to fetch pending schedules for sidebar', err));
    }
  }, [isAdmin, isLandlord, location.pathname]); // refetch occasionally when path changes

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

  const brandTitle = user?.fullName || 'User';
  const brandSubtitle = isLandlord ? 'Landlord Portal' : isAdmin ? 'Admin Portal' : 'Tenant Portal';

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
                    {isLandlord && link.label === 'Viewing Schedules' && pendingSchedules > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {pendingSchedules}
                      </span>
                    )}
                    {link.label === 'Messages' && hasUnreadMessages && (
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#ef4444', 
                        borderRadius: '50%',
                        marginLeft: '8px',
                        display: 'inline-block'
                      }}></span>
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
        <div className="support-btn-container" style={{ marginTop: '0.75rem' }}>
          {isCollapsed ? (
            <a href="#" onClick={handleLogout} className="sidebar-link logout-link" title="Log Out" style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
              <LogOut size={20} style={{ transform: 'rotate(180deg)' }} />
            </a>
          ) : (
            <a href="#" onClick={handleLogout} className="btn-support-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <LogOut size={18} style={{ transform: 'rotate(180deg)' }} />
              Log Out
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
