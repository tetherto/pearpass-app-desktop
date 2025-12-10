import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *   password: string
 * }} params
 * @returns {Promise<boolean>}
 */
export const initWithPassword = async (params) => {
  if (!params.password) {
    throw new Error('Password is required')
  }

  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    const masterEncryptionGetRes =
      await pearpassVaultClient.vaultsGet('masterEncryption')

    const hashedPassword = await pearpassVaultClient.getDecryptionKey({
      salt: masterEncryptionGetRes.salt,
      password: params.password
    })

    if (masterEncryptionGetRes.hashedPassword !== hashedPassword) {
      throw new Error(
        'Provided credentials do not match existing master encryption'
      )
    }

    return true
  }

  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  const { ciphertext, nonce, salt } = encryptionGetRes

  const hashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt,
    password: params.password
  })

  const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
    ciphertext,
    nonce,
    hashedPassword
  })

  if (!decryptVaultKeyRes) {
    await pearpassVaultClient.recordFailedMasterPassword()
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)

  return true
}
