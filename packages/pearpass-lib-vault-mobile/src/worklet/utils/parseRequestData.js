/**
 * @param {string | Buffer} data
 * @returns {string | Buffer | null}
 */
export const parseRequestData = (data) => {
  if (!data) {
    return null
  }

  try {
    return JSON.parse(data)
    // eslint-disable-next-line no-unused-vars
  } catch (_error) {
    return data
  }
}
