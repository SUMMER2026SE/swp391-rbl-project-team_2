import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth feature
import { LoginPage, RegisterPage, ForgotPasswordPage, VerifyOTPPage, ResetPasswordPage } from '../features/auth';

// Tenant feature
import {
  SearchPage,
  FavoritesPage,
  DepositPaymentPage,
  RoomDetailPage,
  AIChatPage,
  TenantNotificationsPage,
  RentalRequestPage,
  DepositHistoryPage,
  TenantProfilePage,
} from '../features/tenant';

// Landlord feature
import {
  LandlordDashboard,
  ManageListingsPage,
  AddNewPropertyPage,
  DepositManagementPage,
  AISystemMonitoringPage,
  LandlordProfilePage,
  MessagesPage,
  LandlordNotificationsPage,
  SystemLogsPage,
} from '../features/landlord';

// Admin feature
import {
  DashboardPage,
  AnalyticsPage,
  TransactionsPage,
  ListingsPage,
  UsersPage,
  RequestsPage,
  SettingsPage as AdminSettingsPage,
  ViolationManagementPage,
} from '../features/admin';

// Rental feature
import { RentalRequestManagementPage } from '../features/rental';

// Verification feature
import { VerificationPage } from '../features/verification';

// Shared pages
import HomePage from '../pages/HomePage';
import HelpCenterPage from '../pages/HelpCenterPage';
import TermsPage from '../pages/TermsPage';
import ContactSupportPage from '../pages/ContactSupportPage';
import LandlordSettingsPage from '../pages/SettingsPage';
import GlobalSearchPage from '../pages/GlobalSearchPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC / TENANT ROUTES ===== */}
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

      {/* ===== AUTH ROUTES ===== */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTPPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      </Route>

      {/* ===== STANDALONE PAGES (NO LAYOUT) ===== */}
      <Route path={ROUTES.TENANT.PAYMENT} element={<DepositPaymentPage />} />
      <Route path={ROUTES.VERIFICATION} element={<VerificationPage />} />
      <Route path={ROUTES.TERMS} element={<TermsPage />} />
      <Route path={ROUTES.SEARCH} element={<GlobalSearchPage />} />

      {/* ===== LANDLORD ROUTES ===== */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.LANDLORD.DASHBOARD} element={<LandlordDashboard />} />
        <Route path={ROUTES.LANDLORD.HELP} element={<HelpCenterPage />} />
        <Route path={ROUTES.LANDLORD.CONTACT_SUPPORT} element={<ContactSupportPage />} />
        <Route path={ROUTES.LANDLORD.SETTINGS} element={<LandlordSettingsPage />} />
        <Route path={ROUTES.LANDLORD.LISTINGS} element={<ManageListingsPage />} />
        <Route path={ROUTES.LANDLORD.NEW_LISTING} element={<AddNewPropertyPage />} />
        <Route path={ROUTES.LANDLORD.DEPOSITS} element={<DepositManagementPage />} />
        <Route path={ROUTES.LANDLORD.REQUESTS} element={<RentalRequestManagementPage />} />
        <Route path={ROUTES.LANDLORD.ANALYTICS} element={<AISystemMonitoringPage />} />
        <Route path={ROUTES.LANDLORD.PROFILE} element={<LandlordProfilePage />} />
        <Route path={ROUTES.LANDLORD.MESSAGES} element={<MessagesPage />} />
        <Route path={ROUTES.LANDLORD.NOTIFICATIONS} element={<LandlordNotificationsPage />} />
        <Route path={ROUTES.LANDLORD.TERMS} element={<TermsPage />} />
      </Route>

      {/* ===== ADMIN ROUTES ===== */}
      <Route element={<AdminLayout />}>
        <Route path={ROUTES.ADMIN.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.ADMIN.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.ADMIN.LOGS} element={<SystemLogsPage />} />
        <Route path={ROUTES.ADMIN.TRANSACTIONS} element={<TransactionsPage />} />
        <Route path={ROUTES.ADMIN.LISTINGS} element={<ListingsPage />} />
        <Route path={ROUTES.ADMIN.USERS} element={<UsersPage />} />
        <Route path={ROUTES.ADMIN.MODERATION} element={<ViolationManagementPage />} />
        <Route path={ROUTES.ADMIN.SETTINGS} element={<AdminSettingsPage />} />
        <Route path={ROUTES.ADMIN.HELP} element={<HelpCenterPage />} />
      </Route>

      {/* ===== 404 FALLBACK ===== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
