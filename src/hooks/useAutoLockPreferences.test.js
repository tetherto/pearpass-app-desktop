// Mock the constants module before imports
const DEFAULT_AUTO_LOCK_TIMEOUT = 300000
jest.mock('pearpass-lib-constants', () => ({
  DEFAULT_AUTO_LOCK_TIMEOUT: 300000,
  AUTO_LOCK_ENABLED: true
}))

import { renderHook, act } from '@testing-library/react'

import {
  useAutoLockPreferences,
  getAutoLockTimeoutMs,
  isAutoLockEnabled
} from './useAutoLockPreferences'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

describe('useAutoLockPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should default isAutoLockEnabled to true when localStorage is empty', () => {
      const { result } = renderHook(() => useAutoLockPreferences())
      expect(result.current.isAutoLockEnabled).toBe(true)
    })

    it('should default timeoutMs to DEFAULT_AUTO_LOCK_TIMEOUT when localStorage is empty', () => {
      const { result } = renderHook(() => useAutoLockPreferences())
      expect(result.current.timeoutMs).toBe(DEFAULT_AUTO_LOCK_TIMEOUT)
    })

    it('should return false for isAutoLockEnabled when localStorage is set to "false"', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'false')
      const { result } = renderHook(() => useAutoLockPreferences())
      expect(result.current.isAutoLockEnabled).toBe(false)
    })

    it('should return stored timeoutMs from localStorage', () => {
      const customTimeout = 60000
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS,
        String(customTimeout)
      )
      const { result } = renderHook(() => useAutoLockPreferences())
      expect(result.current.timeoutMs).toBe(customTimeout)
    })
  })

  describe('setAutoLockEnabled', () => {
    it('should set isAutoLockEnabled to false and update localStorage', () => {
      const { result } = renderHook(() => useAutoLockPreferences())

      act(() => {
        result.current.setAutoLockEnabled(false)
      })

      expect(result.current.isAutoLockEnabled).toBe(false)
      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)).toBe(
        'false'
      )
    })

    it('should set isAutoLockEnabled to true and remove localStorage key', () => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'false')
      const { result } = renderHook(() => useAutoLockPreferences())

      act(() => {
        result.current.setAutoLockEnabled(true)
      })

      expect(result.current.isAutoLockEnabled).toBe(true)
      expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)).toBe(
        null
      )
    })

    it('should dispatch auto-lock-settings-changed event when enabling', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')
      const { result } = renderHook(() => useAutoLockPreferences())

      act(() => {
        result.current.setAutoLockEnabled(true)
      })

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auto-lock-settings-changed' })
      )
    })

    it('should dispatch auto-lock-settings-changed event when disabling', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')
      const { result } = renderHook(() => useAutoLockPreferences())

      act(() => {
        result.current.setAutoLockEnabled(false)
      })

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auto-lock-settings-changed' })
      )
    })
  })

  describe('setTimeoutMs', () => {
    it('should update timeoutMs state and localStorage', () => {
      const { result } = renderHook(() => useAutoLockPreferences())
      const newTimeout = 120000

      act(() => {
        result.current.setTimeoutMs(newTimeout)
      })

      expect(result.current.timeoutMs).toBe(newTimeout)
      expect(
        localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS)
      ).toBe(String(newTimeout))
    })

    it('should dispatch auto-lock-settings-changed event', () => {
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')
      const { result } = renderHook(() => useAutoLockPreferences())

      act(() => {
        result.current.setTimeoutMs(60000)
      })

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auto-lock-settings-changed' })
      )
    })
  })
})

describe('getAutoLockTimeoutMs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return DEFAULT_AUTO_LOCK_TIMEOUT when localStorage is empty', () => {
    expect(getAutoLockTimeoutMs()).toBe(DEFAULT_AUTO_LOCK_TIMEOUT)
  })

  it('should return stored timeout from localStorage', () => {
    const customTimeout = 300000
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS,
      String(customTimeout)
    )
    expect(getAutoLockTimeoutMs()).toBe(customTimeout)
  })
})

describe('isAutoLockEnabled', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return true when localStorage is empty', () => {
    expect(isAutoLockEnabled()).toBe(true)
  })

  it('should return false when localStorage is set to "false"', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'false')
    expect(isAutoLockEnabled()).toBe(false)
  })

  it('should return true for any value other than "false"', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'true')
    expect(isAutoLockEnabled()).toBe(true)

    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'random')
    expect(isAutoLockEnabled()).toBe(true)
  })
})
