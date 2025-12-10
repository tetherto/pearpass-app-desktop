import React from 'react'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { MenuDropdownLabel } from './index'
import '@testing-library/jest-dom'

jest.mock('../../../lib-react-components', () => ({
  ArrowDownIcon: () => <div data-testid="arrow-down-icon" />,
  ArrowUpIcon: () => <div data-testid="arrow-up-icon" />
}))

jest.mock('../MenuDropdownItem', () => ({
  MenuDropdownItem: ({ item }) => (
    <div data-testid="menu-dropdown-item">{item.name}</div>
  )
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: { _: (str) => str }
  })
}))

describe('MenuDropdownLabel', () => {
  const mockSetIsOpen = jest.fn()

  beforeEach(() => {
    mockSetIsOpen.mockClear()
  })

  const renderComponent = (props) =>
    render(
      <ThemeProvider>
        <MenuDropdownLabel
          isHidden={false}
          isOpen={false}
          setIsOpen={mockSetIsOpen}
          {...props}
        />
      </ThemeProvider>
    )

  test('renders ArrowDownIcon when closed', () => {
    const { container } = renderComponent({ isOpen: false })
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders ArrowUpIcon when open', () => {
    renderComponent({ isOpen: true })
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('arrow-down-icon')).not.toBeInTheDocument()
  })

  test('renders "No folder" when no selectedItem is provided', () => {
    renderComponent()
    expect(screen.getByText('No folder')).toBeInTheDocument()
  })

  test('renders MenuDropdownItem when selectedItem is provided', () => {
    const selectedItem = { name: 'Test Folder' }
    renderComponent({ selectedItem })
    expect(screen.getByTestId('menu-dropdown-item')).toBeInTheDocument()
    expect(screen.getByText('Test Folder')).toBeInTheDocument()
  })

  test('calls setIsOpen when clicked', () => {
    renderComponent({ isOpen: false })
    screen.getByText('No folder').click()
    expect(mockSetIsOpen).toHaveBeenCalledWith(true)
  })

  test('toggles isOpen value when clicked', () => {
    renderComponent({ isOpen: true })
    screen.getByText('No folder').click()
    expect(mockSetIsOpen).toHaveBeenCalledWith(false)
  })

  test('does not call setIsOpen when it is not provided', () => {
    renderComponent({ setIsOpen: undefined })
    expect(() => {
      screen.getByText('No folder').click()
    }).not.toThrow()
  })
})
