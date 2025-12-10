import { listVaults } from './listVaults'

/**
 * Check if the vault is protected
 * @param {string} vaultId
 * @returns {Promise<boolean>}
 */
export const checkVaultIsProtected = async (vaultId) => {
  const vaults = await listVaults()

  const vault = vaults.find((vault) => vault.id === vaultId)

  if (!vault) {
    throw new Error('Vault not found')
  }

  const { ciphertext, nonce, salt } = vault?.encryption || {}

  return !!(ciphertext && nonce && salt)
}
