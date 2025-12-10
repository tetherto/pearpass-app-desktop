jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (key) => key
    }
  })
}))

jest.mock('pear-apps-utils-date', () => ({
  formatDate: () => 'formatted-date'
}))

import { vaultCreatedFormat } from './vaultCreated'

describe('vaultCreatedFormat', () => {
  it('should return formatted date string when valid date is provided', () => {
    const date = new Date('2024-03-20')
    const result = vaultCreatedFormat(date)
    expect(result).toBe('Created formatted-date')
  })

  it('should return empty string when no date is provided', () => {
    const result = vaultCreatedFormat(null)
    expect(result).toBe('')
  })

  it('should return empty string when undefined is provided', () => {
    const result = vaultCreatedFormat(undefined)
    expect(result).toBe('')
  })

  it('should handle string date input', () => {
    const date = '2024-03-20'
    const result = vaultCreatedFormat(date)
    expect(result).toBe('Created formatted-date')
  })
})
