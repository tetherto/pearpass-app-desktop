import os from 'bare-os'
import path from 'bare-path'

/**
 * Returns cross-platform IPC path
 * Socket is stored in temp directory
 * @param {string} socketName
 * @returns {string}
 */
export const getIpcPath = (socketName) => {
  if (os.platform() === 'win32') {
    return `\\\\?\\pipe\\${socketName}`
  }

  // Socket is in temp directory
  return path.join(os.tmpdir(), `${socketName}.sock`)
}
