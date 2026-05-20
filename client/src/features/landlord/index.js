// Landlord Feature — Centralized Exports

// Pages
export { default as LandlordDashboard } from './pages/LandlordDashboard';
export { default as ManageListingsPage } from './pages/ManageListingsPage';
export { default as AddNewPropertyPage } from './pages/AddNewPropertyPage';
export { default as DepositManagementPage } from './pages/DepositManagementPage';
export { default as SystemLogsPage } from './pages/SystemLogsPage';
export { default as LandlordProfilePage } from './pages/LandlordProfilePage';
export { default as AISystemMonitoringPage } from './pages/AISystemMonitoringPage';
export { default as MessagesPage } from './pages/MessagesPage';
export { default as LandlordNotificationsPage } from './pages/LandlordNotificationsPage';

// Hooks
export { default as useLandlordStats } from './hooks/useLandlordStats';
export { default as useProperties } from './hooks/useProperties';
export { default as useDeposits } from './hooks/useDeposits';
export { default as useRequests } from './hooks/useRequests';

// Services
export { landlordService } from './services/landlordService';
