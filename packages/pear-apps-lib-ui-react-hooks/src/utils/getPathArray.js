/**
 * @param {string | string[]} path
 * @returns {string[]}
 */
export const getPathArray = (path) =>
  Array.isArray(path) ? path : path.replace(/\[(\w+)\]/g, '.$1').split('.')
