import { addHttps } from '../utils/addHttps'
import { getRowsFromCsv } from '../utils/getRowsFromCsv'

/**
 * @function parseNordPassCSV
 * @param {string} csvText
 * @returns {Array<Object>}
 */
export const parseNordPassCSV = (csvText) => {
  const rows = getRowsFromCsv(csvText)
  const [headerRow, ...dataRows] = rows
  const headers = headerRow.map((h) => h.trim())
  const entries = []

  for (const row of dataRows) {
    const item = Object.fromEntries(
      headers.map((key, i) => [key, row[i]?.trim() ?? ''])
    )

    const {
      type,
      folder,
      name,
      username,
      password,
      note,
      cardholdername,
      cardnumber,
      cvc,
      pin,
      expirydate,
      full_name,
      phone_number,
      email,
      address1,
      address2,
      city,
      country,
      state,
      custom_fields,
      url,
      additional_urls
    } = item

    const base = {
      folder: folder || null,
      isFavorite: false
    }

    const urls = [url, ...JSON.parse(additional_urls || '[]')]
      .map((u) => addHttps(u))
      .filter(Boolean)

    let entry = null

    if (type === 'folder') {
      continue
    }

    if (type === 'password') {
      entry = {
        type: 'login',
        ...base,
        data: {
          title: name,
          username: username || '',
          password: password || '',
          note: note || '',
          websites: urls,
          customFields: parseCustomFields(custom_fields)
        }
      }
    } else if (type === 'credit_card') {
      entry = {
        type: 'creditCard',
        ...base,
        data: {
          title: name,
          name: cardholdername || '',
          number: cardnumber || '',
          expireDate: normalizeExpireDate(expirydate),
          securityCode: cvc || '',
          pinCode: pin || '',
          note: note || '',
          customFields: parseCustomFields(custom_fields)
        }
      }
    } else if (type === 'note') {
      entry = {
        type: 'note',
        ...base,
        data: {
          title: name,
          note: note || '',
          customFields: parseCustomFields(custom_fields)
        }
      }
    } else if (type === 'identity') {
      entry = {
        type: 'identity',
        ...base,
        data: {
          title: name,
          fullName: full_name || '',
          email: email || '',
          phoneNumber: normalizePhone(phone_number),
          address: [address1, address2].filter(Boolean).join(', ') || '',
          zip: item.zipcode || '',
          city: city || '',
          region: state || '',
          country: country || '',
          note: note || '',
          customFields: parseCustomFields(custom_fields)
        }
      }
    } else {
      entry = {
        type: 'custom',
        ...base,
        data: {
          title: name,
          customFields: parseCustomFields(custom_fields)
        }
      }
    }

    entries.push(entry)
  }

  return entries
}

/**
 * @param {string} customFields
 * @returns {Array<{type: string, note: string}>}
 */
const parseCustomFields = (customFields) => {
  try {
    const parsed = JSON.parse(customFields || '[]')
    return parsed.map(({ label, value }) => ({
      type: 'note',
      note: `${label}:${value}`
    }))
  } catch {
    return []
  }
}

/**
 * @param {string} str
 * @returns {string}
 */
const normalizeExpireDate = (str) => {
  if (!str) {
    return ''
  }

  const match = str.match(/(\d{2})\/(\d{2,4})/)
  if (!match) {
    return str
  }

  const [, month, year] = match
  return `${month.padStart(2, '0')}/${year.length === 2 ? year : year.slice(-2)}`
}

/**
 * @param {string} str
 * @returns {string}
 */
const normalizePhone = (str) => {
  if (!str) {
    return ''
  }

  const digits = str.replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

/**
 * @param {string} data
 * @param {string} fileType
 * @returns {Array}
 * @throws {Error}
 */
export const parseNordPassData = (data, fileType) => {
  if (fileType === 'csv') {
    return parseNordPassCSV(data)
  }

  throw new Error('Unsupported file type, please use CSV')
}
