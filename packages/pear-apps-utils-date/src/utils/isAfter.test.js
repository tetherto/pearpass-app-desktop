import { isAfter } from './isAfter'

describe('isAfter', () => {
  it('should return true if first date is after second date', () => {
    expect(isAfter('2023-01-02', '2023-01-01')).toBe(true)
    expect(isAfter(new Date('2023-01-02'), new Date('2023-01-01'))).toBe(true)
    expect(isAfter('2023-01-01 12:00:00', '2023-01-01 11:00:00')).toBe(true)
  })

  it('should return false if first date is before second date', () => {
    expect(isAfter('2023-01-01', '2023-01-02')).toBe(false)
    expect(isAfter(new Date('2023-01-01'), new Date('2023-01-02'))).toBe(false)
    expect(isAfter('2023-01-01 11:00:00', '2023-01-01 12:00:00')).toBe(false)
  })

  it('should return false if dates are equal', () => {
    expect(isAfter('2023-01-01', '2023-01-01')).toBe(false)
    expect(isAfter(new Date('2023-01-01'), new Date('2023-01-01'))).toBe(false)
  })

  it('should throw an error if either date is invalid', () => {
    expect(() => isAfter('invalid-date', '2023-01-01')).toThrow(
      'Invalid date input'
    )
    expect(() => isAfter('2023-01-01', 'invalid-date')).toThrow(
      'Invalid date input'
    )
    expect(() => isAfter('invalid-date', 'invalid-date')).toThrow(
      'Invalid date input'
    )
  })
})
