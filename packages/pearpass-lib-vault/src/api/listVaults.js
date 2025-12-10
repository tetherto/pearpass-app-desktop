import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<Array<any>>}
 */
export const listVaults = async () => {
  const vaults = await pearpassVaultClient.vaultsList('vault/')

  return vaults
}
