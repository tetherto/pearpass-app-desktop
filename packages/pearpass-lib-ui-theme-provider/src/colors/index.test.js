import { Color, colors } from './index'

describe('Color class', () => {
  test('should create color with only one parameter', () => {
    const color = new Color('#123456')
    expect(color.mode1).toBe('#123456')
    expect(color.option1).toBe('#123456')
    expect(color.dark).toBe('#123456')
    expect(color.white).toBe('#123456')
  })

  test('should create color with multiple parameters', () => {
    const color = new Color('#123456', '#234567', '#345678', '#456789')
    expect(color.mode1).toBe('#123456')
    expect(color.option1).toBe('#234567')
    expect(color.dark).toBe('#345678')
    expect(color.white).toBe('#456789')
  })
})

describe('colors object', () => {
  test('should contain all defined color properties', () => {
    expect(colors).toHaveProperty('black')
    expect(colors).toHaveProperty('white')
    expect(colors).toHaveProperty('primary100')
    expect(colors).toHaveProperty('primary500')
    expect(colors).toHaveProperty('secondary300')
    expect(colors).toHaveProperty('cyan400')
    expect(colors).toHaveProperty('grey200')
    expect(colors).toHaveProperty('blue500')
    expect(colors).toHaveProperty('categoryAll')
    expect(colors).toHaveProperty('errorRed')
  })

  test('primary400 should have correct color values', () => {
    expect(colors.primary400.mode1).toBe('#BADE5B')
    expect(colors.primary400.option1).toBe('#B0D944')
    expect(colors.primary400.dark).toBe('#B0D944')
    expect(colors.primary400.white).toBe('#B0D944')
  })

  test('categoryAll has correct color values', () => {
    expect(colors.categoryAll.mode1).toBe('#779FA1')
    expect(colors.categoryAll.option1).toBe('#2A8962')
    expect(colors.categoryAll.dark).toBe('#7AAF7B')
    expect(colors.categoryAll.white).toBe('#7AAF7B')
  })

  test('errorGreen should have all properties defaulting to mode1', () => {
    expect(colors.errorGreen.mode1).toBe('#76D944')
    expect(colors.errorGreen.option1).toBe('#76D944')
    expect(colors.errorGreen.dark).toBe('#76D944')
    expect(colors.errorGreen.white).toBe('#76D944')
  })

  test('should ensure all colors are instances of Color class', () => {
    Object.values(colors).forEach((color) => {
      expect(color).toBeInstanceOf(Color)
    })
  })

  test('should ensure all colors have mode1 property defined', () => {
    Object.values(colors).forEach((color) => {
      expect(color.mode1).toBeDefined()
      expect(typeof color.mode1).toBe('string')
    })
  })

  test('should ensure color hex codes are valid format', () => {
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    Object.values(colors).forEach((color) => {
      expect(color.mode1).toMatch(hexRegex)
      expect(color.option1).toMatch(hexRegex)
      expect(color.dark).toMatch(hexRegex)
      expect(color.white).toMatch(hexRegex)
    })
  })
})
