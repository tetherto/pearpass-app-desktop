jest.mock('bare-crypto', () => ({
  randomBytes: (n) => Buffer.alloc(n),
  createCipheriv: () => ({
    update: (data) => data,
    final: () => Buffer.alloc(0),
    getAuthTag: () => Buffer.alloc(16)
  }),
  createDecipheriv: () => ({
    update: (data) => data,
    final: () => Buffer.alloc(0),
    setAuthTag: jest.fn()
  })
}))

jest.mock('autopass', () => {
  const mockPair = {
    finished: jest.fn().mockResolvedValue({
      ready: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
      add: jest.fn().mockResolvedValue(),
      remove: jest.fn().mockResolvedValue(),
      get: jest.fn().mockResolvedValue({
        value: JSON.stringify({ id: 'vault-id' }),
        file: Buffer.from('test file content')
      }),
      createInvite: jest.fn().mockResolvedValue('invite-code'),
      encryptionKey: {
        toString: jest.fn().mockReturnValue('encryption-key')
      },
      list: jest.fn().mockResolvedValue({
        on: (event, callback) => {
          if (event === 'data') {
            callback({ key: 'test1', value: 1 })
            callback({ key: 'filter_test', value: 2 })
            callback({ key: 'test2', value: 3 })
          }
          if (event === 'end') {
            callback()
          }
        }
      }),
      removeAllListeners: jest.fn(),
      on: jest.fn(),
      core: {
        ready: jest.fn().mockResolvedValue()
      }
    })
  }

  const mockAutopass = jest.fn().mockImplementation(() => ({
    ready: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
    add: jest.fn().mockResolvedValue(),
    remove: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue({
      value: JSON.stringify({ id: 'vault-id' }),
      file: Buffer.from('test file content')
    }),
    createInvite: jest.fn().mockResolvedValue('invite-code'),
    deleteInvite: jest.fn().mockResolvedValue(),
    encryptionKey: {
      toString: jest.fn().mockReturnValue('encryption-key')
    },
    list: jest.fn().mockResolvedValue({
      on: (event, callback) => {
        if (event === 'data') {
          callback({ key: 'test1', value: 1 })
          callback({ key: 'filter_test', value: 2 })
          callback({ key: 'test2', value: 3 })
        }
        if (event === 'end') {
          callback()
        }
      }
    }),
    removeAllListeners: jest.fn(),
    on: jest.fn(),
    pairInstance: jest.fn().mockResolvedValue(),
    core: {
      ready: jest.fn().mockResolvedValue()
    }
  }))

  mockAutopass.pair = jest.fn().mockReturnValue(mockPair)

  return mockAutopass
})

jest.mock('corestore', () =>
  jest.fn().mockImplementation(() => ({
    ready: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
    add: jest.fn().mockResolvedValue(),
    remove: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue({ id: 'vault-id' }),
    pairInstance: jest.fn().mockResolvedValue(),
    list: jest.fn().mockResolvedValue({
      on: (event, callback) => {
        if (event === 'data') {
          callback({ key: 'test1', value: 1 })
          callback({ key: 'other', value: 2 })
          callback({ key: 'test2', value: 3 })
        }
        if (event === 'end') {
          callback()
        }
      }
    })
  }))
)

jest.mock('bare-rpc', () =>
  jest.fn().mockImplementation(() => ({
    request: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue(),
      reply: jest.fn().mockResolvedValue('{}')
    })
  }))
)

jest.mock('bare-path', () => ({
  sep: '/', // Unix path separator for tests
  join: (...args) => args.join('/'),
  normalize: (path) => {
    // Simple normalization: remove trailing slashes and redundant slashes
    const result = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
    // Handle .. for normalization
    const parts = result.split('/')
    const normalized = []
    for (const part of parts) {
      if (part === '..') {
        normalized.pop()
      } else if (part !== '.' && part !== '') {
        normalized.push(part)
      }
    }
    return '/' + normalized.join('/')
  },
  resolve: (...paths) => {
    // Simple resolve: join paths and make absolute, handle ..
    let joined = paths.join('/').replace(/\/+/g, '/')
    if (!joined.startsWith('/')) {
      joined = '/' + joined
    }
    // Handle .. for resolution
    const parts = joined.split('/')
    const resolved = []
    for (const part of parts) {
      if (part === '..') {
        resolved.pop()
      } else if (part !== '.' && part !== '') {
        resolved.push(part)
      }
    }
    return '/' + resolved.join('/')
  }
}))

jest.mock('@tetherto/swarmconf', () =>
  jest.fn().mockImplementation(() => ({
    ready: jest.fn().mockResolvedValue(),
    current: {
      blindRelays: []
    }
  }))
)

jest.mock('./utils/isPearWorker', () => ({
  isPearWorker: jest.fn().mockReturnValue(false)
}))

jest.mock('./validateAndSanitizePath', () => ({
  validateAndSanitizePath: jest.fn().mockImplementation((path) => path)
}))

jest.mock('./getForbiddenRoots', () => ({
  getForbiddenRoots: jest.fn().mockReturnValue(['/etc', '/bin', '/tmp', '/var'])
}))

// Mock Bare global for platform detection
global.Bare = {
  platform: 'posix' // Unix-like for tests
}

import * as appDeps from './appDeps'

describe('appDeps module functions (excluding encryption)', () => {
  beforeEach(async () => {
    jest.resetModules()
  })

  describe('setStoragePath and buildPath', () => {
    test('buildPath should throw if STORAGE_PATH is not set', async () => {
      expect(() => appDeps.buildPath('vault/test')).toThrow(
        'Storage path not set'
      )
    })

    test('buildPath returns expected path after setStoragePath', async () => {
      await appDeps.setStoragePath('/home/user/data')
      const result = appDeps.buildPath('vault/test')
      expect(result).toBe('/home/user/data/vault/test')
    })

    test('setStoragePath should reject paths to restricted system directories', async () => {
      await expect(appDeps.setStoragePath('/etc')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
      await expect(appDeps.setStoragePath('/etc/config')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
      await expect(appDeps.setStoragePath('/bin/sh')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
      // /tmp is inappropriate for permanent vault storage (files deleted on reboot)
      await expect(appDeps.setStoragePath('/tmp')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
      await expect(appDeps.setStoragePath('/tmp/vaults')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
      // /var is a system directory with critical subdirectories
      await expect(appDeps.setStoragePath('/var')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
      await expect(appDeps.setStoragePath('/var/data')).rejects.toThrow(
        'Storage path points to a restricted system directory'
      )
    })

    test('buildPath should prevent path traversal outside storage root', async () => {
      await appDeps.setStoragePath('/home/user/data')
      // This should throw because the resolved path would escape the storage root
      expect(() => appDeps.buildPath('../../../etc/passwd')).toThrow(
        'Resolved path escapes storage root'
      )
    })

    test('buildPath should allow normal subdirectories', async () => {
      await appDeps.setStoragePath('/home/user/data')
      const result = appDeps.buildPath('vault/subfolder/file')
      expect(result).toBe('/home/user/data/vault/subfolder/file')
    })
  })

  describe('State getters', () => {
    test('initially vaults, encryption, and active vault are not initialized', () => {
      expect(appDeps.getIsVaultsInitialized()).toBe(false)
      expect(appDeps.getIsEncryptionInitialized()).toBe(false)
      expect(appDeps.getIsActiveVaultInitialized()).toBe(false)
    })
  })

  describe('Vaults initialization and closing', () => {
    beforeEach(() => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue(
        appDeps.__dummyInstance || {
          ready: jest.fn().mockResolvedValue(),
          close: jest.fn().mockResolvedValue(),
          add: jest.fn().mockResolvedValue()
        }
      )
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('vaultsInit sets vaultsInitialized to true', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.vaultsInit('any-password')
      expect(appDeps.getIsVaultsInitialized()).toBe(true)
    })

    test('closeVaultsInstance resets vaultsInitialized to false', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.vaultsInit('any-password')
      expect(appDeps.getIsVaultsInitialized()).toBe(true)
      await appDeps.closeVaultsInstance()
      expect(appDeps.getIsVaultsInitialized()).toBe(false)
    })
  })

  describe('Active vault functions', () => {
    beforeEach(() => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue(
        appDeps.__dummyInstance || {
          ready: jest.fn().mockResolvedValue(),
          close: jest.fn().mockResolvedValue(),
          add: jest.fn().mockResolvedValue(),
          remove: jest.fn().mockResolvedValue(),
          get: jest.fn().mockResolvedValue({
            value: JSON.stringify({ id: 'vault-id' }),
            file: Buffer.from('test file content')
          }),
          createInvite: jest.fn().mockResolvedValue('invite-code'),
          removeAllListeners: jest.fn(),
          on: jest.fn(),
          encryptionKey: jest.fn().mockResolvedValue('encryption-key')
        }
      )
    })
    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('initActiveVaultInstance sets active vault as initialized', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1', 'password')
      expect(appDeps.getIsActiveVaultInitialized()).toBe(true)
    })

    test('closeActiveVaultInstance resets active vault initialization', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')
      expect(appDeps.getIsActiveVaultInitialized()).toBe(true)
      await appDeps.closeActiveVaultInstance()
      expect(appDeps.getIsActiveVaultInitialized()).toBe(false)
    })

    test('activeVaultAdd calls add on activeVaultInstance', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')

      const mockInstance = await appDeps.getActiveVaultInstance()

      mockInstance.add = jest.fn().mockResolvedValue()

      await appDeps.activeVaultAdd('key1', { data: 'test' })
      expect(mockInstance.add).toHaveBeenCalledWith(
        'key1',
        JSON.stringify({ data: 'test' }),
        undefined
      )
    })

    test('vaultsGet calls get on vaultInstance and returns result', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.vaultsInit('vault1')
      const result = await appDeps.vaultsGet('key4')
      expect(result.id).toEqual('vault-id')
      expect(result.file).toEqual(Buffer.from('test file content'))
    })

    test('vaultsAdd calls add on vaultsInstance', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.vaultsInit('any-password')

      const mockInstance = await appDeps.getVaultsInstance()

      mockInstance.add = jest.fn().mockResolvedValue()

      await appDeps.vaultsAdd('key2', { data: 'test' })
      expect(mockInstance.add).toHaveBeenCalledWith(
        'key2',
        JSON.stringify({ data: 'test' })
      )
    })

    test('vaultRemove calls remove on activeVaultInstance', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')

      const mockInstance = await appDeps.getActiveVaultInstance()

      mockInstance.remove = jest.fn().mockResolvedValue()

      await appDeps.vaultRemove('key3')
      expect(mockInstance.remove).toHaveBeenCalledWith('key3')
    })

    test('activeVaultGet calls get on activeVaultInstance and returns result', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')
      const result = await appDeps.activeVaultGet('key4')
      expect(result.id).toEqual('vault-id')
      expect(result.file).toEqual(Buffer.from('test file content'))
    })

    test('createInvite returns correct invite string', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')
      const result = await appDeps.createInvite()
      expect(result).toBe('vault-id/invite-code')
    })
  })

  describe('List functions (vaultsList and activeVaultList)', () => {
    const fakeListInstance = {
      list: jest.fn().mockResolvedValue({
        on: (event, callback) => {
          if (event === 'data') {
            callback({ key: 'test1', value: 1 })
            callback({ key: 'other', value: 2 })
            callback({ key: 'test2', value: 3 })
          }
          if (event === 'end') {
            callback()
          }
        }
      })
    }

    test('vaultsList returns filtered values based on filterKey', async () => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue(fakeListInstance)
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.vaultsInit('any-password')
      const result = await appDeps.vaultsList('test')
      expect(result).toEqual([1, 3])
      appDeps.initInstance.mockRestore()
    })

    test('activeVaultList returns filtered values based on filterKey', async () => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue(fakeListInstance)
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')
      const result = await appDeps.activeVaultList('test')
      expect(result).toEqual([1, 3])
      appDeps.initInstance.mockRestore()
    })
  })

  describe('Pairing functions', () => {
    test('pair calls pair with invite code and returns vault id', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.vaultsInit('any-password')
      const { vaultId, encryptionKey } = await appDeps.pairActiveVault(
        'vault-id/invite-code'
      )
      expect(vaultId).toBe('vault-id')
      expect(encryptionKey).toBe('encryption-key')
    })
  })

  describe('Blind mirrors management', () => {
    beforeEach(async () => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue({
        ready: jest.fn().mockResolvedValue(),
        close: jest.fn().mockResolvedValue()
      })
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')

      const inst = appDeps.getActiveVaultInstance()
      inst.getMirror = jest.fn().mockResolvedValue([{ key: 'a' }, { key: 'b' }])
      inst.addMirror = jest.fn().mockResolvedValue()
      inst.removeMirror = jest.fn().mockResolvedValue()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('getBlindMirrors returns mirrors from instance', async () => {
      const res = await appDeps.getBlindMirrors()
      expect(res).toEqual([{ key: 'a' }, { key: 'b' }])
    })

    test('addBlindMirrors adds provided keys', async () => {
      const inst = appDeps.getActiveVaultInstance()
      await appDeps.addBlindMirrors(['k1', 'k2'])
      expect(inst.addMirror).toHaveBeenCalledWith('k1')
      expect(inst.addMirror).toHaveBeenCalledWith('k2')
    })

    test('removeBlindMirror removes key', async () => {
      const inst = appDeps.getActiveVaultInstance()
      await appDeps.removeBlindMirror('k1')
      expect(inst.removeMirror).toHaveBeenCalledWith('k1')
    })

    test('addDefaultBlindMirrors adds defaults', async () => {
      const inst = appDeps.getActiveVaultInstance()
      await appDeps.addDefaultBlindMirrors()
      expect(inst.addMirror).toHaveBeenCalled()
    })

    test('removeAllBlindMirrors removes all current mirrors', async () => {
      const inst = appDeps.getActiveVaultInstance()
      inst.getMirror = jest
        .fn()
        .mockResolvedValue([{ key: 'a' }, { key: 'b' }, { key: 'c' }])

      await appDeps.removeAllBlindMirrors()
      expect(inst.removeMirror).toHaveBeenCalledWith('a')
      expect(inst.removeMirror).toHaveBeenCalledWith('b')
      expect(inst.removeMirror).toHaveBeenCalledWith('c')
    })
  })

  describe('restartActiveVault', () => {
    test('restarts instance when same vault is active', async () => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue({
        ready: jest.fn().mockResolvedValue(),
        close: jest.fn().mockResolvedValue(),
        removeAllListeners: jest.fn(),
        on: jest.fn()
      })

      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vaultX', 'encKey')

      const onUpdate = jest.fn()
      await appDeps.initListener({ vaultId: 'vaultX', onUpdate })

      await appDeps.restartActiveVault()
      expect(appDeps.getIsActiveVaultInitialized()).toBe(true)
    })

    test('throws if no previous vault to restart', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.closeAllInstances()
      await expect(appDeps.restartActiveVault()).rejects.toThrow(
        '[restartActiveVault]: No previous active vault to restart'
      )
    })
  })
  describe('initListener', () => {
    test('initListener should not reinitialize if vaultId matches previous value', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')

      const active = appDeps.getActiveVaultInstance()
      const removeAllListenersSpy = jest.spyOn(active, 'removeAllListeners')

      const onUpdate = jest.fn()
      await appDeps.initListener({ vaultId: 'vault1', onUpdate })

      removeAllListenersSpy.mockClear()

      await appDeps.initListener({ vaultId: 'vault1', onUpdate })
      expect(removeAllListenersSpy).not.toHaveBeenCalled()
    })
  })

  describe('closeAllInstances', () => {
    beforeEach(() => {
      jest.spyOn(appDeps, 'initInstance').mockResolvedValue(
        appDeps.__dummyInstance || {
          ready: jest.fn().mockResolvedValue(),
          close: jest.fn().mockResolvedValue()
        }
      )
    })
    test('closeAllInstances closes all initialized instances and clears restart cache', async () => {
      await appDeps.setStoragePath('/home/testuser/vaultdata')
      await appDeps.initActiveVaultInstance('vault1')
      await appDeps.vaultsInit('vault1')
      await appDeps.encryptionInit('vault1')

      const activeVault = appDeps.getActiveVaultInstance()
      const vaults = appDeps.getVaultsInstance()
      const encryption = appDeps.getEncryptionInstance()

      const closeSpy1 = jest.spyOn(activeVault, 'close')
      const closeSpy2 = jest.spyOn(vaults, 'close')
      const closeSpy3 = jest.spyOn(encryption, 'close')

      await appDeps.closeAllInstances()

      expect(closeSpy1).toHaveBeenCalled()
      expect(closeSpy2).toHaveBeenCalled()
      expect(closeSpy3).toHaveBeenCalled()

      expect(appDeps.getIsActiveVaultInitialized()).toBe(false)
      expect(appDeps.getIsVaultsInitialized()).toBe(false)
      expect(appDeps.getIsEncryptionInitialized()).toBe(false)

      await expect(appDeps.restartActiveVault()).rejects.toThrow(
        '[restartActiveVault]: No previous active vault to restart'
      )
    })
  })
})
