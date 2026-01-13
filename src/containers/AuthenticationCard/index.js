import { useState } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { useUserData } from 'pearpass-lib-vault'
import {
  stringToBuffer,
  clearBuffer
} from 'pearpass-lib-vault/src/utils/buffer'

import { ButtonWrapper, CardContainer, CardTitle, Title } from './styles.js'
import { useGlobalLoading } from '../../context/LoadingContext.js'
import { useTranslation } from '../../hooks/useTranslation.js'
import {
  ButtonPrimary,
  PearPassPasswordField
} from '../../lib-react-components/index.js'
import { logger } from '../../utils/logger.js'

/**
 * Authentication card component that provides master password input form for authentication.
 * Validates the master password and calls the onSuccess callback upon successful authentication.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title displayed at the top of the card
 * @param {string} props.buttonLabel - The label text for the submit button
 * @param {React.ReactNode} [props.descriptionComponent] - Optional component to display additional description or content below the password field
 * @param {Function} [props.onSuccess] - Optional callback function invoked after successful authentication, receives the password as an argument
 * @param {Function} [props.onError] - Optional callback function invoked after failed authentication, receives the error and setErrors function
 * @param {Object} [props.style] - Optional CSS styles to apply to the card container
 * @returns {React.ReactElement} The authentication card component
 */
export const AuthenticationCard = ({
  title,
  buttonLabel,
  descriptionComponent,
  onSuccess,
  onError,
  style
}) => {
  const { t } = useTranslation()

  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required'))
  })

  const { logIn } = useUserData()

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: { password: '' },
    validate: (values) => schema.validate(values)
  })

  const onSubmit = async (values) => {
    if (isLoading) {
      return
    }

    if (!values.password) {
      setErrors({
        password: t('Password is required')
      })

      return
    }

    const passwordBuffer = stringToBuffer(values.password)
    try {
      setIsLoading(true)

      await logIn({ password: passwordBuffer })

      await onSuccess?.(passwordBuffer)

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

      if (onError) {
        await onError(error, setErrors)
      } else {
        setErrors({
          password: t('Invalid password')
        })
      }

      logger.error(
        'AuthenticationCard',
        'Error unlocking with master password:',
        error
      )
    } finally {
      clearBuffer(passwordBuffer)
    }
  }

  return html`
    <${CardContainer} onSubmit=${handleSubmit(onSubmit)} style=${style}>
      <${CardTitle}>
        <${Title} data-testid="login-title"> ${title}<//>
      <//>

      <${PearPassPasswordField}
        testId="login-password-input"
        placeholder=${t('Master password')}
        ...${register('password')}
      />

      ${descriptionComponent}

      <${ButtonWrapper}>
        <${ButtonPrimary} testId="login-continue-button" type="submit">
          ${buttonLabel}
        <//>
      <//>
    <//>
  `
}
