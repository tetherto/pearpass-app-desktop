import { getPathArray } from './getPathArray'
import { setNestedValue } from './setNestedValue'

// Mock getPathArray dependency
jest.mock('./getPathArray')

describe('setNestedValue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return undefined when obj is falsy', () => {
    const result = setNestedValue(null, 'a.b.c', 'value')
    expect(result).toBeUndefined()
  })

  test('should set value at root level path', () => {
    getPathArray.mockReturnValue(['name'])
    const obj = { name: 'old', age: 30 }
    const result = setNestedValue(obj, 'name', 'new')
    expect(result).toEqual({ name: 'new', age: 30 })
    expect(obj).toEqual({ name: 'old', age: 30 })
  })

  test('should set value at nested path', () => {
    getPathArray.mockReturnValue(['user', 'profile', 'name'])
    const obj = { user: { profile: { name: 'old' } } }
    const result = setNestedValue(obj, 'user.profile.name', 'new')
    expect(result).toEqual({ user: { profile: { name: 'new' } } })
  })

  test('should create objects for non-existent path segments', () => {
    getPathArray.mockReturnValue(['a', 'b', 'c'])
    const obj = { x: 1 }
    const result = setNestedValue(obj, 'a.b.c', 'value')
    expect(result).toEqual({ x: 1, a: { b: { c: 'value' } } })
  })

  test('should override non-object values in path', () => {
    getPathArray.mockReturnValue(['user', 'settings', 'theme'])
    const obj = { user: { settings: 'invalid' } }
    const result = setNestedValue(obj, 'user.settings.theme', 'dark')
    expect(result).toEqual({ user: { settings: { theme: 'dark' } } })
  })

  test('should handle array path notation', () => {
    getPathArray.mockReturnValue(['items', '0', 'name'])
    const obj = { items: [{ id: 1 }] }
    const result = setNestedValue(obj, ['items', '0', 'name'], 'item1')
    expect(result).toEqual({ items: [{ id: 1, name: 'item1' }] })
  })
})
