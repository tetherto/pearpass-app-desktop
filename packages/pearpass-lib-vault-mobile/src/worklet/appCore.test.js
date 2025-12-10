// rpc.test.js

const mockVaultsInit = jest.fn()
const mockGetIsVaultsInitialized = jest.fn()
const mockDestroySharedDHT = jest.fn()
const mockVaultsGet = jest.fn()
const mockCloseVaultsInstance = jest.fn()
const mockVaultsAdd = jest.fn()
const mockActiveVaultAdd = jest.fn()
const mockActiveVaultGetFile = jest.fn()
const mockActiveVaultRemoveFile = jest.fn()
const mockVaultsList = jest.fn()
const mockInitActiveVaultInstance = jest.fn()
const mockGetIsActiveVaultInitialized = jest.fn()
const mockCloseActiveVaultInstance = jest.fn()
const mockVaultRemove = jest.fn()
const mockActiveVaultList = jest.fn()
const mockActiveVaultGet = jest.fn()
const mockCreateInvite = jest.fn()
const mockDeleteInvite = jest.fn()
const mockPairActiveVault = jest.fn()
const mockCancelPairActiveVault = jest.fn()
const mockInitListener = jest.fn()
const mockEncryptionInit = jest.fn()
const mockGetIsEncryptionInitialized = jest.fn()
const mockEncryptionGet = jest.fn()
const mockEncryptionAdd = jest.fn()
const mockEncryptionClose = jest.fn()
const mockCloseAllInstances = jest.fn()
const mockGetBlindMirrors = jest.fn()
const mockAddBlindMirrors = jest.fn()
const mockRemoveBlindMirror = jest.fn()
const mockAddDefaultBlindMirrors = jest.fn()
const mockRemoveAllBlindMirrors = jest.fn()
const mockRestartActiveVault = jest.fn()
const mockSetStoragePath = jest.fn()
const mockHashPassword = jest.fn()
const mockEncryptVaultKeyWithHashedPassword = jest.fn()
const mockEncryptVaultWithKey = jest.fn()
const mockGetDecryptionKey = jest.fn()
const mockDecryptVaultKey = jest.fn()

// --- Module mocks ---
jest.mock('./appDeps', () => ({
  vaultsInit: (...args) => mockVaultsInit(...args),
  getIsVaultsInitialized: () => mockGetIsVaultsInitialized(),
  vaultsGet: (...args) => mockVaultsGet(...args),
  closeVaultsInstance: (...args) => mockCloseVaultsInstance(...args),
  vaultsAdd: (...args) => mockVaultsAdd(...args),
  activeVaultAdd: (...args) => mockActiveVaultAdd(...args),
  activeVaultGetFile: (...args) => mockActiveVaultGetFile(...args),
  activeVaultRemoveFile: (...args) => mockActiveVaultRemoveFile(...args),
  vaultsList: (...args) => mockVaultsList(...args),
  initActiveVaultInstance: (...args) => mockInitActiveVaultInstance(...args),
  getIsActiveVaultInitialized: () => mockGetIsActiveVaultInitialized(),
  closeActiveVaultInstance: (...args) => mockCloseActiveVaultInstance(...args),
  vaultRemove: (...args) => mockVaultRemove(...args),
  activeVaultList: (...args) => mockActiveVaultList(...args),
  activeVaultGet: (...args) => mockActiveVaultGet(...args),
  createInvite: (...args) => mockCreateInvite(...args),
  deleteInvite: (...args) => mockDeleteInvite(...args),
  pairActiveVault: (...args) => mockPairActiveVault(...args),
  cancelPairActiveVault: (...args) => mockCancelPairActiveVault(...args),
  initListener: (...args) => mockInitListener(...args),
  encryptionInit: (...args) => mockEncryptionInit(...args),
  getIsEncryptionInitialized: () => mockGetIsEncryptionInitialized(),
  encryptionGet: (...args) => mockEncryptionGet(...args),
  encryptionAdd: (...args) => mockEncryptionAdd(...args),
  encryptionClose: (...args) => mockEncryptionClose(...args),
  closeAllInstances: (...args) => mockCloseAllInstances(...args),
  getBlindMirrors: (...args) => mockGetBlindMirrors(...args),
  addBlindMirrors: (...args) => mockAddBlindMirrors(...args),
  removeBlindMirror: (...args) => mockRemoveBlindMirror(...args),
  addDefaultBlindMirrors: (...args) => mockAddDefaultBlindMirrors(...args),
  removeAllBlindMirrors: (...args) => mockRemoveAllBlindMirrors(...args),
  restartActiveVault: (...args) => mockRestartActiveVault(...args),
  setStoragePath: (...args) => mockSetStoragePath(...args)
}))

jest.mock('sodium-native', () => {
  const api = {
    crypto_secretbox_easy: jest.fn(),
    crypto_secretbox_open_easy: jest.fn(),
    randombytes_buf: jest.fn()
    // add any other sodium methods your code uses
  }

  return {
    __esModule: true, // so `import sodium from 'sodium-native'` works
    ...api,
    default: api
  }
})

jest.mock('./utils/parseRequestData', () => ({
  parseRequestData: jest.fn((data) => data) // default: passthrough
}))

jest.mock('./utils/workletLogger', () => ({
  workletLogger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

jest.mock('../utils/validateInviteCode', () => ({
  validateInviteCode: jest.fn((code) => code)
}))

jest.mock('./utils/dht', () => ({
  destroySharedDHT: (...args) => mockDestroySharedDHT(...args)
}))

jest.mock('./hashPassword', () => ({
  hashPassword: (...args) => mockHashPassword(...args)
}))

jest.mock('./encryptVaultKeyWithHashedPassword', () => ({
  encryptVaultKeyWithHashedPassword: (...args) =>
    mockEncryptVaultKeyWithHashedPassword(...args)
}))

jest.mock('./encryptVaultWithKey', () => ({
  encryptVaultWithKey: (...args) => mockEncryptVaultWithKey(...args)
}))

jest.mock('./getDecryptionKey', () => ({
  getDecryptionKey: (...args) => mockGetDecryptionKey(...args)
}))

jest.mock('./decryptVaultKey', () => ({
  decryptVaultKey: (...args) => mockDecryptVaultKey(...args)
}))

jest.mock('../utils/recieveFileStream', () => ({
  receiveFileStream: jest.fn()
}))

jest.mock('../utils/sendFileStream', () => ({
  sendFileStream: jest.fn()
}))

jest.mock('../middleware/validateMirrorKeyViaDHT', () => ({
  withMirrorValidation: (fn) => fn
}))

// RPC + FramedStream mocks
const mockRPCInstance = {}
const mockRPCConstructor = jest.fn(() => mockRPCInstance)
const mockFramedStreamInstance = {}
const mockFramedStreamConstructor = jest.fn(() => mockFramedStreamInstance)

jest.mock('bare-rpc', () =>
  jest.fn().mockImplementation((...args) => mockRPCConstructor(...args))
)

jest.mock('framed-stream', () =>
  jest
    .fn()
    .mockImplementation((...args) => mockFramedStreamConstructor(...args))
)

// API constants: full set for tests
jest.mock('./api', () => {
  const API = {
    STORAGE_PATH_SET: 1,
    MASTER_VAULT_INIT: 2,
    MASTER_VAULT_GET_STATUS: 3,
    MASTER_VAULT_GET: 4,
    MASTER_VAULT_CLOSE: 5,
    MASTER_VAULT_ADD: 6,
    MASTER_VAULT_LIST: 7,
    ACTIVE_VAULT_FILE_ADD: 8,
    ACTIVE_VAULT_FILE_REMOVE: 9,
    ACTIVE_VAULT_FILE_GET: 10,
    ACTIVE_VAULT_INIT: 11,
    ACTIVE_VAULT_GET_STATUS: 12,
    ACTIVE_VAULT_CLOSE: 13,
    ACTIVE_VAULT_ADD: 14,
    ACTIVE_VAULT_REMOVE: 15,
    ACTIVE_VAULT_LIST: 16,
    ACTIVE_VAULT_GET: 17,
    ACTIVE_VAULT_CREATE_INVITE: 18,
    ACTIVE_VAULT_DELETE_INVITE: 19,
    PAIR_ACTIVE_VAULT: 20,
    INIT_LISTENER: 21,
    ON_UPDATE: 22,
    ENCRYPTION_INIT: 23,
    ENCRYPTION_GET_STATUS: 24,
    ENCRYPTION_GET: 25,
    ENCRYPTION_ADD: 26,
    ENCRYPTION_CLOSE: 27,
    ENCRYPTION_HASH_PASSWORD: 28,
    ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD: 29,
    ENCRYPTION_ENCRYPT_VAULT_WITH_KEY: 30,
    ENCRYPTION_DECRYPT_VAULT_KEY: 31,
    ENCRYPTION_GET_DECRYPTION_KEY: 32,
    CLOSE_ALL_INSTANCES: 33,
    CANCEL_PAIR_ACTIVE_VAULT: 34,
    BLIND_MIRRORS_GET: 35,
    BLIND_MIRRORS_ADD: 36,
    BLIND_MIRROR_REMOVE: 37,
    BLIND_MIRRORS_ADD_DEFAULTS: 38,
    BLIND_MIRRORS_REMOVE_ALL: 39
  }

  const API_BY_VALUE = Object.entries(API).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
  }, {})

  return { API, API_BY_VALUE }
})

// isPearWorker mock
jest.mock('./utils/isPearWorker', () => ({
  isPearWorker: jest.fn()
}))

// --- Set up globals used by the module under test ---

// These are accessed inside setupIPC
global.Bare = {
  exit: jest.fn()
}

global.Pear = {
  worker: {
    pipe: jest.fn()
  }
}

global.BareKit = {
  IPC: {
    on: jest.fn()
  }
}

// Now import the module under test AFTER mocks are set up
import RPC from 'bare-rpc'
import FramedStream from 'framed-stream'

import { API } from './api'
import { handleRpcCommand, setupIPC, createRPC } from './appCore'
import { isPearWorker } from './utils/isPearWorker'
import { parseRequestData } from './utils/parseRequestData'
import { receiveFileStream } from '../utils/recieveFileStream'
import { sendFileStream } from '../utils/sendFileStream'

describe('handleRpcCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('MASTER_VAULT_INIT: success path', async () => {
    parseRequestData.mockReturnValue({ encryptionKey: 'secret-key' })
    mockVaultsInit.mockResolvedValue({ some: 'result' })

    const reply = jest.fn()

    const req = {
      command: API.MASTER_VAULT_INIT,
      data: { encryptionKey: 'secret-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockVaultsInit).toHaveBeenCalledWith('secret-key', {})
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({
      success: true,
      res: { some: 'result' }
    })
  })

  test('MASTER_VAULT_INIT: error when encryptionKey is missing', async () => {
    parseRequestData.mockReturnValue({}) // no encryptionKey

    const reply = jest.fn()

    const req = {
      command: API.MASTER_VAULT_INIT,
      data: {},
      reply
    }

    await handleRpcCommand(req)

    expect(mockVaultsInit).not.toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload.error).toContain('Error initializing vaults')
    expect(payload.error).toContain('Password is required')
  })

  test('MASTER_VAULT_GET_STATUS: returns status from getIsVaultsInitialized', async () => {
    mockGetIsVaultsInitialized.mockReturnValue(true)

    const reply = jest.fn()

    const req = {
      command: API.MASTER_VAULT_GET_STATUS,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({
      data: { status: true }
    })
  })

  test('CLOSE_ALL_INSTANCES: calls destroySharedDHT and replies', async () => {
    const reply = jest.fn()

    const req = {
      command: API.CLOSE_ALL_INSTANCES,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockCloseAllInstances).toHaveBeenCalled()
    expect(mockDestroySharedDHT).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('STORAGE_PATH_SET: success path', async () => {
    parseRequestData.mockReturnValue({ path: '/test/path' })
    mockSetStoragePath.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.STORAGE_PATH_SET,
      data: { path: '/test/path' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockSetStoragePath).toHaveBeenCalledWith('/test/path')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('MASTER_VAULT_GET: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'test-key' })
    mockVaultsGet.mockResolvedValue({ data: 'vault-data' })

    const reply = jest.fn()
    const req = {
      command: API.MASTER_VAULT_GET,
      data: { key: 'test-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockVaultsGet).toHaveBeenCalledWith('test-key')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { data: 'vault-data' } })
  })

  test('MASTER_VAULT_CLOSE: success path', async () => {
    mockCloseVaultsInstance.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.MASTER_VAULT_CLOSE,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockCloseVaultsInstance).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('MASTER_VAULT_ADD: success path', async () => {
    parseRequestData.mockReturnValue({
      key: 'vault-key',
      data: { name: 'Test Vault' }
    })
    mockVaultsAdd.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.MASTER_VAULT_ADD,
      data: { key: 'vault-key', data: { name: 'Test Vault' } },
      reply
    }

    await handleRpcCommand(req)

    expect(mockVaultsAdd).toHaveBeenCalledWith('vault-key', {
      name: 'Test Vault'
    })
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('MASTER_VAULT_LIST: success path', async () => {
    parseRequestData.mockReturnValue({ filterKey: 'filter' })
    mockVaultsList.mockResolvedValue([{ id: '1', name: 'Vault 1' }])

    const reply = jest.fn()
    const req = {
      command: API.MASTER_VAULT_LIST,
      data: { filterKey: 'filter' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockVaultsList).toHaveBeenCalledWith('filter')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: [{ id: '1', name: 'Vault 1' }] })
  })

  test('ACTIVE_VAULT_FILE_ADD: success path', async () => {
    const mockStream = { mock: 'stream' }
    const mockBuffer = Buffer.from('file data')
    const metaData = { key: 'file-key', name: 'file-name.jpg' }

    receiveFileStream.mockResolvedValue({
      buffer: mockBuffer,
      metaData
    })
    mockActiveVaultAdd.mockResolvedValue()

    const reply = jest.fn()
    const createRequestStream = jest.fn(() => mockStream)
    const req = {
      command: API.ACTIVE_VAULT_FILE_ADD,
      data: null,
      reply,
      createRequestStream
    }

    await handleRpcCommand(req)

    expect(createRequestStream).toHaveBeenCalled()
    expect(receiveFileStream).toHaveBeenCalledWith(mockStream)
    expect(mockActiveVaultAdd).toHaveBeenCalledWith(
      'file-key',
      {},
      mockBuffer,
      'file-name.jpg'
    )
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true, metaData })
  })

  test('ACTIVE_VAULT_FILE_GET: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'file-key' })
    const mockBuffer = Buffer.from('file content')
    const mockStream = { mock: 'response-stream' }

    mockActiveVaultGetFile.mockResolvedValue(mockBuffer)

    const createResponseStream = jest.fn(() => mockStream)
    const req = {
      command: API.ACTIVE_VAULT_FILE_GET,
      data: { key: 'file-key' },
      createResponseStream
    }

    await handleRpcCommand(req)

    expect(mockActiveVaultGetFile).toHaveBeenCalledWith('file-key')
    expect(createResponseStream).toHaveBeenCalled()
    expect(sendFileStream).toHaveBeenCalledWith({
      stream: mockStream,
      buffer: mockBuffer,
      metaData: { key: 'file-key' }
    })
  })

  test('ACTIVE_VAULT_INIT: success path', async () => {
    parseRequestData.mockReturnValue({ id: 'vault-id', encryptionKey: 'key' })
    mockInitActiveVaultInstance.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_INIT,
      data: { id: 'vault-id', encryptionKey: 'key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockInitActiveVaultInstance).toHaveBeenCalledWith(
      'vault-id',
      'key',
      {}
    )
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ACTIVE_VAULT_GET_STATUS: returns status', async () => {
    mockGetIsActiveVaultInitialized.mockReturnValue(true)

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_GET_STATUS,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { status: true } })
  })

  test('ACTIVE_VAULT_CLOSE: success path', async () => {
    mockCloseActiveVaultInstance.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_CLOSE,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockCloseActiveVaultInstance).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ACTIVE_VAULT_ADD: success path', async () => {
    parseRequestData.mockReturnValue({
      key: 'record-key',
      data: { field: 'value' }
    })
    mockActiveVaultAdd.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_ADD,
      data: { key: 'record-key', data: { field: 'value' } },
      reply
    }

    await handleRpcCommand(req)

    expect(mockActiveVaultAdd).toHaveBeenCalledWith('record-key', {
      field: 'value'
    })
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ACTIVE_VAULT_REMOVE: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'record-key' })
    mockVaultRemove.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_REMOVE,
      data: { key: 'record-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockVaultRemove).toHaveBeenCalledWith('record-key')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ACTIVE_VAULT_LIST: success path', async () => {
    parseRequestData.mockReturnValue({ filterKey: 'filter' })
    mockActiveVaultList.mockResolvedValue([{ id: '1', name: 'Record 1' }])

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_LIST,
      data: { filterKey: 'filter' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockActiveVaultList).toHaveBeenCalledWith('filter')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: [{ id: '1', name: 'Record 1' }] })
  })

  test('ACTIVE_VAULT_GET: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'record-key' })
    mockActiveVaultGet.mockResolvedValue({ field: 'value' })

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_GET,
      data: { key: 'record-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockActiveVaultGet).toHaveBeenCalledWith('record-key')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { field: 'value' } })
  })

  test('ACTIVE_VAULT_CREATE_INVITE: success path', async () => {
    mockCreateInvite.mockResolvedValue({ inviteCode: 'ABC123' })

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_CREATE_INVITE,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockCreateInvite).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { inviteCode: 'ABC123' } })
  })

  test('ACTIVE_VAULT_DELETE_INVITE: success path', async () => {
    mockDeleteInvite.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_DELETE_INVITE,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockDeleteInvite).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('PAIR_ACTIVE_VAULT: success path', async () => {
    parseRequestData.mockReturnValue({ inviteCode: 'ABC123' })
    mockPairActiveVault.mockResolvedValue({
      vaultId: 'vault-id',
      encryptionKey: 'encryption-key'
    })

    const reply = jest.fn()
    const req = {
      command: API.PAIR_ACTIVE_VAULT,
      data: { inviteCode: 'ABC123' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockPairActiveVault).toHaveBeenCalledWith('ABC123')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({
      data: { vaultId: 'vault-id', encryptionKey: 'encryption-key' }
    })
  })

  test('CANCEL_PAIR_ACTIVE_VAULT: success path', async () => {
    mockCancelPairActiveVault.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.CANCEL_PAIR_ACTIVE_VAULT,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockCancelPairActiveVault).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('INIT_LISTENER: success path', async () => {
    parseRequestData.mockReturnValue({ vaultId: 'vault-id' })
    mockGetIsActiveVaultInitialized.mockReturnValue(true)
    mockInitListener.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.INIT_LISTENER,
      data: { vaultId: 'vault-id' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockInitListener).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('INIT_LISTENER: error when active vault not initialized', async () => {
    parseRequestData.mockReturnValue({ vaultId: 'vault-id' })
    mockGetIsActiveVaultInitialized.mockReturnValue(false)

    const reply = jest.fn()
    const req = {
      command: API.INIT_LISTENER,
      data: { vaultId: 'vault-id' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockInitListener).not.toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload.error).toContain('Active vault not initialized')
  })

  test('ENCRYPTION_INIT: success path', async () => {
    mockEncryptionInit.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_INIT,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockEncryptionInit).toHaveBeenCalledWith({})
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ENCRYPTION_GET_STATUS: returns status', async () => {
    mockGetIsEncryptionInitialized.mockReturnValue(true)

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_GET_STATUS,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { status: true } })
  })

  test('ENCRYPTION_GET: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'encryption-key' })
    mockEncryptionGet.mockResolvedValue({ data: 'encrypted-data' })

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_GET,
      data: { key: 'encryption-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockEncryptionGet).toHaveBeenCalledWith('encryption-key')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { data: 'encrypted-data' } })
  })

  test('ENCRYPTION_ADD: success path', async () => {
    parseRequestData.mockReturnValue({
      key: 'enc-key',
      data: { value: 'data' }
    })
    mockEncryptionAdd.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_ADD,
      data: { key: 'enc-key', data: { value: 'data' } },
      reply
    }

    await handleRpcCommand(req)

    expect(mockEncryptionAdd).toHaveBeenCalledWith('enc-key', { value: 'data' })
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ENCRYPTION_HASH_PASSWORD: success path', async () => {
    parseRequestData.mockReturnValue({ password: 'mypassword' })
    mockHashPassword.mockReturnValue('hashed-password')

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_HASH_PASSWORD,
      data: { password: 'mypassword' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockHashPassword).toHaveBeenCalledWith('mypassword')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: 'hashed-password' })
  })

  test('ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD: success path', async () => {
    parseRequestData.mockReturnValue({ hashedPassword: 'hashed' })
    mockEncryptVaultKeyWithHashedPassword.mockReturnValue({ encrypted: 'key' })

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_ENCRYPT_VAULT_KEY_WITH_HASHED_PASSWORD,
      data: { hashedPassword: 'hashed' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockEncryptVaultKeyWithHashedPassword).toHaveBeenCalledWith('hashed')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { encrypted: 'key' } })
  })

  test('ENCRYPTION_ENCRYPT_VAULT_WITH_KEY: success path', async () => {
    parseRequestData.mockReturnValue({
      hashedPassword: 'hashed',
      key: 'vault-key'
    })
    mockEncryptVaultWithKey.mockReturnValue({ encrypted: 'vault' })

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_ENCRYPT_VAULT_WITH_KEY,
      data: { hashedPassword: 'hashed', key: 'vault-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockEncryptVaultWithKey).toHaveBeenCalledWith('hashed', 'vault-key')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: { encrypted: 'vault' } })
  })

  test('ENCRYPTION_GET_DECRYPTION_KEY: success path', async () => {
    parseRequestData.mockReturnValue({ salt: 'salt123', password: 'password' })
    mockGetDecryptionKey.mockReturnValue('decryption-key')

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_GET_DECRYPTION_KEY,
      data: { salt: 'salt123', password: 'password' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockGetDecryptionKey).toHaveBeenCalledWith({
      password: 'password',
      salt: 'salt123'
    })
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: 'decryption-key' })
  })

  test('ENCRYPTION_DECRYPT_VAULT_KEY: success path', async () => {
    parseRequestData.mockReturnValue({
      ciphertext: 'cipher',
      nonce: 'nonce123',
      hashedPassword: 'hashed'
    })
    mockDecryptVaultKey.mockReturnValue('decrypted-key')

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_DECRYPT_VAULT_KEY,
      data: {
        ciphertext: 'cipher',
        nonce: 'nonce123',
        hashedPassword: 'hashed'
      },
      reply
    }

    await handleRpcCommand(req)

    expect(mockDecryptVaultKey).toHaveBeenCalledWith({
      ciphertext: 'cipher',
      nonce: 'nonce123',
      hashedPassword: 'hashed'
    })
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: 'decrypted-key' })
  })

  test('ENCRYPTION_CLOSE: success path', async () => {
    mockEncryptionClose.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ENCRYPTION_CLOSE,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockEncryptionClose).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('BLIND_MIRRORS_GET: success path', async () => {
    mockGetBlindMirrors.mockResolvedValue([{ key: 'mirror1' }])

    const reply = jest.fn()
    const req = {
      command: API.BLIND_MIRRORS_GET,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockGetBlindMirrors).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ data: [{ key: 'mirror1' }] })
  })

  test('BLIND_MIRRORS_ADD: success path', async () => {
    parseRequestData.mockReturnValue({ blindMirrors: [{ key: 'mirror1' }] })
    mockAddBlindMirrors.mockResolvedValue()
    mockRestartActiveVault.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.BLIND_MIRRORS_ADD,
      data: { blindMirrors: [{ key: 'mirror1' }] },
      reply
    }

    await handleRpcCommand(req)

    expect(mockAddBlindMirrors).toHaveBeenCalledWith([{ key: 'mirror1' }])
    expect(mockRestartActiveVault).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('BLIND_MIRROR_REMOVE: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'mirror-key' })
    mockRemoveBlindMirror.mockResolvedValue()
    mockRestartActiveVault.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.BLIND_MIRROR_REMOVE,
      data: { key: 'mirror-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockRemoveBlindMirror).toHaveBeenCalledWith('mirror-key')
    expect(mockRestartActiveVault).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('BLIND_MIRRORS_ADD_DEFAULTS: success path', async () => {
    mockAddDefaultBlindMirrors.mockResolvedValue()
    mockRestartActiveVault.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.BLIND_MIRRORS_ADD_DEFAULTS,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockAddDefaultBlindMirrors).toHaveBeenCalled()
    expect(mockRestartActiveVault).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('BLIND_MIRRORS_REMOVE_ALL: success path', async () => {
    mockRemoveAllBlindMirrors.mockResolvedValue()
    mockRestartActiveVault.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.BLIND_MIRRORS_REMOVE_ALL,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(mockRemoveAllBlindMirrors).toHaveBeenCalled()
    expect(mockRestartActiveVault).toHaveBeenCalled()
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('ACTIVE_VAULT_FILE_REMOVE: success path', async () => {
    parseRequestData.mockReturnValue({ key: 'file-key' })
    mockActiveVaultRemoveFile.mockResolvedValue()

    const reply = jest.fn()
    const req = {
      command: API.ACTIVE_VAULT_FILE_REMOVE,
      data: { key: 'file-key' },
      reply
    }

    await handleRpcCommand(req)

    expect(mockActiveVaultRemoveFile).toHaveBeenCalledWith('file-key')
    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload).toEqual({ success: true })
  })

  test('Unknown command: replies with error', async () => {
    const reply = jest.fn()
    const req = {
      command: 9999,
      data: null,
      reply
    }

    await handleRpcCommand(req)

    expect(reply).toHaveBeenCalledTimes(1)

    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload.error).toContain('Unknown command: 9999')
  })
})

describe('setupIPC', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('uses Pear.worker.pipe when running in worker', async () => {
    const mockIpc = {
      on: jest.fn()
    }

    isPearWorker.mockReturnValue(true)
    global.Pear.worker.pipe.mockReturnValue(mockIpc)

    const ipc = setupIPC()

    expect(global.Pear.worker.pipe).toHaveBeenCalledTimes(1)
    expect(ipc).toBe(mockIpc)

    // check that "close" and "end" listeners are wired
    expect(mockIpc.on).toHaveBeenCalledTimes(2)

    const closeHandler = mockIpc.on.mock.calls.find(
      ([event]) => event === 'close'
    )[1]
    const endHandler = mockIpc.on.mock.calls.find(
      ([event]) => event === 'end'
    )[1]

    await closeHandler()
    await endHandler()

    // destroySharedDHT should be called twice (close + end)
    expect(mockDestroySharedDHT).toHaveBeenCalledTimes(2)
    expect(global.Bare.exit).toHaveBeenCalledTimes(2)
    expect(global.Bare.exit).toHaveBeenCalledWith(0)
  })

  test('uses BareKit.IPC when not running in worker', () => {
    isPearWorker.mockReturnValue(false)

    const ipc = setupIPC()

    expect(ipc).toBe(global.BareKit.IPC)
    expect(global.Pear.worker.pipe).not.toHaveBeenCalled()
  })
})

describe('createRPC', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('constructs RPC with FramedStream and handler that calls handleRpcCommand', async () => {
    const fakeIpc = { some: 'ipc' }

    const rpcInstance = createRPC(fakeIpc)

    // FramedStream should be constructed with ipc
    expect(FramedStream).toHaveBeenCalledTimes(1)
    expect(FramedStream).toHaveBeenCalledWith(fakeIpc)

    // RPC should be constructed with FramedStream instance + handler
    expect(RPC).toHaveBeenCalledTimes(1)
    const [framedStreamArg, handler] = RPC.mock.calls[0]

    // Verify that RPC received the result of FramedStream constructor
    expect(framedStreamArg).toBe(mockFramedStreamInstance)
    expect(typeof handler).toBe('function')
    expect(rpcInstance).toBe(mockRPCInstance)

    // Test that handler catches and replies with errors
    const reply = jest.fn()
    const req = { command: 99999, data: {}, reply }

    // Call the handler - it should handle unknown command
    await handler(req)

    // Should have replied with an error for unknown command
    expect(reply).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(reply.mock.calls[0][0])
    expect(payload.error).toContain('Unknown command')
  })
})
