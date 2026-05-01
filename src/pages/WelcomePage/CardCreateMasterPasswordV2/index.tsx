import React, { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { TERMS_OF_USE } from '@tetherto/pearpass-lib-constants'
import {
  useCreateVault,
  useUserData,
  useVault,
  useVaults
} from '@tetherto/pearpass-lib-vault'
import {
  stringToBuffer,
  clearBuffer
} from '@tetherto/pearpass-lib-vault/src/utils/buffer'
import { checkPasswordStrength } from '@tetherto/pearpass-utils-password-check'
import {
  AlertMessage,
  Button,
  Form,
  Link,
  PasswordField,
  Text,
  Title
} from '@tetherto/pearpass-lib-ui-kit'
import type { PasswordIndicatorVariant } from '@tetherto/pearpass-lib-ui-kit'
import {
  KeyboardArrowRightFilled,
  InfoOutlined
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { useTheme } from '@tetherto/pearpass-lib-ui-kit'

import { createStyles } from './styles'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { getDeviceName } from '../../../utils/getDeviceName'
import { logger } from '../../../utils/logger'
import { STRENGTH_MAP } from '../../../constants/password'

export const CardCreateMasterPasswordV2 = () => {
  const { t } = useTranslation()
  const { navigate } = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()
  const styles = createStyles(theme.colors)

  useGlobalLoading({ isLoading })

  const { createMasterPassword, logIn } = useUserData()
  const { initVaults } = useVaults()
  const { addDevice } = useVault()
  const { createVault } = useCreateVault()

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

  const passwordIndicator: PasswordIndicatorVariant | undefined =
    passwordStrength ? STRENGTH_MAP[passwordStrength.strengthType] : undefined

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

    const createBuffer = stringToBuffer(formValues.password)
    const loginBuffer = stringToBuffer(formValues.password)
    try {
      setIsLoading(true)
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOU_ACCEPTED, 'true')
      await createMasterPassword(createBuffer)
      await logIn({ password: loginBuffer })
      await initVaults({ password: loginBuffer })
      await createVault({ name: t('Personal') })
      await addDevice(getDeviceName())
      navigate('vault', { recordType: 'all' })
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
      clearBuffer(loginBuffer)
    }
  }

  const showInfoToast = values.password && !isPasswordStrong

  return (
    <div style={styles.card}>
      {/* @ts-ignore - plain CSS objects passed to react-strict-dom components */}
      <Form onSubmit={handleSubmit(onSubmit)} style={styles.container}>
        <div style={styles.header}>
          <Title as="h2">{t('Create Master Password')}</Title>
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
                    "Strong passwords are usually at least 8 characters long, hard to guess, use a mix of uppercase and lowercase letters, numbers, and symbols, and aren’t based on personal information."
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
            />
          )}
        </div>

        <div style={styles.footerRow}>
          <div style={styles.touContainer}>
            {/* @ts-ignore */}
            <Text as="span" variant="caption" style={styles.touText}>
              {t(
                'By clicking Continue, you confirm that you have read and agree to the '
              )}
            </Text>{' '}
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
