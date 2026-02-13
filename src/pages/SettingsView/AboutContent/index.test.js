import React from 'react'

import '@testing-library/jest-dom'
import { render, fireEvent, act } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'

import { AboutContent } from './index'

jest.useFakeTimers()

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ version: '1.0.0' })
  })
)

const mockSetToast = jest.fn()
const mockUseGlobalLoading = jest.fn()
let mockIsOnlineValue = true

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str) => str
  })
}))

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    setToast: mockSetToast
  })
}))

jest.mock('../../../context/LoadingContext', () => ({
  useGlobalLoading: (args) => mockUseGlobalLoading(args)
}))

jest.mock('../../../utils/isOnline', () => ({
  isOnline: () => mockIsOnlineValue
}))

const mockSendSlackFeedback = jest.fn()
const mockSendGoogleFormFeedback = jest.fn()

jest.mock('pear-apps-lib-feedback', () => ({
  sendGoogleFormFeedback: (...args) => mockSendGoogleFormFeedback(...args),
  sendSlackFeedback: (...args) => mockSendSlackFeedback(...args)
}))

jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

jest.mock('../SettingsTab/SettingsReportSection', () => ({
  SettingsReportSection: ({
    onSubmitReport,
    message,
    title,
    buttonText,
    textAreaPlaceholder,
    textAreaOnChange
  }) => (
    <div>
      <h1 data-testid="report-title">{title}</h1>
      <textarea
        data-testid="report-textarea"
        placeholder={textAreaPlaceholder}
        value={message}
        onChange={(e) => textAreaOnChange(e.target.value)}
      />
      <button data-testid="report-submit" onClick={onSubmitReport}>
        {buttonText}
      </button>
    </div>
  )
}))

const renderWithProviders = () =>
  render(
    <ThemeProvider>
      <AboutContent />
    </ThemeProvider>
  )

describe('AboutContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsOnlineValue = true
    mockSendSlackFeedback.mockResolvedValue(undefined)
    mockSendGoogleFormFeedback.mockResolvedValue(undefined)
  })

  it('renders basic layout', () => {
    const { getByTestId } = renderWithProviders()

    expect(getByTestId('report-title')).toHaveTextContent('Report a problem')
  })

  it('does not send feedback when message is empty', async () => {
    const { getByTestId } = renderWithProviders()

    const submitButton = getByTestId('report-submit')

    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(mockSendSlackFeedback).not.toHaveBeenCalled()
    expect(mockSendGoogleFormFeedback).not.toHaveBeenCalled()
    expect(mockSetToast).not.toHaveBeenCalled()
  })

  it('shows offline toast and does not send when offline', async () => {
    mockIsOnlineValue = false

    const { getByTestId } = renderWithProviders()

    const textarea = getByTestId('report-textarea')
    const submitButton = getByTestId('report-submit')

    fireEvent.change(textarea, { target: { value: 'Some feedback' } })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(mockSendSlackFeedback).not.toHaveBeenCalled()
    expect(mockSendGoogleFormFeedback).not.toHaveBeenCalled()
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'You are offline, please check your internet connection'
    })
  })

  it('sends feedback and shows success toast when online', async () => {
    mockIsOnlineValue = true

    const { getByTestId } = renderWithProviders()

    const textarea = getByTestId('report-textarea')
    const submitButton = getByTestId('report-submit')

    fireEvent.change(textarea, { target: { value: 'Some feedback' } })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(mockSendSlackFeedback).toHaveBeenCalledTimes(1)
    expect(mockSendGoogleFormFeedback).toHaveBeenCalledTimes(1)

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'Feedback sent'
    })
  })

  it('shows offline timeout toast when connection drops during send', async () => {
    mockIsOnlineValue = true

    mockSendSlackFeedback.mockImplementation(
      () =>
        new Promise(() => {
          // never resolve to let the timeout win the race
        })
    )
    mockSendGoogleFormFeedback.mockImplementation(
      () =>
        new Promise(() => {
          // never resolve
        })
    )

    const { getByTestId } = renderWithProviders()

    const textarea = getByTestId('report-textarea')
    const submitButton = getByTestId('report-submit')

    fireEvent.change(textarea, { target: { value: 'Some feedback' } })

    await act(async () => {
      fireEvent.click(submitButton)
    })

    await act(async () => {
      mockIsOnlineValue = false
      jest.advanceTimersByTime(10000)
    })

    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'You are offline, please check your internet connection'
    })
  })
})
