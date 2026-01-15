import { platform } from 'os'
import { join } from 'path'

import IPC from 'pear-ipc'

import {
  getIpcPath,
  getIPCSocketPath,
  isNativeMessagingIPCRunning,
  NativeMessagingIPCServer,
  startNativeMessagingIPC,
  stopNativeMessagingIPC
} from './nativeMessagingIPCServer.js'
import { logger } from '../utils/logger.js'

// Mock dependencies
jest.mock('os', () => ({
  ...jest.requireActual('os'),
  platform: jest.fn(),
  tmpdir: jest.fn(() => '/tmp')
}))

// Mock Pear.config.storage
global.Pear = {
  config: {
    storage: '/mock/pear/storage'
  }
}

jest.mock('pear-ipc', () => ({
  Server: jest.fn().mockImplementation(function (options) {
    this.options = options
    this.on = jest.fn()
    this.ready = jest.fn().mockResolvedValue()
    this.close = jest.fn().mockResolvedValue()
    return this
  })
}))

jest.mock('../utils/logger.js', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    debugMode: true
  }
}))

// Mock the new handler modules
jest.mock('./handlers/SecurityHandlers', () => ({
  SecurityHandlers: jest.fn().mockImplementation(function (client) {
    this.client = client
    this.nmGetAppIdentity = jest.fn().mockResolvedValue({
      ed25519PublicKey: 'mock-ed25519-key',
      x25519PublicKey: 'mock-x25519-key',
      fingerprint: 'mock-fingerprint'
    })
    this.nmBeginHandshake = jest.fn().mockResolvedValue({
      sessionId: 'mock-session-id',
      appEphemeralPubB64: 'mock-ephemeral-key',
      signatureB64: 'mock-signature'
    })
    this.nmFinishHandshake = jest.fn().mockResolvedValue({ ok: true })
    this.nmCloseSession = jest.fn().mockResolvedValue({ ok: true })
    this.checkAvailability = jest.fn().mockResolvedValue({
      available: true,
      status: 'running',
      message: 'Desktop app is running'
    })
    this.nmResetPairing = jest.fn().mockResolvedValue({
      ok: true,
      clearedSessions: 0,
      newIdentity: {
        ed25519PublicKey: 'new-mock-ed25519-key',
        x25519PublicKey: 'new-mock-x25519-key',
        creationDate: new Date().toISOString()
      }
    })
  })
}))

jest.mock('./handlers/EncryptionHandlers', () => ({
  EncryptionHandlers: jest.fn().mockImplementation(function (client) {
    this.client = client
    this.encryptionInit = jest.fn().mockResolvedValue({ initialized: true })
    this.encryptionGetStatus = jest.fn().mockResolvedValue({ status: true })
    this.encryptionGet = jest.fn().mockResolvedValue({ data: 'encrypted-data' })
    this.encryptionAdd = jest.fn().mockResolvedValue({ success: true })
    this.hashPassword = jest.fn().mockResolvedValue('hashed-password')
    this.encryptVaultKeyWithHashedPassword = jest
      .fn()
      .mockResolvedValue('encrypted-key')
    this.encryptVaultWithKey = jest.fn().mockResolvedValue('encrypted-vault')
    this.getDecryptionKey = jest.fn().mockResolvedValue('decryption-key')
    this.decryptVaultKey = jest.fn().mockResolvedValue('decrypted-key')
    this.recordFailedMasterPassword = jest
      .fn()
      .mockResolvedValue({ success: true })
    this.getMasterPasswordStatus = jest
      .fn()
      .mockResolvedValue({ isLocked: false, failedAttempts: 0 })
  })
}))

jest.mock('./handlers/VaultHandlers', () => ({
  VaultHandlers: jest.fn().mockImplementation(function (client) {
    this.client = client
    this.vaultsInit = jest.fn().mockResolvedValue({ initialized: true })
    this.vaultsGetStatus = jest.fn().mockResolvedValue({ status: true })
    this.vaultsGet = jest.fn().mockResolvedValue({ data: {} })
    this.vaultsList = jest.fn().mockResolvedValue({ data: [] })
    this.vaultsAdd = jest.fn().mockResolvedValue({ success: true })
    this.vaultsClose = jest.fn().mockResolvedValue({ success: true })
    this.activeVaultInit = jest.fn().mockResolvedValue({ success: true })
    this.loadVaultMetadata = jest.fn().mockResolvedValue()
    this.activeVaultGetStatus = jest.fn().mockResolvedValue({ status: true })
    this.activeVaultGet = jest.fn().mockResolvedValue({ data: {} })
    this.activeVaultList = jest.fn().mockResolvedValue({ data: [] })
    this.activeVaultAdd = jest.fn().mockResolvedValue({ success: true })
    this.activeVaultRemove = jest.fn().mockResolvedValue({ success: true })
    this.activeVaultClose = jest.fn().mockResolvedValue({ success: true })
    this.activeVaultCreateInvite = jest
      .fn()
      .mockResolvedValue({ invite: 'mock-invite' })
    this.activeVaultDeleteInvite = jest
      .fn()
      .mockResolvedValue({ success: true })
    this.pairActiveVault = jest.fn().mockResolvedValue({ success: true })
    this.initListener = jest.fn().mockResolvedValue({ success: true })
    this.closeAllInstances = jest.fn().mockResolvedValue({ success: true })
    this.cancelPairActiveVault = jest.fn().mockResolvedValue({ success: true })
    this.activeVaultRemoveFile = jest.fn().mockResolvedValue({ success: true })
  })
}))

jest.mock('./handlers/SecureRequestHandler', () => ({
  SecureRequestHandler: jest
    .fn()
    .mockImplementation(function (client, registry) {
      this.client = client
      this.methodRegistry = registry
      this.handle = jest.fn().mockResolvedValue({
        nonceB64: 'mock-nonce',
        ciphertextB64: 'mock-ciphertext',
        seq: 1
      })
    })
}))

const mockPearpassClient = {
  encryptionInit: jest.fn(),
  encryptionGetStatus: jest.fn(),
  encryptionGet: jest.fn(),
  encryptionAdd: jest.fn(),
  vaultsInit: jest.fn(),
  vaultsGetStatus: jest.fn(),
  vaultsGet: jest.fn(),
  vaultsList: jest.fn(),
  vaultsAdd: jest.fn(),
  vaultsClose: jest.fn(),
  activeVaultInit: jest.fn(),
  activeVaultGetStatus: jest.fn(),
  activeVaultGet: jest.fn(),
  activeVaultList: jest.fn(),
  activeVaultAdd: jest.fn(),
  activeVaultRemove: jest.fn(),
  activeVaultClose: jest.fn(),
  activeVaultCreateInvite: jest.fn(),
  activeVaultDeleteInvite: jest.fn(),
  hashPassword: jest.fn(),
  encryptVaultKeyWithHashedPassword: jest.fn(),
  encryptVaultWithKey: jest.fn(),
  getDecryptionKey: jest.fn(),
  decryptVaultKey: jest.fn(),
  pairActiveVault: jest.fn(),
  initListener: jest.fn(),
  closeAllInstances: jest.fn(),
  cancelPairActiveVault: jest.fn()
}

describe('nativeMessagingIPCServer', () => {
  beforeEach(async () => {
    jest.clearAllMocks()

    // Reset singleton instance state before each test
    try {
      await stopNativeMessagingIPC()
    } catch {
      // ignore
    }
  })

  describe('getIpcPath', () => {
    it('should return a windows named pipe path on win32', () => {
      platform.mockReturnValue('win32')
      const socketName = 'test-socket'
      expect(getIpcPath(socketName)).toBe(`\\\\?\\pipe\\${socketName}`)
    })

    it('should return a unix domain socket path on non-win32 platforms', () => {
      platform.mockReturnValue('linux')
      const socketName = 'test-socket'
      expect(getIpcPath(socketName)).toBe(join('/tmp', `${socketName}.sock`))
    })
  })

  describe('NativeMessagingIPCServer', () => {
    let serverInstance

    beforeEach(() => {
      platform.mockReturnValue('linux')
      serverInstance = new NativeMessagingIPCServer(mockPearpassClient)
    })

    it('should construct with initial state', () => {
      expect(serverInstance.client).toBe(mockPearpassClient)
      expect(serverInstance.server).toBeNull()
      expect(serverInstance.isRunning).toBe(false)
      expect(serverInstance.socketPath).toBe(
        join('/tmp', 'pearpass-native-messaging.sock')
      )
    })

    describe('start', () => {
      it('should start the IPC server successfully', async () => {
        await serverInstance.start()

        expect(IPC.Server).toHaveBeenCalledTimes(1)
        expect(serverInstance.server.ready).toHaveBeenCalledTimes(1)
        expect(serverInstance.isRunning).toBe(true)
        expect(logger.info).toHaveBeenCalledWith(
          'IPC-SERVER',
          'Starting native messaging IPC server...'
        )
        expect(logger.info).toHaveBeenCalledWith(
          'IPC-SERVER',
          `Native messaging IPC server started successfully on ${serverInstance.socketPath}`
        )
      })

      it('should not start if already running', async () => {
        serverInstance.isRunning = true
        await serverInstance.start()

        expect(IPC.Server).not.toHaveBeenCalled()
        expect(logger.info).toHaveBeenCalledWith(
          'IPC-SERVER',
          'IPC server is already running'
        )
      })

      it('should handle and log errors during startup', async () => {
        const error = new Error('Startup failed')
        IPC.Server.mockImplementationOnce(function () {
          this.on = jest.fn()
          this.ready = jest.fn().mockRejectedValue(error)
          return this
        })

        const newServer = new NativeMessagingIPCServer(mockPearpassClient)
        await expect(newServer.start()).rejects.toThrow(error)
        expect(newServer.isRunning).toBe(false)
        expect(logger.error).toHaveBeenCalledWith(
          'IPC-SERVER',
          `Failed to start IPC server: ${error.message}`
        )
      })

      it('should correctly wire up secure handlers to the pearpass client', async () => {
        await serverInstance.start()
        const handlers = IPC.Server.mock.calls[0][0].handlers

        // Test that security handlers are available
        expect(handlers.nmGetAppIdentity).toBeDefined()
        expect(handlers.nmBeginHandshake).toBeDefined()
        expect(handlers.nmFinishHandshake).toBeDefined()
        expect(handlers.nmSecureRequest).toBeDefined()
        expect(handlers.nmCloseSession).toBeDefined()

        // Test encryption bootstrap handlers
        expect(handlers.encryptionInit).toBeDefined()
        expect(handlers.encryptionGetStatus).toBeDefined()

        // Test availability check handler
        expect(handlers.checkAvailability).toBeDefined()
        const availability = await handlers.checkAvailability()
        expect(availability).toEqual({
          available: true,
          status: 'running',
          message: 'Desktop app is running'
        })

        // Test that sensitive handlers are NOT directly exposed
        // They should only be accessible via nmSecureRequest
        expect(handlers.encryptionGet).toBeUndefined()
        expect(handlers.encryptionAdd).toBeUndefined()
        expect(handlers.vaultsList).toBeUndefined()
        expect(handlers.activeVaultList).toBeUndefined()
      })

      it('should call nmGetAppIdentity handler correctly', async () => {
        await serverInstance.start()
        const handlers = IPC.Server.mock.calls[0][0].handlers

        const result = await handlers.nmGetAppIdentity()
        expect(result).toEqual({
          ed25519PublicKey: 'mock-ed25519-key',
          x25519PublicKey: 'mock-x25519-key',
          fingerprint: 'mock-fingerprint'
        })
      })

      it('should call nmBeginHandshake handler correctly', async () => {
        await serverInstance.start()
        const handlers = IPC.Server.mock.calls[0][0].handlers

        const result = await handlers.nmBeginHandshake({
          extEphemeralPubB64: 'test-key'
        })
        expect(result).toEqual({
          sessionId: 'mock-session-id',
          appEphemeralPubB64: 'mock-ephemeral-key',
          signatureB64: 'mock-signature'
        })
      })

      it('should call nmSecureRequest handler correctly', async () => {
        await serverInstance.start()
        const handlers = IPC.Server.mock.calls[0][0].handlers

        const result = await handlers.nmSecureRequest({
          sessionId: 'test-session',
          nonceB64: 'test-nonce',
          ciphertextB64: 'test-ciphertext',
          seq: 1
        })
        expect(result).toEqual({
          nonceB64: 'mock-nonce',
          ciphertextB64: 'mock-ciphertext',
          seq: 1
        })
      })
    })

    describe('stop', () => {
      it('should stop the server if it is running', async () => {
        await serverInstance.start()
        const server = serverInstance.server

        await serverInstance.stop()

        expect(server.close).toHaveBeenCalledTimes(1)
        expect(serverInstance.isRunning).toBe(false)
        expect(serverInstance.server).toBeNull()
        expect(logger.info).toHaveBeenCalledWith(
          'IPC-SERVER',
          'Stopping native messaging IPC server...'
        )
        expect(logger.info).toHaveBeenCalledWith(
          'IPC-SERVER',
          'Native messaging IPC server stopped'
        )
      })

      it('should not do anything if the server is not running', async () => {
        await serverInstance.stop()
        expect(logger.info).not.toHaveBeenCalledWith(
          'IPC-SERVER',
          'Stopping native messaging IPC server...'
        )
      })
    })
  })

  describe('Singleton Functions', () => {
    beforeEach(() => {
      platform.mockReturnValue('linux')
    })

    it('startNativeMessagingIPC should start and return an instance', async () => {
      const instance = await startNativeMessagingIPC(mockPearpassClient)
      expect(instance).toBeInstanceOf(NativeMessagingIPCServer)
      expect(instance.isRunning).toBe(true)
      expect(isNativeMessagingIPCRunning()).toBe(true)
    })

    it('startNativeMessagingIPC should return the existing instance if already running', async () => {
      const instance1 = await startNativeMessagingIPC(mockPearpassClient)
      const instance2 = await startNativeMessagingIPC(mockPearpassClient)
      expect(instance1).toBe(instance2)
      expect(logger.info).toHaveBeenCalledWith(
        'IPC-SERVER',
        'Native messaging IPC server is already running'
      )
    })

    it('stopNativeMessagingIPC should stop the running instance', async () => {
      await startNativeMessagingIPC(mockPearpassClient)
      expect(isNativeMessagingIPCRunning()).toBe(true)

      await stopNativeMessagingIPC()
      expect(isNativeMessagingIPCRunning()).toBe(false)
    })

    it('stopNativeMessagingIPC should do nothing if not running', async () => {
      await stopNativeMessagingIPC()
      expect(logger.info).toHaveBeenCalledWith(
        'IPC-SERVER',
        'Native messaging IPC server is not running'
      )
    })

    it('getIPCSocketPath should return the correct path when running', async () => {
      const instance = await startNativeMessagingIPC(mockPearpassClient)
      expect(getIPCSocketPath()).toBe(instance.socketPath)
    })

    it('getIPCSocketPath should return a default path when not running', () => {
      platform.mockReturnValue('linux')
      expect(getIPCSocketPath()).toBe(
        join('/tmp', 'pearpass-native-messaging.sock')
      )
    })
  })
})
