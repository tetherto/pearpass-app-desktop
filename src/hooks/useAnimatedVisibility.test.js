import { renderHook, act } from '@testing-library/react'

import { useAnimatedVisibility } from './useAnimatedVisibility'

jest.useFakeTimers()

describe('useAnimatedVisibility', () => {
  test('initial state when isOpen is false', () => {
    const { result } = renderHook(() =>
      useAnimatedVisibility({ isOpen: false })
    )

    expect(result.current.isShown).toBe(false)
    expect(result.current.isRendered).toBe(false)
  })

  test('initial state when isOpen is true', () => {
    const { result } = renderHook(() => useAnimatedVisibility({ isOpen: true }))

    expect(result.current.isShown).toBe(true)
    expect(result.current.isRendered).toBe(true)
  })

  test('transitions from closed to open', () => {
    const { result, rerender } = renderHook(
      (props) => useAnimatedVisibility(props),
      { initialProps: { isOpen: false } }
    )

    expect(result.current.isShown).toBe(false)
    expect(result.current.isRendered).toBe(false)

    rerender({ isOpen: true })

    expect(result.current.isShown).toBe(true)
    expect(result.current.isRendered).toBe(true)
  })

  test('transitions from open to closed', () => {
    const { result, rerender } = renderHook(
      (props) => useAnimatedVisibility(props),
      { initialProps: { isOpen: true, transitionDuration: 300 } }
    )

    expect(result.current.isShown).toBe(true)
    expect(result.current.isRendered).toBe(true)

    rerender({ isOpen: false, transitionDuration: 300 })

    expect(result.current.isShown).toBe(false)
    expect(result.current.isRendered).toBe(true)

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(result.current.isShown).toBe(false)
    expect(result.current.isRendered).toBe(false)
  })

  test('uses custom transition duration', () => {
    const customDuration = 500
    const { result, rerender } = renderHook(
      (props) => useAnimatedVisibility(props),
      { initialProps: { isOpen: true, transitionDuration: customDuration } }
    )

    rerender({ isOpen: false, transitionDuration: customDuration })

    expect(result.current.isRendered).toBe(true)

    act(() => {
      jest.advanceTimersByTime(customDuration - 10)
    })

    expect(result.current.isRendered).toBe(true)

    act(() => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current.isRendered).toBe(false)
  })
})
