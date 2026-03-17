/* eslint-disable no-underscore-dangle */
/**
 * Renderer-side proxy for PearpassVaultClient when running in Electron.
 * Forwards every method call to the main process via IPC; main process holds
 * the real client connected to the bare worklet. Buffer args must be sent as
 * { __base64: base64String }; Buffer return values come back as { __base64 }.
 */
import EventEmitter from 'events'

function isBufferLike(value) {
  return (
    value instanceof Uint8Array ||
    (typeof Buffer !== 'undefined' && Buffer.isBuffer(value))
  )
}

function toSerializableArg(value) {
  if (isBufferLike(value)) {
    const b =
      typeof Buffer !== 'undefined' ? Buffer.from(value) : new Uint8Array(value)
    const base64 =
      typeof b.toString === 'function'
        ? b.toString('base64')
        : btoa(String.fromCharCode(...new Uint8Array(b)))
    return { __base64: base64 }
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const out = {}
    for (const k of Object.keys(value)) {
      out[k] = toSerializableArg(value[k])
    }
    return out
  }
  if (Array.isArray(value)) {
    return value.map(toSerializableArg)
  }
  return value
}

function fromSerializableData(data) {
  if (data && typeof data === 'object' && data.__base64) {
    const bin = atob(data.__base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return typeof Buffer !== 'undefined' ? Buffer.from(bytes) : bytes
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const out = {}
    for (const k of Object.keys(data)) {
      out[k] = fromSerializableData(data[k])
    }
    return out
  }
  if (Array.isArray(data)) {
    return data.map(fromSerializableData)
  }
  return data
}

const VAULT_METHODS = [
  'setStoragePath',
  'vaultsInit',
  'vaultsGetStatus',
  'vaultsGet',
  'vaultsClose',
  'vaultsAdd',
  'activeVaultGetFile',
  'activeVaultRemoveFile',
  'vaultsList',
  'activeVaultInit',
  'activeVaultGetStatus',
  'recordFailedMasterPassword',
  'getMasterPasswordStatus',
  'resetFailedAttempts',
  'createMasterPassword',
  'initWithPassword',
  'updateMasterPassword',
  'initWithCredentials',
  'activeVaultClose',
  'activeVaultAdd',
  'activeVaultRemove',
  'activeVaultList',
  'activeVaultGet',
  'activeVaultCreateInvite',
  'activeVaultDeleteInvite',
  'pairActiveVault',
  'cancelPairActiveVault',
  'initListener',
  'getBlindMirrors',
  'addBlindMirrors',
  'removeBlindMirror',
  'addDefaultBlindMirrors',
  'removeAllBlindMirrors',
  'encryptionInit',
  'encryptionGetStatus',
  'encryptionGet',
  'encryptionAdd',
  'hashPassword',
  'encryptVaultKeyWithHashedPassword',
  'encryptVaultWithKey',
  'getDecryptionKey',
  'decryptVaultKey',
  'encryptionClose',
  'closeAllInstances',
  'activeVaultAddFile',
  'activeVaultGetFile',
  'beginBackground',
  'endBackground',
  'generateOtpCodesByIds',
  'generateHotpNext',
  'addOtpToRecord',
  'removeOtpFromRecord'
]

/**
 * Creates a proxy that implements the vault client interface over IPC.
 * Extends EventEmitter so removeAllListeners, removeListener, on, once, etc. are always available.
 * @param {{ vaultInvoke: (method: string, args: any[]) => Promise<{ok: boolean, data?: any, error?: string}>, vaultOnUpdate: (cb: () => void) => () => void }} api
 * @returns {import('pearpass-lib-vault-core').PearpassVaultClient}
 */
export function createElectronVaultClientProxy(api) {
  class ElectronVaultClientProxy extends EventEmitter {
    constructor() {
      super()
      api.vaultOnUpdate(() => this.emit('update'))
      for (const method of VAULT_METHODS) {
        this[method] = async (...args) => {
          const serialized = args.map(toSerializableArg)
          const result = await api.vaultInvoke(method, serialized)
          if (!result.ok) {
            const err = new Error(result.error || 'Vault request failed')
            if (result.code) err.code = result.code
            throw err
          }
          return fromSerializableData(result.data)
        }
      }
    }
  }
  return new ElectronVaultClientProxy()
}
