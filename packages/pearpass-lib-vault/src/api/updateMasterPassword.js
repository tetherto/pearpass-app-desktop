import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

/**
 * @param {{password: string, currentPassword: string}} porps
 * @returns {Promise<{
 *   hashedPassword: string
 *   salt: string
 *   ciphertext: string
 *   nonce: string
 * }>}
 */
export const updateMasterPassword = async ({
  newPassword,
  currentPassword
}) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const decryptVaultKeyRes = await checkCurrentPassword(currentPassword)

  const { hashedPassword, salt } =
    await pearpassVaultClient.hashPassword(newPassword)

  const { ciphertext, nonce } = await pearpassVaultClient.encryptVaultWithKey(
    hashedPassword,
    decryptVaultKeyRes
  )

  const vaultsGetRes = await pearpassVaultClient.vaultsGetStatus()

  const newDecryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
    ciphertext,
    nonce,
    hashedPassword
  })

  if (newDecryptVaultKeyRes !== decryptVaultKeyRes) {
    throw new Error('Failed to verify new password encryption')
  }

  if (!vaultsGetRes?.status) {
    await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)
  }

  await pearpassVaultClient.vaultsAdd('masterEncryption', {
    ciphertext,
    nonce,
    salt,
    hashedPassword
  })

  await pearpassVaultClient.encryptionAdd(`masterPassword`, {
    ciphertext,
    nonce,
    salt
  })

  return { hashedPassword, salt, ciphertext, nonce }
}

/**
 * @param {string} currentPassword
 * @returns {Promise<string>}
 * @throws {Error} If the current password is invalid
 */
const checkCurrentPassword = async (currentPassword) => {
  const { ciphertext, nonce, hashedPassword, salt } =
    await getMasterPasswordEncryption()

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt,
    password: currentPassword
  })

  if (hashedPassword !== currentHashedPassword) {
    throw new Error('Invalid password')
  }

  return pearpassVaultClient.decryptVaultKey({
    ciphertext,
    nonce,
    hashedPassword
  })
}
