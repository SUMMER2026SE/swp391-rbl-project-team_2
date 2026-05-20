import httpClient from '../../../services/httpClient';

export const roomService = {
  getRooms: (params) => httpClient.get('/rooms', { params }),
  getRoomById: (id) => httpClient.get(`/rooms/${id}`),
  getFavorites: () => httpClient.get('/rooms/favorites'),
  toggleFavorite: (id) => httpClient.post(`/rooms/${id}/favorite`),
};
