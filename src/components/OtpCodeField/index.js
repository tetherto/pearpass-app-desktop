import { useLingui } from '@lingui/react'
import { html } from 'htm/react'

import { useOtp } from '../../hooks/useOtp'
import { InputField, LockIcon } from '../../lib-react-components'
import { CopyButton } from '../CopyButton'
import { ProgressBar } from '../ProgressBar'
import { NextCodeButton, OtpFieldContainer } from './styles'

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

  const formattedCode = formatCode(code)
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
        <div style=${{ visibility: hasTimeData ? 'visible' : 'hidden' }}>
          <${ProgressBar} timeRemaining=${timeRemaining} period=${period} />
        </div>
      `}
    <//>
  `
}
