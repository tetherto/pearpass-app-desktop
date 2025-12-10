import React from 'react'

jest.mock('pearpass-utils-password-check', () => ({
  checkPasswordStrength: jest.fn(),
  checkPassphraseStrength: jest.fn()
}))

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import '@testing-library/jest-dom'
import { PearPassInputField } from '.'

describe('PearPassInputField Component', () => {
  test('renders placeholder and error message', () => {
    const { getByPlaceholderText, getByText } = render(
      <ThemeProvider>
        <PearPassInputField
          value="test value"
          placeholder="Enter text"
          error="Error occurred"
        />
      </ThemeProvider>
    )
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    expect(getByText('Error occurred')).toBeInTheDocument()
  })

  test('calls onChange when input changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <PearPassInputField
          value=""
          placeholder="Enter text"
          onChange={handleChange}
        />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(handleChange).toHaveBeenCalledWith('new value')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <PearPassInputField
          value=""
          placeholder="Enter text"
          onChange={handleChange}
          isDisabled={true}
        />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'should not change' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('displays an error message when error prop is provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <PearPassInputField
          value="test"
          placeholder="Enter text"
          error="This field is required"
        />
      </ThemeProvider>
    )
    expect(getByText('This field is required')).toBeInTheDocument()
  })

  test('does not display error message when error prop is empty', () => {
    const { queryByText } = render(
      <ThemeProvider>
        <PearPassInputField value="test" placeholder="Enter text" error="" />
      </ThemeProvider>
    )
    expect(queryByText('This field is required')).not.toBeInTheDocument()
  })

  test('renders input as disabled when isDisabled is true', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <PearPassInputField
          value="test"
          placeholder="Enter text"
          isDisabled={true}
        />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Enter text')
    expect(input).toBeDisabled()
  })

  test('matches snapshot for default variant', () => {
    const { container } = render(
      <ThemeProvider>
        <PearPassInputField
          value="snapshot test"
          placeholder="Enter text"
          label="Label"
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot for outline variant', () => {
    const { container } = render(
      <ThemeProvider>
        <PearPassInputField
          value="outline snapshot"
          placeholder="Enter text"
          label="Outline Label"
          variant="outline"
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
