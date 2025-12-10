import { extractDomainName } from './extractDomainName'

describe('extractDomainName', () => {
  it('returns null for undefined input', () => {
    expect(extractDomainName(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractDomainName('')).toBeNull()
  })

  it('extracts domain from http URL', () => {
    expect(extractDomainName('http://www.google.com')).toBe('google')
  })

  it('extracts domain from https URL', () => {
    expect(extractDomainName('https://www.example.org')).toBe('example')
  })

  it('extracts domain from URL without www', () => {
    expect(extractDomainName('https://subdomain.github.io')).toBe('github')
  })

  it('extracts domain from URL with path and query', () => {
    expect(extractDomainName('https://www.testsite.com/path?query=1')).toBe(
      'testsite'
    )
  })

  it('extracts domain from URL with fragment', () => {
    expect(extractDomainName('https://www.testsite.com/#fragment')).toBe(
      'testsite'
    )
  })

  it('extracts domain from URL with multiple subdomains', () => {
    expect(extractDomainName('https://a.b.c.domain.com')).toBe('domain')
  })

  it('extracts domain from domain only', () => {
    expect(extractDomainName('pearpass.com')).toBe('pearpass')
  })

  it('extracts domain from www only', () => {
    expect(extractDomainName('www.pearpass.com')).toBe('pearpass')
  })

  it('returns null for single word input', () => {
    expect(extractDomainName('localhost')).toBeNull()
    expect(extractDomainName('test')).toBeNull()
  })

  it('extracts domain from URL with port', () => {
    expect(extractDomainName('http://www.example.com:8080')).toBe('example')
  })
})
