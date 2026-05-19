import httpClient from './httpClient';

export const authApi = {
  login: (credentials) => httpClient.post('/auth/login', credentials),
  register: (data) => httpClient.post('/auth/register', data),
  getProfile: () => httpClient.get('/auth/profile'),
};

export const roomApi = {
  getRooms: (params) => httpClient.get('/rooms', { params }),
  getRoomById: (id) => httpClient.get(`/rooms/${id}`),
};
