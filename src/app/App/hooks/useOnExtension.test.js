import React from 'react'

import { render } from '@testing-library/react'

import { HANDLER_EVENTS } from '../../../constants/services'

const { useOnExtensionExit } = require('./useOnExtensionExit')

const mockNavigate = jest.fn()
const mockResetState = jest.fn()

jest.mock('pearpass-lib-vault', () => ({
  useVaults: () => ({
    resetState: mockResetState
  })
}))

jest.mock('../../../context/RouterContext', () => ({
  useRouter: () => ({
    navigate: mockNavigate
  })
}))

describe('UseOnExtensionExit', () => {
  let addEventListenerSpy
  let removeEventListenerSpy

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should add and remove extension-exit listener on mount/unmount', () => {
    function TestComponent() {
      useOnExtensionExit()
      return null
    }

    const { unmount } = render(<TestComponent />)

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      HANDLER_EVENTS.extensionExit,
      expect.any(Function)
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      HANDLER_EVENTS.extensionExit,
      expect.any(Function)
    )
  })

  it('should call navigate and resetState on extension-exit event', () => {
    let handler
    addEventListenerSpy.mockImplementation((event, cb) => {
      if (event === HANDLER_EVENTS.extensionExit) {
        handler = cb
      }
    })

    function TestComponent() {
      useOnExtensionExit()
      return null
    }

    render(<TestComponent />)

    // Simulate event
    handler()

    expect(mockNavigate).toHaveBeenCalledWith('welcome', {
      state: 'masterPassword'
    })
    expect(mockResetState).toHaveBeenCalled()
  })
})
