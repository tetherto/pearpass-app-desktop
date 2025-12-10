/**
 * @param {Array<Object>} data
 * @returns {Array<{filename: string, data: string}>}
 */
export const parseDataToCsvText = (data) => {
  const vaultsToExport = []

  const typeSpecificFields = {
    login: ['username', 'password', 'passwordUpdatedAt', 'websites'],
    creditCard: ['name', 'number', 'expireDate', 'securityCode', 'pinCode'],
    identity: [
      'fullName',
      'email',
      'phoneNumber',
      'address',
      'zip',
      'city',
      'region',
      'country',
      'passportFullName',
      'passportNumber',
      'passportIssuingCountry',
      'passportDateOfIssue',
      'passportExpiryDate',
      'passportNationality',
      'passportDob',
      'passportGender',
      'idCardNumber',
      'idCardDateOfIssue',
      'idCardExpiryDate',
      'idCardIssuingCountry',
      'drivingLicenseNumber',
      'drivingLicenseDateOfIssue',
      'drivingLicenseExpiryDate',
      'drivingLicenseIssuingCountry'
    ],
    passPhrase: ['passPhrase'],
    wifiPassword: ['password'],
    note: [],
    custom: []
  }

  const alwaysFirst = ['type', 'vaultName', 'title']
  const alwaysLast = [
    'note',
    'customFields',
    'folder',
    'isFavorite',
    'createdAt',
    'updatedAt'
  ]

  data.forEach((vault) => {
    const vaultRecords = vault.records
      .map((record) => ({
        ...record,
        vaultName: vault.name
      }))
      .filter((r) => !!r.type)

    if (!vaultRecords || vaultRecords.length === 0) {
      return
    }

    const typesInUse = new Set(vaultRecords.map((r) => r.type))
    const dynamicFields = new Set()

    typesInUse.forEach((type) =>
      (typeSpecificFields[type] || []).forEach((field) =>
        dynamicFields.add(field)
      )
    )

    alwaysFirst.concat(alwaysLast).forEach((f) => dynamicFields.delete(f))

    const orderedHeaders = [
      ...alwaysFirst,
      ...Array.from(dynamicFields),
      ...alwaysLast
    ]

    const csvRows = [orderedHeaders.join(',')]

    vaultRecords.forEach((record) => {
      const data = record.data || {}

      const row = {
        type: record.type,
        vaultName: record.vaultName || '',
        title: data.title || '',

        username: data.username || '',
        password: data.password || '',
        passwordUpdatedAt: data.passwordUpdatedAt || '',
        websites: (data.websites || []).join(';'),

        name: data.name || '',
        number: data.number || '',
        expireDate: data.expireDate || '',
        securityCode: data.securityCode || '',
        pinCode: data.pinCode || '',

        passPhrase: data.passPhrase || '',

        fullName: data.fullName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        zip: data.zip || '',
        city: data.city || '',
        region: data.region || '',
        country: data.country || '',
        passportFullName: data.passportFullName || '',
        passportNumber: data.passportNumber || '',
        passportIssuingCountry: data.passportIssuingCountry || '',
        passportDateOfIssue: data.passportDateOfIssue || '',
        passportExpiryDate: data.passportExpiryDate || '',
        passportNationality: data.passportNationality || '',
        passportDob: data.passportDob || '',
        passportGender: data.passportGender || '',
        idCardNumber: data.idCardNumber || '',
        idCardDateOfIssue: data.idCardDateOfIssue || '',
        idCardExpiryDate: data.idCardExpiryDate || '',
        idCardIssuingCountry: data.idCardIssuingCountry || '',
        drivingLicenseNumber: data.drivingLicenseNumber || '',
        drivingLicenseDateOfIssue: data.drivingLicenseDateOfIssue || '',
        drivingLicenseExpiryDate: data.drivingLicenseExpiryDate || '',
        drivingLicenseIssuingCountry: data.drivingLicenseIssuingCountry || '',

        note: data.note || '',
        customFields: (data.customFields || [])
          .map((f) => `${f.type || 'note'}:${f.note}`)
          .join(';'),

        folder: record.folder || '',
        isFavorite: record.isFavorite ? 'true' : 'false',
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }

      const escapedRow = orderedHeaders.map(
        (header) => `"${String(row[header] || '').replace(/"/g, '""')}"`
      )

      csvRows.push(escapedRow.join(','))
    })

    const content = csvRows.join('\n')

    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_')
    const safeVaultName = vault.name.replace(/[^a-z0-9]/gi, '_')
    const filename = `PearPass_${safeVaultName}_${timestamp}.csv`

    vaultsToExport.push({
      filename,
      data: content
    })
  })

  return vaultsToExport
}
