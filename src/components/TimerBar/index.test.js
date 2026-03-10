import React from 'react'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import '@testing-library/jest-dom'

import { TimerBar } from './index'

const mockUseTimerAnimation = jest.fn()

jest.mock('pearpass-lib-vault', () => ({
  useTimerAnimation: (...args) => mockUseTimerAnimation(...args)
}))

jest.mock('./styles', () => ({
  Wrapper: ({ children }) => <div data-testid="wrapper">{children}</div>,
  Track: ({ children }) => <div data-testid="track">{children}</div>,
  Fill: (props) => (
    <div
      data-testid="fill"
      data-progress={props.$progress}
      data-expiring={props.$expiring}
      data-no-transition={props.$noTransition}
    />
  ),
  Timer: ({ children, $expiring }) => (
    <span data-testid="timer" data-expiring={$expiring}>
      {children}
    </span>
  )
}))

describe('TimerBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 20
    })
  })

  test('matches snapshot', () => {
    const { container } = render(
      <ThemeProvider>
        <TimerBar timeRemaining={20} period={30} />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders timer text with timeRemaining', () => {
    render(<TimerBar timeRemaining={15} period={30} />)

    expect(screen.getByTestId('timer')).toHaveTextContent('15s')
  })

  test('computes progress from targetTime and period', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 15
    })

    render(<TimerBar timeRemaining={15} period={30} />)

    const fill = screen.getByTestId('fill')
    expect(fill).toHaveAttribute('data-progress', '50')
  })

  test('sets progress to 0 when timeRemaining is null', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 0
    })

    render(<TimerBar timeRemaining={null} period={30} />)

    const fill = screen.getByTestId('fill')
    expect(fill).toHaveAttribute('data-progress', '0')
  })

  test('sets progress to 0 when period is 0', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 10
    })

    render(<TimerBar timeRemaining={10} period={0} />)

    const fill = screen.getByTestId('fill')
    expect(fill).toHaveAttribute('data-progress', '0')
  })

  test('passes expiring flag to styled components', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: true,
      targetTime: 3
    })

    render(<TimerBar timeRemaining={3} period={30} />)

    const fill = screen.getByTestId('fill')
    expect(fill).toHaveAttribute('data-expiring', 'true')

    const timer = screen.getByTestId('timer')
    expect(timer).toHaveAttribute('data-expiring', 'true')
  })

  test('passes noTransition flag to Fill', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: true,
      expiring: false,
      targetTime: 30
    })

    render(<TimerBar timeRemaining={30} period={30} />)

    const fill = screen.getByTestId('fill')
    expect(fill).toHaveAttribute('data-no-transition', 'true')
  })

  test('passes animated prop to useTimerAnimation', () => {
    render(<TimerBar timeRemaining={20} period={30} animated={false} />)

    expect(mockUseTimerAnimation).toHaveBeenCalledWith(20, 30, false)
  })

  test('defaults animated to true', () => {
    render(<TimerBar timeRemaining={20} period={30} />)

    expect(mockUseTimerAnimation).toHaveBeenCalledWith(20, 30, true)
  })
})
