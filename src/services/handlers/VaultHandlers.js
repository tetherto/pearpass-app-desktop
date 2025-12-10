import { HANDLER_EVENTS } from '../../constants/services'
import { logger } from '../../utils/logger'

/**
 * Handles vault-related IPC operations
 */
export class VaultHandlers {
  constructor(client) {
    this.client = client
  }

  async vaultsInit(params) {
    logger.debug(
      'VAULT-HANDLER',
      `vaultsInit called with encryptionKey: ${params?.encryptionKey ? 'provided' : 'missing'}`
    )

    // Initialize vaults
    await this.client.vaultsInit(params.encryptionKey)

    return { initialized: true }
  }

  async vaultsGetStatus() {
    return await this.client.vaultsGetStatus()
  }

  async vaultsGet(params) {
    return await this.client.vaultsGet(params.key)
  }

  async vaultsList(params) {
    logger.debug(
      'VAULT-HANDLER',
      `vaultsList called with filterKey: ${params?.filterKey}`
    )

    // Check vault status first
    const vaultsStatus = await this.client.vaultsGetStatus()
    logger.debug(
      'VAULT-HANDLER',
      `Vaults status before list: ${JSON.stringify(vaultsStatus)}`
    )

    const result = await this.client.vaultsList(params?.filterKey)
    logger.debug(
      'VAULT-HANDLER',
      `vaultsList result: ${JSON.stringify(result)}`
    )

    // Also check encryption status
    const encStatus = await this.client.encryptionGetStatus()
    logger.debug(
      'VAULT-HANDLER',
      `Encryption status: ${JSON.stringify(encStatus)}`
    )

    return result
  }

  async vaultsAdd(params) {
    await this.client.vaultsAdd(params.key, params.vault || params.data)
    return { success: true }
  }

  async vaultsClose() {
    await this.client.vaultsClose()
    return { success: true }
  }

  async activeVaultInit(params) {
    const result = await this.client.activeVaultInit({
      id: params.id,
      encryptionKey: params.encryptionKey
    })

    // After initializing, also load the vault metadata
    if (result?.success) {
      await this.loadVaultMetadata(params.id)
    }

    return result
  }

  async loadVaultMetadata(vaultId) {
    // Find the vault from the vaults list
    const vaults = await this.client.vaultsList('vault/')
    const vault = vaults?.data?.find((v) => v.id === vaultId)

    if (vault) {
      // Store the vault metadata in active vault storage
      const vaultData = {
        id: vault.id,
        name: vault.name,
        version: vault.version,
        records: vault.records || [],
        devices: vault.devices || [],
        createdAt: vault.createdAt,
        updatedAt: vault.updatedAt
      }
      await this.client.activeVaultAdd('vault', vaultData)
      logger.debug(
        'VAULT-HANDLER',
        `Stored vault metadata after init: ${JSON.stringify(vaultData)}`
      )
    }
  }

  async activeVaultGetStatus() {
    return await this.client.activeVaultGetStatus()
  }

  async activeVaultGet(params) {
    return await this.client.activeVaultGet(params.key)
  }

  async activeVaultList(params) {
    const encStatus = await this.client.encryptionGetStatus()
    const vaultsStatus = await this.client.vaultsGetStatus()
    const activeVaultStatus = await this.client.activeVaultGetStatus()

    logger.debug(
      'VAULT-HANDLER',
      `Before activeVaultList: ${JSON.stringify({
        encStatus,
        vaultsStatus,
        activeVaultStatus,
        filterKey: params?.filterKey
      })}`
    )

    return await this.client.activeVaultList(params?.filterKey)
  }

  async activeVaultAdd(params) {
    await this.client.activeVaultAdd(params.key, params.data)
    return { success: true }
  }

  async activeVaultRemove(params) {
    await this.client.activeVaultRemove(params.key)
    return { success: true }
  }

  async activeVaultClose() {
    await this.client.activeVaultClose()
    return { success: true }
  }

  async activeVaultCreateInvite() {
    return await this.client.activeVaultCreateInvite()
  }

  async activeVaultDeleteInvite() {
    await this.client.activeVaultDeleteInvite()
    return { success: true }
  }

  async pairActiveVault(params) {
    return await this.client.pairActiveVault(params.inviteCode)
  }

  async initListener(params) {
    await this.client.initListener({ vaultId: params.vaultId })
    return { success: true }
  }

  async closeAllInstances() {
    let wasAuthenticated

    try {
      const status = await this.client.vaultsGetStatus()

      wasAuthenticated = status?.status
    } catch (e) {
      logger.error(
        'VAULT-HANDLER',
        'ERROR',
        `Error checking vault status before closing instances: ${e.message}`
      )
      wasAuthenticated = false
    }

    // close all instances
    await this.client.closeAllInstances()

    // If desktop was authenticated emit an event to navigate to master password screen
    if (wasAuthenticated) {
      logger.log(
        'VAULT-HANDLER',
        'INFO',
        'Desktop was authenticated, navigating to master password screen after extension exit'
      )

      if (global.window) {
        global.window.dispatchEvent(
          new CustomEvent(HANDLER_EVENTS.extensionExit)
        )
      }
    }

    return { success: true }
  }

  async cancelPairActiveVault(params) {
    return await this.client.cancelPairActiveVault(params.inviteCode)
  }

  async activeVaultRemoveFile(params) {
    await this.client.activeVaultRemoveFile(params.key)
    return { success: true }
  }
}
