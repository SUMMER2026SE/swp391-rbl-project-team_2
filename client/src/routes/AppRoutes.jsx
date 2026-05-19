import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import SearchPage from '../features/tenant/pages/SearchPage';
import FavoritesPage from '../features/tenant/pages/FavoritesPage';
import DepositPaymentPage from '../features/tenant/pages/DepositPaymentPage';

// Placeholder Pages (Will be created later)
const NotFoundPage = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>404</h1><p>Page Not Found</p></div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Tenant Routes */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.ROOMS} element={<SearchPage />} />
        <Route path={ROUTES.TENANT.FAVORITES} element={<FavoritesPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Admin / Landlord Routes */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.LANDLORD.DASHBOARD} element={<div>Admin Dashboard Placeholder</div>} />
      </Route>

      {/* Standalone Split & Minimal Layouts */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.TENANT.PAYMENT} element={<DepositPaymentPage />} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
