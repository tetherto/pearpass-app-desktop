import { pearpassVaultClient } from '../instances'

/**
 * @param {string} key
 */
export const vaultGetFile = async (key) => {
  if (!key) {
    throw new Error('Key is required to get a file')
  }

  const res = await pearpassVaultClient.activeVaultGetFile(key)

  return res
}
