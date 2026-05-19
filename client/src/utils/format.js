/**
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
