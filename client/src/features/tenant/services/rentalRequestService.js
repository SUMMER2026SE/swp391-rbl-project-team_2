import httpClient from '../../../services/httpClient';

export const rentalRequestService = {
  createRequest: async (data) => {
    try {
      const response = await httpClient.post('/tenant/rental-requests', data);
      return response;
    } catch (error) {
      console.error('Error creating rental request:', error);
      throw error;
    }
  },

  getMyRequests: async (params = {}) => {
    try {
      const response = await httpClient.get('/tenant/rental-requests', { params });
      return response;
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      throw error;
    }
  },

  getRequestDetail: async (requestId) => {
    try {
      const response = await httpClient.get(`/tenant/rental-requests/${requestId}`);
      return response;
    } catch (error) {
      console.error('Error fetching request detail:', error);
      throw error;
    }
  },

  cancelRequest: async (requestId, reason) => {
    try {
      const response = await httpClient.put(`/tenant/rental-requests/${requestId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error canceling request:', error);
      throw error;
    }
  }
};
