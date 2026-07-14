import httpClient from '../../../services/httpClient';

export const adminService = {
  // Dashboard Stats
  getStats: async () => {
    try {
      const response = await httpClient.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Users Management
  getUsers: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Listings Management
  getListings: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/admin/listings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw error;
    }
  },

  // Transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/admin/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Analytics
  getAnalytics: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/admin/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Violations/Moderation
  getViolations: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/admin/violations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching violations:', error);
      throw error;
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await httpClient.get('/api/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  updateSettings: async (data) => {
    try {
      const response = await httpClient.put('/api/admin/settings', data);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  getVerifications: async () => {
    try {
      const response = await httpClient.get('/api/admin/verifications');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching verifications:', error);
      throw error;
    }
  },

  processVerification: async (id, status, notes) => {
    try {
      const response = await httpClient.put(`/api/admin/verifications/${id}`, { status, notes });
      return response.data || response;
    } catch (error) {
      console.error('Error processing verification:', error);
      throw error;
    }
  },
};
