import { useState } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useOtp, formatOtpCode, OTP_TYPE } from 'pearpass-lib-vault'

import { InputField, LockIcon } from '../../lib-react-components'
import { CopyButton } from '../CopyButton'
import { TimerBar } from '../TimerBar'
import { styles } from './styles'

interface OtpPublic {
  type: 'TOTP' | 'HOTP'
  digits: number
  period?: number
  issuer?: string
  label?: string
  currentCode: string | null
  timeRemaining?: number | null
}

interface OtpCodeFieldProps {
  recordId: string
  otpPublic: OtpPublic
  testId?: string
}

export const OtpCodeField = ({ recordId, otpPublic, testId }: OtpCodeFieldProps) => {
  const { i18n } = useLingui()
  const [isHovered, setIsHovered] = useState(false)
  const { code, timeRemaining, type, period, generateNext, isLoading } = useOtp(
    {
      recordId,
      otpPublic
    }
  )

  const formattedCode = formatOtpCode(code)
  const isTOTP = type === OTP_TYPE.TOTP
  const hasTimeData = isTOTP && timeRemaining !== null

  const timerBar = isTOTP
    ? html`
        <div style=${{ visibility: hasTimeData ? 'visible' : 'hidden', width: '100%' }}>
          <${TimerBar} timeRemaining=${timeRemaining} period=${period} />
        </div>
      `
    : null

  const nextCodeButtonStyle = {
    ...styles.nextCodeButton,
    ...(isHovered && !isLoading ? styles.nextCodeButtonHover : {}),
    ...(isLoading ? styles.nextCodeButtonDisabled : {})
  }

  return html`
    <${InputField}
      testId=${testId || 'otp-code-field'}
      label=${i18n._('Authenticator Token')}
      value=${formattedCode}
      variant="outline"
      icon=${LockIcon}
      isDisabled
      belowInputContent=${timerBar}
      additionalItems=${html`
        ${type === OTP_TYPE.HOTP &&
        generateNext &&
        html`
          <button
            onClick=${generateNext}
            disabled=${isLoading}
            style=${nextCodeButtonStyle}
            onMouseEnter=${() => setIsHovered(true)}
            onMouseLeave=${() => setIsHovered(false)}
            data-testid="otp-next-code-button"
          >
            ${i18n._('Next Code')}
          </button>
        `}
        <${CopyButton} value=${code} testId="otp-copy-button" />
      `}
    />
  `
}
