import React from 'react'

import { render, act } from '@testing-library/react'

const { useInactivity } = require('./useInactivity')

jest.mock('pearpass-lib-vault', () => ({
  closeAllInstances: jest.fn(() => Promise.resolve()),
  useVaults: () => ({
    resetState: jest.fn()
  }),
  useUserData: () => ({
    refetch: jest.fn(() => Promise.resolve({ isLoggedIn: true }))
  })
}))

jest.mock('../../../hooks/useAutoLockPreferences', () => ({
  getAutoLockTimeoutMs: jest.fn(() => 500)
}))

jest.mock('../../../context/LoadingContext', () => ({
  useLoadingContext: () => ({
    setIsLoading: jest.fn()
  })
}))

jest.mock('../../../context/RouterContext', () => ({
  useRouter: () => ({
    currentPage: 'home',
    data: {},
    navigate: jest.fn()
  })
}))

jest.mock('../../../context/ModalContext', () => ({
  useModal: () => ({
    closeModal: jest.fn()
  })
}))

describe('useInactivity', () => {
  let addEventListenerSpy
  let removeEventListenerSpy
  let clearTimeoutSpy
  let setTimeoutSpy
  let originalClearTimeout
  let originalSetTimeout

  beforeEach(() => {
    jest.useFakeTimers()
    originalClearTimeout = global.clearTimeout
    originalSetTimeout = global.setTimeout
    if (typeof global.clearTimeout !== 'function') {
      global.clearTimeout = () => {}
    }
    if (typeof global.setTimeout !== 'function') {
      global.setTimeout = () => {}
    }
    addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    setTimeoutSpy = jest.spyOn(global, 'setTimeout')
  })

  afterEach(() => {
    global.clearTimeout = originalClearTimeout
    global.setTimeout = originalSetTimeout
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const TestComponent = () => {
    useInactivity()
    return null
  }

  it('adds and removes event listeners on mount/unmount', () => {
    const { unmount } = render(<TestComponent />)
    expect(addEventListenerSpy).toHaveBeenCalled()
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalled()
  })

  it('registers activity event listeners including reset-timer and ipc-activity', () => {
    render(<TestComponent />)
    const expectedEvents = [
      'reset-timer',
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
      'ipc-activity',
      'auto-lock-settings-changed'
    ]
    expectedEvents.forEach((event) => {
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        event,
        expect.any(Function)
      )
    })
  })

  it('dedupes rapid successive resetTimer calls', () => {
    render(<TestComponent />)
    // Grab the last registered listener for, say, mousemove
    const mouseListener = addEventListenerSpy.mock.calls.find(
      ([name]) => name === 'mousemove'
    )[1]

    act(() => {
      mouseListener()
      mouseListener()
    })

    // Only one timeout should be scheduled because of dedupe
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
  })

  it('schedules and clears timeout on unmount', () => {
    const { unmount } = render(<TestComponent />)
    expect(setTimeoutSpy).toHaveBeenCalled()
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
