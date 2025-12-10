import { subtractDateUnits } from './subtractDateUnits'

describe('subtractDateUnits (day, month, year)', () => {
  test('subtracts months across month-end boundaries', () => {
    const base = new Date('2023-03-31T00:00:00Z')
    const result = subtractDateUnits(1, 'month', base)
    expect(result.toISOString()).toBe('2023-02-28T00:00:00.000Z')
  })

  test('subtracts six months', () => {
    const base = new Date('2025-09-14T00:00:00Z')
    const result = subtractDateUnits(6, 'month', base)
    expect(result.toISOString()).toBe('2025-03-14T00:00:00.000Z')
  })

  test('subtracts multiple months', () => {
    const base = new Date('2023-06-15T00:00:00Z')
    const result = subtractDateUnits(2, 'month', base)
    expect(result.toISOString()).toBe('2023-04-15T00:00:00.000Z')
  })

  test('subtracts days', () => {
    const base = new Date('2023-06-15T00:00:00Z')
    expect(subtractDateUnits(1, 'day', base).toISOString()).toBe(
      '2023-06-14T00:00:00.000Z'
    )
    expect(subtractDateUnits(3, 'day', base).toISOString()).toBe(
      '2023-06-12T00:00:00.000Z'
    )
  })

  test('subtracts years', () => {
    const base = new Date('2024-02-29T00:00:00Z')
    expect(subtractDateUnits(1, 'year', base).toISOString()).toBe(
      '2023-02-28T00:00:00.000Z'
    )
    expect(subtractDateUnits(2, 'year', base).toISOString()).toBe(
      '2022-02-28T00:00:00.000Z'
    )
  })

  test('throws on invalid amount', () => {
    expect(() => subtractDateUnits(NaN, 'month', new Date())).toThrow(
      'Invalid amount'
    )
    expect(() => subtractDateUnits('tt', 'month', new Date())).toThrow(
      'Invalid amount'
    )
  })

  test('throws on invalid date', () => {
    expect(() => subtractDateUnits(1, 'month', 'invalid-date')).toThrow(
      'Invalid date input'
    )
  })

  test('throws on invalid unit', () => {
    expect(() => subtractDateUnits(1, 'week', new Date())).toThrow(
      'Invalid unit'
    )
  })
})
