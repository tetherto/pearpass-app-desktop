import { logger } from './logger'
import { validateInviteCode } from './validateInviteCode.js'

jest.mock('./logger.js', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('validateInviteCode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate a valid invite code', () => {
    const validCode = 'a'.repeat(101)

    expect(validateInviteCode(validCode)).toBe(validCode)
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should throw an error for code with slash', () => {
    const codeWithSlash = 'a'.repeat(50) + '/b'.repeat(51)

    expect(() => validateInviteCode(codeWithSlash)).toThrow(
      'Invalid invite code'
    )
    expect(logger.error).toHaveBeenCalled()
  })

  it('should throw an error for code that is too short', () => {
    const shortCode = 'a'.repeat(99)

    expect(() => validateInviteCode(shortCode)).toThrow('Invalid invite code')
    expect(logger.error).toHaveBeenCalled()
  })

  it('should throw an error for code with invalid characters', () => {
    const invalidCode = 'a'.repeat(50) + '!@#$%^&*()' + 'a'.repeat(50)

    expect(() => validateInviteCode(invalidCode)).toThrow('Invalid invite code')
    expect(logger.error).toHaveBeenCalled()
  })

  it('should throw an error for code with invalid format', () => {
    const invalidFormat = 'a'.repeat(50) + '/b'.repeat(30) + '/c'.repeat(30)

    expect(() => validateInviteCode(invalidFormat)).toThrow(
      'Invalid invite code'
    )
    expect(logger.error).toHaveBeenCalled()
  })

  it('should throw an error for non-string input', () => {
    expect(() => validateInviteCode(null)).toThrow()
    expect(() => validateInviteCode(undefined)).toThrow()
    expect(() => validateInviteCode(123)).toThrow()
    expect(logger.error).toHaveBeenCalled()
  })
})
