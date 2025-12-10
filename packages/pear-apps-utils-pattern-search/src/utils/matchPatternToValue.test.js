import { matchPatternToValue } from './matchPatternToValue'

describe('matchPatternToValue', () => {
  it('should match when pattern exists in value', () => {
    expect(matchPatternToValue('apple', 'I have an apple')).toBe(true)
  })

  it('should match regardless of case', () => {
    expect(matchPatternToValue('APPLE', 'i have an apple')).toBe(true)
    expect(matchPatternToValue('apple', 'I HAVE AN APPLE')).toBe(true)
  })

  it('should not match when pattern does not exist in value', () => {
    expect(matchPatternToValue('banana', 'I have an apple')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(matchPatternToValue('', 'any value')).toBe(true)
    expect(matchPatternToValue('pattern', '')).toBe(false)
  })

  it('should handle null and undefined values', () => {
    expect(matchPatternToValue('pattern', null)).toBe(false)
    expect(matchPatternToValue('pattern', undefined)).toBe(false)
    expect(matchPatternToValue(null, 'value')).toBe(false)
    expect(matchPatternToValue(undefined, 'value')).toBe(false)
  })
})
