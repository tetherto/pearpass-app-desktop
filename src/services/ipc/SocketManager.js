import fs from 'fs'
import { homedir, platform } from 'os'
import { join } from 'path'

import { IPC_SOCKET_DIR_NAME } from '@tetherto/pearpass-lib-constants'

import { logger } from '../../utils/logger'

const { unlink } = fs.promises

const getSocketDir = () => join(homedir(), IPC_SOCKET_DIR_NAME)

/**
 * Manages IPC socket creation and cleanup
 */
export class SocketManager {
  constructor(socketName) {
    this.socketName = socketName
    this.socketPath = this.getSocketPath(socketName)
  }

  /**
   * Get platform-specific socket path
   */
  getSocketPath(socketName) {
    if (platform() === 'win32') {
      return `\\\\?\\pipe\\${socketName}`
    }

    return join(getSocketDir(), `${socketName}.sock`)
  }

  /**
   * Clean up existing socket file (Unix only)
   */
  async cleanupSocket() {
    if (platform() === 'win32') return

    try {
      await unlink(this.socketPath)
      logger.info('SOCKET-MANAGER', 'Cleaned up existing socket file')
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.warn(
          'SOCKET-MANAGER',
          `Could not clean up socket file: ${err.message}`
        )
      }
    }
  }

  /**
   * Ensure the socket directory exists
   */
  async ensureSocketDir() {
    if (platform() === 'win32') return
    await fs.promises.mkdir(getSocketDir(), { recursive: true })
  }

  /**
   * Get the socket path
   */
  getPath() {
    return this.socketPath
  }
}

/**
 * Helper function for backward compatibility
 */
export const getIpcPath = (socketName) => {
  const manager = new SocketManager(socketName)
  return manager.getPath()
}
