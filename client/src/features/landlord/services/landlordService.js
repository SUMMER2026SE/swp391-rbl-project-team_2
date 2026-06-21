import httpClient from '../../../services/httpClient';

export const landlordService = {
  // ===== DASHBOARD STATS =====
  getStats: async () => {
    try {
      const response = await httpClient.get('/landlord/stats');
      return response;
    } catch (error) {
      console.error('Error fetching landlord stats:', error);
      throw error;
    }
  },

  // ===== ROOMS MANAGEMENT =====
  getRooms: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/rooms', { params });
      return response;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  getRoomById: async (id) => {
    try {
      const response = await httpClient.get(`/landlord/rooms/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  createRoom: async (data) => {
    try {
      const isFormData = data instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
      const response = await httpClient.post('/landlord/rooms', data, { headers });
      return response;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  updateRoom: async (id, data) => {
    try {
      const response = await httpClient.put(`/landlord/rooms/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  deleteRoom: async (id) => {
    try {
      const response = await httpClient.delete(`/landlord/rooms/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // ===== ROOM IMAGES =====
  uploadRoomImage: async (roomId, file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await httpClient.post(`/landlord/rooms/${roomId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    } catch (error) {
      console.error('Error uploading room image:', error);
      throw error;
    }
  },

  deleteRoomImage: async (roomId, imageId) => {
    try {
      const response = await httpClient.delete(`/landlord/rooms/${roomId}/images/${imageId}`);
      return response;
    } catch (error) {
      console.error('Error deleting room image:', error);
      throw error;
    }
  },

  setPrimaryImage: async (roomId, imageId) => {
    try {
      const response = await httpClient.put(`/landlord/rooms/${roomId}/images/${imageId}/primary`);
      return response;
    } catch (error) {
      console.error('Error setting primary image:', error);
      throw error;
    }
  },

  // ===== ROOM FACILITIES =====
  addFacility: async (roomId, facilityData) => {
    try {
      const response = await httpClient.post(`/landlord/rooms/${roomId}/facilities`, facilityData);
      return response;
    } catch (error) {
      console.error('Error adding facility:', error);
      throw error;
    }
  },

  removeFacility: async (roomId, facilityId) => {
    try {
      const response = await httpClient.delete(`/landlord/rooms/${roomId}/facilities/${facilityId}`);
      return response;
    } catch (error) {
      console.error('Error removing facility:', error);
      throw error;
    }
  },

  updateFacility: async (roomId, facilityId, facilityData) => {
    try {
      const response = await httpClient.put(`/landlord/rooms/${roomId}/facilities/${facilityId}`, facilityData);
      return response;
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  // ===== PROPERTIES MANAGEMENT (Legacy - kept for compatibility) =====
  getProperties: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/properties', { params });
      return response;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  createProperty: async (data) => {
    try {
      const response = await httpClient.post('/landlord/properties', data);
      return response;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  updateProperty: async (id, data) => {
    try {
      const response = await httpClient.put(`/landlord/properties/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  deleteProperty: async (id) => {
    try {
      const response = await httpClient.delete(`/landlord/properties/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // ===== RENTAL REQUESTS / BOOKINGS =====
  getRequests: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/rental-requests', { params });
      // response is already { success, data, pagination } from httpClient interceptor
      return response;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  getRequestById: async (id) => {
    try {
      const response = await httpClient.get(`/landlord/rental-requests/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  },

  approveRequest: async (id) => {
    try {
      const response = await httpClient.put(`/landlord/rental-requests/${id}/approve`);
      return response;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  rejectRequest: async (id, reason) => {
    try {
      const response = await httpClient.put(`/landlord/rental-requests/${id}/reject`, { rejectionReason: reason });
      return response;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },

  // ===== PAYMENTS =====
  getPayments: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/payments', { params });
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  getPaymentById: async (id) => {
    try {
      const response = await httpClient.get(`/landlord/payments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  getPaymentStatistics: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/payments/statistics', { params });
      return response;
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
      throw error;
    }
  },

  // ===== CONTRACTS =====
  getContracts: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/contracts', { params });
      return response;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  getContractById: async (id) => {
    try {
      const response = await httpClient.get(`/landlord/contracts/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  },

  createContract: async (data) => {
    try {
      const response = await httpClient.post('/landlord/contracts', data);
      return response;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  updateContract: async (id, data) => {
    try {
      const response = await httpClient.put(`/landlord/contracts/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  renewContract: async (id, data) => {
    try {
      const response = await httpClient.post(`/landlord/contracts/${id}/renew`, data);
      return response;
    } catch (error) {
      console.error('Error renewing contract:', error);
      throw error;
    }
  },

  terminateContract: async (id, reason) => {
    try {
      const response = await httpClient.put(`/landlord/contracts/${id}/terminate`, { reason });
      return response;
    } catch (error) {
      console.error('Error terminating contract:', error);
      throw error;
    }
  },

  // ===== VIEWING SCHEDULES =====
  getSchedules: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/schedules', { params });
      return response;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  getScheduleById: async (id) => {
    try {
      const response = await httpClient.get(`/landlord/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  createSchedule: async (data) => {
    try {
      const response = await httpClient.post('/landlord/schedules', data);
      return response;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  updateSchedule: async (id, data) => {
    try {
      const response = await httpClient.put(`/landlord/schedules/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  deleteSchedule: async (id) => {
    try {
      const response = await httpClient.delete(`/landlord/schedules/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  // ===== COMPLAINTS =====
  getComplaints: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/complaints', { params });
      return response;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },

  getComplaintById: async (id) => {
    try {
      const response = await httpClient.get(`/landlord/complaints/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching complaint:', error);
      throw error;
    }
  },

  updateComplaintStatus: async (id, status) => {
    try {
      const response = await httpClient.put(`/landlord/complaints/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  },

  updateComplaintPriority: async (id, priority) => {
    try {
      const response = await httpClient.put(`/landlord/complaints/${id}/priority`, { priority });
      return response;
    } catch (error) {
      console.error('Error updating complaint priority:', error);
      throw error;
    }
  },

  // ===== MESSAGES =====
  getMessages: async (params = {}) => {
    try {
      const response = await httpClient.get('/chat/messages', { params });
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  getConversations: async (params = {}) => {
    try {
      const response = await httpClient.get('/chat/conversations', { params });
      return response;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getConversationById: async (id) => {
    try {
      const response = await httpClient.get(`/chat/conversations/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const response = await httpClient.post(`/chat/conversations/${conversationId}/messages`, { content });
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // ===== NOTIFICATIONS =====
  getNotifications: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/notifications', { params });
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await httpClient.put(`/landlord/notifications/${id}/read`, { read: true });
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await httpClient.put('/landlord/notifications/read-all');
      return response;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // ===== DEPOSITS MANAGEMENT =====
  getDeposits: async (params = {}) => {
    try {
      const response = await httpClient.get('/landlord/deposits', { params });
      return response;
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  },

  updateDepositStatus: async (id, status) => {
    try {
      const response = await httpClient.patch(`/landlord/deposits/${id}`, { status });
      return response;
    } catch (error) {
      console.error('Error updating deposit status:', error);
      throw error;
    }
  },

  // ===== PROFILE =====
  getProfile: async () => {
    try {
      const response = await httpClient.get('/landlord/profile');
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await httpClient.put('/landlord/profile', data);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await httpClient.post('/landlord/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await httpClient.post('/landlord/profile/change-password', {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },
};
