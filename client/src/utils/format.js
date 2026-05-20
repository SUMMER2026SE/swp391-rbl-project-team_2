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
    maximumFractionDigits: 0
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
    year: 'numeric'
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
    minute: '2-digit'
  }).format(d);
 * Formats a number as a currency string (e.g. $2,100).
 * @param {number} value - The number to format.
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a date string to a readable format (e.g. May 19, 2026).
 * @param {string|Date} date - The date to format.
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
