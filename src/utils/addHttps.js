/**
 * @param {string} url
 * @returns {boolean}
 */
export const addHttps = (url) => {
  const lowerUrl = url.toLowerCase()

  return lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')
    ? lowerUrl
    : `https://${lowerUrl}`
}
