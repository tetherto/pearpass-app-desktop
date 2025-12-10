import { addHttps } from '../utils/addHttps'
import { getRowsFromCsv } from '../utils/getRowsFromCsv'

/**
 * @param {string[]} row
 * @param {string} name
 * @param {string[]} headers
 * @returns {string}
 */
const get = (row, name, headers) =>
  row[headers.indexOf(name)]?.replace(/^"|"$/g, '').trim() || ''

/**
 * @param {string} csvText
 * @returns {Array<{
 *   type: 'login',
 *   folder: null,
 *   isFavorite: boolean,
 *   data: {
 *     title: string,
 *     username: string,
 *     password: string,
 *     note: string,
 *     websites: Array<string>,
 *     customFields: Array<never>
 *   }
 * }>}
 */
export const parse1PasswordCSV = (csvText) => {
  const rows = getRowsFromCsv(csvText)
  const [headerRow, ...dataRows] = rows

  return dataRows.map((row) => {
    const url = get(row, 'Url', headerRow)

    return {
      type: 'login',
      folder: null,
      isFavorite: get(row, 'Favorite', headerRow) === 'true',
      data: {
        title: get(row, 'Title', headerRow),
        username: get(row, 'Username', headerRow),
        password: get(row, 'Password', headerRow),
        note: get(row, 'Notes', headerRow),
        websites: url ? [addHttps(url)] : [],
        customFields: []
      }
    }
  })
}

/**
 * @param {string} data
 * @param {string} fileType
 * @throws {Error}
 * @returns {Object}
 */
export const parse1PasswordData = (data, fileType) => {
  if (fileType === 'csv') {
    return parse1PasswordCSV(data)
  }

  throw new Error('Unsupported file type, please use CSV')
}
