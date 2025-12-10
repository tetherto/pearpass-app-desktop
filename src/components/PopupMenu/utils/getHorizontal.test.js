import { getHorizontal } from './getHorizontal'

describe('getHorizontal', () => {
  it('should return "left" when direction contains "left"', () => {
    expect(getHorizontal('left')).toBe('left')
    expect(getHorizontal('topLeft')).toBe('left')
    expect(getHorizontal('bottomLeft')).toBe('left')
  })

  it('should return "right" when direction contains "right"', () => {
    expect(getHorizontal('right')).toBe('right')
    expect(getHorizontal('topRight')).toBe('right')
    expect(getHorizontal('bottomRight')).toBe('right')
  })

  it('should return empty string when direction does not contain "left" or "right"', () => {
    expect(getHorizontal('top')).toBe('')
    expect(getHorizontal('bottom')).toBe('')
    expect(getHorizontal('')).toBe('')
  })

  it('should handle undefined input', () => {
    expect(getHorizontal(undefined)).toBe('')
  })

  it('should be case insensitive', () => {
    expect(getHorizontal('LEFT')).toBe('left')
    expect(getHorizontal('Right')).toBe('right')
    expect(getHorizontal('topLEFT')).toBe('left')
    expect(getHorizontal('bottomRIGHT')).toBe('right')
  })
})
