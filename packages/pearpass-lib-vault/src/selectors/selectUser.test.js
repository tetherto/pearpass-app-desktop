import { selectUser } from './selectUser'

describe('selectUser', () => {
  test('should return user from state', () => {
    const state = {
      user: { id: 1, name: 'Test User' }
    }
    expect(selectUser(state)).toEqual({ id: 1, name: 'Test User' })
  })

  test('should handle undefined state', () => {
    expect(selectUser(undefined)).toBeUndefined()
  })

  test('should handle null state', () => {
    expect(selectUser(null)).toBeUndefined()
  })

  test('should handle state without user property', () => {
    const state = { otherData: 'something' }
    expect(selectUser(state)).toBeUndefined()
  })
})
