import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SidebarCategory } from './index'
import '@testing-library/jest-dom'

const MockIcon = () => <div data-testid="mock-icon">Icon</div>

describe('SidebarCategory Component', () => {
  const defaultProps = {
    categoryName: 'Test Category',
    quantity: 5,
    color: '#ff0000',
    icon: MockIcon,
    onClick: jest.fn(),
    isSelected: false,
    size: 'default'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with default props', () => {
    const { container, getByText, getByTestId } = render(
      <ThemeProvider>
        <SidebarCategory {...defaultProps} />
      </ThemeProvider>
    )
    expect(
      getByText((content) => content.includes('Test Category'))
    ).toBeInTheDocument()
    expect(getByText('5')).toBeInTheDocument()
    expect(getByTestId('mock-icon')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('calls onClick handler when clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SidebarCategory {...defaultProps} />{' '}
      </ThemeProvider>
    )
    fireEvent.click(getByText('Test Category'))
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  test('renders with zero quantity', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SidebarCategory {...defaultProps} quantity={0} />{' '}
      </ThemeProvider>
    )
    expect(getByText('0')).toBeInTheDocument()
  })
})
