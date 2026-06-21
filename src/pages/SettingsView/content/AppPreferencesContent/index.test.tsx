/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LOCAL_STORAGE_KEYS } from '../../../../constants/localStorage'
import { AppPreferencesContent } from './index'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const mockSetTimeoutMs = jest.fn()
let mockTimeoutMs: number | null = 60_000

jest.mock('../../../../hooks/useAutoLockPreferences', () => ({
  useAutoLockPreferences: () => ({
    timeoutMs: mockTimeoutMs,
    setTimeoutMs: mockSetTimeoutMs,
    isAutoLockEnabled: true,
    setAutoLockEnabled: jest.fn(),
    shouldBypassAutoLock: false,
    setShouldBypassAutoLock: jest.fn()
  })
}))

jest.mock(
  '@tetherto/pearpass-lib-ui-kit/icons',
  () => ({
    KeyboardArrowBottom: () => null
  }),
  { virtual: true }
)

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  AUTO_LOCK_ENABLED: true,
  AUTO_LOCK_TIMEOUT_OPTIONS: {
    ONE_MINUTE: { label: '1 Minute', value: 60_000 },
    TEN_MINUTES: { label: '10 Minutes', value: 600_000 }
  }
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    sectionHeading: {},
    settingCard: {},
    row: {},
    rowDivider: {},
    toggleColumn: {}
  })
}))

const mockTheme = {
  theme: {
    colors: {
      colorTextSecondary: '#888',
      colorTextPrimary: '#fff',
      colorBorderPrimary: '#333',
      colorSurfacePrimary: '#111'
    }
  }
}

// Mock ModalContext
const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()

jest.mock('../../../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: mockSetModal,
    closeModal: mockCloseModal
  })
}))

// Mock EnableTouchIdDialog
jest.mock('./EnableTouchIdDialog', () => ({
  EnableTouchIdDialog: () => (
    <div data-testid="settings-biometric-dialog">
      <span>Enable Touch ID</span>
    </div>
  )
}))
jest.mock(
  '@tetherto/pearpass-lib-ui-kit',
  () => ({
  useTheme: () => mockTheme,
  PageHeader: (props: { title: string; subtitle?: React.ReactNode }) => (
    <div>
      <h1>{props.title}</h1>
      {props.subtitle && <div>{props.subtitle}</div>}
    </div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ToggleSwitch: (props: {
    'data-testid'?: string
    checked?: boolean
    onChange?: (checked: boolean) => void
    label?: string
    description?: string
  }) => {
    const testId = props['data-testid']
    return (
      <button
        type="button"
        role="switch"
        data-testid={testId}
        aria-checked={props.checked}
        onClick={() => props.onChange?.(!props.checked)}
      >
        {props.label}
      </button>
    )
  },
  Button: (props: {
    'data-testid'?: string
    children?: React.ReactNode
    onClick?: () => void
    type?: string
    iconAfter?: React.ReactNode
    isLoading?: boolean
  }) => (
    <button
      type="button"
      data-testid={props['data-testid']}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  ),
  Dropdown: (props: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger: React.ReactNode
    children: React.ReactNode
  }) => (
    <div>
      <div onClick={() => props.onOpenChange?.(!props.open)}>
        {props.trigger}
      </div>
      {props.open ? <div data-testid="dropdown-menu">{props.children}</div> : null}
    </div>
  ),
  NavbarListItem: (props: {
    testID?: string
    label?: string
    selected?: boolean
    onClick?: () => void
  }) => (
    <button
      type="button"
      data-testid={props.testID}
      aria-pressed={props.selected}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  ),
  Form: (props: {
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    testID?: string
    children?: React.ReactNode
  }) => (
    <form
      data-testid={props.testID}
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit?.(e)
      }}
    >
      {props.children}
    </form>
  ),
  PasswordField: (props: {
    label?: string
    value?: string
    onChange?: (e: { target: { value: string } }) => void
    error?: string
    testID?: string
    placeholder?: string
  }) => {
    return (
      <div>
        <label>{props.label}</label>
        <input
          data-testid={props.testID}
          type="password"
          value={props.value}
          onChange={(e) => {
            props.onChange?.(e)
          }}
        />
        {props.error && <span data-testid="password-field-error">{props.error}</span>}
      </div>
    )
  }
  }),
  { virtual: true }
)

beforeEach(() => {
  localStorage.clear()
  mockSetTimeoutMs.mockClear()
  mockSetModal.mockClear()
  mockCloseModal.mockClear()
  mockTimeoutMs = 60_000
  delete (window as unknown as Record<string, unknown>).electronAPI
})

const mockBiometricAvailable = (available: boolean) => {
  ;(window as unknown as Record<string, unknown>).electronAPI = {
    isBiometricAvailable: () => Promise.resolve(available),
    storeBiometricCredentials: jest.fn(() => Promise.resolve(true)),
    deleteBiometricCredentials: jest.fn(() => Promise.resolve(true)),
    retrieveBiometricCredentials: jest.fn()
  }
}

describe('AppPreferencesContent', () => {
  it('renders the heading and all standard rows', async () => {
    mockBiometricAvailable(true)
    render(<AppPreferencesContent />)
    await screen.findByText('App Preferences')
    expect(screen.getByText('Auto Lock')).toBeInTheDocument()
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument()
    expect(screen.getByText('Reminders')).toBeInTheDocument()
  })

  it('shows Touch ID toggle when biometric is available', async () => {
    mockBiometricAvailable(true)
    render(<AppPreferencesContent />)
    const toggle = await screen.findByTestId('settings-biometric-toggle')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('hides Touch ID toggle when biometric is unavailable', async () => {
    mockBiometricAvailable(false)
    render(<AppPreferencesContent />)
    await waitFor(() => {
      expect(screen.queryByTestId('settings-biometric-toggle')).not.toBeInTheDocument()
    })
  })

  it('hides Touch ID toggle when electronAPI is not present', async () => {
    render(<AppPreferencesContent />)
    await waitFor(() => {
      expect(screen.queryByTestId('settings-biometric-toggle')).not.toBeInTheDocument()
    })
  })

  it('reads biometric enabled state from localStorage', async () => {
    mockBiometricAvailable(true)
    localStorage.setItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED, 'true')
    render(<AppPreferencesContent />)
    const toggle = await screen.findByTestId('settings-biometric-toggle')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('reads biometric disabled state from localStorage', async () => {
    mockBiometricAvailable(true)
    render(<AppPreferencesContent />)
    const toggle = await screen.findByTestId('settings-biometric-toggle')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('opens EnableTouchIdDialog via ModalContext when toggling ON', async () => {
    mockBiometricAvailable(true)
    render(<AppPreferencesContent />)
    const toggle = await screen.findByTestId('settings-biometric-toggle')
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(toggle)

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const modalContent = mockSetModal.mock.calls[0][0]
    expect(modalContent).toBeDefined()
  })

  it('passes closeModal and onEnabled to EnableTouchIdDialog', async () => {
    mockBiometricAvailable(true)
    render(<AppPreferencesContent />)
    const toggle = await screen.findByTestId('settings-biometric-toggle')
    fireEvent.click(toggle)

    expect(mockSetModal).toHaveBeenCalledTimes(1)
    const modalContent = mockSetModal.mock.calls[0][0] as React.ReactElement
    expect(modalContent).toBeDefined()
    expect(modalContent.type).toBeDefined()
  })

  it('clears biometric data when toggling OFF', async () => {
    mockBiometricAvailable(true)
    localStorage.setItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED, 'true')

    render(<AppPreferencesContent />)
    const toggle = await screen.findByTestId('settings-biometric-toggle')
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED)
    ).toBeNull()

    const api = (window as unknown as Record<string, unknown>).electronAPI as {
      deleteBiometricCredentials: ReturnType<typeof jest.fn>
    }
    expect(api.deleteBiometricCredentials).toHaveBeenCalled()
  })

  it('starts with clipboard enabled when localStorage has no value', () => {
    render(<AppPreferencesContent />)
    expect(
      screen.getByTestId('settings-copy-to-clipboard-toggle')
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('starts with clipboard disabled when localStorage value is "true"', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED, 'true')
    render(<AppPreferencesContent />)
    expect(
      screen.getByTestId('settings-copy-to-clipboard-toggle')
    ).toHaveAttribute('aria-checked', 'false')
  })

  it('writes "true" to localStorage when clipboard is toggled off', () => {
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-copy-to-clipboard-toggle'))
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED)
    ).toBe('true')
  })

  it('removes the localStorage key when clipboard is toggled back on', () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED, 'true')
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-copy-to-clipboard-toggle'))
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.COPY_TO_CLIPBOARD_DISABLED)
    ).toBeNull()
  })

  it('shows the current timeout in the select field', () => {
    render(<AppPreferencesContent />)
    expect(screen.getByTestId('settings-auto-lock-select').textContent).toBe(
      '1 Minute'
    )
  })

  it('calls setTimeoutMs when an option is clicked', () => {
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-auto-lock-select'))
    fireEvent.click(
      screen.getByTestId('settings-auto-lock-option-ten_minutes')
    )
    expect(mockSetTimeoutMs).toHaveBeenCalledWith(600_000)
  })

  it('starts with reminders enabled when localStorage has no value', () => {
    render(<AppPreferencesContent />)
    expect(screen.getByTestId('settings-reminders-toggle')).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })

  it('starts with reminders disabled when localStorage value is "false"', () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
      'false'
    )
    render(<AppPreferencesContent />)
    expect(screen.getByTestId('settings-reminders-toggle')).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('writes "false" to localStorage when reminders is toggled off', () => {
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-reminders-toggle'))
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED)
    ).toBe('false')
  })

  it('removes the localStorage key when reminders is toggled back on', () => {
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED,
      'false'
    )
    render(<AppPreferencesContent />)
    fireEvent.click(screen.getByTestId('settings-reminders-toggle'))
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.PASSWORD_CHANGE_REMINDER_ENABLED)
    ).toBeNull()
  })
})
