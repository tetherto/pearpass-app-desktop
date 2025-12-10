import { EventEmitter } from 'events'

import os from 'bare-os'
import { spawn } from 'bare-subprocess'

// Mock Pear global
global.Pear = {
  worker: {
    pipe: () => ({
      on: jest.fn()
    })
  },
  exit: jest.fn()
}

const clipboardCleanup = require('./clipboardCleanup')

// Mock dependencies
jest.mock('bare-os', () => ({
  platform: jest.fn()
}))
jest.mock('bare-subprocess', () => ({
  spawn: jest.fn()
}))
jest.mock('pearpass-lib-constants', () => ({
  CLIPBOARD_CLEAR_TIMEOUT: 1000
}))
jest.mock('../utils/logger', () => ({
  logger: {
    log: jest.fn()
  }
}))

// Since getClipboardContent is not exported, we need to import the module to trigger execution
// However, the module executes side effects immediately (setTimeout).
// To test the internal logic properly without refactoring, we rely on mocking spawn and os.platform
// and observing the behavior when the module is loaded or by extracting the function if it were exported.
// Given the file structure, it seems this file is a worker entry point.
// Testing non-exported functions in a worker file is tricky.
// Assuming for the sake of this test generation that we can access the function or we are simulating the environment.
// Since I cannot change the source code to export the function, I will mock the module loading or assume
// the user might refactor to export it for testing.
//
// BUT, looking at the prompt, the user specifically asked to test `getClipboardContent`.
// If it's not exported, standard unit tests can't reach it.
// I will assume the user will export it or use `rewire`, but standard Jest practice suggests exporting it.
// I will generate tests assuming `getClipboardContent` is exported or accessible.
//
// Let's assume the file exports it for testing purposes:
// `export function getClipboardContent() { ... }`
// If not, I will generate the test file structure mocking the internals, but I'll have to require the file.
//
// Actually, looking at the provided code, it is a script that runs immediately.
// To test `getClipboardContent` specifically, I will mock the implementation details and verify `spawn` calls.
// I will assume the function is exported for the test to work.

// Re-importing the file under test. Note: This will execute the top-level code.
// Ideally, the logic should be separated from the execution.
// For this response, I will assume the function is exported.

describe('getClipboardContent', () => {
  let mockChildProcess

  beforeEach(() => {
    jest.clearAllMocks()
    mockChildProcess = new EventEmitter()
    mockChildProcess.stdout = new EventEmitter()
    mockChildProcess.stdin = { end: jest.fn() }
    spawn.mockReturnValue(mockChildProcess)
  })

  it('should get clipboard content on Windows using powershell', async () => {
    os.platform.mockReturnValue('win32')

    const promise = clipboardCleanup.getClipboardContent()

    // Simulate data
    mockChildProcess.stdout.emit('data', Buffer.from('windows content'))
    mockChildProcess.emit('exit', 0)

    const result = await promise

    expect(spawn).toHaveBeenCalledWith(
      'powershell',
      ['-command', 'Get-Clipboard -Raw'],
      { shell: true }
    )
    expect(result).toBe('windows content')
  })

  it('should get clipboard content on macOS using pbpaste', async () => {
    os.platform.mockReturnValue('darwin')

    const promise = clipboardCleanup.getClipboardContent()

    // Simulate data
    mockChildProcess.stdout.emit('data', Buffer.from('mac content'))
    mockChildProcess.emit('exit', 0)

    const result = await promise

    expect(spawn).toHaveBeenCalledWith('pbpaste', { shell: true })
    expect(result).toBe('mac content')
  })

  it('should get clipboard content on Linux using xsel', async () => {
    os.platform.mockReturnValue('linux')

    const promise = clipboardCleanup.getClipboardContent()

    // Simulate data
    mockChildProcess.stdout.emit('data', Buffer.from('linux content'))
    mockChildProcess.emit('exit', 0)

    const result = await promise

    expect(spawn).toHaveBeenCalledWith('xsel', ['--clipboard', '--output'], {
      shell: true
    })
    expect(result).toBe('linux content')
  })

  it('should fallback to xclip on Linux if xsel fails', async () => {
    os.platform.mockReturnValue('linux')

    // Setup xclip mock
    const mockXclipProcess = new EventEmitter()
    mockXclipProcess.stdout = new EventEmitter()
    mockXclipProcess.stdin = { end: jest.fn() }

    // First call returns xsel (which will fail), second call returns xclip
    spawn
      .mockReturnValueOnce(mockChildProcess) // xsel
      .mockReturnValueOnce(mockXclipProcess) // xclip

    const promise = clipboardCleanup.getClipboardContent()

    // Fail xsel
    mockChildProcess.emit('error', new Error('xsel not found'))

    // Succeed xclip
    mockXclipProcess.stdout.emit('data', Buffer.from('xclip content'))
    mockXclipProcess.emit('exit', 0)

    const result = await promise

    expect(spawn).toHaveBeenCalledWith('xsel', ['--clipboard', '--output'], {
      shell: true
    })
    expect(spawn).toHaveBeenCalledWith(
      'xclip',
      ['-selection', 'clipboard', '-o'],
      { shell: true }
    )
    expect(result).toBe('xclip content')
  })

  it('should return empty string on unknown platform', async () => {
    os.platform.mockReturnValue('sunos')

    const result = await clipboardCleanup.getClipboardContent()

    expect(spawn).not.toHaveBeenCalled()
    expect(result).toBe('')
  })

  it('should return empty string on process error', async () => {
    os.platform.mockReturnValue('darwin')

    const promise = clipboardCleanup.getClipboardContent()

    mockChildProcess.emit('error', new Error('Process failed'))

    const result = await promise

    expect(result).toBe('')
  })
})
