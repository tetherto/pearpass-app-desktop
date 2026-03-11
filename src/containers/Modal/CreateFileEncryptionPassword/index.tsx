import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'

import { FormModalHeaderWrapper } from '../../../components/FormModalHeaderWrapper'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  ButtonPrimary,
  PearPassPasswordField
} from '../../../lib-react-components'
import { logger } from '../../../utils/logger'
import { ModalContent } from '../ModalContent'
import { Description, Header, Title, UnlockVaultContainer } from './styles'

interface props {
  onSubmit: (password: string) => Promise<void>
}

/**
 *
 * @param {Object} props
 * @param {(password: string) => Promise<void>} props.onSubmit
 */
export const CreateFileEncryptionPassword = ({ onSubmit }: props) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required')),
    confirmPassword: Validator.string().required(
      t('Confirm password is required')
    )
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validate: (values: { password: string; confirmPassword: string }) =>
      schema.validate(values)
  })

  const submit = async (values: {
    password: string
    confirmPassword: string
  }) => {
    try {
      if (values.password !== values.confirmPassword) {
        setErrors({
          confirmPassword: t('Passwords do not match')
        })
        return
      }

      setIsLoading(true)

      await onSubmit?.(values.password)

      setIsLoading(false)
    } catch (error) {
      logger.error('CreateFileEncryptionPassword', error)

      setIsLoading(false)

      setErrors({
        password: t('Invalid password')
      })
    }
  }

  return html` <${ModalContent}
    onClose=${closeModal}
    headerChildren=${html`
      <${FormModalHeaderWrapper}>
        <${Header}>
          <${Title}> ${t('Are you sure to encrypt your Vault?')} <//>
          <${Description}>
            ${t('This will create a password for your exported file.')}<//
          >
        <//>
      <//>
    `}
  >
    <${UnlockVaultContainer} onSubmit=${handleSubmit(submit)}>
      <${PearPassPasswordField}
        placeholder=${t('Set file password')}
        ...${register('password')}
      />
      <${PearPassPasswordField}
        placeholder=${t('Repeat file password')}
        ...${register('confirmPassword')}
      />

      <${ButtonPrimary} type="submit"> ${t('Export')} <//>
    <//>
  <//>`
}
