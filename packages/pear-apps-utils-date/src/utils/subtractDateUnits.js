/**
 * Subtracts time from now or a provided base date.
 * Supports: day, month, year.
 *
 * @param {number} amount - Positive integer amount to subtract
 * @param {('day'|'month'|'year')} unit
 * @param {string|Date} [fromDate=new Date()] - Base date to subtract from
 * @returns {Date}
 */
export const subtractDateUnits = (amount, unit, fromDate = new Date()) => {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount)) {
    throw new Error('Invalid amount')
  }

  const date = new Date(fromDate)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date input')
  }

  const normalized = String(unit).toLowerCase()

  switch (normalized) {
    case 'day':
      date.setDate(date.getDate() - numericAmount)
      return date
    case 'month': {
      const originalDay = date.getDate()
      date.setDate(1)
      date.setMonth(date.getMonth() - numericAmount)
      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate()
      date.setDate(Math.min(originalDay, lastDayOfMonth))
      return date
    }
    case 'year': {
      const originalDay = date.getDate()
      const originalMonth = date.getMonth()
      date.setDate(1)
      date.setFullYear(date.getFullYear() - numericAmount)
      date.setMonth(originalMonth)
      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate()
      date.setDate(Math.min(originalDay, lastDayOfMonth))
      return date
    }
    default:
      throw new Error('Invalid unit')
  }
}
