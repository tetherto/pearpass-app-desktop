import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { RecordSortActionsPopupContent } from './index'
import '@testing-library/jest-dom'

jest.mock('../../lib-react-components', () => ({
  CheckIcon: () => <svg data-testid="check-icon" />
}))

describe('RecordSortActionsPopupContent Component', () => {
  const mockMenuItems = [
    {
      name: 'Recent',
      type: 'recent',
      icon: () => <svg data-testid="recent-icon" />
    },
    {
      name: 'Newest First',
      type: 'newToOld',
      icon: () => <svg data-testid="new-to-old-icon" />
    },
    {
      name: 'Oldest First',
      type: 'oldToNew',
      icon: () => <svg data-testid="old-to-new-icon" />
    }
  ]

  const mockOnClick = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with all menu items', () => {
    const { getByText, queryAllByTestId, container } = render(
      <ThemeProvider>
        <RecordSortActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    expect(getByText('Recent')).toBeInTheDocument()
    expect(getByText('Newest First')).toBeInTheDocument()
    expect(getByText('Oldest First')).toBeInTheDocument()
    expect(queryAllByTestId(/.*-icon/).length).toBe(3)
    expect(container).toMatchSnapshot()
  })

  test('shows check icon for selected item', () => {
    const { queryAllByTestId } = render(
      <ThemeProvider>
        <RecordSortActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
          selectedType="newToOld"
        />
      </ThemeProvider>
    )

    expect(queryAllByTestId('check-icon').length).toBe(1)
  })

  test('calls onClick and onClose when menu item is clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <RecordSortActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Recent'))
    expect(mockOnClick).toHaveBeenCalledWith('recent')
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('renders correctly with no selected item', () => {
    const { queryAllByTestId } = render(
      <ThemeProvider>
        <RecordSortActionsPopupContent
          menuItems={mockMenuItems}
          onClick={mockOnClick}
          onClose={mockOnClose}
          selectedType={null}
        />
      </ThemeProvider>
    )

    expect(queryAllByTestId('check-icon').length).toBe(0)
  })

  test('renders correctly with empty menu items', () => {
    const { container } = render(
      <ThemeProvider>
        <RecordSortActionsPopupContent
          menuItems={[]}
          onClick={mockOnClick}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
