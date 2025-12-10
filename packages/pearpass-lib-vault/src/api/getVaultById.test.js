import { getVaultById } from './getVaultById'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { listVaults } from './listVaults'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    getDecryptionKey: jest.fn(),
    decryptVaultKey: jest.fn(),
    activeVaultGetStatus: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultGet: jest.fn(),
    activeVaultClose: jest.fn()
  }
}))

jest.mock('./listVaults', () => ({
  listVaults: jest.fn()
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

describe('getVaultById', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('throws "Vault not found" error if vault is not in the list', async () => {
    listVaults.mockResolvedValue([{ id: 'otherVault' }])
    await expect(
      getVaultById('vault1', { password: 'password' })
    ).rejects.toThrow('Vault not found')
  })

  describe('when password is provided', () => {
    it('throws error if vault encryption data does not exist', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: false
      })
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashedPassword')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

      await expect(
        getVaultById('vault1', { password: 'password' })
      ).rejects.toThrow('Error decrypting vault key')
    })

    it('throws error if decryption fails (decryptVaultKey returns falsy)', async () => {
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      listVaults.mockResolvedValue([
        { id: 'vault1', encryption: vaultEncryptionRes }
      ])
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: false
      })
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashedPassword')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

      await expect(
        getVaultById('vault1', { password: 'password' })
      ).rejects.toThrow('Error decrypting vault key')
    })

    it('initializes the vault if activeVaultGetStatus returns false', async () => {
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      listVaults.mockResolvedValue([
        { id: 'vault1', encryption: vaultEncryptionRes }
      ])
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashedPassword')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: false
      })
      pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'vault1' })

      const result = await getVaultById('vault1', { password: 'password' })

      expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
        id: 'vault1',
        encryptionKey: 'encryptionKey'
      })
      expect(result).toEqual({ id: 'vault1' })
    })

    it('reinitializes the vault if the current active vault id does not match', async () => {
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      listVaults.mockResolvedValue([
        { id: 'vault1', encryption: vaultEncryptionRes }
      ])
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashedPassword')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: true
      })

      pearpassVaultClient.activeVaultGet
        .mockResolvedValueOnce({ id: 'differentVault' })
        .mockResolvedValueOnce({ id: 'vault1' })

      const result = await getVaultById('vault1', { password: 'password' })

      expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()

      expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ id: 'vault1' })
    })

    it('returns the current vault if the active vault id matches', async () => {
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      listVaults.mockResolvedValue([
        { id: 'vault1', encryption: vaultEncryptionRes }
      ])

      pearpassVaultClient.getDecryptionKey.mockResolvedValue('hashedPassword')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: true
      })
      pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'vault1' })

      const result = await getVaultById('vault1', { password: 'password' })
      expect(result).toEqual({ id: 'vault1' })
    })
  })

  describe('when no password is provided', () => {
    it('throws error if decryption fails (decryptVaultKey returns falsy)', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      getMasterPasswordEncryption.mockResolvedValue({
        hashedPassword: 'hashedPassword',
        ciphertext: 'cipher',
        nonce: 'nonce'
      })
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: false
      })
      pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

      await expect(getVaultById('vault1')).rejects.toThrow(
        'Error decrypting vault key'
      )
    })

    it('initializes the vault if activeVaultGetStatus returns false', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      getMasterPasswordEncryption.mockResolvedValue({
        hashedPassword: 'hashedPassword',
        ciphertext: 'cipher',
        nonce: 'nonce'
      })
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: false
      })
      pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'vault1' })

      const result = await getVaultById('vault1')

      expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
        id: 'vault1',
        encryptionKey: 'encryptionKey'
      })
      expect(result).toEqual({ id: 'vault1' })
    })

    it('reinitializes the vault if the current active vault id does not match', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      getMasterPasswordEncryption.mockResolvedValue({
        hashedPassword: 'hashedPassword',
        ciphertext: 'cipher',
        nonce: 'nonce'
      })
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: true
      })

      pearpassVaultClient.activeVaultGet
        .mockResolvedValueOnce({ id: 'differentVault' })
        .mockResolvedValueOnce({ id: 'vault1' })

      const result = await getVaultById('vault1')

      expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()

      expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ id: 'vault1' })
    })
  })
})
