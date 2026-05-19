import httpClient from '../../../services/httpClient';

/**
 * API service for verification-related endpoints.
 */
const verificationService = {
  /**
   * Send OTP code to the user's email.
   * @param {string} email - The target email address.
   */
  sendEmailOtp: (email) => {
    return httpClient.post('/verification/email/send', { email });
  },

  /**
   * Verify the OTP code entered by the user.
   * @param {string} email - The user's email address.
   * @param {string} code  - The 6-digit OTP code.
   */
  verifyEmailOtp: (email, code) => {
    return httpClient.post('/verification/email/verify', { email, code });
  },

  /**
   * Send OTP code via SMS.
   * @param {string} phone - The user's phone number.
   */
  sendSmsOtp: (phone) => {
    return httpClient.post('/verification/sms/send', { phone });
  },

  /**
   * Verify SMS OTP code.
   * @param {string} phone - The user's phone number.
   * @param {string} code  - The 6-digit OTP code.
   */
  verifySmsOtp: (phone, code) => {
    return httpClient.post('/verification/sms/verify', { phone, code });
  },
};

export default verificationService;
