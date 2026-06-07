import httpClient from '../../../services/httpClient';

export const searchService = {
  // Search rooms with filters
  searchRooms: async (params = {}) => {
    try {
      const response = await httpClient.get('/listings/search', { params });
      return response;
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
  },

  // Get room details
  getRoomDetail: async (roomId) => {
    try {
      const response = await httpClient.get(`/listings/${roomId}`);
      return response;
    } catch (error) {
      console.error('Error fetching room detail:', error);
      throw error;
    }
  },

  // Get room reviews
  getRoomReviews: async (roomId, params = {}) => {
    try {
      const response = await httpClient.get(`/listings/${roomId}/reviews`, { params });
      return response;
    } catch (error) {
      console.error('Error fetching room reviews:', error);
      throw error;
    }
  },

  // Get suggested rooms
  getSuggestedRooms: async (params = {}) => {
    try {
      const response = await httpClient.get('/listings', { params });
      return response;
    } catch (error) {
      console.error('Error fetching suggested rooms:', error);
      throw error;
    }
  },

  // Get room amenities
  getAmenities: async () => {
    try {
      const response = await httpClient.get('/listings/amenities');
      return response;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw error;
    }
  },
};
