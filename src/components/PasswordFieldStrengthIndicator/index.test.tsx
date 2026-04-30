import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { PasswordFieldStrengthIndicator } from './index'
import { PassType } from '../../shared/types'

// mocks
jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  PasswordField: jest.fn(({ onChange, ...props }) => (
    <input
      data-testid={props.testID}
      value={props.value}
      onChange={(e) => onChange(e)}
    />
  ))
}))

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

jest.mock('../../utils/getPasswordStrengthInfo', () => ({
  getPasswordStrength: jest.fn()
}))

jest.mock('../../constants/password', () => ({
  STRENGTH_MAP: {
    error: 'vulnerable',
    warning: 'decent',
    success: 'strong'
  }
}))

describe('PasswordFieldStrengthIndicator', () => {
  const mockOnChange = jest.fn()
  const mockOnBlur = jest.fn()
  const mockSetPasswordType = jest.fn()

  const baseProps = {
    label: 'Password',
    placeholder: 'Enter Password',
    testID: 'password-input',
    passwordType: PassType.Password,
    setPasswordType: mockSetPasswordType,
    passwordField: {
      name: 'password',
      value: '123456',
      onChange: mockOnChange,
      onBlur: mockOnBlur,
      error: ''
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders input with value', () => {
    const { getByTestId } = render(
      <PasswordFieldStrengthIndicator {...baseProps} />
    )

    expect(getByTestId('password-input')).toHaveValue('123456')
  })

  test('calls passwordField.onChange on input change', () => {
    const { getByTestId } = render(
      <PasswordFieldStrengthIndicator {...baseProps} />
    )

    fireEvent.change(getByTestId('password-input'), {
      target: { value: 'newpass' }
    })

    expect(mockOnChange).toHaveBeenCalledWith('newpass')
  })

  test('resets passwordType when not Password', () => {
    const { getByTestId } = render(
      <PasswordFieldStrengthIndicator
        {...baseProps}
        passwordType={PassType.PassPhrase}
      />
    )

    fireEvent.change(getByTestId('password-input'), {
      target: { value: 'newpass' }
    })

    expect(mockSetPasswordType).toHaveBeenCalledWith(PassType.Password)
  })

  test('does not reset passwordType if already Password', () => {
    const { getByTestId } = render(
      <PasswordFieldStrengthIndicator {...baseProps} />
    )

    fireEvent.change(getByTestId('password-input'), {
      target: { value: 'newpass' }
    })

    expect(mockSetPasswordType).not.toHaveBeenCalled()
  })

  test('passes error when provided', () => {
    const { getByTestId } = render(
      <PasswordFieldStrengthIndicator
        {...baseProps}
        passwordField={{
          ...baseProps.passwordField,
          error: 'Required'
        }}
      />
    )

    const input = getByTestId('password-input')
    expect(input).toBeInTheDocument()
  })

  test('computes password strength and maps indicator', () => {
    const { getPasswordStrength } = require('../../utils/getPasswordStrengthInfo')
    const { PasswordField } = require('@tetherto/pearpass-lib-ui-kit')

    getPasswordStrength.mockReturnValue({ strengthType: 'success' })

    render(<PasswordFieldStrengthIndicator {...baseProps} />)

    expect(getPasswordStrength).toHaveBeenCalledWith('123456', PassType.Password)
    expect(PasswordField).toHaveBeenLastCalledWith(
      expect.objectContaining({ passwordIndicator: 'strong' }),
      undefined
    )
  })

  test('handles undefined password strength', () => {
    const {
      getPasswordStrength
    } = require('../../utils/getPasswordStrengthInfo')

    getPasswordStrength.mockReturnValue(undefined)

    render(<PasswordFieldStrengthIndicator {...baseProps} />)

    expect(getPasswordStrength).toHaveBeenCalled()
  })
})
