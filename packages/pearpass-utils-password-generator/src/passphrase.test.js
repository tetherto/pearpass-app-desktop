import { PASSPHRASE_WORD_LIST, SPECIAL_CHARS } from './constants'
import { generatePassphrase } from './passphrase'

describe('generatePassphrase', () => {
  beforeEach(() => {
    const mockMath = Object.create(global.Math)
    mockMath.random = jest.fn(() => 0.5)
    global.Math = mockMath
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('should return an array of strings', () => {
    const result = generatePassphrase(false, false, false, 3)
    expect(Array.isArray(result)).toBe(true)
    expect(result.every((word) => typeof word === 'string')).toBe(true)
  })

  test('should return the correct number of words', () => {
    const result = generatePassphrase(false, false, false, 5)
    expect(result.length).toBe(5)
  })

  test('should capitalize first letter when capitalLetters is true', () => {
    const result = generatePassphrase(true, false, false, 3)
    expect(result.every((word) => /^[A-Z]/.test(word))).toBe(true)
  })

  test('should not capitalize first letter when capitalLetters is false', () => {
    const result = generatePassphrase(false, false, false, 3)
    expect(result.every((word) => /^[a-z]/.test(word))).toBe(true)
  })

  test('should add numbers when numbers is true', () => {
    const result = generatePassphrase(false, false, true, 3)
    expect(result.every((word) => /\d$/.test(word))).toBe(true)
  })

  test('should add symbols when symbols is true', () => {
    const result = generatePassphrase(false, true, false, 3)
    const specialCharsPattern = new RegExp(
      `[${SPECIAL_CHARS.split('')
        .map((c) => '\\' + c)
        .join('')}]$`
    )
    expect(result.every((word) => specialCharsPattern.test(word))).toBe(true)
  })

  test('should add both numbers and symbols when both are true', () => {
    const result = generatePassphrase(false, true, true, 3)
    const wordPattern = new RegExp(
      `[a-z]+\\d[${SPECIAL_CHARS.split('')
        .map((c) => '\\' + c)
        .join('')}]$`
    )
    expect(result.every((word) => wordPattern.test(word))).toBe(true)
  })

  test('should use words from PASSPHRASE_WORD_LIST', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0.1)

    const result = generatePassphrase(false, false, false, 3)
    result.forEach((word) => {
      const baseWord = word.replace(/\d|[^\w]*/g, '')
      expect(PASSPHRASE_WORD_LIST.includes(baseWord)).toBe(true)
    })
  })
})
