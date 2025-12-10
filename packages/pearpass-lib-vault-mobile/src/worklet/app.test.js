import { rpc } from './app'
import { workletLogger } from './utils/workletLogger'

jest.mock('./utils/workletLogger', () => ({
  workletLogger: {
    error: jest.fn()
  }
}))

jest.mock('./appCore.js', () => ({
  setupIPC: jest.fn(),
  createRPC: jest.fn()
}))

describe('app.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export rpc as undefined initially', () => {
    expect(rpc).toBeUndefined()
  })

  it('should initialize rpc successfully', async () => {
    await jest.isolateModulesAsync(async () => {
      const { setupIPC, createRPC } = await import('./appCore.js')
      const mockIPC = { send: jest.fn() }
      const mockRPC = { call: jest.fn() }

      setupIPC.mockReturnValue(mockIPC)
      createRPC.mockReturnValue(mockRPC)

      // Trigger app initialization by importing the module
      await import('./app')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(setupIPC).toHaveBeenCalled()
      expect(createRPC).toHaveBeenCalledWith(mockIPC)
    })
  })

  it('should log error when initialization fails', async () => {
    await jest.isolateModulesAsync(async () => {
      const mockError = new Error('Initialization failed')
      const { setupIPC } = await import('./appCore.js')

      setupIPC.mockImplementation(() => {
        throw mockError
      })

      // Trigger app initialization by importing the module
      await import('./app')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(workletLogger.error).toHaveBeenCalledWith(
        'Fatal error in app initialization:',
        expect.any(Error)
      )
    })
  })

  it('should handle import failure gracefully', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('./appCore.js', () => {
        throw new Error('Import failed')
      })

      await import('./app')
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(workletLogger.error).toHaveBeenCalled()
    })
  })
})
