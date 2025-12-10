import EventEmitter from 'events'

import RPC from 'bare-rpc'
import FramedStream from 'framed-stream'

import { receiveFileStream } from '../utils/recieveFileStream'
import { sendFileStream } from '../utils/sendFileStream'
import { API, API_BY_VALUE } from '../worklet/api'

export class PearpassVaultClient extends EventEmitter {
  constructor(ipc, storagePath, { debugMode = false } = {}) {
    super()

    this.debugMode = debugMode

    this._logger = {
      log: (...args) => {
        if (!this.debugMode) {
          return
        }

        console.log(...args)
      },
      error: (...args) => {
        console.error(...args)
      }
    }

    this.rpc = new RPC(new FramedStream(ipc), (req) => {
      switch (req.command) {
        case API.ON_UPDATE:
          this.emit('update')

          break

        default:
          this._logger.error('Unknown command:', req.command)
      }
    })

    if (storagePath) {
      this.setStoragePath(storagePath)
    }
  }

  _handleError(parsedRes) {
    const error = parsedRes?.error

    if (error?.includes('ELOCKED')) {
      throw new Error('ELOCKED')
    }

    if (error) {
      throw new Error(error)
    }
  }

  /**
   * Handles requests to the RPC server.
   * @param {Object} param0 - The request parameters.
   * @param {string} param0.command - The API command to call.
   * @param {Object | undefined} param0.data - The data to send with the request.
   * @returns {Promise<Object>} The response from the server.
   */
  async _handleRequest({ command, data }) {
    const commandName = API_BY_VALUE[command]

    if (!commandName) {
      throw new Error('Unknown command:', command)
    }

    this._logger.log('Sending request:', commandName, data ?? '')

    const req = this.rpc.request(command)

    req.send(data ? JSON.stringify(data) : undefined)

    const res = await req.reply('utf8')

    const parsedRes = JSON.parse(res)

    this._handleError(parsedRes)

    this._logger.log('Received response:', API_BY_VALUE[req.command], parsedRes)

    return parsedRes?.data
  }

  /**
   * Sets the storage path for the vault.
   * @param {string} path - The storage path to set.
   * @returns {Promise<void>}
   */
  async setStoragePath(path) {
    return this._handleRequest({
      command: API.STORAGE_PATH_SET,
      data: { path }
    })
  }

  /**
   * Initializes the vault.
   * @param {string} encryptionKey - The encryption key to use.
   * @returns {Promise<void>}
   */
  async vaultsInit(encryptionKey) {
    return this._handleRequest({
      command: API.MASTER_VAULT_INIT,
      data: { encryptionKey }
    })
  }

  /**
   * Gets the status of the vault.
   * @returns {Promise<Object>} The status of the vault.
   */
  async vaultsGetStatus() {
    return this._handleRequest({
      command: API.MASTER_VAULT_GET_STATUS
    })
  }

  /**
   * Gets a vault by its key.
   * @param {string} key - The key of the vault to get.
   * @returns {Promise<Object>} The vault data.
   */
  async vaultsGet(key) {
    return this._handleRequest({
      command: API.MASTER_VAULT_GET,
      data: { key }
    })
  }

  /**
   * Closes the master vault.
   * @returns {Promise<void>}
   */
  async vaultsClose() {
    return this._handleRequest({
      command: API.MASTER_VAULT_CLOSE
    })
  }

  /**
   * Adds a vault.
   * @param {string} key - The key of the vault to add.
   * @param {Object} data - The vault data to add.
   * @returns {Promise<void>}
   */
  async vaultsAdd(key, data) {
    return this._handleRequest({
      command: API.MASTER_VAULT_ADD,
      data: { key, data }
    })
  }

  /**
   * Gets a file from the active vault.
   * @param {string} key - The key of the vault to get the file from.
   * @returns {Promise<Object>} The file data.
   */
  async activeVaultGetFile(key) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_FILE_GET,
      data: { key }
    })
  }

  /**
   * Removes a file from the active vault.
   * @param {string} key - The key of the vault to remove the file from.
   * @returns {Promise<void>}
   */
  async activeVaultRemoveFile(key) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_FILE_REMOVE,
      data: { key }
    })
  }

  /**
   * Lists all vaults.
   * @param {string} filterKey - The key to filter vaults by.
   * @returns {Promise<Array<Object>>} The list of vaults.
   */
  async vaultsList(filterKey) {
    return this._handleRequest({
      command: API.MASTER_VAULT_LIST,
      data: { filterKey }
    })
  }

  /**
   * Initializes the active vault.
   * @param {Object} params - The parameters for initializing the vault.
   * @param {string} params.id - The ID of the vault.
   * @param {string} params.encryptionKey - The encryption key for the vault.
   * @returns {Promise<Object>}
   */
  async activeVaultInit({ id, encryptionKey }) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_INIT,
      data: { id, encryptionKey }
    })
  }

  /**
   * Gets the status of the active vault.
   * @returns {Promise<Object>}
   */
  async activeVaultGetStatus() {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_GET_STATUS
    })
  }

  /**
   * Records a failed master password attempt for rate limiting.
   * @returns {Promise<Object>}
   */
  async recordFailedMasterPassword() {
    return this._handleRequest({
      command: API.RECORD_FAILED_MASTER_PASSWORD
    })
  }

  /**
   * Gets the master password rate limit status.
   * @returns {Promise<{status: {isLocked: boolean, lockoutRemainingMs: number, remainingAttempts: number}}>}
   */
  async getMasterPasswordStatus() {
    return this._handleRequest({
      command: API.MASTER_PASSWORD_STATUS
    })
  }

  /**
   * Closes the active vault.
   * @returns {Promise<Object>}
   */
  async activeVaultClose() {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_CLOSE
    })
  }

  /**
   * Adds a file to the active vault.
   * @param {string} key - The key of the vault to add the file to.
   * @param {Buffer} buffer - The file data to add.
   * @returns {Promise<object>}
   */
  async activeVaultAdd(key, data) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_ADD,
      data: { key, data }
    })
  }

  /**
   * Removes a record from the active vault.
   * @param {string} key - The key of the record to remove.
   * @returns {Promise<object>}
   */
  async activeVaultRemove(key) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_REMOVE,
      data: { key }
    })
  }

  /**
   * Lists all records in the active vault.
   * @param {string} filterKey - The key to filter records by.
   * @returns {Promise<Array<Object>>} The list of records.
   */
  async activeVaultList(filterKey) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_LIST,
      data: { filterKey }
    })
  }

  /**
   * Gets a record from the active vault.
   * @param {string} key - The key of the record to get.
   * @returns {Promise<Object>}
   */
  async activeVaultGet(key) {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_GET,
      data: { key }
    })
  }

  /**
   * Creates an invite for the active vault.
   * @returns {Promise<Object>}
   */
  async activeVaultCreateInvite() {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_CREATE_INVITE
    })
  }

  /**
   * Deletes an invite for the active vault.
   * @returns {Promise<Object>}
   */
  async activeVaultDeleteInvite() {
    return this._handleRequest({
      command: API.ACTIVE_VAULT_DELETE_INVITE
    })
  }

  /**
   * Pairs the active vault with an invite code.
   * @param {string} inviteCode - The invite code to pair with.
   * @returns {Promise<Object>}
   */
  async pairActiveVault(inviteCode) {
    return this._handleRequest({
      command: API.PAIR_ACTIVE_VAULT,
      data: { inviteCode }
    })
  }

  /**
   * Cancels the pairing of the active vault.
   * @returns {Promise<Object>}
   */
  async cancelPairActiveVault() {
    return this._handleRequest({
      command: API.CANCEL_PAIR_ACTIVE_VAULT
    })
  }

  /**
   * Initializes the listener for the active vault.
   * @param {Object} params - The parameters for initializing the listener.
   * @param {string} params.vaultId - The ID of the vault.
   * @returns {Promise<Object>}
   */
  async initListener({ vaultId }) {
    return this._handleRequest({
      command: API.INIT_LISTENER,
      data: { vaultId }
    })
  }

  /**
   * Get blind mirrors for the active vault
   * @returns {Promise<Array<string>>}
   */
  async getBlindMirrors() {
    return this._handleRequest({
      command: API.BLIND_MIRRORS_GET
    })
  }

  /**
   * Add blind mirrors to the active vault
   * @param {Array<string>} blindMirrors
   * @returns {Promise<void>}
   */
  async addBlindMirrors(blindMirrors) {
    return this._handleRequest({
      command: API.BLIND_MIRRORS_ADD,
      data: { blindMirrors }
    })
  }

  /**
   * Remove a blind mirror from the active vault
   * @param {string} key
   * @returns {Promise<void>}
   */
  async removeBlindMirror(key) {
    return this._handleRequest({
      command: API.BLIND_MIRROR_REMOVE,
      data: { key }
    })
  }

  /**
   * Add default blind mirrors
   * @returns {Promise<void>}
   */
  async addDefaultBlindMirrors() {
    return this._handleRequest({
      command: API.BLIND_MIRRORS_ADD_DEFAULTS
    })
  }

  /**
   * Remove all blind mirrors
   * @returns {Promise<void>}
   */
  async removeAllBlindMirrors() {
    return this._handleRequest({
      command: API.BLIND_MIRRORS_REMOVE_ALL
    })
  }

  /**
   * Initializes the encryption for the active vault.
   * @returns {Promise<Object>}
   */
  async encryptionInit() {
    return this._handleRequest({
      command: API.ENCRYPTION_INIT
    })
  }

  /**
   * Gets the status of the encryption for the active vault.
   * @returns {Promise<Object>}
   */
  async encryptionGetStatus() {
    return this._handleRequest({
      command: API.ENCRYPTION_GET_STATUS
    })
  }

  /**
   * Gets the encryption key for the active vault.
   * @param {string} key - The key of the vault.
   * @returns {Promise<Object>}
   */
  async encryptionGet(key) {
    return this._handleRequest({
      command: API.ENCRYPTION_GET,
      data: { key }
    })
  }

  /**
   * Adds a record to the active vault.
   * @param {string} key - The key of the record to add.
   * @param {Object} data - The data of the record to add.
   * @returns {Promise<Object>}
   */
  async encryptionAdd(key, data) {
    return this._handleRequest({
      command: API.ENCRYPTION_ADD,
      data: { key, data }
    })
  }

  /**
   * Hashes a password for the active vault.
   * @param {string} password - The password to hash.
   * @returns {Promise<Object>}
   */
  async hashPassword(password) {
    return this._handleRequest({
      command: API.ENCRYPTION_HASH_PASSWORD,
      data: { password }
    })
  }

  /**
   * Encrypts the vault key with a hashed password.
   * @param {string} hashedPassword - The hashed password to use for encryption.
   * @returns {Promise<Object>}
   */
  async encryptVaultKeyWithHashedPassword(hashedPassword) {
    return this._handleRequest({
      command: API.ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD,
      data: { hashedPassword }
    })
  }

  /**
   * Encrypts the vault with a key.
   * @param {string} hashedPassword - The hashed password to use for encryption.
   * @param {string} key - The key of the vault to encrypt.
   * @returns {Promise<Object>}
   */
  async encryptVaultWithKey(hashedPassword, key) {
    return this._handleRequest({
      command: API.ENCRYPTION_ENCRYPT_VAULT_WITH_KEY,
      data: { hashedPassword, key }
    })
  }

  /**
   * Gets the decryption key for the active vault.
   * @param {Object} params - The parameters for getting the decryption key.
   * @param {string} params.salt - The salt to use for key derivation.
   * @param {string} params.password - The password to use for key derivation.
   * @returns {Promise<Object>}
   */
  async getDecryptionKey({ salt, password }) {
    return this._handleRequest({
      command: API.ENCRYPTION_GET_DECRYPTION_KEY,
      data: { salt, password }
    })
  }

  /**
   * Decrypts the vault key for the active vault.
   * @param {Object} params - The parameters for decrypting the vault key.
   * @param {string} params.ciphertext - The ciphertext to decrypt.
   * @param {string} params.nonce - The nonce to use for decryption.
   * @param {string} params.hashedPassword - The hashed password to use for decryption.
   * @returns {Promise<Object>}
   */
  async decryptVaultKey({ ciphertext, nonce, hashedPassword }) {
    return this._handleRequest({
      command: API.ENCRYPTION_DECRYPT_VAULT_KEY,
      data: { ciphertext, nonce, hashedPassword }
    })
  }

  /**
   * Closes the encryption for the active vault.
   * @returns {Promise<Object>}
   */
  async encryptionClose() {
    return this._handleRequest({
      command: API.ENCRYPTION_CLOSE
    })
  }

  /**
   * Closes the vault for the active vault.
   * @returns {Promise<void>}
   */
  async closeAllInstances() {
    return this._handleRequest({
      command: API.CLOSE_ALL_INSTANCES
    })
  }

  /**
   * Adds a file to the active vault.
   * @param {string} key - The key of the file to add.
   * @param {Buffer} buffer - The file data to add.
   * @returns {Promise<Object>}
   */
  async activeVaultAddFile(key, buffer, name) {
    try {
      this._logger.log('Adding file to active vault:', { key })

      const req = this.rpc.request(API.ACTIVE_VAULT_FILE_ADD)

      const stream = req.createRequestStream()

      await sendFileStream({
        stream,
        buffer,
        metaData: { key, name }
      })

      const res = await req.reply('utf8')

      const parsedResponse = JSON.parse(res)

      this._handleError(parsedResponse)

      this._logger.log('File added', parsedResponse)
    } catch (error) {
      this._logger.error('Error adding file to active vault:', error)
      throw error
    }
  }

  /**
   * Gets a file from the active vault.
   * @param {string} key - The key of the file to get.
   * @returns {Promise<Buffer>}
   */
  async activeVaultGetFile(key) {
    try {
      const req = this.rpc.request(API.ACTIVE_VAULT_FILE_GET)

      this._logger.log('Getting file from active vault:', {
        key
      })

      req.send(JSON.stringify({ key }))

      const stream = req.createResponseStream()

      const { buffer } = await receiveFileStream(stream)

      this._logger.log('File from active vault:', { key })

      return buffer
    } catch (error) {
      this._logger.error('Error getting file from active vault:', error)
    }
  }
}
