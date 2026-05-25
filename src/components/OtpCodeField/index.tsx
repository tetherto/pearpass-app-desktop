import React from 'react'

import { useLingui } from '@lingui/react'
import { Button, Text, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'
import {
  OTP_TYPE,
  formatOtpCode,
  useOtp,
  useTimerAnimation
} from '@tetherto/pearpass-lib-vault'

import type { OtpPublic } from '@tetherto/pearpass-lib-vault/src/types'

import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.electron'
import { createStyles } from './styles'

const TIMER_ANIMATION_DURATION = 1000

interface OtpCodeFieldProps {
  recordId: string
  otpPublic: OtpPublic
  isGrouped?: boolean
  testID?: string
}

export const OtpCodeField = ({
  recordId,
  otpPublic,
  isGrouped = false,
  testID
}: OtpCodeFieldProps) => {
  const { i18n } = useLingui()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { copyToClipboard } = useCopyToClipboard()

  const { code, timeRemaining, type, period, generateNext, isLoading } = useOtp(
    {
      recordId,
      otpPublic
    }
  )

  const formattedCode = formatOtpCode(code)
  const isTOTP = type === OTP_TYPE.TOTP
  const isHOTP = type === OTP_TYPE.HOTP

  const { noTransition, expiring, targetTime } = useTimerAnimation(
    timeRemaining,
    period ?? 30
  )

  const progress =
    timeRemaining !== null && period ? (targetTime / period) * 100 : 0

  const timerColor = expiring
    ? theme.colors.colorTextDestructive
    : theme.colors.colorPrimary

  const cardStyle = isGrouped ? styles.cardGrouped : styles.card

  return (
    <div style={cardStyle} data-testid={testID || 'otp-code-field'}>
      <div style={styles.topRow}>
        <div style={styles.innerColumn}>
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {i18n._('Authenticator Token')}
          </Text>
          <Text variant="labelEmphasized">{formattedCode || ''}</Text>
        </div>
        <Button
          variant="tertiary"
          size="small"
          data-testid="otp-code-field-copy"
          aria-label={i18n._('Copy code')}
          iconBefore={<ContentCopy color={theme.colors.colorTextPrimary} />}
          onClick={() => code && copyToClipboard(code)}
        />
      </div>

      {isTOTP && (
        <div style={styles.timerRow}>
          <div style={styles.timerTrack}>
            <div
              style={{
                ...styles.timerFill,
                background: timerColor,
                width: `${progress}%`,
                transition: noTransition
                  ? 'none'
                  : `width ${TIMER_ANIMATION_DURATION}ms linear`
              }}
            />
          </div>
          <div style={styles.timerLabel}>
            <Text variant="caption" color={timerColor}>
              {timeRemaining !== null ? `${timeRemaining}s` : ''}
            </Text>
          </div>
        </div>
      )}

      {isHOTP && generateNext && (
        <Button
          variant="secondary"
          size="small"
          fullWidth
          disabled={isLoading}
          data-testid="otp-code-field-next-code"
          onClick={generateNext}
        >
          {i18n._('Next Code')}
        </Button>
      )}
    </div>
  )
}
