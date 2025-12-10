import { PASSWORD_STRENGTH } from '../constants'

/**
 * @param {string} str
 * @returns {string}
 */
const capitalize = (str) => (str ? str[0].toUpperCase() + str.slice(1) : '')

/**
 * Get configuration for a given password strength level
 * @param {string} strength - PASSWORD_STRENGTH constant
 * @returns {{
 *  text: string,
 *  type: 'error' | 'warning' | 'success'
 * } | null}
 */
export const getStrengthDisplay = (strength) => {
  const strengthToTypeMapping = {
    [PASSWORD_STRENGTH.VULNERABLE]: 'error',
    [PASSWORD_STRENGTH.WEAK]: 'warning',
    [PASSWORD_STRENGTH.SAFE]: 'success'
  }
  const type = strengthToTypeMapping[strength]
  return type
    ? {
        text: capitalize(strength),
        type
      }
    : null
}
