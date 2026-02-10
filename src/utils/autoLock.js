import { AUTO_LOCK_ENABLED } from 'pearpass-lib-constants'

import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

export function applyAutoLockEnabled(enabled) {
  if (!AUTO_LOCK_ENABLED) return

  if (enabled) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED)
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_ENABLED, 'false')
  }

  window.dispatchEvent(new Event('auto-lock-settings-changed'))
  window.dispatchEvent(new Event('apply-auto-lock-enabled'))
}

export function applyAutoLockTimeout(ms) {
  if (!AUTO_LOCK_ENABLED) return

  const value = ms === null ? 'null' : String(ms)
  localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_LOCK_TIMEOUT_MS, value)

  window.dispatchEvent(new Event('auto-lock-settings-changed'))
  window.dispatchEvent(new Event('apply-auto-lock-timeout'))
}
