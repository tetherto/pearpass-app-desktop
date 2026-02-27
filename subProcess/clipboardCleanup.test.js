import { EventEmitter } from 'events'

// Mock all bare-* modules and dependencies BEFORE importing the module under test
// Jest hoists these mocks automatically
jest.mock('bare-os', () => ({
  platform: jest.fn(),
  tmpdir: jest.fn(() => '/tmp')
}))
jest.mock('bare-fs', () => ({
  writeFileSync: jest.fn()
}))
jest.mock('bare-path', () => ({
  join: jest.fn((...args) => args.join('/'))
}))
jest.mock('bare-subprocess', () => ({
  spawn: jest.fn(),
  spawnSync: jest.fn()
}))
jest.mock('pearpass-lib-constants', () => ({
  CLIPBOARD_CLEAR_TIMEOUT: 1000
}))
jest.mock('../src/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

// Mock linuxClipboard — the Linux branch delegates to these async helpers
const mockReadLinuxClipboard = jest.fn()
const mockWriteLinuxClipboard = jest.fn()
jest.mock('./linuxClipboard.js', () => ({
  readLinuxClipboard: (...args) => mockReadLinuxClipboard(...args),
  writeLinuxClipboard: (...args) => mockWriteLinuxClipboard(...args)
}))

// Now import after mocks are set up
import os from 'bare-os'
import { spawn } from 'bare-subprocess'

import * as clipboardCleanup from './clipboardCleanup'

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
      { stdio: ['pipe', 'pipe', 'pipe'] }
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

    expect(spawn).toHaveBeenCalledWith('/usr/bin/pbpaste', [], {
      stdio: ['pipe', 'pipe', 'pipe']
    })
    expect(result).toBe('mac content')
  })

  it('should get clipboard content on Linux using readLinuxClipboard', async () => {
    os.platform.mockReturnValue('linux')

    // readLinuxClipboard returns a child process (asynchronously)
    const linuxChildProcess = new EventEmitter()
    linuxChildProcess.stdout = new EventEmitter()
    linuxChildProcess.stdin = { end: jest.fn() }
    mockReadLinuxClipboard.mockResolvedValue(linuxChildProcess)

    const promise = clipboardCleanup.getClipboardContent()

    // Allow the async readLinuxClipboard to resolve and collectOutput to attach listeners
    await new Promise((r) => setTimeout(r, 0))

    // Simulate data
    linuxChildProcess.stdout.emit('data', Buffer.from('linux content'))
    linuxChildProcess.emit('exit', 0)

    const result = await promise

    expect(mockReadLinuxClipboard).toHaveBeenCalled()
    expect(result).toBe('linux content')
  })

  it('should return empty string on Linux if readLinuxClipboard throws', async () => {
    os.platform.mockReturnValue('linux')

    // Simulate no clipboard tool available
    mockReadLinuxClipboard.mockRejectedValue(
      new Error('No clipboard tool available (xsel, xclip, or bundled binary)')
    )

    const result = await clipboardCleanup.getClipboardContent()

    expect(mockReadLinuxClipboard).toHaveBeenCalled()
    expect(result).toBe('')
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
