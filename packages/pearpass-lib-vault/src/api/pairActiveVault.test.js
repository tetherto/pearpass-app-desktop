import { pairActiveVault } from './pairActiveVault'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    decryptVaultKey: jest.fn(),
    pairActiveVault: jest.fn(),
    encryptVaultWithKey: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultGet: jest.fn(),
    vaultsAdd: jest.fn()
  }
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

describe('pairActiveVault', () => {
  const mockInviteCode = 'test-invite-code'
  const mockMasterEncryption = {
    hashedPassword: 'hashed-password',
    ciphertext: 'master-ciphertext',
    nonce: 'master-nonce'
  }
  const mockMasterEncryptionKey = 'master-encryption-key'
  const mockVaultId = 'vault-id'
  const mockEncryptionKey = 'encryption-key'
  const mockEncryptResult = {
    ciphertext: 'new-ciphertext',
    nonce: 'new-nonce'
  }
  const mockVault = { name: 'Test Vault' }

  beforeEach(() => {
    jest.clearAllMocks()

    getMasterPasswordEncryption.mockResolvedValue(mockMasterEncryption)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(
      mockMasterEncryptionKey
    )
    pearpassVaultClient.pairActiveVault.mockResolvedValue({
      vaultId: mockVaultId,
      encryptionKey: mockEncryptionKey
    })
    pearpassVaultClient.encryptVaultWithKey.mockResolvedValue(mockEncryptResult)
    pearpassVaultClient.activeVaultGet.mockResolvedValue(mockVault)
  })

  it('should successfully pairActiveVault with invite code and return vault ID', async () => {
    const result = await pairActiveVault(mockInviteCode)

    expect(getMasterPasswordEncryption).toHaveBeenCalled()
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: mockMasterEncryption.hashedPassword,
      ciphertext: mockMasterEncryption.ciphertext,
      nonce: mockMasterEncryption.nonce
    })
    expect(pearpassVaultClient.pairActiveVault).toHaveBeenCalledWith(
      mockInviteCode
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: mockVaultId,
      encryptionKey: mockEncryptionKey
    })
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${mockVaultId}`,
      mockVault
    )
    expect(result).toBe(mockVaultId)
  })

  it('should throw error when vault key decryption fails', async () => {
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(pairActiveVault(mockInviteCode)).rejects.toThrow(
      'Failed to decrypt vault key for pairing'
    )

    expect(getMasterPasswordEncryption).toHaveBeenCalled()
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalled()
    expect(pearpassVaultClient.pairActiveVault).not.toHaveBeenCalled()
  })
})
