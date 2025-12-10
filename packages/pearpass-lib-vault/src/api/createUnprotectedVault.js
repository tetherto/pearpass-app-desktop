import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

/**
 * @param {{
 *  id: string
 *  name: string
 * }} vault
 * @returns {Promise<void>}
 */
export const createUnprotectedVault = async (vault) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  const { hashedPassword } = await getMasterPasswordEncryption()

  const { ciphertext, nonce } =
    await pearpassVaultClient.encryptVaultKeyWithHashedPassword(hashedPassword)

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    hashedPassword,
    ciphertext,
    nonce
  })

  await pearpassVaultClient.activeVaultInit({
    id: vault.id,
    encryptionKey
  })

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
}
