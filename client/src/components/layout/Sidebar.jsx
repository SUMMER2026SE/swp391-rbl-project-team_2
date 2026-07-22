import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
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
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

// ── Menu configs per role ──
const LANDLORD_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển', tKey: 'sidebar.dashboard', path: ROUTES.LANDLORD.DASHBOARD },
  { icon: <Building2 size={20} />, label: 'Khu trọ', tKey: 'sidebar.properties', path: ROUTES.LANDLORD.PROPERTIES },
  { icon: <Home size={20} />, label: 'Phòng của tôi', tKey: 'sidebar.myListings', path: ROUTES.LANDLORD.LISTINGS },
  { icon: <CreditCard size={20} />, label: 'Tiền cọc', tKey: 'sidebar.deposits', path: ROUTES.LANDLORD.DEPOSITS },
  { icon: <FileText size={20} />, label: 'Hợp đồng', tKey: 'sidebar.contracts', path: ROUTES.LANDLORD.CONTRACTS },
  { icon: <ClipboardList size={20} />, label: 'Yêu cầu thuê', tKey: 'sidebar.rentalRequests', path: ROUTES.LANDLORD.REQUESTS },
  { icon: <Calendar size={20} />, label: 'Lịch xem phòng', tKey: 'sidebar.viewings', path: ROUTES.LANDLORD.SCHEDULES },
  { icon: <MessageSquare size={20} />, label: 'Tin nhắn', tKey: 'sidebar.messages', path: ROUTES.LANDLORD.MESSAGES },
  { icon: <HelpCircle size={20} />, label: 'Khiếu nại', tKey: 'sidebar.complaints', path: ROUTES.LANDLORD.COMPLAINTS },
  { icon: <UserCircle size={20} />, label: 'Hồ sơ', tKey: 'sidebar.profile', path: ROUTES.LANDLORD.PROFILE },
  { icon: <Settings size={20} />, label: 'Cài đặt', tKey: 'sidebar.settings', path: ROUTES.LANDLORD.SETTINGS },
];

const ADMIN_NAV = [
  { icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển', tKey: 'sidebar.dashboard', path: ROUTES.ADMIN.DASHBOARD },
  { icon: <Building2 size={20} />, label: 'Quản lý phòng', tKey: 'sidebar.listingsManagement', path: ROUTES.ADMIN.LISTINGS },
  { icon: <Users size={20} />, label: 'Người dùng', tKey: 'sidebar.users', path: ROUTES.ADMIN.USERS },
  { icon: <ShieldCheck size={20} />, label: 'Kiểm duyệt', tKey: 'sidebar.moderation', path: ROUTES.ADMIN.MODERATION },
  { icon: <BarChart3 size={20} />, label: 'Thống kê', tKey: 'sidebar.analytics', path: ROUTES.ADMIN.ANALYTICS },
  { icon: <Receipt size={20} />, label: 'Giao dịch', tKey: 'sidebar.transactions', path: ROUTES.ADMIN.TRANSACTIONS },
  { icon: <Settings size={20} />, label: 'Cài đặt', tKey: 'sidebar.settings', path: ROUTES.ADMIN.SETTINGS },
];

const TENANT_NAV = [
  { icon: <Home size={20} />, label: 'Trang chủ', tKey: 'sidebar.home', path: ROUTES.HOME },
  { icon: <Compass size={20} />, label: 'Khám phá', tKey: 'sidebar.explore', path: ROUTES.ROOMS },
  { icon: <Building2 size={20} />, label: 'Phòng đang thuê', tKey: 'sidebar.myRooms', path: ROUTES.TENANT.MY_ROOMS },
  { icon: <ClipboardList size={20} />, label: 'Yêu cầu', tKey: 'sidebar.requests', path: '/tenant/requests' },
  { icon: <HelpCircle size={20} />, label: 'Khiếu nại', tKey: 'sidebar.complaints', path: ROUTES.TENANT.COMPLAINTS },
  { icon: <CreditCard size={20} />, label: 'Lịch sử cọc', tKey: 'sidebar.depositHistory', path: ROUTES.TENANT.DEPOSIT_HISTORY },
  { icon: <Heart size={20} />, label: 'Yêu thích', tKey: 'sidebar.favorites', path: ROUTES.TENANT.FAVORITES },
  { icon: <MessageSquare size={20} />, label: 'Tin nhắn', tKey: 'sidebar.messages', path: '/messages' },
  { icon: <Bell size={20} />, label: 'Thông báo', tKey: 'sidebar.notifications', path: ROUTES.TENANT.NOTIFICATIONS },
  { icon: <UserCircle size={20} />, label: 'Hồ sơ', tKey: 'sidebar.profile', path: ROUTES.TENANT.PROFILE },
  { icon: <Settings size={20} />, label: 'Cài đặt', tKey: 'sidebar.settings', path: ROUTES.TENANT.SETTINGS },
];

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasUnreadTenantRequests, setHasUnreadTenantRequests } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0);
  const [pendingSchedules, setPendingSchedules] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { t } = useTranslation();

  // Listen for new messages
  useEffect(() => {
    if (!user) return;
    
    const socketUrl = API_URL.replace('/api', '');
    const socket = io(socketUrl, {
      withCredentials: true,
      autoConnect: true
    });

    socket.emit('join_user', user.id || user.userId);
    
    // Detect role context from current URL
    const isAdminUrl = location.pathname.startsWith('/admin');
    if (isAdminUrl || user.role === 'admin') {
      socket.emit('join_admin');
    }

    socket.on('new_message_notification', (message) => {
      // If we receive a message and we are not on the messages page
      if (location.pathname !== '/messages' && location.pathname !== ROUTES.LANDLORD.MESSAGES) {
        setHasUnreadMessages(true);
      }
    });

    socket.on('new_notification', (data) => {
      toast.success(data.message || data.title, {
        duration: 5000,
        position: 'bottom-right',
      });
      
      // Dispatch custom event to notify Header.jsx
      window.dispatchEvent(new CustomEvent('new_notification_received'));
      
      // Auto refetch stats when new notification arrives to update sidebar badges
      if (location.pathname.startsWith('/landlord')) {
        landlordService.getStats().then(res => {
          if (res.success) {
            if (res.data.schedules?.pending !== undefined) setPendingSchedules(res.data.schedules.pending);
            if (res.data.requests?.pending !== undefined) setPendingRequests(res.data.requests.pending);
          }
        }).catch(e => console.error(e));
      } else if (location.pathname.startsWith('/admin')) {
        adminService.getDashboardStats().then(res => {
          if (res.success && res.data.pendingListings) {
            setPendingCount(res.data.pendingListings);
          }
        }).catch(e => console.error(e));

        adminService.getVerifications().then(res => {
          if (res.success && res.data) {
            setPendingVerificationsCount(res.data.length);
          }
        }).catch(e => console.error(e));
      } else {
        // Tenant notifications check - apply on all pages for tenant
        if (data.type === 'rental_request' || data.type === 'contract' || data.type === 'viewing_schedule') {
          if (location.pathname !== '/tenant/requests') {
             setHasUnreadTenantRequests(true);
          }
        }
      }
    });

    return () => {
      socket.off('new_message_notification');
      socket.off('new_notification');
      socket.disconnect();
    };
  }, [user, location.pathname]);

  // Clear unread dot when visiting messages or tenant requests
  useEffect(() => {
    if (location.pathname === '/messages' || location.pathname === ROUTES.LANDLORD.MESSAGES) {
      setHasUnreadMessages(false);
    }
    if (location.pathname === '/tenant/requests') {
      setHasUnreadTenantRequests(false);
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

      adminService.getVerifications().then(res => {
        if (res.success && res.data) {
          setPendingVerificationsCount(res.data.length);
        }
      }).catch(err => console.error('Failed to fetch verifications for sidebar', err));
    } else if (isLandlord) {
      landlordService.getStats().then(res => {
        if (res.success) {
          if (res.data.schedules?.pending !== undefined) {
            setPendingSchedules(res.data.schedules.pending);
          }
          if (res.data.requests?.pending !== undefined) {
            setPendingRequests(res.data.requests.pending);
          }
        }
      }).catch(err => console.error('Failed to fetch stats for sidebar', err));
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
  const brandSubtitle = isLandlord ? t('sidebar.landlordChannel', 'Kênh Chủ Trọ') : isAdmin ? t('sidebar.adminChannel', 'Kênh Quản Trị') : t('sidebar.tenantChannel', 'Kênh Người Thuê');

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
                title={isCollapsed ? t(link.tKey, link.label) : ''}
              >
                {link.icon}
                {!isCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
                    <span>{t(link.tKey, link.label)}</span>
                    {isAdmin && link.label === 'Quản lý phòng' && pendingCount > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {pendingCount}
                      </span>
                    )}
                    {isAdmin && link.label === 'Người dùng' && pendingVerificationsCount > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {pendingVerificationsCount}
                      </span>
                    )}
                    {isLandlord && link.label === 'Lịch xem phòng' && pendingSchedules > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {pendingSchedules}
                      </span>
                    )}
                    {isLandlord && link.label === 'Yêu cầu thuê' && pendingRequests > 0 && (
                      <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                        {pendingRequests}
                      </span>
                    )}
                    {link.label === 'Tin nhắn' && hasUnreadMessages && (
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#ef4444', 
                        borderRadius: '50%',
                        marginLeft: '8px',
                        display: 'inline-block'
                      }}></span>
                    )}
                    {isTenant && link.label === 'Yêu cầu' && hasUnreadTenantRequests && (
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
            <a href="#" onClick={handleLogout} className="sidebar-link logout-link" title="Đăng xuất" style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
              <LogOut size={20} style={{ transform: 'rotate(180deg)' }} />
            </a>
          ) : (
            <a href="#" onClick={handleLogout} className="btn-support-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}>
              <LogOut size={18} style={{ transform: 'rotate(180deg)' }} />
              {t('sidebar.logout', 'Đăng xuất')}
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
