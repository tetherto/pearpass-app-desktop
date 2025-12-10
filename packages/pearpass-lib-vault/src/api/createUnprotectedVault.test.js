import { createUnprotectedVault } from './createUnprotectedVault'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))
jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultClose: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    decryptVaultKey: jest.fn(),
    encryptionAdd: jest.fn()
  }
}))

describe('createUnprotectedVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should close active vault if one exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'v-ciphertext',
      nonce: 'v-nonce'
    })

    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      hashedPassword: 'hashedPassword'
    })

    const vault = { id: 'test-vault-id' }

    await createUnprotectedVault(vault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: undefined
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })

  it('should not close active vault if none exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      hashedPassword: 'hashedPassword'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'v-ciphertext',
      nonce: 'v-nonce'
    })

    const vault = { id: 'test-vault-id' }

    await createUnprotectedVault(vault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: undefined
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })

  it('should add vault with proper path structure', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      hashedPassword: 'hashedPassword'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'v-ciphertext',
      nonce: 'v-nonce'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')

    const vault = { id: 'complex-vault-id', name: 'Test Vault' }

    await createUnprotectedVault(vault)

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
  })

  it('should handle encryption when vault has password', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      hashedPassword: 'hashedPassword'
    })

    const encryptVaultKeyResult = {
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value'
    }

    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue(
      encryptVaultKeyResult
    )
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')

    const vault = { id: 'test-vault-id', password: 'test-password' }

    await createUnprotectedVault(vault)

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      ciphertext: encryptVaultKeyResult.ciphertext,
      nonce: encryptVaultKeyResult.nonce,
      hashedPassword: 'hashedPassword'
    })
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'decrypted-key'
    })
  })
})
