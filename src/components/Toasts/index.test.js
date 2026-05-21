import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from '@tetherto/pearpass-lib-ui-theme-provider'

import { Toasts } from './index'
import '@testing-library/jest-dom'

jest.mock('./styles', () => ({
  ToastContainer: ({ children }) => (
    <div data-testid="toast-container">{children}</div>
  ),
  ToastStack: ({ children }) => <div data-testid="toast-stack">{children}</div>
}))

const mockSnackbar = jest.fn(({ text, icon }) => (
  <div data-testid="snackbar">
    {icon ? <div data-testid="snackbar-icon">{icon}</div> : null}
    <span>{text}</span>
  </div>
))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  Snackbar: (props) => mockSnackbar(props)
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
    expect(getAllByTestId('snackbar')).toHaveLength(2)
    expect(getByText('Success message')).toBeInTheDocument()
    expect(getByText('Error message')).toBeInTheDocument()
    expect(getByTestId('mock-icon')).toBeInTheDocument()
    expect(mockSnackbar).toHaveBeenCalledTimes(2)
    expect(mockSnackbar).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        text: 'Success message',
        icon: expect.anything()
      })
    )
    expect(mockSnackbar).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        text: 'Error message',
        icon: undefined
      })
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
    expect(mockSnackbar).not.toHaveBeenCalled()
  })

  test('renders correctly with undefined toasts', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Toasts toasts={undefined} />
      </ThemeProvider>
    )

    expect(getByTestId('toast-stack')).toBeInTheDocument()
    expect(mockSnackbar).not.toHaveBeenCalled()
  })

  test('passes icon through to Snackbar', () => {
    const toasts = [{ message: 'Test message', icon: mockIcon }]

    render(
      <ThemeProvider>
        <Toasts toasts={toasts} />
      </ThemeProvider>
    )

    expect(mockSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Test message',
        icon: expect.anything()
      })
    )
  })
})
