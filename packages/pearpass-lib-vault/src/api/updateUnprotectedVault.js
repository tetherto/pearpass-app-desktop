import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { updateVaultPassword } from './helpers/updateVaultPassword'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'

/**
 * @param {Object} vault
 * @param {string} vault.id
 * @param {Object} [vault.encryption]
 * @param {string} [newPassword]
 */
export const updateUnprotectedVault = async (vault, newPassword) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVault = await pearpassVaultClient.activeVaultGet(`vault`)

  if (activeVault && vault.id === activeVault.id) {
    await updateActiveUnprotectedVault({
      vault,
      newPassword
    })
  }

  return updateInactiveUnprotectedVault({
    vault,
    activeVault,
    newPassword
  })
}

/**
 * Updates the active unprotected vault with new credentials or vault data.
 *
 * @async
 * @function updateActiveUnprotectedVault
 * @param {Object} params - The parameters for updating the vault.
 * @param {Object} params.vault - The vault object to update.
 * @param {string} [params.newPassword] - The new password to set for the vault (if provided).
 * @returns {Promise<void|*>} Returns the result of updating the vault password if a new password is provided, otherwise resolves when the vault is updated.
 */
const updateActiveUnprotectedVault = async ({ vault, newPassword }) => {
  if (newPassword?.length) {
    return updateVaultPassword(newPassword, vault)
  }

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)
}

/**
 * Updates an inactive unprotected vault with new credentials or adds it to the active vault.
 *
 * @async
 * @function updateInactiveUnprotectedVault
 * @param {Object} params - The parameters for updating the vault.
 * @param {Object} params.vault - The vault object to update.
 * @param {Object} params.activeVault - The currently active vault object.
 * @param {string} [params.newPassword] - The new password to set for the vault (if provided).
 * @returns {Promise<void>} Resolves when the vault update process is complete.
 * @throws Will rethrow any error encountered during initialization of the active vault with credentials.
 */
const updateInactiveUnprotectedVault = async ({
  vault,
  activeVault,
  newPassword
}) => {
  const masterEncryption = await getMasterPasswordEncryption()

  const activeVaultEncryption = activeVault?.encryption
    ? activeVault.encryption
    : masterEncryption

  try {
    await initActiveVaultWithCredentials(vault.id, masterEncryption)
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
