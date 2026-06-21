import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  Link,
  PasswordField,
  Text,
  Title,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import {
  KeyboardArrowRightRound
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { runActionScan, useCreateVault, useUserData, useVault, useVaults } from '@tetherto/pearpass-lib-vault'
import { pearpassVaultClient } from '@tetherto/pearpass-lib-vault/src/instances'
import { clearBuffer, stringToBuffer } from '@tetherto/pearpass-lib-vault/src/utils/buffer'
import { logger } from '../../../utils/logger'

import { OnboardingShell } from '../../../components/OnboardingShell'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { sortByName } from '../../../utils/sortByName'
import {
  ButtonIconWrapper,
  Footer,
  Header,
  Shell
} from './styles'

export const CardUnlockPearPass = (): React.ReactElement => {
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

  const isBiometricConfigured =
    localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED) === 'true'

  useGlobalLoading({ isLoading })

  const biometricInFlightRef = useRef(false)
  const biometricAutoDisabledRef = useRef(false)
  const biometricLoginSucceededRef = useRef(false)

  const tRef = useRef(t)
  tRef.current = t
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage

  const tryBiometricLogin = useCallback((isManual = false) => {
    if (biometricLoginSucceededRef.current) return
    if (biometricInFlightRef.current) return
    if (!isManual && biometricAutoDisabledRef.current) return
    biometricInFlightRef.current = true

    const api = window.electronAPI
    if (!api?.retrieveBiometricCredentials) {
      biometricInFlightRef.current = false
      return
    }

    const isEnabled = localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED) === 'true'
    if (!isEnabled) {
      biometricInFlightRef.current = false
      return
    }

    const localT = tRef.current
    const localNavigate = navigateRef.current
    const localCurrentPage = currentPageRef.current

    ;(async () => {
      try {
        const result = await api.retrieveBiometricCredentials(
          localT('Unlock PearPass')
        )

        if (!result.success || !result.credentials) {
          biometricAutoDisabledRef.current = true
          biometricInFlightRef.current = false
          return
        }

        setIsLoading(true)

        try {
          await logIn({
            ciphertext: result.credentials.ciphertext,
            nonce: result.credentials.nonce,
            hashedPassword: result.credentials.hashedPassword,
          })

          biometricLoginSucceededRef.current = true

          try {
            await pearpassVaultClient?.personalSwarmInit?.()
          } catch (swarmErr) {
            logger.error('CardUnlockPearPass', 'personalSwarmInit failed', swarmErr)
          }
          runActionScan().catch((err: unknown) =>
            logger.error('CardUnlockPearPass', 'runActionScan failed', err)
          )

          const vaults = await refetchVaults()
          const firstVault = sortByName(vaults)[0]

          if (firstVault) {
            const isProtected = await isVaultProtected(firstVault.id)

            if (isProtected) {
              localNavigate(localCurrentPage, { state: 'vaultPassword', vaultId: firstVault.id })
            } else {
              await refetchVault(firstVault.id)
              localNavigate('vault', { recordType: 'all' })
            }
          } else {
            await createVault({ name: localT('Personal') })
            await addDevice()
            localNavigate('vault', { recordType: 'all' })
          }
        } catch {
          setError(localT('Biometric unlock failed. Please enter your password.'))
          biometricAutoDisabledRef.current = true
          pearpassVaultClient?.encryptionClose?.().catch((err: unknown) =>
            logger.error('CardUnlockPearPass', 'encryptionClose failed', err)
          )
        } finally {
          setIsLoading(false)
        }
      } catch (bioPromptErr) {
        const bioErr = bioPromptErr instanceof Error
          ? bioPromptErr
          : new Error(String(bioPromptErr))
        const code = (bioPromptErr as Record<string, unknown>)?.code
        logger.error('CardUnlockPearPass', 'Biometric retrieveCredentials failed', { code, message: bioErr.message })
        setIsLoading(false)
        biometricAutoDisabledRef.current = true
      }

      biometricInFlightRef.current = false
    })()
  }, [logIn, initVaults, refetchVaults, isVaultProtected, refetchVault, createVault, addDevice])

  useEffect(() => {
    if (!isBiometricConfigured) return

    const scheduleBiometricAfterPaint = () => {
      requestAnimationFrame(() => {
        tryBiometricLogin()
      })
    }

    if (document.hasFocus()) {
      scheduleBiometricAfterPaint()
    }

    window.addEventListener('focus', scheduleBiometricAfterPaint)
    return () => window.removeEventListener('focus', scheduleBiometricAfterPaint)
  }, [isBiometricConfigured, tryBiometricLogin])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)

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
        await addDevice()
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
              `Incorrect password. You have ${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} before the app will be temporarily locked`
            )
            : t('Invalid password')
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
          placeholder={t('Enter Master Password')}
          onChange={handlePasswordChange}
          error={error || undefined}
          testID="login-password-input"
        />

        <Footer>
          <Button
            type="submit"
            variant="primary"
            size="small"
            isLoading={isLoading}
            data-testid="login-continue-button"
            iconAfter={
              <ButtonIconWrapper>
                <KeyboardArrowRightRound />
              </ButtonIconWrapper>
            }
          >
            {t('Continue')}
          </Button>
        </Footer>

        {isBiometricConfigured && (
          <div style={{ textAlign: 'center' as const, fontSize: '12px', marginTop: '12px' }}>
            <Link
              onClick={() => tryBiometricLogin(true)}
              data-testid="login-touchid-link"
            >
              {t('Unlock with Touch ID')}
            </Link>
          </div>
        )}
      </Shell>
    </OnboardingShell>
  )
}
