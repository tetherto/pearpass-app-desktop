import {
  getNativeMessagingEnabled,
  setNativeMessagingEnabled
} from './nativeMessagingPreferences'

describe('nativeMessagingPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getNativeMessagingEnabled', () => {
    it('should return false when the item is not in localStorage', () => {
      expect(getNativeMessagingEnabled()).toBe(false)
    })

    it('should return true when the item is set to "true" in localStorage', () => {
      localStorage.setItem('native-messaging-enabled', 'true')
      expect(getNativeMessagingEnabled()).toBe(true)
    })

    it('should return false when the item is set to something other than "true"', () => {
      localStorage.setItem('native-messaging-enabled', 'false')
      expect(getNativeMessagingEnabled()).toBe(false)
    })
  })

  describe('setNativeMessagingEnabled', () => {
    it('should set the item to "true" in localStorage when enabled is true', () => {
      setNativeMessagingEnabled(true)
      expect(localStorage.getItem('native-messaging-enabled')).toBe('true')
    })

    it('should remove the item from localStorage when enabled is false', () => {
      localStorage.setItem('native-messaging-enabled', 'true')
      setNativeMessagingEnabled(false)
      expect(localStorage.getItem('native-messaging-enabled')).toBeNull()
    })

    it('should not add the item if it does not exist and enabled is false', () => {
      setNativeMessagingEnabled(false)
      expect(localStorage.getItem('native-messaging-enabled')).toBeNull()
    })
  })
})
