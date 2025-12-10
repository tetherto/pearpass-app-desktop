import { checkVaultIsProtected } from './checkVaultIsProtected'
import { listVaults } from './listVaults'

jest.mock('./listVaults')

describe('checkVaultIsProtected', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when vault has all encryption properties', async () => {
    const mockVault = {
      id: 'vault1',
      encryption: {
        ciphertext: 'some-ciphertext',
        nonce: 'some-nonce',
        hashedPassword: 'some-hashed-password',
        salt: 'some-salt'
      }
    }

    listVaults.mockResolvedValue([mockVault])

    const result = await checkVaultIsProtected('vault1')
    expect(result).toBe(true)
    expect(listVaults).toHaveBeenCalledTimes(1)
  })

  it('should return false when vault is missing encryption properties', async () => {
    const mockVault = {
      id: 'vault2',
      encryption: {
        ciphertext: 'some-ciphertext',
        nonce: 'some-nonce'
        // salt is missing
      }
    }

    listVaults.mockResolvedValue([mockVault])

    const result = await checkVaultIsProtected('vault2')
    expect(result).toBe(false)
  })

  it('should throw error when vault is not found', async () => {
    listVaults.mockResolvedValue([{ id: 'other-vault' }])

    await expect(checkVaultIsProtected('non-existent')).rejects.toThrow(
      'Vault not found'
    )
  })
})
