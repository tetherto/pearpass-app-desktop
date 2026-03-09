export const TIMER_URGENCY = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical'
}

/**
 * @param {number | null} timeRemaining
 * @param {number | null} period
 * @returns {string}
 */
export const getTimerUrgency = (timeRemaining, period) => {
  if (timeRemaining === null || !period) return TIMER_URGENCY.NORMAL
  const ratio = timeRemaining / period
  if (ratio <= 0.2) return TIMER_URGENCY.CRITICAL
  if (ratio <= 0.4) return TIMER_URGENCY.WARNING
  return TIMER_URGENCY.NORMAL
}
