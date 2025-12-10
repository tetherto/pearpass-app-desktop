import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { RecordActionsPopupContent } from './index'
import '@testing-library/jest-dom'

jest.mock('../../constants/recordActions', () => ({
  RECORD_ACTION_ICON_BY_TYPE: {
    edit: () => <svg data-testid="edit-icon" />,
    delete: () => <svg data-testid="delete-icon" />
  }
}))

describe('RecordActionsPopupContent Component', () => {
  const mockMenuItems = [
    { name: 'Edit', type: 'edit', click: jest.fn() },
    { name: 'Delete', type: 'delete', click: jest.fn() }
  ]

  test('renders correctly with default variant', () => {
    const { asFragment, getByText } = render(
      <ThemeProvider>
        <RecordActionsPopupContent menuItems={mockMenuItems} />
      </ThemeProvider>
    )

    expect(getByText('Edit')).toBeInTheDocument()
    expect(getByText('Delete')).toBeInTheDocument()
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders correctly with compact variant', () => {
    const { asFragment } = render(
      <ThemeProvider>
        <RecordActionsPopupContent
          menuItems={mockMenuItems}
          variant="compact"
        />
      </ThemeProvider>
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test('calls item.click when menu item is clicked', () => {
    const { getByText } = render(
      <ThemeProvider>
        <RecordActionsPopupContent menuItems={mockMenuItems} />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Edit'))
    expect(mockMenuItems[0].click).toHaveBeenCalledTimes(1)

    fireEvent.click(getByText('Delete'))
    expect(mockMenuItems[1].click).toHaveBeenCalledTimes(1)
  })

  test('calls onClick prop when menu item without click handler is clicked', () => {
    const onClickMock = jest.fn()
    const itemsWithoutClick = [
      { name: 'Edit', type: 'edit' },
      { name: 'Delete', type: 'delete' }
    ]

    const { getByText } = render(
      <ThemeProvider>
        <RecordActionsPopupContent
          menuItems={itemsWithoutClick}
          onClick={onClickMock}
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('Edit'))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })
})
