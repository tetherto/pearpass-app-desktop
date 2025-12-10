import { pearpassVaultClient } from '../instances'
import { closeAllInstances } from './closeAllInstances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    closeAllInstances: jest.fn()
  }
}))

describe('closeAllInstances', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call pearpassVaultClient.closeAllInstances once', async () => {
    await closeAllInstances()

    expect(pearpassVaultClient.closeAllInstances).toHaveBeenCalledTimes(1)
  })

  it('should resolve without errors', async () => {
    pearpassVaultClient.closeAllInstances.mockResolvedValueOnce()

    await expect(closeAllInstances()).resolves.toBeUndefined()
  })

  it('should handle errors from closeAllInstances method', async () => {
    pearpassVaultClient.closeAllInstances.mockRejectedValueOnce(
      new Error('Close failed')
    )

    await expect(closeAllInstances()).rejects.toThrow('Close failed')
  })
})
