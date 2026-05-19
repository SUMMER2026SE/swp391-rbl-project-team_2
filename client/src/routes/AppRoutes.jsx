import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Features (using unified exports)
import { LoginPage, RegisterPage } from '../features/auth';
import { SearchPage, FavoritesPage, DepositPaymentPage, AIChatPage } from '../features/tenant';

// Pages
import HomePage from '../pages/HomePage';


import HelpCenterPage from '../pages/HelpCenterPage';
import NotificationsPage from '../pages/NotificationsPage';
import MessagesPage from '../pages/MessagesPage';
import TermsPage from '../pages/TermsPage';
import SettingsPage from '../pages/SettingsPage';





// Placeholder Pages (Will be created later)
const NotFoundPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404</h1>
    <p>Page Not Found</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Tenant Routes */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ROOMS} element={<SearchPage />} />
        <Route path={ROUTES.TENANT.FAVORITES} element={<FavoritesPage />} />
        <Route path={ROUTES.TENANT.CHAT} element={<AIChatPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Admin / Landlord Routes */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.LANDLORD.DASHBOARD} element={<Navigate to={ROUTES.LANDLORD.HELP} replace />} />
        <Route path={ROUTES.LANDLORD.HELP} element={<HelpCenterPage />} />
        <Route path={ROUTES.LANDLORD.NOTIFICATIONS} element={<NotificationsPage />} />
        <Route path={ROUTES.LANDLORD.MESSAGES} element={<MessagesPage />} />

        <Route path={ROUTES.LANDLORD.USERS} element={<div style={{ padding: '1rem' }}><h2>Users Management</h2><p>Admin console users database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.LISTINGS} element={<div style={{ padding: '1rem' }}><h2>Listings Management</h2><p>Admin console property listings database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.REQUESTS} element={<div style={{ padding: '1rem' }}><h2>Requests Management</h2><p>Admin console tenant requests database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.ANALYTICS} element={<div style={{ padding: '1rem' }}><h2>Analytics Dashboard</h2><p>Admin console property business analytics graphs.</p></div>} />
        <Route path={ROUTES.LANDLORD.SETTINGS} element={<SettingsPage />} />

      </Route>

      {/* Standalone Split & Minimal Layouts */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.TENANT.PAYMENT} element={<DepositPaymentPage />} />
      <Route path={ROUTES.TERMS} element={<TermsPage />} />


      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
