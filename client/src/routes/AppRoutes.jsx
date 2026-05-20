import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Features (using unified exports)
import { LoginPage, RegisterPage, ForgotPasswordPage } from '../features/auth';
import { SearchPage, FavoritesPage, DepositPaymentPage, RoomDetailPage, AIChatPage, TenantNotificationsPage, RentalRequestPage, DepositHistoryPage, TenantProfilePage } from '../features/tenant';
import { LandlordDashboard, ManageListingsPage, AddNewPropertyPage, DepositManagementPage, LandlordProfilePage, MessagesPage, LandlordNotificationsPage } from '../features/landlord';
import { VerificationPage } from '../features/verification';

// Pages
import HomePage from '../pages/HomePage';
import { RentalRequestManagementPage } from '../features/rental';
import HelpCenterPage from '../pages/HelpCenterPage';
import TermsPage from '../pages/TermsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

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
        <Route path={ROUTES.TENANT.NOTIFICATIONS} element={<TenantNotificationsPage />} />
        <Route path={ROUTES.TENANT.RENTAL_REQUEST} element={<RentalRequestPage />} />
        <Route path={ROUTES.TENANT.DEPOSIT_HISTORY} element={<DepositHistoryPage />} />
        <Route path={ROUTES.TENANT.PROFILE} element={<TenantProfilePage />} />
        <Route path={ROUTES.HELP} element={<HelpCenterPage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      </Route>

      {/* Standalone Pages (no layout wrapper) */}
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.TENANT.PAYMENT} element={<DepositPaymentPage />} />
      <Route path={ROUTES.TERMS} element={<TermsPage />} />

      {/* Admin / Landlord Routes */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.LANDLORD.DASHBOARD} element={<LandlordDashboard />} />
        <Route path={ROUTES.LANDLORD.HELP} element={<HelpCenterPage />} />
        <Route path={ROUTES.LANDLORD.NOTIFICATIONS} element={<LandlordNotificationsPage />} />
        <Route path={ROUTES.LANDLORD.MESSAGES} element={<MessagesPage />} />

        <Route path={ROUTES.LANDLORD.USERS} element={<div style={{ padding: '1rem' }}><h2>Users Management</h2><p>Admin console users database table.</p></div>} />
        <Route path={ROUTES.LANDLORD.LISTINGS} element={<ManageListingsPage />} />
        <Route path={ROUTES.LANDLORD.DEPOSITS} element={<DepositManagementPage />} />
        <Route path={ROUTES.LANDLORD.NEW_LISTING} element={<AddNewPropertyPage />} />
        <Route path={ROUTES.LANDLORD.REQUESTS} element={<RentalRequestManagementPage />} />
        <Route path={ROUTES.LANDLORD.ANALYTICS} element={<div style={{ padding: '1rem' }}><h2>Analytics Dashboard</h2><p>Admin console property business analytics graphs.</p></div>} />
        <Route path={ROUTES.LANDLORD.PROFILE} element={<LandlordProfilePage />} />
        <Route path={ROUTES.LANDLORD.SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Standalone Split & Minimal Layouts */}
      <Route path={ROUTES.VERIFICATION} element={<VerificationPage />} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
