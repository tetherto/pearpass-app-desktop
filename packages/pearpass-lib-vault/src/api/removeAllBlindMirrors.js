import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const removeAllBlindMirrors = async () => {
  await pearpassVaultClient.removeAllBlindMirrors()
}
