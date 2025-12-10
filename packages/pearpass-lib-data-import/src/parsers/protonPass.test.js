import {
  parseProtonPassJson,
  parseProtonPassCsv,
  parseProtonPassData
} from './protonPass'

describe('parseProtonPassJson', () => {
  it('parses login items correctly', () => {
    const json = {
      vaults: {
        v1: {
          name: 'Personal',
          items: [
            {
              pinned: true,
              data: {
                type: 'login',
                metadata: { name: 'My Site', note: 'my note' },
                content: {
                  itemUsername: 'user1',
                  password: 'pass1',
                  urls: ['example.com', 'http://already.com']
                }
              }
            }
          ]
        }
      }
    }
    const result = parseProtonPassJson(json)
    expect(result).toEqual([
      {
        type: 'login',
        data: {
          title: 'My Site',
          username: 'user1',
          password: 'pass1',
          note: 'my note',
          websites: ['https://example.com', 'http://already.com'],
          customFields: [],
          folder: 'Personal'
        },
        folder: 'Personal',
        isFavorite: true
      }
    ])
  })

  it('parses identity items correctly', () => {
    const json = {
      vaults: {
        v1: {
          name: 'Work',
          items: [
            {
              pinned: false,
              data: {
                type: 'identity',
                metadata: { name: 'ID', note: 'identity note' },
                content: {
                  fullName: 'John Doe',
                  email: 'john@example.com',
                  phoneNumber: '123456',
                  streetAddress: '123 St',
                  zipOrPostalCode: '12345',
                  city: 'City',
                  stateOrProvince: 'State',
                  countryOrRegion: 'Country'
                }
              }
            }
          ]
        }
      }
    }
    const result = parseProtonPassJson(json)
    expect(result[0].type).toBe('identity')
    expect(result[0].data.fullName).toBe('John Doe')
    expect(result[0].data.email).toBe('john@example.com')
    expect(result[0].data.address).toBe('123 St')
    expect(result[0].data.zip).toBe('12345')
    expect(result[0].data.city).toBe('City')
    expect(result[0].data.region).toBe('State')
    expect(result[0].data.country).toBe('Country')
    expect(result[0].data.note).toBe('identity note')
    expect(result[0].folder).toBe('Work')
    expect(result[0].isFavorite).toBe(false)
  })

  it('parses note items correctly', () => {
    const json = {
      vaults: {
        v1: {
          name: '',
          items: [
            {
              pinned: false,
              data: {
                type: 'note',
                metadata: { name: 'Note Title', note: 'note content' },
                content: {}
              }
            }
          ]
        }
      }
    }
    const result = parseProtonPassJson(json)
    expect(result[0].type).toBe('note')
    expect(result[0].data.title).toBe('Note Title')
    expect(result[0].data.note).toBe('note content')
    expect(result[0].folder).toBe(null)
  })

  it('handles unknown types gracefully', () => {
    const json = {
      vaults: {
        v1: {
          name: 'Other',
          items: [
            {
              pinned: false,
              data: {
                type: 'unknown',
                metadata: { name: 'Unknown' },
                content: {}
              }
            }
          ]
        }
      }
    }
    const result = parseProtonPassJson(json)
    expect(result[0].type).toBe('unknown')
    expect(result[0].data.title).toBe('Unknown')
    expect(result[0].folder).toBe('Other')
  })
})

describe('parseProtonPassCsv', () => {
  it('parses login rows correctly', () => {
    const csv = [
      'type,name,url,username,password,note,vault,email',
      'login,My Site,example.com,user1,pass1,my note,Personal,'
    ].join('\n')
    const result = parseProtonPassCsv(csv)
    expect(result[0].type).toBe('login')
    expect(result[0].data.title).toBe('My Site')
    expect(result[0].data.username).toBe('user1')
    expect(result[0].data.password).toBe('pass1')
    expect(result[0].data.note).toBe('my note')
    expect(result[0].data.websites).toEqual(['https://example.com'])
    expect(result[0].folder).toBe('Personal')
  })

  it('parses note rows correctly', () => {
    const csv = [
      'type,name,url,username,password,note,vault,email',
      'note,Note Title,,,,note content,,'
    ].join('\n')
    const result = parseProtonPassCsv(csv)
    expect(result[0].type).toBe('note')
    expect(result[0].data.title).toBe('Note Title')
    expect(result[0].data.note).toBe('note content')
  })

  it('handles unknown types as custom', () => {
    const csv = [
      'type,name,url,username,password,note,vault,email',
      'alias,Custom Title,,,,custom note,,custom@email.com'
    ].join('\n')
    const result = parseProtonPassCsv(csv)
    expect(result[0].type).toBe('custom')
    expect(result[0].data.title).toBe('Custom Title')
    expect(result[0].data.customFields.length).toBe(2)
    expect(result[0].data.customFields[0].note).toBe('custom note')
    expect(result[0].data.customFields[1].note).toBe('custom@email.com')
  })
})

describe('parseProtonPass', () => {
  it('calls parseProtonPassJson for json type', () => {
    const json = JSON.stringify({
      vaults: {
        v1: {
          name: 'Test',
          items: [
            {
              pinned: false,
              data: {
                type: 'note',
                metadata: { name: 'Note', note: 'content' },
                content: {}
              }
            }
          ]
        }
      }
    })
    const result = parseProtonPassData(json, 'json')
    expect(Array.isArray(result)).toBe(true)
    expect(result[0].type).toBe('note')
  })

  it('calls parseProtonPassCsv for csv type', () => {
    const csv = [
      'type,name,url,username,password,note,vault,email',
      'note,Note Title,,,,note content,,'
    ].join('\n')
    const result = parseProtonPassData(csv, 'csv')
    expect(Array.isArray(result)).toBe(true)
    expect(result[0].type).toBe('note')
  })

  it('throws on unsupported file type', () => {
    expect(() => parseProtonPassData('data', 'xml')).toThrow(
      'Unsupported file type'
    )
  })
})
