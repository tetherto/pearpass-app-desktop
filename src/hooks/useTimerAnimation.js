import { useEffect, useRef, useState } from 'react'

import { isExpiring } from '../components/OtpCodeField/constants'

/**
 * Two-phase render animation for OTP timers.
 * First paints at exact position (no transition), then enables
 * CSS transition to animate toward the next tick.
 *
 * @param {number | null} timeRemaining
 * @param {number} period
 * @param {boolean} [animated=true]
 * @returns {{ noTransition: boolean, expiring: boolean, targetTime: number }}
 */
export const useTimerAnimation = (timeRemaining, period, animated = true) => {
  const prevTimeRef = useRef(null)
  const noTransitionRef = useRef(true)
  const rafRef = useRef(null)
  const [, forceUpdate] = useState(0)

  const timeDiff =
    prevTimeRef.current !== null && timeRemaining !== null
      ? Math.abs(prevTimeRef.current - timeRemaining)
      : null
  if (timeDiff !== null && timeDiff > 1) {
    noTransitionRef.current = true
  }
  prevTimeRef.current = timeRemaining

  useEffect(() => {
    if (!animated || !noTransitionRef.current || timeRemaining === null) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        noTransitionRef.current = false
        forceUpdate((v) => v + 1)
      })
    })

    return () => cancelAnimationFrame(rafRef.current)
  })

  const noTransition = !animated || noTransitionRef.current
  const expiring = isExpiring(timeRemaining)
  const targetTime =
    timeRemaining !== null
      ? Math.max(0, noTransition ? timeRemaining : timeRemaining - 1)
      : 0

  return { noTransition, expiring, targetTime }
}
