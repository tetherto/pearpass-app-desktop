import { addHttps } from './addHttps'

describe('addHttps', () => {
  test('should return the URL unchanged if it already starts with http://', () => {
    const url = 'http://example.com'
    expect(addHttps(url)).toBe(url)
  })

  test('should return the URL unchanged if it already starts with https://', () => {
    const url = 'https://example.com'
    expect(addHttps(url)).toBe(url)
  })

  test('should prepend https:// to the URL if it does not start with http:// or https://', () => {
    const url = 'example.com'
    expect(addHttps(url)).toBe('https://example.com')
  })

  test('should handle URLs with subdomains correctly', () => {
    const url = 'www.example.com'
    expect(addHttps(url)).toBe('https://www.example.com')
  })

  test('should handle URLs with paths correctly', () => {
    const url = 'example.com/path'
    expect(addHttps(url)).toBe('https://example.com/path')
  })
})
