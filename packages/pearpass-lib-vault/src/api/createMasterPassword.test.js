import { createMasterPassword } from './createMasterPassword'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    encryptionGetStatus: jest.fn(),
    encryptionInit: jest.fn(),
    encryptionGet: jest.fn(),
    hashPassword: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    vaultsGetStatus: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsInit: jest.fn(),
    vaultsAdd: jest.fn(),
    vaultsClose: jest.fn(),
    encryptionAdd: jest.fn()
  }
}))

describe('createMasterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize encryption if status is not available', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: null })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.hashPassword.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'key'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })

    await createMasterPassword('testPassword')

    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
  })

  it('should not initialize encryption if status is available', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.hashPassword.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'key'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })

    await createMasterPassword('testPassword')

    expect(pearpassVaultClient.encryptionInit).not.toHaveBeenCalled()
  })

  it('should throw error if master password already exists', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue({ existingData: true })

    await expect(createMasterPassword('testPassword')).rejects.toThrow(
      'Master password already exists'
    )

    expect(pearpassVaultClient.hashPassword).not.toHaveBeenCalled()
  })

  it('should encrypt and add master password successfully', async () => {
    const mockEncryptionResult = {
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      hashedPassword: 'hashedPassword'
    }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)
    pearpassVaultClient.hashPassword.mockResolvedValue({
      salt: mockEncryptionResult.salt,
      hashedPassword: mockEncryptionResult.hashedPassword
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: mockEncryptionResult.ciphertext,
      nonce: mockEncryptionResult.nonce
    })

    await createMasterPassword('testPassword')

    expect(pearpassVaultClient.hashPassword).toHaveBeenCalledWith(
      'testPassword'
    )
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      'masterEncryption',
      {
        ciphertext: mockEncryptionResult.ciphertext,
        nonce: mockEncryptionResult.nonce,
        salt: mockEncryptionResult.salt,
        hashedPassword: mockEncryptionResult.hashedPassword
      }
    )
    expect(pearpassVaultClient.encryptionAdd).toHaveBeenCalledWith(
      'masterPassword',
      {
        ciphertext: mockEncryptionResult.ciphertext,
        nonce: mockEncryptionResult.nonce,
        salt: mockEncryptionResult.salt
      }
    )
  })
})
