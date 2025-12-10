import { pearpassVaultClient } from '../instances'

/**
 * @param {string} password
 * @returns {Promise<{
 *   ciphertext: string
 *   nonce: string
 *   salt: string
 *   hashedPassword: string
 * }>}
 */
export const createMasterPassword = async (password) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  if (encryptionGetRes) {
    throw new Error('Master password already exists')
  }

  const { hashedPassword, salt } =
    await pearpassVaultClient.hashPassword(password)

  const { ciphertext, nonce } =
    await pearpassVaultClient.encryptVaultKeyWithHashedPassword(hashedPassword)

  const vaultsGetRes = await pearpassVaultClient.vaultsGetStatus()

  if (!vaultsGetRes?.status) {
    const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
      ciphertext,
      nonce,
      hashedPassword
    })

    await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)
  }

  await pearpassVaultClient.vaultsAdd('masterEncryption', {
    ciphertext,
    nonce,
    salt,
    hashedPassword
  })

  await pearpassVaultClient.vaultsClose()

  await pearpassVaultClient.encryptionAdd(`masterPassword`, {
    ciphertext,
    nonce,
    salt
  })

  return { hashedPassword, salt, ciphertext, nonce }
}
