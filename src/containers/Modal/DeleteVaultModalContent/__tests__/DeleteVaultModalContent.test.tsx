import React from 'react'
import '@testing-library/jest-dom'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { DeleteVaultModalContent } from '../index'
import { ModalProvider } from '../../../../context/ModalContext'
import { LoadingProvider } from '../../../../context/LoadingContext'

let mockProtectedFlag = false

jest.mock('pearpass-lib-constants', () => ({
  get PROTECTED_VAULT_ENABLED() {
    return mockProtectedFlag
  }
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s: string) => s } })
}))

jest.mock('pearpass-lib-vault', () => {
  const actual = jest.requireActual<typeof import('pearpass-lib-vault')>('pearpass-lib-vault')

  const mockLogIn = jest.fn()
  const mockAuthorise = jest.fn()

  return {
    ...actual,
    useVault: () => ({
      data: {
        id: 'vault-1',
        devices: [
          { id: 'd1', name: 'Device 1', createdAt: Date.now(), vaultId: 'v1' },
          { id: 'd2', name: 'Device 2', createdAt: Date.now(), vaultId: 'v1' }
        ]
      },
      refetch: jest.fn(),
      isVaultProtected: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
    }),
    useUserData: () => ({
      logIn: mockLogIn
    }),
    authoriseCurrentProtectedVault: mockAuthorise,
    __testMocks: { mockLogIn, mockAuthorise }
  }
})

const { __testMocks } = require('pearpass-lib-vault')
const { mockLogIn, mockAuthorise } = __testMocks

jest.mock('../../../../utils/getDeviceName', () => ({
  getDeviceName: () => 'Device 1'
}))

// Basic render helper
const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <LoadingProvider>
        <ModalProvider>{ui}</ModalProvider>
      </LoadingProvider>
    </ThemeProvider>
  )

describe('DeleteVaultModalContent', () => {
  beforeEach(() => {
    mockProtectedFlag = false
    mockLogIn.mockReset()
    mockAuthorise.mockReset()
  })

  test('renders delete flow copy by default (unprotected flag)', async () => {
    mockProtectedFlag = false

    renderWithProviders(<DeleteVaultModalContent vaultId="vault-1" />)

    expect(
      screen.getByText('Are you sure you want to delete this vault?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Select additional devices to delete the vault from')
    ).toBeInTheDocument()
  })

  test('submits delete flow when PROTECTED_VAULT_ENABLED is false (master password only)', async () => {
    mockProtectedFlag = false
    mockLogIn.mockResolvedValueOnce(undefined)
    mockAuthorise.mockResolvedValueOnce(undefined)

    renderWithProviders(<DeleteVaultModalContent vaultId="vault-1" />)

    // Step 1: go to confirm step
    fireEvent.click(screen.getByText('Continue'))

    // Only masterPassword is validated when flag is false
    fireEvent.change(screen.getByPlaceholderText('Insert master password'), {
      target: { value: 'master-secret' }
    })

    // Submit
    fireEvent.click(screen.getByText('Delete vault'))

    await waitFor(() => {
      expect(mockLogIn).toHaveBeenCalledTimes(1)
      expect(mockAuthorise).not.toHaveBeenCalled()
    })
  })

  test('submits delete flow when PROTECTED_VAULT_ENABLED is true (master + vault passwords)', async () => {
    mockProtectedFlag = true
    mockLogIn.mockResolvedValueOnce(undefined)
    mockAuthorise.mockResolvedValueOnce(undefined)

    renderWithProviders(<DeleteVaultModalContent vaultId="vault-1" />)

    // Step 1: go to confirm step
    fireEvent.click(screen.getByText('Continue'))

    // Wait for the vault password field to appear (protected vault flow)
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText('Insert vault password')
      ).toBeInTheDocument()
    )

    // Fill in vault & master passwords
    fireEvent.change(screen.getByPlaceholderText('Insert vault password'), {
      target: { value: 'vault-secret' }
    })
    fireEvent.change(screen.getByPlaceholderText('Insert master password'), {
      target: { value: 'master-secret' }
    })

    // Submit
    fireEvent.click(screen.getByText('Delete vault'))

    await waitFor(() => {
      expect(mockLogIn).toHaveBeenCalledTimes(1)
      expect(mockAuthorise).toHaveBeenCalledTimes(1)
    })
  })
})

