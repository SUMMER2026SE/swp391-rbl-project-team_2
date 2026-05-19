import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ROUTES } from '../constants';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname === ROUTES.TENANT.CHAT;

  return (
    <div className={`main-layout ${isChatPage ? 'chat-layout-mode' : ''}`}>
      <Header />

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {!isChatPage && <Footer />}
    </div>
  );
};

export default MainLayout;
