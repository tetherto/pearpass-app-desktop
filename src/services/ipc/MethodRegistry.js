import { logger } from '../../utils/logger'

/**
 * Registry for IPC method handlers with configuration support
 */
export class MethodRegistry {
  /**
   * @param {Function} wrapperFn - Optional function to wrap all handlers
   */
  constructor(wrapperFn = null) {
    this.handlers = new Map()
    this.configs = new Map()
    this.wrapperFn = wrapperFn
  }

  /**
   * Register a handler for a method
   * @param {string} name - Method name
   * @param {Function} handler - Handler function
   * @param {Object} config - Configuration for the handler
   */
  register(name, handler, config = {}) {
    // Apply wrapper if provided
    const wrappedHandler = this.wrapperFn ? this.wrapperFn(handler) : handler
    this.handlers.set(name, wrappedHandler)
    this.configs.set(name, {
      requiresStatus: config.requiresStatus || [],
      logLevel: config.logLevel || 'INFO',
      ...config
    })
  }

  /**
   * Execute a registered method
   * @param {string} methodName - Name of the method to execute
   * @param {any} params - Parameters for the method
   * @param {Object} context - Execution context (client, logger, etc.)
   */
  async execute(methodName, params, context) {
    const handler = this.handlers.get(methodName)
    if (!handler) {
      logger.error('METHOD-REGISTRY', `Unknown method: ${methodName}`)
      const availableMethods = Array.from(this.handlers.keys()).slice(0, 10)
      logger.error(
        'METHOD-REGISTRY',
        `Available methods: ${availableMethods.join(', ')}`
      )
      throw new Error(`UnknownMethod: ${methodName}`)
    }

    const config = this.configs.get(methodName)

    // Check if desktop is authenticated for non-exempt methods
    const authMethods = [
      'logIn',
      'logOut',
      'checkAuthStatus',
      'encryptionInit',
      'encryptionGet',
      'getDecryptionKey',
      'decryptVaultKey',
      'vaultsInit',
      'recordFailedMasterPassword',
      'getMasterPasswordStatus'
    ]
    const statusMethods = [
      'encryptionGetStatus',
      'vaultsGetStatus',
      'activeVaultGetStatus'
    ]
    const pairingMethods = [
      'nmGetAppIdentity',
      'nmGetPairingCode',
      'nmBeginHandshake',
      'nmFinishHandshake',
      'nmCloseSession'
    ]
    const exemptMethods = [...authMethods, ...statusMethods, ...pairingMethods]
    const shouldCheckAuth = !exemptMethods.includes(methodName)

    if (shouldCheckAuth) {
      try {
        const { client } = context
        const vaultsStatusRes = await client.vaultsGetStatus()
        logger.info(
          'METHOD-REGISTRY',
          `vaultsStatusRes ${JSON.stringify(vaultsStatusRes)}`
        )
        if (!!!vaultsStatusRes?.status) {
          logger.info(
            'METHOD-REGISTRY',
            `Desktop not authenticated for method ${methodName}`
          )
          throw new Error(
            'DesktopNotAuthenticated: Desktop app is not authenticated'
          )
        }
      } catch (error) {
        // If we can't check status or not initialized, desktop is not authenticated
        if (error.message.includes('DesktopNotAuthenticated')) {
          throw error
        }
        logger.info(
          'METHOD-REGISTRY',
          `Could not verify auth for ${methodName}: ${error.message}`
        )
        throw new Error(
          'DesktopNotAuthenticated: Desktop app is not authenticated'
        )
      }
    }

    // Log status checks if configured
    if (config.requiresStatus && config.requiresStatus.length > 0) {
      await this.performStatusChecks(methodName, config.requiresStatus, context)
    }

    // Log method call
    if (config.logLevel === 'DEBUG') {
      logger.debug('METHOD-REGISTRY', `Executing ${methodName}`)
    }

    try {
      // Execute handler
      const result = await handler(params)

      // Log result if debug
      if (config.logLevel === 'DEBUG' && result) {
        logger.debug('METHOD-REGISTRY', `${methodName} completed`)
      }

      return result
    } catch (error) {
      logger.error(
        'METHOD-REGISTRY',
        `Error in ${methodName}: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Perform status checks before method execution
   */
  async performStatusChecks(methodName, statusChecks, context) {
    const statuses = {}

    for (const check of statusChecks) {
      switch (check) {
        case 'encryption':
          statuses.encStatus = await context.client.encryptionGetStatus()
          break
        case 'vaults':
          statuses.vaultsStatus = await context.client.vaultsGetStatus()
          break
        case 'activeVault':
          statuses.activeVaultStatus =
            await context.client.activeVaultGetStatus()
          break
      }
    }

    if (Object.keys(statuses).length > 0) {
      logger.debug(
        'METHOD-REGISTRY',
        `Status before ${methodName}: ${JSON.stringify(statuses)}`
      )
    }
  }

  /**
   * Get all registered method names
   */
  getMethodNames() {
    return Array.from(this.handlers.keys())
  }

  /**
   * Check if a method is registered
   */
  hasMethod(name) {
    return this.handlers.has(name)
  }
}
