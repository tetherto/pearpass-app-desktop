// @ts-ignore - V2_DESIGN_ENABLED is added locally to pearpass-lib-constants
import { V2_DESIGN_ENABLED } from 'pearpass-lib-constants'
// @ts-ignore - some hooks not resolved by TS due to re-export chain
import { useCreateVault, useUserData, useVault, useVaults } from 'pearpass-lib-vault'

import { AlertBox } from '../../../components/AlertBox'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { AuthenticationCard } from '../../../containers/AuthenticationCard'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { getDeviceName } from '../../../utils/getDeviceName'
import { logger } from '../../../utils/logger'

export const CardUnlockPearPass = () => {
  const { t } = useTranslation()
  const { currentPage, navigate } = useRouter()
  const { initVaults, refetch: refetchVaults } = useVaults()
  const { refreshMasterPasswordStatus } = useUserData()
  const { createVault } = useCreateVault()
  const { addDevice, refetch: refetchVault } = useVault()

  const handleSuccess = async (password: string) => {
    await initVaults({ password })

    if (V2_DESIGN_ENABLED) {
      try {
        const freshVaults = await refetchVaults()

        if (!freshVaults || freshVaults.length === 0) {
          await createVault({ name: t('Personal') })
          await addDevice(getDeviceName())
          navigate('vault', { recordType: 'all' })
        } else {
          await refetchVault(freshVaults[0].id)
          navigate('vault', { recordType: 'all' })
        }
      } catch (error) {
        logger.error('CardUnlockPearPass', 'Error during V2 auto-vault:', error)
        navigate(currentPage, { state: 'vaults' })
      }
      return
    }

    navigate(currentPage, { state: 'vaults' })
  }

  const handleError = async (error: string | Error, setErrors: (errors: { password: string }) => void) => {
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

  return (
    <AuthenticationCard
      title={t('Enter your Master password')}
      buttonLabel={t('Continue')}
      descriptionComponent={
        <AlertBox
          testId="masterpassword-alert-box"
          message={t(
            "Don't forget your master password. It's the only way to access your vault. We can't help recover it. Back it up securely."
          )}
        />
      }
      onSuccess={handleSuccess}
      onError={handleError}
    />
  )
}
