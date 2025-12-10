import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *   ciphertext: string
 *   nonce: string
 *   hashedPassword: string
 * }} params
 * @returns {Promise<boolean>}
 */
export const initWithCredentials = async (params) => {
  if (!params.ciphertext || !params.nonce || !params.hashedPassword) {
    throw new Error('Missing required parameters')
  }

  const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
    ciphertext: params.ciphertext,
    nonce: params.nonce,
    hashedPassword: params.hashedPassword
  })

  if (!decryptVaultKeyRes) {
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)

  return true
}
