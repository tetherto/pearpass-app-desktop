import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

/**
 * Get/set native messaging preference in localStorage
 */
export const getNativeMessagingEnabled = () =>
  localStorage.getItem(LOCAL_STORAGE_KEYS.NATIVE_MESSAGING_ENABLED) === 'true'

export const setNativeMessagingEnabled = (enabled) => {
  if (enabled) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NATIVE_MESSAGING_ENABLED, 'true')
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.NATIVE_MESSAGING_ENABLED)
  }
}
