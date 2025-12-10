import { createProtectedVault } from './createProtectedVault'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultClose: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn(),
    hashPassword: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn()
  }
}))

describe('createProtectedVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if vault id is not provided', async () => {
    await expect(createProtectedVault({}, 'password')).rejects.toThrow(
      'Vault id is required'
    )
    await expect(createProtectedVault(null, 'password')).rejects.toThrow(
      'Vault id is required'
    )
    await expect(createProtectedVault(undefined, 'password')).rejects.toThrow(
      'Vault id is required'
    )
  })

  it('closes active vault if one exists', async () => {
    const vault = { id: 'test-id', name: 'Test Vault' }
    const password = 'test-password'

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'hashedPassword-value',
      salt: 'salt-value'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value'
    })

    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')

    await createProtectedVault(vault, password)

    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
  })

  it('successfully creates a protected vault', async () => {
    const vault = { id: 'test-id', name: 'Test Vault' }
    const password = 'test-password'
    const encryptionData = {
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      hashedPassword: 'decryption-key'
    }

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: encryptionData.hashedPassword,
      salt: encryptionData.salt
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: encryptionData.ciphertext,
      nonce: encryptionData.nonce
    })

    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')

    await createProtectedVault(vault, password)

    expect(pearpassVaultClient.hashPassword).toHaveBeenCalledWith(password)
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).toHaveBeenCalledWith(encryptionData.hashedPassword)
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'decryption-key',
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value'
    })
    // vaultsAdd stores vault without hashedPassword
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      {
        ...vault,
        encryption: {
          ciphertext: encryptionData.ciphertext,
          nonce: encryptionData.nonce,
          salt: encryptionData.salt
        }
      }
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'encryption-key'
    })
    // activeVaultAdd stores vault with hashedPassword
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith('vault', {
      ...vault,
      encryption: encryptionData
    })
  })
})
