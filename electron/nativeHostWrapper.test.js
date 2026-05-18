/* eslint-env jest */

jest.mock('fs/promises', () => ({
  access: jest.fn(),
  writeFile: jest.fn(),
  chmod: jest.fn(),
  rename: jest.fn()
}))

const fsp = require('fs/promises')

const {
  buildWrapperContent,
  writeWrapperAtomic,
  refreshNativeHostWrapperIfPresent
} = require('./nativeHostWrapper.cjs')

const EXEC_PATH = '/mock/electron/PearPass'
const BRIDGE_PATH = '/mock/dist/native-messaging-bridge.bundle.cjs'
const WRAPPER_PATH = '/mock/userData/native-messaging/pearpass-native-host.sh'

describe('buildWrapperContent', () => {
  it('emits a bash wrapper with ELECTRON_RUN_AS_NODE for darwin', () => {
    const content = buildWrapperContent({
      platform: 'darwin',
      isFlatpak: false,
      electronExecPath: EXEC_PATH,
      bridgeScriptPath: BRIDGE_PATH
    })
    expect(content).toContain('#!/bin/bash')
    expect(content).toContain('ELECTRON_RUN_AS_NODE=1')
    expect(content).toContain(EXEC_PATH)
    expect(content).toContain(BRIDGE_PATH)
  })

  it('emits a bash wrapper with ELECTRON_RUN_AS_NODE for linux', () => {
    const content = buildWrapperContent({
      platform: 'linux',
      isFlatpak: false,
      electronExecPath: EXEC_PATH,
      bridgeScriptPath: BRIDGE_PATH
    })
    expect(content).toContain('#!/bin/bash')
    expect(content).toContain('ELECTRON_RUN_AS_NODE=1')
    expect(content).toContain(EXEC_PATH)
  })

  it('emits a flatpak re-entry wrapper when isFlatpak is true', () => {
    const content = buildWrapperContent({
      platform: 'linux',
      isFlatpak: true,
      electronExecPath: EXEC_PATH,
      bridgeScriptPath: BRIDGE_PATH
    })
    expect(content).toContain('flatpak')
    expect(content).toContain('com.pears.pass')
    expect(content).toContain('--command=pearpass-native-host')
    // In-sandbox paths are resolved by `flatpak run`, not baked into the wrapper.
    expect(content).not.toContain(EXEC_PATH)
    expect(content).not.toContain(BRIDGE_PATH)
  })

  it('emits a cmd wrapper for win32', () => {
    const content = buildWrapperContent({
      platform: 'win32',
      isFlatpak: false,
      electronExecPath: EXEC_PATH,
      bridgeScriptPath: BRIDGE_PATH
    })
    expect(content).toContain('@echo off')
    expect(content).toContain('set ELECTRON_RUN_AS_NODE=1')
    expect(content).toContain(EXEC_PATH)
  })

  it('throws on unsupported platforms', () => {
    expect(() =>
      buildWrapperContent({
        platform: 'aix',
        isFlatpak: false,
        electronExecPath: EXEC_PATH,
        bridgeScriptPath: BRIDGE_PATH
      })
    ).toThrow('Unsupported platform: aix')
  })
})

describe('writeWrapperAtomic', () => {
  beforeEach(() => jest.clearAllMocks())

  it('writes to a tmp path, chmods, then renames into place on unix', async () => {
    await writeWrapperAtomic(WRAPPER_PATH, 'content', 'linux')
    const tmpPath = fsp.writeFile.mock.calls[0][0]
    expect(tmpPath.startsWith(`${WRAPPER_PATH}.tmp-`)).toBe(true)
    expect(fsp.chmod).toHaveBeenCalledWith(tmpPath, 0o755)
    expect(fsp.rename).toHaveBeenCalledWith(tmpPath, WRAPPER_PATH)
  })

  it('skips chmod on win32', async () => {
    await writeWrapperAtomic(WRAPPER_PATH, 'content', 'win32')
    expect(fsp.chmod).not.toHaveBeenCalled()
    expect(fsp.rename).toHaveBeenCalled()
  })
})

describe('refreshNativeHostWrapperIfPresent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns not-present and does not write when wrapper is absent', async () => {
    fsp.access.mockRejectedValueOnce(new Error('ENOENT'))
    const result = await refreshNativeHostWrapperIfPresent({
      executablePath: WRAPPER_PATH,
      electronExecPath: EXEC_PATH,
      bridgeScriptPath: BRIDGE_PATH,
      platform: 'linux',
      isFlatpak: false
    })
    expect(result).toEqual({ refreshed: false, reason: 'not-present' })
    expect(fsp.writeFile).not.toHaveBeenCalled()
    expect(fsp.rename).not.toHaveBeenCalled()
  })

  it('rewrites atomically when wrapper exists', async () => {
    fsp.access.mockResolvedValueOnce()
    const result = await refreshNativeHostWrapperIfPresent({
      executablePath: WRAPPER_PATH,
      electronExecPath: EXEC_PATH,
      bridgeScriptPath: BRIDGE_PATH,
      platform: 'linux',
      isFlatpak: false
    })
    expect(result).toEqual({ refreshed: true })
    const writeCall = fsp.writeFile.mock.calls[0]
    expect(writeCall[0].startsWith(`${WRAPPER_PATH}.tmp-`)).toBe(true)
    expect(writeCall[1]).toContain(EXEC_PATH)
    expect(fsp.rename).toHaveBeenCalledWith(writeCall[0], WRAPPER_PATH)
  })
})
