import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { useOtp } from '../../hooks/useOtp'
import { InputField, LockIcon } from '../../lib-react-components'
import { CopyButton } from '../CopyButton'
import { TIMER_URGENCY } from './constants'
import { TimerWrapper, NextCodeButton } from './styles'

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
 * @param {number | null} timeRemaining
 * @param {number | null} period
 * @returns {string}
 */
const getTimerUrgency = (timeRemaining, period) => {
  if (timeRemaining === null || period === null) return TIMER_URGENCY.NORMAL
  const ratio = timeRemaining / period
  if (ratio <= 0.2) return TIMER_URGENCY.CRITICAL
  if (ratio <= 0.4) return TIMER_URGENCY.WARNING
  return TIMER_URGENCY.NORMAL
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

  const formattedCode = formatCode(code)
  const urgency = getTimerUrgency(timeRemaining, period)

  return html`
    <${InputField}
      testId=${testId || 'otp-code-field'}
      label=${i18n._('Authenticator Token')}
      value=${formattedCode}
      variant="outline"
      icon=${LockIcon}
      isDisabled
      additionalItems=${html`
        ${type === 'TOTP' &&
        timeRemaining !== null &&
        html` <${TimerWrapper} $urgency=${urgency}> ${timeRemaining}s <//> `}
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
  `
}
