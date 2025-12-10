import { getPathArray } from './getPathArray'

describe('getPathArray', () => {
  test('returns the array unchanged if given an array', () => {
    const input = ['foo', 'bar', 'baz']
    expect(getPathArray(input)).toBe(input)
  })

  test('converts simple dot notation string to array', () => {
    expect(getPathArray('foo.bar.baz')).toEqual(['foo', 'bar', 'baz'])
  })

  test('converts array notation to dot notation in the array', () => {
    expect(getPathArray('foo[bar][baz]')).toEqual(['foo', 'bar', 'baz'])
  })

  test('handles mixed dot and array notation', () => {
    expect(getPathArray('foo.bar[baz]')).toEqual(['foo', 'bar', 'baz'])
  })

  test('handles empty string', () => {
    expect(getPathArray('')).toEqual([''])
  })
})
