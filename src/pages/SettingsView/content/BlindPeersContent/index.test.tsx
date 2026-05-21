/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

import { BlindPeersContent } from './index'
import { UnsavedChangesProvider } from '../../../../context/UnsavedChangesContext'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string, values?: Record<string, unknown>) => {
      if (values && typeof str === 'string') {
        return str.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''))
      }
      return str
    }
  })
}))

const mockSetIsLoading = jest.fn()
jest.mock('../../../../context/LoadingContext', () => ({
  useLoadingContext: () => ({
    setIsLoading: mockSetIsLoading,
    isLoading: false
  })
}))

const mockSetToast = jest.fn()
jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    setToast: mockSetToast
  })
}))

const mockGetBlindMirrors = jest.fn()
const mockRemoveAllBlindMirrors = jest.fn(() => Promise.resolve())
const mockAddBlindMirrors = jest.fn(() => Promise.resolve())
const mockAddDefaultBlindMirrors = jest.fn(() => Promise.resolve())

let mockVaultData: Array<{ isDefault: boolean; key: string }> = []

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useBlindMirrors: () => ({
    getBlindMirrors: mockGetBlindMirrors,
    removeAllBlindMirrors: mockRemoveAllBlindMirrors,
    addBlindMirrors: mockAddBlindMirrors,
    addDefaultBlindMirrors: mockAddDefaultBlindMirrors,
    data: mockVaultData
  })
}))

jest.mock('@tetherto/pearpass-lib-constants', () => ({
  BLIND_PEER_TYPE: {
    PERSONAL: 'personal',
    DEFAULT: 'default'
  },
  BLIND_PEERS_LIMIT: 5
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    settingCard: {},
    toggleBlock: {},
    radioBlock: {},
    modeRadioGroup: {},
    radioOptionPad: {},
    manualOptionBlock: {},
    manualMultislotWrap: {},
    multiSlotActions: {},
    saveChangesRow: {}
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

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => mockTheme,
  Title: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PageHeader: ({ title }: { title: React.ReactNode }) => <h1>{title}</h1>,
  ToggleSwitch: (props: {
    'data-testid'?: string
    checked?: boolean
    disabled?: boolean
    onChange?: (checked: boolean) => void
    label?: string
  }) => {
    const testId = props['data-testid']
    return (
      <div data-testid={testId}>
        <button
          type="button"
          role="switch"
          aria-checked={props.checked}
          disabled={props.disabled}
          onClick={() => !props.disabled && props.onChange?.(!props.checked)}
        >
          {props.label}
        </button>
      </div>
    )
  },
  Radio: (props: {
    testID?: string
    value?: string
    onChange?: (value: string) => void
    disabled?: boolean
    options: Array<{ value: string; label: string }>
  }) => (
    <div data-testid={props.testID} role="radiogroup">
      {props.options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-value={opt.value}
          aria-pressed={props.value === opt.value}
          disabled={props.disabled}
          onClick={() => !props.disabled && props.onChange?.(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
  MultiSlotInput: (props: {
    testID?: string
    children: React.ReactNode
    actions?: React.ReactNode
  }) => (
    <div data-testid={props.testID}>
      <div data-testid="multislot-fields">{props.children}</div>
      {props.actions}
    </div>
  ),
  InputField: (props: {
    testID?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    label?: string
    disabled?: boolean
    rightSlot?: React.ReactNode
  }) => (
    <div>
      <span>{props.label}</span>
      <input
        data-testid={props.testID}
        value={props.value}
        disabled={props.disabled}
        onChange={props.onChange}
      />
      {props.rightSlot}
    </div>
  ),
  Button: (props: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: string
    'data-testid'?: string
    'aria-label'?: string
  }) => (
    <button
      type={(props.type as 'button') || 'button'}
      data-testid={props['data-testid']}
      aria-label={props['aria-label']}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Add: () => null,
  Close: () => null
}))

describe('BlindPeersContent', () => {
  const renderView = () =>
    render(
      <UnsavedChangesProvider>
        <BlindPeersContent />
      </UnsavedChangesProvider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockVaultData = []
  })

  it('renders card and title', () => {
    renderView()

    expect(
      screen.getByTestId('settings-card-blind-peering')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Blind Peering' })
    ).toBeInTheDocument()
  })

  it('calls getBlindMirrors on mount', () => {
    renderView()

    expect(mockGetBlindMirrors).toHaveBeenCalledTimes(1)
  })

  it('shows mode radios and save after enabling blind peering', () => {
    renderView()

    expect(
      screen.queryByTestId('settings-blind-peering-mode')
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('switch', { name: 'Enable Blind Peering' })
    )

    expect(
      screen.getByTestId('settings-blind-peering-mode')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-blind-peering-mode-manual')
    ).toBeInTheDocument()
    expect(screen.getByTestId('blind-peers-save-changes')).toBeInTheDocument()
  })

  it('shows manual peer fields when Manual mode is selected', () => {
    renderView()

    fireEvent.click(
      screen.getByRole('switch', { name: 'Enable Blind Peering' })
    )

    fireEvent.click(screen.getByRole('button', { name: 'Manual Blind Peers' }))

    expect(
      screen.getByTestId('blind-peers-manual-multislot')
    ).toBeInTheDocument()
    expect(screen.getByTestId('blind-peer-input-0')).toBeInTheDocument()
    expect(screen.getByText('Add Another Peer')).toBeInTheDocument()
  })

  it('disables save when manual mode has no peer codes', () => {
    renderView()

    fireEvent.click(
      screen.getByRole('switch', { name: 'Enable Blind Peering' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Manual Blind Peers' }))

    expect(screen.getByTestId('blind-peers-save-changes')).toBeDisabled()
  })

  it('allows typing in peer input without losing the field', () => {
    renderView()

    fireEvent.click(
      screen.getByRole('switch', { name: 'Enable Blind Peering' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Manual Blind Peers' }))

    const input = screen.getByTestId('blind-peer-input-0')
    fireEvent.change(input, { target: { value: 'hello' } })

    expect(input).toHaveValue('hello')
  })

  it('disables Add Another Peer at BLIND_PEERS_LIMIT', () => {
    renderView()

    fireEvent.click(
      screen.getByRole('switch', { name: 'Enable Blind Peering' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Manual Blind Peers' }))

    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('Add Another Peer'))
    }

    expect(screen.getAllByTestId(/blind-peer-input-/)).toHaveLength(5)
    expect(screen.getByText('Add Another Peer')).toBeDisabled()
  })

  it('saves manual peers: removes all then adds when editing existing mirrors', async () => {
    mockVaultData = [
      { isDefault: false, key: 'first' },
      { isDefault: false, key: 'second' }
    ]

    renderView()

    await waitFor(() => {
      expect(
        screen.getByRole('switch', { name: 'Enable Blind Peering' })
      ).toBeChecked()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Manual Blind Peers' }))

    expect(screen.getByTestId('blind-peer-input-0')).toHaveValue('first')
    expect(screen.getByTestId('blind-peer-input-1')).toHaveValue('second')

    fireEvent.click(screen.getAllByRole('button', { name: 'Remove peer' })[1])

    await waitFor(() => {
      expect(screen.queryByTestId('blind-peer-input-1')).not.toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('blind-peers-save-changes'))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockRemoveAllBlindMirrors).toHaveBeenCalledTimes(1)
      expect(mockAddBlindMirrors).toHaveBeenCalledWith(['first'])
    })
  })

  it('saves automatic peers without prior remove when vault is empty', async () => {
    mockVaultData = []

    renderView()

    fireEvent.click(
      screen.getByRole('switch', { name: 'Enable Blind Peering' })
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('blind-peers-save-changes'))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(mockRemoveAllBlindMirrors).not.toHaveBeenCalled()
      expect(mockAddDefaultBlindMirrors).toHaveBeenCalledTimes(1)
    })
  })
})
