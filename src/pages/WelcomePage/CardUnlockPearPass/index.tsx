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
import { useCreateVault, useUserData, useVault, useVaults } from '@tetherto/pearpass-lib-vault'
import { clearBuffer, stringToBuffer } from '@tetherto/pearpass-lib-vault/src/utils/buffer'

import { OnboardingShell } from '../../../components/OnboardingShell'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { NAVIGATION_ROUTES } from '../../../constants/navigation'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { logger } from '../../../utils/logger'
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

  // Read localStorage on every render so the check reflects runtime changes
  // (e.g. user enables Touch ID in Settings and returns without remounting).
  const isBiometricConfigured =
    localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED) === 'true' &&
    !!localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_ENCRYPTED_PASSWORD)

  useGlobalLoading({ isLoading })

  const biometricInFlightRef = useRef(false)
  // Once the user cancels/errors Touch ID, stop auto-prompting on focus events
  const biometricAutoDisabledRef = useRef(false)

  // Stable refs to avoid tryBiometricLogin changing identity on every render
  // when t / navigate references change (common in i18n / router libraries).
  const tRef = useRef(t)
  tRef.current = t
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage

  const tryBiometricLogin = useCallback((isManual = false) => {
    if (biometricInFlightRef.current) return
    if (!isManual && biometricAutoDisabledRef.current) return
    biometricInFlightRef.current = true

    const api = window.electronAPI
    if (!api?.unlockWithPassword) {
      biometricInFlightRef.current = false
      return
    }

    const isEnabled = localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_LOGIN_ENABLED) === 'true'
    const encryptedPassword = localStorage.getItem(LOCAL_STORAGE_KEYS.BIOMETRIC_ENCRYPTED_PASSWORD)
    if (!isEnabled || !encryptedPassword) {
      biometricInFlightRef.current = false
      return
    }

    const localT = tRef.current
    const localNavigate = navigateRef.current
    const localCurrentPage = currentPageRef.current

    ;(async () => {
      try {
        const result = await api.unlockWithPassword(
          localT('Unlock PearPass'),
          encryptedPassword
        )

        if (!result.success || !result.password) {
          biometricAutoDisabledRef.current = true
          biometricInFlightRef.current = false
          return
        }

        setIsLoading(true)

        let passwordBuffer
        try {
          passwordBuffer = stringToBuffer(result.password)

          await logIn({ password: passwordBuffer })
          await initVaults({ password: passwordBuffer })

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
        } finally {
          clearBuffer(passwordBuffer)
          setIsLoading(false)
        }
      } catch {
        // Biometric prompt failed (user cancelled, device unavailable, etc.)
        // Silently fall through to manual password entry
        setIsLoading(false)
        biometricAutoDisabledRef.current = true
      }

      biometricInFlightRef.current = false
    })()
  }, [logIn, initVaults, refetchVaults, isVaultProtected, refetchVault, createVault, addDevice])

  // Auto-trigger Touch ID on mount (if window is focused) and on every window focus event
  useEffect(() => {
    if (!isBiometricConfigured) return

    // If the window already has focus on mount, trigger immediately
    if (document.hasFocus()) {
      tryBiometricLogin()
    }

    const handleFocus = () => {
      tryBiometricLogin()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
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

      logger.error(
        'CardUnlockPearPass',
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
