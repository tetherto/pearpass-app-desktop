import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { validateAndPrepareRecord } from './validateAndPrepareRecord'

/**
 * @param {{
 *  type: string,
 *  data: object,
 *  folder: string,
 *  isFavorite: boolean
 * }} payload
 * @param {string} vaultId
 * @returns {Object}
 */
export const createRecordFactory = (payload, vaultId) => {
  if (!payload || !vaultId) {
    throw new Error('Payload and vaultId are required')
  }

  const record = {
    id: generateUniqueId(),
    type: payload.type,
    vaultId: vaultId,
    data: payload.data,
    folder: payload.folder || null,
    isFavorite: !!payload.isFavorite,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  return validateAndPrepareRecord(record)
}
