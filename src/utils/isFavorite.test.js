import { isFavorite } from './isFavorite'

describe('isFavorite', () => {
  it('should return true when folder is "favorites"', () => {
    expect(isFavorite('favorites')).toBe(true)
  })

  it('should return false when folder is not "favorites"', () => {
    expect(isFavorite('documents')).toBe(false)
    expect(isFavorite('work')).toBe(false)
    expect(isFavorite('')).toBe(false)
    expect(isFavorite(null)).toBe(false)
    expect(isFavorite(undefined)).toBe(false)
  })
})
