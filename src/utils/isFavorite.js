/**
 * Favorites folder identifier used across the app.
 */
export const FAVORITES_FOLDER_ID = 'favorites'

/**
 *
 * @param {string} folder
 * @returns  {boolean}
 * */
export const isFavorite = (folder) => folder === FAVORITES_FOLDER_ID
