/**
 * Sorts an array of objects alphabetically by their name property.
 * Uses case-insensitive comparison with locale support.
 *
 * @template T
 * @param {T[]} items - Array of objects with a name property
 * @returns {T[]} New sorted array (does not mutate original)
 *
 **/

export const sortByName = (items) => {
  if (!items || !Array.isArray(items)) {
    return []
  }

  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  )
}
