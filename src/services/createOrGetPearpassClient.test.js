import { PearpassVaultClient } from 'pearpass-lib-vault-mobile'

import { createOrGetPearpassClient } from './createOrGetPearpassClient'

jest.mock('pearpass-lib-vault-mobile', () => ({
  PearpassVaultClient: jest.fn(),
  workletLogger: {
    setLogOutput: jest.fn()
  }
}))

describe('createOrGetPearpassClient', () => {
  const mockIpc = { send: jest.fn() }
  const mockStoragePath = '/mock/storage/path'
  const mockOpts = { debugMode: true }

  beforeEach(() => {
    jest.resetModules()
  })

  it('should instantiate PearpassVaultClient with correct arguments', () => {
    const client = createOrGetPearpassClient(mockIpc, mockStoragePath, mockOpts)

    expect(PearpassVaultClient).toHaveBeenCalledWith(
      mockIpc,
      mockStoragePath,
      mockOpts
    )
    expect(client).toBeInstanceOf(PearpassVaultClient)
  })

  it('should reuse the same instance if called multiple times', () => {
    const firstClient = createOrGetPearpassClient(
      mockIpc,
      mockStoragePath,
      mockOpts
    )
    const secondClient = createOrGetPearpassClient(
      mockIpc,
      mockStoragePath,
      mockOpts
    )

    expect(PearpassVaultClient).toHaveBeenCalledTimes(1)
    expect(secondClient).toBe(firstClient)
  })

  it('should pass default options if opts is not provided', () => {
    createOrGetPearpassClient(mockIpc, mockStoragePath, { debugMode: true })
    expect(PearpassVaultClient).toHaveBeenCalledWith(mockIpc, mockStoragePath, {
      debugMode: true
    })
  })

  it('should not re-instantiate after first call even with different opts', () => {
    const firstClient = createOrGetPearpassClient(mockIpc, mockStoragePath, {
      debugMode: false
    })
    const secondClient = createOrGetPearpassClient(mockIpc, mockStoragePath, {
      debugMode: true
    })

    expect(firstClient).toBe(secondClient)
    expect(PearpassVaultClient).toHaveBeenCalledTimes(1)
  })
})
