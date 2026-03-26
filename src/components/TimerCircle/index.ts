import { html } from 'htm/react'
import { useTimerAnimation } from '@tetherto/pearpass-lib-vault'

import { getTimerColor } from '../OtpCodeField/utils'
import { styles } from './styles'

const SIZE = 14
const RADIUS = 5.5
const STROKE_WIDTH = 1.5
const CENTER = SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface TimerCircleProps {
  timeRemaining: number | null
  period: number
  animated?: boolean
}

export const TimerCircle = ({ timeRemaining, period, animated = true }: TimerCircleProps) => {
  const { noTransition, expiring, targetTime } = useTimerAnimation(
    timeRemaining,
    period,
    animated
  )

  const dashOffset =
    timeRemaining !== null ? (1 - targetTime / period) * CIRCUMFERENCE : 0

  const color = getTimerColor(expiring)

  return html`
    <div style=${styles.wrapper}>
      <svg
        width=${SIZE}
        height=${SIZE}
        viewBox="0 0 ${SIZE} ${SIZE}"
        style=${styles.svg}
      >
        <circle
          cx=${CENTER}
          cy=${CENTER}
          r=${RADIUS}
          style=${styles.circleBg}
        />
        <circle
          cx=${CENTER}
          cy=${CENTER}
          r=${RADIUS}
          fill="none"
          stroke=${color}
          strokeWidth=${STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray=${CIRCUMFERENCE}
          strokeDashoffset=${dashOffset}
          style=${{ transition: noTransition ? 'none' : 'stroke-dashoffset 1s linear' }}
        />
      </svg>
    </div>
  `
}
