import httpClient from '../../../services/httpClient';

export const favoriteService = {
  // Get all favorites
  getFavorites: async (params = {}) => {
    try {
      const response = await httpClient.get('/api/tenant/favorites', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Add to favorites
  addFavorite: async (roomId) => {
    try {
      const response = await httpClient.post('/api/tenant/favorites', { roomId });
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Remove from favorites
  removeFavorite: async (roomId) => {
    try {
      const response = await httpClient.delete(`/api/tenant/favorites/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // Check if room is favorite
  isFavorite: async (roomId) => {
    try {
      const response = await httpClient.get(`/api/tenant/favorites/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    }
  },
};
