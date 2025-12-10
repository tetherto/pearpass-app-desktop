import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultGet: jest.fn(),
    decryptVaultKey: jest.fn(),
    activeVaultClose: jest.fn(),
    activeVaultInit: jest.fn()
  }
}))

describe('initActiveVaultWithCredentials', () => {
  const vaultId = 'vault-123'
  const encryption = {
    ciphertext: 'ciphertext',
    nonce: 'nonce',
    hashedPassword: 'hashedPassword'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws error if required parameters are missing', async () => {
    await expect(
      initActiveVaultWithCredentials('', encryption)
    ).rejects.toThrow('Missing required parameters')
    await expect(initActiveVaultWithCredentials(vaultId, {})).rejects.toThrow(
      'Missing required parameters'
    )
    await expect(
      initActiveVaultWithCredentials(vaultId, { ...encryption, ciphertext: '' })
    ).rejects.toThrow('Missing required parameters')
    await expect(
      initActiveVaultWithCredentials(vaultId, { ...encryption, nonce: '' })
    ).rejects.toThrow('Missing required parameters')
    await expect(
      initActiveVaultWithCredentials(vaultId, {
        ...encryption,
        hashedPassword: ''
      })
    ).rejects.toThrow('Missing required parameters')
  })

  it('returns true if active vault is already initialized with the same id', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: vaultId })

    const result = await initActiveVaultWithCredentials(vaultId, encryption)
    expect(result).toBe(true)
    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.decryptVaultKey).not.toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultInit).not.toHaveBeenCalled()
  })

  it('throws error if decryptVaultKey returns falsy value', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(
      initActiveVaultWithCredentials(vaultId, encryption)
    ).rejects.toThrow('Error decrypting vault key')
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      ciphertext: encryption.ciphertext,
      nonce: encryption.nonce,
      hashedPassword: encryption.hashedPassword
    })
  })

  it('closes and initializes active vault if not already initialized', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')
    pearpassVaultClient.activeVaultClose.mockResolvedValue()
    pearpassVaultClient.activeVaultInit.mockResolvedValue()

    const result = await initActiveVaultWithCredentials(vaultId, encryption)
    expect(result).toBe(true)
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      ciphertext: encryption.ciphertext,
      nonce: encryption.nonce,
      hashedPassword: encryption.hashedPassword
    })
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vaultId,
      encryptionKey: 'decrypted-key'
    })
  })

  it('initializes active vault if status is true but id does not match', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'other-vault' })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')
    pearpassVaultClient.activeVaultClose.mockResolvedValue()
    pearpassVaultClient.activeVaultInit.mockResolvedValue()

    const result = await initActiveVaultWithCredentials(vaultId, encryption)
    expect(result).toBe(true)
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vaultId,
      encryptionKey: 'decrypted-key'
    })
  })
})
