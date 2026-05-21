/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { MasterPasswordContent } from './index'
;(globalThis as { React?: typeof React }).React = React

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../context/LoadingContext', () => ({
  useGlobalLoading: jest.fn()
}))

const mockUpdateMasterPassword = jest.fn(() => Promise.resolve())
jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useUserData: () => ({
    updateMasterPassword: mockUpdateMasterPassword
  })
}))

const mockStringToBuffer = jest.fn((value: string) => `buf:${value}`)
const mockClearBuffer = jest.fn()

jest.mock('@tetherto/pearpass-lib-vault/src/utils/buffer', () => ({
  stringToBuffer: (value: string) => mockStringToBuffer(value),
  clearBuffer: (value: unknown) => mockClearBuffer(value)
}))

jest.mock('@tetherto/pearpass-utils-password-check', () => ({
  checkPasswordStrength: (value: string) =>
    value.length > 0 ? { strengthType: 'success' } : { strengthType: 'error' },
  validatePasswordChange: () => ({ success: true })
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    container: {},
    fieldsWrapper: {},
    footer: {}
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
  Form: (props: {
    children?: React.ReactNode
    onSubmit?: (e?: unknown) => void
  }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        props.onSubmit?.(e)
      }}
    >
      {props.children}
    </form>
  ),
  PasswordField: (props: {
    testID?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    label?: string
  }) => (
    <label>
      <span>{props.label}</span>
      <input
        data-testid={props.testID}
        value={props.value}
        onChange={props.onChange}
      />
    </label>
  ),
  AlertMessage: ({ description }: { description: React.ReactNode }) => (
    <div>{description}</div>
  ),
  Button: (props: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit'
  }) => (
    <button
      type={props.type ?? 'button'}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  ),
  Text: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>
}))

describe('MasterPasswordContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders heading and disabled submit state by default', () => {
    render(<MasterPasswordContent />)

    expect(
      screen.getByRole('heading', { name: 'Master Password' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Change Password' })
    ).toBeDisabled()
  })

  it('submits a valid password change and clears buffers', async () => {
    render(<MasterPasswordContent />)

    fireEvent.change(screen.getByTestId('current-password-field'), {
      target: { value: 'old-pass' }
    })
    fireEvent.change(screen.getByTestId('new-password-field'), {
      target: { value: 'new-pass-123' }
    })
    fireEvent.change(screen.getByTestId('repeat-password-field'), {
      target: { value: 'new-pass-123' }
    })

    const submitButton = screen.getByRole('button', { name: 'Change Password' })
    expect(submitButton).not.toBeDisabled()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateMasterPassword).toHaveBeenCalledTimes(1)
    })

    expect(mockUpdateMasterPassword).toHaveBeenCalledWith({
      newPassword: 'buf:new-pass-123',
      currentPassword: 'buf:old-pass'
    })
    expect(mockClearBuffer).toHaveBeenCalledWith('buf:new-pass-123')
    expect(mockClearBuffer).toHaveBeenCalledWith('buf:old-pass')
  })
})
