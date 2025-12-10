import { pearpassVaultClient } from '../instances'
import { getMasterEncryption } from './getMasterEncryption'

/**
 * @returns {Promise<{
 *  ciphertext: string
 *  nonce: string
 *  salt: string
 *  hashedPassword?: string
 * }>}
 */
export const getMasterPasswordEncryption = async () => {
  const masterEncryption = await getMasterEncryption()

  if (masterEncryption) {
    return masterEncryption
  }

  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  return pearpassVaultClient.encryptionGet('masterPassword')
}
