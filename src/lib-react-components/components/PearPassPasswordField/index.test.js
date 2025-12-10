import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { PearPassPasswordField } from './index'
import '@testing-library/jest-dom'

describe('PearPassPasswordField Component', () => {
  test('renders input with type "password" initially and displays LockCircleIcon', () => {
    const { getByDisplayValue, container } = render(
      <ThemeProvider>
        <PearPassPasswordField
          value="secret"
          onChange={jest.fn()}
          isDisabled={false}
          error=""
        />
      </ThemeProvider>
    )
    const input = getByDisplayValue('secret')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')

    const iconSvg = container.querySelector('svg')
    expect(iconSvg).toBeInTheDocument()
    expect(iconSvg.getAttribute('width')).toBe('24')
  })

  test('calls onChange when input value changes if not disabled', () => {
    const handleChange = jest.fn()
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <PearPassPasswordField
          value=""
          onChange={handleChange}
          isDisabled={false}
          error=""
        />
      </ThemeProvider>
    )
    const input = getByDisplayValue('')
    fireEvent.change(input, { target: { value: 'newsecret' } })
    expect(handleChange).toHaveBeenCalledWith('newsecret')
  })

  test('does not call onChange when disabled', () => {
    const handleChange = jest.fn()
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <PearPassPasswordField
          value=""
          onChange={handleChange}
          isDisabled={true}
          error=""
        />
      </ThemeProvider>
    )
    const input = getByDisplayValue('')
    fireEvent.change(input, { target: { value: 'newsecret' } })
    expect(handleChange).not.toHaveBeenCalled()
  })

  test('toggles password visibility when toggle button is clicked', () => {
    const { getByDisplayValue, container } = render(
      <ThemeProvider>
        <PearPassPasswordField
          value="secret"
          onChange={jest.fn()}
          isDisabled={false}
          error=""
        />
      </ThemeProvider>
    )
    const input = getByDisplayValue('secret')
    expect(input).toHaveAttribute('type', 'password')

    const toggleButton = container.querySelector('button')
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  test('renders error message when error prop is provided', () => {
    const errorMessage = 'Error occurred'
    const { getByText } = render(
      <ThemeProvider>
        <PearPassPasswordField
          value="secret"
          onChange={jest.fn()}
          isDisabled={false}
          error={errorMessage}
        />
      </ThemeProvider>
    )
    expect(getByText(errorMessage)).toBeInTheDocument()
  })

  test('matches snapshot', () => {
    const { container } = render(
      <ThemeProvider>
        <PearPassPasswordField
          value="snapshot"
          onChange={jest.fn()}
          isDisabled={false}
          error=""
        />
      </ThemeProvider>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
