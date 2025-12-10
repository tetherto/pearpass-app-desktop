import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { FormGroup } from './index'

import '@testing-library/jest-dom'

jest.mock('../../lib-react-components', () => ({
  ArrowDownIcon: () => <div data-testid="arrow-down-icon">ArrowDown</div>,
  ArrowUpIcon: () => <div data-testid="arrow-up-icon">ArrowUp</div>
}))

describe('FormGroup', () => {
  const mockTitle = 'Test Title'
  const mockChildren = <div data-testid="test-children">Test Children</div>

  test('renders with children and title when isCollapse is true', () => {
    const { container } = render(
      <ThemeProvider>
        <FormGroup title={mockTitle} isCollapse={true}>
          {mockChildren}
        </FormGroup>
      </ThemeProvider>
    )

    expect(screen.getByText(mockTitle)).toBeInTheDocument()
    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('renders without title section when isCollapse is false', () => {
    render(
      <FormGroup title={mockTitle} isCollapse={false}>
        {mockChildren}
      </FormGroup>
    )

    expect(screen.queryByText(mockTitle)).not.toBeInTheDocument()
    expect(screen.getByTestId('test-children')).toBeInTheDocument()
  })

  test('toggles collapse state when title is clicked', () => {
    render(
      <ThemeProvider>
        <FormGroup title={mockTitle} isCollapse={true}>
          {mockChildren}
        </FormGroup>
      </ThemeProvider>
    )

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()

    fireEvent.click(screen.getByText(mockTitle))

    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
    expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument()
    expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument()

    fireEvent.click(screen.getByText(mockTitle))

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument()
  })

  test('does not render when children is not provided', () => {
    const { container } = render(
      <ThemeProvider>
        <FormGroup title={mockTitle} isCollapse={true} />
      </ThemeProvider>
    )
    expect(container.firstChild).toBeNull()
  })

  test('renders without title when title is empty string', () => {
    render(
      <ThemeProvider>
        <FormGroup title="" isCollapse={true}>
          {mockChildren}
        </FormGroup>
      </ThemeProvider>
    )

    expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-children')).toBeInTheDocument()
  })

  test('renders without title when title is undefined', () => {
    render(<FormGroup isCollapse={true}>{mockChildren}</FormGroup>)

    expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-children')).toBeInTheDocument()
  })
})
