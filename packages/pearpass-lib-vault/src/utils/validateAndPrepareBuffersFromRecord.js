import { processFiles } from './processFiles'
import { prepareIdentityFiles } from './validateAndPrepareIdentityData'

/**
 * @param {Object} record
 * @param {string} record.id
 * @param {string} record.type
 * @param {string} record.vaultId
 * @param {Object} record.data
 * @param {Array} [record.data.attachments]
 * @param {string|null} [record.folder]
 * @param {boolean} [record.isFavorite]
 * @param {string|Date} record.createdAt
 * @param {string|Date} record.updatedAt
 *
 * @returns {{
 *  recordWithoutBuffers: Object,
 *  buffersWithId: Array<{ id: string, buffer: Buffer }>
 * }}
 */
export const validateAndPrepareBuffersFromRecord = (record) => {
  let recordData = record.data

  const { buffersWithId, files: attachedFilesWithoutBuffers } = processFiles(
    recordData?.attachments || []
  )

  if (record.type === 'identity') {
    const { identityData, buffersWithId: identityBuffersWithId } =
      prepareIdentityFiles(recordData)

    buffersWithId.push(...identityBuffersWithId)

    recordData = identityData
  }

  const preparedRecord = {
    id: record.id,
    type: record.type,
    vaultId: record.vaultId,
    data: { ...recordData, attachments: attachedFilesWithoutBuffers },
    folder: record.folder || null,
    isFavorite: record.isFavorite,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }

  return { recordWithoutBuffers: preparedRecord, buffersWithId }
}
