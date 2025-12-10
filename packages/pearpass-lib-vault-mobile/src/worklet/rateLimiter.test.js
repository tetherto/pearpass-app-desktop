import { RateLimiter } from './rateLimiter'

const DEFAULT_DATA = {
  failedAttempts: 0,
  lockoutUntil: null
}

describe('RateLimiter', () => {
  let rateLimiter
  let mockStorage

  beforeEach(async () => {
    rateLimiter = new RateLimiter()
    mockStorage = {
      get: jest.fn(),
      add: jest.fn()
    }
    await rateLimiter.setStorage(mockStorage)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  test('should set storage', () => {
    expect(rateLimiter.storage).toBe(mockStorage)
  })

  test('should throw error when storage is not provided', async () => {
    const newRateLimiter = new RateLimiter()
    await expect(newRateLimiter.setStorage(null)).rejects.toThrow(
      'Storage must have get and add methods'
    )
  })

  test('should increment failed attempts', async () => {
    mockStorage.add.mockResolvedValue()
    mockStorage.get.mockResolvedValue({
      failedAttempts: 2,
      lockoutUntil: null
    })

    await rateLimiter.recordFailure()

    expect(mockStorage.add).toHaveBeenCalledWith('rateLimitData', {
      failedAttempts: 3,
      lockoutUntil: null
    })
  })

  test('should set lockout when max attempts (5) is reached', async () => {
    mockStorage.add.mockResolvedValue()
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
    mockStorage.get.mockResolvedValue({
      failedAttempts: 4,
      lockoutUntil: null
    })

    await rateLimiter.recordFailure()

    expect(mockStorage.add).toHaveBeenCalledWith('rateLimitData', {
      failedAttempts: 5,
      lockoutUntil: 1300000
    })
  })

  test('should reset attempts when expired lockout exists', async () => {
    mockStorage.add.mockResolvedValue()
    const pastTime = Date.now() - 10000
    mockStorage.get.mockResolvedValue({
      failedAttempts: 5,
      lockoutUntil: pastTime
    })

    await rateLimiter.recordFailure()

    expect(mockStorage.add).toHaveBeenCalledWith('rateLimitData', {
      failedAttempts: 1,
      lockoutUntil: null
    })
  })

  test('should return unlocked status when no lockout', async () => {
    mockStorage.add.mockResolvedValue()
    mockStorage.get.mockResolvedValue({
      failedAttempts: 2,
      lockoutUntil: null
    })

    const result = await rateLimiter.getStatus()

    expect(result).toEqual({
      isLocked: false,
      lockoutRemainingMs: 0,
      remainingAttempts: 3
    })
    expect(mockStorage.add).not.toHaveBeenCalled()
  })

  test('should reset status when lockout is expired', async () => {
    mockStorage.add.mockResolvedValue()
    const pastTime = Date.now() - 10000
    mockStorage.get.mockResolvedValue({
      failedAttempts: 5,
      lockoutUntil: pastTime
    })

    const result = await rateLimiter.getStatus()

    expect(result).toEqual({
      isLocked: false,
      lockoutRemainingMs: 0,
      remainingAttempts: 5
    })
    expect(mockStorage.add).toHaveBeenCalledWith('rateLimitData', DEFAULT_DATA)
  })

  test('should return locked status when lockout is active', async () => {
    mockStorage.add.mockResolvedValue()
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
    mockStorage.get.mockResolvedValue({
      failedAttempts: 5,
      lockoutUntil: 1060000
    })

    const result = await rateLimiter.getStatus()

    expect(result).toEqual({
      isLocked: true,
      lockoutRemainingMs: 60000,
      remainingAttempts: 0
    })
  })

  test('should reset to default data', async () => {
    mockStorage.add.mockResolvedValue()

    await rateLimiter.reset()

    expect(mockStorage.add).toHaveBeenCalledWith('rateLimitData', DEFAULT_DATA)
  })

  test('should return correct remaining attempts after failures', async () => {
    mockStorage.get.mockResolvedValue({
      failedAttempts: 2,
      lockoutUntil: null
    })

    const remaining = await rateLimiter.getRemainingAttempts()

    expect(remaining).toBe(3)
  })

  test('should return 0 remaining attempts when locked out', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
    mockStorage.get.mockResolvedValue({
      failedAttempts: 5,
      lockoutUntil: 1060000
    })

    const remaining = await rateLimiter.getRemainingAttempts()

    expect(remaining).toBe(0)
  })
})
