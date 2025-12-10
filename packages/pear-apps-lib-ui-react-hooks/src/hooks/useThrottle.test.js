import { renderHook, act } from '@testing-library/react'

import { useThrottle } from './useThrottle'

describe('useThrottle hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should initialize with the given value', () => {
    const { result } = renderHook(() =>
      useThrottle({ value: 'initial', interval: 1000 })
    )
    expect(result.current.throttledValue).toBe('initial')
  })

  it('should update throttledValue immediately on mount when enough time has passed', () => {
    const { result, rerender } = renderHook(
      ({ value, interval }) => useThrottle({ value, interval }),
      { initialProps: { value: 'initial', interval: 1000 } }
    )

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    act(() => {
      rerender({ value: 'updated', interval: 1000 })
    })

    expect(result.current.throttledValue).toBe('updated')
  })

  it('should delay update if interval has not passed', () => {
    const { result, rerender } = renderHook(
      ({ value, interval }) => useThrottle({ value, interval }),
      { initialProps: { value: 0, interval: 1000 } }
    )

    act(() => {
      rerender({ value: 1, interval: 1000 })
    })

    expect(result.current.throttledValue).toBe(0)

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current.throttledValue).toBe(0)

    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current.throttledValue).toBe(1)
  })

  it('should only update with the latest value after multiple rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, interval }) => useThrottle({ value, interval }),
      { initialProps: { value: 0, interval: 1000 } }
    )

    act(() => {
      rerender({ value: 1, interval: 1000 })
      rerender({ value: 2, interval: 1000 })
      rerender({ value: 3, interval: 1000 })
    })

    expect(result.current.throttledValue).toBe(0)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.throttledValue).toBe(3)
  })

  it('should execute throttle callback immediately if enough time has passed', () => {
    const callback = jest.fn()
    const { result } = renderHook(() =>
      useThrottle({ value: 0, interval: 1000 })
    )

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    act(() => {
      result.current.throttle(callback)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should schedule throttle callback if called within the interval', () => {
    const callback = jest.fn()
    jest.setSystemTime(1000)
    const { result } = renderHook(() =>
      useThrottle({ value: 0, interval: 1000 })
    )

    jest.setSystemTime(2100)

    act(() => {
      result.current.throttle(callback)
      result.current.throttle(callback)
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
