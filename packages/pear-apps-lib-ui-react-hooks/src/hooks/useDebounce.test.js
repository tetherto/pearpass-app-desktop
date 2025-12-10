import { renderHook, act } from '@testing-library/react'

import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  jest.useFakeTimers()

  it('should return the initial value immediately', () => {
    const initialValue = 'test'
    const { result } = renderHook(() => useDebounce({ value: initialValue }))

    expect(result.current.debouncedValue).toBe(initialValue)
  })

  it('should update the debounced value after the delay', () => {
    const initialValue = 'test'
    const newValue = 'updated'
    const delay = 200

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce({ value, delay }),
      { initialProps: { value: initialValue, delay } }
    )

    expect(result.current.debouncedValue).toBe(initialValue)

    rerender({ value: newValue, delay })
    expect(result.current.debouncedValue).toBe(initialValue)

    act(() => {
      jest.advanceTimersByTime(delay)
    })

    expect(result.current.debouncedValue).toBe(newValue)
  })

  it('should use default delay when not provided', () => {
    const initialValue = 'test'
    const newValue = 'updated'
    const defaultDelay = 200

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce({ value }),
      { initialProps: { value: initialValue } }
    )

    rerender({ value: newValue })
    expect(result.current.debouncedValue).toBe(initialValue)

    act(() => {
      jest.advanceTimersByTime(defaultDelay)
    })

    expect(result.current.debouncedValue).toBe(newValue)
  })

  it('should reset timeout when value changes rapidly', () => {
    const initialValue = 'test'
    const intermediateValue = 'intermediate'
    const finalValue = 'final'
    const delay = 200

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce({ value, delay }),
      { initialProps: { value: initialValue } }
    )

    rerender({ value: intermediateValue })

    act(() => {
      jest.advanceTimersByTime(delay / 2)
    })

    rerender({ value: finalValue })

    expect(result.current.debouncedValue).toBe(initialValue)

    act(() => {
      jest.advanceTimersByTime(delay)
    })

    expect(result.current.debouncedValue).toBe(finalValue)
  })

  it('should provide a working debounce function', () => {
    const callback = jest.fn()
    const delay = 200

    const { result } = renderHook(() => useDebounce({ delay }))

    act(() => {
      result.current.debounce(callback)
    })

    expect(callback).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(delay)
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
