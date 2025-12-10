import { parseRequestData } from './parseRequestData'

describe('parseRequestData', () => {
  it('returns null if data is falsy', () => {
    expect(parseRequestData(null)).toBeNull()
    expect(parseRequestData(undefined)).toBeNull()
    expect(parseRequestData('')).toBeNull()
    expect(parseRequestData(0)).toBeNull()
    expect(parseRequestData(false)).toBeNull()
  })

  it('parses JSON string correctly', () => {
    const jsonData = JSON.stringify({ key: 'value' })
    expect(parseRequestData(jsonData)).toEqual({ key: 'value' })
  })

  it('returns original data if it cannot be parsed as JSON', () => {
    const nonJsonString = 'Hello World'
    expect(parseRequestData(nonJsonString)).toBe(nonJsonString)

    const buffer = Buffer.from('test data')
    expect(parseRequestData(buffer)).toBe(buffer)
  })

  it('handles complex JSON objects', () => {
    const complexObject = {
      name: 'Test',
      details: {
        age: 30,
        tags: ['one', 'two']
      },
      active: true
    }
    const jsonData = JSON.stringify(complexObject)
    expect(parseRequestData(jsonData)).toEqual(complexObject)
  })
})
