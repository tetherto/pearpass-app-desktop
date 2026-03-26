/* eslint-env jest */

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  writeFileSync: jest.fn()
}))

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'token-1')
}))

jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    unref: jest.fn()
  }))
}))

describe('clipboardCleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses the Windows script', () => {
    const path = require('path')
    const fs = require('fs')
    const { spawn } = require('child_process')
    const { scheduleClipboardCleanup } = require('./clipboardCleanup.cjs')

    const app = {
      getPath: jest.fn((name) =>
        name === 'temp' ? 'C:\\Temp' : `/unknown/${name}`
      )
    }
    const clipboard = {
      readText: jest.fn(() => 'secret')
    }
    const logger = {
      warn: jest.fn()
    }

    const result = scheduleClipboardCleanup({
      app,
      clipboard,
      logger,
      isWindows: true,
      text: 'secret',
      delayMs: 30000
    })

    expect(result).toBe(true)
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      1,
      path.join('C:\\Temp', 'pearpass-clipboard-secret-token-1.txt'),
      'secret',
      { encoding: 'utf8', mode: 0o600 }
    )
    expect(fs.writeFileSync).toHaveBeenNthCalledWith(
      2,
      path.join('C:\\Temp', 'pearpass-clipboard-cleanup-current.token'),
      'token-1',
      { encoding: 'utf8', mode: 0o600 }
    )
    expect(spawn).toHaveBeenCalledWith(
      'cmd.exe',
      expect.arrayContaining([
        '/c',
        'start',
        '""',
        '/min',
        'powershell.exe',
        '-NoProfile',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        path.join(process.cwd(), 'electron', 'clipboardCleanup.windows.ps1')
      ]),
      expect.objectContaining({
        detached: true,
        stdio: 'inherit',
        windowsHide: true
      })
    )
  })
})
