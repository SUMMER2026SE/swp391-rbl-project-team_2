import httpClient from '../../../services/httpClient';

export const favoriteService = {
  // Get all favorites
  getFavorites: async (params = {}) => {
    try {
      const response = await httpClient.get('/tenant/favorites', { params });
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Add to favorites
  addFavorite: async (roomId) => {
    try {
      const response = await httpClient.post(`/tenant/favorites/${roomId}`);
      return response;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Remove from favorites
  removeFavorite: async (roomId) => {
    try {
      const response = await httpClient.delete(`/tenant/favorites/${roomId}`);
      return response;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // Check if room is favorite by getting all favorites and checking
  checkFavoriteStatus: async (roomId) => {
    try {
      const response = await httpClient.get('/tenant/favorites');
      const favorites = response.data || response || [];
      return favorites.some(fav => parseInt(fav.room_id) === parseInt(roomId) || parseInt(fav.roomId) === parseInt(roomId));
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    }
  },
};
