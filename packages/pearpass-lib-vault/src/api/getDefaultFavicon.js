import { faviconBuffers } from '../constants/favicons'

/**
 * Get the default favicon for a given domain.
 * @param {string} domain - The domain to get the favicon for.
 * @returns {Buffer|null} - The favicon buffer or null if not found.
 */
export const getDefaultFavicon = (domain) => faviconBuffers[domain] || null
