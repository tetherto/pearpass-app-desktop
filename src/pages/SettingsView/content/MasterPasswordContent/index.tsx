import { useState } from 'react'

import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { useUserData } from '@tetherto/pearpass-lib-vault'
import {
  clearBuffer,
  stringToBuffer
} from '@tetherto/pearpass-lib-vault/src/utils/buffer'
// @ts-ignore - JS module without type declarations
import type { PasswordIndicatorVariant } from '@tetherto/pearpass-lib-ui-kit'
import {
  AlertMessage,
  Button,
  Form,
  PageHeader,
  PasswordField
} from '@tetherto/pearpass-lib-ui-kit'
import {
  checkPasswordStrength,
  validatePasswordChange
} from '@tetherto/pearpass-utils-password-check'

import { useGlobalLoading } from '../../../../context/LoadingContext'
import { useTranslation } from '../../../../hooks/useTranslation'
import { logger } from '../../../../utils/logger'
import { createStyles } from './styles'

const STRENGTH_MAP: Record<string, PasswordIndicatorVariant> = {
  error: 'vulnerable',
  warning: 'decent',
  success: 'strong'
}

export const MasterPasswordContent = () => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const styles = createStyles()

  useGlobalLoading({ isLoading })

  const { updateMasterPassword } = useUserData()

  const schema = Validator.object({
    currentPassword: Validator.string().required(t('Password is required')),
    newPassword: Validator.string().required(t('Password is required')),
    repeatPassword: Validator.string().required(t('Password is required'))
  })

  const { register, handleSubmit, setErrors, setValues, values } = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      repeatPassword: ''
    },
    validate: (formValues: {
      currentPassword: string
      newPassword: string
      repeatPassword: string
    }) => schema.validate(formValues)
  })

  const newPasswordStrength = values.newPassword
    ? checkPasswordStrength(values.newPassword)
    : null

  const isNewPasswordStrong = newPasswordStrength?.strengthType === 'success'
  const passwordsMatch =
    isNewPasswordStrong &&
    values.newPassword.length > 0 &&
    values.newPassword === values.repeatPassword
  const isFormValid =
    values.currentPassword.length > 0 && isNewPasswordStrong && passwordsMatch

  const newPasswordIndicator: PasswordIndicatorVariant | undefined =
    newPasswordStrength
      ? STRENGTH_MAP[newPasswordStrength.strengthType]
      : undefined

  const resetValues = () => {
    setValues({ currentPassword: '', newPassword: '', repeatPassword: '' })
  }

  const onSubmit = async (formValues: {
    currentPassword: string
    newPassword: string
    repeatPassword: string
  }) => {
    if (isLoading || !isFormValid) return

    const result = validatePasswordChange({
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
      repeatPassword: formValues.repeatPassword,
      messages: {
        newPasswordMustDiffer: t(
          'New password must be different from the current password'
        ),
        passwordsDontMatch: t('Passwords do not match')
      }
    })

    if (!result.success) {
      setErrors({ [result.field]: result.error })
      resetValues()
      return
    }

    const newPasswordBuffer = stringToBuffer(formValues.newPassword)
    const currentPasswordBuffer = stringToBuffer(formValues.currentPassword)
    try {
      setIsLoading(true)
      await updateMasterPassword({
        newPassword: newPasswordBuffer,
        currentPassword: currentPasswordBuffer
      })
      setIsLoading(false)
      resetValues()
    } catch (error) {
      setIsLoading(false)
      resetValues()
      setErrors({ currentPassword: t('Invalid password') })
      logger.error(
        'MasterPasswordContent',
        'Error updating master password:',
        error
      )
    } finally {
      clearBuffer(newPasswordBuffer)
      clearBuffer(currentPasswordBuffer)
    }
  }

  const { onChange: onChangeCurrentPassword, ...currentPasswordProps } =
    register('currentPassword')
  const { onChange: onChangeNewPassword, ...newPasswordProps } =
    register('newPassword')
  const { onChange: onChangeRepeatPassword, ...repeatPasswordProps } =
    register('repeatPassword')

  return (
    <div style={styles.container}>
      <PageHeader
        title={t('Master Password')}
        as="h1"
        subtitle={t('Manage the password that protects your app.')}
      />

      <Form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.fieldsWrapper}>
          <PasswordField
            label={t('Current Password')}
            placeholder={t('Enter Current Password')}
            {...currentPasswordProps}
            onChange={(e) => onChangeCurrentPassword(e.target.value)}
            testID="current-password-field"
          />

          <PasswordField
            label={t('New Password')}
            placeholder={t('Enter New Password')}
            {...newPasswordProps}
            onChange={(e) => onChangeNewPassword(e.target.value)}
            passwordIndicator={newPasswordIndicator}
            testID="new-password-field"
          />

          <PasswordField
            label={t('Repeat New Password')}
            placeholder={t('Repeat New Password')}
            {...repeatPasswordProps}
            onChange={(e) => onChangeRepeatPassword(e.target.value)}
            passwordIndicator={passwordsMatch ? 'match' : undefined}
            testID="repeat-password-field"
          />
        </div>
        <AlertMessage
          variant="warning"
          size="small"
          title=""
          description={t(
            "Don't forget your Master password. It's the only way to access your vault. We can't help recover it. Back it up securely."
          )}
        />

        <div style={styles.footer}>
          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={!isFormValid}
            isLoading={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t('Change Password')}
          </Button>
        </div>
      </Form>
    </div>
  )
}
