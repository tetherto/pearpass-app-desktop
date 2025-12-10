import { WorkletLogger } from './workletLogger'

describe('WorkletLogger', () => {
  let logger
  let mockOutput

  beforeEach(() => {
    logger = new WorkletLogger()
    mockOutput = jest.fn()
    logger.setLogOutput(mockOutput)
  })

  describe('setDebugMode', () => {
    it('should enable debug mode when called with true', () => {
      logger.setDebugMode(false) // Start with it disabled
      expect(logger.debugMode).toBe(false)

      logger.setDebugMode(true)
      expect(logger.debugMode).toBe(true)

      logger.log('test message')
      expect(mockOutput).toHaveBeenCalledWith(
        '[LOG] [BARE_RPC]',
        'test message'
      )
    })

    it('should disable debug mode when called with false', () => {
      logger.setDebugMode(true) // Start with it enabled
      expect(logger.debugMode).toBe(true)

      logger.setDebugMode(false)
      expect(logger.debugMode).toBe(false)

      logger.log('test message')
      expect(mockOutput).not.toHaveBeenCalled()
    })
  })
})
