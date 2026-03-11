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
import {
  Description,
  Header,
  Title,
  UnlockVaultContainer
} from '../CreateFileEncryptionPassword/styles'

interface props {
  onSubmit: (password: string) => Promise<void>
}

/**
 *
 * @param {Object} props
 * @param {(password: string) => Promise<void>} props.onSubmit
 */
export const DecryptFilePassword = ({ onSubmit }: props) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required'))
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      password: ''
    },
    validate: (values: { password: string }) => schema.validate(values)
  })

  const submit = async (values: { password: string }) => {
    try {
      setIsLoading(true)

      await onSubmit?.(values.password)

      setIsLoading(false)
      closeModal()
    } catch (error) {
      logger.error('DecryptFilePassword', error)

      setIsLoading(false)

      setErrors({
        password: t('Invalid password or corrupted file')
      })
    }
  }

  return html` <${ModalContent}
    onClose=${closeModal}
    headerChildren=${html`
      <${FormModalHeaderWrapper}>
        <${Header}>
          <${Title}> ${t('Enter decryption password')} <//>
          <${Description}>
            ${t('Enter the password used to encrypt this file.')}<//
          >
        <//>
      <//>
    `}
  >
    <${UnlockVaultContainer} onSubmit=${handleSubmit(submit)}>
      <${PearPassPasswordField}
        placeholder=${t('File password')}
        ...${register('password')}
      />

      <${ButtonPrimary} type="submit"> ${t('Import')} <//>
    <//>
  <//>`
}
