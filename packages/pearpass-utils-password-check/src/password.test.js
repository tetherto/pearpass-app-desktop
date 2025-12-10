import { checkPasswordStrength } from './password'

describe('checkPasswordStrength - additional edge and config cases', () => {
  it('should handle empty password with default rules', () => {
    const result = checkPasswordStrength('')
    expect(result.rules.minLength).toBe(false)
    expect(result.rules.hasLowerCase).toBe(false)
    expect(result.rules.hasUpperCase).toBe(false)
    expect(result.rules.hasNumbers).toBe(false)
    expect(result.rules.hasSymbols).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle empty password with all rules disabled', () => {
    const result = checkPasswordStrength('', {
      rules: {
        length: 0,
        lowerCase: false,
        upperCase: false,
        numbers: false,
        includeSpecialChars: false
      }
    })
    expect(result.rules.minLength).toBe(true)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('should handle password with only special characters', () => {
    const password = '!@#$%^&*'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(false)
    expect(result.rules.hasUpperCase).toBe(false)
    expect(result.rules.hasNumbers).toBe(false)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle password with only uppercase letters', () => {
    const password = 'ABCDEFGH'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(false)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(false)
    expect(result.rules.hasSymbols).toBe(false)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors).toContain(undefined)
  })

  it('should handle password with only lowercase letters', () => {
    const password = 'abcdefgh'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(false)
    expect(result.rules.hasNumbers).toBe(false)
    expect(result.rules.hasSymbols).toBe(false)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors).toContain(undefined)
  })

  it('should handle password with only numbers', () => {
    const password = '12345678'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(false)
    expect(result.rules.hasUpperCase).toBe(false)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(false)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors).toContain(undefined)
  })

  it('should handle password with all rules disabled except minLength', () => {
    const password = 'abc'
    const result = checkPasswordStrength(password, {
      rules: {
        length: 3,
        lowerCase: false,
        upperCase: false,
        numbers: false,
        includeSpecialChars: false
      }
    })
    expect(result.rules.minLength).toBe(true)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('should handle password with custom length rule', () => {
    const password = 'Ab1!'
    const result = checkPasswordStrength(password, { rules: { length: 10 } })
    expect(result.rules.minLength).toBe(false)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle password with special characters at the start and end', () => {
    const password = '!Abcdef1!'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('should handle password with repeated characters', () => {
    const password = 'aaaaaaaA1!'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors.length).toBe(0)
  })

  it('should handle password with newline and tab characters', () => {
    const password = 'Abc123!\n\t'
    const result = checkPasswordStrength(password)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.rules.minLength).toBe(true)
  })

  it('should handle password with only tab and newline', () => {
    const password = '\n\t'
    const result = checkPasswordStrength(password, { rules: { length: 0 } })
    expect(result.rules.minLength).toBe(true)
    expect(result.rules.hasLowerCase).toBe(false)
    expect(result.rules.hasUpperCase).toBe(false)
    expect(result.rules.hasNumbers).toBe(false)
    expect(result.rules.hasSymbols).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle password with mixed ASCII and non-ASCII symbols', () => {
    const password = 'Test123!€'
    const result = checkPasswordStrength(password)
    // Only '!' is matched by the symbol regex
    expect(result.rules.hasSymbols).toBe(true)
    expect(result.rules.hasLowerCase).toBe(true)
    expect(result.rules.hasUpperCase).toBe(true)
    expect(result.rules.hasNumbers).toBe(true)
    expect(result.rules.minLength).toBe(true)
    expect(result.errors.length).toBe(0)
  })
})
