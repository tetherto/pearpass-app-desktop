import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@tetherto/pearpass-lib-ui-kit'

import { PearPassPasswordField } from './index'
import '@testing-library/jest-dom'

describe('PearPassPasswordField Component', () => {
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
      React.createElement(PearPassPasswordField, {
        value: 'secret',
        placeholder: 'Insert master password',
        onChange: jest.fn(),
        isDisabled: false,
        error: ''
      })
    )

    const input = getByTestId('@tetherto/pearpass-password-field') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
    expect(input.value).toBe('secret')
  })

  test('calls onChange when input value changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordField, {
        value: '',
        placeholder: 'Insert master password',
        onChange: handleChange,
        isDisabled: false,
        error: ''
      })
    )

    const input = getByTestId('@tetherto/pearpass-password-field')
    fireEvent.change(input, { target: { value: 'newsecret' } })
    expect(handleChange).toHaveBeenCalledWith('newsecret')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordField, {
        value: '',
        placeholder: 'Insert master password',
        onChange: handleChange,
        isDisabled: true,
        error: ''
      })
    )

    const input = getByTestId('@tetherto/pearpass-password-field')
    fireEvent.change(input, { target: { value: 'newsecret' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('toggles password visibility when toggle control is clicked', () => {
    const { getByTestId } = renderWithTheme(
      React.createElement(PearPassPasswordField, {
        value: 'secret',
        placeholder: 'Insert master password',
        onChange: jest.fn(),
        isDisabled: false,
        error: ''
      })
    )

    const input = getByTestId('@tetherto/pearpass-password-field')
    const toggle = getByTestId('@tetherto/pearpass-password-field-toggle')

    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'password')
  })

  test('renders error message when error prop is provided', () => {
    const errorMessage = 'Error occurred'
    const { getByText } = renderWithTheme(
      React.createElement(PearPassPasswordField, {
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
