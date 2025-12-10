import React from 'react'

jest.mock('@lingui/react', () => ({
  useLingui: jest.fn(() => ({
    i18n: { _: (key) => key }
  }))
}))

jest.mock('pearpass-utils-password-check', () => ({
  checkPasswordStrength: jest.fn(),
  checkPassphraseStrength: jest.fn(),
  PASSWORD_STRENGTH: {
    SAFE: 'safe',
    VULNERABLE: 'vulnerable',
    WEAK: 'weak'
  }
}))

import { render, fireEvent } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import { checkPasswordStrength } from 'pearpass-utils-password-check'

import { PasswordField } from './index'
import '@testing-library/jest-dom'

const DummyAdditionalItem = () => (
  <div data-testid="additional-item">Additional</div>
)

describe('PasswordField Component', () => {
  const setup = (props) =>
    render(
      <ThemeProvider>
        <PasswordField {...props} />
      </ThemeProvider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders label, placeholder, and error message', () => {
    const { getByText, getByPlaceholderText } = setup({
      value: 'secret',
      label: 'Password',
      error: 'Error occurred',
      placeholder: 'Enter password',
      onChange: jest.fn(),
      onClick: jest.fn(),
      isDisabled: false
    })

    expect(getByText('Password')).toBeInTheDocument()
    expect(getByPlaceholderText('Enter password')).toBeInTheDocument()
    expect(getByText('Error occurred')).toBeInTheDocument()
  })

  test('calls onChange when input value changes', () => {
    const handleChange = jest.fn()
    const { getByPlaceholderText } = setup({
      value: '',
      placeholder: 'Enter password',
      onChange: handleChange
    })

    const input = getByPlaceholderText('Enter password')
    fireEvent.change(input, { target: { value: 'newpass' } })
    expect(handleChange).toHaveBeenCalledWith('newpass')
  })

  test('toggles password visibility when toggle button is clicked', () => {
    const { container, getByPlaceholderText, queryByText } = setup({
      value: 'secret',
      placeholder: 'Enter password',
      onChange: jest.fn()
    })

    const input = getByPlaceholderText('Enter password')
    expect(input).toHaveAttribute('type', 'password')

    const toggleButton = container.querySelector('button')
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute('type', 'text')

    expect(queryByText('secret')).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  test('displays password strongness as "Strong" when safe', () => {
    checkPasswordStrength.mockReturnValue({
      success: true,
      type: 'strong',
      strengthType: 'success',
      strengthText: 'Strong'
    })

    const { getByText } = setup({
      value: 'safePassword',
      label: 'Password',
      onChange: jest.fn(),
      hasStrongness: true,
      passType: 'password'
    })

    expect(getByText('Strong')).toBeInTheDocument()
  })

  test('displays password strongness as "Weak" when not safe', () => {
    checkPasswordStrength.mockReturnValue({
      success: true,
      type: 'weak',
      strengthType: 'error',
      strengthText: 'Weak'
    })

    const { getByText } = setup({
      value: 'weak',
      label: 'Password',
      onChange: jest.fn(),
      hasStrongness: true,
      passType: 'password'
    })

    expect(getByText('Weak')).toBeInTheDocument()
  })

  test('renders additionalItems if provided', () => {
    const { getByTestId } = setup({
      value: 'secret',
      placeholder: 'Enter password',
      onChange: jest.fn(),
      additionalItems: <DummyAdditionalItem />
    })

    expect(getByTestId('additional-item')).toBeInTheDocument()
  })

  test('matches snapshot for default variant', () => {
    const { container } = setup({
      value: 'snapshot test',
      label: 'Password',
      placeholder: 'Enter password',
      onChange: jest.fn(),
      variant: 'default'
    })

    expect(container.firstChild).toMatchSnapshot()
  })

  test('matches snapshot for outline variant', () => {
    const { container } = setup({
      value: 'outline snapshot',
      label: 'Password',
      placeholder: 'Enter password',
      onChange: jest.fn(),
      variant: 'outline'
    })

    expect(container.firstChild).toMatchSnapshot()
  })
})
