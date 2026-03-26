import React from 'react'

import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

import { TimerBar } from './index'

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
    track: {},
    fill: {},
    timer: {}
  }
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

  test('renders timer text with timeRemaining', () => {
    const { container } = render(<TimerBar timeRemaining={15} period={30} />)

    expect(container.querySelector('span')).toHaveTextContent('15s')
  })

  test('sets progress to 0 when timeRemaining is null', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 0
    })

    const { container } = render(<TimerBar timeRemaining={null} period={30} />)

    const fill = container.querySelectorAll('div')[2]
    expect(fill.style.width).toBe('0%')
  })

  test('sets progress to 0 when period is 0', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: false,
      expiring: false,
      targetTime: 10
    })

    const { container } = render(<TimerBar timeRemaining={10} period={0} />)

    const fill = container.querySelectorAll('div')[2]
    expect(fill.style.width).toBe('0%')
  })

  test('applies noTransition style when set', () => {
    mockUseTimerAnimation.mockReturnValue({
      noTransition: true,
      expiring: false,
      targetTime: 30
    })

    const { container } = render(<TimerBar timeRemaining={30} period={30} />)

    const fill = container.querySelectorAll('div')[2]
    expect(fill.style.transition).toBe('none')
  })

  test('applies linear transition when noTransition is false', () => {
    const { container } = render(<TimerBar timeRemaining={20} period={30} />)

    const fill = container.querySelectorAll('div')[2]
    expect(fill.style.transition).toBe('width 1s linear')
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
