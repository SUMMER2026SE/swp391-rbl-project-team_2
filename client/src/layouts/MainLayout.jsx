import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Home, Search, Heart, Menu } from 'lucide-react';
import { ROUTES } from '../constants';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <Link to={ROUTES.HOME} className="logo">
            <Home className="logo-icon" />
            <span className="logo-text">SmartBoard AI</span>
          </Link>
          
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Tìm kiếm phòng trọ, khu vực..." />
          </div>

          <nav className="nav-actions">
            <button className="icon-btn" title="Yêu thích"><Heart size={20} /></button>
            <Link to={ROUTES.LOGIN} className="btn btn-primary">Đăng nhập</Link>
            <button className="icon-btn mobile-menu"><Menu size={24} /></button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <h3>SmartBoard AI</h3>
            <p>Nền tảng tìm kiếm và quản lý phòng trọ thông minh.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Về chúng tôi</h4>
              <Link to="#">Giới thiệu</Link>
              <Link to="#">Quy chế hoạt động</Link>
            </div>
            <div>
              <h4>Hỗ trợ</h4>
              <Link to="#">Hướng dẫn sử dụng</Link>
              <Link to="#">Liên hệ</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SmartBoard AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
