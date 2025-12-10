/**
 * @param {string} url
 * @returns {boolean}
 */
export const addHttps = (url) =>
  url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`
