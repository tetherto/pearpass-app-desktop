import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

import { DiagnosticsContent } from './index'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../utils/logger', () => ({
  logger: { error: jest.fn() }
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    settingCard: {},
    openLogsRow: {}
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  FolderOpen: () => null
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => ({ theme: { colors: {} } }),
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="settings-diagnostics-page-header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  ),
  Button: ({
    children,
    onClick,
    'data-testid': dataTestid,
    disabled,
    iconBefore: _i
  }: {
    children: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
    disabled?: boolean
    iconBefore?: React.ReactNode
  }) => (
    <button
      type="button"
      data-testid={dataTestid}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
  ToggleSwitch: ({
    checked,
    onChange,
    'data-testid': dataTestid,
    disabled,
    label
  }: {
    checked?: boolean
    onChange?: (checked: boolean) => void
    'data-testid'?: string
    disabled?: boolean
    label?: string
  }) => (
    <label>
      {label}
      <input
        type="checkbox"
        data-testid={dataTestid}
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </label>
  )
}))

const TEST_IDS = {
  root: 'settings-card-diagnostics',
  loggingToggle: 'settings-diagnostics-logging-toggle',
  openLogs: 'settings-diagnostics-open-logs-button'
} as const

function withElectronAPI(value: unknown, run: () => Promise<void> | void) {
  const original = window.electronAPI
  Object.defineProperty(window, 'electronAPI', {
    configurable: true,
    writable: true,
    value
  })
  return Promise.resolve(run()).finally(() => {
    Object.defineProperty(window, 'electronAPI', {
      configurable: true,
      writable: true,
      value: original
    })
  })
}

describe('DiagnosticsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header and toggle, with Open logs disabled by default', () => {
    render(<DiagnosticsContent />)

    expect(screen.getByTestId(TEST_IDS.root)).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-diagnostics-page-header').textContent
    ).toContain('Diagnostics')
    expect(screen.getByTestId(TEST_IDS.loggingToggle)).not.toBeChecked()
    expect(screen.getByTestId(TEST_IDS.openLogs)).toBeDisabled()
  })

  it('Open logs folder button calls window.electronAPI.openLogsFolder when logging is on', async () => {
    const openLogsFolder = jest.fn(() => Promise.resolve())
    const isLoggingEnabled = jest.fn(() =>
      Promise.resolve({ enabled: true, forced: false })
    )

    await withElectronAPI({ openLogsFolder, isLoggingEnabled }, async () => {
      render(<DiagnosticsContent />)

      const btn = await screen.findByTestId(TEST_IDS.openLogs)
      await waitFor(() => expect(btn).not.toBeDisabled())

      await act(async () => {
        fireEvent.click(btn)
      })

      await waitFor(() => {
        expect(openLogsFolder).toHaveBeenCalledTimes(1)
      })
    })
  })

  it('Open logs folder button is disabled when logging is off', async () => {
    const isLoggingEnabled = jest.fn(() =>
      Promise.resolve({ enabled: false, forced: false })
    )

    await withElectronAPI({ isLoggingEnabled }, async () => {
      render(<DiagnosticsContent />)
      const btn = await screen.findByTestId(TEST_IDS.openLogs)
      await waitFor(() => expect(isLoggingEnabled).toHaveBeenCalled())
      expect(btn).toBeDisabled()
    })
  })

  it('toggling the diagnostic switch calls setLogging and updates state', async () => {
    const isLoggingEnabled = jest.fn(() =>
      Promise.resolve({ enabled: false, forced: false })
    )
    const setLogging = jest.fn((enabled: boolean) =>
      Promise.resolve({ enabled, forced: false })
    )

    await withElectronAPI({ isLoggingEnabled, setLogging }, async () => {
      render(<DiagnosticsContent />)
      const toggle = await screen.findByTestId(TEST_IDS.loggingToggle)
      await waitFor(() => expect(isLoggingEnabled).toHaveBeenCalled())

      await act(async () => {
        fireEvent.click(toggle)
      })

      await waitFor(() => {
        expect(setLogging).toHaveBeenCalledWith(true)
      })
      const btn = screen.getByTestId(TEST_IDS.openLogs)
      await waitFor(() => expect(btn).not.toBeDisabled())
    })
  })

  it('forced=true disables the toggle so the user cannot turn logging off', async () => {
    const isLoggingEnabled = jest.fn(() =>
      Promise.resolve({ enabled: true, forced: true })
    )
    const setLogging = jest.fn()

    await withElectronAPI({ isLoggingEnabled, setLogging }, async () => {
      render(<DiagnosticsContent />)
      const toggle = await screen.findByTestId(TEST_IDS.loggingToggle)
      await waitFor(() => expect(isLoggingEnabled).toHaveBeenCalled())
      await waitFor(() => expect(toggle).toBeDisabled())
      expect(setLogging).not.toHaveBeenCalled()
    })
  })
})
