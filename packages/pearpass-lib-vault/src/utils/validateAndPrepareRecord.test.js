import { validateAndPrepareCreditCardData } from './validateAndPrepareCreditCardData'
import { validateAndPrepareCustomData } from './validateAndPrepareCustomData'
import { validateAndPrepareIdentityData } from './validateAndPrepareIdentityData'
import { validateAndPrepareLoginData } from './validateAndPrepareLoginData'
import { validateAndPrepareNoteData } from './validateAndPrepareNoteData'
import { validateAndPreparePassPhraseData } from './validateAndPreparePassPhraseData'
import { validateAndPrepareRecord } from './validateAndPrepareRecord'
import { validateAndPrepareWifiPasswordData } from './validateAndPrepareWifiPasswordData'
import { VERSION } from '../constants/version'

jest.mock('./validateAndPrepareCreditCardData', () => ({
  validateAndPrepareCreditCardData: jest.fn()
}))
jest.mock('./validateAndPrepareCustomData', () => ({
  validateAndPrepareCustomData: jest.fn()
}))
jest.mock('./validateAndPrepareIdentityData', () => ({
  validateAndPrepareIdentityData: jest.fn()
}))
jest.mock('./validateAndPrepareLoginData', () => ({
  validateAndPrepareLoginData: jest.fn()
}))
jest.mock('./validateAndPrepareNoteData', () => ({
  validateAndPrepareNoteData: jest.fn()
}))
jest.mock('./validateAndPreparePassPhraseData', () => ({
  validateAndPreparePassPhraseData: jest.fn()
}))
jest.mock('./validateAndPrepareWifiPasswordData', () => ({
  validateAndPrepareWifiPasswordData: jest.fn()
}))

describe('validateAndPrepareRecord', () => {
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

    validateAndPrepareCreditCardData.mockReturnValue({ mockedCreditCard: true })
    validateAndPrepareCustomData.mockReturnValue({ mockedCustom: true })
    validateAndPrepareIdentityData.mockReturnValue({ mockedIdentity: true })
    validateAndPrepareLoginData.mockReturnValue({ mockedLogin: true })
    validateAndPrepareNoteData.mockReturnValue({ mockedNote: true })
    validateAndPreparePassPhraseData.mockReturnValue({ mockedPassPhrase: true })
    validateAndPrepareWifiPasswordData.mockReturnValue({
      mockedWifiPassword: true
    })
  })

  test('should validate and prepare a valid login record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'login',
      vaultId: 'vault-123',
      data: { username: 'test', password: 'pass' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPrepareLoginData).toHaveBeenCalledWith(mockRecord.data)
    expect(result).toEqual({
      id: 'test-id-123',
      version: VERSION.v1,
      type: 'login',
      vaultId: 'vault-123',
      data: { mockedLogin: true },
      folder: null,
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    })
  })

  test('should validate and prepare a valid creditCard record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'creditCard',
      vaultId: 'vault-123',
      data: { cardNumber: '1234' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPrepareCreditCardData).toHaveBeenCalledWith(
      mockRecord.data
    )
    expect(result.data).toEqual({ mockedCreditCard: true })
  })

  test('should validate and prepare a valid custom record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'custom',
      vaultId: 'vault-123',
      data: { custom: 'data' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPrepareCustomData).toHaveBeenCalledWith(mockRecord.data)
    expect(result.data).toEqual({ mockedCustom: true })
  })

  test('should validate and prepare a valid identity record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'identity',
      vaultId: 'vault-123',
      data: { firstName: 'John' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPrepareIdentityData).toHaveBeenCalledWith(mockRecord.data)
    expect(result.data).toEqual({ mockedIdentity: true })
  })

  test('should validate and prepare a valid note record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'note',
      vaultId: 'vault-123',
      data: { text: 'note content' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPrepareNoteData).toHaveBeenCalledWith(mockRecord.data)
    expect(result.data).toEqual({ mockedNote: true })
  })

  test('should validate and prepare a valid wifiPassword record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'wifiPassword',
      vaultId: 'vault-123',
      data: { title: 'My WiFi', password: 'wifi123' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPrepareWifiPasswordData).toHaveBeenCalledWith(
      mockRecord.data
    )
    expect(result).toEqual({
      id: 'test-id-123',
      version: VERSION.v1,
      type: 'wifiPassword',
      vaultId: 'vault-123',
      data: { mockedWifiPassword: true },
      folder: null,
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    })
  })

  test('should validate and prepare a valid passPhrase record', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'passPhrase',
      vaultId: 'vault-123',
      data: {
        title: 'My Passphrase',
        passPhrase: 'Passphrase'
      },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)

    expect(validateAndPreparePassPhraseData).toHaveBeenCalledWith(
      mockRecord.data
    )
    expect(result).toEqual({
      id: 'test-id-123',
      version: VERSION.v1,
      type: 'passPhrase',
      vaultId: 'vault-123',
      data: { mockedPassPhrase: true },
      folder: null,
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    })
  })

  test('should preserve folder when provided', () => {
    const mockRecord = {
      id: 'test-id-123',
      type: 'login',
      vaultId: 'vault-123',
      data: { username: 'test' },
      folder: 'my-folder',
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    const result = validateAndPrepareRecord(mockRecord)
    expect(result.folder).toBe('my-folder')
  })

  test('should throw error for invalid record', () => {
    const { Validator } = require('pear-apps-utils-validator')

    Validator.object.mockImplementationOnce(() => ({
      validate: jest.fn(() => ({
        errors: ['Invalid record data']
      }))
    }))

    const mockRecord = {
      id: 'test-id-123',
      type: 'login',

      data: { username: 'test' },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890
    }

    expect(() => validateAndPrepareRecord(mockRecord)).toThrow(
      'Invalid record data'
    )
  })
})
