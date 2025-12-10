import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { updateVaultPassword } from './helpers/updateVaultPassword'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'
import { listVaults } from './listVaults'

/**
 * @param {Object} params
 * @param {Object} params.vault
 * @param {string} [params.newPassword]
 * @param {string} params.currentPassword
 * @throws {Error}
 */
export const updateProtectedVault = async ({
  vault,
  currentPassword,
  newPassword
}) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVault = await pearpassVaultClient.activeVaultGet(`vault`)

  if (activeVault && vault.id === activeVault.id) {
    return updateActiveProtectedVault({
      activeVault,
      vault,
      newPassword,
      currentPassword
    })
  }

  return updateInactiveProtectedVault({
    vault,
    activeVault,
    newPassword,
    currentPassword
  })
}

/**
 * Updates the active protected vault with a new password or vault data.
 *
 * @async
 * @function updateActiveProtectedVault
 * @param {Object} params - The parameters for updating the vault.
 * @param {Object} params.activeVault - The currently active vault object.
 * @param {Object} params.vault - The vault object to update.
 * @param {string} params.newPassword - The new password to set for the vault (optional).
 * @param {string} params.currentPassword - The current password for authentication.
 * @throws {Error} Throws an error if the current password is invalid.
 * @returns {Promise<void|*>} Returns the result of updating the vault password if a new password is provided, otherwise resolves when the vault is updated.
 */
const updateActiveProtectedVault = async ({
  activeVault,
  vault,
  newPassword,
  currentPassword
}) => {
  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: activeVault.encryption.salt,
    password: currentPassword
  })

  if (activeVault.encryption.hashedPassword !== currentHashedPassword) {
    throw new Error('Invalid password')
  }

  if (newPassword?.length) {
    return updateVaultPassword(newPassword, vault)
  }

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)
}

/**
 * Updates an inactive protected vault with new credentials or password.
 *
 *
 * @async
 * @function
 * @param {Object} params - The parameters for updating the vault.
 * @param {Object} params.vault - The vault object to update.
 * @param {Object} params.activeVault - The currently active vault object.
 * @param {string} [params.newPassword] - The new password to set for the vault (optional).
 * @param {string} params.currentPassword - The current password for decrypting the vault.
 * @throws Will throw an error if initialization of the inactive vault fails.
 * @returns {Promise<void>} Resolves when the vault update process is complete.
 */
const updateInactiveProtectedVault = async ({
  vault,
  activeVault,
  newPassword,
  currentPassword
}) => {
  const vaults = await listVaults()
  const { ciphertext, nonce, salt } =
    vaults.find((v) => v.id === vault.id)?.encryption || {}

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: salt,
    password: currentPassword
  })

  const masterEncryption = await getMasterPasswordEncryption()

  const activeVaultEncryption = activeVault?.encryption
    ? activeVault.encryption
    : masterEncryption

  try {
    await initActiveVaultWithCredentials(vault.id, {
      ciphertext: ciphertext,
      nonce: nonce,
      salt: salt,
      hashedPassword: currentHashedPassword
    })
  } catch (error) {
    await initActiveVaultWithCredentials(activeVault.id, activeVaultEncryption)
    throw error
  }

  if (newPassword?.length) {
    await updateVaultPassword(newPassword, vault)
  } else {
    await pearpassVaultClient.activeVaultAdd(`vault`, vault)
    await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)
  }

  await initActiveVaultWithCredentials(activeVault.id, activeVaultEncryption)
}
