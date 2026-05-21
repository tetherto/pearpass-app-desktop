/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ExportItemsContent } from './index'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const mockSetToast = jest.fn()
jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    setToast: mockSetToast
  })
}))

const mockSetModal = jest.fn()
const mockCloseModal = jest.fn()
jest.mock('../../../../context/ModalContext', () => ({
  useModal: () => ({
    setModal: mockSetModal,
    closeModal: mockCloseModal
  })
}))

const mockRefetchVault = jest.fn()
jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useVault: () => ({
    data: { id: 'vault-1' },
    refetch: mockRefetchVault
  }),
  getMasterEncryption: jest.fn(() => Promise.resolve('enc-key')),
  getVaultById: jest.fn(() => Promise.resolve({ id: 'vault-1', name: 'Main' })),
  listRecords: jest.fn(() => Promise.resolve([{ id: 'record-1' }]))
}))

const mockExportJson = jest.fn((..._args: unknown[]) => Promise.resolve())
const mockExportCsv = jest.fn((..._args: unknown[]) => Promise.resolve())

jest.mock('../../utils/exportJsonPerVault', () => ({
  handleExportJsonPerVaultTest: (...args: unknown[]) => mockExportJson(...args)
}))

jest.mock('../../utils/exportCsvPerVault', () => ({
  handleExportCSVPerVault: (...args: unknown[]) => mockExportCsv(...args)
}))

jest.mock('../../../../containers/Modal/AuthenticationModalContent', () => ({
  AuthenticationModalContent: (props: { onSuccess: () => Promise<void> }) => (
    <button
      type="button"
      data-testid="auth-confirm"
      onClick={() => void props.onSuccess()}
    >
      Confirm
    </button>
  )
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    container: {},
    header: {},
    toggleCard: {},
    passwordFieldsWrapper: {},
    passwordFields: {},
    actionsRow: {}
  })
}))

const mockTheme = {
  theme: {
    colors: {
      colorTextSecondary: '#888',
      colorTextPrimary: '#fff'
    }
  }
}

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  useTheme: () => mockTheme,
  PageHeader: ({ title }: { title: React.ReactNode }) => <h1>{title}</h1>,
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Radio: (props: {
    options: Array<{ value: string; label: string }>
    value?: string
    onChange?: (value: string) => void
    testID?: string
  }) => (
    <div data-testid={props.testID}>
      {props.options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-testid={`${props.testID}-${opt.value}`}
          aria-pressed={props.value === opt.value}
          onClick={() => props.onChange?.(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  ),
  ToggleSwitch: (props: {
    'data-testid'?: string
    checked?: boolean
    onChange?: (checked: boolean) => void
  }) => (
    <button
      type="button"
      role="switch"
      data-testid={props['data-testid']}
      aria-checked={props.checked}
      onClick={() => props.onChange?.(!props.checked)}
    >
      toggle
    </button>
  ),
  PasswordField: (props: {
    testID?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) => (
    <input
      data-testid={props.testID}
      value={props.value}
      onChange={props.onChange}
    />
  ),
  Button: (props: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    'data-testid'?: string
  }) => (
    <button
      type="button"
      data-testid={props['data-testid']}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}))

describe('ExportItemsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders export heading and action', () => {
    render(<ExportItemsContent />)

    expect(screen.getByRole('heading', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByTestId('export-button')).toBeInTheDocument()
  })

  it('disables export when password protection is enabled and passwords mismatch', () => {
    render(<ExportItemsContent />)

    fireEvent.click(screen.getByTestId('export-protect-toggle'))

    fireEvent.change(screen.getByTestId('export-file-password'), {
      target: { value: 'abc12345' }
    })
    fireEvent.change(screen.getByTestId('export-file-password-confirm'), {
      target: { value: 'abc123XX' }
    })

    expect(screen.getByTestId('export-button')).toBeDisabled()
  })

  it('exports json after auth confirmation', async () => {
    render(<ExportItemsContent />)

    fireEvent.click(screen.getByTestId('export-protect-toggle'))

    fireEvent.change(screen.getByTestId('export-file-password'), {
      target: { value: 'secret' }
    })
    fireEvent.change(screen.getByTestId('export-file-password-confirm'), {
      target: { value: 'secret' }
    })

    fireEvent.click(screen.getByTestId('export-button'))

    expect(mockSetModal).toHaveBeenCalledTimes(1)

    const modalElement = mockSetModal.mock.calls[0][0] as React.ReactElement
    render(modalElement)

    fireEvent.click(screen.getByTestId('auth-confirm'))

    await waitFor(() => {
      expect(mockCloseModal).toHaveBeenCalledTimes(1)
      expect(mockExportJson).toHaveBeenCalledTimes(1)
    })

    expect(mockExportJson).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: 'vault-1',
          records: [{ id: 'record-1' }]
        })
      ],
      'secret'
    )
    expect(mockRefetchVault).toHaveBeenCalledWith('vault-1', 'enc-key')
  })
})
