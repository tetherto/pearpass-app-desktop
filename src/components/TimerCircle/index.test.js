import React from 'react'

import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'pearpass-lib-ui-theme-provider'
import '@testing-library/jest-dom'

import { TimerCircle } from './index'

const mockUseTimerAnimation = jest.fn()

jest.mock('pearpass-lib-vault', () => ({
  useTimerAnimation: (...args) => mockUseTimerAnimation(...args)
}))

jest.mock('./styles', () => ({
  Wrapper: ({ children }) => <div data-testid="wrapper">{children}</div>,
  Svg: ({ children, ...props }) => (
    <svg data-testid="svg" {...props}>
      {children}
    </svg>
  ),
  CircleBg: (props) => <circle data-testid="circle-bg" {...props} />,
  CircleFill: (props) => (
    <circle
      data-testid="circle-fill"
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      data-expiring={props.$expiring}
      data-dash-offset={props.$dashOffset}
      data-no-transition={props.$noTransition}
    />
  )
}))

const CIRCUMFERENCE = 2 * Math.PI * 5.5

describe('TimerCircle', () => {
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
        <TimerCircle timeRemaining={20} period={30} />
      </ThemeProvider>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders svg with correct viewBox', () => {
    render(<TimerCircle timeRemaining={20} period={30} />)

    expect(screen.getByTestId('svg')).toHaveAttribute('viewBox', '0 0 14 14')
  })

  test('renders background and fill circles with correct attributes', () => {
    render(<TimerCircle timeRemaining={20} period={30} />)

    const bg = screen.getByTestId('circle-bg')
    expect(bg).toHaveAttribute('cx', '7')
    expect(bg).toHaveAttribute('cy', '7')
    expect(bg).toHaveAttribute('r', '5.5')

    const fill = screen.getByTestId('circle-fill')
    expect(fill).toHaveAttribute('cx', '7')
    expect(fill).toHaveAttribute('cy', '7')
    expect(fill).toHaveAttribute('r', '5.5')
  })

  test('computes dashOffset from targetTime and period', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 15
    })

    render(<TimerCircle timeRemaining={15} period={30} />)

    const fill = screen.getByTestId('circle-fill')
    const expectedOffset = (1 - 15 / 30) * CIRCUMFERENCE
    expect(fill).toHaveAttribute('data-dash-offset', String(expectedOffset))
  })

  test('sets dashOffset to 0 when timeRemaining is null', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 0
    })

    render(<TimerCircle timeRemaining={null} period={30} />)

    const fill = screen.getByTestId('circle-fill')
    expect(fill).toHaveAttribute('data-dash-offset', '0')
  })

  test('passes expiring flag to CircleFill', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: true,
      targetTime: 3
    })

    render(<TimerCircle timeRemaining={3} period={30} />)

    const fill = screen.getByTestId('circle-fill')
    expect(fill).toHaveAttribute('data-expiring', 'true')
  })

  test('passes noTransition flag to CircleFill', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: true,
      expiring: false,
      targetTime: 30
    })

    render(<TimerCircle timeRemaining={30} period={30} />)

    const fill = screen.getByTestId('circle-fill')
    expect(fill).toHaveAttribute('data-no-transition', 'true')
  })

  test('passes animated prop to useTimerAnimation', () => {
    render(<TimerCircle timeRemaining={20} period={30} animated={false} />)

    expect(mockUseTimerAnimation).toHaveBeenCalledWith(20, 30, false)
  })

  test('defaults animated to true', () => {
    render(<TimerCircle timeRemaining={20} period={30} />)

    expect(mockUseTimerAnimation).toHaveBeenCalledWith(20, 30, true)
  })
})
