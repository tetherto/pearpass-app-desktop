import { validateAndPrepareDevice } from './validateAndPrepareDevice'

describe('validateAndPrepareDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should throw error for invalid device', () => {
    const mockDevice = {
      id: 'test-id-123',
      type: 'login',
      name: 'ios',
      createdAt: 1234567890
    }

    expect(() => validateAndPrepareDevice(mockDevice)).toThrow(
      'Invalid device data'
    )
  })

  test('should validate and prepare valid device', () => {
    const mockDevice = {
      id: 'test-id-123',
      vaultId: 'vault-456',
      name: 'ios',
      createdAt: 1234567890
    }

    const result = validateAndPrepareDevice(mockDevice)

    expect(result).toEqual({
      id: 'test-id-123',
      vaultId: 'vault-456',
      name: 'ios',
      createdAt: 1234567890
    })
  })
})
