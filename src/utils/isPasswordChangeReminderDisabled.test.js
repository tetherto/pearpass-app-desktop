import { isPasswordChangeReminderDisabled } from './isPasswordChangeReminderDisabled'
import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

const createLocalStorageMock = () => {
  const store = {}
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    }
  }
}

describe('isPasswordChangeReminderDisabled', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true
    })
  })

  it('returns false when key is missing', () => {
    expect(isPasswordChangeReminderDisabled()).toBe(false)
  })

  it('returns true when value is string "false" (disabled)', () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
      'false'
    )
    expect(isPasswordChangeReminderDisabled()).toBe(true)
  })

  it('returns false for any other value', () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
      'yes'
    )
    expect(isPasswordChangeReminderDisabled()).toBe(false)
  })
})
