/**
 * Formats a number to Vietnamese Dong currency format
 * @param {number} amount - The amount to format
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a date string or timestamp into a readable date format
 * @param {string|number|Date} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

/**
 * Formats a date string or timestamp into a readable date and time format
 * @param {string|number|Date} date - The date to format
 * @returns {string} The formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncates a string to a maximum length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
};

/**
 * Gets a valid avatar URL or falls back to UI Avatars
 * @param {string} fullName - User's full name
 * @param {string} avatarUrl - User's existing avatar URL
 * @param {number} size - Avatar size (default 150)
 * @returns {string} Formatted avatar URL
 */
export const getAvatarUrl = (fullName, avatarUrl, size = 150) => {
  if (avatarUrl) {
    if (avatarUrl.startsWith('/uploads')) {
      const baseUrl = 'http://localhost:5000'; // Fallback backend URL
      return `${baseUrl}${avatarUrl}`;
    }
    return avatarUrl;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=random&size=${size}`;
};
