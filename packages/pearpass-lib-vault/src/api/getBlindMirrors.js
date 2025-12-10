import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<string[]>}
 */
export const getBlindMirrors = async () => pearpassVaultClient.getBlindMirrors()
