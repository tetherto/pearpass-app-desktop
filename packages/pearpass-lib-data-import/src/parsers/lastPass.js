import { addHttps } from '../utils/addHttps'
import { getRowsFromCsv } from '../utils/getRowsFromCsv'

/**
 * @param {string[]} row
 * @param {string} name
 * @param {string[]} headerRow
 * @returns {string | undefined}
 */
const get = (row, name, headerRow) => row[headerRow.indexOf(name)]?.trim()

/**
 * @param {string} extra
 * @param {string} label
 * @returns {string}
 */
const getField = (extra, label) => {
  const match = extra.match(new RegExp(`${label}:(.*)`))
  return match?.[1]?.trim() || ''
}

/**
 * @param {string} value
 * @returns {string}
 */
const normalizePhone = (value) => {
  try {
    const parsed = JSON.parse(value)
    return parsed.num && parsed.ext
      ? `+${parsed.num}${parsed.ext}`
      : `+${parsed.num}`
  } catch {
    return value
  }
}

/**
 * @param {string} value
 * @returns {string}
 */
const normalizeExpiry = (value) => {
  const parts = value.split(',')
  if (parts.length === 2) {
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ]
    const monthIndex = monthNames.indexOf(parts[0].trim().toLowerCase())
    if (monthIndex !== -1) {
      const month = (monthIndex + 1).toString().padStart(2, '0')
      const year = parts[1].slice(-2)
      return `${month}/${year}`
    }
  }
  return value
}

/**
 * @param {string} extraText
 * @param {Set<string>} [usedNotes]
 * @returns {Array<{ type: string, note: string }>}
 */
const toCustomFields = (extraText, usedNotes = new Set()) => {
  if (!extraText?.trim()) return []
  return extraText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) => line && !line.startsWith('NoteType:') && !usedNotes.has(line)
    )
    .map((note) => {
      let formatted = note
      if (/^(Phone|Fax|Evening Phone):/.test(note)) {
        const [label, value] = note.split(/:(.+)/)
        formatted = `${label}:${normalizePhone(value)}`
      }
      usedNotes.add(note)
      return { type: 'note', note: formatted }
    })
}

/**
 * @param {string} urlString
 * @returns {string[]}
 */
const toWebsites = (urlString) =>
  urlString ? urlString.split(',').map((site) => addHttps(site.trim())) : []

/**
 * @function parseLastPassCsv
 * @param {string} text
 * @returns {Array<Object>}
 */
export const parseLastPassCsv = (text) => {
  const rows = getRowsFromCsv(text)
  const [headerRow, ...dataRows] = rows

  const result = []

  for (const row of dataRows) {
    const url = get(row, 'url', headerRow)
    const username = get(row, 'username', headerRow)
    const password = get(row, 'password', headerRow)
    const extra = get(row, 'extra', headerRow)
    const name = get(row, 'name', headerRow)
    const folder = get(row, 'grouping', headerRow) || null
    const isFavorite = get(row, 'fav', headerRow) === '1'

    const usedNotes = new Set()

    const websites = toWebsites(url)

    if (/NoteType:Credit Card/i.test(extra)) {
      const note = getField(extra, 'Notes')
      if (note) usedNotes.add(note)
      result.push({
        type: 'creditCard',
        folder,
        isFavorite,
        data: {
          title: name || '',
          name: getField(extra, 'Name on Card'),
          number: getField(extra, 'Number'),
          expireDate: normalizeExpiry(getField(extra, 'Expiration Date')),
          securityCode: getField(extra, 'Security Code'),
          pinCode: '',
          note,
          customFields: toCustomFields(extra, usedNotes)
        }
      })
    } else if (/NoteType:Address|NoteType:Identity/i.test(extra)) {
      const note = getField(extra, 'Notes')
      if (note) {
        usedNotes.add(note)
      }

      result.push({
        type: 'identity',
        folder,
        isFavorite,
        data: {
          title: name || '',
          fullName: [
            getField(extra, 'First Name'),
            getField(extra, 'Middle Name'),
            getField(extra, 'Last Name')
          ]
            .filter(Boolean)
            .join(' '),
          username: getField(extra, 'Username'),
          email: getField(extra, 'Email Address'),
          phoneNumber: normalizePhone(getField(extra, 'Mobile Phone')),
          address: [
            getField(extra, 'Address 1'),
            getField(extra, 'Address 2'),
            getField(extra, 'Address 3')
          ]
            .filter(Boolean)
            .join(', '),
          zip: getField(extra, 'Zip / Postal Code'),
          city: getField(extra, 'City / Town'),
          region: getField(extra, 'State'),
          country: getField(extra, 'Country'),
          note,
          customFields: toCustomFields(extra, usedNotes)
        }
      })
    } else if (!password && extra) {
      if (extra) {
        usedNotes.add(extra)
      }

      result.push({
        type: 'note',
        folder,
        isFavorite,
        data: {
          title: name || '',
          note: extra,
          customFields: toCustomFields(extra, usedNotes)
        }
      })
    } else {
      if (extra) {
        usedNotes.add(extra)
      }

      result.push({
        type: 'login',
        folder,
        isFavorite,
        data: {
          title: name || '',
          username,
          password,
          note: extra || '',
          websites,
          customFields: toCustomFields(extra, usedNotes)
        }
      })
    }
  }

  return result
}

/**
 * @param {string} data
 * @param {string} type
 * @returns {*}
 */
export const parseLastPassData = (data, type) => {
  if (type === 'csv') {
    return parseLastPassCsv(data)
  }

  throw new Error('Unsupported file type, please use CSV')
}
