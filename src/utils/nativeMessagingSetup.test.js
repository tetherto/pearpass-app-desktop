import child_process from 'child_process'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

import {
  setupNativeMessaging,
  getNativeHostExecutableInfo,
  generateNativeHostExecutable,
  getNativeMessagingLocations,
  cleanupNativeMessaging,
  killNativeMessagingHostProcesses
} from './nativeMessagingSetup'

// Mock dependencies
jest.mock('os')
jest.mock('fs/promises')
jest.mock('path')
jest.mock('child_process')
jest.mock('./logger', () => ({
  logger: {
    log: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  }
}))

// Mock Pear global
global.Pear = {
  config: {
    storage: '/mock/storage'
  }
}

// Helper to reset mocks
const resetMocks = () => {
  jest.clearAllMocks()
  os.platform.mockReturnValue('linux')
  os.homedir.mockReturnValue('/home/testuser')
  os.arch.mockReturnValue('x64')
  path.join.mockImplementation((...args) => args.join('/'))
  path.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/'))
  fs.mkdir.mockResolvedValue()
  fs.writeFile.mockResolvedValue()
  fs.chmod.mockResolvedValue()
  fs.unlink.mockResolvedValue()
}

describe('getNativeHostExecutableInfo', () => {
  beforeEach(resetMocks)

  it('should return correct info for macOS', () => {
    os.platform.mockReturnValue('darwin')
    const info = getNativeHostExecutableInfo()
    expect(info.platform).toBe('darwin')
    expect(info.executableFileName).toBe('pearpass-native-host.sh')
    expect(info.executablePath).toContain('native-messaging')
  })

  it('should return correct info for Linux', () => {
    os.platform.mockReturnValue('linux')
    const info = getNativeHostExecutableInfo()
    expect(info.platform).toBe('linux')
    expect(info.executableFileName).toBe('pearpass-native-host.sh')
    expect(info.executablePath).toContain('native-messaging')
  })

  it('should return correct info for Windows', () => {
    os.platform.mockReturnValue('win32')
    const info = getNativeHostExecutableInfo()
    expect(info.platform).toBe('win32')
    expect(info.executableFileName).toBe('pearpass-native-host.cmd')
    expect(info.executablePath).toContain('native-messaging')
  })

  it('should throw error for unsupported platform', () => {
    os.platform.mockReturnValue('freebsd')
    expect(() => getNativeHostExecutableInfo()).toThrow(
      'Unsupported platform: freebsd'
    )
  })
})

describe('generateNativeHostExecutable', () => {
  beforeEach(resetMocks)

  it('should generate executable for macOS', async () => {
    os.platform.mockReturnValue('darwin')
    const result = await generateNativeHostExecutable(
      '/mock/path/pearpass-native-host.sh'
    )
    expect(result.success).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).toHaveBeenCalledWith(
      '/mock/path/pearpass-native-host.sh',
      0o755
    )
    const writeCall = fs.writeFile.mock.calls[0]
    expect(writeCall[1]).toContain('#!/bin/bash')
    expect(writeCall[1]).toContain('pear-runtime')
  })

  it('should generate executable for Linux', async () => {
    os.platform.mockReturnValue('linux')
    const result = await generateNativeHostExecutable(
      '/mock/path/pearpass-native-host.sh'
    )
    expect(result.success).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).toHaveBeenCalledWith(
      '/mock/path/pearpass-native-host.sh',
      0o755
    )
    const writeCall = fs.writeFile.mock.calls[0]
    expect(writeCall[1]).toContain('#!/bin/bash')
    expect(writeCall[1]).toContain('.config/pear')
  })

  it('should generate executable for Windows', async () => {
    os.platform.mockReturnValue('win32')
    const result = await generateNativeHostExecutable(
      'C:/mock/path/pearpass-native-host.cmd'
    )
    expect(result.success).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).not.toHaveBeenCalled()
    const writeCall = fs.writeFile.mock.calls[0]
    expect(writeCall[1]).toContain('@echo off')
    expect(writeCall[1]).toContain('pear-runtime.exe')
  })

  it('should handle write errors', async () => {
    fs.writeFile.mockRejectedValueOnce(new Error('write failed'))
    const result = await generateNativeHostExecutable('/mock/path/script.sh')
    expect(result.success).toBe(false)
    expect(result.message).toContain('Failed to generate executable')
  })

  it('should throw error for unsupported platform', async () => {
    os.platform.mockReturnValue('aix')
    const result = await generateNativeHostExecutable('/mock/path/script.sh')
    expect(result.success).toBe(false)
    expect(result.message).toContain('Unsupported platform')
  })
})

describe('getNativeMessagingLocations', () => {
  beforeEach(resetMocks)

  it('should return correct paths for macOS', () => {
    os.platform.mockReturnValue('darwin')
    const locations = getNativeMessagingLocations()
    expect(locations.platform).toBe('darwin')
    expect(locations.manifestPaths).toHaveLength(2)
    expect(locations.manifestPaths[0]).toContain('Google/Chrome')
    expect(locations.manifestPaths[1]).toContain('Microsoft Edge')
    expect(locations.registryKeys).toHaveLength(0)
  })

  it('should return correct paths for Linux', () => {
    os.platform.mockReturnValue('linux')
    const locations = getNativeMessagingLocations()
    expect(locations.platform).toBe('linux')
    expect(locations.manifestPaths).toHaveLength(3)
    expect(locations.manifestPaths[0]).toContain('google-chrome')
    expect(locations.manifestPaths[1]).toContain('chromium')
    expect(locations.manifestPaths[2]).toContain('microsoft-edge')
    expect(locations.registryKeys).toHaveLength(0)
  })

  it('should return correct paths and registry keys for Windows', () => {
    os.platform.mockReturnValue('win32')
    const locations = getNativeMessagingLocations()
    expect(locations.platform).toBe('win32')
    expect(locations.manifestPaths).toHaveLength(1)
    expect(locations.manifestPaths[0]).toContain('PearPass/NativeMessaging')
    expect(locations.registryKeys).toHaveLength(2)
    expect(locations.registryKeys[0]).toContain('Google\\Chrome')
    expect(locations.registryKeys[1]).toContain('Microsoft\\Edge')
  })

  it('should throw error for unsupported platform', () => {
    os.platform.mockReturnValue('solaris')
    expect(() => getNativeMessagingLocations()).toThrow(
      'Unsupported platform: solaris'
    )
  })
})

describe('cleanupNativeMessaging', () => {
  beforeEach(resetMocks)

  it('should remove manifest files on Linux', async () => {
    os.platform.mockReturnValue('linux')
    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toContain('Removed 3 manifest file')
    expect(fs.unlink).toHaveBeenCalledTimes(3)
  })

  it('should remove manifest files on macOS', async () => {
    os.platform.mockReturnValue('darwin')
    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toContain('Removed 2 manifest file')
    expect(fs.unlink).toHaveBeenCalledTimes(2)
  })

  it('should remove manifest files and registry keys on Windows', async () => {
    os.platform.mockReturnValue('win32')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toContain('Removed 1 manifest file')
    expect(fs.unlink).toHaveBeenCalledTimes(1)
    expect(execMock).toHaveBeenCalledTimes(2)
  })

  it('should handle ENOENT errors gracefully', async () => {
    const enoentError = new Error('file not found')
    enoentError.code = 'ENOENT'
    fs.unlink.mockRejectedValue(enoentError)

    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toContain('No native messaging manifest files found')
  })

  it('should handle non-ENOENT errors', async () => {
    const permissionError = new Error('permission denied')
    permissionError.code = 'EACCES'
    fs.unlink.mockRejectedValueOnce(permissionError)

    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
  })

  it('should handle general errors', async () => {
    os.platform.mockImplementation(() => {
      throw new Error('platform error')
    })

    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(false)
    expect(result.message).toContain('Failed to cleanup native messaging')
  })
})

describe('killNativeMessagingHostProcesses', () => {
  beforeEach(resetMocks)

  it('should kill processes on Linux', async () => {
    os.platform.mockReturnValue('linux')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    await killNativeMessagingHostProcesses()
    expect(execMock).toHaveBeenCalledTimes(1)
    const cmd = execMock.mock.calls[0][0]
    expect(cmd).toContain('pkill -f')
    expect(cmd).toContain(
      'pear://dk6mimfj5n1a7cp8szwiq41kjpqhj5gwkdnrzyx7jbgiuny4azpo'
    )
  })

  it('should kill processes on macOS', async () => {
    os.platform.mockReturnValue('darwin')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    await killNativeMessagingHostProcesses()
    expect(execMock).toHaveBeenCalledTimes(1)
    const cmd = execMock.mock.calls[0][0]
    expect(cmd).toContain('pkill -f')
  })

  it('should kill processes on Windows', async () => {
    os.platform.mockReturnValue('win32')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    await killNativeMessagingHostProcesses()
    expect(execMock).toHaveBeenCalledTimes(1)
    const cmd = execMock.mock.calls[0][0]
    expect(cmd).toContain('powershell')
    expect(cmd).toContain('taskkill')
  })

  it('should handle no processes found on Unix', async () => {
    os.platform.mockReturnValue('linux')
    const execMock = jest.fn((cmd, cb) => cb(new Error('no process found')))
    child_process.exec.mockImplementation(execMock)

    await killNativeMessagingHostProcesses()
    expect(execMock).toHaveBeenCalled()
  })

  it('should handle no processes found on Windows', async () => {
    os.platform.mockReturnValue('win32')
    const execMock = jest.fn((cmd, cb) => cb(new Error('no process found')))
    child_process.exec.mockImplementation(execMock)

    await killNativeMessagingHostProcesses()
    expect(execMock).toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    os.platform.mockImplementation(() => {
      throw new Error('unexpected error')
    })

    await expect(killNativeMessagingHostProcesses()).resolves.not.toThrow()
  })
})

describe('setupNativeMessaging', () => {
  beforeEach(resetMocks)

  it('should succeed on linux and write manifest files', async () => {
    const result = await setupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toMatch(
      /Native messaging host installed successfully/
    )
    expect(fs.mkdir).toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).toHaveBeenCalled()
  })

  it('should succeed on macOS and write manifest files', async () => {
    os.platform.mockReturnValue('darwin')
    const result = await setupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toMatch(
      /Native messaging host installed successfully/
    )
    expect(fs.mkdir).toHaveBeenCalled()
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).toHaveBeenCalled()
  })

  it('should handle unsupported platforms', async () => {
    os.platform.mockReturnValue('unknown')
    const result = await setupNativeMessaging()
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Unsupported platform/)
  })

  it('should handle manifest write errors gracefully', async () => {
    fs.writeFile.mockRejectedValueOnce(new Error('write failed'))
    const result = await setupNativeMessaging()
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Failed to setup native messaging/)
  })

  it('should handle script creation errors', async () => {
    fs.writeFile.mockRejectedValueOnce(new Error('script write failed'))
    const result = await setupNativeMessaging()
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Failed to setup native messaging/)
  })

  it('should setup registry keys on win32', async () => {
    os.platform.mockReturnValue('win32')
    os.homedir.mockReturnValue('C:/Users/testuser')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    const result = await setupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toMatch(
      /Native messaging host installed successfully/
    )
    expect(execMock).toHaveBeenCalledTimes(2)
  })

  it('should continue on partial manifest write failures', async () => {
    fs.writeFile
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('write failed'))
      .mockResolvedValueOnce()

    const result = await setupNativeMessaging()
    expect(result.success).toBe(true)
  })
})
