jest.mock('fs', () => ({
  promises: {
    unlink: jest.fn()
  }
}))
jest.mock('os', () => ({
  platform: jest.fn(),
  tmpdir: jest.fn()
}))
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn()
  }
}))

import fs from 'fs'

import { SocketManager, getIpcPath } from './SocketManager'

const { logger } = require('../../utils/logger')

describe('SocketManager', () => {
  const socketName = 'testSocket'
  const unixPath = '/tmp/testSocket.sock'
  const winPath = '\\\\?\\pipe\\testSocket'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSocketPath', () => {
    it('returns Windows pipe path on win32', () => {
      require('os').platform.mockReturnValue('win32')
      const manager = new SocketManager(socketName)
      expect(manager.getSocketPath(socketName)).toBe(winPath)
    })

    it('returns Unix socket path on non-win32', () => {
      require('os').platform.mockReturnValue('linux')
      require('os').tmpdir.mockReturnValue('/tmp')
      const manager = new SocketManager(socketName)
      expect(manager.getSocketPath(socketName)).toBe(unixPath)
    })
  })

  describe('getPath', () => {
    it('returns the socket path', () => {
      require('os').platform.mockReturnValue('linux')
      require('os').tmpdir.mockReturnValue('/tmp')
      const manager = new SocketManager(socketName)
      expect(manager.getPath()).toBe(unixPath)
    })
  })

  describe('cleanupSocket', () => {
    it('does nothing on win32', async () => {
      require('os').platform.mockReturnValue('win32')
      const manager = new SocketManager(socketName)
      await manager.cleanupSocket()
      expect(fs.promises.unlink).not.toHaveBeenCalled()
    })

    it('calls unlink and logs info on Unix', async () => {
      require('os').platform.mockReturnValue('linux')
      require('os').tmpdir.mockReturnValue('/tmp')
      fs.promises.unlink.mockResolvedValue()
      const manager = new SocketManager(socketName)
      await manager.cleanupSocket()
      expect(fs.promises.unlink).toHaveBeenCalledWith(unixPath)
      expect(logger.info).toHaveBeenCalledWith(
        'SOCKET-MANAGER',
        'Cleaned up existing socket file'
      )
    })

    it('logs warn if unlink throws non-ENOENT error', async () => {
      require('os').platform.mockReturnValue('linux')
      require('os').tmpdir.mockReturnValue('/tmp')
      const error = new Error('fail')
      error.code = 'EACCES'
      fs.promises.unlink.mockRejectedValue(error)
      const manager = new SocketManager(socketName)
      await manager.cleanupSocket()
      expect(logger.warn).toHaveBeenCalledWith(
        'SOCKET-MANAGER',
        expect.stringContaining('Could not clean up socket file')
      )
    })

    it('does not log warn if unlink throws ENOENT error', async () => {
      require('os').platform.mockReturnValue('linux')
      require('os').tmpdir.mockReturnValue('/tmp')
      const error = new Error('not found')
      error.code = 'ENOENT'
      fs.promises.unlink.mockRejectedValue(error)
      const manager = new SocketManager(socketName)
      await manager.cleanupSocket()
      expect(logger.warn).not.toHaveBeenCalled()
    })
  })
})

describe('getIpcPath', () => {
  it('returns socket path for given name', () => {
    require('os').platform.mockReturnValue('linux')
    require('os').tmpdir.mockReturnValue('/tmp')
    expect(getIpcPath('foo')).toBe('/tmp/foo.sock')
  })
})
