import { logger } from './logger'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

/**
 * Read the id of the vault the user last opened.
 * @returns {string | null} the stored vault id, or null if missing/unreadable
 */
export const getLastOpenedVaultId = () => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID)
  } catch (error) {
    logger.error(
      'lastOpenedVaultStorage',
      'Error reading last opened vault id:',
      error
    )
    return null
  }
}

/**
 * Persist the id of the vault the user just opened. No-ops on falsy ids and
 * swallows storage errors so it never breaks the calling flow.
 * @param {string} vaultId - id of the vault that became active
 */
export const setLastOpenedVaultId = (vaultId) => {
  if (!vaultId) return

  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID,
      String(vaultId)
    )
  } catch (error) {
    logger.error(
      'lastOpenedVaultStorage',
      'Error storing last opened vault id:',
      error
    )
  }
}
