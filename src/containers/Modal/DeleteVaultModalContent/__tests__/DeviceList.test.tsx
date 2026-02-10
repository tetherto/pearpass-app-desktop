import React from 'react'
import '@testing-library/jest-dom'

import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { DeviceList } from '../DeviceList'
import { Device } from '../types'

jest.mock('@lingui/react', () => ({
  useLingui: () => ({ i18n: { _: (s: string) => s } })
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>)

const devices: Device[] = [
  {
    id: 'current-id',
    name: 'Current device name',
    createdAt: Date.now(),
    vaultId: 'vault-1'
  },
  {
    id: 'other-id',
    name: 'Other device',
    createdAt: Date.now(),
    vaultId: 'vault-1'
  }
]

describe('DeviceList', () => {
  test('renders current device label as "This device" and keeps it selected', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <DeviceList
        devices={devices}
        value={['current-id']}
        currentDeviceId="current-id"
        onChange={onChange}
      />
    )

    expect(screen.getByText('This device')).toBeInTheDocument()
    expect(screen.getByText('Other device')).toBeInTheDocument()

    // Clicking current device should not toggle selection or call onChange
    fireEvent.click(screen.getByText('This device'))
    expect(onChange).not.toHaveBeenCalled()
  })

  test('toggles selection for non-current devices and always includes current device in payload', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <DeviceList
        devices={devices}
        value={['current-id']}
        currentDeviceId="current-id"
        onChange={onChange}
      />
    )

    // Click on other device to select it
    fireEvent.click(screen.getByText('Other device'))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [nextSelection] = onChange.mock.calls[0] as [string[]]

    expect(nextSelection.sort()).toEqual(['current-id', 'other-id'].sort())
  })

  test('read-only mode uses original device icons and disables interaction', () => {
    const onChange = jest.fn()

    renderWithTheme(
      <DeviceList
        devices={devices}
        value={['current-id', 'other-id']}
        currentDeviceId="current-id"
        readOnly
        onChange={onChange}
      />
    )

    // Items are rendered as checkboxes but disabled
    const items = screen.getAllByRole('checkbox')
    items.forEach((item) => {
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    // Clicks should not fire onChange in read-only mode
    fireEvent.click(screen.getByText('Other device'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

