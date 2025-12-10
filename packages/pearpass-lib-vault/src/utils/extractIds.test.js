import { extractIds } from './extractIds'

describe('extractIds', () => {
  it('should extract ids from an array of objects', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]

    expect(extractIds(items)).toEqual([1, 2, 3])
  })

  it('should return an empty array when given an empty array', () => {
    expect(extractIds([])).toEqual([])
  })

  it('should use the default empty array when no argument is provided', () => {
    expect(extractIds()).toEqual([])
  })

  it('should handle string ids', () => {
    const items = [
      { id: 'a1', name: 'Item 1' },
      { id: 'b2', name: 'Item 2' },
      { id: 'c3', name: 'Item 3' }
    ]

    expect(extractIds(items)).toEqual(['a1', 'b2', 'c3'])
  })

  it('should throw an error when input is not an array', () => {
    expect(() => extractIds('not an array')).toThrow(
      'Input must be an array of records'
    )
    expect(() => extractIds(123)).toThrow('Input must be an array of records')
    expect(() => extractIds({})).toThrow('Input must be an array of records')
    expect(() => extractIds(null)).toThrow('Input must be an array of records')
  })
})
