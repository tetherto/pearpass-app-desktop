import { renderHook, act } from '@testing-library/react'
import { useThrottle } from 'pear-apps-lib-ui-react-hooks'

import { useWindowResize } from './useWindowResize'

jest.mock('pear-apps-lib-ui-react-hooks', () => ({
  useThrottle: jest.fn()
}))

describe('useWindowResize', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight

  const mockThrottle = jest.fn((callback) => callback())

  beforeEach(() => {
    jest.clearAllMocks()

    useThrottle.mockReturnValue({
      throttle: mockThrottle,
      value: { width: window.innerWidth, height: window.innerHeight }
    })

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: originalInnerHeight
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: originalInnerHeight
    })
  })

  test('should initialize with current window dimensions', () => {
    const { result } = renderHook(() => useWindowResize())

    expect(result.current).toEqual({
      width: window.innerWidth,
      height: window.innerHeight
    })
  })

  test('should update dimensions when window resizes', () => {
    const { result } = renderHook(() => useWindowResize())

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 768
      })

      window.dispatchEvent(new Event('resize'))
    })

    expect(mockThrottle).toHaveBeenCalled()
    expect(result.current).toEqual({
      width: 1024,
      height: 768
    })
  })

  test('should use the provided interval for throttling', () => {
    const customInterval = 500
    renderHook(() => useWindowResize(customInterval))

    expect(useThrottle).toHaveBeenCalledWith({
      value: expect.any(Object),
      interval: customInterval
    })
  })

  test('should use default interval of 350ms when not specified', () => {
    renderHook(() => useWindowResize())

    expect(useThrottle).toHaveBeenCalledWith({
      value: expect.any(Object),
      interval: 350
    })
  })

  test('should remove event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useWindowResize())
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    )
  })
})
