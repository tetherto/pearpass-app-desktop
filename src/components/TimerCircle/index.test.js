import React from 'react'

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TimerCircle } from './index'

const mockUseTimerAnimation = jest.fn()

jest.mock('@tetherto/pearpass-lib-vault', () => ({
  useTimerAnimation: (...args) => mockUseTimerAnimation(...args)
}))

jest.mock('../OtpCodeField/utils', () => ({
  getTimerColor: (expiring) => (expiring ? '#red' : '#green')
}))

jest.mock('./styles', () => ({
  styles: {
    wrapper: {},
    svg: {},
    circleBg: {}
  }
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

  test('renders svg with correct viewBox', () => {
    const { container } = render(<TimerCircle timeRemaining={20} period={30} />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 14 14')
  })

  test('renders two circles', () => {
    const { container } = render(<TimerCircle timeRemaining={20} period={30} />)

    const circles = container.querySelectorAll('circle')
    expect(circles).toHaveLength(2)
  })

  test('computes dashOffset from targetTime and period', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 15
    })

    const { container } = render(<TimerCircle timeRemaining={15} period={30} />)

    const fillCircle = container.querySelectorAll('circle')[1]
    const expectedOffset = (1 - 15 / 30) * CIRCUMFERENCE
    expect(fillCircle).toHaveAttribute(
      'stroke-dashoffset',
      String(expectedOffset)
    )
  })

  test('sets dashOffset to 0 when timeRemaining is null', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 0
    })

    const { container } = render(
      <TimerCircle timeRemaining={null} period={30} />
    )

    const fillCircle = container.querySelectorAll('circle')[1]
    expect(fillCircle).toHaveAttribute('stroke-dashoffset', '0')
  })

  test('applies noTransition style', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: true,
      expiring: false,
      targetTime: 30
    })

    const { container } = render(<TimerCircle timeRemaining={30} period={30} />)

    const fillCircle = container.querySelectorAll('circle')[1]
    expect(fillCircle.style.transition).toBe('none')
  })

  test('applies linear transition when noTransition is false', () => {
    const { container } = render(<TimerCircle timeRemaining={20} period={30} />)

    const fillCircle = container.querySelectorAll('circle')[1]
    expect(fillCircle.style.transition).toBe('stroke-dashoffset 1s linear')
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
