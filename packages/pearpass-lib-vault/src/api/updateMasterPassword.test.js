import { updateMasterPassword } from './updateMasterPassword'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { listVaults } from './listVaults'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    encryptionGetStatus: jest.fn(),
    encryptionInit: jest.fn(),
    hashPassword: jest.fn(),
    getDecryptionKey: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    vaultsGetStatus: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsInit: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultClose: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn(),
    encryptionAdd: jest.fn(),
    encryptVaultWithKey: jest.fn()
  }
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

jest.mock('./listVaults', () => ({
  listVaults: jest.fn()
}))

describe('updateMasterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize encryption if not already initialized', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })
    listVaults.mockResolvedValue([])
    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'hashedPassword',
      salt: 'salt'
    })
    getMasterPasswordEncryption.mockResolvedValue({
      hashedPassword: 'hashedPassword',
      salt: 'salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashedPassword')
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decryptionKey')
    pearpassVaultClient.encryptVaultWithKey.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })

    const result = await updateMasterPassword({
      newPassword: 'newPassword',
      currentPassword: 'currentPassword'
    })

    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
    expect(result).toEqual({
      hashedPassword: 'hashedPassword',
      salt: 'salt',
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })
  })

  it('should throw an error if the current password is invalid', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })
    listVaults.mockResolvedValue([])
    getMasterPasswordEncryption.mockResolvedValue({
      hashedPassword: 'hashedPassword',
      salt: 'salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('wrongPassword')

    await expect(
      updateMasterPassword({
        newPassword: 'newPassword',
        currentPassword: 'currentPassword'
      })
    ).rejects.toThrow('Invalid password')
  })
})
