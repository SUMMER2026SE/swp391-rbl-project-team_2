import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Features (using unified exports)
import { LoginPage, RegisterPage } from '../features/auth';
import { SearchPage, FavoritesPage, DepositPaymentPage, AIChatPage, RoomDetailPage } from '../features/tenant';
import { SearchPage, FavoritesPage, DepositPaymentPage, AIChatPage } from '../features/tenant';
import { LandlordDashboard } from '../features/landlord';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import SearchPage from '../features/tenant/pages/SearchPage';
import FavoritesPage from '../features/tenant/pages/FavoritesPage';
import DepositPaymentPage from '../features/tenant/pages/DepositPaymentPage';
import RentalRequestManagementPage from '../features/rental';
import HelpCenterPage from '../pages/HelpCenterPage';
import NotificationsPage from '../pages/NotificationsPage';
import MessagesPage from '../pages/MessagesPage';
import TermsPage from '../pages/TermsPage';
import SettingsPage from '../pages/SettingsPage';

// Placeholder — Not Found Page
const NotFoundPage = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '16px',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '72px', fontWeight: 800, color: 'var(--color-primary)' }}>404</h1>
    <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>Page Not Found</p>
    <a href="/" style={{
      padding: '10px 24px',
      background: 'var(--color-primary)',
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 600
    }}>Go Home</a>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Tenant Routes */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ROOMS} element={<SearchPage />} />
        <Route path={ROUTES.ROOM_DETAIL} element={<RoomDetailPage />} />
        <Route path={ROUTES.TENANT.FAVORITES} element={<FavoritesPage />} />
        <Route path={ROUTES.TENANT.CHAT} element={<AIChatPage />} />
        <Route path={ROUTES.TENANT.NOTIFICATIONS} element={<div className="container" style={{padding:'2rem'}}><h2>Notifications</h2><p>Coming soon...</p></div>} />
        <Route path={ROUTES.TENANT.PROFILE} element={<div className="container" style={{padding:'2rem'}}><h2>Profile</h2><p>Coming soon...</p></div>} />
        <Route path={ROUTES.HELP} element={<HelpCenterPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<div style={{maxWidth:480,margin:'0 auto',textAlign:'center',padding:'3rem'}}><h2>Forgot Password</h2><p>Coming soon...</p></div>} />
      </Route>

      {/* Standalone Pages (no layout wrapper) */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.TENANT.PAYMENT} element={<DepositPaymentPage />} />
      <Route path={ROUTES.TERMS} element={<TermsPage />} />

      {/* Admin / Landlord Routes */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.LANDLORD.DASHBOARD} element={<LandlordDashboard />} />
        <Route path={ROUTES.LANDLORD.HELP} element={<HelpCenterPage />} />
        <Route path={ROUTES.LANDLORD.NOTIFICATIONS} element={<NotificationsPage />} />
        <Route path={ROUTES.LANDLORD.MESSAGES} element={<MessagesPage />} />

        <Route path={ROUTES.LANDLORD.USERS} element={<div style={{ padding: '1rem' }}><h2>Users Management</h2><p>Admin console users database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.LISTINGS} element={<div style={{ padding: '1rem' }}><h2>Listings Management</h2><p>Admin console property listings database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.REQUESTS} element={<div style={{ padding: '1rem' }}><h2>Requests Management</h2><p>Admin console tenant requests database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.ANALYTICS} element={<div style={{ padding: '1rem' }}><h2>Analytics Dashboard</h2><p>Admin console property business analytics graphs.</p></div>} />
        <Route path={ROUTES.LANDLORD.SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
