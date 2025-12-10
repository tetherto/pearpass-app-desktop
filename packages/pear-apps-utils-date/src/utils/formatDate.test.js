import { formatDate } from './formatDate'

describe('formatDate utility', () => {
  test('formats date with default format and separator', () => {
    const date = new Date('2023-05-15')
    expect(formatDate(date)).toBe('2023-05-15')
  })

  test('formats date with custom format', () => {
    const date = new Date('2023-05-15')
    expect(formatDate(date, 'dd-mm-yyyy')).toBe('15-05-2023')
  })

  test('formats date with custom separator', () => {
    const date = new Date('2023-05-15')
    expect(formatDate(date, 'yyyy-mm-dd', '/')).toBe('2023/05/15')
  })

  test('handles two-digit year format', () => {
    const date = new Date('2023-05-15')
    expect(formatDate(date, 'yy-mm-dd')).toBe('23-05-15')
  })

  test('handles month abbreviation', () => {
    const date = new Date('2023-05-15')
    expect(formatDate(date, 'dd-mmm-yyyy')).toBe('15-May-2023')
  })

  test('handles weekday abbreviation', () => {
    const date = new Date('2023-05-15') // This is a Monday
    expect(formatDate(date, 'ddd-mm-dd')).toBe('Mon-05-15')
  })

  test('handles string date input', () => {
    expect(formatDate('2023-05-15', 'yyyy-mm-dd')).toBe('2023-05-15')
  })

  test('throws error for invalid date', () => {
    expect(() => formatDate('invalid-date')).toThrow('Invalid date input')
  })

  test('handles complex format', () => {
    const date = new Date('2023-05-15')
    expect(formatDate(date, 'ddd-dd-mmm-yy', ' ')).toBe('Mon 15 May 23')
  })
})
