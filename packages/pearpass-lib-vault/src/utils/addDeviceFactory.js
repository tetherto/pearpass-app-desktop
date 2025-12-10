import { generateUniqueId } from 'pear-apps-utils-generate-unique-id'

import { validateAndPrepareDevice } from './validateAndPrepareDevice'

/**
 * @param {{
 *  data: object,
 * }} payload
 * @param {string} vaultId
 * @returns {Object}
 */
export const addDeviceFactory = (payload, vaultId) => {
  if (!payload || !vaultId) {
    throw new Error('Payload and vaultId are required')
  }

  const device = {
    id: generateUniqueId(),
    vaultId: vaultId,
    name: payload,
    createdAt: Date.now()
  }

  return validateAndPrepareDevice(device)
}
