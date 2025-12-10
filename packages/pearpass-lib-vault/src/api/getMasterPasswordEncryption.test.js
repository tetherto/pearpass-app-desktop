import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    encryptionGetStatus: jest.fn(),
    encryptionInit: jest.fn(),
    encryptionGet: jest.fn(),
    vaultsGetStatus: jest.fn(),
    vaultsGet: jest.fn()
  }
}))

describe('getMasterPasswordEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize encryption if status is not available', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: null })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionInit.mockResolvedValue({})
    pearpassVaultClient.vaultsGet.mockResolvedValue()
    pearpassVaultClient.encryptionGet.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      hashedPassword: 'decryption-key'
    })

    const result = await getMasterPasswordEncryption()

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      'masterPassword'
    )
    expect(result).toEqual({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      hashedPassword: 'decryption-key'
    })
  })

  it('should not initialize encryption if status is already available', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptionGet.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value'
    })

    const result = await getMasterPasswordEncryption()

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionInit).not.toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      'masterPassword'
    )
    expect(result).toEqual({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value'
    })
  })
})
