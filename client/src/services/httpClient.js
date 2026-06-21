import axios from 'axios';
import { API_URL } from '../config';

const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Attach JWT token to every request
httpClient.interceptors.request.use(
  (config) => {
    // Get token from Zustand persisted storage
    try {
      const authStorage = JSON.parse(sessionStorage.getItem('auth-storage'));
      const token = authStorage?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore parse errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle global errors here
    if (error.response?.status === 401) {
      // Token expired - clear auth storage and redirect to login
      sessionStorage.removeItem('auth-storage');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
