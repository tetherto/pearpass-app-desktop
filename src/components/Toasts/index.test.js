import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { Toasts } from './index'
import '@testing-library/jest-dom'

jest.mock('./styles', () => ({
  ToastContainer: ({ children }) => (
    <div data-testid="toast-container">{children}</div>
  ),
  ToastStack: ({ children }) => <div data-testid="toast-stack">{children}</div>
}))

describe('Toasts Component', () => {
  const mockIcon = jest.fn(() => <div data-testid="mock-icon">Icon</div>)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with toasts', () => {
    const toasts = [
      { message: 'Success message', icon: mockIcon },
      { message: 'Error message', icon: null }
    ]

    const { getByTestId, getAllByTestId, getByText, container } = render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(getByTestId('toast-stack')).toBeInTheDocument()
    expect(getAllByTestId('toast-container')).toHaveLength(2)
    expect(getByText('Success message')).toBeInTheDocument()
    expect(getByText('Error message')).toBeInTheDocument()
    expect(getByTestId('mock-icon')).toBeInTheDocument()
    // htm/react passes a second undefined argument
    expect(mockIcon).toHaveBeenCalledWith(
      { color: colors.black.mode1 },
      undefined
    )
    expect(container).toMatchSnapshot()
  })

  test('renders correctly with empty toasts array', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Toasts toasts={[]} />
      </ThemeProvider>
    )

    expect(getByTestId('toast-stack')).toBeInTheDocument()
  })

  test('renders correctly with undefined toasts', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Toasts toasts={undefined} />
      </ThemeProvider>
    )

    expect(getByTestId('toast-stack')).toBeInTheDocument()
  })

  test('passes correct color to icon', () => {
    const toasts = [{ message: 'Test message', icon: mockIcon }]

    render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(mockIcon).toHaveBeenCalledWith(
      { color: colors.black.mode1 },
      undefined
    )
  })
})
