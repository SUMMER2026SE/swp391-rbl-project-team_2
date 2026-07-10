import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { MapPin, Shield, Star, Home } from 'lucide-react';
import authRoomHero from '../assets/images/auth-room-hero.png';
import './AuthLayout.css';

const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === ROUTES.LOGIN;

  return (
    <div className="auth-layout">
      {/* ════════ LEFT IMAGE PANEL ════════ */}
      <div className="auth-brand-panel">
        {/* Background image */}
        <img src={authRoomHero} alt="Modern rental room" className="brand-bg-image" />

        {/* Gradient overlay */}
        <div className="brand-overlay" />

        {/* Floating particles */}
        <div className="brand-particles">
          <div className="particle particle--1" />
          <div className="particle particle--2" />
          <div className="particle particle--3" />
          <div className="particle particle--4" />
          <div className="particle particle--5" />
        </div>

        {/* Content */}
        <div className="brand-content">
          <Link to={ROUTES.HOME} className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="52" height="52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 15 40 L 40 15 L 65 40" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="25" y="40" width="30" height="35" fill="#2563EB" />
              <rect x="30" y="45" width="7" height="7" fill="white" />
              <rect x="43" y="45" width="7" height="7" fill="white" />
              <rect x="30" y="56" width="7" height="7" fill="white" />
              <rect x="43" y="56" width="7" height="7" fill="white" />
              <rect x="30" y="67" width="7" height="7" fill="white" />
              <rect x="43" y="67" width="7" height="7" fill="white" />
              <path d="M 45 50 L 65 30 L 85 50" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="75" y="28" width="4" height="10" fill="#8B5CF6" />
              <rect x="55" y="50" width="24" height="25" fill="#8B5CF6" />
              <rect x="59" y="55" width="6" height="6" fill="white" />
              <rect x="69" y="55" width="6" height="6" fill="white" />
              <rect x="59" y="65" width="6" height="6" fill="white" />
              <rect x="69" y="65" width="6" height="6" fill="white" />
              <path d="M 22 78 Q 50 86 75 78" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M 10 85 Q 50 96 85 85" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" fill="none"/>
            </svg>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>RentWise</span>
          </Link>

          <div className="brand-hero">
            <h1 className="brand-title">
              {isLogin ? (
                <>Chào mừng bạn quay lại <br /> <span className="brand-title-accent">với RentWise.</span></>
              ) : (
                <>Bắt đầu hành trình <br /> <span className="brand-title-accent">cùng RentWise</span></>
              )}
            </h1>
            <p className="brand-subtitle">
              {isLogin 
                ? "Khám phá hàng ngàn phòng trọ chất lượng, kết nối trực tiếp với chủ nhà một cách nhanh chóng và an toàn."
                : "Tạo tài khoản để khám phá không gian sống lý tưởng hoặc đăng tin cho thuê phòng trọ của bạn dễ dàng."}
            </p>
          </div>

          {/* Feature pills */}
          <div className="brand-features">
            <div className="brand-feature-pill">
              <Shield size={14} />
              Verified Listings
            </div>
            <div className="brand-feature-pill">
              <MapPin size={14} />
              Prime Locations
            </div>
            <div className="brand-feature-pill">
              <Star size={14} />
              Trusted Reviews
            </div>
          </div>
        </div>


      </div>

      {/* ════════ RIGHT FORM PANEL ════════ */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-card">
            <Outlet />
          </div>


        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
