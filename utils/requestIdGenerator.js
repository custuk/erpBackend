/**
 * Generates a unique request ID for material requests
 * Format: REQ-{timestamp}-{randomString}
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REQ-${timestamp}-${randomString}`;
};

/**
 * Generates a request ID with a specific prefix
 * @param {string} prefix - Custom prefix for the request ID
 * @returns {string} Unique request ID with custom prefix
 */
const generateCustomRequestId = (prefix = 'REQ') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomString}`;
};

/**
 * Validates if a request ID follows the correct format
 * @param {string} requestId - Request ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateRequestId = (requestId) => {
  const pattern = /^[A-Z]{3,5}-[A-Z0-9]+-[A-Z0-9]{6}$/;
  return pattern.test(requestId);
};

module.exports = {
  generateRequestId,
  generateCustomRequestId,
  validateRequestId
};



