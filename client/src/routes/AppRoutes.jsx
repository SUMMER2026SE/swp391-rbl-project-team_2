import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth feature
import { LoginPage, RegisterPage } from '../features/auth';

// Tenant feature
import { SearchPage, FavoritesPage, DepositPaymentPage } from '../features/tenant';

// Admin feature
import {
  DashboardPage,
  AnalyticsPage,
  TransactionsPage,
  ListingsPage,
  UsersPage,
  RequestsPage,
  SettingsPage,
} from '../features/admin';

// Shared pages
import HomePage from '../pages/HomePage';
import HelpCenterPage from '../pages/HelpCenterPage';
import NotFoundPage from '../pages/NotFoundPage';

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
        <Route path={ROUTES.LANDLORD.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.LANDLORD.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.LANDLORD.TRANSACTIONS} element={<TransactionsPage />} />
        <Route path={ROUTES.LANDLORD.LISTINGS} element={<ListingsPage />} />
        <Route path={ROUTES.LANDLORD.USERS} element={<UsersPage />} />
        <Route path={ROUTES.LANDLORD.REQUESTS} element={<RequestsPage />} />
        <Route path={ROUTES.LANDLORD.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.LANDLORD.HELP} element={<HelpCenterPage />} />
      </Route>

      {/* Standalone layouts */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.TENANT.PAYMENT} element={<DepositPaymentPage />} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
