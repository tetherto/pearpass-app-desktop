import { isEmpty } from './isEmpty'

describe('isEmpty', () => {
  it('returns true when value is null or undefined', () => {
    expect(isEmpty(null)).toBe(true)
  })

  it('returns true for empty strings', () => {
    expect(isEmpty('')).toBe(true)
    expect(isEmpty('   ')).toBe(true)
  })

  it('returns false for non-empty strings', () => {
    expect(isEmpty('hello')).toBe(false)
  })

  it('returns false for numbers', () => {
    expect(isEmpty(42)).toBe(false)
  })

  it('returns false for objects and arrays', () => {
    expect(isEmpty({})).toBe(false)
    expect(isEmpty([])).toBe(false)
  })
})
