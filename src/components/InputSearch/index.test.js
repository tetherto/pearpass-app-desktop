import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { InputSearch } from './index'
import '@testing-library/jest-dom'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (str) => str
    }
  }),
  I18nProvider: ({ children }) => children
}))

jest.mock('../../lib-react-components', () => ({
  LockCircleIcon: () => <div data-testid="lock-circle-icon">LockCircleIcon</div>
}))

describe('InputSearch', () => {
  test('renders with default props', () => {
    const { container } = render(
      <ThemeProvider>
        <InputSearch value="" onChange={jest.fn()} />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders with custom value', () => {
    const { container } = render(
      <ThemeProvider>
        <InputSearch value="Test search" onChange={jest.fn()} />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByDisplayValue('Test search')).toBeInTheDocument()
  })

  test('displays quantity when value is not empty', () => {
    render(
      <ThemeProvider>
        <InputSearch value="Test" onChange={jest.fn()} quantity={5} />
      </ThemeProvider>
    )

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('does not display quantity when value is empty', () => {
    const { container } = render(
      <ThemeProvider>
        <InputSearch value="" onChange={jest.fn()} quantity={5} />
      </ThemeProvider>
    )

    expect(container.textContent).not.toContain('5')
  })

  test('calls onChange when input changes', () => {
    const handleChange = jest.fn()
    render(
      <ThemeProvider>
        <InputSearch value="" onChange={handleChange} />
      </ThemeProvider>
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'New search' } })

    expect(handleChange).toHaveBeenCalled()
  })

  test('renders lock circle icon', () => {
    render(
      <ThemeProvider>
        <InputSearch value="" onChange={jest.fn()} />
      </ThemeProvider>
    )

    expect(screen.getByTestId('lock-circle-icon')).toBeInTheDocument()
  })

  test('has correct placeholder text', () => {
    render(
      <ThemeProvider>
        <InputSearch value="" onChange={jest.fn()} />
      </ThemeProvider>
    )

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })
})
