import { getPathArray } from './getPathArray'

/**
 * @param {object} obj
 * @param {string | string[]} path
 * @param {any} value
 * @returns {object}
 */
export const getNestedValue = (obj, path, defaultValue) => {
  if (!obj) {
    return defaultValue
  }

  const pathArray = getPathArray(path)

  return pathArray.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
    obj
  )
}
