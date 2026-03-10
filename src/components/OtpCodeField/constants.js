export const EXPIRY_THRESHOLD_SECONDS = 5

/**
 * @param {number | null} timeRemaining
 * @returns {boolean}
 */
export const isExpiring = (timeRemaining) =>
  timeRemaining !== null && timeRemaining <= EXPIRY_THRESHOLD_SECONDS

/**
 * @param {import('styled-components').DefaultTheme} theme
 * @param {boolean} expiring
 * @returns {string}
 */
export const getTimerColor = (theme, expiring) =>
  expiring ? theme.colors.errorRed.mode1 : theme.colors.primary400.mode1
