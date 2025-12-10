import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'
import { validateAndPrepareWifiPasswordData } from './validateAndPrepareWifiPasswordData'

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((fields) => fields || [])
}))

describe('validateAndPrepareWifiPasswordData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should validate and prepare valid wifi password data', () => {
    const wifiPasswordData = {
      title: 'My WiFi Network',
      password: 'wifi123456',
      note: 'This is my home WiFi',
      customFields: [{ name: 'SSID', value: 'MyNetwork', type: 'text' }]
    }

    validateAndPrepareCustomFields.mockReturnValue([
      { name: 'SSID', value: 'MyNetwork', type: 'text' }
    ])

    const result = validateAndPrepareWifiPasswordData(wifiPasswordData)

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith([
      { name: 'SSID', value: 'MyNetwork', type: 'text' }
    ])
    expect(result).toEqual({
      title: 'My WiFi Network',
      password: 'wifi123456',
      note: 'This is my home WiFi',
      customFields: [{ name: 'SSID', value: 'MyNetwork', type: 'text' }]
    })
  })

  test('should handle missing optional fields', () => {
    const wifiPasswordData = {
      title: 'Basic WiFi',
      password: 'password123'
    }

    validateAndPrepareCustomFields.mockReturnValue([])

    const result = validateAndPrepareWifiPasswordData(wifiPasswordData)

    expect(result).toEqual({
      title: 'Basic WiFi',
      password: 'password123',
      note: undefined,
      customFields: []
    })
  })

  test('should handle empty custom fields', () => {
    const wifiPasswordData = {
      title: 'WiFi Network',
      password: 'password123',
      note: 'Network description',
      customFields: []
    }

    validateAndPrepareCustomFields.mockReturnValue([])

    const result = validateAndPrepareWifiPasswordData(wifiPasswordData)

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith([])
    expect(result).toEqual({
      title: 'WiFi Network',
      password: 'password123',
      note: 'Network description',
      customFields: []
    })
  })

  test('should handle null custom fields', () => {
    const wifiPasswordData = {
      title: 'WiFi Network',
      password: 'password123',
      note: 'Network description',
      customFields: null
    }

    validateAndPrepareCustomFields.mockReturnValue([])

    const result = validateAndPrepareWifiPasswordData(wifiPasswordData)

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(null)
    expect(result).toEqual({
      title: 'WiFi Network',
      password: 'password123',
      note: 'Network description',
      customFields: []
    })
  })

  test('should throw error for missing required title', () => {
    const wifiPasswordData = {
      password: 'password123'
    }

    expect(() => validateAndPrepareWifiPasswordData(wifiPasswordData)).toThrow(
      'Invalid wifi password data'
    )
  })

  test('should throw error for missing required password', () => {
    const wifiPasswordData = {
      title: 'WiFi Network'
    }

    expect(() => validateAndPrepareWifiPasswordData(wifiPasswordData)).toThrow(
      'Invalid wifi password data'
    )
  })

  test('should throw error for invalid data type', () => {
    const wifiPasswordData = {
      title: 123, // Should be string
      password: 'password123'
    }

    expect(() => validateAndPrepareWifiPasswordData(wifiPasswordData)).toThrow(
      'Invalid wifi password data'
    )
  })

  test('should throw error for empty title', () => {
    const wifiPasswordData = {
      title: '',
      password: 'password123'
    }

    expect(() => validateAndPrepareWifiPasswordData(wifiPasswordData)).toThrow(
      'Invalid wifi password data'
    )
  })

  test('should throw error for empty password', () => {
    const wifiPasswordData = {
      title: 'WiFi Network',
      password: ''
    }

    expect(() => validateAndPrepareWifiPasswordData(wifiPasswordData)).toThrow(
      'Invalid wifi password data'
    )
  })
})
