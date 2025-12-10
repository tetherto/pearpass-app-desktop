import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { useUserData } from 'pearpass-lib-vault'
import { checkPasswordStrength } from 'pearpass-utils-password-check'

import { useModal } from '../../../context/ModalContext'
import { ModalContent } from '../ModalContent'
import {
  Content,
  InputLabel,
  InputWrapper,
  ModalActions,
  ModalTitle
} from './styles'
import { useLoadingContext } from '../../../context/LoadingContext'
import {
  ButtonPrimary,
  ButtonSecondary,
  PearPassPasswordField
} from '../../../lib-react-components'
import { logger } from '../../../utils/logger'

export const ModifyMasterVaultModalContent = () => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()

  const { updateMasterPassword } = useUserData()

  const { setIsLoading } = useLoadingContext()

  const errors = {
    minLength: i18n._(`Password must be at least 8 characters long`),
    hasLowerCase: i18n._('Password must contain at least one lowercase letter'),
    hasUpperCase: i18n._('Password must contain at least one uppercase letter'),
    hasNumbers: i18n._('Password must contain at least one number'),
    hasSymbols: i18n._('Password must contain at least one special character')
  }

  const schema = Validator.object({
    currentPassword: Validator.string().required(i18n._('Invalid password')),
    newPassword: Validator.string().required(i18n._('Password is required')),
    repeatPassword: Validator.string().required(i18n._('Password is required'))
  })

  const { register, handleSubmit, setErrors, setValue } = useForm({
    initialValues: { currentPassword: '', newPassword: '', repeatPassword: '' },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    const result = checkPasswordStrength(values.newPassword, { errors })

    if (!result.success) {
      setErrors({
        newPassword: result.errors.join(', ')
      })

      setValue('repeatPassword', '')
      return
    }

    if (values.newPassword !== values.repeatPassword) {
      setErrors({
        repeatPassword: i18n._('Passwords do not match')
      })

      return
    }

    try {
      setIsLoading(true)

      await updateMasterPassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword
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
        currentPassword: i18n._('Invalid password')
      })
    }
  }

  return html`
    <${ModalContent}
      onClose=${closeModal}
      headerChildren=${html` <${ModalTitle}>
        ${i18n._('Modify master password')}
      <//>`}
    >
      <${Content}>
        <${InputWrapper}>
          <${InputLabel}> ${i18n._('Insert old password')} <//>
          <${PearPassPasswordField} ...${register('currentPassword')} />
        <//>
        <${InputWrapper}>
          <${InputLabel}> ${i18n._('Create new password')} <//>
          <${PearPassPasswordField} ...${register('newPassword')} />
        <//>
        <${InputWrapper}>
          <${InputLabel}> ${i18n._('Repeat new password')} <//>
          <${PearPassPasswordField} ...${register('repeatPassword')} />
        <//>
        <${ModalActions}>
          <${ButtonPrimary} onClick=${handleSubmit(onSubmit)}>
            ${i18n._('Continue')}
          <//>
          <${ButtonSecondary} onClick=${closeModal}> ${i18n._('Cancel')} <//>
        <//>
      <//>
    <//>
  `
}
