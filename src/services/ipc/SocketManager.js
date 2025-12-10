import fs from 'fs'
import { platform, tmpdir } from 'os'
import { join } from 'path'

import { logger } from '../../utils/logger'

const { unlink } = fs.promises

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
    return join(tmpdir(), `${socketName}.sock`)
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
