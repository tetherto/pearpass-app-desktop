import { addHttps } from '../utils/addHttps'

export const parsePearPassJson = (records) =>
  records.map((record) => ({
    type: record.type,
    data: record.data,
    folder: record.folder || null,
    isFavorite: record.isFavorite
  }))

export const parsePearPassCsv = async (text) => {
  const lines = text.split('\n').filter(Boolean)
  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, ''))

  const entries = lines.slice(1).map((line) => {
    const values = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((val) => val.replace(/^"|"$/g, '').replace(/""/g, '"'))
    const row = headers.reduce((acc, h, i) => {
      acc[h] = values[i]
      return acc
    }, {})
    return row
  })

  const result = entries.map((entry) => {
    const type = entry.type
    const data = {
      title: entry.title || ''
    }

    if (type === 'login') {
      data.username = entry.username || ''
      data.password = entry.password || ''
      data.passwordUpdatedAt = entry.passwordUpdatedAt
        ? Number(entry.passwordUpdatedAt)
        : ''
      data.websites = entry.websites
        ? entry.websites.split(';').map((w) => addHttps(w))
        : []
    } else if (type === 'creditCard') {
      data.name = entry.name || ''
      data.number = entry.number || ''
      data.expireDate = entry.expireDate || ''
      data.securityCode = entry.securityCode || ''
      data.pinCode = entry.pinCode || ''
    } else if (type === 'identity') {
      data.fullName = entry.fullName || ''
      data.email = entry.email || ''
      data.phoneNumber = entry.phoneNumber || ''
      data.address = entry.address || ''
      data.zip = entry.zip || ''
      data.city = entry.city || ''
      data.region = entry.region || ''
      data.country = entry.country || ''
      data.passportFullName = entry.passportFullName || ''
      data.passportNumber = entry.passportNumber || ''
      data.passportIssuingCountry = entry.passportIssuingCountry || ''
      data.passportDateOfIssue = entry.passportDateOfIssue || ''
      data.passportExpiryDate = entry.passportExpiryDate || ''
      data.passportNationality = entry.passportNationality || ''
      data.passportDob = entry.passportDob || ''
      data.passportGender = entry.passportGender || ''
      data.idCardNumber = entry.idCardNumber || ''
      data.idCardDateOfIssue = entry.idCardDateOfIssue || ''
      data.idCardExpiryDate = entry.idCardExpiryDate || ''
      data.idCardIssuingCountry = entry.idCardIssuingCountry || ''
      data.drivingLicenseNumber = entry.drivingLicenseNumber || ''
      data.drivingLicenseDateOfIssue = entry.drivingLicenseDateOfIssue || ''
      data.drivingLicenseExpiryDate = entry.drivingLicenseExpiryDate || ''
      data.drivingLicenseIssuingCountry =
        entry.drivingLicenseIssuingCountry || ''
    } else if (type === 'passPhrase') {
      data.passPhrase = entry.passPhrase || ''
    } else if (type === 'wifiPassword') {
      data.password = entry.password || ''
    }

    data.note = entry.note || ''

    data.customFields = entry.customFields
      ? entry.customFields
          .split(';')
          .map((fieldStr) => {
            const [type = 'note', note] = fieldStr.split(':')
            return { type, note }
          })
          .filter((f) => f.note)
      : []

    return {
      type: type,
      data,
      folder: entry.folder || null,
      isFavorite: entry.isFavorite === 'true'
    }
  })

  return result
}

export const parsePearPassData = (data, fileType) => {
  if (fileType === 'json') {
    return parsePearPassJson(JSON.parse(data))
  }

  if (fileType === 'csv') {
    return parsePearPassCsv(data)
  }

  throw new Error('Unsupported file type, please use JSON or CSV')
}
