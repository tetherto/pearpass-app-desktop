#!/usr/bin/env node

// Native messaging host - bridges browser extension to PearPass desktop app via IPC

import process from 'bare-process'
import IPC from 'pear-ipc'

import {
  COMMAND_DEFINITIONS,
  isValidCommand
} from './constants/commandDefinitions'
import { NativeMessagingHandler } from './nativeMessagingHandler'
import { getIpcPath } from './utils/getIpcPath'
import { log } from './utils/log'

// Desktop app status constants
const DESKTOP_APP_STATUS = Object.freeze({
  CONNECTED: 'connected',
  NOT_RUNNING: 'not-running',
  INTEGRATION_DISABLED: 'integration-disabled',
  CONNECTING: 'connecting',
  UNKNOWN: 'unknown'
})

// Timeout constants (in milliseconds)
const TIMEOUTS = Object.freeze({
  IPC_CONNECTION: 5000, // 5 seconds to establish IPC connection
  IPC_CALL: 5000 // 5 seconds for IPC method calls
})

// Error messages for each status
const STATUS_MESSAGES = Object.freeze({
  [DESKTOP_APP_STATUS.NOT_RUNNING]: 'PearPass desktop app is not running',
  [DESKTOP_APP_STATUS.INTEGRATION_DISABLED]:
    'Browser extension integration is disabled in PearPass desktop app. Please enable it in Settings > Privacy',
  [DESKTOP_APP_STATUS.CONNECTING]: 'Connecting to PearPass desktop app...',
  [DESKTOP_APP_STATUS.UNKNOWN]: 'Unable to connect to PearPass desktop app'
})

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message identifier
 * @property {string} [method] - Method to call
 * @property {string} [command] - Command to execute (alternative to method)
 * @property {Object} [params] - Parameters for the method/command
 */

/**
 * @typedef {Object} Response
 * @property {string} id - Message identifier
 * @property {boolean} success - Whether the operation succeeded
 * @property {*} [result] - Operation result
 * @property {string} [error] - Error message if failed
 * @property {string} [errorCode] - Error code if failed
 */

class NativeMessagingHost {
  constructor() {
    /** @type {NativeMessagingHandler} */
    this.handler = new NativeMessagingHandler()
    /** @type {import('pear-ipc').Client|null} */
    this.ipcClient = null
    /** @type {boolean} */
    this.isRunning = false
    /** @type {string} */
    this.socketPath = getIpcPath('pearpass-native-messaging')
    /** @type {string} */
    this.desktopAppStatus = DESKTOP_APP_STATUS.UNKNOWN
  }

  /**
   * @returns {Promise<void>}
   */
  async start() {
    if (this.isRunning) {
      return
    }

    try {
      log('INFO', 'Starting simple native messaging host...')

      // Set up native messaging handler first
      this.handler.on('message', async (message) => {
        const { command } = message || {}
        const commandName = command || 'unknown'
        log('INFO', `Received message from extension: ${commandName}`)
        await this.handleMessage(message)
      })

      this.handler.on('disconnect', () => {
        log('INFO', 'Native messaging disconnected')
        this.stop()
      })

      this.handler.on('error', (error) => {
        log('INFO', 'Native messaging handler error: ' + error.message)
        if (error.stack) {
          log('INFO', 'Error stack: ' + error.stack)
        }
        this.stop()
      })

      // Start the native messaging handler
      this.handler.start()
      this.isRunning = true

      log(
        'INFO',
        'Simple native messaging host started, attempting IPC connection...'
      )

      // Try to connect to IPC server (non-blocking)
      this.connectToIPC().catch((error) => {
        log('INFO', 'Initial IPC connection failed: ' + error.message)
        this.updateDesktopAppStatus(error)
      })
    } catch (error) {
      log(
        'INFO',
        'Failed to start simple native messaging host: ' + error.message
      )
      throw error
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async connectToIPC() {
    try {
      this.desktopAppStatus = DESKTOP_APP_STATUS.CONNECTING
      log('INFO', `Attempting to connect to IPC server at: ${this.socketPath}`)

      // Create new IPC client connection
      this.ipcClient = new IPC.Client({
        socketPath: this.socketPath,
        connect: true,
        connectTimeout: TIMEOUTS.IPC_CONNECTION,
        methods: COMMAND_DEFINITIONS
      })

      // Wait for connection with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Connection timed out'))
        }, TIMEOUTS.IPC_CONNECTION)
      })

      await Promise.race([this.ipcClient.ready(), timeoutPromise])

      log('INFO', 'Successfully connected to IPC server')

      // Update status
      this.desktopAppStatus = DESKTOP_APP_STATUS.CONNECTED

      // Set up disconnect handler
      this.ipcClient.on('close', () => {
        log('INFO', 'IPC client disconnected')
        this.desktopAppStatus = DESKTOP_APP_STATUS.NOT_RUNNING
        this.ipcClient = null
      })
    } catch (error) {
      log('INFO', `Failed to connect to IPC server: ${error.message}`)
      this.updateDesktopAppStatus(error)

      // Clean up client on failure
      if (this.ipcClient) {
        try {
          this.ipcClient.close()
        } catch {
          // Ignore close errors
        }
        this.ipcClient = null
      }
    }
  }

  /**
   * @param {Error} error
   */
  updateDesktopAppStatus(error) {
    if (error.message.includes('ENOENT')) {
      this.desktopAppStatus = DESKTOP_APP_STATUS.NOT_RUNNING
    } else {
      this.desktopAppStatus = DESKTOP_APP_STATUS.INTEGRATION_DISABLED
    }
  }

  /**
   * @param {Message} message
   * @returns {Promise<void>}
   */
  async handleMessage(message) {
    const { id, method, command, params } = message
    const methodName = method || command

    try {
      // Remove any padding added to work around Chrome 255-byte bug
      const cleanParams = params ? { ...params } : {}
      delete cleanParams.padding

      log('INFO', `Processing request: ${methodName}`)

      // Handle special checkAvailability command
      if (methodName === 'checkAvailability') {
        // Always try to connect when checking availability
        if (this.desktopAppStatus !== DESKTOP_APP_STATUS.CONNECTED) {
          log('INFO', 'Checking availability - attempting to connect...')
          try {
            await this.connectToIPC()
          } catch (connectError) {
            log(
              'INFO',
              `Availability check - connection failed: ${connectError.message}`
            )
          }
        }

        const response = {
          id,
          success: true,
          result: {
            available: this.desktopAppStatus === DESKTOP_APP_STATUS.CONNECTED,
            status: this.desktopAppStatus,
            message:
              STATUS_MESSAGES[this.desktopAppStatus] ||
              STATUS_MESSAGES[DESKTOP_APP_STATUS.UNKNOWN]
          }
        }
        this.handler.send(response)
        log('INFO', 'Sent availability check response')
        return
      }

      // For all other commands, check if desktop app is available
      if (this.desktopAppStatus !== DESKTOP_APP_STATUS.CONNECTED) {
        // Try to reconnect first
        log('INFO', 'Desktop app not connected, attempting to connect...')
        try {
          await this.connectToIPC()
        } catch (connectError) {
          log('INFO', `Failed to connect: ${connectError.message}`)
        }

        // Check again after connection attempt
        if (this.desktopAppStatus !== DESKTOP_APP_STATUS.CONNECTED) {
          const errorMessage =
            STATUS_MESSAGES[this.desktopAppStatus] ||
            STATUS_MESSAGES[DESKTOP_APP_STATUS.UNKNOWN]
          this.handler.send({
            id,
            success: false,
            error: errorMessage,
            errorCode: this.desktopAppStatus
          })
          log('INFO', `Sent error response: ${errorMessage}`)
          return
        }
      }

      // Check if IPC client is still connected
      if (!this.ipcClient || this.ipcClient.closed) {
        log('INFO', 'IPC client is not connected, attempting to reconnect...')
        await this.reconnectIPC()
      }

      let result = null

      // Call the appropriate method on the IPC client with timeout
      if (isValidCommand(methodName) && this.ipcClient[methodName]) {
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                `IPC call timed out after ${TIMEOUTS.IPC_CALL / 1000} seconds`
              )
            )
          }, TIMEOUTS.IPC_CALL)
        })

        try {
          // Race between the IPC call and timeout
          result = await Promise.race([
            this.ipcClient[methodName](cleanParams),
            timeoutPromise
          ])
        } catch (error) {
          // If it's a timeout or connection error, update status
          if (
            error.message.includes('timed out') ||
            error.message.includes('RPC destroyed')
          ) {
            log('INFO', 'IPC call failed, desktop app may have been closed')
            this.desktopAppStatus = DESKTOP_APP_STATUS.NOT_RUNNING
            this.ipcClient = null
          }
          throw error
        }
      } else {
        throw new Error(`Unknown method: ${methodName}`)
      }

      // Send success response
      this.handler.send({
        id,
        success: true,
        result
      })

      log('INFO', `Sent response for ${methodName}`)
    } catch (error) {
      log('INFO', `Error handling message: ${error.message}`)

      // If it's an RPC destroyed error, try to reconnect
      if (error.message.includes('RPC destroyed')) {
        log('INFO', 'RPC destroyed detected, attempting to reconnect...')
        try {
          await this.reconnectIPC()
          // Retry the message after reconnection
          return this.handleMessage(message)
        } catch (reconnectError) {
          log('INFO', `Failed to reconnect: ${reconnectError.message}`)
          this.updateDesktopAppStatus(reconnectError)
        }
      }

      // Send error response
      this.handler.send({
        id,
        success: false,
        error: error.message
      })
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async reconnectIPC() {
    try {
      // Close existing client if any
      if (this.ipcClient) {
        try {
          this.ipcClient.close()
        } catch {
          // Ignore close errors
        }
        this.ipcClient = null
      }

      // Use connectToIPC which handles status updates
      await this.connectToIPC()

      if (this.desktopAppStatus !== DESKTOP_APP_STATUS.CONNECTED) {
        throw new Error(STATUS_MESSAGES[this.desktopAppStatus])
      }
    } catch (error) {
      log('INFO', `Failed to reconnect to IPC server: ${error.message}`)
      throw error
    }
  }

  stop() {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    if (this.ipcClient) {
      this.ipcClient.close()
      this.ipcClient = null
    }

    if (this.handler) {
      this.handler.stop()
    }

    log('INFO', 'Simple native messaging host stopped')
  }
}

// Log early to verify logging works
log('INFO', 'Native messaging host script started')

// Create and start the host
const host = new NativeMessagingHost()

// Graceful shutdown
process.on('SIGINT', () => {
  host.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  host.stop()
  process.exit(0)
})

process.on('uncaughtException', (error) => {
  log('INFO', 'Uncaught exception: ' + error.message)
  log('INFO', 'Stack trace: ' + error.stack)
  host.stop()
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log('INFO', 'Unhandled rejection at: ' + promise + ' reason: ' + reason)
  host.stop()
  process.exit(1)
})

// Start the host
log('INFO', 'About to start host...')
host.start().catch((error) => {
  log('INFO', 'Failed to start host: ' + error.message)
  log('INFO', 'Stack trace: ' + error.stack)
  Pear.exit()
})
