import { renderHook, fireEvent } from '@testing-library/react'

import { useOutsideClick } from './useOutsideClick'

describe('useOutsideClick', () => {
  beforeEach(() => {
    const div = document.createElement('div')
    document.body.appendChild(div)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  test('should add event listeners on mount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
    const mockOnOutsideClick = jest.fn()

    renderHook(() => useOutsideClick({ onOutsideClick: mockOnOutsideClick }))

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    )
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    )
  })

  test('should remove event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
    const mockOnOutsideClick = jest.fn()

    const { unmount } = renderHook(() =>
      useOutsideClick({ onOutsideClick: mockOnOutsideClick })
    )
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    )
  })

  test('should call onOutsideClick when clicking outside the ref element', () => {
    const mockOnOutsideClick = jest.fn()

    const { result } = renderHook(() =>
      useOutsideClick({ onOutsideClick: mockOnOutsideClick })
    )

    const divElement = document.createElement('div')
    document.body.appendChild(divElement)

    Object.defineProperty(result.current, 'current', {
      value: divElement,
      writable: true
    })

    const outsideElement = document.createElement('button')
    document.body.appendChild(outsideElement)

    fireEvent.mouseDown(outsideElement)

    expect(mockOnOutsideClick).toHaveBeenCalled()
  })

  test('should not call onOutsideClick when clicking inside the ref element', () => {
    const mockOnOutsideClick = jest.fn()

    const { result } = renderHook(() =>
      useOutsideClick({ onOutsideClick: mockOnOutsideClick })
    )

    const divElement = document.createElement('div')
    document.body.appendChild(divElement)

    Object.defineProperty(result.current, 'current', {
      value: divElement,
      writable: true
    })

    fireEvent.mouseDown(divElement)

    expect(mockOnOutsideClick).not.toHaveBeenCalled()
  })
})
