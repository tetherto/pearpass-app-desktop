import { html } from 'htm/react'
import { useTimerAnimation } from '@tetherto/pearpass-lib-vault'

import { getTimerColor } from '../OtpCodeField/utils'
import { styles } from './styles'

interface TimerBarProps {
  timeRemaining: number | null
  period: number
  animated?: boolean
}

export const TimerBar = ({ timeRemaining, period, animated = true }: TimerBarProps) => {
  const { noTransition, expiring, targetTime } = useTimerAnimation(
    timeRemaining,
    period,
    animated
  )

  const progress =
    timeRemaining !== null && period ? (targetTime / period) * 100 : 0

  const color = getTimerColor(expiring)

  return html`
    <div style=${styles.wrapper}>
      <div style=${styles.track}>
        <div
          style=${{
            ...styles.fill,
            background: color,
            width: `${progress}%`,
            transition: noTransition ? 'none' : 'width 1s linear'
          }}
        />
      </div>
      <span style=${{ ...styles.timer, color }}>
        ${timeRemaining}s
      </span>
    </div>
  `
}
