/**
 * @param {string} pattern
 * @param {string} value
 * @returns {boolean}
 */
export const matchPatternToValue = (pattern, value) =>
  !!value?.toLowerCase().includes(pattern?.toLowerCase())
