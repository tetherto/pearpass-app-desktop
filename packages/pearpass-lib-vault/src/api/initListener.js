import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *  vaultId: string
 *   onUpdate: () => void
 * }} options
 */
export const initListener = async ({ vaultId, onUpdate }) => {
  await pearpassVaultClient.initListener({ vaultId })

  pearpassVaultClient.removeAllListeners()

  pearpassVaultClient.on('update', onUpdate)
}
