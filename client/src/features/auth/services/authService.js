import httpClient from '../../../services/httpClient';

export const authService = {
  // Login with email & password
  login: (credentials) => httpClient.post('/auth/login', credentials),

  // Register new account
  register: (data) => httpClient.post('/auth/register', data),

  // Verify email with OTP
  verifyEmail: (data) => httpClient.post('/auth/verify-email', data),

  // Google login
  googleLogin: (credential) => httpClient.post('/auth/google', { credential }),

  // Forgot password - send OTP
  forgotPassword: (email) => httpClient.post('/auth/forgot-password', { email }),

  // Reset password with OTP
  resetPassword: (data) => httpClient.post('/auth/reset-password', data),

  // Resend OTP
  resendOtp: (data) => httpClient.post('/auth/resend-otp', data),

  // Get current user profile
  getProfile: () => httpClient.get('/user/profile'),

  // Update profile
  updateProfile: (data) => httpClient.put('/user/profile', data),

  // Upload avatar
  uploadAvatar: (formData) => httpClient.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Change password
  changePassword: (data) => httpClient.post('/user/change-password', data),

  // Logout (client-side only)
  logout: () => Promise.resolve(),
};
