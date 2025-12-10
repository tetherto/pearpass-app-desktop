import { logger } from './logger'

globalThis.Pear = {
  config: { tier: 'dev' }
}

describe('Logger.log', () => {
  let originalDebugMode
  let consoleLogSpy

  beforeEach(() => {
    // Save and set debugMode to true for testing
    originalDebugMode = logger.debugMode
    logger.debugMode = true
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    logger.debugMode = originalDebugMode
    consoleLogSpy.mockRestore()
  })

  it('should call console.log with correct format and message', () => {
    const component = 'TestComponent'
    const message = 'Hello World'
    logger.log(component, message)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    const [formatted, msg] = consoleLogSpy.mock.calls[0]
    expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}T.* \[LOG\] \[TestComponent\]/)
    expect(msg).toBe(message)
  })

  it('should not log if debugMode is false', () => {
    logger.debugMode = false
    logger.log('TestComponent', 'Should not log')
    expect(consoleLogSpy).not.toHaveBeenCalled()
  })

  it('should pass multiple arguments as message array', () => {
    logger.log('MultiArg', 'one', 'two', 'three')
    const [, msg] = consoleLogSpy.mock.calls[0]
    expect(msg).toEqual('one')
  })
})
