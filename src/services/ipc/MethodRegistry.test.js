import { MethodRegistry } from './MethodRegistry'
import { logger } from '../../utils/logger'

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
}))

describe('MethodRegistry', () => {
  let registry
  let mockClient
  let context

  beforeEach(() => {
    registry = new MethodRegistry()
    mockClient = {
      encryptionGetStatus: jest.fn(),
      vaultsGetStatus: jest.fn(),
      activeVaultGetStatus: jest.fn()
    }
    context = { client: mockClient }
    jest.clearAllMocks()
  })

  describe('execute', () => {
    it('should throw UnknownMethod for unregistered methods', async () => {
      await expect(
        registry.execute('unknownMethod', {}, context)
      ).rejects.toThrow('UnknownMethod: unknownMethod')
    })

    it('should execute registered methods', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true })
      registry.register('testMethod', handler)

      mockClient.vaultsGetStatus.mockResolvedValue({ status: true })

      const result = await registry.execute(
        'testMethod',
        { test: 'param' },
        context
      )

      expect(handler).toHaveBeenCalledWith({ test: 'param' })
      expect(result).toEqual({ success: true })
    })

    describe('authentication checks', () => {
      beforeEach(() => {
        const handler = jest.fn().mockResolvedValue({ success: true })
        registry.register('secureMethod', handler)
      })

      it('should check authentication for non-exempt methods', async () => {
        mockClient.vaultsGetStatus.mockResolvedValue({ status: false })

        await expect(
          registry.execute('secureMethod', {}, context)
        ).rejects.toThrow(
          'DesktopNotAuthenticated: Desktop app is not authenticated'
        )

        expect(mockClient.vaultsGetStatus).toHaveBeenCalled()
      })

      it('should allow access when authenticated', async () => {
        mockClient.vaultsGetStatus.mockResolvedValue({ status: true })

        const result = await registry.execute('secureMethod', {}, context)

        expect(result).toEqual({ success: true })
        expect(mockClient.vaultsGetStatus).toHaveBeenCalled()
      })

      it('should skip auth check for auth methods', async () => {
        const handler = jest.fn().mockResolvedValue({ success: true })
        registry.register('logIn', handler)

        // Don't mock vaultsGetStatus - it shouldn't be called

        const result = await registry.execute('logIn', {}, context)

        expect(result).toEqual({ success: true })
        expect(mockClient.vaultsGetStatus).not.toHaveBeenCalled()
      })

      it('should skip auth check for encryptionGet', async () => {
        const handler = jest.fn().mockResolvedValue({ key: 'testKey' })
        registry.register('encryptionGet', handler)

        // Don't mock vaultsGetStatus - it shouldn't be called

        const result = await registry.execute(
          'encryptionGet',
          { key: 'masterPassword' },
          context
        )

        expect(result).toEqual({ key: 'testKey' })
        expect(mockClient.vaultsGetStatus).not.toHaveBeenCalled()
      })

      it('should skip auth check for status methods', async () => {
        const handler = jest.fn().mockResolvedValue({ initialized: false })
        registry.register('vaultsGetStatus', handler)

        // Don't mock vaultsGetStatus - it shouldn't be called for status methods

        const result = await registry.execute('vaultsGetStatus', {}, context)

        expect(result).toEqual({ initialized: false })
        expect(mockClient.vaultsGetStatus).not.toHaveBeenCalled()
      })

      it('should skip auth check for pairing methods', async () => {
        const handler = jest.fn().mockResolvedValue({ identity: 'test' })
        registry.register('nmGetAppIdentity', handler)

        const result = await registry.execute('nmGetAppIdentity', {}, context)

        expect(result).toEqual({ identity: 'test' })
        expect(mockClient.vaultsGetStatus).not.toHaveBeenCalled()
      })

      it('should handle encryption status check errors', async () => {
        mockClient.vaultsGetStatus.mockRejectedValue(new Error('Network error'))

        await expect(
          registry.execute('secureMethod', {}, context)
        ).rejects.toThrow(
          'DesktopNotAuthenticated: Desktop app is not authenticated'
        )
      })
    })

    describe('status checks', () => {
      it('should perform configured status checks', async () => {
        const handler = jest.fn().mockResolvedValue({ success: true })
        registry.register('methodWithChecks', handler, {
          requiresStatus: ['encryption', 'vaults']
        })

        mockClient.encryptionGetStatus.mockResolvedValue({ initialized: true })
        mockClient.vaultsGetStatus.mockResolvedValue({ status: true })

        await registry.execute('methodWithChecks', {}, context)

        expect(mockClient.encryptionGetStatus).toHaveBeenCalledTimes(1) // Only for status check
        expect(mockClient.vaultsGetStatus).toHaveBeenCalledTimes(2) // Once for auth, once for status
      })
    })

    describe('logging', () => {
      it('should log debug messages when configured', async () => {
        const handler = jest.fn().mockResolvedValue({ result: 'data' })
        registry.register('debugMethod', handler, { logLevel: 'DEBUG' })

        mockClient.vaultsGetStatus.mockResolvedValue({ status: true })

        await registry.execute('debugMethod', { param: 'value' }, context)

        expect(logger.debug).toHaveBeenCalledWith(
          'METHOD-REGISTRY',
          expect.stringContaining('debugMethod')
        )
      })

      it('should log errors', async () => {
        const handler = jest.fn().mockRejectedValue(new Error('Handler error'))
        registry.register('errorMethod', handler)

        mockClient.vaultsGetStatus.mockResolvedValue({ status: true })

        await expect(
          registry.execute('errorMethod', {}, context)
        ).rejects.toThrow('Handler error')

        expect(logger.error).toHaveBeenCalledWith(
          'METHOD-REGISTRY',
          'Error in errorMethod: Handler error'
        )
      })
    })
  })

  describe('getMethodNames', () => {
    it('should return registered method names', () => {
      registry.register('method1', jest.fn())
      registry.register('method2', jest.fn())
      registry.register('method3', jest.fn())

      const names = registry.getMethodNames()

      expect(names).toContain('method1')
      expect(names).toContain('method2')
      expect(names).toContain('method3')
      expect(names).toHaveLength(3)
    })
  })

  describe('hasMethod', () => {
    it('should check if method is registered', () => {
      registry.register('existingMethod', jest.fn())

      expect(registry.hasMethod('existingMethod')).toBe(true)
      expect(registry.hasMethod('nonExistingMethod')).toBe(false)
    })
  })
})
