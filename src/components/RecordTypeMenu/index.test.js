import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { RecordTypeMenu } from './index'
import '@testing-library/jest-dom'

jest.mock('../../hooks/useRecordMenuItems', () => ({
  useRecordMenuItems: () => ({
    defaultItems: [
      {
        name: 'Login',
        type: 'login',
        icon: () => <svg data-testid="login-icon" />
      },
      {
        name: 'Card',
        type: 'card',
        icon: () => <svg data-testid="card-icon" />
      },
      {
        name: 'Note',
        type: 'note',
        icon: () => <svg data-testid="note-icon" />
      }
    ]
  })
}))

jest.mock('../MenuDropdown', () => ({
  MenuDropdown: ({ selectedItem, onItemSelect, items }) => (
    <div data-testid="menu-dropdown">
      <div data-testid="selected-item">{selectedItem?.name}</div>
      <ul>
        {items.map((item) => (
          <li
            key={item.type}
            data-testid={`menu-item-${item.type}`}
            onClick={() => onItemSelect(item)}
          >
            {item.name}
            {item.icon && item.icon()}
          </li>
        ))}
      </ul>
    </div>
  )
}))

describe('RecordTypeMenu Component', () => {
  const mockOnRecordSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with no selected record', () => {
    const { getByTestId, container } = render(
      <ThemeProvider>
        <RecordTypeMenu onRecordSelect={mockOnRecordSelect} />
      </ThemeProvider>
    )

    expect(getByTestId('menu-dropdown')).toBeInTheDocument()
    expect(getByTestId('selected-item')).toBeEmptyDOMElement()
    expect(container).toMatchSnapshot()
  })

  test('passes the correct selected item when selectedRecord is provided', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <RecordTypeMenu
          selectedRecord="card"
          onRecordSelect={mockOnRecordSelect}
        />
      </ThemeProvider>
    )

    expect(getByTestId('selected-item')).toHaveTextContent('Card')
  })

  test('calls onRecordSelect when a menu item is clicked', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <RecordTypeMenu onRecordSelect={mockOnRecordSelect} />
      </ThemeProvider>
    )

    fireEvent.click(getByTestId('menu-item-login'))
    expect(mockOnRecordSelect).toHaveBeenCalledTimes(1)
    expect(mockOnRecordSelect).toHaveBeenCalledWith({
      name: 'Login',
      type: 'login',
      icon: expect.any(Function)
    })
  })

  test('renders all menu items from useRecordMenuItems hook', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <RecordTypeMenu onRecordSelect={mockOnRecordSelect} />
      </ThemeProvider>
    )

    expect(getByTestId('menu-item-login')).toBeInTheDocument()
    expect(getByTestId('menu-item-card')).toBeInTheDocument()
    expect(getByTestId('menu-item-note')).toBeInTheDocument()
  })

  test('handles case when selectedRecord does not match any item', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <RecordTypeMenu
          selectedRecord="non-existent"
          onRecordSelect={mockOnRecordSelect}
        />
      </ThemeProvider>
    )

    expect(getByTestId('selected-item')).toBeEmptyDOMElement()
  })
})
