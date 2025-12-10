import React, { useState } from 'react'

import { render, fireEvent, waitFor, act } from '@testing-library/react'

import { PopupMenu } from './index'
import { TRANSITION_DURATION } from './styles'
import '@testing-library/jest-dom'

const PopupMenuWrapper = ({
  children,
  content,
  direction = 'bottomLeft',
  initialOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  return (
    <PopupMenu
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      content={content}
      direction={direction}
    >
      {children}
    </PopupMenu>
  )
}

describe('PopupMenu Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('toggles open state when trigger is clicked (by opacity)', async () => {
    const { getByText, container } = render(
      <PopupMenuWrapper content={<div>Menu Content</div>}>
        <button>Toggle Menu</button>
      </PopupMenuWrapper>
    )

    const menuContentInitial = getByText('Menu Content')
    const menuCardInitial = menuContentInitial.parentElement
    const computedStyle = window.getComputedStyle(menuCardInitial)
    expect(computedStyle.opacity).toBe('0')

    fireEvent.click(getByText('Toggle Menu'))
    await waitFor(() => {
      const menuContentOpen = getByText('Menu Content')
      const menuCardOpen = menuContentOpen.parentElement
      const computedStyleOpen = window.getComputedStyle(menuCardOpen)
      expect(computedStyleOpen.opacity).toBe('1')
    })

    fireEvent.click(getByText('Toggle Menu'))
    act(() => {
      jest.advanceTimersByTime(TRANSITION_DURATION)
    })
    await waitFor(() => {
      const menuContentClosed = getByText('Menu Content')
      const menuCardClosed = menuContentClosed.parentElement
      const computedStyleClosed = window.getComputedStyle(menuCardClosed)
      expect(computedStyleClosed.opacity).toBe('0')
    })

    expect(container).toMatchSnapshot()
  })

  test('closes menu when clicking outside', async () => {
    const { getByText } = render(
      <div>
        <div data-testid="outside-element">Outside Element</div>
        <PopupMenuWrapper content={<div>Menu Content</div>}>
          <button>Toggle Menu</button>
        </PopupMenuWrapper>
      </div>
    )

    fireEvent.click(getByText('Toggle Menu'))

    await waitFor(() => {
      const menuContent = getByText('Menu Content')
      const menuCard = menuContent.parentElement
      expect(window.getComputedStyle(menuCard).opacity).toBe('1')
    })

    fireEvent.mouseDown(getByText('Outside Element'))

    act(() => {
      jest.advanceTimersByTime(TRANSITION_DURATION)
    })
    await waitFor(() => {
      const menuContent = getByText('Menu Content')
      const menuCard = menuContent.parentElement
      expect(window.getComputedStyle(menuCard).opacity).toBe('0')
    })
  })

  test('removes content from the DOM after transition completes', async () => {
    const { getByText } = render(
      <PopupMenuWrapper content={<div>Menu Content</div>} initialOpen={true}>
        <button>Toggle Menu</button>
      </PopupMenuWrapper>
    )

    const menuContent = getByText('Menu Content')
    const menuCard = menuContent.parentElement
    expect(window.getComputedStyle(menuCard).visibility).toBe('visible')

    fireEvent.click(getByText('Toggle Menu'))

    expect(window.getComputedStyle(menuCard).opacity).toBe('0')
    expect(window.getComputedStyle(menuCard).visibility).toBe('visible')

    act(() => {
      jest.advanceTimersByTime(TRANSITION_DURATION)
    })
    await waitFor(() => {
      expect(window.getComputedStyle(menuCard).visibility).toBe('hidden')
    })
  })

  test('handles window resize by closing the menu', async () => {
    const { getByText } = render(
      <PopupMenuWrapper content={<div>Menu Content</div>}>
        <button>Toggle Menu</button>
      </PopupMenuWrapper>
    )

    fireEvent.click(getByText('Toggle Menu'))

    await waitFor(() => {
      const menuContent = getByText('Menu Content')
      const menuCard = menuContent.parentElement
      expect(window.getComputedStyle(menuCard).opacity).toBe('1')
    })

    fireEvent(window, new Event('resize'))

    act(() => {
      jest.advanceTimersByTime(TRANSITION_DURATION)
    })
    await waitFor(() => {
      const menuContent = getByText('Menu Content')
      const menuCard = menuContent.parentElement
      expect(window.getComputedStyle(menuCard).opacity).toBe('0')
    })
  })
})
