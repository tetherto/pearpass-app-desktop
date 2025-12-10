import React from 'react'

import { useLingui } from '@lingui/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useFolders } from 'pearpass-lib-vault'

import { FolderDropdown } from './index'
import '@testing-library/jest-dom'

jest.mock('pearpass-lib-vault', () => ({
  useFolders: jest.fn()
}))

jest.mock('@lingui/react', () => ({
  useLingui: jest.fn()
}))

jest.mock('../MenuDropdown', () => ({
  MenuDropdown: ({ selectedItem, onItemSelect, items }) => (
    <div data-testid="menu-dropdown">
      <div data-testid="selected-item">{selectedItem.name}</div>
      <div data-testid="items">
        {items.map((item, index) => (
          <button
            key={index}
            data-testid={`item-${item.name}`}
            onClick={() => onItemSelect(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}))

describe('FolderDropdown', () => {
  const mockOnFolderSelect = jest.fn()
  const mockFolders = {
    customFolders: {
      folder1: { name: 'Personal' },
      folder2: { name: 'Work' },
      folder3: { name: 'Finance' }
    }
  }

  beforeEach(() => {
    useFolders.mockReturnValue({ data: mockFolders })
    useLingui.mockReturnValue({ i18n: { _: (text) => text } })
    mockOnFolderSelect.mockClear()
  })

  test('renders with correct custom folders', () => {
    const { container } = render(
      <FolderDropdown
        selectedFolder="Personal"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Personal')
    expect(screen.getByTestId('item-Personal')).toBeInTheDocument()
    expect(screen.getByTestId('item-Work')).toBeInTheDocument()
    expect(screen.getByTestId('item-Finance')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('handles favorites folder correctly', () => {
    render(
      <FolderDropdown
        selectedFolder="favorites"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Favorite')
  })

  test('calls onFolderSelect when folder is selected', () => {
    render(
      <FolderDropdown
        selectedFolder="Personal"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    fireEvent.click(screen.getByTestId('item-Work'))
    expect(mockOnFolderSelect).toHaveBeenCalledWith({ name: 'Work' })
  })

  test('handles empty folders gracefully', () => {
    useFolders.mockReturnValue({ data: null })

    render(
      <FolderDropdown
        selectedFolder="Personal"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    expect(screen.getByTestId('items')).toBeInTheDocument()
    expect(screen.queryByTestId('item-Personal')).not.toBeInTheDocument()
  })

  test('handles undefined selectedFolder', () => {
    render(<FolderDropdown onFolderSelect={mockOnFolderSelect} />)

    expect(screen.getByTestId('selected-item')).toBeInTheDocument()
    expect(screen.getByTestId('selected-item').textContent).toBe('')
  })
})
