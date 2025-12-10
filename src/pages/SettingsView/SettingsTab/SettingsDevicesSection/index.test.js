import React from 'react'

import { render } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { SettingsDevicesSection } from './index'

import '@testing-library/jest-dom'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (key) => key
    }
  })
}))

jest.mock('pear-apps-utils-date', () => ({
  formatDate: () => 'formatted-date'
}))

jest.mock('pearpass-lib-vault', () => ({
  useVault: () => ({
    data: {
      createdAt: 1749797696879,
      devices: [
        {
          createdAt: 1749797724078,
          name: 'IOS',
          id: 'mbugdwviwysp6h3kjfs',
          updatedAt: 1749797724078,
          vaultId: 'mbugdbvzv8tflyftw3d'
        },
        {
          createdAt: 1749797443078,
          name: 'Android',
          id: 'mbugdwviwysp6h3kjfs',
          updatedAt: 1749797443078,
          vaultId: 'mbugdbvzv8tflyftw3d'
        }
      ],
      id: 'mbugdbvzv8tflyftw3d',
      name: 'TESTO',
      records: [],
      updatedAt: 1749797696879,
      version: 1
    }
  })
}))

describe('SettingsDevicesSection', () => {
  const renderWithProviders = (component) =>
    render(<ThemeProvider>{component}</ThemeProvider>)

  it('matches snapshot', () => {
    const { container } = renderWithProviders(<SettingsDevicesSection />)

    expect(container).toMatchSnapshot()
  })
})
