import {
  setPearpassVaultClient,
  pearpassVaultClient,
  setStoragePath
} from './index'

describe('instance management functions', () => {
  test('setPearpassVaultClient sets the global instance', () => {
    const mockInstance = {
      setStoragePath: jest.fn()
    }

    setPearpassVaultClient(mockInstance)

    expect(pearpassVaultClient).toBe(mockInstance)
  })

  test('setStoragePath calls setStoragePath on the client instance', async () => {
    const mockInstance = {
      setStoragePath: jest.fn().mockResolvedValue(undefined)
    }
    setPearpassVaultClient(mockInstance)
    const testPath = '/test/path'

    await setStoragePath(testPath)

    expect(mockInstance.setStoragePath).toHaveBeenCalledWith(testPath)
    expect(mockInstance.setStoragePath).toHaveBeenCalledTimes(1)
  })

  test('setStoragePath throws if client is not initialized', async () => {
    setPearpassVaultClient(undefined)

    await expect(setStoragePath('/any/path')).rejects.toThrow()
  })
})
