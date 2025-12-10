import { pearpassVaultClient } from '../instances'

/**
 * @param {Array<string>} recordIds
 * @returns {Promise<void>}
 */
export const deleteRecords = async (recordIds) => {
  if (!recordIds?.length) {
    throw new Error('Record IDs is required')
  }

  await Promise.all(
    recordIds.map((recordId) =>
      pearpassVaultClient.activeVaultRemove(`record/${recordId}`)
    )
  )
}
