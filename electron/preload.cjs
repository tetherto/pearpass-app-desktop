/* eslint-disable no-underscore-dangle */
/**
 * Preload: runs in the same context as the page (contextIsolation false).
 * Injects Node globals (__dirname, __filename) and exposes electronAPI on window.
 */
const path = require('path')

const { ipcRenderer } = require('electron')

const pkg = require('../package.json')

const appPath = ipcRenderer.sendSync('get-app-path')

// Required by fs-native-extensions (pulled in via pear-ipc): binding.js uses __filename
const fsNativeExtDir = path.join(
  appPath,
  'node_modules',
  'fs-native-extensions'
)
global.__dirname = fsNativeExtDir
global.__filename = path.join(fsNativeExtDir, 'binding.js')
global.global = global

window.electronAPI = {
  productName: pkg.productName,
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getConfig: () => ipcRenderer.invoke('runtime:getConfig'),
  onRuntimeUpdating: (cb) => {
    const sub = () => cb()
    ipcRenderer.on('runtime:updating', sub)
    return () => ipcRenderer.removeListener('runtime:updating', sub)
  },
  onRuntimeUpdated: (cb) => {
    const sub = () => cb()
    ipcRenderer.on('runtime:updated', sub)
    return () => ipcRenderer.removeListener('runtime:updated', sub)
  },
  applyUpdate: () => ipcRenderer.invoke('runtime:applyUpdate'),
  restart: () => ipcRenderer.invoke('runtime:restart'),
  checkUpdated: () => ipcRenderer.invoke('runtime:checkUpdated'),
  clearClipboardAfter: (text, delayMs) =>
    ipcRenderer.invoke('clipboard:clearAfter', { text, delayMs }),
  vaultInvoke: (method, args) =>
    ipcRenderer.invoke('vault:invoke', { method, args }),
  vaultOnUpdate: (cb) => {
    const sub = () => cb()
    ipcRenderer.on('vault:update', sub)
    return () => ipcRenderer.removeListener('vault:update', sub)
  },
  vaultOnMasterUpdate: (cb) => {
    const sub = () => cb()
    ipcRenderer.on('vault:master-update', sub)
    return () => ipcRenderer.removeListener('vault:master-update', sub)
  },
  vaultOnPersonalSwarmEnvelope: (cb) => {
    const sub = (_event, msg) => cb(msg)
    ipcRenderer.on('vault:personal-swarm-envelope', sub)
    return () =>
      ipcRenderer.removeListener('vault:personal-swarm-envelope', sub)
  },
  clearStaleVaultsDir: () => ipcRenderer.invoke('vault:clearStaleVaultsDir'),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openLogsFolder: () => ipcRenderer.invoke('vault:openLogsFolder'),
  isLoggingEnabled: () => ipcRenderer.invoke('vault:isLoggingEnabled'),
  setLogging: (enabled) =>
    ipcRenderer.invoke('vault:setLogging', { enabled: !!enabled }),

  // Biometric / Touch ID
  isBiometricAvailable: () => ipcRenderer.invoke('biometric:isAvailable'),
  storeBiometricCredentials: (credentials) =>
    ipcRenderer.invoke('biometric:storeCredentials', credentials),
  retrieveBiometricCredentials: (reason) =>
    ipcRenderer.invoke('biometric:retrieveCredentials', reason),
  deleteBiometricCredentials: () =>
    ipcRenderer.invoke('biometric:deleteCredentials')
}
