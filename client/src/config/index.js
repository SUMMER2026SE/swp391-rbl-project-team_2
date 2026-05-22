export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CONFIG = {
  APP_NAME: 'RentalRoom',
  API_URL,
  ENV: import.meta.env.MODE || 'development',
  TIMEOUT: 10000,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID || '',
};

export default CONFIG;
