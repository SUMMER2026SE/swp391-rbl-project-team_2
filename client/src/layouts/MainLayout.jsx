import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Search, Menu, Grid } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import useAuthStore from '../store/useAuthStore';
import { ROUTES } from '../constants';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isChatPage = location.pathname === ROUTES.TENANT.CHAT;

  return (
    <div className={`main-layout ${isChatPage ? 'chat-layout-mode' : ''}`}>
      {isAuthenticated && (
        <Sidebar isCollapsed={!isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}
      <div className={`main-layout-wrapper ${isSidebarOpen && isAuthenticated ? 'sidebar-open' : ''}`} style={{ transition: 'margin-left 0.3s', marginLeft: isSidebarOpen && isAuthenticated ? '260px' : '0', display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {!isChatPage && <Footer />}
      </div>
    </div>
  );
};

export default MainLayout;
