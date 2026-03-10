import { html } from 'htm/react'
import { useTimerAnimation } from 'pearpass-lib-vault'

import { Fill, Timer, Track, Wrapper } from './styles'

/**
 * @param {{
 *   timeRemaining: number | null,
 *   period: number,
 *   animated?: boolean
 * }} props
 */
export const TimerBar = ({ timeRemaining, period, animated = true }) => {
  const { noTransition, expiring, targetTime } = useTimerAnimation(
    timeRemaining,
    period,
    animated
  )

  const progress =
    timeRemaining !== null && period ? (targetTime / period) * 100 : 0

  return html`
    <${Wrapper}>
      <${Track}>
        <${Fill}
          $progress=${progress}
          $expiring=${expiring}
          $noTransition=${noTransition}
        />
      <//>
      <${Timer} $expiring=${expiring}> ${timeRemaining}s <//>
    <//>
  `
}
