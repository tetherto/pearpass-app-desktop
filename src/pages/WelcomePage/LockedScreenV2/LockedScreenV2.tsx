import React, { useCallback, useEffect, useState } from 'react'

import { useCountDown } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { useUserData } from '@tetherto/pearpass-lib-vault'
import { PageHeader, useTheme } from '@tetherto/pearpass-lib-ui-kit'
import { WatchLater } from '@tetherto/pearpass-lib-ui-kit/icons'

import { OnboardingShell } from '../../../components/OnboardingShell'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { createStyles } from './LockedScreenV2.styles'

type LockCountdownProps = {
  initialSeconds: number
  onFinish: () => void | Promise<void>
  style: React.CSSProperties
}

const LockCountdown = ({
  initialSeconds,
  onFinish,
  style
}: LockCountdownProps) => {
  const timeRemaining = useCountDown({ initialSeconds, onFinish })
  
  return (
    <span data-testid="locked-screen-countdown-v2" style={style}>
      {timeRemaining}
    </span>
  )
}

export const LockedScreenV2 = (): React.ReactElement => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)
  const { navigate } = useRouter()
  const { refreshMasterPasswordStatus } = useUserData()
  const [masterPasswordStatus, setMasterPasswordStatus] = useState<
    { isLocked?: boolean; lockoutRemainingMs?: number } | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const status = await refreshMasterPasswordStatus()
      setMasterPasswordStatus(status)
      setIsLoading(false)
    })()
  }, [])

  const onFinish = useCallback(async () => {
    const status = await refreshMasterPasswordStatus()

    if (!status?.isLocked) {
      navigate('welcome', { state: NAVIGATION_ROUTES.MASTER_PASSWORD })
    }
  }, [navigate, refreshMasterPasswordStatus])

  const initialSeconds = Math.ceil(
    (masterPasswordStatus?.lockoutRemainingMs ?? 0) / 1000
  )

  return (
    <OnboardingShell background="solid">
      <div style={styles.root} data-testid="locked-screen-v2">
        <div style={styles.main}>
          <div style={styles.pageHeaderWrap}>
            <PageHeader
              as="h1"
              title={t('PearPass locked')}
              testID="locked-screen-headline-v2"
            />
          </div>

          <div style={styles.description}>
            <p
              style={styles.descriptionText}
              data-testid="locked-screen-desc-line1-v2"
            >
              {t('Too many failed attempts.')}
            </p>
            <p
              style={styles.descriptionText}
              data-testid="locked-screen-desc-line2-v2"
            >
              {t('For your security, access is temporarily locked.')}
            </p>
          </div>

          <div style={styles.pill}>
            <div style={styles.pillLeft}>
              <WatchLater
                width={20}
                height={20}
                color={theme.colors.colorTextSecondary}
              />
              <span
                style={styles.pillText}
                data-testid="locked-screen-try-label-v2"
              >
                {t('Try again in')}
              </span>
            </div>
            {!isLoading && initialSeconds > 0 ? (
              <LockCountdown
                initialSeconds={initialSeconds}
                onFinish={onFinish}
                style={styles.countdown}
              />
            ) : (
              <span
                style={styles.countdown}
                data-testid="locked-screen-countdown-placeholder-v2"
              >
                —
              </span>
            )}
          </div>
        </div>
      </div>
    </OnboardingShell>
  )
}
