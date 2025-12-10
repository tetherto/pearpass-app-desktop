/**
 * @param {string|Date} dateInput
 * @param {string} format
 *   Supported components in the format string:
 *   - 'yyyy' for the full year
 *   - 'yy' for the two-digit year
 *   - 'dd' for the day of the month (two digits)
 *   - 'ddd' for the abbreviated weekday name (e.g., 'Mon')
 *   - 'mm' for the month (two digits)
 *   - 'mmm' for the abbreviated month name (e.g., 'Jan')
 * @param {string} separator
 * @returns {string}
 */
export const formatDate = (
  dateInput,
  format = 'yyyy-mm-dd',
  separator = '-'
) => {
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  const year = date.getFullYear()
  const twoDigitYear = String(year).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' })
  const monthName = date.toLocaleString('en-US', { month: 'short' })

  const dateComponents = {
    yyyy: year,
    yy: twoDigitYear,
    mm: month,
    dd: day,
    ddd: dayOfWeek,
    mmm: monthName
  }

  const formatArray = format.toLowerCase().split('-')

  const formattedDate = formatArray
    .map((component) => dateComponents[component] || component)
    .join(separator)

  return formattedDate
}
