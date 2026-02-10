import { useCallback, useState, useEffect } from 'react'

import { DEFAULT_AUTO_LOCK_TIMEOUT, AUTO_LOCK_ENABLED } from 'pearpass-lib-constants'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'
import { applyAutoLockEnabled, applyAutoLockTimeout } from '../utils/autoLock'

export const useAutoLockPreferences = () => {
  const [autoLockEnabled, setAutoLockEnabledState] = useState<boolean>(() => {
    if (!AUTO_LOCK_ENABLED) {
      return false
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
    return stored !== 'false'
  })

  const [timeoutMs, setTimeoutMsState] = useState<number | null>(() => {
    if (!AUTO_LOCK_ENABLED) {
      return DEFAULT_AUTO_LOCK_TIMEOUT
    }
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS)
    if (stored === 'null') {
      return null
    }
    return stored ? Number(stored) : DEFAULT_AUTO_LOCK_TIMEOUT
  })

  useEffect(() => {
    const syncFromStorage = () => {
      setAutoLockEnabledState(isAutoLockEnabled())
    }

    window.addEventListener('apply-auto-lock-enabled', syncFromStorage)
  
    return () => {
      window.removeEventListener(
        'apply-auto-lock-enabled',
        syncFromStorage
      )
    }
  }, [])

  
  useEffect(() => {
    const syncFromStorage = () => {
      setTimeoutMsState(getAutoLockTimeoutMs())
    }
  
    window.addEventListener('apply-auto-lock-timeout', syncFromStorage)
  
    return () => {
      window.removeEventListener(
        'apply-auto-lock-timeout',
        syncFromStorage
      )
    }
  }, [])
  
  

  const setAutoLockEnabled = useCallback((enabled: boolean) => {
    applyAutoLockEnabled(enabled)
    setAutoLockEnabledState(enabled)
  }, [])


  const setTimeoutMs = useCallback((ms: number | null) => {
    applyAutoLockTimeout(ms)
    setTimeoutMsState(ms)
  }, [])


  return {
    isAutoLockEnabled: autoLockEnabled,
    timeoutMs,
    setAutoLockEnabled,
    setTimeoutMs
  }
}

export function getAutoLockTimeoutMs(): number | null {
  if (!AUTO_LOCK_ENABLED) {
    return DEFAULT_AUTO_LOCK_TIMEOUT
  }
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS)
  if (stored === 'null') {
    return null
  }
  return stored ? Number(stored) : DEFAULT_AUTO_LOCK_TIMEOUT
}

export function isAutoLockEnabled(): boolean {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
  return stored !== 'false'
}
