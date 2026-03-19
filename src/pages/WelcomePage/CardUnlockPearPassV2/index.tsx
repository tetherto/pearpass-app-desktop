import React, { FormEvent, useState } from 'react'
import {
  Button,
  PasswordField,
  Text,
  Title,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  KeyboardArrowRightRound
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useCreateVault, useUserData, useVault, useVaults } from '@tetherto/pearpass-lib-vault'
import { clearBuffer, stringToBuffer } from '@tetherto/pearpass-lib-vault/src/utils/buffer'

import { OnboardingShell } from '../../../components/OnboardingShell'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { getDeviceName } from '../../../utils/getDeviceName'
import { logger } from '../../../utils/logger'
import { sortByName } from '../../../utils/sortByName'
import {
  ButtonIconWrapper,
  Footer,
  Header,
  Shell
} from './styles'

export const CardUnlockPearPassV2 = (): React.ReactElement => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { currentPage, navigate } = useRouter()
  const { initVaults, refetch: refetchVaults } = useVaults()
  const { isVaultProtected, addDevice, refetch: refetchVault } = useVault()
  const { createVault } = useCreateVault()
  const { logIn, refreshMasterPasswordStatus } = useUserData()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const handlePasswordChange = (value: string) => {
    setPassword(value)

    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isLoading) {
      return
    }

    if (!password) {
      setError(t('Password is required'))
      return
    }

    const passwordBuffer = stringToBuffer(password)

    try {
      setIsLoading(true)
      setError('')

      await logIn({ password: passwordBuffer })
      await initVaults({ password: passwordBuffer })

      const vaults = await refetchVaults()
      const firstVault = sortByName(vaults)[0]

      if (firstVault) {
        const isProtected = await isVaultProtected(firstVault.id)

        if (isProtected) {
          navigate(currentPage, { state: 'vaultPassword', vaultId: firstVault.id })
        } else {
          await refetchVault(firstVault.id)
          navigate('vault', { recordType: 'all' })
        }
      } else {
        await createVault({ name: t('Personal') })
        await addDevice(getDeviceName())
        navigate('vault', { recordType: 'all' })
      }
    } catch (submitError) {
      const status = await refreshMasterPasswordStatus()

      if (status?.isLocked) {
        navigate('welcome', { state: NAVIGATION_ROUTES.SCREEN_LOCKED })
        return
      }

      const attemptsLeft =
        typeof status?.remainingAttempts === 'number'
          ? status.remainingAttempts
          : null

      setError(
        typeof submitError === 'string'
          ? submitError
          : attemptsLeft !== null
            ? t(
              `Incorrect Master Password. ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left.`
            )
            : t('Invalid password')
      )

      logger.error(
        'CardUnlockPearPassV2',
        'Error unlocking with master password:',
        submitError
      )
    } finally {
      clearBuffer(passwordBuffer)
      setIsLoading(false)
    }
  }

  return (
    <OnboardingShell background="solid">
      <Shell onSubmit={handleSubmit}>
        <Header>
          <Title>Enter Your Master Password</Title>
          <Text
            as="p"
            variant="label"
            color={theme.colors.colorTextSecondary}
          >
            {t('Please enter your master password to continue')}
          </Text>
        </Header>

        <PasswordField
          label={t('Password')}
          value={password}
          placeholderText={t('Enter Master Password')}
          onChangeText={handlePasswordChange}
          variant={error ? 'error' : 'default'}
          errorMessage={error || undefined}
          testID="login-password-input-v2"
        />

        <Footer>
          <Button
            type="submit"
            variant="primary"
            size="small"
            isLoading={isLoading}
            data-testid="login-continue-button-v2"
            iconAfter={
              <ButtonIconWrapper>
                <KeyboardArrowRightRound />
              </ButtonIconWrapper>
            }
          >
            {t('Continue')}
          </Button>
        </Footer>
      </Shell>
    </OnboardingShell>
  )
}
