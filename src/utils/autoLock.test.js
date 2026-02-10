import { applyAutoLockEnabled, applyAutoLockTimeout } from './autoLock.js'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

jest.mock('pearpass-lib-constants', () => ({
  AUTO_LOCK_ENABLED: true
}))

describe('auto lock local state helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.spyOn(window, 'dispatchEvent')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('applyAutoLockEnabled', () => {
    it('stores "false" in localStorage when disabled', () => {
      applyAutoLockEnabled(false)

      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)).toBe(
        'false'
      )
    })

    it('removes localStorage key when enabled', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'false')

      applyAutoLockEnabled(true)

      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
      ).toBeNull()
    })

    it('dispatches auto-lock related events', () => {
      applyAutoLockEnabled(false)

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auto-lock-settings-changed' })
      )

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'apply-auto-lock-enabled' })
      )
    })
  })

  describe('applyAutoLockTimeout', () => {
    it('stores timeout value as string', () => {
      applyAutoLockTimeout(30000)

      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS)
      ).toBe('30000')
    })

    it('dispatches auto-lock timeout events', () => {
      applyAutoLockTimeout(10000)

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auto-lock-settings-changed' })
      )

      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'apply-auto-lock-timeout' })
      )
    })

    it('does nothing when AUTO_LOCK_ENABLED is false', () => {
      jest.resetModules()
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent')

      jest.isolateModules(() => {
        jest.doMock('pearpass-lib-constants', () => ({
          AUTO_LOCK_ENABLED: false
        }))
        const {
          applyAutoLockTimeout: isolatedTimeout,
          applyAutoLockEnabled: isolatedEnabled
        } = require('./autoLock.js')
        isolatedTimeout(30000)
        isolatedEnabled(false)
      })

      expect(dispatchSpy).not.toHaveBeenCalled()
    })
  })
})
