import React from 'react'

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { DropdownSwapVault } from './index'
import '@testing-library/jest-dom'

jest.mock('pearpass-lib-vault', () => ({
  useVault: () => ({
    refetch: jest.fn(),
    isVaultProtected: jest.fn()
  })
}))

jest.mock('../../context/LoadingContext', () => ({
  useLoadingContext: () => ({
    setIsLoading: jest.fn()
  })
}))

jest.mock('../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: jest.fn()
  })
}))

describe('DropdownSwapVault component', () => {
  const mockVaults = [
    { id: 'vault2', name: 'vault2' },
    { id: 'vault3', name: 'vault3' }
  ]
  const mockSelectedVault = { id: 'vault1', name: 'vault1' }

  test('renders nothing when vaults array is empty', () => {
    const { container } = render(
      <ThemeProvider>
        <DropdownSwapVault vaults={[]} selectedVault={mockSelectedVault} />
      </ThemeProvider>
    )
    expect(container.firstChild).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('renders with selected vault', () => {
    const { getAllByText } = render(
      <ThemeProvider>
        <DropdownSwapVault
          vaults={mockVaults}
          selectedVault={mockSelectedVault}
        />
      </ThemeProvider>
    )

    const elements = getAllByText('vault1')

    expect(elements).toHaveLength(1)
  })

  test('displays all vault options when open', () => {
    const { getByText, getAllByText } = render(
      <ThemeProvider>
        <DropdownSwapVault
          vaults={mockVaults}
          selectedVault={mockSelectedVault}
        />
      </ThemeProvider>
    )

    fireEvent.click(getByText('vault1'))
    const vaultOptions = getAllByText(/vault[12]/)
    expect(vaultOptions).toHaveLength(2)
  })
})
