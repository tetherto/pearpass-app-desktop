/**
 * @param {string|Date} date
 * @returns {number}
 */
export const getDateTimestamp = (date) => {
  const timestamp = new Date(date).getTime()

  if (isNaN(timestamp)) {
    throw new Error('Invalid date input')
  }

  return timestamp
}
