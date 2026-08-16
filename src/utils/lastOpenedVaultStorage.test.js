import {
  getLastOpenedVaultId,
  setLastOpenedVaultId
} from './lastOpenedVaultStorage'
import { logger } from './logger'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

describe('lastOpenedVaultStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  describe('setLastOpenedVaultId', () => {
    it('stores a provided id in localStorage', () => {
      setLastOpenedVaultId('vault-123')

      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID)
      ).toBe('vault-123')
    })

    it('coerces non-string ids to strings', () => {
      setLastOpenedVaultId(42)

      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID)
      ).toBe('42')
    })

    it('no-ops on falsy ids', () => {
      setLastOpenedVaultId('')
      setLastOpenedVaultId(null)
      setLastOpenedVaultId(undefined)
      setLastOpenedVaultId(0)

      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_OPENED_VAULT_ID)
      ).toBeNull()
    })

    it('swallows and logs errors when writing fails', () => {
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})
      const setItemSpy = jest
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('quota exceeded')
        })

      expect(() => setLastOpenedVaultId('vault-123')).not.toThrow()
      expect(loggerSpy).toHaveBeenCalled()

      setItemSpy.mockRestore()
    })
  })

  describe('getLastOpenedVaultId', () => {
    it('returns null when nothing is stored', () => {
      expect(getLastOpenedVaultId()).toBeNull()
    })

    it('returns the stored id', () => {
      setLastOpenedVaultId('vault-abc')

      expect(getLastOpenedVaultId()).toBe('vault-abc')
    })

    it('returns null and logs when reading fails', () => {
      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {})
      const getItemSpy = jest
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('read failure')
        })

      expect(getLastOpenedVaultId()).toBeNull()
      expect(loggerSpy).toHaveBeenCalled()

      getItemSpy.mockRestore()
    })
  })
})
