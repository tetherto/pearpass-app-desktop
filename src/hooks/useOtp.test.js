import { renderHook, act, waitFor } from '@testing-library/react'

import { useOtp } from './useOtp'

jest.mock('pearpass-lib-vault', () => ({
  generateOtpCodesByIds: jest.fn(),
  generateHotpNext: jest.fn()
}))

const {
  generateOtpCodesByIds,
  generateHotpNext
} = require('pearpass-lib-vault')

jest.useFakeTimers()

describe('useOtp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns null values when otpPublic is undefined', () => {
    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic: undefined })
    )

    expect(result.current.code).toBeNull()
    expect(result.current.timeRemaining).toBeNull()
    expect(result.current.type).toBeNull()
    expect(result.current.period).toBeNull()
    expect(result.current.generateNext).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  test('initializes TOTP with code and timeRemaining from otpPublic', () => {
    const otpPublic = {
      type: 'TOTP',
      digits: 6,
      period: 30,
      currentCode: '123456',
      timeRemaining: 20
    }

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    expect(result.current.code).toBe('123456')
    expect(result.current.type).toBe('TOTP')
    expect(result.current.period).toBe(30)
    expect(result.current.generateNext).toBeNull()
  })

  test('TOTP countdown decrements timeRemaining', async () => {
    const otpPublic = {
      type: 'TOTP',
      digits: 6,
      period: 30,
      currentCode: '123456',
      timeRemaining: 5
    }

    generateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '654321', timeRemaining: 30 }
    ])

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    // Advance time to trigger countdown
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current.timeRemaining).toBeLessThan(5)
  })

  test('TOTP refreshes code when timeRemaining reaches 0', async () => {
    const otpPublic = {
      type: 'TOTP',
      digits: 6,
      period: 30,
      currentCode: '123456',
      timeRemaining: 1
    }

    generateOtpCodesByIds.mockResolvedValue([
      { recordId: 'rec-1', code: '654321', timeRemaining: 30 }
    ])

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    // Advance past the expiry
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(generateOtpCodesByIds).toHaveBeenCalledWith(['rec-1'])
    })

    await waitFor(() => {
      expect(result.current.code).toBe('654321')
    })
  })

  test('HOTP initializes with currentCode and exposes generateNext', () => {
    const otpPublic = {
      type: 'HOTP',
      digits: 6,
      currentCode: '111222'
    }

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    expect(result.current.code).toBe('111222')
    expect(result.current.type).toBe('HOTP')
    expect(result.current.timeRemaining).toBeNull()
    expect(result.current.generateNext).toBeInstanceOf(Function)
  })

  test('HOTP generateNext calls generateHotpNext and updates code', async () => {
    const otpPublic = {
      type: 'HOTP',
      digits: 6,
      currentCode: '111222'
    }

    generateHotpNext.mockResolvedValue({ code: '333444', counter: 1 })

    const { result } = renderHook(() =>
      useOtp({ recordId: 'rec-1', otpPublic })
    )

    await act(async () => {
      await result.current.generateNext()
    })

    expect(generateHotpNext).toHaveBeenCalledWith('rec-1')
    expect(result.current.code).toBe('333444')
    expect(result.current.isLoading).toBe(false)
  })
})
