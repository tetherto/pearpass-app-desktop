/* eslint-env jest */

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  existsSync: jest.fn(() => true),
  promises: {
    mkdir: jest.fn()
  }
}))

jest.mock('child_process', () => ({
  spawnSync: jest.fn(() => ({ status: 0, stdout: '', error: null }))
}))

jest.mock('./linuxClipboardFallback.cjs', () => ({
  readClipboardWithFallback: jest.fn(() => null),
  clearClipboardWithFallback: jest.fn(() => false)
}))

const originalPlatform = process.platform

const setPlatform = (platform) => {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: platform
  })
}

const loadHelper = () => {
  jest.resetModules()
  return require('./clipboardCleanupHelper.cjs')
}

const getFs = () => require('fs')
const getSpawnSync = () => require('child_process').spawnSync

describe('clipboardCleanupHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    setPlatform(originalPlatform)
  })

  it('clears the clipboard only for the latest matching token', async () => {
    setPlatform('darwin')
    const helper = loadHelper()
    const fs = getFs()
    const spawnSync = getSpawnSync()

    fs.readFileSync
      .mockReturnValueOnce('secret')
      .mockReturnValueOnce('token-1')
      .mockReturnValueOnce('token-1')

    spawnSync
      .mockReturnValueOnce({ status: 0, stdout: 'secret' })
      .mockReturnValueOnce({ status: 0, stdout: '' })

    const cleanupPromise = helper.runClipboardCleanup({
      secretPath: '/tmp/secret.txt',
      token: 'token-1',
      statePath: '/tmp/state.token',
      delayMs: 30000
    })

    await jest.advanceTimersByTimeAsync(30000)
    await expect(cleanupPromise).resolves.toBe(true)

    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      '/usr/bin/pbpaste',
      [],
      expect.objectContaining({ input: undefined })
    )
    expect(spawnSync).toHaveBeenNthCalledWith(
      2,
      '/usr/bin/pbcopy',
      [],
      expect.objectContaining({ input: '' })
    )
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/secret.txt')
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/state.token')
  })

  it('does not clear when a newer clipboard token replaced it', async () => {
    setPlatform('darwin')
    const helper = loadHelper()
    const fs = getFs()
    const spawnSync = getSpawnSync()

    fs.readFileSync.mockReturnValueOnce('secret').mockReturnValueOnce('token-2')

    const cleanupPromise = helper.runClipboardCleanup({
      secretPath: '/tmp/secret.txt',
      token: 'token-1',
      statePath: '/tmp/state.token',
      delayMs: 30000
    })

    await jest.advanceTimersByTimeAsync(30000)
    await expect(cleanupPromise).resolves.toBe(false)

    expect(spawnSync).not.toHaveBeenCalled()
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/secret.txt')
    expect(fs.unlinkSync).not.toHaveBeenCalledWith('/tmp/state.token')
  })

  it('skips Linux cleanup gracefully when no clipboard tool is available', async () => {
    setPlatform('linux')
    const helper = loadHelper()
    const fs = getFs()
    const spawnSync = getSpawnSync()
    const stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true)

    fs.readFileSync
      .mockReturnValueOnce('secret')
      .mockReturnValueOnce('token-1')
      .mockReturnValueOnce('token-1')

    spawnSync
      .mockReturnValueOnce({ error: { code: 'ENOENT' } })
      .mockReturnValueOnce({ error: { code: 'ENOENT' } })

    const cleanupPromise = helper.runClipboardCleanup({
      secretPath: '/tmp/secret.txt',
      token: 'token-1',
      statePath: '/tmp/state.token',
      delayMs: 30000
    })

    await jest.advanceTimersByTimeAsync(30000)
    await expect(cleanupPromise).resolves.toBe(false)

    expect(stderrSpy).toHaveBeenCalledWith(
      'PearPass clipboard cleanup skipped: Linux clipboard command unavailable or failed.\n'
    )
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/secret.txt')
    expect(fs.unlinkSync).toHaveBeenCalledWith('/tmp/state.token')

    stderrSpy.mockRestore()
  })
})
