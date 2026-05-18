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
import { RentalRequestManagementPage } from '../features/rental';

// Placeholder Pages (Will be created later)
const NotFoundPage = () => <div style={{ padding: '2rem', textAlign: 'center' }}><h1>404</h1><p>Page Not Found</p></div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Tenant Routes */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        {/* Placeholder for Room list, details etc */}
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      {/* Standalone Split Layouts */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Landlord Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.LANDLORD.REQUESTS} element={<RentalRequestManagementPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
