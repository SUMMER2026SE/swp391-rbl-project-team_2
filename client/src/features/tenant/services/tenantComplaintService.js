import api from '../../../services/api';

export const tenantComplaintService = {
  getComplaints: async (status, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status && status !== 'All') {
        params.append('status', status.toLowerCase());
      }
      const response = await api.get(`/tenant/complaints?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createComplaint: async (data) => {
    try {
      const response = await api.post('/tenant/complaints', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
