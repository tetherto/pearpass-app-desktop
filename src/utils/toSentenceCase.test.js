import { toSentenceCase } from './toSentenceCase'

describe('toSentenceCase', () => {
  test('should capitalize the first letter of a string', () => {
    expect(toSentenceCase('hello world')).toBe('Hello world')
    expect(toSentenceCase('test')).toBe('Test')
  })

  test('should return the same string if already capitalized', () => {
    expect(toSentenceCase('Hello')).toBe('Hello')
    expect(toSentenceCase('Test string')).toBe('Test string')
  })

  test('should handle empty strings', () => {
    expect(toSentenceCase('')).toBe('')
  })

  test('should handle null and undefined', () => {
    expect(toSentenceCase(null)).toBe(null)
    expect(toSentenceCase(undefined)).toBe(undefined)
  })

  test('should handle single character strings', () => {
    expect(toSentenceCase('a')).toBe('A')
    expect(toSentenceCase('z')).toBe('Z')
  })

  test('should handle strings with numbers and special characters', () => {
    expect(toSentenceCase('123abc')).toBe('123abc')
    expect(toSentenceCase('!hello')).toBe('!hello')
  })
})
