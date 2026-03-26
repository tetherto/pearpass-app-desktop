import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
// @ts-ignore - JS module re-export
import { TERMS_OF_USE } from '@tetherto/pearpass-lib-constants'
import { useUserData } from '@tetherto/pearpass-lib-vault'
import {
  stringToBuffer,
  clearBuffer
} from '@tetherto/pearpass-lib-vault/src/utils/buffer'
// @ts-ignore - JS module without type declarations
import { checkPasswordStrength } from '@tetherto/pearpass-utils-password-check'
import { AlertMessage, Button, Form, Link, PasswordField, Text, Title } from '@tetherto/pearpass-lib-ui-kit'
import type { PasswordIndicatorVariant } from '@tetherto/pearpass-lib-ui-kit'
import {
  KeyboardArrowRightFilled,
  InfoOutlined,
  ReportProblemRound
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './styles'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { logger } from '../../../utils/logger'

const STRENGTH_MAP: Record<string, PasswordIndicatorVariant> = {
  error: 'vulnerable',
  warning: 'decent',
  success: 'strong'
}

export const CardCreateMasterPasswordV2 = () => {
  const { t } = useTranslation()
  const { currentPage, navigate } = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  useGlobalLoading({ isLoading })

  const { createMasterPassword } = useUserData()

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required')),
    passwordConfirm: Validator.string().required(t('Password is required'))
  })

  const { register, handleSubmit, setErrors, setValue, values } = useForm({
    initialValues: {
      password: '',
      passwordConfirm: ''
    },
    validate: (formValues: { password: string; passwordConfirm: string }) =>
      schema.validate(formValues)
  })

  const passwordStrength = values.password
    ? checkPasswordStrength(values.password)
    : null

  const isPasswordStrong = passwordStrength?.strengthType === 'success'
  const passwordsMatch =
    isPasswordStrong &&
    values.password.length > 0 &&
    values.password === values.passwordConfirm
  const isFormValid = isPasswordStrong && passwordsMatch

  const passwordIndicator: PasswordIndicatorVariant | undefined = passwordStrength
    ? STRENGTH_MAP[passwordStrength.strengthType]
    : undefined

  const handlePasswordChange = (val: string) => {
    register('password').onChange(val)
    if (!val) {
      setErrors({})
    }
  }

  const handleConfirmChange = (val: string) => {
    register('passwordConfirm').onChange(val)
  }

  const onSubmit = async (formValues: {
    password: string
    passwordConfirm: string
  }) => {
    if (isLoading) return

    const strength = checkPasswordStrength(formValues.password)
    if (strength.strengthType !== 'success') {
      setErrors({
        password: strength.errors?.[0] || t('Password is not strong enough')
      })
      setValue('passwordConfirm', '')
      return
    }

    if (formValues.password !== formValues.passwordConfirm) {
      setErrors({ passwordConfirm: t('Passwords do not match') })
      return
    }

    const passwordBuffer = stringToBuffer(formValues.password)
    try {
      setIsLoading(true)
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOU_ACCEPTED, 'true')
      await createMasterPassword(passwordBuffer)
      navigate(currentPage, { state: 'masterPassword' })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      setErrors({ password: t('Error creating master password') })
      logger.error(
        'CardCreateMasterPasswordV2',
        'Error creating master password:',
        error
      )
    } finally {
      clearBuffer(passwordBuffer)
    }
  }

  const handleLoadVaultClick = () => {
    navigate(currentPage, { state: 'loadVault' })
  }

  const showInfoToast = values.password && !isPasswordStrong

  return (
    <div style={styles.card}>
      {/* @ts-ignore - plain CSS objects passed to react-strict-dom components */}
      <Form onSubmit={handleSubmit(onSubmit)} style={styles.container}>
        <div style={styles.header}>
          <Title as="h2">{t('Create Master Password')}</Title>
          <Text as="p">
            <Text as="span">{t('Create a Master Password, or ')}</Text>{' '}
            <Link onClick={handleLoadVaultClick}>
              {t('continue with existing PearPass')}
            </Link>
          </Text>
        </div>

        <div style={styles.fieldsWrapper}>
          <div style={styles.passwordWrapper}>
            <PasswordField
              label={t('Password')}
              placeholderText={t('Enter Master Password')}
              value={values.password}
              onChangeText={handlePasswordChange}
              passwordIndicator={passwordIndicator}
              testID="master-password-field"
            />
            {showInfoToast && (
              <div style={styles.toast}>
                <div style={styles.toastIcon}>
                  <InfoOutlined width={16} height={16} />
                </div>
                <Text as="span" variant="caption">
                  {t(
                    'Strong passwords are usually at least 8 characters long, hard to guess, use a mix of letters, numbers, and symbols, and aren\'t based on personal information.'
                  )}
                </Text>
              </div>
            )}
          </div>

          <PasswordField
            label={t('Repeat Password')}
            placeholderText={t('Repeat Master Password')}
            value={values.passwordConfirm}
            onChangeText={handleConfirmChange}
            passwordIndicator={passwordsMatch ? 'match' : undefined}
            testID="confirm-password-field"
          />

          {isFormValid && (
            <AlertMessage
              variant="warning"
              size="small"
              title=""
              description={t(
                "Don't forget your Master password. It's the only way to access your vault. We can't help recover it. Back it up securely."
              )}
              icon={<ReportProblemRound width={16} height={16} />}
            />
          )}
        </div>

        <div style={styles.footerRow}>
          <div style={styles.touContainer}>
            {/* @ts-ignore */}
            <Text as="span" variant="caption" style={styles.touText}>{t('By clicking Continue, you confirm that you have read and agree to the ')}</Text>{' '}
            <Link
              // @ts-ignore - plain CSS object
              style={styles.touLink}
              href={TERMS_OF_USE}
              isExternal
            >
              {t('PearPass Application Terms of Use')}
            </Link>
            <Text as="span">.</Text>
          </div>
          <Button
            variant="primary"
            size="small"
            disabled={!isFormValid}
            isLoading={isLoading}
            onClick={() => handleSubmit(onSubmit)()}
            iconAfter={<KeyboardArrowRightFilled width={16} height={16} />}
          >
            {t('Continue')}
          </Button>
        </div>
      </Form>
    </div>
  )
}
