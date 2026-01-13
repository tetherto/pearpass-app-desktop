import { FAVORITES_FOLDER_ID, isFavorite } from './isFavorite'

describe('isFavorite', () => {
  it('should return true when folder is FAVORITES_FOLDER_ID', () => {
    expect(isFavorite(FAVORITES_FOLDER_ID)).toBe(true)
  })

  it('should return false when folder is not FAVORITES_FOLDER_ID', () => {
    expect(isFavorite('documents')).toBe(false)
    expect(isFavorite('work')).toBe(false)
    expect(isFavorite('')).toBe(false)
    expect(isFavorite(null)).toBe(false)
    expect(isFavorite(undefined)).toBe(false)
  })
})
