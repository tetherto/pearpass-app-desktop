/**

 * @param {Array<Object>} [items=[]]
 * @param {string | number} [items[].id]
 * @returns {Array<string | number>}
 * @throws {Error} 
 */
export const extractIds = (items = []) => {
  if (!Array.isArray(items)) {
    throw new Error('Input must be an array of records')
  }

  return items.map((item) => item.id)
}
