import { formatDate } from 'pear-apps-utils-date'

/**
 * Formats a passkey creation timestamp to "Created on dd/mm/yy, HH:mm" format
 * @param {number|string|Date} timestamp - Timestamp in milliseconds or Date object
 * @returns {string|null} Formatted date string or null if timestamp is invalid
 */
export const formatPasskeyDate = (timestamp) => {
  if (!timestamp) return null
  try {
    const dateStr = formatDate(timestamp, 'dd-mm-yy', '/')
    const timeStr = formatDate(timestamp, 'hh-mi', ':')
    return `Created on ${dateStr}, ${timeStr}`
  } catch {
    return null
  }
}
