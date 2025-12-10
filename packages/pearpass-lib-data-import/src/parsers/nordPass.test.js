describe('parseNordPassCSV', () => {
  const mockAddHttps = jest.fn(
    (u) => u && `https://${u.replace(/^https?:\/\//, '')}`
  )
  const mockGetRowsFromCsv = jest.fn()

  jest.mock('../utils/addHttps', () => ({
    addHttps: (u) => mockAddHttps(u)
  }))
  jest.mock('../utils/getRowsFromCsv', () => ({
    getRowsFromCsv: (csv) => mockGetRowsFromCsv(csv)
  }))

  // Re-import after mocks
  const { parseNordPassCSV } = jest.requireActual('./nordPass')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('parses a password entry', () => {
    mockGetRowsFromCsv.mockReturnValue([
      [
        'type',
        'folder',
        'name',
        'username',
        'password',
        'note',
        'custom_fields',
        'url',
        'additional_urls'
      ],
      [
        'password',
        '',
        'My Site',
        'user1',
        'pass1',
        'some note',
        '',
        'example.com',
        '["foo.com"]'
      ]
    ])
    const result = parseNordPassCSV('csv')
    expect(result).toEqual([
      {
        type: 'login',
        folder: null,
        isFavorite: false,
        data: {
          title: 'My Site',
          username: 'user1',
          password: 'pass1',
          note: 'some note',
          websites: ['https://example.com', 'https://foo.com'],
          customFields: []
        }
      }
    ])
  })

  it('parses a credit card entry', () => {
    mockGetRowsFromCsv.mockReturnValue([
      [
        'type',
        'folder',
        'name',
        'cardholdername',
        'cardnumber',
        'cvc',
        'pin',
        'expirydate',
        'note',
        'custom_fields'
      ],
      [
        'credit_card',
        '',
        'Visa',
        'John Doe',
        '4111111111111111',
        '123',
        '0000',
        '12/2025',
        'cc note',
        ''
      ]
    ])
    const result = parseNordPassCSV('csv')
    expect(result).toEqual([
      {
        type: 'creditCard',
        folder: null,
        isFavorite: false,
        data: {
          title: 'Visa',
          name: 'John Doe',
          number: '4111111111111111',
          expireDate: '12/25',
          securityCode: '123',
          pinCode: '0000',
          note: 'cc note',
          customFields: []
        }
      }
    ])
  })

  it('parses a note entry', () => {
    mockGetRowsFromCsv.mockReturnValue([
      ['type', 'folder', 'name', 'note', 'custom_fields'],
      ['note', '', 'Secret', 'my secret note', '']
    ])
    const result = parseNordPassCSV('csv')
    expect(result).toEqual([
      {
        type: 'note',
        folder: null,
        isFavorite: false,
        data: {
          title: 'Secret',
          note: 'my secret note',
          customFields: []
        }
      }
    ])
  })

  it('parses an identity entry', () => {
    mockGetRowsFromCsv.mockReturnValue([
      [
        'type',
        'folder',
        'name',
        'full_name',
        'phone_number',
        'email',
        'address1',
        'address2',
        'city',
        'country',
        'state',
        'zipcode',
        'note',
        'custom_fields'
      ],
      [
        'identity',
        '',
        'ID1',
        'Jane Smith',
        '(123) 456-7890',
        'jane@example.com',
        '123 Main',
        'Apt 4',
        'Metropolis',
        'US',
        'NY',
        '12345',
        'id note',
        ''
      ]
    ])
    const result = parseNordPassCSV('csv')
    expect(result).toEqual([
      {
        type: 'identity',
        folder: null,
        isFavorite: false,
        data: {
          title: 'ID1',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phoneNumber: '+1234567890',
          address: '123 Main, Apt 4',
          zip: '12345',
          city: 'Metropolis',
          region: 'NY',
          country: 'US',
          note: 'id note',
          customFields: []
        }
      }
    ])
  })

  it('parses custom fields', () => {
    mockGetRowsFromCsv.mockReturnValue([
      ['type', 'folder', 'name', 'custom_fields'],
      ['note', '', 'Custom', '[{"label":"foo","value":"bar"}]']
    ])
    const result = parseNordPassCSV('csv')
    expect(result[0].data.customFields).toEqual([
      { type: 'note', note: 'foo:bar' }
    ])
  })

  it('skips folder type rows', () => {
    mockGetRowsFromCsv.mockReturnValue([
      ['type', 'folder', 'name'],
      ['folder', '', 'FolderName']
    ])
    const result = parseNordPassCSV('csv')
    expect(result).toEqual([])
  })

  it('handles unknown type as custom', () => {
    mockGetRowsFromCsv.mockReturnValue([
      ['type', 'folder', 'name', 'custom_fields'],
      ['something_else', '', 'Whatever', '']
    ])
    const result = parseNordPassCSV('csv')
    expect(result[0].type).toBe('custom')
    expect(result[0].data.title).toBe('Whatever')
  })

  it('handles missing fields gracefully', () => {
    mockGetRowsFromCsv.mockReturnValue([
      ['type', 'folder', 'name'],
      ['password', '', '']
    ])
    const result = parseNordPassCSV('csv')
    expect(result[0].data.title).toBe('')
  })

  it('handles invalid custom_fields JSON', () => {
    mockGetRowsFromCsv.mockReturnValue([
      ['type', 'folder', 'name', 'custom_fields'],
      ['note', '', 'BadCustom', 'notjson']
    ])
    const result = parseNordPassCSV('csv')
    expect(result[0].data.customFields).toEqual([])
  })

  it('parses additional_urls as array', () => {
    mockGetRowsFromCsv.mockReturnValue([
      [
        'type',
        'folder',
        'name',
        'username',
        'password',
        'note',
        'custom_fields',
        'url',
        'additional_urls'
      ],
      [
        'password',
        '',
        'My Site',
        'user1',
        'pass1',
        'some note',
        '',
        'example.com',
        '["foo.com","bar.com"]'
      ]
    ])
    const result = parseNordPassCSV('csv')
    expect(result[0].data.websites).toEqual([
      'https://example.com',
      'https://foo.com',
      'https://bar.com'
    ])
  })
})

describe('parseNordPassData', () => {
  it('calls parseNordPassCSV for csv', () => {
    jest.resetModules()
    // Mock getRowsFromCsv and addHttps to control parseNordPassCSV output
    jest.doMock('../utils/getRowsFromCsv', () => ({
      getRowsFromCsv: () => [
        [
          'type',
          'folder',
          'name',
          'username',
          'password',
          'note',
          'custom_fields',
          'url',
          'additional_urls'
        ],
        [
          'password',
          '',
          'My Site',
          'user1',
          'pass1',
          'some note',
          '',
          'example.com',
          '["foo.com","bar.com"]'
        ]
      ]
    }))
    jest.doMock('../utils/addHttps', () => ({
      addHttps: (u) => u && `https://${u.replace(/^https?:\/\//, '')}`
    }))
    const { parseNordPassData } = require('./nordPass')
    expect(parseNordPassData('data', 'csv')).toEqual([
      {
        type: 'login',
        folder: null,
        isFavorite: false,
        data: {
          title: 'My Site',
          username: 'user1',
          password: 'pass1',
          note: 'some note',
          websites: [
            'https://example.com',
            'https://foo.com',
            'https://bar.com'
          ],
          customFields: []
        }
      }
    ])
    jest.dontMock('./nordPass')
    jest.dontMock('../utils/getRowsFromCsv')
    jest.dontMock('../utils/addHttps')
  })

  it('throws for unsupported file type', () => {
    const { parseNordPassData } = jest.requireActual('./nordPass')
    expect(() => parseNordPassData('data', 'json')).toThrow(
      'Unsupported file type'
    )
  })
})
