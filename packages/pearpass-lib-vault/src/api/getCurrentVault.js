import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<{id: string} | undefined>}
 */
export const getCurrentVault = async () => {
  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (!res?.status) {
    return undefined
  }

  return pearpassVaultClient.activeVaultGet(`vault`)
}
