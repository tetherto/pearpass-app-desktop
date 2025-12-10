import IPC from 'pear-ipc'

import { COMMAND_DEFINITIONS } from '../shared/commandDefinitions'
import { logger } from '../utils/logger'
import { EncryptionHandlers } from './handlers/EncryptionHandlers'
import { SecureRequestHandler } from './handlers/SecureRequestHandler'
import { SecurityHandlers } from './handlers/SecurityHandlers'
import { VaultHandlers } from './handlers/VaultHandlers'
import { MethodRegistry } from './ipc/MethodRegistry'
import { SocketManager, getIpcPath } from './ipc/SocketManager'

// Re-export for backward compatibility
export { getIpcPath }

/**
 * IPC server for native messaging bridge communication
 */
export class NativeMessagingIPCServer {
  /**
   * @param {import('pearpass-lib-vault-mobile').PearpassVaultClient} pearpassClient
   */
  constructor(pearpassClient) {
    /** @type {import('pearpass-lib-vault-mobile').PearpassVaultClient} */
    this.client = pearpassClient
    /** @type {import('pear-ipc').Server|null} */
    this.server = null
    /** @type {boolean} */
    this.isRunning = false
    /** @type {SocketManager} */
    this.socketManager = new SocketManager('pearpass-native-messaging')
    /** @type {string} */
    this.socketPath = this.socketManager.getPath()

    // Create wrapper function for IPC activity
    const ipcActivityWrapper =
      (handler) =>
      async (...args) => {
        this.emitIPCActivity()
        return handler(...args)
      }

    /** @type {MethodRegistry} */
    this.methodRegistry = new MethodRegistry(ipcActivityWrapper)
    /** @type {MethodRegistry} */
    this.secureMethodRegistry = new MethodRegistry(ipcActivityWrapper)
    /** @type {Map<string, number>} */
    this.clientRequestCounts = new Map()

    // Initialize handlers
    this.setupHandlers()
  }

  /**
   * Setup all method handlers
   */
  setupHandlers() {
    // Security handlers
    const securityHandlers = new SecurityHandlers(this.client)
    const encryptionHandlers = new EncryptionHandlers(this.client)
    const vaultHandlers = new VaultHandlers(this.client)

    // Register security methods (always available)
    this.methodRegistry.register(
      'nmGetAppIdentity',
      securityHandlers.nmGetAppIdentity.bind(securityHandlers)
    )
    this.methodRegistry.register(
      'nmBeginHandshake',
      securityHandlers.nmBeginHandshake.bind(securityHandlers)
    )
    this.methodRegistry.register(
      'nmFinishHandshake',
      securityHandlers.nmFinishHandshake.bind(securityHandlers)
    )
    this.methodRegistry.register(
      'nmCloseSession',
      securityHandlers.nmCloseSession.bind(securityHandlers)
    )
    this.methodRegistry.register(
      'nmResetPairing',
      securityHandlers.nmResetPairing.bind(securityHandlers)
    )
    this.methodRegistry.register(
      'checkAvailability',
      securityHandlers.checkAvailability.bind(securityHandlers)
    )

    // Register encryption bootstrap methods
    this.methodRegistry.register(
      'encryptionInit',
      encryptionHandlers.encryptionInit.bind(encryptionHandlers)
    )
    this.methodRegistry.register(
      'encryptionGetStatus',
      encryptionHandlers.encryptionGetStatus.bind(encryptionHandlers)
    )

    // Register secure channel handler
    const secureRequestHandler = new SecureRequestHandler(
      this.client,
      this.secureMethodRegistry
    )
    this.methodRegistry.register(
      'nmSecureRequest',
      secureRequestHandler.handle.bind(secureRequestHandler),
      { logLevel: 'DEBUG' }
    )

    // Register methods accessible through secure channel
    this.registerSecureMethods(encryptionHandlers, vaultHandlers)
  }

  /**
   * Emit IPC activity event to reset inactivity timer
   */
  emitIPCActivity() {
    if (global.window) {
      logger.debug('IPC-SERVER', 'Emitting IPC activity event')
      global.window.dispatchEvent(new Event('ipc-activity'))
    }
  }

  /**
   * Register methods that are only accessible through the secure channel
   */
  registerSecureMethods(encryptionHandlers, vaultHandlers) {
    // Encryption methods
    this.secureMethodRegistry.register(
      'encryptionInit',
      encryptionHandlers.encryptionInit.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'encryptionGetStatus',
      encryptionHandlers.encryptionGetStatus.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'encryptionGet',
      encryptionHandlers.encryptionGet.bind(encryptionHandlers),
      { logLevel: 'DEBUG' }
    )
    this.secureMethodRegistry.register(
      'encryptionAdd',
      encryptionHandlers.encryptionAdd.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'hashPassword',
      encryptionHandlers.hashPassword.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'encryptVaultKeyWithHashedPassword',
      encryptionHandlers.encryptVaultKeyWithHashedPassword.bind(
        encryptionHandlers
      )
    )
    this.secureMethodRegistry.register(
      'encryptVaultWithKey',
      encryptionHandlers.encryptVaultWithKey.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'getDecryptionKey',
      encryptionHandlers.getDecryptionKey.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'decryptVaultKey',
      encryptionHandlers.decryptVaultKey.bind(encryptionHandlers),
      { logLevel: 'DEBUG' }
    )
    this.secureMethodRegistry.register(
      'getMasterPasswordStatus',
      encryptionHandlers.getMasterPasswordStatus.bind(encryptionHandlers)
    )
    this.secureMethodRegistry.register(
      'recordFailedMasterPassword',
      encryptionHandlers.recordFailedMasterPassword.bind(encryptionHandlers)
    )

    // Vault methods
    this.secureMethodRegistry.register(
      'vaultsInit',
      vaultHandlers.vaultsInit.bind(vaultHandlers),
      { logLevel: 'DEBUG' }
    )
    this.secureMethodRegistry.register(
      'vaultsGetStatus',
      vaultHandlers.vaultsGetStatus.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'vaultsGet',
      vaultHandlers.vaultsGet.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'vaultsList',
      vaultHandlers.vaultsList.bind(vaultHandlers),
      { requiresStatus: ['encryption', 'vaults'], logLevel: 'DEBUG' }
    )
    this.secureMethodRegistry.register(
      'vaultsAdd',
      vaultHandlers.vaultsAdd.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'vaultsClose',
      vaultHandlers.vaultsClose.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultInit',
      vaultHandlers.activeVaultInit.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultGetStatus',
      vaultHandlers.activeVaultGetStatus.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultGet',
      vaultHandlers.activeVaultGet.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultList',
      vaultHandlers.activeVaultList.bind(vaultHandlers),
      {
        requiresStatus: ['encryption', 'vaults', 'activeVault'],
        logLevel: 'DEBUG'
      }
    )
    this.secureMethodRegistry.register(
      'activeVaultAdd',
      vaultHandlers.activeVaultAdd.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultRemove',
      vaultHandlers.activeVaultRemove.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultClose',
      vaultHandlers.activeVaultClose.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultCreateInvite',
      vaultHandlers.activeVaultCreateInvite.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultDeleteInvite',
      vaultHandlers.activeVaultDeleteInvite.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'pairActiveVault',
      vaultHandlers.pairActiveVault.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'initListener',
      vaultHandlers.initListener.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'closeAllInstances',
      vaultHandlers.closeAllInstances.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'cancelPairActiveVault',
      vaultHandlers.cancelPairActiveVault.bind(vaultHandlers)
    )
    this.secureMethodRegistry.register(
      'activeVaultRemoveFile',
      vaultHandlers.activeVaultRemoveFile.bind(vaultHandlers)
    )
  }

  /**
   * @returns {Promise<void>}
   */
  async start() {
    if (this.isRunning) {
      logger.info('IPC-SERVER', 'IPC server is already running')
      return
    }

    try {
      logger.info('IPC-SERVER', 'Starting native messaging IPC server...')

      // Clean up any existing socket file
      await this.socketManager.cleanupSocket()

      // Build handlers from registry
      const handlers = {}
      for (const [name, handler] of this.methodRegistry.handlers) {
        handlers[name] = handler
      }

      logger.info(
        'IPC-SERVER',
        `Registered ${this.methodRegistry.getMethodNames().length} handlers`
      )

      // Create IPC server
      this.server = new IPC.Server({
        socketPath: this.socketPath,
        methods: COMMAND_DEFINITIONS,
        handlers: handlers
      })

      // Handle new client connections
      this.server.on('client', (client) => {
        logger.info('IPC-SERVER', `New IPC client connected: ${client.id}`)

        // Initialize request count for this client
        this.clientRequestCounts.set(client.id, 0)

        client.on('close', () => {
          const requestCount = this.clientRequestCounts.get(client.id) || 0
          logger.info(
            'IPC-SERVER',
            `IPC client disconnected: ${client.id} after ${requestCount} requests`
          )
          this.clientRequestCounts.delete(client.id)
        })

        client.on('error', (error) => {
          logger.error(
            'IPC-SERVER',
            `IPC client error (${client.id}): ${error.message}`
          )
        })
      })

      this.server.on('error', (error) => {
        logger.error('IPC-SERVER', `IPC server error: ${error.message}`)
      })

      // Start listening
      await this.server.ready()

      this.isRunning = true
      logger.info(
        'IPC-SERVER',
        `Native messaging IPC server started successfully on ${this.socketPath}`
      )
    } catch (error) {
      logger.error('IPC-SERVER', `Failed to start IPC server: ${error.message}`)
      throw error
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this.isRunning) {
      return
    }

    logger.info('IPC-SERVER', 'Stopping native messaging IPC server...')

    if (this.server) {
      await this.server.close()
      this.server = null
    }

    // Clean up socket file
    await this.socketManager.cleanupSocket()

    this.isRunning = false
    logger.info('IPC-SERVER', 'Native messaging IPC server stopped')
  }
}

/** @type {NativeMessagingIPCServer|null} */
let ipcServerInstance = null

/**
 * @param {import('pearpass-lib-vault-mobile').PearpassVaultClient} pearpassClient
 * @returns {Promise<NativeMessagingIPCServer>}
 */
export const startNativeMessagingIPC = async (pearpassClient) => {
  if (ipcServerInstance?.isRunning) {
    logger.info('IPC-SERVER', 'Native messaging IPC server is already running')
    return ipcServerInstance
  }

  ipcServerInstance = new NativeMessagingIPCServer(pearpassClient)
  await ipcServerInstance.start()

  return ipcServerInstance
}

/**
 * @returns {Promise<void>}
 */
export const stopNativeMessagingIPC = async () => {
  if (!ipcServerInstance?.isRunning) {
    logger.info('IPC-SERVER', 'Native messaging IPC server is not running')
    return
  }

  await ipcServerInstance.stop()
  ipcServerInstance = null
}

/**
 * @returns {boolean}
 */
export const isNativeMessagingIPCRunning = () =>
  ipcServerInstance?.isRunning || false

/**
 * @returns {string}
 */
export const getIPCSocketPath = () =>
  ipcServerInstance?.socketPath ?? getIpcPath('pearpass-native-messaging')
