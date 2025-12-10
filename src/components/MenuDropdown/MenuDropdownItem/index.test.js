import React from 'react'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { MenuDropdownItem } from './index'
import '@testing-library/jest-dom'

describe('MenuDropdownItem', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  test('renders correctly with name', () => {
    const { container } = render(
      <ThemeProvider>
        <MenuDropdownItem item={{ name: 'Test Item' }} onClick={mockOnClick} />
      </ThemeProvider>
    )

    expect(screen.getByText('Test Item')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls onClick when clicked', async () => {
    render(
      <ThemeProvider>
        <MenuDropdownItem item={{ name: 'Test Item' }} onClick={mockOnClick} />
      </ThemeProvider>
    )

    const item = screen.getByText('Test Item')

    item.click()

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('renders with custom icon when provided', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>

    render(
      <ThemeProvider>
        <MenuDropdownItem
          item={{ name: 'Test Item', icon: CustomIcon }}
          onClick={mockOnClick}
        />
      </ThemeProvider>
    )

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  test('renders with default FolderIcon when no icon is provided', () => {
    render(
      <ThemeProvider>
        <MenuDropdownItem item={{ name: 'Test Item' }} onClick={mockOnClick} />
      </ThemeProvider>
    )

    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  test('renders with custom color when provided', () => {
    const { container } = render(
      <ThemeProvider>
        <MenuDropdownItem
          item={{ name: 'Test Item', color: 'red' }}
          onClick={mockOnClick}
        />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('does not throw when onClick is not provided', () => {
    expect(() => {
      render(
        <ThemeProvider>
          <MenuDropdownItem item={{ name: 'Test Item' }} />
        </ThemeProvider>
      )
    }).not.toThrow()
  })
})
