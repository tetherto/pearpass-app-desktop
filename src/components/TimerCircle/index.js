import { html } from 'htm/react'

import { CircleBg, CircleFill, Svg, Wrapper } from './styles'
import { useTimerAnimation } from '../../hooks/useTimerAnimation'

const CIRCUMFERENCE = 2 * Math.PI * 5.5 // radius=5.5, ~34.558

/**
 * @param {{
 *   timeRemaining: number | null,
 *   period: number,
 *   animated?: boolean
 * }} props
 */
export const TimerCircle = ({ timeRemaining, period, animated = true }) => {
  const { noTransition, urgency, targetTime } = useTimerAnimation(
    timeRemaining,
    period,
    animated
  )

  const dashOffset =
    timeRemaining !== null ? (1 - targetTime / period) * CIRCUMFERENCE : 0

  return html`
    <${Wrapper}>
      <${Svg} viewBox="0 0 14 14">
        <${CircleBg} cx="7" cy="7" r="5.5" />
        <${CircleFill}
          cx="7"
          cy="7"
          r="5.5"
          $urgency=${urgency}
          $dashOffset=${dashOffset}
          $noTransition=${noTransition}
        />
      <//>
    <//>
  `
}
