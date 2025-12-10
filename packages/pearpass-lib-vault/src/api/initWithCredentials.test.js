import { initWithCredentials } from './initWithCredentials'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    decryptVaultKey: jest.fn(),
    vaultsInit: jest.fn()
  }
}))

const validParams = {
  ciphertext: 'ciphertext123',
  nonce: 'nonce123',
  hashedPassword: 'hashedPassword123'
}

describe('initWithCredentials', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws error if any required parameter is missing', async () => {
    await expect(initWithCredentials({})).rejects.toThrow(
      'Missing required parameters'
    )
    await expect(
      initWithCredentials({ ciphertext: 'a', nonce: 'b' })
    ).rejects.toThrow('Missing required parameters')
    await expect(
      initWithCredentials({ ciphertext: 'a', hashedPassword: 'c' })
    ).rejects.toThrow('Missing required parameters')
    await expect(
      initWithCredentials({ nonce: 'b', hashedPassword: 'c' })
    ).rejects.toThrow('Missing required parameters')
  })

  it('throws error if decryptVaultKey returns falsy', async () => {
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(initWithCredentials(validParams)).rejects.toThrow(
      'Error decrypting vault key'
    )
  })

  it('calls vaultsInit and returns true when decryption succeeds', async () => {
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decryptedKey')
    pearpassVaultClient.vaultsInit.mockResolvedValue()

    await expect(initWithCredentials(validParams)).resolves.toBe(true)
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith(
      validParams
    )
    expect(pearpassVaultClient.vaultsInit).toHaveBeenCalledWith('decryptedKey')
  })
})
