/**
 * Creates a formatted error message with an error code prefix
 * @param {string} code - Error code (e.g., from SecurityErrorCodes)
 * @param {string} message - Human-readable error message
 * @returns {string} Formatted error message with code prefix
 */
export function createErrorWithCode(code, message) {
  return `${code}: ${message}`
}
