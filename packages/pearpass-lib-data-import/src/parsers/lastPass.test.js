import { parseLastPassCsv, parseLastPassData } from './lastPass'
import { addHttps } from '../utils/addHttps'
import { getRowsFromCsv } from '../utils/getRowsFromCsv'

jest.mock('../utils/addHttps', () => ({
  addHttps: jest.fn((url) => `https://${url.replace(/^https?:\/\//, '')}`)
}))
jest.mock('../utils/getRowsFromCsv', () => ({
  getRowsFromCsv: jest.fn()
}))

describe('parseLastPassCsv', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('parses a basic login row', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      ['example.com', 'user1', 'pass1', '', 'My Site', '', '1']
    ])
    const result = parseLastPassCsv('csv text')
    expect(result).toEqual([
      {
        type: 'login',
        folder: null,
        isFavorite: true,
        data: {
          title: 'My Site',
          username: 'user1',
          password: 'pass1',
          note: '',
          websites: ['https://example.com'],
          customFields: []
        }
      }
    ])
    expect(addHttps).toHaveBeenCalledWith('example.com')
  })

  it('parses a credit card row', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      [
        '',
        '',
        '',
        'NoteType:Credit Card\nName on Card:John Doe\nNumber:1234567890123456\nExpiration Date:January,2025\nSecurity Code:123\nNotes:My credit card',
        'Visa',
        'Cards',
        '0'
      ]
    ])
    const result = parseLastPassCsv('csv text')
    expect(result[0].type).toBe('creditCard')
    expect(result[0].folder).toBe('Cards')
    expect(result[0].isFavorite).toBe(false)
    expect(result[0].data.title).toBe('Visa')
    expect(result[0].data.name).toBe('John Doe')
    expect(result[0].data.number).toBe('1234567890123456')
    expect(result[0].data.expireDate).toBe('01/25')
    expect(result[0].data.securityCode).toBe('123')
    expect(result[0].data.note).toBe('My credit card')
    expect(Array.isArray(result[0].data.customFields)).toBe(true)
  })

  it('parses an identity row', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      [
        '',
        '',
        '',
        'NoteType:Identity\nFirst Name:Jane\nMiddle Name:A\nLast Name:Doe\nUsername:jdoe\nEmail Address:jane@example.com\nMobile Phone:{"num":"1234567890","ext":"99"}\nAddress 1:123 Main St\nAddress 2:Apt 4\nAddress 3:\nZip / Postal Code:12345\nCity / Town:Metropolis\nState:NY\nCountry:USA\nNotes:Identity note',
        'Jane Identity',
        'Identities',
        '1'
      ]
    ])
    const result = parseLastPassCsv('csv text')
    expect(result[0].type).toBe('identity')
    expect(result[0].folder).toBe('Identities')
    expect(result[0].isFavorite).toBe(true)
    expect(result[0].data.title).toBe('Jane Identity')
    expect(result[0].data.fullName).toBe('Jane A Doe')
    expect(result[0].data.username).toBe('jdoe')
    expect(result[0].data.email).toBe('jane@example.com')
    expect(result[0].data.phoneNumber).toBe('+123456789099')
    expect(result[0].data.address).toBe('123 Main St, Apt 4')
    expect(result[0].data.zip).toBe('12345')
    expect(result[0].data.city).toBe('Metropolis')
    expect(result[0].data.region).toBe('NY')
    expect(result[0].data.country).toBe('USA')
    expect(result[0].data.note).toBe('Identity note')
    expect(Array.isArray(result[0].data.customFields)).toBe(true)
  })

  it('parses a secure note row', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      ['', '', '', 'This is a secure note', 'Note Title', 'Notes', '0']
    ])
    const result = parseLastPassCsv('csv text')
    expect(result[0].type).toBe('note')
    expect(result[0].folder).toBe('Notes')
    expect(result[0].isFavorite).toBe(false)
    expect(result[0].data.title).toBe('Note Title')
    expect(result[0].data.note).toBe('This is a secure note')
    expect(Array.isArray(result[0].data.customFields)).toBe(true)
  })

  it('handles missing optional fields', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      ['', '', '', '', '', '', '']
    ])
    const result = parseLastPassCsv('csv text')
    expect(result[0].type).toBe('login')
    expect(result[0].folder).toBe(null)
    expect(result[0].isFavorite).toBe(false)
    expect(result[0].data.title).toBe('')
    expect(result[0].data.username).toBe('')
    expect(result[0].data.password).toBe('')
    expect(result[0].data.note).toBe('')
    expect(result[0].data.websites).toEqual([])
    expect(Array.isArray(result[0].data.customFields)).toBe(true)
  })

  it('handles multiple login rows', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      ['site1.com', 'user1', 'pass1', '', 'Site1', '', '0'],
      ['site2.com', 'user2', 'pass2', '', 'Site2', '', '1']
    ])
    const result = parseLastPassCsv('csv text')
    expect(result.length).toBe(2)
    expect(result[0].data.title).toBe('Site1')
    expect(result[1].data.title).toBe('Site2')
    expect(result[1].isFavorite).toBe(true)
  })

  it('handles phone normalization in custom fields', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      ['', '', '', 'Phone:{"num":"9876543210"}', 'PhoneTest', '', '0']
    ])
    const result = parseLastPassCsv('csv text')

    expect(result[0].data.note.startsWith('Phone:')).toBe(true)
  })

  it('handles expiry normalization', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      [
        '',
        '',
        '',
        'NoteType:Credit Card\nExpiration Date:February,2030',
        'Card',
        '',
        '0'
      ]
    ])
    const result = parseLastPassCsv('csv text')
    expect(result[0].data.expireDate).toBe('02/30')
  })
})

describe('parseLastPass', () => {
  it('calls parseLastPassCsv for csv fileType', () => {
    getRowsFromCsv.mockReturnValue([
      ['url', 'username', 'password', 'extra', 'name', 'grouping', 'fav'],
      ['example.com', 'user', 'pass', '', 'Title', '', '0']
    ])
    expect(parseLastPassData('csv text', 'csv')).toEqual(
      parseLastPassCsv('csv text')
    )
  })

  it('throws error for unsupported fileType', () => {
    expect(() => parseLastPassData('data', 'json')).toThrow(
      'Unsupported file type'
    )
  })
})
