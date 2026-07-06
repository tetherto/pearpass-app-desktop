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
jest.mock('@tetherto/pearpass-lib-constants', () => ({
  MANIFEST_NAME: 'com.pearpass.native_messaging',
  CHROMIUM_EXTENSION_ID: 'mock-extension-id',
  FIREFOX_EXTENSION_ID: 'pearpass@example.com'
}))
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

const MOCK_USER_DATA_PATH = '/mock/userData'
const MOCK_EXEC_PATH = '/mock/electron/PearPass'
const MOCK_BRIDGE_PATH = '/mock/dist/native-messaging-bridge.bundle.cjs'

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
  fs.access.mockResolvedValue()
}

describe('getNativeHostExecutableInfo', () => {
  beforeEach(resetMocks)

  it('should return correct info for macOS', () => {
    os.platform.mockReturnValue('darwin')
    const info = getNativeHostExecutableInfo(MOCK_USER_DATA_PATH)
    expect(info.platform).toBe('darwin')
    expect(info.executableFileName).toBe('pearpass-native-host.sh')
    expect(info.executablePath).toContain('native-messaging')
  })

  it('should return correct info for Linux', () => {
    os.platform.mockReturnValue('linux')
    const info = getNativeHostExecutableInfo(MOCK_USER_DATA_PATH)
    expect(info.platform).toBe('linux')
    expect(info.executableFileName).toBe('pearpass-native-host.sh')
    expect(info.executablePath).toContain('native-messaging')
  })

  it('should return correct info for Windows', () => {
    os.platform.mockReturnValue('win32')
    const info = getNativeHostExecutableInfo(MOCK_USER_DATA_PATH)
    expect(info.platform).toBe('win32')
    expect(info.executableFileName).toBe('pearpass-native-host.cmd')
    expect(info.executablePath).toContain('native-messaging')
  })

  it('should throw error for unsupported platform', () => {
    os.platform.mockReturnValue('freebsd')
    expect(() => getNativeHostExecutableInfo(MOCK_USER_DATA_PATH)).toThrow(
      'Unsupported platform: freebsd'
    )
  })
})

describe('generateNativeHostExecutable', () => {
  beforeEach(resetMocks)

  it('should generate executable for macOS', async () => {
    os.platform.mockReturnValue('darwin')
    const result = await generateNativeHostExecutable(
      '/mock/path/pearpass-native-host.sh',
      MOCK_EXEC_PATH,
      MOCK_BRIDGE_PATH
    )
    expect(result.success).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).toHaveBeenCalledWith(
      '/mock/path/pearpass-native-host.sh',
      0o755
    )
    const writeCall = fs.writeFile.mock.calls[0]
    expect(writeCall[1]).toContain('#!/bin/bash')
    expect(writeCall[1]).toContain('ELECTRON_RUN_AS_NODE=1')
    expect(writeCall[1]).toContain(MOCK_EXEC_PATH)
    expect(writeCall[1]).toContain(MOCK_BRIDGE_PATH)
  })

  it('should generate executable for Linux', async () => {
    os.platform.mockReturnValue('linux')
    const result = await generateNativeHostExecutable(
      '/mock/path/pearpass-native-host.sh',
      MOCK_EXEC_PATH,
      MOCK_BRIDGE_PATH
    )
    expect(result.success).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).toHaveBeenCalledWith(
      '/mock/path/pearpass-native-host.sh',
      0o755
    )
    const writeCall = fs.writeFile.mock.calls[0]
    expect(writeCall[1]).toContain('#!/bin/bash')
    expect(writeCall[1]).toContain('ELECTRON_RUN_AS_NODE=1')
    expect(writeCall[1]).toContain(MOCK_EXEC_PATH)
  })

  it('should generate executable for Windows', async () => {
    os.platform.mockReturnValue('win32')
    const result = await generateNativeHostExecutable(
      'C:/mock/path/pearpass-native-host.cmd',
      MOCK_EXEC_PATH,
      MOCK_BRIDGE_PATH
    )
    expect(result.success).toBe(true)
    expect(fs.writeFile).toHaveBeenCalled()
    expect(fs.chmod).not.toHaveBeenCalled()
    const writeCall = fs.writeFile.mock.calls[0]
    expect(writeCall[1]).toContain('@echo off')
    expect(writeCall[1]).toContain('ELECTRON_RUN_AS_NODE=1')
    expect(writeCall[1]).toContain(MOCK_EXEC_PATH)
  })

  it('should handle write errors', async () => {
    fs.writeFile.mockRejectedValueOnce(new Error('write failed'))
    const result = await generateNativeHostExecutable(
      '/mock/path/script.sh',
      MOCK_EXEC_PATH,
      MOCK_BRIDGE_PATH
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('Failed to generate executable')
  })

  it('should throw error for unsupported platform', async () => {
    os.platform.mockReturnValue('aix')
    const result = await generateNativeHostExecutable(
      '/mock/path/script.sh',
      MOCK_EXEC_PATH,
      MOCK_BRIDGE_PATH
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain('Unsupported platform')
  })
})

describe('getNativeMessagingLocations', () => {
  beforeEach(resetMocks)

  it('should return correct browser entries for macOS', () => {
    os.platform.mockReturnValue('darwin')
    const { browsers } = getNativeMessagingLocations()
    expect(browsers).toHaveLength(5)
    expect(browsers[0].name).toBe('Google Chrome')
    expect(browsers[0].manifestPath).toContain('Google/Chrome')
    expect(browsers[0].browserDir).toContain('Google/Chrome')
    expect(browsers[1].name).toBe('Microsoft Edge')
    expect(browsers[1].manifestPath).toContain('Microsoft Edge')
    expect(browsers[2].name).toBe('Chromium')
    expect(browsers[2].manifestPath).toContain('Chromium')
    expect(browsers[3].name).toBe('Brave')
    expect(browsers[3].manifestPath).toContain('BraveSoftware/Brave-Browser')
    expect(browsers[4].name).toBe('Firefox')
    expect(browsers[4].manifestPath).toContain('Mozilla')
  })

  it('should return correct browser entries for Linux including snap', () => {
    os.platform.mockReturnValue('linux')
    const { browsers } = getNativeMessagingLocations()
    expect(browsers).toHaveLength(9)
    expect(browsers[0].name).toBe('Google Chrome')
    expect(browsers[0].manifestPath).toContain('google-chrome')
    expect(browsers[0].browserDir).toBeNull()
    expect(browsers[1].name).toBe('Chromium')
    expect(browsers[1].manifestPath).toContain('.config/chromium')
    expect(browsers[2].name).toBe('Microsoft Edge')
    expect(browsers[2].manifestPath).toContain('microsoft-edge')
    expect(browsers[3].name).toBe('Chromium (Snap)')
    expect(browsers[3].manifestPath).toContain('snap/chromium')
    expect(browsers[3].browserDir).toBeNull()
    expect(browsers[4].name).toBe('Brave')
    expect(browsers[4].manifestPath).toContain('BraveSoftware/Brave-Browser')
    expect(browsers[5].name).toBe('Brave (Snap)')
    expect(browsers[5].manifestPath).toContain('snap/brave/current')
    expect(browsers[6].name).toBe('Brave (Flatpak)')
    expect(browsers[6].manifestPath).toContain(
      '.var/app/com.brave.Browser/config/BraveSoftware/Brave-Browser'
    )
    expect(browsers[6].flatpakBrowserWrapperPath).toContain(
      '.var/app/com.brave.Browser/data/bin/pearpass-wrapper.sh'
    )
    expect(browsers[7].name).toBe('Firefox')
    expect(browsers[7].manifestPath).toContain(
      '.mozilla/native-messaging-hosts'
    )
    expect(browsers[8].name).toBe('Firefox (Snap)')
    expect(browsers[8].manifestPath).toContain(
      'snap/firefox/common/.mozilla/native-messaging-hosts'
    )
    expect(browsers[8].browserDir).toBeNull()
  })

  it('should return correct browser entries with registry keys for Windows', () => {
    os.platform.mockReturnValue('win32')
    const { browsers } = getNativeMessagingLocations()
    expect(browsers).toHaveLength(5)
    expect(browsers[0].browserDir).toBeNull()
    expect(browsers[0].manifestPath).toContain('PearPass/NativeMessaging')
    expect(browsers[0].registryKey).toContain('Google\\Chrome')
    expect(browsers[1].registryKey).toContain('Microsoft\\Edge')
    expect(browsers[2].registryKey).toContain('Chromium')
    expect(browsers[3].registryKey).toContain('BraveSoftware\\Brave-Browser')
    expect(browsers[4].registryKey).toContain('Mozilla\\NativeMessagingHosts')
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
    expect(result.message).toContain('Removed 9 manifest file')
    expect(fs.unlink).toHaveBeenCalledTimes(9)
  })

  it('should remove manifest files on macOS', async () => {
    os.platform.mockReturnValue('darwin')
    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toContain('Removed 5 manifest file')
    expect(fs.unlink).toHaveBeenCalledTimes(5)
  })

  it('should remove manifest files and registry keys on Windows', async () => {
    os.platform.mockReturnValue('win32')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    const result = await cleanupNativeMessaging()
    expect(result.success).toBe(true)
    expect(result.message).toContain('Removed 2 manifest file')
    expect(fs.unlink).toHaveBeenCalledTimes(2)
    expect(execMock).toHaveBeenCalledTimes(5)
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
    expect(cmd).toContain('pearpass-lib-native-messaging-bridge')
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
    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
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
    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
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
    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Unsupported platform/)
  })

  it('should handle manifest write errors gracefully', async () => {
    fs.writeFile.mockRejectedValueOnce(new Error('write failed'))
    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Failed to setup native messaging/)
  })

  it('should handle script creation errors', async () => {
    fs.writeFile.mockRejectedValueOnce(new Error('script write failed'))
    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Failed to setup native messaging/)
  })

  it('should setup registry keys on win32', async () => {
    os.platform.mockReturnValue('win32')
    os.homedir.mockReturnValue('C:/Users/testuser')
    const execMock = jest.fn((cmd, cb) => cb(null, ''))
    child_process.exec.mockImplementation(execMock)

    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
    expect(result.success).toBe(true)
    expect(result.message).toMatch(
      /Native messaging host installed successfully/
    )
    expect(execMock).toHaveBeenCalledTimes(5)
  })

  it('should continue on partial manifest write failures', async () => {
    // First writeFile call is for the executable wrapper, then one per browser
    fs.writeFile
      .mockResolvedValueOnce() // executable
      .mockResolvedValueOnce() // first browser
      .mockRejectedValueOnce(new Error('write failed')) // second browser fails
      .mockResolvedValueOnce() // third browser

    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
    expect(result.success).toBe(true)
  })

  it('should skip browsers whose directory does not exist', async () => {
    os.platform.mockReturnValue('linux')

    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })
    expect(result.success).toBe(true)
    // Linux installs always write: 1 executable + 9 browser manifests
    // + the Brave Flatpak wrapper.
    expect(fs.writeFile).toHaveBeenCalledTimes(11)
  })

  it('writes a Flatpak-aware wrapper for Brave Flatpak', async () => {
    os.platform.mockReturnValue('linux')

    const result = await setupNativeMessaging({
      userDataPath: MOCK_USER_DATA_PATH,
      execPath: MOCK_EXEC_PATH,
      bridgePath: MOCK_BRIDGE_PATH
    })

    expect(result.success).toBe(true)

    const flatpakWrapperWrite = fs.writeFile.mock.calls.find(([target]) =>
      target.includes('.var/app/com.brave.Browser/data/bin/pearpass-wrapper.sh')
    )
    expect(flatpakWrapperWrite).toBeDefined()
    expect(flatpakWrapperWrite[1]).toContain('flatpak-spawn --host')
    expect(flatpakWrapperWrite[1]).toContain(MOCK_EXEC_PATH)
    expect(flatpakWrapperWrite[1]).toContain(MOCK_BRIDGE_PATH)
    expect(fs.chmod).toHaveBeenCalledWith(flatpakWrapperWrite[0], 0o755)

    const flatpakManifestWrite = fs.writeFile.mock.calls.find(([target]) =>
      target.includes(
        '.var/app/com.brave.Browser/config/BraveSoftware/Brave-Browser/NativeMessagingHosts'
      )
    )
    expect(flatpakManifestWrite).toBeDefined()
    const manifest = JSON.parse(flatpakManifestWrite[1])
    expect(manifest.path).toContain(
      '.var/app/com.brave.Browser/data/bin/pearpass-wrapper.sh'
    )
  })

  it('under snap, skips the wrapper and points manifests at /snap/bin/<name>.native-host', async () => {
    os.platform.mockReturnValue('linux')
    const prevSnapName = process.env.SNAP_NAME
    const prevSnapRealHome = process.env.SNAP_REAL_HOME
    process.env.SNAP_NAME = 'pearpass'
    process.env.SNAP_REAL_HOME = '/home/testuser'
    try {
      const result = await setupNativeMessaging({
        userDataPath: MOCK_USER_DATA_PATH,
        execPath: MOCK_EXEC_PATH,
        bridgePath: MOCK_BRIDGE_PATH
      })
      expect(result.success).toBe(true)
      // 9 browser manifests, no wrapper executable.
      expect(fs.writeFile).toHaveBeenCalledTimes(9)
      // Every chmod is the manifest 0o644; no wrapper 0o755.
      for (const [, mode] of fs.chmod.mock.calls) {
        expect(mode).toBe(0o644)
      }
      // Every manifest's path field is the snapd-managed entry.
      for (const [, contents] of fs.writeFile.mock.calls) {
        const manifest = JSON.parse(contents)
        expect(manifest.path).toBe('/snap/bin/pearpass.native-host')
      }
    } finally {
      if (prevSnapName === undefined) delete process.env.SNAP_NAME
      else process.env.SNAP_NAME = prevSnapName
      if (prevSnapRealHome === undefined) delete process.env.SNAP_REAL_HOME
      else process.env.SNAP_REAL_HOME = prevSnapRealHome
    }
  })
})
