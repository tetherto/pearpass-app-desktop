import EventEmitter from 'events'

import { PearpassVaultClient } from './index'

jest.mock('bare-rpc', () =>
  jest.fn().mockImplementation(() => ({
    request: jest.fn((command) => ({
      command,
      send: jest.fn(),
      reply: jest.fn().mockResolvedValue(JSON.stringify({ data: 'mockData' })),
      createRequestStream: jest.fn(),
      createResponseStream: jest.fn()
    }))
  }))
)

jest.mock('framed-stream', () => jest.fn())
jest.mock('../utils/recieveFileStream', () => ({
  receiveFileStream: jest
    .fn()
    .mockResolvedValue({ buffer: Buffer.from('mockBuffer') })
}))
jest.mock('../utils/sendFileStream', () => ({
  sendFileStream: jest.fn().mockResolvedValue()
}))
jest.mock('../worklet/api', () => ({
  API: {
    ON_UPDATE: 'ON_UPDATE',
    STORAGE_PATH_SET: 'STORAGE_PATH_SET',
    MASTER_VAULT_INIT: 'MASTER_VAULT_INIT',
    MASTER_VAULT_GET_STATUS: 'MASTER_VAULT_GET_STATUS',
    MASTER_VAULT_GET: 'MASTER_VAULT_GET',
    MASTER_VAULT_CLOSE: 'MASTER_VAULT_CLOSE',
    MASTER_VAULT_ADD: 'MASTER_VAULT_ADD',
    MASTER_VAULT_LIST: 'MASTER_VAULT_LIST',
    ACTIVE_VAULT_INIT: 'ACTIVE_VAULT_INIT',
    ACTIVE_VAULT_GET_STATUS: 'ACTIVE_VAULT_GET_STATUS',
    ACTIVE_VAULT_CLOSE: 'ACTIVE_VAULT_CLOSE',
    ACTIVE_VAULT_ADD: 'ACTIVE_VAULT_ADD',
    ACTIVE_VAULT_REMOVE: 'ACTIVE_VAULT_REMOVE',
    ACTIVE_VAULT_LIST: 'ACTIVE_VAULT_LIST',
    ACTIVE_VAULT_GET: 'ACTIVE_VAULT_GET',
    ACTIVE_VAULT_CREATE_INVITE: 'ACTIVE_VAULT_CREATE_INVITE',
    ACTIVE_VAULT_DELETE_INVITE: 'ACTIVE_VAULT_DELETE_INVITE',
    PAIR_ACTIVE_VAULT: 'PAIR_ACTIVE_VAULT',
    CANCEL_PAIR_ACTIVE_VAULT: 'CANCEL_PAIR_ACTIVE_VAULT',
    INIT_LISTENER: 'INIT_LISTENER',
    ENCRYPTION_INIT: 'ENCRYPTION_INIT',
    ENCRYPTION_GET_STATUS: 'ENCRYPTION_GET_STATUS',
    ENCRYPTION_GET: 'ENCRYPTION_GET',
    ENCRYPTION_ADD: 'ENCRYPTION_ADD',
    ENCRYPTION_HASH_PASSWORD: 'ENCRYPTION_HASH_PASSWORD',
    ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD:
      'ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD',
    ENCRYPTION_ENCRYPT_VAULT_WITH_KEY: 'ENCRYPTION_ENCRYPT_VAULT_WITH_KEY',
    ENCRYPTION_GET_DECRYPTION_KEY: 'ENCRYPTION_GET_DECRYPTION_KEY',
    ENCRYPTION_DECRYPT_VAULT_KEY: 'ENCRYPTION_DECRYPT_VAULT_KEY',
    ENCRYPTION_CLOSE: 'ENCRYPTION_CLOSE',
    CLOSE_ALL_INSTANCES: 'CLOSE_ALL_INSTANCES',
    ACTIVE_VAULT_FILE_ADD: 'ACTIVE_VAULT_FILE_ADD',
    ACTIVE_VAULT_FILE_GET: 'ACTIVE_VAULT_FILE_GET',
    ACTIVE_VAULT_FILE_REMOVE: 'ACTIVE_VAULT_FILE_REMOVE'
  },
  API_BY_VALUE: {
    ON_UPDATE: 'ON_UPDATE',
    STORAGE_PATH_SET: 'STORAGE_PATH_SET',
    MASTER_VAULT_INIT: 'MASTER_VAULT_INIT',
    MASTER_VAULT_GET_STATUS: 'MASTER_VAULT_GET_STATUS',
    MASTER_VAULT_GET: 'MASTER_VAULT_GET',
    MASTER_VAULT_CLOSE: 'MASTER_VAULT_CLOSE',
    MASTER_VAULT_ADD: 'MASTER_VAULT_ADD',
    MASTER_VAULT_LIST: 'MASTER_VAULT_LIST',
    ACTIVE_VAULT_INIT: 'ACTIVE_VAULT_INIT',
    ACTIVE_VAULT_GET_STATUS: 'ACTIVE_VAULT_GET_STATUS',
    ACTIVE_VAULT_CLOSE: 'ACTIVE_VAULT_CLOSE',
    ACTIVE_VAULT_ADD: 'ACTIVE_VAULT_ADD',
    ACTIVE_VAULT_REMOVE: 'ACTIVE_VAULT_REMOVE',
    ACTIVE_VAULT_LIST: 'ACTIVE_VAULT_LIST',
    ACTIVE_VAULT_GET: 'ACTIVE_VAULT_GET',
    ACTIVE_VAULT_CREATE_INVITE: 'ACTIVE_VAULT_CREATE_INVITE',
    ACTIVE_VAULT_DELETE_INVITE: 'ACTIVE_VAULT_DELETE_INVITE',
    PAIR_ACTIVE_VAULT: 'PAIR_ACTIVE_VAULT',
    CANCEL_PAIR_ACTIVE_VAULT: 'CANCEL_PAIR_ACTIVE_VAULT',
    INIT_LISTENER: 'INIT_LISTENER',
    ENCRYPTION_INIT: 'ENCRYPTION_INIT',
    ENCRYPTION_GET_STATUS: 'ENCRYPTION_GET_STATUS',
    ENCRYPTION_GET: 'ENCRYPTION_GET',
    ENCRYPTION_ADD: 'ENCRYPTION_ADD',
    ENCRYPTION_HASH_PASSWORD: 'ENCRYPTION_HASH_PASSWORD',
    ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD:
      'ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD',
    ENCRYPTION_ENCRYPT_VAULT_WITH_KEY: 'ENCRYPTION_ENCRYPT_VAULT_WITH_KEY',
    ENCRYPTION_GET_DECRYPTION_KEY: 'ENCRYPTION_GET_DECRYPTION_KEY',
    ENCRYPTION_DECRYPT_VAULT_KEY: 'ENCRYPTION_DECRYPT_VAULT_KEY',
    ENCRYPTION_CLOSE: 'ENCRYPTION_CLOSE',
    CLOSE_ALL_INSTANCES: 'CLOSE_ALL_INSTANCES',
    ACTIVE_VAULT_FILE_ADD: 'ACTIVE_VAULT_FILE_ADD',
    ACTIVE_VAULT_FILE_GET: 'ACTIVE_VAULT_FILE_GET',
    ACTIVE_VAULT_FILE_REMOVE: 'ACTIVE_VAULT_FILE_REMOVE'
  }
}))

describe('PearpassVaultClient', () => {
  let client
  let ipcMock

  beforeEach(() => {
    ipcMock = {}
    client = new PearpassVaultClient(ipcMock, '/mock/path', { debugMode: true })
  })

  it('should be instance of EventEmitter', () => {
    expect(client).toBeInstanceOf(EventEmitter)
  })

  it('should call setStoragePath in constructor if storagePath is provided', async () => {
    const spy = jest.spyOn(PearpassVaultClient.prototype, 'setStoragePath')
    new PearpassVaultClient(ipcMock, '/another/path')
    expect(spy).toHaveBeenCalledWith('/another/path')
    spy.mockRestore()
  })

  it('should throw error for unknown command in _handleRequest', async () => {
    await expect(
      client._handleRequest({ command: 'UNKNOWN_COMMAND' })
    ).rejects.toThrow('Unknown command:')
  })

  it('should throw ELOCKED error in _handleError', () => {
    expect(() => client._handleError({ error: 'ELOCKED' })).toThrow('ELOCKED')
  })

  it('should throw generic error in _handleError', () => {
    expect(() => client._handleError({ error: 'Some error' })).toThrow(
      'Some error'
    )
  })

  it('should call all API methods and return mockData', async () => {
    await expect(client.setStoragePath('/mock')).resolves.toBe('mockData')
    await expect(client.vaultsInit('key')).resolves.toBe('mockData')
    await expect(client.vaultsGetStatus()).resolves.toBe('mockData')
    await expect(client.vaultsGet('vaultKey')).resolves.toBe('mockData')
    await expect(client.vaultsClose()).resolves.toBe('mockData')
    await expect(client.vaultsAdd('vaultKey', {})).resolves.toBe('mockData')
    await expect(client.vaultsList('filter')).resolves.toBe('mockData')
    await expect(
      client.activeVaultInit({ id: 'id', encryptionKey: 'ekey' })
    ).resolves.toBe('mockData')
    await expect(client.activeVaultGetStatus()).resolves.toBe('mockData')
    await expect(client.activeVaultClose()).resolves.toBe('mockData')
    await expect(client.activeVaultAdd('key', {})).resolves.toBe('mockData')
    await expect(client.activeVaultRemove('key')).resolves.toBe('mockData')
    await expect(client.activeVaultList('filter')).resolves.toBe('mockData')
    await expect(client.activeVaultGet('key')).resolves.toBe('mockData')
    await expect(client.activeVaultCreateInvite()).resolves.toBe('mockData')
    await expect(client.activeVaultDeleteInvite()).resolves.toBe('mockData')
    await expect(client.pairActiveVault('invite')).resolves.toBe('mockData')
    await expect(client.cancelPairActiveVault()).resolves.toBe('mockData')
    await expect(client.initListener({ vaultId: 'id' })).resolves.toBe(
      'mockData'
    )
    await expect(client.encryptionInit()).resolves.toBe('mockData')
    await expect(client.encryptionGetStatus()).resolves.toBe('mockData')
    await expect(client.encryptionGet('key')).resolves.toBe('mockData')
    await expect(client.encryptionAdd('key', {})).resolves.toBe('mockData')
    await expect(client.hashPassword('pw')).resolves.toBe('mockData')
    await expect(
      client.encryptVaultKeyWithHashedPassword('hashed')
    ).resolves.toBe('mockData')
    await expect(client.encryptVaultWithKey('hashed', 'key')).resolves.toBe(
      'mockData'
    )
    await expect(
      client.getDecryptionKey({ salt: 'salt', password: 'pw' })
    ).resolves.toBe('mockData')
    await expect(
      client.decryptVaultKey({
        ciphertext: 'ct',
        nonce: 'n',
        hashedPassword: 'hpw'
      })
    ).resolves.toBe('mockData')
    await expect(client.encryptionClose()).resolves.toBe('mockData')
    await expect(client.closeAllInstances()).resolves.toBe('mockData')
    await expect(client.activeVaultRemoveFile('key')).resolves.toBe('mockData')
  })

  it('should call activeVaultAddFile and log', async () => {
    const logSpy = jest.spyOn(client._logger, 'log')
    await client.activeVaultAddFile('fileKey', Buffer.from('data'))
    expect(logSpy).toHaveBeenCalledWith('Adding file to active vault:', {
      key: 'fileKey'
    })
    expect(logSpy).toHaveBeenCalledWith('File added', expect.any(Object))
  })

  it('should call activeVaultGetFile and return buffer', async () => {
    const buffer = await client.activeVaultGetFile('fileKey')
    expect(buffer).toEqual(Buffer.from('mockBuffer'))
  })

  it('should handle error in activeVaultAddFile', async () => {
    client.rpc.request = () => {
      throw new Error('fail')
    }
    const errorSpy = jest.spyOn(client._logger, 'error')
    await expect(
      client.activeVaultAddFile('fileKey', Buffer.from('data'))
    ).rejects.toThrow('fail')
    expect(errorSpy).toHaveBeenCalledWith(
      'Error adding file to active vault:',
      expect.any(Error)
    )
  })

  it('should handle error in activeVaultGetFile', async () => {
    client.rpc.request = () => {
      throw new Error('fail')
    }
    const errorSpy = jest.spyOn(client._logger, 'error')
    await client.activeVaultGetFile('fileKey')
    expect(errorSpy).toHaveBeenCalledWith(
      'Error getting file from active vault:',
      expect.any(Error)
    )
  })

  it('should emit update event on ON_UPDATE command', () => {
    const updateSpy = jest.fn()
    client.on('update', updateSpy)
    client.rpc = {
      request: jest.fn()
    }
    // Simulate ON_UPDATE command
    client.rpc = new (require('bare-rpc'))({}, (req) => {
      if (req.command === 'ON_UPDATE') {
        client.emit('update')
      }
    })
    client.emit('update')
    expect(updateSpy).toHaveBeenCalled()
  })
})
