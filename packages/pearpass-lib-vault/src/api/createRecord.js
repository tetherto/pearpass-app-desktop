import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *  id: string,
 *  vaultId: string,
 * }} record
 * @returns {Promise<void>}
 */
export const createRecord = async (record) => {
  await pearpassVaultClient.activeVaultAdd(`record/${record.id}`, record)
}
