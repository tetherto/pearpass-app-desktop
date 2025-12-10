import { pearpassVaultClient } from '../instances'

/**
 * @param {Array<Object>}records
 * @returns {Promise<void>}
 */
export const updateRecords = async (records) => {
  if (!records?.length) {
    throw new Error('Record is required')
  }

  await Promise.all(
    records.map((record) =>
      pearpassVaultClient.activeVaultAdd(`record/${record.id}`, record)
    )
  )
}
