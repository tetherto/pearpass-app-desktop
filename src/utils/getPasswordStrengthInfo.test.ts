import { getPasswordStrength } from './getPasswordStrengthInfo'
import { PassType } from '../shared/types'

describe('getPasswordStrength', () => {
  describe('empty values', () => {
    it('returns null for empty string', () => {
      expect(getPasswordStrength('')).toBeNull()
    })

    it('returns null for empty array', () => {
      expect(getPasswordStrength([])).toBeNull()
    })
  })

  describe('password (default)', () => {
    it('defaults to password type when passType is omitted', () => {
      expect(getPasswordStrength('Abcdef1!')).not.toBeNull()
    })

    it('returns safe for a strong password (all 5 rules pass)', () => {
      const result = getPasswordStrength('Abcdef1!')
      expect(result?.type).toBe('safe')
      expect(result?.strengthType).toBe('success')
      expect(result?.strengthText).toBe('Safe')
    })

    it('returns weak for a password missing one rule (4/5 rules pass)', () => {
      // minLength✓ hasLower✓ hasUpper✓ hasNumbers✓ hasSymbols✗
      const result = getPasswordStrength('Abcdef12')
      expect(result?.type).toBe('weak')
      expect(result?.strengthType).toBe('warning')
      expect(result?.strengthText).toBe('Weak')
    })

    it('returns vulnerable for a short all-lowercase password (< 4 rules pass)', () => {
      const result = getPasswordStrength('abc')
      expect(result?.type).toBe('vulnerable')
      expect(result?.strengthType).toBe('error')
      expect(result?.strengthText).toBe('Vulnerable')
    })
  })

  describe('passphrase', () => {
    const safeWords = [
      'Test1!', 'Word2@', 'Example3#', 'Unique4$',
      'Safe5%', 'Pass6^', 'Phrase7&', 'Another8*'
    ]

    it('accepts a string array', () => {
      const result = getPasswordStrength(safeWords, PassType.PassPhrase)
      expect(result?.type).toBe('safe')
      expect(result?.strengthType).toBe('success')
    })

    it('splits a hyphen-joined string into words before checking', () => {
      const result = getPasswordStrength(safeWords.join('-'), PassType.PassPhrase)
      expect(result?.type).toBe('safe')
      expect(result?.strengthType).toBe('success')
    })

    it('returns the same result whether value is a string or array', () => {
      const fromArray = getPasswordStrength(safeWords, PassType.PassPhrase)
      const fromString = getPasswordStrength(safeWords.join('-'), PassType.PassPhrase)
      expect(fromArray?.type).toBe(fromString?.type)
      expect(fromArray?.strengthType).toBe(fromString?.strengthType)
      expect(fromArray?.strengthText).toBe(fromString?.strengthText)
    })

    it('returns vulnerable for too few words', () => {
      const result = getPasswordStrength(['word', 'word'], PassType.PassPhrase)
      expect(result?.type).toBe('vulnerable')
    })
  })
})
