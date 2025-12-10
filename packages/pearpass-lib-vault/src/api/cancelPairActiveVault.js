import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<void>}
 * @throws {Error}
 */
export const cancelPairActiveVault = async () => {
  await pearpassVaultClient.cancelPairActiveVault()
}
