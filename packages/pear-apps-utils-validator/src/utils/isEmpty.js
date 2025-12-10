import { isNullOrUndefined } from './isNullOrUndefined'

/**
 * @param {any} value
 * @returns {boolean}
 */
export const isEmpty = (value) => {
  if (isNullOrUndefined(value)) {
    return true
  }

  if (typeof value === 'string' && value.trim() === '') {
    return true
  }

  return false
}
