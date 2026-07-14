/**
 * Normalizes a Vietnamese name to a standardized uppercase format without accents.
 * e.g., "Nguyễn Văn A" -> "NGUYEN VAN A"
 *       "  trần  thị   bê  " -> "TRAN THI BE"
 * @param {string} name 
 * @returns {string}
 */
const normalizeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .trim()
    .toUpperCase()
    // Normalize unicode decomposition to separate base letters from diacritics
    .normalize('NFD')
    // Remove diacritics (combining character marks)
    .replace(/[\u0300-\u036f]/g, '')
    // Replace Đ custom character
    .replace(/Đ/g, 'D')
    // Replace any other non-standard characters with space
    .replace(/[^A-Z0-9\s]/g, '')
    // Collapse multiple spaces to single space
    .replace(/\s+/g, ' ');
};

/**
 * Checks if two names match after normalization
 * @param {string} name1 
 * @param {string} name2 
 * @returns {boolean}
 */
const compareNames = (name1, name2) => {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);
  return norm1 !== '' && norm2 !== '' && norm1 === norm2;
};

module.exports = {
  normalizeName,
  compareNames
};
