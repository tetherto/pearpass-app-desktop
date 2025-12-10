import { pearpassVaultClient } from '../instances'

/**
 * @param {string} key
 * @returns {Promise<void>}
 */
export const removeBlindMirror = async (key) => {
  if (!key) {
    throw new Error('[removeBlindMirror]: Blind mirror key is required!')
  }

  await pearpassVaultClient.removeBlindMirror(key)
}
