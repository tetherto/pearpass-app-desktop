import { isNullOrUndefined } from './isNullOrUndefined'

/**
 * @param {any} value
 * @param {'boolean' | 'string' | 'number' | 'array'} type
 * @returns {boolean}
 */
export const checkFilledValueType = (value, type) => {
  if (type === 'array') {
    return !isNullOrUndefined(value) && !Array.isArray(value)
  }

  return !isNullOrUndefined(value) && typeof value !== type
}
