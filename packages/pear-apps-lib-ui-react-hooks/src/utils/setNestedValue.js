import { getPathArray } from './getPathArray'

/**
 * @param {object} obj
 * @param {string | string[]} path
 * @param {any} value
 * @returns {object}
 */
export const setNestedValue = (obj, path, value) => {
  if (!obj) {
    return
  }

  const result = { ...obj }

  const pathArray = getPathArray(path)

  pathArray.reduce((acc, key, index) => {
    if (index === pathArray.length - 1) {
      acc[key] = value
    } else {
      if (!acc[key] || typeof acc[key] !== 'object') {
        acc[key] = {}
      }
    }
    return acc[key]
  }, result)

  return result
}
