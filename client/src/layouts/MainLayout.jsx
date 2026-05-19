import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ROUTES } from '../constants';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const isAuthenticated = false; // Mock state, ideally from useAuthStore
  const isChatPage = location.pathname === ROUTES.TENANT.CHAT;

  return (
    <div className={`main-layout ${isChatPage ? 'chat-layout-mode' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="header-left">
            <Link to={ROUTES.HOME} className="logo">
              <Home className="logo-icon" size={24} />
              <span className="logo-text">SmartBoard AI</span>
            </Link>
            <div className="search-bar quick-search">
              <Search className="search-icon quick-search-icon" size={16} />
              <input type="text" placeholder="Tìm kiếm phòng trọ, khu vực..." />
            </div>
          </div>
          
          <nav className="header-tabs">
            <Link to={ROUTES.ROOMS} className={`tab-link ${location.pathname === ROUTES.ROOMS ? 'active' : ''}`}>Khám phá</Link>
            <Link to={ROUTES.TENANT.FAVORITES} className={`tab-link ${location.pathname === ROUTES.TENANT.FAVORITES ? 'active' : ''}`}>Yêu thích</Link>
          </nav>

          <div className="header-right nav-actions">
            {!isAuthenticated ? (
              <Link to={ROUTES.LOGIN} className="btn btn-primary sign-in-btn">Đăng nhập</Link>
            ) : (
              <div className="header-avatar">
                <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" />
              </div>
            )}
            <button className="icon-btn mobile-menu"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer-minimal">
        <div className="container footer-minimal-content">
          <div className="footer-left">
            &copy; {new Date().getFullYear()} SmartBoard AI. Nền tảng tìm kiếm và quản lý phòng trọ thông minh.
          </div>
          <div className="footer-right">
            <Link to="#">Điều khoản</Link>
            <Link to="#">Bảo mật</Link>
            <Link to="#">Hỗ trợ</Link>
            <span>Tiếng Việt</span>
            <button className="grid-icon-btn"><Grid size={20} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

