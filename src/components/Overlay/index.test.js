import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { Overlay } from './index'
import '@testing-library/jest-dom'

jest.mock('../../hooks/useAnimatedVisibility', () => ({
  useAnimatedVisibility: jest.fn().mockImplementation(({ isOpen }) => ({
    isShown: isOpen,
    isRendered: isOpen
  }))
}))

describe('Overlay', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
    jest.clearAllMocks()
  })

  const renderComponent = (props = {}) =>
    render(
      <ThemeProvider>
        <Overlay isOpen={false} onClick={mockOnClick} {...props} />
      </ThemeProvider>
    )

  test('does not render when isRendered is false', () => {
    require('../../hooks/useAnimatedVisibility').useAnimatedVisibility.mockReturnValue(
      {
        isShown: false,
        isRendered: false
      }
    )

    const { container } = renderComponent()
    expect(container).toBeEmptyDOMElement()
    expect(container).toMatchSnapshot()
  })

  test('renders when isRendered is true', async () => {
    require('../../hooks/useAnimatedVisibility').useAnimatedVisibility.mockReturnValue(
      {
        isShown: true,
        isRendered: true
      }
    )

    const { container } = renderComponent({ isOpen: true })

    expect(container.querySelector('div[type="default"]')).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    require('../../hooks/useAnimatedVisibility').useAnimatedVisibility.mockReturnValue(
      {
        isShown: true,
        isRendered: true
      }
    )

    const { container } = renderComponent({ isOpen: true })
    fireEvent.click(container.querySelector('div[type="default"]'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('passes type prop to OverlayComponent', () => {
    require('../../hooks/useAnimatedVisibility').useAnimatedVisibility.mockReturnValue(
      {
        isShown: true,
        isRendered: true
      }
    )

    const { container } = renderComponent({ isOpen: true, type: 'blur' })
    expect(container.querySelector('div[type="blur"]')).toBeInTheDocument()
  })

  test('uses default type when not provided', () => {
    require('../../hooks/useAnimatedVisibility').useAnimatedVisibility.mockReturnValue(
      {
        isShown: true,
        isRendered: true
      }
    )

    const { container } = renderComponent({ isOpen: true })
    expect(container.querySelector('div[type="default"]')).toBeInTheDocument()
  })
})
