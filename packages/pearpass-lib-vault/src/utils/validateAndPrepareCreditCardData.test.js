import { validateAndPrepareCreditCardData } from './validateAndPrepareCreditCardData'
import { validateAndPrepareCustomFields } from './validateAndPrepareCustomFields'

jest.mock('./validateAndPrepareCustomFields', () => ({
  validateAndPrepareCustomFields: jest.fn((customFields) => customFields || [])
}))

describe('validateAndPrepareCreditCardData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate and prepare valid credit card data', () => {
    const mockCreditCard = {
      title: 'My Credit Card',
      name: 'John Doe',
      number: '4111111111111111',
      expireDate: '12/25',
      securityCode: '123',
      pinCode: '1234',
      note: 'Personal use only',
      customFields: [{ key: 'issuer', value: 'Visa' }]
    }

    const result = validateAndPrepareCreditCardData(mockCreditCard)

    expect(result).toEqual(mockCreditCard)
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(
      mockCreditCard.customFields
    )
  })

  it('should handle missing optional fields', () => {
    const mockCreditCard = {
      title: 'My Credit Card'
    }

    const result = validateAndPrepareCreditCardData(mockCreditCard)

    expect(result).toEqual({
      title: 'My Credit Card',
      name: undefined,
      number: undefined,
      expireDate: undefined,
      securityCode: undefined,
      pinCode: undefined,
      note: undefined,
      customFields: []
    })
    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(undefined)
  })

  it('should throw an error for invalid credit card data', () => {
    const mockCreditCard = {
      name: 'John Doe'
    }

    expect(() => {
      validateAndPrepareCreditCardData(mockCreditCard)
    }).toThrow(/Invalid credit card data/)
  })

  it('should pass custom fields to validateAndPrepareCustomFields', () => {
    const customFields = [{ key: 'issuer', value: 'Visa' }]
    const mockCreditCard = {
      title: 'My Credit Card',
      customFields
    }

    validateAndPrepareCreditCardData(mockCreditCard)

    expect(validateAndPrepareCustomFields).toHaveBeenCalledWith(customFields)
  })
})
