/**
 * @param {string | undefined} url - The website URL.
 * @returns {string|null} The main domain name, or null if invalid.
 */
export function extractDomainName(url) {
  if (!url) return null

  // Remove protocol (http, https, etc.) and any path/query/fragment
  let domainMatch = url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0]

  // Remove port number if present
  domainMatch = domainMatch.split(':')[0]

  const parts = domainMatch.split('.')
  if (parts.length < 2) return null
  // For domains like google.co.uk, take the second-to-last part
  return parts.length > 2 ? parts[parts.length - 2] : parts[0]
}
