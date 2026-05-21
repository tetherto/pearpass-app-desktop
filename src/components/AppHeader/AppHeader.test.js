import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

import { AppHeader, AppHeaderAddItemTrigger } from './AppHeader'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s) => s } })
}))

jest.mock('./AppHeader.styles', () => ({
  createStyles: () => ({
    root: {},
    searchWrap: {},
    search: {},
    actions: {}
  })
}))

const mockTheme = { colors: {} }

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({ theme: mockTheme }),
  SearchField: ({ value, onChangeText, placeholderText, testID }) => (
    <input
      data-testid={testID}
      aria-label="search"
      value={value}
      placeholder={placeholderText}
      onChange={(e) => onChangeText(e.target.value)}
    />
  ),
  Button: ({ children, onClick, 'data-testid': dataTestId }) => (
    <button type="button" data-testid={dataTestId} onClick={onClick}>
      {children}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: () => null,
  ImportOutlined: () => null
}))

describe('AppHeader', () => {
  const defaultProps = {
    searchValue: '',
    onSearchChange: jest.fn(),
    onImportClick: jest.fn(),
    addItemControl: <span data-testid="add-control">add</span>
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search, import, and addItemControl', () => {
    render(<AppHeader {...defaultProps} />)

    expect(screen.getByTestId('main-search-input')).toBeInTheDocument()
    expect(screen.getByTestId('main-import-button')).toBeInTheDocument()
    expect(screen.getByTestId('add-control')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Search in All Items')
    ).toBeInTheDocument()
    expect(screen.getByText('Import')).toBeInTheDocument()
  })

  it('uses custom test ids when provided', () => {
    render(
      <AppHeader
        {...defaultProps}
        searchTestId="custom-search"
        importTestId="custom-import"
      />
    )

    expect(screen.getByTestId('custom-search')).toBeInTheDocument()
    expect(screen.getByTestId('custom-import')).toBeInTheDocument()
  })

  it('calls onSearchChange when search value changes', () => {
    render(<AppHeader {...defaultProps} searchValue="x" />)

    fireEvent.change(screen.getByTestId('main-search-input'), {
      target: { value: 'next' }
    })

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('next')
  })

  it('calls onImportClick when import is pressed', () => {
    render(<AppHeader {...defaultProps} />)

    fireEvent.click(screen.getByTestId('main-import-button'))

    expect(defaultProps.onImportClick).toHaveBeenCalledTimes(1)
  })
})

describe('AppHeaderAddItemTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Add Item with default test id', () => {
    render(<AppHeaderAddItemTrigger />)

    expect(screen.getByTestId('main-plus-button')).toBeInTheDocument()
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })

  it('uses custom test id when provided', () => {
    render(<AppHeaderAddItemTrigger testId="plus-custom" />)

    expect(screen.getByTestId('plus-custom')).toBeInTheDocument()
  })
})
