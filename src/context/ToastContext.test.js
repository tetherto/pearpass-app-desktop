import React from 'react'

import { render, act } from '@testing-library/react'

import { ToastProvider, useToast } from './ToastContext'
import { Toasts } from '../components/Toasts'

jest.mock('../components/Toasts', () => ({
  Toasts: jest.fn(() => null)
}))

jest.useFakeTimers()

const TestComponent = ({ onToast }) => {
  const { setToast } = useToast()
  React.useEffect(() => {
    if (onToast) {
      onToast(setToast)
    }
  }, [onToast])
  return null
}

describe('ToastContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('should provide toast context', () => {
    const mockSetToast = jest.fn()

    render(
      <ToastProvider>
        <TestComponent onToast={mockSetToast} />
      </ToastProvider>
    )

    expect(mockSetToast).toHaveBeenCalled()
    expect(typeof mockSetToast.mock.calls[0][0]).toBe('function')
  })

  it('should add toast to stack when setToast is called', () => {
    let setToastFn
    const toastData = { message: 'Test toast', icon: 'test-icon' }

    render(
      <ToastProvider>
        <TestComponent
          onToast={(fn) => {
            setToastFn = fn
          }}
        />
      </ToastProvider>
    )

    act(() => {
      setToastFn(toastData)
    })

    // Find the call with toasts
    const callsWithToasts = Toasts.mock.calls.filter(
      (call) => call[0].toasts.length > 0
    )
    expect(callsWithToasts.length).toBeGreaterThan(0)
    expect(callsWithToasts[callsWithToasts.length - 1][0]).toEqual(
      expect.objectContaining({
        toasts: [toastData]
      })
    )
  })

  it('should remove toast after timeout', () => {
    let setToastFn
    const toastData = { message: 'Test toast', icon: 'test-icon' }

    render(
      <ToastProvider>
        <TestComponent
          onToast={(fn) => {
            setToastFn = fn
          }}
        />
      </ToastProvider>
    )

    act(() => {
      setToastFn(toastData)
    })

    // Verify toast was added
    const callsWithToasts = Toasts.mock.calls.filter(
      (call) => call[0].toasts.length > 0
    )
    expect(callsWithToasts.length).toBeGreaterThan(0)
    expect(callsWithToasts[callsWithToasts.length - 1][0]).toEqual(
      expect.objectContaining({
        toasts: [toastData]
      })
    )

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Find the last call with empty toasts
    const lastCall = Toasts.mock.calls[Toasts.mock.calls.length - 1]
    expect(lastCall[0].toasts).toEqual([])
  })

  it('should handle multiple toasts', () => {
    let setToastFn
    const toast1 = { message: 'Test toast 1', icon: 'icon-1' }
    const toast2 = { message: 'Test toast 2', icon: 'icon-2' }

    render(
      <ToastProvider>
        <TestComponent
          onToast={(fn) => {
            setToastFn = fn
          }}
        />
      </ToastProvider>
    )

    act(() => {
      setToastFn(toast1)
      setToastFn(toast2)
    })

    // Find the call with two toasts
    const callsWithTwoToasts = Toasts.mock.calls.filter(
      (call) => call[0].toasts.length === 2
    )
    expect(callsWithTwoToasts.length).toBeGreaterThan(0)
    expect(callsWithTwoToasts[callsWithTwoToasts.length - 1][0]).toEqual(
      expect.objectContaining({
        toasts: [toast1, toast2]
      })
    )
  })
})
