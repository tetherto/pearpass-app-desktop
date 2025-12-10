import { validateAndPrepareRecord } from './validateAndPrepareRecord'

/**
 * @param {{
 *  id: string,
 *  type: string,
 *  vaultId: string,
 *  data: object,
 *  folder: string,
 *  isFavorite: boolean
 * }} recordsPayload
 * @returns {Object[]}
 */
export const updateRecordsFactory = (recordsPayload) => {
  if (!recordsPayload || !Array.isArray(recordsPayload)) {
    throw new Error('Records payload must be an array')
  }

  const newRecords = recordsPayload.map((payload) => {
    const record = {
      id: payload.id,
      type: payload.type,
      vaultId: payload.vaultId,
      data: payload.data,
      folder: payload.folder || null,
      isFavorite: payload.isFavorite,
      createdAt: payload.createdAt,
      updatedAt: Date.now()
    }

    return validateAndPrepareRecord(record)
  })

  return newRecords
}
