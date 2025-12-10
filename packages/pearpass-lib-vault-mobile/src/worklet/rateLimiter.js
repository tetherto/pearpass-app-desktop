const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 5 * 60 * 1000
const STORAGE_KEY = 'rateLimitData'

const DEFAULT_DATA = {
  failedAttempts: 0,
  lockoutUntil: null
}

export class RateLimiter {
  constructor() {
    /**
     * @type {{ get: Function, add: Function } | null}
     */
    this.storage = null
  }

  async setStorage(storage) {
    if (!storage) {
      throw new Error('Storage must have get and add methods')
    }
    this.storage = storage
  }

  async getData() {
    if (!this.storage) {
      throw new Error('Storage not initialized.')
    }

    try {
      const data = await this.storage.get(STORAGE_KEY)
      return data || { ...DEFAULT_DATA }
    } catch {
      return { ...DEFAULT_DATA }
    }
  }

  isLockoutExpired(lockoutUntil) {
    if (lockoutUntil === null) {
      return true
    }
    return Date.now() >= lockoutUntil
  }

  async getStatus() {
    const data = await this.getData()

    if (
      data.lockoutUntil !== null &&
      this.isLockoutExpired(data.lockoutUntil)
    ) {
      await this.reset()
      return {
        isLocked: false,
        lockoutRemainingMs: 0,
        remainingAttempts: MAX_ATTEMPTS
      }
    }

    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - data.failedAttempts)
    const isLocked = remainingAttempts <= 0 && data.lockoutUntil !== null
    const lockoutRemainingMs = data.lockoutUntil
      ? Math.max(0, data.lockoutUntil - Date.now())
      : 0

    return { isLocked, lockoutRemainingMs, remainingAttempts }
  }

  async getRemainingAttempts() {
    const data = await this.getData()
    return Math.max(0, MAX_ATTEMPTS - data.failedAttempts)
  }

  async recordFailure() {
    const data = await this.getData()

    if (
      data.lockoutUntil !== null &&
      this.isLockoutExpired(data.lockoutUntil)
    ) {
      data.failedAttempts = 0
      data.lockoutUntil = null
    }

    data.failedAttempts++

    if (data.failedAttempts >= MAX_ATTEMPTS) {
      data.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS
    }

    await this.storage.add(STORAGE_KEY, data)
  }

  async reset() {
    await this.storage.add(STORAGE_KEY, { ...DEFAULT_DATA })
  }
}
