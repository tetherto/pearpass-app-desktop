import { getDateTimestamp } from './getDateTimestamp'

/**
 * Compares two dates to check if the first date is earlier than second.
 *
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {boolean}
 */
export const isBefore = (date1, date2) =>
  getDateTimestamp(date1) < getDateTimestamp(date2)
