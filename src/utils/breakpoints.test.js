import { isDesktopSmall } from './breakpoints'

describe('breakpoints', () => {
  describe('isDesktopSmall', () => {
    test('should return true if window width is greater than or equal to 1280', () => {
      expect(isDesktopSmall(1280)).toBe(true)
      expect(isDesktopSmall(1500)).toBe(true)
    })

    test('should return false if window width is less than 1280', () => {
      expect(isDesktopSmall(1279)).toBe(false)
      expect(isDesktopSmall(1000)).toBe(false)
      expect(isDesktopSmall(0)).toBe(false)
    })
  })
})
