import { useMemo } from 'react'

import { useLingui } from '@lingui/react'
import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'

import { Description, Header, Title, UnlockVaultContainer } from './styles'
import { FormModalHeaderWrapper } from '../../../components/FormModalHeaderWrapper'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import {
  ButtonPrimary,
  PearPassPasswordField
} from '../../../lib-react-components'
import { logger } from '../../../utils/logger'
import { ModalContent } from '../ModalContent'

/**
 *
 * @param {Object} props
 * @param {Object} props.vault
 * @param {string} props.vault.id
 * @param {string} [props.vault.name]
 */
export const VaultPasswordFormModalContent = ({ vault, onSubmit }) => {
  const { i18n } = useLingui()
  const { closeModal } = useModal()
  const { setIsLoading } = useLoadingContext()

  const schema = Validator.object({
    password: Validator.string().required(i18n._('Password is required'))
  })

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      password: ''
    },
    validate: (values) => schema.validate(values)
  })

  const submit = async (values) => {
    if (!vault.id) {
      return
    }

    try {
      setIsLoading(true)

      await onSubmit?.(values.password)

      setIsLoading(false)
    } catch (error) {
      logger.error('VaultPasswordFormModalContent', error)

      setIsLoading(false)

      setErrors({
        password: i18n._('Invalid password')
      })
    }
  }

  const titles = useMemo(
    () => ({
      title: i18n._('Enter Your Vault Password'),
      description: i18n._(
        'Unlock your {vaultName} Vault to access your stored passwords.',
        {
          vaultName: vault.name ?? vault.id
        }
      )
    }),
    []
  )

  return html` <${ModalContent}
    onClose=${closeModal}
    headerChildren=${html`
      <${FormModalHeaderWrapper}>
        <${Header}>
          <${Title}> ${titles.title} <//>
          <${Description}> ${titles.description}<//>
        <//>
      <//>
    `}
  >
    <${UnlockVaultContainer} onSubmit=${handleSubmit(submit)}>
      <${PearPassPasswordField} ...${register('password')} />

      <${ButtonPrimary} type="submit"> ${i18n._('Unlock Vault')} <//>
    <//>
  <//>`
}
