import { useCallback, useState } from 'react'

import { DEFAULT_AUTO_LOCK_TIMEOUT, AUTO_LOCK_ENABLED } from 'pearpass-lib-constants'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

export const useAutoLockPreferences = () => {
  const [isAutoLockEnabled, setIsAutoLockEnabledState] = useState<boolean>(() => {
    if (!AUTO_LOCK_ENABLED) {
      return false
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
    return stored !== 'false'
  })

  const [timeoutMs, setTimeoutMsState] = useState<number>(() => {
    if (!AUTO_LOCK_ENABLED) {
      return DEFAULT_AUTO_LOCK_TIMEOUT
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS)
    return stored ? Number(stored) : DEFAULT_AUTO_LOCK_TIMEOUT
  })

  const setAutoLockEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'false')
    }
    setIsAutoLockEnabledState(enabled)
    window.dispatchEvent(new Event('auto-lock-settings-changed'))
  }, [])

  const setTimeoutMs = useCallback((ms: number) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS, String(ms))
    setTimeoutMsState(ms)
    window.dispatchEvent(new Event('auto-lock-settings-changed'))
  }, [])

  return {
    isAutoLockEnabled,
    timeoutMs,
    setAutoLockEnabled,
    setTimeoutMs
  }
}

export function getAutoLockTimeoutMs(): number {
  if (!AUTO_LOCK_ENABLED) {
    return DEFAULT_AUTO_LOCK_TIMEOUT
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS)
  return stored ? Number(stored) : DEFAULT_AUTO_LOCK_TIMEOUT
}

export function isAutoLockEnabled(): boolean {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
  return stored !== 'false'
}
