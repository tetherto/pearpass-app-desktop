import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<{
 *  ciphertext: string
 *  nonce: string
 *  salt: string
 *  hashedPassword?: string
 * } | undefined>}
 */
export const getMasterEncryption = async () => {
  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    const masterEncryption =
      await pearpassVaultClient.vaultsGet('masterEncryption')

    return masterEncryption
  }

  return undefined
}
