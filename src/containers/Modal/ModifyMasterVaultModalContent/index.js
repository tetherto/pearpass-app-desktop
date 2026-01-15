import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { useUserData } from 'pearpass-lib-vault'
import {
  stringToBuffer,
  clearBuffer
} from 'pearpass-lib-vault/src/utils/buffer'
import { validatePasswordChange } from 'pearpass-utils-password-check'

import {
  Content,
  InputLabel,
  InputWrapper,
  ModalActions,
  ModalTitle
} from './styles'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation.js'
import {
  ButtonPrimary,
  ButtonSecondary,
  PearPassPasswordField
} from '../../../lib-react-components'
import { logger } from '../../../utils/logger'
import { ModalContent } from '../ModalContent'

export const ModifyMasterVaultModalContent = () => {
  const { t } = useTranslation()
  const { closeModal } = useModal()

  const { updateMasterPassword } = useUserData()

  const { setIsLoading } = useLoadingContext()

  const errors = {
    minLength: t(`Password must be at least 8 characters long`),
    hasLowerCase: t('Password must contain at least one lowercase letter'),
    hasUpperCase: t('Password must contain at least one uppercase letter'),
    hasNumbers: t('Password must contain at least one number'),
    hasSymbols: t('Password must contain at least one special character')
  }

  const schema = Validator.object({
    currentPassword: Validator.string().required(t('Invalid password')),
    newPassword: Validator.string().required(t('Password is required')),
    repeatPassword: Validator.string().required(t('Password is required'))
  })

  const { register, handleSubmit, setErrors, setValue } = useForm({
    initialValues: { currentPassword: '', newPassword: '', repeatPassword: '' },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    const { currentPassword, newPassword, repeatPassword } = values
    const result = validatePasswordChange({
      currentPassword,
      newPassword,
      repeatPassword,
      messages: {
        newPasswordMustDiffer: t(
          'New password must be different from the current password'
        ),
        passwordsDontMatch: t('Passwords do not match')
      },
      config: { errors }
    })

    if (!result.success) {
      setErrors({
        [result.field]: result.error
      })

      if (result.field === 'newPassword') {
        setValue('repeatPassword', '')
      }
      return
    }

    const newPasswordBuffer = stringToBuffer(values.newPassword)
    const currentPasswordBuffer = stringToBuffer(values.currentPassword)
    try {
      setIsLoading(true)

      await updateMasterPassword({
        newPassword: newPasswordBuffer,
        currentPassword: currentPasswordBuffer
      })

      setIsLoading(false)
      closeModal()
    } catch (error) {
      setIsLoading(false)
      logger.error(
        'ModifyMasterVaultModalContent',
        'Error updating master password:',
        error
      )
      setErrors({
        currentPassword: t('Invalid password')
      })
    } finally {
      clearBuffer(newPasswordBuffer)
      clearBuffer(currentPasswordBuffer)
    }
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html` <${ModalTitle}>
        ${t('Modify master password')}
      <//>`}
    >
      <${Content}>
        <${InputWrapper}>
          <${InputLabel}> ${t('Insert old password')} <//>
          <${PearPassPasswordField} ...${register('currentPassword')} />
        <//>
        <${InputWrapper}>
          <${InputLabel}> ${t('Create new password')} <//>
          <${PearPassPasswordField} ...${register('newPassword')} />
        <//>
        <${InputWrapper}>
          <${InputLabel}> ${t('Repeat new password')} <//>
          <${PearPassPasswordField} ...${register('repeatPassword')} />
        <//>
        <${ModalActions}>
          <${ButtonPrimary} onClick=${handleSubmit(onSubmit)}>
            ${t('Continue')}
          <//>
          <${ButtonSecondary} onClick=${closeModal}> ${t('Cancel')} <//>
        <//>
      <//>
    <//>
  `
}
