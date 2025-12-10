import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<Array<Object>>}
 */
export const listRecords = async () => {
  const records = await pearpassVaultClient.activeVaultList(`record/`)

  return records
}
