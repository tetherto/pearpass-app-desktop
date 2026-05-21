import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

import { ReportAProblemContent } from './index'

const mockSetToast = jest.fn()
const mockUseGlobalLoading = jest.fn()
const mockSendSlack = jest.fn()
const mockSendGoogle = jest.fn()

let mockIsOnlineValue = true

jest.mock('../../../../context/LoadingContext', () => ({
  useGlobalLoading: (args: { isLoading: boolean }) => mockUseGlobalLoading(args)
}))

jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({ setToast: mockSetToast })
}))

jest.mock('../../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../../utils/isOnline', () => ({
  isOnline: () => mockIsOnlineValue
}))

jest.mock('../../../../utils/logger', () => ({
  logger: { error: jest.fn() }
}))

jest.mock('@tetherto/pear-apps-lib-feedback', () => ({
  sendSlackFeedback: (config: unknown) => mockSendSlack(config),
  sendGoogleFormFeedback: (config: unknown) => mockSendGoogle(config)
}))

jest.mock('./styles', () => ({
  createStyles: () => ({
    root: {},
    actions: {}
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  Send: () => null
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => ({
  Form: ({
    children,
    testID,
    'aria-label': ariaLabel
  }: {
    children: React.ReactNode
    testID?: string
    'aria-label'?: string
  }) => (
    <div data-testid={testID} aria-label={ariaLabel}>
      {children}
    </div>
  ),
  PageHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="settings-report-page-header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  ),
  TextArea: ({
    testID,
    label,
    placeholder,
    value,
    onChange,
    disabled,
    rows: _r
  }: {
    testID: string
    label?: string
    placeholder?: string
    value: string
    onChange?: (v: string) => void
    disabled?: boolean
    rows?: number
  }) => (
    <div>
      {label ? <span>{label}</span> : null}
      <textarea
        data-testid={testID}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
  Button: ({
    children,
    onClick,
    'data-testid': dataTestid,
    disabled,
    iconBefore: _i
  }: {
    children: React.ReactNode
    onClick?: () => void
    'data-testid'?: string
    disabled?: boolean
    iconBefore?: React.ReactNode
  }) => (
    <button
      type="button"
      data-testid={dataTestid}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}))

const TEST_IDS = {
  root: 'settings-card-report',
  textarea: 'settings-report-textarea',
  send: 'settings-report-send-button'
} as const

describe('ReportAProblemContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsOnlineValue = true
    mockSendSlack.mockImplementation(() => Promise.resolve(true))
    mockSendGoogle.mockImplementation(() => Promise.resolve(true))
  })

  it('renders header, form, and empty message; send is disabled', () => {
    render(<ReportAProblemContent currentVersion="1.0.0" />)

    expect(screen.getByTestId(TEST_IDS.root)).toBeInTheDocument()
    expect(
      screen.getByTestId('settings-report-page-header').textContent
    ).toContain('Report a problem')
    expect(screen.getByTestId('settings-report-problem-form')).toBeInTheDocument()
    expect(screen.getByTestId(TEST_IDS.textarea)).toHaveValue('')
    expect(screen.getByTestId(TEST_IDS.send)).toBeDisabled()
  })

  it('enables send when the message is non-empty', () => {
    render(<ReportAProblemContent currentVersion="1.0.0" />)

    const ta = screen.getByTestId(TEST_IDS.textarea)
    fireEvent.change(ta, { target: { value: '  Bug text  ' } })

    expect(screen.getByTestId(TEST_IDS.send)).not.toBeDisabled()
  })

  it('submits feedback when online, then shows success and clears the field', async () => {
    render(<ReportAProblemContent currentVersion="1.0.0" />)

    fireEvent.change(screen.getByTestId(TEST_IDS.textarea), {
      target: { value: 'The app froze' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_IDS.send))
    })

    await waitFor(() => {
      expect(mockSendSlack).toHaveBeenCalledTimes(1)
      expect(mockSendGoogle).toHaveBeenCalledTimes(1)
    })

    const slackArg = mockSendSlack.mock.calls[0][0] as { message: string; topic: string; app: string; appVersion?: string }
    expect(slackArg.message).toBe('The app froze')
    expect(slackArg.topic).toBe('BUG_REPORT')
    expect(slackArg.app).toBe('DESKTOP')
    expect(slackArg.appVersion).toBe('1.0.0')

    await waitFor(() => {
      expect(mockSetToast).toHaveBeenCalledWith({ message: 'Feedback sent' })
    })
    expect(screen.getByTestId(TEST_IDS.textarea)).toHaveValue('')
  })

  it('shows offline toast and does not send when offline', async () => {
    mockIsOnlineValue = false

    render(<ReportAProblemContent currentVersion="1.0.0" />)

    fireEvent.change(screen.getByTestId(TEST_IDS.textarea), {
      target: { value: 'Something' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_IDS.send))
    })

    expect(mockSendSlack).not.toHaveBeenCalled()
    expect(mockSendGoogle).not.toHaveBeenCalled()
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'You are offline, please check your internet connection'
    })
  })

  it('uses no appVersion in payload when currentVersion is empty', async () => {
    render(<ReportAProblemContent currentVersion="" />)

    fireEvent.change(screen.getByTestId(TEST_IDS.textarea), {
      target: { value: 'x' }
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId(TEST_IDS.send))
    })

    await waitFor(() => {
      expect(mockSendSlack).toHaveBeenCalled()
    })
    const slackArg = mockSendSlack.mock.calls[0][0] as { appVersion?: string }
    expect(slackArg.appVersion).toBeUndefined()
  })
})
