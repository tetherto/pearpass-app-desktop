import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *  id: string,
 *  vaultId: string,
 * }} device
 * @returns {Promise<void>}
 */
export const addDevice = async (device) => {
  await pearpassVaultClient.activeVaultAdd(`device/${device.id}`, device)
}
