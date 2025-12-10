import fs from 'bare-fs'
import path from 'bare-path'

jest.mock('bare-fs')
jest.mock('bare-path')

// We need to control DEBUG_MODE per test
let mockDebugMode = false
jest.mock('../constants/debugMode', () => ({
  get DEBUG_MODE() {
    return mockDebugMode
  }
}))

// Import log after mocking is set up
import { log } from './log'

describe('log', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockDebugMode = false // Reset to false by default
    // Reset __dirname for path.dirname
    global.__dirname =
      '/Users/torkinos-m4/work/tether/pearpass/pearpass-lib-native-messaging-bridge/src/utils'
    // Mock path methods - dirname should return parent directory
    path.dirname.mockReturnValue(
      '/Users/torkinos-m4/work/tether/pearpass/pearpass-lib-native-messaging-bridge/src'
    )
    path.join.mockImplementation((...args) => args.join('/'))
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('does nothing when DEBUG_MODE is false', () => {
    log('INFO', 'Test message')
    expect(fs.existsSync).not.toHaveBeenCalled()
    expect(fs.mkdirSync).not.toHaveBeenCalled()
    expect(fs.appendFileSync).not.toHaveBeenCalled()
  })

  it('writes log when DEBUG_MODE is true', () => {
    // Enable DEBUG_MODE for this test
    mockDebugMode = true
    fs.existsSync.mockReturnValue(false)

    log('DEBUG', 'Debug message test')

    const expectedLogDir =
      '/Users/torkinos-m4/work/tether/pearpass/pearpass-lib-native-messaging-bridge/src/logs'
    const expectedLogFile = `${expectedLogDir}/native-messaging-bridge.log`

    expect(fs.existsSync).toHaveBeenCalledWith(expectedLogDir)
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedLogDir, {
      recursive: true
    })
    expect(fs.appendFileSync).toHaveBeenCalled()
    const logArgs = fs.appendFileSync.mock.calls[0]
    expect(logArgs[0]).toBe(expectedLogFile)
    expect(logArgs[1]).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z \[DEBUG\] \[IPC-BRIDGE\] Debug message test\n/
    )
  })

  it('handles errors gracefully', () => {
    // Enable DEBUG_MODE for this test
    mockDebugMode = true
    jest.spyOn(console, 'error').mockImplementation(() => {})
    fs.existsSync.mockImplementation(() => {
      throw new Error('fs error')
    })

    log('WARN', 'Error test')

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to write log: fs error')
    )
    console.error.mockRestore()
  })
})
