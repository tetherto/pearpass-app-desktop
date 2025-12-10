import { pearpassVaultClient } from '../../instances'
import { initActiveVaultWithCredentials } from '../initActiveVaultWithCredentials'

/**
 * Updates the encryption data of a vault with a new password.
 *
 * @async
 * @param {string} password - The new password to encrypt the vault with.
 * @param {Object} vault - The vault object to update.
 * @returns {Promise<void>} Resolves when the vault password has been updated.
 * @throws {Error} Throws an error if initializing the active vault with new credentials fails.
 */
export const updateVaultPassword = async (password, vault) => {
  const newEncryptionData = await getEncryptionFromPassword(password)

  const newVault = {
    ...vault,
    encryption: {
      ciphertext: newEncryptionData.ciphertext,
      nonce: newEncryptionData.nonce,
      salt: newEncryptionData.salt,
      hashedPassword: newEncryptionData.hashedPassword
    }
  }

  await pearpassVaultClient.activeVaultAdd(`vault`, newVault)

  await pearpassVaultClient.vaultsAdd(`vault/${newVault.id}`, {
    ...newVault,
    encryption: {
      ciphertext: newVault.encryption.ciphertext,
      nonce: newVault.encryption.nonce,
      salt: newVault.encryption.salt
    }
  })

  try {
    await initActiveVaultWithCredentials(vault.id, newEncryptionData)
  } catch (error) {
    throw error
  }
}

/**
 * Generates encryption data from a given password.
 *
 * @async
 * @param {string} password - The password to generate encryption data from.
 * @returns {Promise<Object>} An object containing hashedPassword, salt, ciphertext, and nonce.
 * @throws {Error} Throws an error if the password is not provided.
 */
const getEncryptionFromPassword = async (password) => {
  if (!password?.length) {
    throw new Error('Password is required')
  }

  const { hashedPassword, salt } =
    await pearpassVaultClient.hashPassword(password)

  const { ciphertext, nonce } =
    await pearpassVaultClient.encryptVaultKeyWithHashedPassword(hashedPassword)

  return {
    hashedPassword,
    salt,
    ciphertext,
    nonce
  }
}
