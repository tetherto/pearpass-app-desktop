import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { OtpCodeField } from './index'

const mockGenerateNext = jest.fn()

jest.mock('../../hooks/useOtp', () => ({
  useOtp: jest.fn()
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
  InputField: ({ label, value, additionalItems, testId }) => (
    <div data-testid={testId}>
      <span data-testid="otp-label">{label}</span>
      <span data-testid="otp-value">{value}</span>
      <div data-testid="otp-additional">{additionalItems}</div>
    </div>
  ),
  LockIcon: () => <span>LockIcon</span>
}))

jest.mock('./styles', () => ({
  TimerWrapper: ({ children, $urgency }) => (
    <span data-testid="otp-timer" data-urgency={$urgency}>
      {children}
    </span>
  ),
  NextCodeButton: ({ children, onClick, disabled, ...rest }) => (
    <button
      data-testid={rest['data-testid']}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}))

const { TIMER_URGENCY } = require('./constants')
const { useOtp } = require('../../hooks/useOtp')

describe('OtpCodeField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders TOTP code with timer', () => {
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
    expect(screen.getByTestId('otp-timer')).toHaveTextContent('20s')
    expect(screen.getByTestId('otp-copy-button')).toBeInTheDocument()
  })

  test('TOTP timer shows correct urgency levels', () => {
    useOtp.mockReturnValue({
      code: '123456',
      timeRemaining: 5,
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
          timeRemaining: 5
        }}
      />
    )

    expect(screen.getByTestId('otp-timer')).toHaveAttribute(
      'data-urgency',
      TIMER_URGENCY.CRITICAL
    )
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
    expect(screen.queryByTestId('otp-timer')).not.toBeInTheDocument()
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
