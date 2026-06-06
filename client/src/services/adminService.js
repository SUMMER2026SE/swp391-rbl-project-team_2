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
  updateRoomStatus: async (roomId, status) => {
    const response = await api.put(`/admin/rooms/${roomId}/status`, { status });
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
  processPayout: async (paymentId, commissionRate) => {
    const response = await api.put(`/admin/payouts/${paymentId}/process`, { commissionRate });
    return response;
  },
};

export default adminService;
