import { pearpassVaultClient } from '../instances'

/**
 * Get the vault encryption data
 * @param {string} vaultId
 * @returns {Promise<{
 *  salt?: string
 *  ciphertext?: string
 *  nonce?: string
 *  hashedPassword?: string
 * }>}
 */
export const getCurrentProtectedVaultEncryption = async (vaultId) => {
  const currentVault = await pearpassVaultClient.activeVaultGet(`vault`)

  if (!currentVault || vaultId !== currentVault.id) {
    throw new Error('Active vault does not match the requested vault id')
  }

  return currentVault.encryption || {}
}
