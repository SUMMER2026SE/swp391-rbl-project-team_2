import httpClient from '../../../services/httpClient';

export const searchService = {
  // Search rooms with filters
  searchRooms: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/tenant/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
  },

  // Get room details
  getRoomDetail: async (roomId) => {
    try {
      const response = await httpClient.get(`/api/tenant/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room detail:', error);
      throw error;
    }
  },

  // Get room reviews
  getRoomReviews: async (roomId, params = {}) => {
    try {
      const response = await httpClient.get(`/api/tenant/rooms/${roomId}/reviews`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching room reviews:', error);
      throw error;
    }
  },

  // Get suggested rooms
  getSuggestedRooms: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/tenant/suggested', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching suggested rooms:', error);
      throw error;
    }
  },

  // Get room amenities
  getAmenities: async () => {
    try {
      const response = await httpClient.get('/api/tenant/amenities');
      return response.data;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw error;
    }
  },
};
