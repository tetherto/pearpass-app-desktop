import React from 'react'

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

const mockGenerateNext = jest.fn()
const mockUseOtp = jest.fn()
const mockCopyToClipboard = jest.fn()

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useOtp: (...args: unknown[]) => mockUseOtp(...args),
  formatOtpCode: (code: string | null) => {
    if (!code) return ''
    const mid = Math.ceil(code.length / 2)
    return code.slice(0, mid) + ' ' + code.slice(mid)
  },
  OTP_TYPE: { TOTP: 'TOTP', HOTP: 'HOTP' },
  useTimerAnimation: (timeRemaining: number | null, period: number) => ({
    noTransition: false,
    expiring: timeRemaining !== null && timeRemaining <= 5,
    targetTime: timeRemaining ?? period
  })
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    i18n: { _: (msg: string) => msg }
  })
}))

jest.mock('../../hooks/useCopyToClipboard.electron', () => ({
  useCopyToClipboard: () => ({
    copyToClipboard: mockCopyToClipboard
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'data-testid': testId,
    'aria-label': ariaLabel,
    iconBefore
  }: {
    children?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    'data-testid'?: string
    'aria-label'?: string
    iconBefore?: React.ReactNode
  }) => (
    <button
      type="button"
      data-testid={testId}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {iconBefore}
      {children}
    </button>
  ),
  Text: ({
    children,
    color
  }: {
    children?: React.ReactNode
    color?: string
  }) => <span data-color={color}>{children}</span>,
  useTheme: () => ({
    theme: {
      colors: {
        colorTextPrimary: '#fff',
        colorTextSecondary: '#aaa',
        colorTextDestructive: '#f00',
        colorPrimary: '#0f0',
        colorBorderPrimary: '#333',
        colorSurfacePrimary: '#000'
      }
    }
  }),
  rawTokens: {
    spacing2: 2,
    spacing8: 8,
    spacing12: 12,
    radius8: 8
  }
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  ContentCopy: () => <span data-testid="content-copy-icon" />
}))

import { OtpCodeField } from './index'

const useOtp = mockUseOtp

describe('OtpCodeField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders TOTP code with timer and copy button', () => {
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
        otpPublic={
          {
            type: 'TOTP',
            digits: 6,
            period: 30,
            currentCode: '123456',
            timeRemaining: 20
          } as Parameters<typeof OtpCodeField>[0]['otpPublic']
        }
      />
    )

    expect(screen.getByText('Authenticator Token')).toBeInTheDocument()
    expect(screen.getByText('123 456')).toBeInTheDocument()
    expect(screen.getByText('20s')).toBeInTheDocument()
    expect(screen.getByTestId('otp-code-field-copy')).toBeInTheDocument()
    expect(
      screen.queryByTestId('otp-code-field-next-code')
    ).not.toBeInTheDocument()
  })

  test('copy button calls copyToClipboard with the code', () => {
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
        otpPublic={
          {
            type: 'TOTP',
            digits: 6,
            period: 30,
            currentCode: '123456',
            timeRemaining: 20
          } as Parameters<typeof OtpCodeField>[0]['otpPublic']
        }
      />
    )

    fireEvent.click(screen.getByTestId('otp-code-field-copy'))
    expect(mockCopyToClipboard).toHaveBeenCalledWith('123456')
  })

  test('renders HOTP code with Next Code button (no timer)', () => {
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
        otpPublic={
          {
            type: 'HOTP',
            digits: 6,
            currentCode: '111222'
          } as Parameters<typeof OtpCodeField>[0]['otpPublic']
        }
      />
    )

    expect(screen.getByText('111 222')).toBeInTheDocument()
    expect(
      screen.getByTestId('otp-code-field-next-code').textContent
    ).toContain('Next Code')
    expect(screen.queryByText(/s$/)).not.toBeInTheDocument()
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
        otpPublic={
          {
            type: 'HOTP',
            digits: 6,
            currentCode: '111222'
          } as Parameters<typeof OtpCodeField>[0]['otpPublic']
        }
      />
    )

    fireEvent.click(screen.getByTestId('otp-code-field-next-code'))
    expect(mockGenerateNext).toHaveBeenCalledTimes(1)
  })
})
