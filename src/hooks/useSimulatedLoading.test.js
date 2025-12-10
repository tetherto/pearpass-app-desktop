import { renderHook, act } from '@testing-library/react'

import { useSimulatedLoading } from './useSimulatedLoading'

describe('useSimulatedLoading', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should initially return true', () => {
    const { result } = renderHook(() => useSimulatedLoading())
    expect(result.current).toBe(true)
  })

  it('should return false after the duration', () => {
    const { result } = renderHook(() => useSimulatedLoading(1000))

    expect(result.current).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBe(false)
  })

  it('should use the default duration when not provided', () => {
    const { result } = renderHook(() => useSimulatedLoading())

    expect(result.current).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1999)
    })
    expect(result.current).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe(false)
  })

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    const { unmount } = renderHook(() => useSimulatedLoading())

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
