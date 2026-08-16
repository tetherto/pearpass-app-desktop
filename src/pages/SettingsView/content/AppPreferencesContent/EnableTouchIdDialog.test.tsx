/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EnableTouchIdDialog } from './EnableTouchIdDialog'

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

// Vault lib uses var + getter so assignments in test bodies work
 
var mockLogIn: any
 
var mockGetMasterEncryption: any

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useUserData: () => ({
    logIn: mockLogIn,
    refreshMasterPasswordStatus: jest.fn()
  }),
  get getMasterEncryption() {
    return mockGetMasterEncryption
  }
}))

jest.mock('@tetherto/pearpass-lib-vault/src/utils/buffer', () => ({
  clearBuffer: jest.fn(),
  stringToBuffer: (value: string) => Buffer.from(value, 'utf8')
}))

jest.mock(
  '@tetherto/pearpass-lib-ui-kit',
  () => ({
    Button: (props: {
      'data-testid'?: string
      children?: React.ReactNode
      onClick?: () => void
      type?: string
      isLoading?: boolean
    }) => (
      <button
        type="button"
        data-testid={props['data-testid']}
        disabled={props.isLoading}
        onClick={props.onClick}
      >
        {props.children}
      </button>
    ),
    Dialog: (props: {
      title?: React.ReactNode
      onClose?: () => void
      open?: boolean
      testID?: string
      closeButtonTestID?: string
      footer?: React.ReactNode
      children?: React.ReactNode
    }) => (
      <div data-testid={props.testID}>
        <h2>{props.title}</h2>
        <button data-testid={props.closeButtonTestID} onClick={props.onClose}>
          Close
        </button>
        {props.children}
        {props.footer}
      </div>
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
    }) => (
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
    ),
    Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  }),
  { virtual: true }
)

const mockCloseModal = jest.fn()
const mockOnEnabled = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  mockLogIn = jest.fn()
  mockGetMasterEncryption = jest.fn()
  localStorage.clear()
  delete (window as unknown as Record<string, unknown>).electronAPI
})

const setMockElectronAPI = () => {
  ;(window as unknown as Record<string, unknown>).electronAPI = {
    isBiometricAvailable: jest.fn(),
    storeBiometricCredentials: jest.fn(() => Promise.resolve(true)),
    retrieveBiometricCredentials: jest.fn(),
    deleteBiometricCredentials: jest.fn()
  }
}

describe('EnableTouchIdDialog', () => {
  const renderDialog = () =>
    render(
      <EnableTouchIdDialog
        closeModal={mockCloseModal}
        onEnabled={mockOnEnabled}
      />
    )

  it('renders the dialog with title, password field, and confirm button', () => {
    renderDialog()

    expect(screen.getByTestId('settings-biometric-dialog')).toBeInTheDocument()
    expect(screen.getByText('Enable Touch ID')).toBeInTheDocument()
    expect(screen.getByTestId('settings-biometric-password')).toBeInTheDocument()
    expect(screen.getByTestId('settings-biometric-confirm')).toBeInTheDocument()
  })

  it('shows an error when submitting with an empty password', async () => {
    renderDialog()

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    expect(mockLogIn).not.toHaveBeenCalled()
    expect(mockOnEnabled).not.toHaveBeenCalled()
    expect(mockCloseModal).not.toHaveBeenCalled()
  })

  it('shows an error when master password verification fails', async () => {
    mockLogIn.mockRejectedValue(new Error('Invalid master password') as never)

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(screen.getByText('Invalid master password')).toBeInTheDocument()
    })

    expect(mockLogIn).toHaveBeenCalled()
    expect(mockGetMasterEncryption).not.toHaveBeenCalled()
    expect(mockOnEnabled).not.toHaveBeenCalled()
    expect(mockCloseModal).not.toHaveBeenCalled()
  })

  it('shows an error when getMasterEncryption fails (dynamic import)', async () => {
    mockLogIn.mockResolvedValue(undefined as never)
    mockGetMasterEncryption.mockRejectedValue(
      new Error('Failed to retrieve vault encryption credentials') as never
    )

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to enable Touch ID. Please try again.')
      ).toBeInTheDocument()
    })

    expect(mockLogIn).toHaveBeenCalled()
    expect(mockGetMasterEncryption).toHaveBeenCalled()
    expect(mockOnEnabled).not.toHaveBeenCalled()
    expect(mockCloseModal).not.toHaveBeenCalled()
  })

  it('shows an error when getMasterEncryption returns incomplete data', async () => {
    mockLogIn.mockResolvedValue(undefined as never)
    mockGetMasterEncryption.mockResolvedValue({
      nonce: 'nonce-123',
      hashedPassword: 'hash-456'
    })

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to enable Touch ID. Please try again.')
      ).toBeInTheDocument()
    })

    expect(mockOnEnabled).not.toHaveBeenCalled()
  })

  it('shows an error when window.electronAPI is unavailable', async () => {
    mockLogIn.mockResolvedValue(undefined as never)
    mockGetMasterEncryption.mockResolvedValue({
      ciphertext: 'enc-ciphertext',
      nonce: 'enc-nonce',
      salt: 'enc-salt',
      hashedPassword: 'enc-hashed-password'
    })

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to enable Touch ID. Please try again.')
      ).toBeInTheDocument()
    })

    expect(mockOnEnabled).not.toHaveBeenCalled()
  })

  it('shows an error when storeBiometricCredentials fails', async () => {
    mockLogIn.mockResolvedValue(undefined as never)
    mockGetMasterEncryption.mockResolvedValue({
      ciphertext: 'enc-ciphertext',
      nonce: 'enc-nonce',
      salt: 'enc-salt',
      hashedPassword: 'enc-hashed-password'
    })
    setMockElectronAPI()
    const api = (window as unknown as Record<string, unknown>)
      .electronAPI as {
        storeBiometricCredentials: ReturnType<typeof jest.fn>
      }
    api.storeBiometricCredentials = jest.fn(() => Promise.reject(new Error()))

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(
        screen.getByText('Failed to enable Touch ID. Please try again.')
      ).toBeInTheDocument()
    })

    expect(mockOnEnabled).not.toHaveBeenCalled()
    expect(mockCloseModal).not.toHaveBeenCalled()
  })

  it('stores credentials and closes dialog on successful verification', async () => {
    mockLogIn.mockResolvedValue(undefined as never)
    mockGetMasterEncryption.mockResolvedValue({
      ciphertext: 'enc-ciphertext',
      nonce: 'enc-nonce',
      salt: 'enc-salt',
      hashedPassword: 'enc-hashed-password'
    })
    setMockElectronAPI()
    const api = (window as unknown as Record<string, unknown>)
      .electronAPI as {
        storeBiometricCredentials: ReturnType<typeof jest.fn>
      }

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(mockLogIn).toHaveBeenCalledWith(
        expect.objectContaining({ password: expect.any(Buffer) })
      )
      expect(mockGetMasterEncryption).toHaveBeenCalled()
      expect(api.storeBiometricCredentials).toHaveBeenCalledWith({
        ciphertext: 'enc-ciphertext',
        nonce: 'enc-nonce',
        salt: 'enc-salt',
        hashedPassword: 'enc-hashed-password'
      })
      expect(
        localStorage.getItem('biometric-login-enabled')
      ).toBe('true')
      expect(mockOnEnabled).toHaveBeenCalled()
      expect(mockCloseModal).toHaveBeenCalled()
    })
  })

  it('stores credentials with salt defaulting to empty string when missing', async () => {
    mockLogIn.mockResolvedValue(undefined as never)
    mockGetMasterEncryption.mockResolvedValue({
      ciphertext: 'enc-ciphertext',
      nonce: 'enc-nonce',
      hashedPassword: 'enc-hashed-password'
    })
    setMockElectronAPI()
    const api = (window as unknown as Record<string, unknown>)
      .electronAPI as {
        storeBiometricCredentials: ReturnType<typeof jest.fn>
      }

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })

    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(api.storeBiometricCredentials).toHaveBeenCalledWith(
        expect.objectContaining({
          salt: ''
        })
      )
    })
  })

  it('does not close when isLoading is true and close button is clicked', async () => {
    mockLogIn.mockImplementation(
      () => new Promise(() => {})
    )

    renderDialog()

    const passwordInput = screen.getByTestId('settings-biometric-password')
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(screen.getByTestId('settings-biometric-confirm'))

    await waitFor(() => {
      expect(screen.getByTestId('settings-biometric-confirm')).toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('settings-biometric-cancel'))
    expect(mockCloseModal).not.toHaveBeenCalled()
  })

  it('calls closeModal when close button is clicked while not loading', () => {
    renderDialog()

    fireEvent.click(screen.getByTestId('settings-biometric-cancel'))

    expect(mockCloseModal).toHaveBeenCalledTimes(1)
  })
})
