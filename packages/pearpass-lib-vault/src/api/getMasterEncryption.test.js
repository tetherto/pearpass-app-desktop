import { getMasterEncryption } from './getMasterEncryption'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    vaultsGetStatus: jest.fn(),
    vaultsGet: jest.fn()
  }
}))

describe('getMasterEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return masterEncryption when vaults status is true', async () => {
    const mockMasterEncryption = {
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      hashedPassword: 'hashedPassword'
    }
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.vaultsGet.mockResolvedValue(mockMasterEncryption)

    const result = await getMasterEncryption()

    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGet).toHaveBeenCalledWith(
      'masterEncryption'
    )
    expect(result).toEqual(mockMasterEncryption)
  })

  it('should return undefined when vaults status is false', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })

    const result = await getMasterEncryption()

    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGet).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })

  it('should return undefined when vaults status is undefined', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue(undefined)

    const result = await getMasterEncryption()

    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGet).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
