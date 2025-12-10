import { parse1PasswordCSV, parse1PasswordData } from './1password'
import { addHttps } from '../utils/addHttps'

jest.mock('../utils/addHttps', () => ({
  addHttps: jest.fn((url) => `https://${url.replace(/^https?:\/\//, '')}`)
}))

describe('parse1PasswordCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('parses a single row correctly', () => {
    const csv = `Title,Url,Username,Password,Notes,Favorite
My Site,example.com,user1,pass1,Some note,true`
    const result = parse1PasswordCSV(csv)
    expect(result).toEqual([
      {
        type: 'login',
        folder: null,
        isFavorite: true,
        data: {
          title: 'My Site',
          username: 'user1',
          password: 'pass1',
          note: 'Some note',
          websites: ['https://example.com'],
          customFields: []
        }
      }
    ])
    expect(addHttps).toHaveBeenCalledWith('example.com')
  })

  it('parses multiple rows', () => {
    const csv = `Title,Url,Username,Password,Notes,Favorite
Site1,site1.com,user1,pass1,,false
Site2,site2.com,user2,pass2,Note2,true`
    const result = parse1PasswordCSV(csv)
    expect(result.length).toBe(2)
    expect(result[0].data.title).toBe('Site1')
    expect(result[1].data.title).toBe('Site2')
    expect(result[1].isFavorite).toBe(true)
  })

  it('handles missing optional fields', () => {
    const csv = `Title,Url,Username,Password,Notes,Favorite
,,user1,pass1,,`
    const result = parse1PasswordCSV(csv)
    expect(result[0].data.title).toBe('')
    expect(result[0].data.username).toBe('user1')
    expect(result[0].data.password).toBe('pass1')
    expect(result[0].data.note).toBe('')
    expect(result[0].isFavorite).toBe(false)
    expect(result[0].data.websites).toEqual([])
  })

  it('handles quoted fields with commas', () => {
    const csv = `Title,Url,Username,Password,Notes,Favorite
"My, Site","example.com","user,1","pass,1","Some, note",true`
    const result = parse1PasswordCSV(csv)
    expect(result[0].data.title).toBe('My, Site')
    expect(result[0].data.username).toBe('user,1')
    expect(result[0].data.password).toBe('pass,1')
    expect(result[0].data.note).toBe('Some, note')
  })

  it('trims whitespace from headers and values', () => {
    const csv = ` Title , Url , Username , Password , Notes , Favorite 
Site , site.com , user , pass , note , true `
    const result = parse1PasswordCSV(csv)
    expect(result[0].data.title).toBe('Site')
    expect(result[0].data.username).toBe('user')
    expect(result[0].isFavorite).toBe(true)
  })

  it('returns empty array for empty CSV', () => {
    const csv = `Title,Url,Username,Password,Notes,Favorite`
    expect(parse1PasswordCSV(csv)).toEqual([])
  })

  it('handles missing columns gracefully', () => {
    const csv = `Title,Username,Password
Site,user,pass`
    const result = parse1PasswordCSV(csv)
    expect(result[0].data.title).toBe('Site')
    expect(result[0].data.username).toBe('user')
    expect(result[0].data.password).toBe('pass')
    expect(result[0].data.websites).toEqual([])
    expect(result[0].data.note).toBe('')
    expect(result[0].isFavorite).toBe(false)
  })
})

describe('parse1PasswordData', () => {
  it('calls parse1PasswordCSV for csv fileType', () => {
    const csv = `Title,Url,Username,Password,Notes,Favorite
Site,site.com,user,pass,,false`
    expect(parse1PasswordData(csv, 'csv')).toEqual(parse1PasswordCSV(csv))
  })

  it('throws error for unsupported fileType', () => {
    expect(() => parse1PasswordData('data', 'json')).toThrow(
      'Unsupported file type'
    )
  })
})
