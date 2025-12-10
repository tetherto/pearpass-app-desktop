import { generateAvatarInitials } from './generateAvatarInitials'

describe('generateAvatarInitials', () => {
  it('should return first two letters of a single name in uppercase', () => {
    expect(generateAvatarInitials('john')).toBe('JO')
    expect(generateAvatarInitials('Jane')).toBe('JA')
  })

  it('should return first letters of first two names in uppercase', () => {
    expect(generateAvatarInitials('John Doe')).toBe('JD')
    expect(generateAvatarInitials('Jane Smith')).toBe('JS')
  })

  it('should handle names with more than two parts', () => {
    expect(generateAvatarInitials('John Peter Doe')).toBe('JP')
    expect(generateAvatarInitials('Jane Marie Smith')).toBe('JM')
  })

  it('should handle null or undefined input', () => {
    expect(generateAvatarInitials(null)).toBe('')
    expect(generateAvatarInitials(undefined)).toBe('')
  })

  it('should handle empty string', () => {
    expect(generateAvatarInitials('')).toBe('')
  })
})
