import { useState } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { TERMS_OF_USE } from 'pearpass-lib-constants'
import { useUserData } from 'pearpass-lib-vault'
import {
  stringToBuffer,
  clearBuffer
} from 'pearpass-lib-vault/src/utils/buffer'
import { checkPasswordStrength } from 'pearpass-utils-password-check'

import {
  ButtonWrapper,
  CardContainer,
  CardTitle,
  Description,
  InputGroup,
  InputLabel,
  RadioGroup,
  RadioText,
  RadioTextBold,
  Title,
  RequirementsContainer,
  BulletList,
  BulletItem,
  NoteText
} from './styles'
import { AlertBox } from '../../../components/AlertBox'
import { LOCAL_STORAGE_KEYS } from '../../../constants/localStorage'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  ButtonPrimary,
  ButtonRadio,
  PearPassPasswordField
} from '../../../lib-react-components'
import { logger } from '../../../utils/logger'

export const CardCreateMasterPassword = () => {
  const { t } = useTranslation()
  const { currentPage, navigate } = useRouter()
  const [isAgreed, setIsAgreed] = useState(false)
  const [termsOfUseError, setTermsOfUseError] = useState(false)

  const errors = {
    minLength: t(`Password must be at least 8 characters long`),
    hasLowerCase: t('Password must contain at least one lowercase letter'),
    hasUpperCase: t('Password must contain at least one uppercase letter'),
    hasNumbers: t('Password must contain at least one number'),
    hasSymbols: t('Password must contain at least one special character')
  }

  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const { createMasterPassword } = useUserData()

  const schema = Validator.object({
    password: Validator.string().required(t('Password is required')),
    passwordConfirm: Validator.string().required(t('Password is required'))
  })

  const { register, handleSubmit, setErrors, setValue } = useForm({
    initialValues: {
      password: '',
      passwordConfirm: ''
    },
    validate: (values) => schema.validate(values)
  })

  const { onChange: onPasswordChange, ...passwordRegisterProps } =
    register('password')

  const handlePasswordChange = (val) => {
    onPasswordChange(val)

    if (!val) {
      setErrors({})
      return
    }

    validateMasterPassword(val)
  }

  const validateMasterPassword = (password) => {
    const result = checkPasswordStrength(password, { errors })

    if (!result.success) {
      setErrors({
        password: result.errors[0]
      })

      return false
    }

    setErrors({})
    return true
  }

  const onSubmit = async (values) => {
    if (isLoading) {
      return
    }

    if (!isAgreed) {
      setTermsOfUseError(true)
      return
    }

    const isValid = validateMasterPassword(values.password)

    if (!isValid) {
      setValue('passwordConfirm', '')
      return
    }

    if (values.password !== values.passwordConfirm) {
      setErrors({
        passwordConfirm: t('Passwords do not match')
      })

      return
    }

    const passwordBuffer = stringToBuffer(values.password)
    try {
      setIsLoading(true)

      await createMasterPassword(passwordBuffer)

      navigate(currentPage, { state: 'masterPassword' })

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)

      setErrors({
        password: t('Error creating master password')
      })

      logger.error(
        'useGetMultipleFiles',
        'Error creating master password:',
        error
      )
    } finally {
      clearBuffer(passwordBuffer)
    }
  }

  const handleTOUToggle = () => {
    if (isAgreed) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOU_ACCEPTED)
      setIsAgreed(false)
      setTermsOfUseError(false)
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOU_ACCEPTED, 'true')
      setIsAgreed(true)
      setTermsOfUseError(false)
    }
  }

  return html`
    <${CardContainer} onSubmit=${handleSubmit(onSubmit)}>
      <${CardTitle}>
        <${Title}> ${t('Create Master Password')} <//>

        <${Description}>
          ${t(
            'The first thing to do is create a Master password to secure your account. You’ll use this password to access PearPass. '
          )}
        <//>
      <//>

      <${InputGroup}>
        <${InputLabel}> ${t('Master Password')} <//>
        <${PearPassPasswordField}
          ...${passwordRegisterProps}
          onChange=${handlePasswordChange}
        />
      <//>

      <${InputGroup}>
        <${InputLabel}> ${t('Confirm Master Password')} <//>
        <${PearPassPasswordField} ...${register('passwordConfirm')} />
      <//>

      <${RequirementsContainer}>
        <span>
          ${t(
            'Your password must be at least 8 characters long and include at least one of each:'
          )}
        </span>
        <${BulletList}>
          <${BulletItem}>${t('Uppercase Letter (A-Z)')}<//>
          <${BulletItem}>${t('Lowercase Letter (a-z)')}<//>
          <${BulletItem}>${t('Number (0-9)')}<//>
          <${BulletItem}> ${t('Special Character (! @ # $...)')} <//>
        <//>
        <${NoteText}>
          ${t('Note: Avoid common words and personal information.')}
        <//>
      <//>

      <${AlertBox}
        message=${t(
          'Don’t forget your master password. It’s the only way to access your vault. We can’t help recover it. Back it up securely.'
        )}
      />

      <${InputGroup}>
        <${InputLabel}> ${t('PearPass Terms of Use')} <//>
        <${RadioGroup} onClick=${handleTOUToggle} isError=${termsOfUseError}>
          <${ButtonRadio} isActive=${isAgreed} />
          <${RadioText}>
            ${t('I have read and agree to the')} ${' '}
            <${RadioTextBold} href=${TERMS_OF_USE}>
              ${t('PearPass Application Terms of Use.')}
            <//>
          <//>
        <//>
      <//>

      <${ButtonWrapper}>
        <${ButtonPrimary} type="submit"> ${t('Continue')} <//>
      <//>
    <//>
  `
}
