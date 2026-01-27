import { stringToBuffer } from 'pearpass-lib-vault/src/utils/buffer'

import { HANDLER_EVENTS } from '../../constants/services'
import { logger } from '../../utils/logger'

/**
 * Handles encryption-related IPC operations
 */
export class EncryptionHandlers {
  constructor(client) {
    this.client = client
  }

  async encryptionInit() {
    await this.client.encryptionInit()
    return { initialized: true }
  }

  async encryptionGetStatus() {
    return await this.client.encryptionGetStatus()
  }

  async encryptionGet(params) {
    const result = await this.client.encryptionGet(params.key)
    logger.debug('ENCRYPTION-HANDLER', `encryptionGet for key: ${params.key}`)
    return result
  }

  async encryptionAdd(params) {
    await this.client.encryptionAdd(params.key, params.data)
    return { success: true }
  }

  async hashPassword(params) {
    return await this.client.hashPassword(params.password)
  }

  async encryptVaultKeyWithHashedPassword(params) {
    return await this.client.encryptVaultKeyWithHashedPassword(
      params.hashedPassword
    )
  }

  async encryptVaultWithKey(params) {
    return await this.client.encryptVaultWithKey(
      params.hashedPassword,
      params.key
    )
  }

  async getDecryptionKey(params) {
    logger.info('ENCRYPTION-HANDLER', `Getting decryption key`)
    const result = await this.client.getDecryptionKey({
      salt: params.salt,
      password: params.password
    })
    logger.info('ENCRYPTION-HANDLER', `Decryption key obtained`)
    return result
  }

  async decryptVaultKey(params) {
    logger.debug('ENCRYPTION-HANDLER', `Decrypting vault key`)
    const result = await this.client.decryptVaultKey({
      ciphertext: params.ciphertext,
      nonce: params.nonce,
      hashedPassword: params.hashedPassword
    })

    return result
  }

  async recordFailedMasterPassword() {
    logger.info('ENCRYPTION-HANDLER', `Recording failed attempt`)
    return await this.client.recordFailedMasterPassword()
  }

  async getMasterPasswordStatus() {
    const status = await this.client.getMasterPasswordStatus()

    if (status?.isLocked && global.window) {
      global.window.dispatchEvent(new CustomEvent(HANDLER_EVENTS.extensionLock))
    }

    return status
  }

  async resetFailedAttempts() {
    logger.info('ENCRYPTION-HANDLER', `Resetting failed attempts`)
    return await this.client.resetFailedAttempts()
  }

  async initWithPassword(params) {
    logger.info('ENCRYPTION-HANDLER', `Initializing with password`)
    if (!params.password) {
      throw new Error('Password is required')
    }
    const result = await this.client.initWithPassword(
      stringToBuffer(params.password)
    )
    logger.info('ENCRYPTION-HANDLER', `Initialized with password`)
    return result
  }
}
