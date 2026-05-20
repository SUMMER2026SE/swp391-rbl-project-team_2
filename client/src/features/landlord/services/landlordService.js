import httpClient from '../../../services/httpClient';

export const landlordService = {
  // Dashboard Stats
  getStats: async () => {
    try {
      const response = await httpClient.get('/api/landlord/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching landlord stats:', error);
      throw error;
    }
  },

  // Properties Management
  getProperties: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/landlord/properties', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  createProperty: async (data) => {
    try {
      const response = await httpClient.post('/api/landlord/properties', data);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  updateProperty: async (id, data) => {
    try {
      const response = await httpClient.put(`/api/landlord/properties/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  deleteProperty: async (id) => {
    try {
      const response = await httpClient.delete(`/api/landlord/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Deposits Management
  getDeposits: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/landlord/deposits', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  },

  updateDepositStatus: async (id, status) => {
    try {
      const response = await httpClient.patch(`/api/landlord/deposits/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating deposit status:', error);
      throw error;
    }
  },

  // Rental Requests
  getRequests: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/landlord/requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  approveRequest: async (id) => {
    try {
      const response = await httpClient.patch(`/api/landlord/requests/${id}`, { status: 'APPROVED' });
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  rejectRequest: async (id, reason) => {
    try {
      const response = await httpClient.patch(`/api/landlord/requests/${id}`, { status: 'REJECTED', reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },

  // Messages
  getMessages: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/landlord/messages', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  sendMessage: async (recipientId, content) => {
    try {
      const response = await httpClient.post('/api/landlord/messages', { recipientId, content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/landlord/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await httpClient.patch(`/api/landlord/notifications/${id}`, { read: true });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};
