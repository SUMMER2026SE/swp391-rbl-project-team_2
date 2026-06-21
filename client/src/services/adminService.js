import api from './api';

export const adminService = {
  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response;
  },

  updateUserStatus: async (userId, action) => {
    const response = await api.put(`/admin/users/${userId}/status`, { action });
    return response;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response;
  },
  getRevenueChart: async () => {
    const response = await api.get('/admin/dashboard/revenue-chart');
    return response;
  },
  getRecentActivities: async () => {
    const response = await api.get('/admin/dashboard/recent-activities');
    return response;
  },

  // Listings (Rooms)
  getAllRooms: async () => {
    const response = await api.get('/admin/rooms');
    return response;
  },
  updateRoomStatus: async (roomId, status, reason = '') => {
    const body = { status };
    if (reason) body.reason = reason;
    const response = await api.put(`/admin/rooms/${roomId}/status`, body);
    return response;
  },

  // Transactions
  getAllTransactions: async () => {
    const response = await api.get('/admin/transactions');
    return response;
  },

  // Complaints
  getAllComplaints: async () => {
    const response = await api.get('/admin/complaints');
    return response;
  },

  // Payouts
  getPayouts: async () => {
    const response = await api.get('/admin/payouts');
    return response;
  },
  processPayout: async (payoutId, commissionRate) => {
    const response = await api.put(`/admin/payouts/${payoutId}/process`, { commissionRate });
    return response;
  },

  getAllDisputes: async () => {
    const response = await api.get('/admin/disputes');
    return response;
  },

  resolveDispute: async (scheduleId, outcome) => {
    const response = await api.post(`/admin/disputes/${scheduleId}/resolve`, { outcome });
    return response;
  },
};

export default adminService;
