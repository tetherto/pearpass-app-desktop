import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'
import { validateAndPrepareIdentityData } from './validateAndPrepareIdentityData'

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((fields) => fields || [])
}))
jest.mock('./processFiles', () => ({
  processFiles: jest.fn((files) => files || [])
}))

describe('validateAndPrepareIdentityData', () => {
  const validIdentity = {
    title: 'Personal',
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+15551234567',
    address: '123 Main St',
    zip: '12345',
    city: 'New York',
    region: 'NY',
    country: 'USA',
    note: 'Some notes',
    customFields: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()

    jest.doMock('pear-apps-utils-validator', () => ({
      Validator: {
        object: jest.fn().mockImplementation(() => ({
          validate: jest.fn(() => ({ error: 'completely new behavior' }))
        })),
        string: jest.fn().mockImplementation(() => ({})),
        number: jest.fn().mockImplementation(() => ({})),
        boolean: jest.fn().mockImplementation(() => ({})),
        array: jest.fn().mockImplementation(() => ({}))
      }
    }))
  })

  it('should validate and return valid identity data', () => {
    const result = validateAndPrepareIdentityData(validIdentity)
    expect(result).toEqual(validIdentity)
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      validIdentity.customFields
    )
  })

  it('should accept minimal valid identity with only required fields', () => {
    const minimalIdentity = { title: 'Work' }
    const result = validateAndPrepareIdentityData(minimalIdentity)
    expect(result.title).toBe('Work')
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(undefined)
  })

  it('should throw error for missing required title', () => {
    const invalidIdentity = { ...validIdentity }
    delete invalidIdentity.title
    expect(() => validateAndPrepareIdentityData(invalidIdentity)).toThrow(
      /Invalid identity data/
    )
  })

  it('should properly handle custom fields', () => {
    const customFields = [{ name: 'Field1', value: 'Value1' }]
    const identityWithCustomFields = { ...validIdentity, customFields }

    validateAndPrepareCustomFields.mockReturnValueOnce(['processed fields'])

    const result = validateAndPrepareIdentityData(identityWithCustomFields)

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(customFields)
    expect(result.customFields).toEqual(['processed fields'])
  })
})
