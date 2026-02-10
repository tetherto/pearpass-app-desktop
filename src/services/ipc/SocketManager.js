import fs from 'fs'
import { platform } from 'os'
import { join } from 'path'

import { logger } from '../../utils/logger'

const { unlink } = fs.promises

const SOCKET_DIR_NAME = 'pearpass'
const getSocketDir = () => join(Pear.config.pearDir, SOCKET_DIR_NAME)

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
