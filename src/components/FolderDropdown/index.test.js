import React from 'react'

import { useLingui } from '@lingui/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useFolders } from 'pearpass-lib-vault'

import { FolderDropdown } from './index'
import '@testing-library/jest-dom'

const mockSetModal = jest.fn()

jest.mock('pearpass-lib-vault', () => ({
  useFolders: jest.fn()
}))

jest.mock('@lingui/react', () => ({
  useLingui: jest.fn()
}))

jest.mock('../../context/ModalContext', () => ({
  useModal: jest.fn(() => ({
    setModal: mockSetModal,
    closeModal: jest.fn()
  }))
}))

jest.mock('../MenuDropdown', () => ({
  MenuDropdown: ({ selectedItem, onItemSelect, items, bottomComponent }) => (
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
      <div data-testid="bottom-component">{bottomComponent}</div>
    </div>
  )
}))

jest.mock('../MenuDropdown/styles', () => ({
  DropDownItem: ({ children, ...rest }) => (
    <div data-testid="mock-dropdown-item" {...rest}>
      {children}
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
    mockSetModal.mockClear()
  })

  test('renders with correct custom folders', () => {
    render(
      <FolderDropdown
        selectedFolder="Personal"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    expect(screen.getByTestId('selected-item')).toHaveTextContent('Personal')
    expect(screen.getByTestId('item-Personal')).toBeInTheDocument()
    expect(screen.getByTestId('item-Work')).toBeInTheDocument()
    expect(screen.getByTestId('item-Finance')).toBeInTheDocument()
    // Bottom "Create new" component is rendered
    expect(screen.getByTestId('bottom-component')).toBeInTheDocument()
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

  test('clears selectedFolder when it no longer exists', () => {
    useFolders.mockReturnValue({
      data: {
        customFolders: {
          folder1: { name: 'Other' }
        }
      }
    })

    render(
      <FolderDropdown
        selectedFolder="NonExisting"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    expect(mockOnFolderSelect).toHaveBeenCalledWith(undefined)
  })

  test('opens create-folder modal and selects newly created folder', () => {
    render(
      <FolderDropdown
        selectedFolder="Personal"
        onFolderSelect={mockOnFolderSelect}
      />
    )

    const createButton = screen.getByTestId('menudropdown-create-new')
    fireEvent.click(createButton)

    expect(mockSetModal).toHaveBeenCalledTimes(1)

    const modalElement = mockSetModal.mock.calls[0][0]
    expect(typeof modalElement.props.onCreate).toBe('function')

    mockOnFolderSelect.mockClear()

    // Simulate onCreate being called with an object that contains folder field
    modalElement.props.onCreate({ folder: 'NewFolder' })
    expect(mockOnFolderSelect).toHaveBeenCalledTimes(1)
    expect(mockOnFolderSelect).toHaveBeenCalledWith({ name: 'NewFolder' })
  })
})
