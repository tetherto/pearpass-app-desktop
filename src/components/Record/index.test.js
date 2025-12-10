import React from 'react'

import { render, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { Record } from './index'
import '@testing-library/jest-dom/'

jest.mock('../../hooks/useRecordActionItems', () => ({
  useRecordActionItems: () => ({
    actions: [
      { label: 'Action 1', onClick: jest.fn() },
      { label: 'Action 2', onClick: jest.fn() }
    ]
  })
}))

jest.mock('../RecordActionsPopupContent', () => ({
  RecordActionsPopupContent: () => (
    <div data-testid="record-actions-popup-content">
      RecordActionsPopupContent
    </div>
  )
}))

jest.mock('../../lib-react-components', () => ({
  KebabMenuIcon: () => <svg data-testid="kebab-icon" />
}))

jest.mock('../RecordAvatar', () => ({
  RecordAvatar: () => <div>RecordAvatar</div>
}))

describe('Record Component', () => {
  const dummyRecord = {
    id: '1',
    createdAt: 1630000000000,
    updatedAt: 1630000000000,
    isFavorite: false,
    vaultId: 'vault-1',
    folder: 'Test Folder',
    type: 'note',
    data: {
      title: 'Test Record Title',
      avatarSrc: ''
    }
  }

  test('renders Record component correctly when not selected', () => {
    const { asFragment } = render(
      <ThemeProvider>
        <Record
          record={dummyRecord}
          isSelected={false}
          onClick={() => {}}
          onSelect={() => {}}
        />
      </ThemeProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders Record component correctly when selected', () => {
    const { asFragment } = render(
      <ThemeProvider>
        <Record
          record={dummyRecord}
          isSelected={true}
          onClick={() => {}}
          onSelect={() => {}}
        />
      </ThemeProvider>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('toggles action menu when kebab icon is clicked (snapshot test)', async () => {
    const { container, asFragment } = render(
      <ThemeProvider>
        <Record
          record={dummyRecord}
          isSelected={false}
          onClick={() => {}}
          onSelect={() => {}}
        />
      </ThemeProvider>
    )

    expect(asFragment()).toMatchSnapshot('initial state')

    const kebabIcon = container.querySelector('[data-testid="kebab-icon"]')
    expect(kebabIcon).toBeInTheDocument()

    fireEvent.click(kebabIcon)

    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="record-actions-popup-content"]')
      ).toBeInTheDocument()
    })

    expect(asFragment()).toMatchSnapshot('after toggle')
  })
})
