import { useEffect, useRef, useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { useOtp } from '../../hooks/useOtp'
import { InputField, LockIcon } from '../../lib-react-components'
import { CopyButton } from '../CopyButton'
import { getTimerUrgency } from './constants'
import {
  NextCodeButton,
  OtpFieldContainer,
  ProgressBarFill,
  ProgressBarTimer,
  ProgressBarTrack,
  ProgressBarWrapper
} from './styles'

/**
 * Formats OTP code with space in the middle
 * @param {string | null} code
 * @returns {string}
 */
const formatCode = (code) => {
  if (!code) return ''
  const mid = Math.ceil(code.length / 2)
  return code.slice(0, mid) + ' ' + code.slice(mid)
}

/**
 * Displays a live OTP code inline in the login record detail view.
 * For TOTP: auto-refreshing code with countdown timer.
 * For HOTP: "Next Code" button to increment counter.
 *
 * @param {{
 *   recordId: string,
 *   otpPublic: {
 *     type: 'TOTP' | 'HOTP',
 *     digits: number,
 *     period?: number,
 *     issuer?: string,
 *     label?: string,
 *     currentCode: string | null,
 *     timeRemaining?: number | null
 *   },
 *   testId?: string
 * }} props
 */
export const OtpCodeField = ({ recordId, otpPublic, testId }) => {
  const { i18n } = useLingui()
  const { code, timeRemaining, type, period, generateNext, isLoading } = useOtp(
    {
      recordId,
      otpPublic
    }
  )

  const prevTimeRef = useRef(null)
  const noTransitionRef = useRef(true)
  const rafRef = useRef(null)
  const [, forceUpdate] = useState(0)

  // Skip transition on jumps (reset or stale→real), but not on normal -1 ticks
  // or same-value re-renders (from forceUpdate)
  const timeDiff =
    prevTimeRef.current !== null && timeRemaining !== null
      ? Math.abs(prevTimeRef.current - timeRemaining)
      : null
  if (timeDiff !== null && timeDiff > 1) {
    noTransitionRef.current = true
  }
  prevTimeRef.current = timeRemaining

  // Two-phase render: first paint at exact position (no transition),
  // then enable transition to target-1 position
  useEffect(() => {
    if (!noTransitionRef.current || timeRemaining === null) return

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        noTransitionRef.current = false
        forceUpdate((v) => v + 1)
      })
    })

    return () => cancelAnimationFrame(rafRef.current)
  })

  const formattedCode = formatCode(code)
  const urgency = getTimerUrgency(timeRemaining, period)

  const noTransition = noTransitionRef.current
  // When noTransition: show exact position; otherwise target one second ahead
  const progress =
    type === 'TOTP' && timeRemaining !== null && period
      ? (Math.max(0, noTransition ? timeRemaining : timeRemaining - 1) /
          period) *
        100
      : 0

  const isTOTP = type === 'TOTP'
  const hasTimeData = isTOTP && timeRemaining !== null

  return html`
    <${isTOTP ? OtpFieldContainer : 'div'}>
      <${InputField}
        testId=${testId || 'otp-code-field'}
        label=${i18n._('Authenticator Token')}
        value=${formattedCode}
        variant="outline"
        icon=${LockIcon}
        isDisabled
        additionalItems=${html`
          ${type === 'HOTP' &&
          generateNext &&
          html`
            <${NextCodeButton}
              onClick=${generateNext}
              disabled=${isLoading}
              data-testid="otp-next-code-button"
            >
              ${i18n._('Next Code')}
            <//>
          `}
          <${CopyButton} value=${code} testId="otp-copy-button" />
        `}
      />
      ${isTOTP &&
      html`
        <${ProgressBarWrapper}
          style=${{ visibility: hasTimeData ? 'visible' : 'hidden' }}
        >
          <${ProgressBarTrack}>
            <${ProgressBarFill}
              $progress=${progress}
              $urgency=${urgency}
              $noTransition=${noTransition}
            />
          <//>
          <${ProgressBarTimer} $urgency=${urgency}> ${timeRemaining}s <//>
        <//>
      `}
    <//>
  `
}
