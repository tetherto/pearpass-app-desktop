import { isBefore } from './isBefore'

describe('isBefore', () => {
  test('returns true when the first date is before the second date', () => {
    expect(isBefore('2021-01-01', '2021-01-02')).toBe(true)
    expect(isBefore(new Date(2021, 0, 1), new Date(2021, 0, 2))).toBe(true)
    expect(isBefore('2021-01-01T10:00:00', '2021-01-01T10:00:01')).toBe(true)
  })

  test('returns false when the first date is after the second date', () => {
    expect(isBefore('2021-01-02', '2021-01-01')).toBe(false)
    expect(isBefore(new Date(2021, 0, 2), new Date(2021, 0, 1))).toBe(false)
    expect(isBefore('2021-01-01T10:00:01', '2021-01-01T10:00:00')).toBe(false)
  })

  test('returns false when the dates are equal', () => {
    const sameDate = new Date(2021, 0, 1)
    expect(isBefore(sameDate, sameDate)).toBe(false)
    expect(isBefore('2021-01-01', '2021-01-01')).toBe(false)
    expect(isBefore('2021-01-01T10:00:00', '2021-01-01T10:00:00')).toBe(false)
  })

  test('throws an error when provided with invalid date inputs', () => {
    expect(() => isBefore('invalid-date', '2021-01-01')).toThrow(
      'Invalid date input'
    )
    expect(() => isBefore('2021-01-01', 'invalid-date')).toThrow(
      'Invalid date input'
    )
    expect(() => isBefore('invalid-date1', 'invalid-date2')).toThrow(
      'Invalid date input'
    )
  })
})
