import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const addDefaultBlindMirrors = async () => {
  await pearpassVaultClient.addDefaultBlindMirrors()
}
