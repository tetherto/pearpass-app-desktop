import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { listVaults } from './listVaults'

/**
 * @param {string} vaultId
 * @param {Object} [params]
 * @param {string} [params.password]
 * @param {string} [params.ciphertext]
 * @param {string} [params.nonce]
 * @param {string} [params.hashedPassword]
 * @returns {Promise<void>}
 */
export const getVaultById = async (vaultId, params) => {
  const vaults = await listVaults()

  if (!vaults.some((vault) => vault.id === vaultId)) {
    throw new Error('Vault not found')
  }

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (res?.status) {
    const currentVault = await pearpassVaultClient.activeVaultGet(`vault`)

    if (currentVault && vaultId === currentVault.id) {
      return currentVault
    } else {
      await pearpassVaultClient.activeVaultClose()
    }
  }

  let encryptionKey

  if (params?.ciphertext && params?.nonce && params?.hashedPassword) {
    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      ciphertext: params.ciphertext,
      nonce: params.nonce,
      hashedPassword: params.hashedPassword
    })

    await pearpassVaultClient.activeVaultInit({ id: vaultId, encryptionKey })

    const newVault = await pearpassVaultClient.activeVaultGet(`vault`)

    return newVault
  }

  if (!params?.password?.length) {
    const masterEncryption = await getMasterPasswordEncryption()

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      hashedPassword: masterEncryption.hashedPassword,
      ciphertext: masterEncryption.ciphertext,
      nonce: masterEncryption.nonce
    })
  } else {
    const vault = vaults.find((vault) => vault.id === vaultId)

    if (!vault) {
      throw new Error('Vault not found')
    }

    const { ciphertext, nonce, salt } = vault.encryption || {}

    const hashedPassword = await pearpassVaultClient.getDecryptionKey({
      password: params?.password,
      salt
    })

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      hashedPassword,
      ciphertext,
      nonce
    })
  }

  if (!encryptionKey) {
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.activeVaultInit({ id: vaultId, encryptionKey })

  const newVault = await pearpassVaultClient.activeVaultGet(`vault`)

  return newVault
}
