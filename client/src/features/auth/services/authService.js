import httpClient from '../../../services/httpClient';

export const authService = {
  login: (credentials) => httpClient.post('/auth/login', credentials),
  register: (data) => httpClient.post('/auth/register', data),
  getProfile: () => httpClient.get('/auth/profile'),
  logout: () => httpClient.post('/auth/logout'),
};
