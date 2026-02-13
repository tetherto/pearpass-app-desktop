import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { PearPassPasswordFieldV2 } from './index'
import '@testing-library/jest-dom'

describe('PearPassPasswordFieldV2 Component', () => {
  const renderWithTheme = (ui: React.ReactElement) =>
    render(
      React.createElement(
        ThemeProvider as React.ComponentType<{ children: React.ReactNode }>,
        null,
        ui
      )
    )

  test('renders input with type "password" initially', () => {
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordFieldV2, {
        value: 'secret',
        placeholder: 'Insert master password',
        onChange: jest.fn(),
        isDisabled: false,
        error: ''
      })
    )

    const input = getByTestId('pearpass-password-field-v2') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
    expect(input.value).toBe('secret')
  })

  test('calls onChange when input value changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordFieldV2, {
        value: '',
        placeholder: 'Insert master password',
        onChange: handleChange,
        isDisabled: false,
        error: ''
      })
    )

    const input = getByTestId('pearpass-password-field-v2')
    fireEvent.change(input, { target: { value: 'newsecret' } })
    expect(handleChange).toHaveBeenCalledWith('newsecret')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordFieldV2, {
        value: '',
        placeholder: 'Insert master password',
        onChange: handleChange,
        isDisabled: true,
        error: ''
      })
    )

    const input = getByTestId('pearpass-password-field-v2')
    fireEvent.change(input, { target: { value: 'newsecret' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('toggles password visibility when toggle control is clicked', () => {
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordFieldV2, {
        value: 'secret',
        placeholder: 'Insert master password',
        onChange: jest.fn(),
        isDisabled: false,
        error: ''
      })
    )

    const input = getByTestId('pearpass-password-field-v2')
    const toggle = getByTestId('pearpass-password-field-v2-toggle')

    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
  })

  test('renders error message when error prop is provided', () => {
    const errorMessage = 'Error occurred'
    const { getByText } = renderWithTheme(
      React.createElement(PearPassPasswordFieldV2, {
        value: 'secret',
        placeholder: 'Insert master password',
        onChange: jest.fn(),
        isDisabled: false,
        error: errorMessage
      })
    )
    expect(getByText(errorMessage)).toBeInTheDocument()
  })

})
