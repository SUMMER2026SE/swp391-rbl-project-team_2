import httpClient from './httpClient';

export const terminationService = {
  createRequest: async (formData) => {
    try {
      const response = await httpClient.post('/termination/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating termination request:', error);
      throw error.response?.data || error;
    }
  },

  getRequestDetail: async (requestId) => {
    try {
      const response = await httpClient.get(`/termination/request/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching termination request detail:', error);
      throw error.response?.data || error;
    }
  },

  getHistory: async () => {
    try {
      const response = await httpClient.get('/termination/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching termination history:', error);
      throw error.response?.data || error;
    }
  },

  getByContractId: async (contractId) => {
    try {
      const response = await httpClient.get(`/termination/contract/${contractId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract termination status:', error);
      throw error.response?.data || error;
    }
  },

  approveRequest: async (requestId, payload = {}) => {
    try {
      const response = await httpClient.put(`/termination/request/${requestId}/approve`, payload);
      return response.data;
    } catch (error) {
      console.error('Error approving termination request:', error);
      throw error.response?.data || error;
    }
  },

  rejectRequest: async (requestId, formData) => {
    try {
      const response = await httpClient.put(`/termination/request/${requestId}/reject`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting termination request:', error);
      throw error.response?.data || error;
    }
  },

  disputeRequest: async (requestId, payload = {}) => {
    try {
      const response = await httpClient.post(`/termination/request/${requestId}/dispute`, payload);
      return response.data;
    } catch (error) {
      console.error('Error disputing termination request:', error);
      throw error.response?.data || error;
    }
  },

  uploadRefundProof: async (requestId, formData) => {
    try {
      const response = await httpClient.post(`/termination/request/${requestId}/refund/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading refund proof:', error);
      throw error.response?.data || error;
    }
  },

  confirmRefundReceipt: async (requestId) => {
    try {
      const response = await httpClient.post(`/termination/request/${requestId}/refund/confirm`);
      return response.data;
    } catch (error) {
      console.error('Error confirming refund receipt:', error);
      throw error.response?.data || error;
    }
  }
};

export default terminationService;
