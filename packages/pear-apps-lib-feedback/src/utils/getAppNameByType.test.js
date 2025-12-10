import { getAppNameByType } from './getAppNameByType'

describe('getAppNameByType', () => {
  test('returns "Mobile App" when passed "MOBILE"', () => {
    expect(getAppNameByType('MOBILE')).toBe('Mobile')
  })

  test('returns "Desktop App" when passed "DESKTOP"', () => {
    expect(getAppNameByType('DESKTOP')).toBe('Desktop')
  })

  test('returns "Browser Extension" when passed "BROWSER_EXTENSION"', () => {
    expect(getAppNameByType('BROWSER_EXTENSION')).toBe('Browser Extension')
  })

  test('returns "Unknown App" when passed an undefined app type', () => {
    expect(getAppNameByType(undefined)).toBe('Unknown')
  })

  test('returns "Unknown App" when passed an invalid app type', () => {
    expect(getAppNameByType('INVALID_TYPE')).toBe('Unknown')
  })
})
