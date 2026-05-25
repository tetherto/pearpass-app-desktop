/// <reference types="@testing-library/jest-dom" />

import React from 'react'

import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'

import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { LockedScreen } from './LockedScreen'

;(globalThis as { React?: typeof React }).React = React

type MasterPasswordLockStatus = {
  isLocked?: boolean
  lockoutRemainingMs?: number
}

const mockNavigate = jest.fn()
jest.mock('../../../context/RouterContext', () => ({
  useRouter: () => ({ navigate: mockNavigate })
}))

jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../../../components/OnboardingShell', () => ({
  OnboardingShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="onboarding-shell-mock">{children}</div>
  )
}))

const mockRefreshMasterPasswordStatus = jest.fn<
  () => Promise<MasterPasswordLockStatus | undefined>
>()

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useUserData: () => ({
    refreshMasterPasswordStatus: mockRefreshMasterPasswordStatus
  })
}))

jest.mock('@tetherto/pearpass-lib-ui-kit', () => {
  const actual = jest.requireActual<
    typeof import('@tetherto/pearpass-lib-ui-kit')
  >('@tetherto/pearpass-lib-ui-kit')

  return {
    ...actual,
    useTheme: () => ({
      theme: {
        colors: {
          colorTextSecondary: '#BDC3AC',
          colorBorderPrimary: '#212814',
          colorPrimary: '#B0D944'
        }
      }
    }),
    PageHeader: ({
      title,
      testID
    }: {
      title: React.ReactNode
      testID?: string
    }) => <h1 data-testid={testID}>{title}</h1>
  }
})

jest.mock('@tetherto/pearpass-lib-ui-kit/icons', () => ({
  WatchLater: () => <span data-testid="icon-watch-later" />
}))

const mockUseCountDown = jest.fn(
  (_opts: { initialSeconds: number; onFinish: () => void | Promise<void> }) =>
    '00:42'
)

jest.mock('@tetherto/pear-apps-lib-ui-react-hooks', () => ({
  useCountDown: (opts: {
    initialSeconds: number
    onFinish: () => void | Promise<void>
  }) => mockUseCountDown(opts)
}))

describe('LockedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCountDown.mockImplementation(() => '00:42')
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: true,
      lockoutRemainingMs: 60_000
    })
  })

  it('renders headline, description, try-again label, and shell', async () => {
    render(<LockedScreen />)

    expect(screen.getByTestId('locked-screen')).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-shell-mock')).toBeInTheDocument()
    expect(screen.getByTestId('locked-screen-headline').textContent).toBe(
      'PearPass locked'
    )
    expect(screen.getByTestId('locked-screen-desc-line1').textContent).toBe(
      'Too many failed attempts.'
    )
    expect(screen.getByTestId('locked-screen-desc-line2').textContent).toBe(
      'For your security, access is temporarily locked.'
    )
    expect(screen.getByTestId('locked-screen-try-label').textContent).toBe(
      'Try again in'
    )

    await waitFor(() => {
      expect(mockRefreshMasterPasswordStatus).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByTestId('locked-screen-countdown')).toBeInTheDocument()
    })
  })

  it('shows countdown placeholder until status resolves with remaining lockout', async () => {
    let resolveStatus: (value: MasterPasswordLockStatus) => void = () => {}
    mockRefreshMasterPasswordStatus.mockImplementation(
      () =>
        new Promise<MasterPasswordLockStatus | undefined>((resolve) => {
          resolveStatus = resolve
        })
    )

    render(<LockedScreen />)

    expect(
      screen.getByTestId('locked-screen-countdown-placeholder')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('locked-screen-countdown')).not.toBeInTheDocument()

    act(() => {
      resolveStatus({ isLocked: true, lockoutRemainingMs: 30_000 })
    })

    await waitFor(() => {
      expect(screen.getByTestId('locked-screen-countdown')).toBeInTheDocument()
    })
  })

  it('shows live countdown when lockout remaining is positive after load', async () => {
    render(<LockedScreen />)

    await waitFor(() => {
      expect(screen.getByTestId('locked-screen-countdown')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('locked-screen-countdown-placeholder')).not.toBeInTheDocument()
    expect(screen.getByTestId('locked-screen-countdown').textContent).toBe(
      '00:42'
    )
  })

  it('passes ceil(seconds) from lockoutRemainingMs to useCountDown', async () => {
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: true,
      lockoutRemainingMs: 5500
    })

    render(<LockedScreen />)

    await waitFor(() => {
      expect(mockUseCountDown).toHaveBeenCalled()
    })

    expect(mockUseCountDown).toHaveBeenCalledWith(
      expect.objectContaining({ initialSeconds: 6 })
    )
  })

  it('refreshes status on mount', async () => {
    render(<LockedScreen />)

    await waitFor(() => {
      expect(mockRefreshMasterPasswordStatus).toHaveBeenCalledTimes(1)
    })
  })

  it('navigates to master password when countdown finishes and vault reports unlocked', async () => {
    let onFinish: (() => void | Promise<void>) | undefined

    mockUseCountDown.mockImplementation(
      (opts: { initialSeconds: number; onFinish: () => void | Promise<void> }) => {
        onFinish = opts.onFinish
        return '00:01'
      }
    )

    mockRefreshMasterPasswordStatus
      .mockResolvedValueOnce({
        isLocked: true,
        lockoutRemainingMs: 1000
      })
      .mockResolvedValueOnce({ isLocked: false })

    render(<LockedScreen />)

    await waitFor(() => {
      expect(onFinish).toBeDefined()
    })

    await act(async () => {
      await onFinish?.()
    })

    expect(mockRefreshMasterPasswordStatus).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledWith('welcome', {
      state: NAVIGATION_ROUTES.MASTER_PASSWORD
    })
  })

  it('does not navigate when status is still locked after countdown callback', async () => {
    let onFinish: (() => void | Promise<void>) | undefined

    mockUseCountDown.mockImplementation(
      (opts: { initialSeconds: number; onFinish: () => void | Promise<void> }) => {
        onFinish = opts.onFinish
        return '00:01'
      }
    )

    mockRefreshMasterPasswordStatus
      .mockResolvedValueOnce({
        isLocked: true,
        lockoutRemainingMs: 1000
      })
      .mockResolvedValueOnce({ isLocked: true })

    render(<LockedScreen />)

    await waitFor(() => {
      expect(onFinish).toBeDefined()
    })

    await act(async () => {
      await onFinish?.()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('keeps placeholder when lockout remaining rounds to zero seconds', async () => {
    mockRefreshMasterPasswordStatus.mockResolvedValue({
      isLocked: true,
      lockoutRemainingMs: 0
    })

    render(<LockedScreen />)

    await waitFor(() => {
      expect(mockRefreshMasterPasswordStatus).toHaveBeenCalled()
    })

    expect(
      screen.getByTestId('locked-screen-countdown-placeholder')
    ).toBeInTheDocument()
    expect(mockUseCountDown).not.toHaveBeenCalled()
  })
})
