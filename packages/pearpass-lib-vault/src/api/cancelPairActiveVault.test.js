import { cancelPairActiveVault } from './cancelPairActiveVault'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    cancelPairActiveVault: jest.fn()
  }
}))

describe('cancelPairActiveVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call pearpassVaultClient.cancelPairActiveVault', async () => {
    pearpassVaultClient.cancelPairActiveVault.mockResolvedValue()

    await cancelPairActiveVault()

    expect(pearpassVaultClient.cancelPairActiveVault).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if pearpassVaultClient.cancelPairActiveVault fails', async () => {
    const expectedError = new Error('Failed to cancel pairing')
    pearpassVaultClient.cancelPairActiveVault.mockRejectedValue(expectedError)

    await expect(cancelPairActiveVault()).rejects.toThrow(expectedError)
  })
})
