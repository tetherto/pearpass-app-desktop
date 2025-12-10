import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const closeAllInstances = async () => {
  await pearpassVaultClient.closeAllInstances()
}
