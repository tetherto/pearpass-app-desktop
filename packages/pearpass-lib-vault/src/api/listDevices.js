import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<Array<Object>>}
 */
export const listDevices = async () =>
  pearpassVaultClient.activeVaultList(`device/`)
