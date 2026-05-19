import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Building2, ClipboardList, BarChart3, Users, HelpCircle, LogOut, LifeBuoy } from 'lucide-react';
import { ROUTES } from '../constants';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  const navLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.LANDLORD.DASHBOARD },
    { icon: <Wallet size={20} />, label: 'Deposits', path: ROUTES.LANDLORD.DEPOSITS },
    { icon: <Building2 size={20} />, label: 'Listings', path: ROUTES.LANDLORD.LISTINGS },
    { icon: <ClipboardList size={20} />, label: 'Requests', path: ROUTES.LANDLORD.REQUESTS },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
  ];

  return (
    <div className="admin-layout">
      {/* Left Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">MB</div>
          <div className="brand-text">
            <h2>Management Portal</h2>
            <p>Smart Boarding Admin</p>
          </div>
        </div>

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

        <div className="sidebar-footer">
          <div className="support-center">
            <button className="btn-support">
              <LifeBuoy size={18} />
              Support Center
            </button>
          </div>
          <ul className="footer-links">
            <li>
              <Link to="#" className="sidebar-link">
                <HelpCircle size={20} />
                <span>Help</span>
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link text-danger">
                <LogOut size={20} />
                <span>Sign Out</span>
              </Link>
            </li>
          </ul>

          <div className="user-profile">
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
            </div>
            <div className="user-info">
              <h4>Admin User</h4>
              <p>admin@smartboard.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
