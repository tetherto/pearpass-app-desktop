import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { InputFieldNote } from './index'
import '@testing-library/jest-dom'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (str) => str
    }
  }),
  I18nProvider: ({ children }) => children
}))

describe('InputFieldNote', () => {
  test('renders with default props', () => {
    const { container } = render(
      <ThemeProvider>
        <InputFieldNote />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders with custom value', () => {
    const { container } = render(
      <ThemeProvider>
        <InputFieldNote value="Test comment" />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByDisplayValue('Test comment')).toBeInTheDocument()
  })

  test('renders with custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom Icon</div>
    render(
      <ThemeProvider>
        <InputFieldNote icon={CustomIcon} />
      </ThemeProvider>
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  test('renders with error message', () => {
    render(
      <ThemeProvider>
        <InputFieldNote error="Error message" />
      </ThemeProvider>
    )

    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  test('calls onChange when input changes', () => {
    const handleChange = jest.fn()
    render(
      <ThemeProvider>
        <InputFieldNote onChange={handleChange} />
      </ThemeProvider>
    )

    const input = screen.getByPlaceholderText('Add comment')
    fireEvent.change(input, { target: { value: 'New comment' } })

    expect(handleChange).toHaveBeenCalled()
  })

  test('renders with disabled state', () => {
    render(
      <ThemeProvider>
        <InputFieldNote isDisabled={true} />
      </ThemeProvider>
    )

    expect(screen.getByPlaceholderText('Add comment')).toHaveAttribute('readonly')
  })

  test('renders with custom variant', () => {
    const { container } = render(
      <ThemeProvider>
        <InputFieldNote variant="default" />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })
})
