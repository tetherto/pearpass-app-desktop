import { jest } from '@jest/globals'

import { generateQRCodeSVG } from './generateQRCodeSVG'

jest.mock('qrcode', () => ({
  toString: jest
    .fn()
    .mockImplementation((text) =>
      Promise.resolve(`<svg>Mock QR code for ${text}</svg>`)
    )
}))

describe('generateQRCodeSVG', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call QRCode.toString with correct parameters', async () => {
    const text = 'https://example.com'
    const config = { type: 'svg', margin: 4 }

    await generateQRCodeSVG(text, config)

    expect(require('qrcode').toString).toHaveBeenCalledWith(text, config)
  })

  it('should return SVG string', async () => {
    const text = 'test data'
    const config = { type: 'svg', margin: 2 }

    const result = await generateQRCodeSVG(text, config)

    expect(typeof result).toBe('string')
    expect(result).toContain('<svg>')
    expect(result).toContain('Mock QR code for test data')
  })

  it('should handle different margin values', async () => {
    const text = 'test data'
    const config = { type: 'svg', margin: 0 }

    await generateQRCodeSVG(text, config)

    expect(require('qrcode').toString).toHaveBeenCalledWith(text, {
      type: 'svg',
      margin: 0
    })
  })
})
