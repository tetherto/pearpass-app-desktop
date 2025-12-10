import { getVertical } from './getVertical'

describe('getVertical', () => {
  test('should return "top" when direction includes "top"', () => {
    expect(getVertical('top')).toBe('top')
    expect(getVertical('topRight')).toBe('top')
    expect(getVertical('topLeft')).toBe('top')
  })

  test('should return "bottom" when direction includes "bottom"', () => {
    expect(getVertical('bottom')).toBe('bottom')
    expect(getVertical('bottomRight')).toBe('bottom')
    expect(getVertical('bottomLeft')).toBe('bottom')
  })

  test('should return empty string for other directions', () => {
    expect(getVertical('left')).toBe('')
    expect(getVertical('right')).toBe('')
    expect(getVertical('')).toBe('')
    expect(getVertical(null)).toBe('')
    expect(getVertical(undefined)).toBe('')
  })
})
