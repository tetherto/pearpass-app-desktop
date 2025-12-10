import { initWithPassword } from './initWithPassword'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    vaultsGetStatus: jest.fn(),
    vaultsGet: jest.fn(),
    getDecryptionKey: jest.fn(),
    encryptionGetStatus: jest.fn(),
    encryptionInit: jest.fn(),
    encryptionGet: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsInit: jest.fn(),
    recordFailedMasterPassword: jest.fn()
  }
}))

describe('initWithPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws if password is not provided', async () => {
    await expect(initWithPassword({})).rejects.toThrow('Password is required')
  })

  it('returns true if password matches masterEncryption', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.vaultsGet.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'hashed'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashed')

    const result = await initWithPassword({ password: 'pass' })
    expect(result).toBe(true)
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGet).toHaveBeenCalledWith(
      'masterEncryption'
    )
    expect(pearpassVaultClient.getDecryptionKey).toHaveBeenCalledWith({
      salt: 'salt',
      password: 'pass'
    })
  })

  it('throws if password does not match masterEncryption', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.vaultsGet.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'hashed'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('wrong')

    await expect(initWithPassword({ password: 'pass' })).rejects.toThrow(
      'Provided credentials do not match existing master encryption'
    )
  })

  it('initializes encryption if not already initialized', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionInit.mockResolvedValue()
    pearpassVaultClient.encryptionGet.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashed')
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('vaultKey')
    pearpassVaultClient.vaultsInit.mockResolvedValue()

    const result = await initWithPassword({ password: 'pass' })
    expect(result).toBe(true)
    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsInit).toHaveBeenCalledWith('vaultKey')
  })

  it('throws if decryptVaultKey fails', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptionGet.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashed')
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(initWithPassword({ password: 'pass' })).rejects.toThrow(
      'Error decrypting vault key'
    )
  })
})
