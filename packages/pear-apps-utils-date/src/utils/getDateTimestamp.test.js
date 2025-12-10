import { getDateTimestamp } from './getDateTimestamp'

describe('getDateTimestamp', () => {
  test('should convert valid date string to timestamp', () => {
    const date = '2023-01-01'
    const expected = new Date(date).getTime()

    expect(getDateTimestamp(date)).toBe(expected)
  })

  test('should convert Date object to timestamp', () => {
    const date = new Date('2023-01-01')
    const expected = date.getTime()

    expect(getDateTimestamp(date)).toBe(expected)
  })

  test('should throw error for invalid date input', () => {
    expect(() => {
      getDateTimestamp('invalid-date')
    }).toThrow('Invalid date input')
  })

  test('should throw error for invalid date input', () => {
    expect(() => {
      getDateTimestamp('some-value')
    }).toThrow('Invalid date input')
  })

  test('should handle date with time components', () => {
    const date = '2023-01-01T12:30:45Z'
    const expected = new Date(date).getTime()

    expect(getDateTimestamp(date)).toBe(expected)
  })
})
