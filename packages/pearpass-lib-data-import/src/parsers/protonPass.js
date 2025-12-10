import { addHttps } from '../utils/addHttps'
import { getRowsFromCsv } from '../utils/getRowsFromCsv'

const getCustomFieldsFromContent = (content) => [
  ...(content.organization
    ? [
        {
          type: 'note',
          note: 'Organization: ' + content.organization
        }
      ]
    : []),
  ...(content.xHandle
    ? [
        {
          type: 'note',
          note: 'X-Handle: ' + content.xHandle
        }
      ]
    : []),
  ...(content.company
    ? [
        {
          type: 'note',
          note: 'Company: ' + content.company
        }
      ]
    : []),
  ...(content.jobTitle
    ? [
        {
          type: 'note',
          note: 'Job Title: ' + content.jobTitle
        }
      ]
    : [])
]

const getLoginDataFromContent = ({ content = {}, metadata = {} }) => ({
  username: content.itemUsername || '',
  password: content.password || '',
  note: metadata.note || '',
  websites: (content.urls || []).map((url) => addHttps(url))
})

const getIdentityDataFromContent = ({ content = {}, metadata = {} }) => ({
  fullName: content.fullName || '',
  email: content.email || '',
  phoneNumber: content.phoneNumber || '',
  address: content.streetAddress || '' + ' ' + content.floor || '',
  zip: content.zipOrPostalCode || '',
  city: content.city || '',
  region: content.stateOrProvince || '',
  country: content.countryOrRegion || '',
  passportFullName:
    (content.firstName || '') +
      ' ' +
      (content.middleName || '') +
      ' ' +
      (content.lastName || '') ||
    content.fullName ||
    '',
  passportNumber: content.passportNumber || '',
  passportIssuingCountry: content.county || content.countryOrRegion || '',
  passportDob: content.birthdate || '',
  passportGender: content.gender || '',
  idCardNumber: content.socialSecurityNumber || '',
  idCardIssuingCountry: content.county || content.countryOrRegion || '',
  drivingLicenseNumber: content.licenseNumber || '',
  drivingLicenseIssuingCountry: content.county || content.countryOrRegion || '',
  note: metadata.note || '',
  customFields: getCustomFieldsFromContent(content)
})

export const parseProtonPassJson = (json) => {
  const result = []

  for (const vault of Object.values(json.vaults)) {
    for (const item of vault.items) {
      const entry = item.data
      const type = entry.type
      const metadata = entry.metadata || {}
      const content = entry.content || {}

      let data = {
        title: metadata.name || '',
        customFields: [],
        folder: vault.name || null
      }

      switch (type) {
        case 'login':
          data = {
            ...data,
            ...getLoginDataFromContent({ content, metadata })
          }
          break

        case 'identity':
          data = {
            ...data,
            ...getIdentityDataFromContent({ content, metadata })
          }
          break

        case 'note':
          data = {
            ...data,
            note: metadata.note || ''
          }
          break

        default:
          data = {
            ...data
          }
      }

      result.push({
        type,
        data,
        folder: vault.name || null,
        isFavorite: item.pinned === true
      })
    }
  }

  return result
}

export const parseProtonPassCsv = (csvText) => {
  const result = []

  const [headers, ...rows] = getRowsFromCsv(csvText)

  for (const row of rows) {
    const rowData = Object.fromEntries(row.map((v, i) => [headers[i], v]))
    const { type, name, url, username, password, note, vault, email } = rowData

    let data = {
      title: name || '',
      customFields: [],
      folder: vault.name || null
    }

    switch (type) {
      case 'login':
        data = {
          ...data,
          ...getLoginDataFromContent({
            content: {
              itemUsername: username || email || '',
              password,
              urls: url ? [url] : []
            },
            metadata: { note }
          })
        }
        break

      case 'identity':
        let identityData = {}
        try {
          identityData = JSON.parse(note)
        } catch {
          identityData = {}
        }

        data = {
          ...data,
          ...getIdentityDataFromContent({
            content: identityData,
            metadata: { note }
          })
        }
        break

      case 'note':
        data = {
          ...data,
          note: note || ''
        }
        break

      default:
        data = {
          title: name,
          customFields: [
            {
              type: 'note',
              note: note || ''
            },
            {
              type: 'note',
              note: email || ''
            }
          ]
        }
    }

    result.push({
      type: type === 'alias' ? 'custom' : type,
      data,
      folder: vault || '',
      isFavorite: false
    })
  }

  return result
}

export const parseProtonPassData = (data, fileType) => {
  if (fileType === 'json') {
    return parseProtonPassJson(JSON.parse(data))
  }

  if (fileType === 'csv') {
    return parseProtonPassCsv(data)
  }

  throw new Error('Unsupported file type, please use JSON or CSV')
}
