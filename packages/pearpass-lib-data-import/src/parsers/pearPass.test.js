import {
  parsePearPassData,
  parsePearPassCsv,
  parsePearPassJson
} from './pearPass'

jest.mock('../utils/addHttps', () => ({
  addHttps: jest.fn((url) => `https://${url.replace(/^https?:\/\//, '')}`)
}))

describe('parsePearPassJson', () => {
  it('parses JSON records correctly', () => {
    const records = [
      {
        type: 'login',
        data: { username: 'user', password: 'pass' },
        folder: 'Work',
        isFavorite: true
      },
      {
        type: 'creditCard',
        data: { number: '1234' },
        isFavorite: false
      }
    ]
    const result = parsePearPassJson(records)
    expect(result).toEqual([
      {
        type: 'login',
        data: { username: 'user', password: 'pass' },
        folder: 'Work',
        isFavorite: true // 'true' is treated as true in implementation
      },
      {
        type: 'creditCard',
        data: { number: '1234' },
        folder: null,
        isFavorite: false
      }
    ])
  })
})

describe('parsePearPassCsv', () => {
  it('parses login entries and applies addHttps to websites', async () => {
    const csv = [
      '"type","title","username","password","websites","note","customFields","folder","isFavorite"',
      '"login","My Site","user1","pass1","example.com;http://test.com","note1","note:custom1;other:custom2","Personal","true"'
    ].join('\n')
    const result = await parsePearPassCsv(csv)
    expect(result[0].type).toBe('login')
    expect(result[0].data.username).toBe('user1')
    expect(result[0].data.password).toBe('pass1')
    expect(result[0].data.websites).toEqual([
      'https://example.com',
      'https://test.com'
    ])
    expect(result[0].data.note).toBe('note1')
    expect(result[0].data.customFields).toEqual([
      { type: 'note', note: 'custom1' },
      { type: 'other', note: 'custom2' }
    ])
    expect(result[0].folder).toBe('Personal')
    expect(result[0].isFavorite).toBe(true)
  })

  it('parses creditCard entries', async () => {
    const csv = [
      '"type","title","name","number","expireDate","securityCode","pinCode","note","customFields","folder","isFavorite"',
      '"creditCard","Visa","John Doe","4111111111111111","12/25","123","0000","card note","","Cards","false"'
    ].join('\n')
    const result = await parsePearPassCsv(csv)
    expect(result[0].type).toBe('creditCard')
    expect(result[0].data.name).toBe('John Doe')
    expect(result[0].data.number).toBe('4111111111111111')
    expect(result[0].data.expireDate).toBe('12/25')
    expect(result[0].data.securityCode).toBe('123')
    expect(result[0].data.pinCode).toBe('0000')
    expect(result[0].data.note).toBe('card note')
    expect(result[0].data.customFields).toEqual([])
    expect(result[0].folder).toBe('Cards')
    expect(result[0].isFavorite).toBe(false)
  })

  it('parses identity entries', async () => {
    const csv = [
      '"type","title","fullName","email","phoneNumber","address","zip","city","region","country","note","customFields","folder","isFavorite"',
      '"identity","Me","Jane Smith","jane@example.com","1234567890","123 Main St","12345","Metropolis","State","Country","identity note","","Identities","false"'
    ].join('\n')
    const result = await parsePearPassCsv(csv)
    expect(result[0].type).toBe('identity')
    expect(result[0].data.fullName).toBe('Jane Smith')
    expect(result[0].data.email).toBe('jane@example.com')
    expect(result[0].data.phoneNumber).toBe('1234567890')
    expect(result[0].data.address).toBe('123 Main St')
    expect(result[0].data.zip).toBe('12345')
    expect(result[0].data.city).toBe('Metropolis')
    expect(result[0].data.region).toBe('State')
    expect(result[0].data.country).toBe('Country')
    expect(result[0].data.note).toBe('identity note')
    expect(result[0].data.customFields).toEqual([])
    expect(result[0].folder).toBe('Identities')
    expect(result[0].isFavorite).toBe(false)
  })

  it('handles missing optional fields gracefully', async () => {
    const csv = [
      '"type","title","username","password","websites","note","customFields","folder","isFavorite"',
      '"login","","","","","","","","false"'
    ].join('\n')
    const result = await parsePearPassCsv(csv)
    expect(result[0].data.title).toBe('')
    expect(result[0].data.username).toBe('')
    expect(result[0].data.password).toBe('')
    expect(result[0].data.websites).toEqual([])
    expect(result[0].data.note).toBe('')
    expect(result[0].data.customFields).toEqual([])
    expect(result[0].folder).toBe(null)
    expect(result[0].isFavorite).toBe(false)
  })

  it('handles passPhrase type with passPhrase field', async () => {
    const csv = [
      '"type","title","passPhrase","note","customFields","folder","isFavorite"',
      '"passPhrase","My Secret","super-secret-passphrase","secret note","","Secrets","true"'
    ].join('\n')
    const result = await parsePearPassCsv(csv)
    expect(result[0].type).toBe('passPhrase')
    expect(result[0].data.passPhrase).toBe('super-secret-passphrase')
    expect(result[0].data.note).toBe('secret note')
    expect(result[0].folder).toBe('Secrets')
    expect(result[0].isFavorite).toBe(true)
  })

  it('handles wifiPassword type with password field', async () => {
    const csv = [
      '"type","title","password","note","customFields","folder","isFavorite"',
      '"wifiPassword","Home WiFi","my-wifi-password","wifi note","","WiFi","false"'
    ].join('\n')
    const result = await parsePearPassCsv(csv)
    expect(result[0].type).toBe('wifiPassword')
    expect(result[0].data.password).toBe('my-wifi-password')
    expect(result[0].data.note).toBe('wifi note')
    expect(result[0].folder).toBe('WiFi')
    expect(result[0].isFavorite).toBe(false)
  })
})

describe('parsePearPass', () => {
  it('calls parsePearPassJson for json fileType', () => {
    const json = JSON.stringify([
      { type: 'login', data: {}, isFavorite: 'false' }
    ])
    const result = parsePearPassData(json, 'json')
    expect(Array.isArray(result)).toBe(true)
    expect(result[0].type).toBe('login')
  })

  it('calls parsePearPassCsv for csv fileType', async () => {
    const csv =
      '"type","title","username","password","websites","note","customFields","folder","isFavorite"\n"login","Test","","","","","","","false"'
    const result = await parsePearPassData(csv, 'csv')
    expect(Array.isArray(result)).toBe(true)
    expect(result[0].type).toBe('login')
  })

  it('throws error for unsupported fileType', () => {
    expect(() => parsePearPassData('data', 'xml')).toThrow(
      'Unsupported file type'
    )
  })
})
