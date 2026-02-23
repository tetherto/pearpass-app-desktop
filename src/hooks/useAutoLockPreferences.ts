import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { DEFAULT_AUTO_LOCK_TIMEOUT, AUTO_LOCK_ENABLED } from 'pearpass-lib-constants'

import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'
import { applyAutoLockEnabled, applyAutoLockTimeout } from '../utils/autoLock'


type AutoLockContextValue = {
  shouldBypassAutoLock: boolean
  setShouldBypassAutoLock: (value: boolean) => void
  isAutoLockEnabled: boolean
  timeoutMs: number | null
  setAutoLockEnabled: (enabled: boolean) => void
  setTimeoutMs: (ms: number | null) => void
}

const AutoLockContext = createContext<AutoLockContextValue>({
  shouldBypassAutoLock: false,
  setShouldBypassAutoLock: () => { },
  isAutoLockEnabled: true,
  timeoutMs: DEFAULT_AUTO_LOCK_TIMEOUT,
  setAutoLockEnabled: () => { },
  setTimeoutMs: () => { }
})

export const AutoLockProvider = ({ children }: { children: React.ReactNode }) => {
  const [shouldBypassAutoLock, setShouldBypassAutoLock] = useState(false)

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

  const value = useMemo<AutoLockContextValue>(
    () => ({
      shouldBypassAutoLock,
      setShouldBypassAutoLock,
      isAutoLockEnabled: autoLockEnabled,
      timeoutMs,
      setAutoLockEnabled,
      setTimeoutMs
    }),
    [shouldBypassAutoLock, autoLockEnabled, timeoutMs, setAutoLockEnabled, setTimeoutMs]
  )

  return createElement(AutoLockContext.Provider, { value }, children)
}

export const useAutoLockPreferences = () => useContext(AutoLockContext)

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
