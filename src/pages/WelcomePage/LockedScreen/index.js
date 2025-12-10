import { useEffect, useState, useCallback } from 'react'

import { html } from 'htm/react'
import { useUserData } from 'pearpass-lib-vault'
import { useTheme } from 'styled-components'

import {
  CardContainer,
  Header,
  Title,
  Description,
  TimerContainer,
  TimerLabel,
  TimerValue
} from './styles'
import { Timer } from './Timer'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { LockIcon, TimeIcon } from '../../../lib-react-components'

export const LockedScreen = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { navigate } = useRouter()
  const { refreshMasterPasswordStatus } = useUserData()
  const [masterPasswordStatus, setMasterPasswordStatus] = useState()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
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

  return html`
    <${CardContainer}>
      <${Header}>
        <${LockIcon} 
          width="32" 
          height="32" 
          color=${theme.colors.primary400.mode1} 
        />
        <${Title}>${t('PearPass locked')}</>
      </>

      <${Description}>
        <span>${t('Too many failed attempts.')}</span>
        <span>${t('For your security, access is locked for 5 minutes.')}</span>
      </>

      <${TimerContainer}>
        <${TimerLabel}>
          <${TimeIcon} 
            width="20" 
            height="20" 
            color=${theme.colors.primary400.mode1} 
          />
          ${t('Try again in')}
        </>
        <${TimerValue}>
          ${
            !isLoading &&
            html`<${Timer}
              initialSeconds=${Math.ceil(
                (masterPasswordStatus?.lockoutRemainingMs ?? 0) / 1000
              )}
              onFinish=${onFinish}
            />`
          }
        </>
      </>
    </>
  `
}
