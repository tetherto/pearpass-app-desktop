import { getDefaultFavicon } from './getDefaultFavicon'

jest.mock('../constants/favicons', () => ({
  faviconBuffers: {
    'example.com': Buffer.from([0x01, 0x02, 0x03]),
    'test.com': Buffer.from([0x04, 0x05, 0x06])
  }
}))

describe('getDefaultFavicon', () => {
  it('returns the favicon buffer for a known domain', () => {
    const result = getDefaultFavicon('example.com')
    expect(result).toEqual(Buffer.from([0x01, 0x02, 0x03]))
  })

  it('returns the favicon buffer for another known domain', () => {
    const result = getDefaultFavicon('test.com')
    expect(result).toEqual(Buffer.from([0x04, 0x05, 0x06]))
  })

  it('returns null for an unknown domain', () => {
    const result = getDefaultFavicon('unknown.com')
    expect(result).toBeNull()
  })
})
