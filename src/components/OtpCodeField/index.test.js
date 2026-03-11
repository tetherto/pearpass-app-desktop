import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { OtpCodeField } from './index'

const mockGenerateNext = jest.fn()
const mockUseOtp = jest.fn()

jest.mock('pearpass-lib-vault', () => ({
  useOtp: (...args) => mockUseOtp(...args),
  formatOtpCode: (code) => {
    if (!code) return ''
    const mid = Math.ceil(code.length / 2)
    return code.slice(0, mid) + ' ' + code.slice(mid)
  },
  OTP_TYPE: { TOTP: 'TOTP', HOTP: 'HOTP' }
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: {
      _: (msg) => msg
    }
  })
}))

jest.mock('../CopyButton', () => ({
  CopyButton: ({ value, testId }) => (
    <button data-testid={testId}>Copy {value}</button>
  )
}))

jest.mock('../../lib-react-components', () => ({
  InputField: ({
    label,
    value,
    additionalItems,
    belowInputContent,
    testId
  }) => (
    <div data-testid={testId}>
      <span data-testid="otp-label">{label}</span>
      <span data-testid="otp-value">{value}</span>
      <div data-testid="otp-additional">{additionalItems}</div>
      {belowInputContent && (
        <div data-testid="otp-below-input">{belowInputContent}</div>
      )}
    </div>
  ),
  LockIcon: () => <span>LockIcon</span>
}))

jest.mock('./styles', () => ({
  styles: {
    nextCodeButton: {},
    nextCodeButtonHover: {},
    nextCodeButtonDisabled: {}
  }
}))

jest.mock('../TimerBar', () => ({
  TimerBar: ({ timeRemaining }) => (
    <div data-testid="otp-progress-bar">{timeRemaining}s</div>
  )
}))

const useOtp = mockUseOtp

describe('OtpCodeField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders TOTP code with progress bar', () => {
    useOtp.mockReturnValue({
      code: '123456',
      timeRemaining: 20,
      type: 'TOTP',
      period: 30,
      generateNext: null,
      isLoading: false
    })

    render(
      <OtpCodeField
        recordId="rec-1"
        otpPublic={{
          type: 'TOTP',
          digits: 6,
          period: 30,
          currentCode: '123456',
          timeRemaining: 20
        }}
      />
    )

    expect(screen.getByTestId('otp-label')).toHaveTextContent(
      'Authenticator Token'
    )
    expect(screen.getByTestId('otp-value')).toHaveTextContent('123 456')
    expect(screen.getByTestId('otp-progress-bar')).toHaveTextContent('20s')
    expect(screen.getByTestId('otp-copy-button')).toBeInTheDocument()
  })

  test('renders HOTP code with Next Code button', () => {
    useOtp.mockReturnValue({
      code: '111222',
      timeRemaining: null,
      type: 'HOTP',
      period: null,
      generateNext: mockGenerateNext,
      isLoading: false
    })

    render(
      <OtpCodeField
        recordId="rec-1"
        otpPublic={{
          type: 'HOTP',
          digits: 6,
          currentCode: '111222'
        }}
      />
    )

    expect(screen.getByTestId('otp-value')).toHaveTextContent('111 222')
    expect(screen.getByTestId('otp-next-code-button')).toHaveTextContent(
      'Next Code'
    )
    expect(screen.queryByTestId('otp-progress-bar')).not.toBeInTheDocument()
  })

  test('HOTP Next Code button calls generateNext', () => {
    useOtp.mockReturnValue({
      code: '111222',
      timeRemaining: null,
      type: 'HOTP',
      period: null,
      generateNext: mockGenerateNext,
      isLoading: false
    })

    render(
      <OtpCodeField
        recordId="rec-1"
        otpPublic={{
          type: 'HOTP',
          digits: 6,
          currentCode: '111222'
        }}
      />
    )

    fireEvent.click(screen.getByTestId('otp-next-code-button'))
    expect(mockGenerateNext).toHaveBeenCalledTimes(1)
  })

  test('formats codes with odd digit count correctly', () => {
    useOtp.mockReturnValue({
      code: '1234567',
      timeRemaining: 20,
      type: 'TOTP',
      period: 30,
      generateNext: null,
      isLoading: false
    })

    render(
      <OtpCodeField
        recordId="rec-1"
        otpPublic={{
          type: 'TOTP',
          digits: 7,
          period: 30,
          currentCode: '1234567',
          timeRemaining: 20
        }}
      />
    )

    // 7 digits: mid = 4, so "1234 567"
    expect(screen.getByTestId('otp-value')).toHaveTextContent('1234 567')
  })
})
