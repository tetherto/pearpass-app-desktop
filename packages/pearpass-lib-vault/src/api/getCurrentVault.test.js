import { getCurrentVault } from './getCurrentVault'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultGet: jest.fn()
  }
}))

jest.mock('../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

describe('getCurrentVault', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return undefined and log an error if no active vault status is found', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValueOnce({
      status: null
    })

    const result = await getCurrentVault()

    expect(result).toBeUndefined()
    expect(pearpassVaultClient.activeVaultGet).not.toHaveBeenCalled()
  })

  it('should return the vault data if active vault status is found', async () => {
    const mockVaultData = { id: 'vault-id' }
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValueOnce({
      status: true
    })
    pearpassVaultClient.activeVaultGet.mockResolvedValueOnce(mockVaultData)

    const result = await getCurrentVault()

    expect(result).toEqual(mockVaultData)
    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
  })
})
