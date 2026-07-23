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

  getTerminationDisputes: async () => {
    const response = await api.get('/admin/termination-disputes');
    return response;
  },

  resolveTerminationDispute: async (requestId, data) => {
    const response = await api.post(`/admin/termination-disputes/${requestId}/resolve`, data);
    return response;
  },

  // Withdrawals Management
  getWithdrawals: async () => {
    const response = await api.get('/admin/withdrawals');
    return response;
  },

  processWithdrawal: async (id) => {
    const response = await api.put(`/admin/withdrawals/${id}/process`);
    return response;
  },

  completeWithdrawal: async (id, data) => {
    const response = await api.put(`/admin/withdrawals/${id}/complete`, data);
    return response;
  },

  rejectWithdrawal: async (id, data) => {
    const response = await api.put(`/admin/withdrawals/${id}/reject`, data);
    return response;
  },

  getFinanceStats: async () => {
    const response = await api.get('/admin/finance/statistics');
    return response;
  },

  uploadProof: async (formData) => {
    const response = await api.post('/admin/withdrawals/upload-proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  getVerifications: async () => {
    const response = await api.get('/admin/verifications');
    return response;
  },

  processVerification: async (id, status, notes) => {
    const response = await api.put(`/admin/verifications/${id}`, { status, notes });
    return response;
  },
};

export default adminService;
