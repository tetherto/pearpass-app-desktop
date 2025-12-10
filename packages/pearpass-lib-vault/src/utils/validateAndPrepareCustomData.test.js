import {
  validateAndPrepareCustomData,
  customSchema
} from './validateAndPrepareCustomData'
import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((fields) => fields || []),
  customFieldSchema: {}
}))

jest.mock('pear-apps-utils-validator', () => ({
  Validator: {
    object: jest.fn(() => ({ validate: jest.fn() })),
    string: jest.fn(() => ({ required: jest.fn() })),
    array: jest.fn(() => ({ items: jest.fn() }))
  }
}))

describe('validateAndPrepareCustomData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    customSchema.validate = jest.fn(() => null)
  })

  it('should process valid custom data correctly', () => {
    const mockCustom = {
      title: 'Test Title',
      customFields: [{ name: 'test', value: 'value' }]
    }

    const result = validateAndPrepareCustomData(mockCustom)

    expect(result).toEqual({
      title: 'Test Title',
      customFields: [{ name: 'test', value: 'value' }]
    })
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      mockCustom.customFields
    )
    expect(customSchema.validate).toHaveBeenCalled()
  })

  it('should throw an error for invalid custom data', () => {
    const mockCustom = {
      title: 'Test Title',
      customFields: [{ name: 'test', value: 'value' }]
    }

    customSchema.validate = jest.fn(() => ({ error: 'Invalid data' }))

    expect(() => {
      validateAndPrepareCustomData(mockCustom)
    }).toThrow('Invalid custom data:')

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      mockCustom.customFields
    )
  })

  it('should handle missing customFields', () => {
    const mockCustom = {
      title: 'Test Title'
    }

    const result = validateAndPrepareCustomData(mockCustom)

    expect(result.title).toBe('Test Title')
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(undefined)
    expect(customSchema.validate).toHaveBeenCalled()
  })
})
