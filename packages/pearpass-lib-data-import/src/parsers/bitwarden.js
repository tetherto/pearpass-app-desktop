import { addHttps } from '../utils/addHttps'
import { getRowsFromCsv } from '../utils/getRowsFromCsv'

/**
 * @param {{firstName?: string, middleName?: string, lastName?: string}} identity
 * @returns {string}
 */
const getFullName = (identity) =>
  [identity?.firstName, identity?.middleName, identity?.lastName]
    .filter(Boolean)
    .join(' ')

/**
 * @param {object} json
 * @param {Array<object>} [json.folders]
 * @param {string} json.folders[].id
 * @param {string} json.folders[].name
 * @param {Array<object>} [json.items]
 * @param {number} json.items[].type
 * @param {string} json.items[].name
 * @param {string} [json.items[].notes]
 * @param {boolean} [json.items[].favorite]
 * @param {string} [json.items[].folderId]
 * @param {object} [json.items[].login]
 * @param {string} [json.items[].login.username]
 * @param {string} [json.items[].login.password]
 * @param {Array<object>} [json.items[].login.uris]
 * @param {string} json.items[].login.uris[].uri
 * @param {object} [json.items[].card]
 * @param {string} [json.items[].card.cardholderName]
 * @param {string} [json.items[].card.number]
 * @param {string} [json.items[].card.expMonth]
 * @param {string} [json.items[].card.expYear]
 * @param {string} [json.items[].card.code]
 * @param {object} [json.items[].identity]
 * @param {string} [json.items[].identity.email]
 * @param {string} [json.items[].identity.phone]
 * @param {string} [json.items[].identity.address1]
 * @param {string} [json.items[].identity.address2]
 * @param {string} [json.items[].identity.address3]
 * @param {string} [json.items[].identity.postalCode]
 * @param {string} [json.items[].identity.city]
 * @param {string} [json.items[].identity.state]
 * @param {string} [json.items[].identity.country]
 * @param {string} [json.items[].identity.passportNumber]
 * @param {string} [json.items[].identity.licenseNumber]
 * @param {string} [json.items[].identity.ssn]
 * @returns {Array<{type: string, data: object, folder: string|null, isFavorite: boolean}>}
 */
export const parseBitwardenJson = (json) => {
  const folders = Object.fromEntries(
    (json.folders || []).map((f) => [f.id, f.name])
  )

  return (json.items || []).map((item) => {
    const { type, name, notes, favorite, folderId, login, card, identity } =
      item

    const folder = folders[folderId] || null
    let entryType = 'custom'
    let data = {}

    switch (type) {
      case 1:
        entryType = 'login'
        data = {
          title: name,
          username: login?.username || '',
          password: login?.password || '',
          note: notes || '',
          websites: (login?.uris || []).map((u) => addHttps(u.uri)),
          customFields: []
        }
        break

      case 2:
        entryType = 'note'
        data = {
          title: name,
          note: notes || '',
          customFields: []
        }
        break

      case 3:
        entryType = 'creditCard'
        data = {
          title: name,
          name: card?.cardholderName || '',
          number: card?.number || '',
          expireDate: card
            ? `${card.expMonth || ''}/${card.expYear || ''}`
            : '',
          securityCode: card?.code || '',
          pinCode: '',
          note: notes || '',
          customFields: []
        }
        break

      case 4:
        entryType = 'identity'
        data = {
          title: name,
          fullName: getFullName(identity),
          email: identity?.email || '',
          phoneNumber: identity?.phone || '',
          address: [identity?.address1, identity?.address2, identity?.address3]
            .filter(Boolean)
            .join(', '),
          zip: identity?.postalCode || '',
          city: identity?.city || '',
          region: identity?.state || '',
          country: identity?.country || '',
          passportNumber: identity?.passportNumber || '',
          drivingLicenseNumber: identity?.licenseNumber || '',
          idCardNumber: identity?.ssn || '',
          note: notes || '',
          customFields: []
        }
        break

      default:
        entryType = 'custom'
        data = {
          title: name,
          customFields: []
        }
    }
    return {
      type: entryType,
      data,
      folder,
      isFavorite: Boolean(favorite)
    }
  })
}

/**
 * @param {string} csvText
 * @returns {Array<{type: 'login'|'note'|'custom', data: object, folder: string, isFavorite: boolean}>}
 */
export const parseBitwardenCSV = (csvText) => {
  const rows = getRowsFromCsv(csvText)
  const [headerRow, ...dataRows] = rows

  const headers = headerRow.map((h) => h.trim())
  const entries = []

  for (const row of dataRows) {
    const item = Object.fromEntries(
      headers.map((key, i) => [key, row[i]?.trim() ?? ''])
    )

    const { folder, favorite, type, name, notes } = item
    let entryType = 'custom'
    let data = {}

    switch (type) {
      case 'login':
        entryType = 'login'
        data = {
          title: name,
          username: item.login_username || '',
          password: item.login_password || '',
          note: notes || '',
          websites: (item.login_uri || '')
            .split(',')
            .map((uri) => uri.trim())
            .filter(Boolean)
            .map((website) => addHttps(website)),
          customFields: []
        }
        break

      case 'note':
        entryType = 'note'
        data = {
          title: name,
          note: notes || '',
          customFields: []
        }
        break

      default:
        entryType = 'custom'
        data = {
          title: name,
          customFields: []
        }
        break
    }

    entries.push({
      type: entryType,
      data,
      folder: folder || '',
      isFavorite: favorite.toLowerCase() === 'true'
    })
  }

  return entries
}

/**
 * @param {string} data
 * @param {'json' | 'csv'} fileType
 * @returns {any}
 * @throws {Error}
 */
export const parseBitwardenData = (data, fileType) => {
  if (fileType === 'json') {
    return parseBitwardenJson(JSON.parse(data))
  }

  if (fileType === 'csv') {
    return parseBitwardenCSV(data)
  }

  throw new Error('Unsupported file type, please use JSON or CSV')
}
