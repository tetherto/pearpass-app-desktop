import { pearpassVaultClient } from '../instances'
import { checkVaultIsProtected } from './checkVaultIsProtected'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { getVaultById } from './getVaultById'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'
import { logger } from '../utils/logger'

/**
 * @param {string} vaultId
 * @param {Object} [params]
 * @param {string} [params.password]
 * @param {string} [params.ciphertext]
 * @param {string} [params.nonce]
 * @param {string} [params.hashedPassword]
 * @returns {Promise<void>}
 */
export const getVaultByIdAndClose = async (vaultId, params) => {
  let currentVault
  let vault

  const masterEncryption = await getMasterPasswordEncryption()

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (res?.status) {
    currentVault = await pearpassVaultClient.activeVaultGet(`vault`)
  }

  const encryption = (await checkVaultIsProtected(currentVault.id))
    ? currentVault.encryption
    : masterEncryption

  try {
    vault = await getVaultById(vaultId, params)
  } catch (e) {
    await initActiveVaultWithCredentials(currentVault.id, encryption)
    logger.error('Error fetching vault by ID:', e.message)
    throw new Error('Error decrypting vault key')
  }

  await initActiveVaultWithCredentials(currentVault.id, encryption)

  return vault
}
