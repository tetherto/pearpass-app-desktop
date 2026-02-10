import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import { useVault } from 'pearpass-lib-vault'

import { SettingsVaultsTab } from './index'
import { useModal } from '../../../context/ModalContext'
import '@testing-library/jest-dom'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (str) => str
    }
  }),
  I18nProvider: ({ children }) => children
}))

jest.mock('pearpass-lib-vault', () => ({
  useVault: jest.fn()
}))

jest.mock('../../../context/ModalContext', () => ({
  useModal: jest.fn()
}))

jest.mock('../../../utils/vaultCreated', () => ({
  vaultCreatedFormat: jest.fn((date) => date + 'date')
}))

jest.mock('../../../components/CardSingleSetting', () => ({
  CardSingleSetting: ({ title, children }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}))

jest.mock('../../../components/ListItem', () => ({
  ListItem: ({ itemName, onEditClick }) => (
    <div>
      <p>{itemName}</p>
      <button onClick={onEditClick}>Edit</button>
    </div>
  )
}))

describe('VaultsTab', () => {
  const setModalMock = jest.fn()

  const renderWithProviders = (component) =>
    render(<ThemeProvider>{component}</ThemeProvider>)

  beforeEach(() => {
    useVault.mockReturnValue({
      data: {
        id: '1',
        name: 'Vault 1',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    })

    useModal.mockReturnValue({
      setModal: setModalMock
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders Your Vault section', () => {
    const { container } = renderWithProviders(<SettingsVaultsTab />)

    expect(screen.getByText('Your Vault')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders vault in the list', () => {
    renderWithProviders(<SettingsVaultsTab />)

    expect(screen.getByText('Vault 1')).toBeInTheDocument()
  })

  it('opens ModifyVaultModalContent when editing the vault', () => {
    renderWithProviders(<SettingsVaultsTab />)

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(setModalMock).toHaveBeenCalledWith(expect.anything())
  })
})
