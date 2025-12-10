import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *  id: string
 *  name: string
 * }} vault
 * @param {string} password
 * @returns {Promise<void>}
 */
export const createProtectedVault = async (vault, password) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  const { hashedPassword, salt } =
    await pearpassVaultClient.hashPassword(password)

  const { ciphertext, nonce } =
    await pearpassVaultClient.encryptVaultKeyWithHashedPassword(hashedPassword)

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    hashedPassword,
    ciphertext,
    nonce
  })

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, {
    ...vault,
    encryption: {
      ciphertext,
      nonce,
      salt
    }
  })

  await pearpassVaultClient.activeVaultInit({
    id: vault.id,
    encryptionKey
  })

  await pearpassVaultClient.activeVaultAdd(`vault`, {
    ...vault,
    encryption: {
      ciphertext,
      nonce,
      salt,
      hashedPassword
    }
  })
}
