export { EXPIRY_THRESHOLD_SECONDS, isExpiring } from 'pearpass-lib-vault'

/**
 * @param {import('styled-components').DefaultTheme} theme
 * @param {boolean} expiring
 * @returns {string}
 */
export const getTimerColor = (theme, expiring) =>
  expiring ? theme.colors.errorRed.mode1 : theme.colors.primary400.mode1
