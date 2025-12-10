import { getNestedValue } from './getNestedValue'
import { getPathArray } from './getPathArray'

jest.mock('./getPathArray', () => ({
  getPathArray: jest.fn()
}))

describe('getNestedValue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns defaultValue when obj is null or undefined', () => {
    const defaultValue = 'default'
    expect(getNestedValue(null, 'a.b.c', defaultValue)).toBe(defaultValue)
    expect(getNestedValue(undefined, 'a.b.c', defaultValue)).toBe(defaultValue)
  })

  it('returns value from nested object when path is a string', () => {
    getPathArray.mockReturnValue(['a', 'b', 'c'])

    const obj = {
      a: {
        b: {
          c: 'value'
        }
      }
    }

    expect(getNestedValue(obj, 'a.b.c', 'default')).toBe('value')
    expect(getPathArray).toHaveBeenCalledWith('a.b.c')
  })

  it('returns value from nested object when path is an array', () => {
    getPathArray.mockReturnValue(['a', 'b', 'c'])

    const obj = {
      a: {
        b: {
          c: 'value'
        }
      }
    }

    expect(getNestedValue(obj, ['a', 'b', 'c'], 'default')).toBe('value')
    expect(getPathArray).toHaveBeenCalledWith(['a', 'b', 'c'])
  })

  it('returns defaultValue when path does not exist', () => {
    getPathArray.mockReturnValue(['a', 'b', 'd'])

    const obj = {
      a: {
        b: {
          c: 'value'
        }
      }
    }

    expect(getNestedValue(obj, 'a.b.d', 'default')).toBe('default')
  })

  it('correctly handles numeric indices in path', () => {
    getPathArray.mockReturnValue(['a', '0', 'c'])

    const obj = {
      a: [
        {
          c: 'value'
        }
      ]
    }

    expect(getNestedValue(obj, 'a.0.c', 'default')).toBe('value')
  })

  it('handles undefined values in the middle of path', () => {
    getPathArray.mockReturnValue(['a', 'b', 'c'])

    const obj = {
      a: {}
    }

    expect(getNestedValue(obj, 'a.b.c', 'default')).toBe('default')
  })
})
