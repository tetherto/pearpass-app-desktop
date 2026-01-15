import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SidebarFolder } from './index'

import '@testing-library/jest-dom'

const MockIcon = () => <div data-testid="mock-icon">Icon</div>

jest.mock('../PopupMenu', () => ({
  PopupMenu: ({ title, children }) => (
    <div data-testid="card-single-setting" data-title={title}>
      {children}
    </div>
  )
}))

jest.mock('../EditFolderPopupContent', () => ({
  EditFolderPopupContent: ({ title, children }) => (
    <div data-testid="edit-folder-popup-content" data-title={title}>
      {children}
    </div>
  )
}))

jest.mock('../../lib-react-components', () => ({
  FolderIcon: () => <div data-testid="mock-folder-icon"></div>,
  KebabMenuIcon: () => <div data-testid="mock-kebab-icon"></div>,
  PlusIcon: () => <div data-testid="mock-plus-icon"></div>
}))

describe('SidebarFolder Component', () => {
  const defaultProps = {
    isOpen: false,
    onClick: jest.fn(),
    onDropDown: jest.fn(),
    onAddClick: jest.fn(),
    isRoot: false,
    name: 'Test Folder',
    icon: MockIcon,
    isActive: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <SidebarFolder {...defaultProps} />
      </ThemeProvider>
    )
    expect(getByText('Test Folder')).toBeInTheDocument()
    expect(getByTestId('mock-icon')).toBeInTheDocument()
  })

  test('calls onClick handler when clicked', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SidebarFolder {...defaultProps} />
      </ThemeProvider>
    )
    const wrapper = getByTestId('sidebar-folder')
    fireEvent.click(wrapper)

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })

  test('renders with custom icon when provided', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SidebarFolder {...defaultProps} />
      </ThemeProvider>
    )
    expect(getByTestId('mock-icon')).toBeInTheDocument()
  })
})
