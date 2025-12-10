import { pearpassVaultClient } from '../instances'

/**
 * @async
 * @param {string} vaultId
 * @param {Object} encryption
 * @param {string} encryption.ciphertext
 * @param {string} encryption.nonce
 * @param {string} encryption.hashedPassword
 * @returns {Promise<boolean>}
 */
export const initActiveVaultWithCredentials = async (vaultId, encryption) => {
  if (
    !encryption.ciphertext ||
    !encryption.nonce ||
    !encryption.hashedPassword ||
    !vaultId
  ) {
    throw new Error('Missing required parameters')
  }

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (res?.status) {
    const currentVault = await pearpassVaultClient.activeVaultGet(`vault`)

    if (currentVault && vaultId === currentVault.id) {
      return true
    }

    await pearpassVaultClient.activeVaultClose()
  }

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    ciphertext: encryption.ciphertext,
    nonce: encryption.nonce,
    hashedPassword: encryption.hashedPassword
  })

  if (!encryptionKey) {
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.activeVaultInit({
    id: vaultId,
    encryptionKey
  })

  return true
}
