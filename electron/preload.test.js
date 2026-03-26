/* eslint-disable no-underscore-dangle */
/* eslint-env jest */

const path = require('path')

jest.mock('electron', () => ({
  ipcRenderer: {
    sendSync: jest.fn(() => '/fake/app/path'),
    invoke: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn()
  }
}))

// Helper to load the preload script fresh for each test
const loadPreload = () => {
  // Ensure we start from a clean module state
  jest.resetModules()

  return require('./preload.cjs')
}

describe('preload.cjs', () => {
  beforeEach(() => {
    // Provide a minimal window shim so preload.cjs can attach electronAPI
    globalThis.window = globalThis.window || {}

    // Clean up globals that the preload may set
    delete globalThis.__dirname
    delete globalThis.__filename
    if (typeof window !== 'undefined') {
      delete window.electronAPI
    }

    jest.clearAllMocks()

    // Load the preload script (which will set globals and window.electronAPI)
    loadPreload()
  })

  it('sets Node-related globals correctly', () => {
    const expectedDir = path.join(
      '/fake/app/path',
      'node_modules',
      'fs-native-extensions'
    )

    expect(globalThis.__dirname).toBe(expectedDir)
    expect(globalThis.__filename).toBe(path.join(expectedDir, 'binding.js'))
  })

  it('exposes electronAPI on window with expected methods', () => {
    expect(window.electronAPI).toBeDefined()
    expect(typeof window.electronAPI.getAppVersion).toBe('function')
    expect(typeof window.electronAPI.getConfig).toBe('function')
    expect(typeof window.electronAPI.onRuntimeUpdating).toBe('function')
    expect(typeof window.electronAPI.onRuntimeUpdated).toBe('function')
    expect(typeof window.electronAPI.applyUpdate).toBe('function')
    expect(typeof window.electronAPI.restart).toBe('function')
    expect(typeof window.electronAPI.checkUpdated).toBe('function')
    expect(typeof window.electronAPI.clearClipboardAfter).toBe('function')
    expect(typeof window.electronAPI.vaultInvoke).toBe('function')
    expect(typeof window.electronAPI.vaultOnUpdate).toBe('function')
  })

  it('routes simple invoke-based APIs through ipcRenderer.invoke', async () => {
    const { ipcRenderer } = require('electron')

    await window.electronAPI.getAppVersion()
    await window.electronAPI.getConfig()
    await window.electronAPI.applyUpdate()
    await window.electronAPI.restart()
    await window.electronAPI.checkUpdated()
    await window.electronAPI.clearClipboardAfter('secret', 30000)

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('app:getVersion')
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('runtime:getConfig')
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('runtime:applyUpdate')
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('runtime:restart')
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('runtime:checkUpdated')
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('clipboard:clearAfter', {
      text: 'secret',
      delayMs: 30000
    })
  })

  it('routes vaultInvoke through ipcRenderer.invoke with payload', async () => {
    const { ipcRenderer } = require('electron')

    await window.electronAPI.vaultInvoke('doSomething', { foo: 'bar' })

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('vault:invoke', {
      method: 'doSomething',
      args: { foo: 'bar' }
    })
  })

  it('subscribes and unsubscribes to runtime updating events', () => {
    const { ipcRenderer } = require('electron')
    const cb = jest.fn()

    const unsubscribe = window.electronAPI.onRuntimeUpdating(cb)

    expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
    const [channel, handler] = ipcRenderer.on.mock.calls[0]
    expect(channel).toBe('runtime:updating')
    expect(typeof handler).toBe('function')

    // When unsubscribe is called, it should remove the same handler
    unsubscribe()
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
      'runtime:updating',
      handler
    )
  })

  it('subscribes and unsubscribes to runtime updated events', () => {
    const { ipcRenderer } = require('electron')
    const cb = jest.fn()

    const unsubscribe = window.electronAPI.onRuntimeUpdated(cb)

    expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
    const [channel, handler] = ipcRenderer.on.mock.calls[0]
    expect(channel).toBe('runtime:updated')
    expect(typeof handler).toBe('function')

    unsubscribe()
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
      'runtime:updated',
      handler
    )
  })

  it('subscribes and unsubscribes to vault update events', () => {
    const { ipcRenderer } = require('electron')
    const cb = jest.fn()

    const unsubscribe = window.electronAPI.vaultOnUpdate(cb)

    expect(ipcRenderer.on).toHaveBeenCalledTimes(1)
    const [channel, handler] = ipcRenderer.on.mock.calls[0]
    expect(channel).toBe('vault:update')
    expect(typeof handler).toBe('function')

    unsubscribe()
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
      'vault:update',
      handler
    )
  })
})
