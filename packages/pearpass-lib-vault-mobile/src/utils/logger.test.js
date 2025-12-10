import { logger } from './logger'

describe('Logger', () => {
  let consoleErrorSpy

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should call console.error with the provided messages', () => {
    const messages = ['Error message 1', 'Error message 2']
    logger.error(...messages)

    expect(consoleErrorSpy).toHaveBeenCalledWith(messages)
  })

  it('should not modify the messages passed to console.error', () => {
    const messages = ['Error message']
    logger.error(...messages)

    expect(consoleErrorSpy).toHaveBeenCalledWith(messages)
    expect(messages).toEqual(['Error message'])
  })
})
