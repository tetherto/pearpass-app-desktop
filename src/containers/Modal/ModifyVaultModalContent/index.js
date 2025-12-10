import { useEffect, useState, useMemo } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { PROTECTED_VAULT_ENABLED } from 'pearpass-lib-constants'
import { useVault } from 'pearpass-lib-vault'

import { RadioSelect } from '../../../components/RadioSelect'
import { useLoadingContext } from '../../../context/LoadingContext'
import { useModal } from '../../../context/ModalContext'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  ButtonPrimary,
  ButtonSecondary,
  PearPassInputField,
  PearPassPasswordField
} from '../../../lib-react-components'
import { logger } from '../../../utils/logger'
import { ModalContent } from '../ModalContent'
import {
  Content,
  InputLabel,
  InputWrapper,
  ModalActions,
  ModalTitle,
  Wrapper
} from './styles'

const UPDATE_MODE = {
  NAME: 'name',
  PASSWORD: 'password'
}

export const ModifyVaultModalContent = ({ vaultId, vaultName }) => {
  const { t } = useTranslation()
  const { closeModal } = useModal()

  const {
    isVaultProtected,
    updateUnprotectedVault,
    updateProtectedVault,
    refetch: refetchVault
  } = useVault()

  const [isProtected, setIsProtected] = useState(false)
  const [selectedOption, setSelectedOption] = useState(UPDATE_MODE.NAME)
  const { setIsLoading } = useLoadingContext()

  const radioOptions = useMemo(
    () =>
      PROTECTED_VAULT_ENABLED
        ? [
            { label: t('Change Vault Name'), value: UPDATE_MODE.NAME },
            { label: t('Change Vault Password'), value: UPDATE_MODE.PASSWORD }
          ]
        : [],
    [t, PROTECTED_VAULT_ENABLED]
  )

  const getInitialValues = (option) => {
    if (option === UPDATE_MODE.PASSWORD) {
      return {
        currentPassword: '',
        newPassword: '',
        repeatPassword: ''
      }
    } else {
      return {
        name: vaultName,
        currentPassword: ''
      }
    }
  }

  const getSchema = () => {
    if (selectedOption === UPDATE_MODE.PASSWORD) {
      return Validator.object({
        currentPassword: isProtected
          ? Validator.string().required(t`Current password is required`)
          : Validator.string(),
        newPassword: Validator.string().required(t`New password is required`),
        repeatPassword: Validator.string().required(t`Please repeat password`)
      })
    } else {
      return Validator.object({
        name: Validator.string().required(t`Name is required`),
        currentPassword: isProtected
          ? Validator.string().required(t`Current password is required`)
          : Validator.string()
      })
    }
  }

  const { register, handleSubmit, setErrors, setValues } = useForm({
    initialValues: getInitialValues(selectedOption),
    validate: (values) => getSchema().validate(values)
  })

  const handleOptionChange = (option) => {
    setSelectedOption(option)
    setValues(getInitialValues(option))
    setErrors({})
  }

  const onSubmit = async (values) => {
    if (values.newPassword !== values.repeatPassword) {
      setErrors({
        repeatPassword: t('Passwords do not match')
      })

      return
    }

    if (isProtected && !values.currentPassword?.length) {
      setErrors({
        currentPassword: t('Current password is required')
      })

      return
    }

    try {
      setIsLoading(true)

      const name = selectedOption === UPDATE_MODE.NAME ? values.name : vaultName
      const password =
        selectedOption === UPDATE_MODE.PASSWORD ? values.newPassword : undefined

      if (isProtected) {
        await updateProtectedVault(vaultId, {
          name,
          password,
          currentPassword: values.currentPassword
        })
      } else {
        await updateUnprotectedVault(vaultId, {
          name,
          password
        })
      }

      setIsLoading(false)

      closeModal()
    } catch (error) {
      setIsLoading(false)
      logger.error('ModifyVaultModalContent', 'Error updating vault:', error)
      setErrors({
        currentPassword: t('Invalid password')
      })
    }
  }

  useEffect(() => {
    const checkProtection = async () => {
      const result = await isVaultProtected(vaultId)
      setIsProtected(result)
    }
    checkProtection()
  }, [vaultId])

  useEffect(() => {
    refetchVault()
  }, [])

  return html` <${ModalContent}
    onClose=${closeModal}
    headerChildren=${html` <${ModalTitle}> ${t('Modify Vault')} <//>`}
  >
    <${Wrapper}>
      <${RadioSelect}
        options=${radioOptions}
        selectedOption=${selectedOption}
        onChange=${handleOptionChange}
      />

      <${Content}>
        ${selectedOption === UPDATE_MODE.NAME &&
        html`
          <${InputWrapper}>
            <${InputLabel}> ${t('Insert vault name')} <//>
            <${PearPassInputField} ...${register('name')} />
          <//>
        `}
        ${isProtected &&
        PROTECTED_VAULT_ENABLED &&
        html`
          <${InputWrapper}>
            <${InputLabel}> ${t('Insert old password')} <//>
            <${PearPassPasswordField} ...${register('currentPassword')} />
          <//>
        `}
        ${selectedOption === UPDATE_MODE.PASSWORD &&
        html`
          <${InputWrapper}>
            <${InputLabel}> ${t('Create new password')} <//>
            <${PearPassPasswordField} ...${register('newPassword')} />
          <//>
          <${InputWrapper}>
            <${InputLabel}> ${t('Repeat new password')} <//>
            <${PearPassPasswordField} ...${register('repeatPassword')} />
          <//>
        `}
        <${ModalActions}>
          <${ButtonPrimary} onClick=${handleSubmit(onSubmit)}>
            ${t('Continue')}
          <//>
          <${ButtonSecondary} onClick=${closeModal}> ${t('Cancel')} <//>
        <//>
      <//>
    <//>
  <//>`
}
