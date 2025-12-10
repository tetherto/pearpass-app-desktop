import { pearpassVaultClient } from '../instances'

/**
 * @param {string[]} blindMirrors
 * @returns {Promise<void>}
 */
export const addBlindMirrors = async (blindMirrors) => {
  if (!Array.isArray(blindMirrors) || blindMirrors.length === 0) {
    throw new Error('[addBlindMirrors]: No blind mirrors provided!')
  }

  await pearpassVaultClient.addBlindMirrors(blindMirrors)
}
