import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useOtp, formatOtpCode, OTP_TYPE } from 'pearpass-lib-vault'

import { InputField, LockIcon } from '../../lib-react-components'
import { CopyButton } from '../CopyButton'
import { TimerBar } from '../TimerBar'
import type { OtpPublic } from 'pearpass-lib-vault/src/types'

interface OtpCodeFieldProps {
  recordId: string
  otpPublic: OtpPublic
  testId?: string
}

export const OtpCodeField = ({ recordId, otpPublic, testId }: OtpCodeFieldProps) => {
  const { i18n } = useLingui()
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
            data-testid="otp-next-code-button"
            className="inline-flex items-center gap-1 rounded-md border border-grey100-mode1 bg-transparent px-2 py-1 text-xs font-medium text-white-mode1 outline-none hover:border-primary400-mode1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ${i18n._('Next Code')}
          </button>
        `}
        <${CopyButton} value=${code} testId="otp-copy-button" />
      `}
    />
  `
}
