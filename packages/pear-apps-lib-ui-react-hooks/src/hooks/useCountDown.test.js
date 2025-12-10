import { renderHook, act } from '@testing-library/react'

import { useCountDown } from './useCountDown'
import { MS_PER_SECOND } from '../constants/time'

jest.spyOn(global, 'clearInterval')

jest.mock('../constants/time', () => ({
  MS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60
}))

describe('useCountDown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should initialize with the correct time format', () => {
    const { result } = renderHook(() => useCountDown({ initialSeconds: 65 }))
    expect(result.current).toBe('1:05')
  })

  it('should count down correctly', () => {
    const { result } = renderHook(() => useCountDown({ initialSeconds: 65 }))

    expect(result.current).toBe('1:05')

    act(() => {
      jest.advanceTimersByTime(MS_PER_SECOND)
    })
    expect(result.current).toBe('1:04')

    act(() => {
      jest.advanceTimersByTime(MS_PER_SECOND * 5)
    })
    expect(result.current).toBe('0:59')
  })

  it('should call onFinish when timer reaches zero', () => {
    const onFinish = jest.fn()
    renderHook(() => useCountDown({ initialSeconds: 2, onFinish }))

    expect(onFinish).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(MS_PER_SECOND)
    })
    expect(onFinish).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(MS_PER_SECOND)
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('should clear interval on unmount', () => {
    const { unmount } = renderHook(() => useCountDown({ initialSeconds: 10 }))

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('should format time correctly for different values', () => {
    const { result: result1 } = renderHook(() =>
      useCountDown({ initialSeconds: 3665 })
    )
    expect(result1.current).toBe('61:05')

    const { result: result2 } = renderHook(() =>
      useCountDown({ initialSeconds: 9 })
    )
    expect(result2.current).toBe('0:09')
  })
})
