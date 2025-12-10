import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useUserData, useVaults } from 'pearpass-lib-vault'

import { AlertBox } from '../../../components/AlertBox'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { AuthenticationCard } from '../../../containers/AuthenticationCard'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'

export const CardUnlockPearPass = () => {
  const { t } = useTranslation()
  const { currentPage, navigate } = useRouter()
  const { initVaults } = useVaults()
  const { refreshMasterPasswordStatus } = useUserData()

  const handleSuccess = async (password) => {
    await initVaults({ password })
    navigate(currentPage, { state: 'vaults' })
  }

  const handleError = async (error, setErrors) => {
    const status = await refreshMasterPasswordStatus()

    if (status?.isLocked) {
      navigate('welcome', { state: NAVIGATION_ROUTES.SCREEN_LOCKED })
      return
    }

    const remainingAttempts = status?.remainingAttempts

    setErrors({
      password:
        typeof error === 'string'
          ? error
          : remainingAttempts !== undefined
            ? t(
                `Incorrect password. You have ${remainingAttempts} attempts before the app locks for 5 minutes.`
              )
            : t('Invalid password')
    })
  }

  return html`
    <${AuthenticationCard}
      title=${t('Enter your Master password')}
      buttonLabel=${t('Continue')}
      descriptionComponent=${html`<${AlertBox}
        message=${t(
          "Don't forget your master password. It's the only way to access your vault. We can't help recover it. Back it up securely."
        )}
      />`}
      onSuccess=${handleSuccess}
      onError=${handleError}
    />
  `
}
