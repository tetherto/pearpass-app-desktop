/**
 * Electron entry helpers: config and vault client when running inside Electron.
 * Use these when window.electronAPI is defined (Electron); otherwise use Pear + createOrGetPipe.
 */

import { createElectronVaultClientProxy } from './vaultClientProxy'

let configPromise = null
let vaultClientPromise = null

/**
 * @returns {Promise<{ storage: string, key: string | null, upgrade: string | null, version: string | number, applink: string }>}
 */
export function getElectronConfig() {
  if (!configPromise && typeof window !== 'undefined' && window.electronAPI) {
    configPromise = window.electronAPI.getConfig()
  }
  return configPromise || Promise.resolve(null)
}

/**
 * @returns {Promise<import('@tetherto/pearpass-lib-vault-core').PearpassVaultClient | null>}
 */
export function getElectronVaultClient() {
  if (
    !vaultClientPromise &&
    typeof window !== 'undefined' &&
    window.electronAPI
  ) {
    vaultClientPromise = Promise.resolve(
      createElectronVaultClientProxy(window.electronAPI)
    )
  }
  return vaultClientPromise || Promise.resolve(null)
}

/**
 * Runtime update APIs (for usePearUpdate).
 */
export const electronRuntime =
  typeof window !== 'undefined' && window.electronAPI
    ? {
        onUpdating: (cb) => window.electronAPI.onRuntimeUpdating(cb),
        onUpdated: (cb) => window.electronAPI.onRuntimeUpdated(cb),
        applyUpdate: () => window.electronAPI.applyUpdate(),
        restart: () => window.electronAPI.restart(),
        checkUpdated: () => window.electronAPI.checkUpdated()
      }
    : null

export function isElectron() {
  return typeof window !== 'undefined' && !!window.electronAPI
}
