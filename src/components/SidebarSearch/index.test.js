import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SidebarSearch } from './index'
import '@testing-library/jest-dom'

jest.mock('../../lib-react-components', () => ({
  SearchIcon: () => <div data-testid="search-icon">SearchIcon</div>
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: { _: (str) => str }
  })
}))

describe('SidebarSearch Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with default props', () => {
    const { container, getByTestId } = render(
      <ThemeProvider>
        <SidebarSearch {...defaultProps} />
      </ThemeProvider>
    )
    expect(getByTestId('search-icon')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls onChange handler when input changes', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <SidebarSearch {...defaultProps} />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'test search' } })
    expect(defaultProps.onChange).toHaveBeenCalledWith('test search')
  })

  test('displays the current value in the input', () => {
    const props = {
      ...defaultProps,
      value: 'current search'
    }
    const { getByDisplayValue } = render(
      <ThemeProvider>
        <SidebarSearch {...props} />
      </ThemeProvider>
    )
    expect(getByDisplayValue('current search')).toBeInTheDocument()
  })

  test('has the correct placeholder text', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <SidebarSearch {...defaultProps} />
      </ThemeProvider>
    )
    expect(getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  test('input has search type attribute', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <SidebarSearch {...defaultProps} />
      </ThemeProvider>
    )
    const input = getByPlaceholderText('Search...')
    expect(input).toHaveAttribute('type', 'search')
  })
})
