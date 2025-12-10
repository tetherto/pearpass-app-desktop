/**
 * @param {string} url - The URL to process.
 * @returns {string} The URL guaranteed to start with 'https://'.
 */
export const addHttps = (url) => {
  const lowerCaseUrl = url.toLowerCase()

  return lowerCaseUrl.startsWith('http://') ||
    lowerCaseUrl.startsWith('https://')
    ? lowerCaseUrl
    : `https://${lowerCaseUrl}`
}
