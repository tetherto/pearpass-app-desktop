import { useMemo, useState } from 'react'

import { html } from 'htm/react'
import { useForm } from 'pear-apps-lib-ui-react-hooks'
import { Validator } from 'pear-apps-utils-validator'
import { PROTECTED_VAULT_ENABLED } from 'pearpass-lib-constants'
import { colors } from 'pearpass-lib-ui-theme-provider'
import { useCreateVault, useVault } from 'pearpass-lib-vault'
import { checkPasswordStrength } from 'pearpass-utils-password-check'

import {
  AccordionContent,
  AccordionFields,
  AccordionRow,
  AccordionSection,
  Actions,
  BackButton,
  BackButtonTitle,
  CancelButton,
  ContinueButtonWrapper,
  FieldGroup,
  HeaderTitle,
  InputIconWrapper,
  InputRow,
  InputRowLeft,
  VaultNameRow,
  InputText,
  Label,
  PasswordErrorRow,
  PasswordRequirements,
  PasswordRowRight,
  PasswordStrength,
  RequirementsItem,
  RequirementsList,
  IconOnlyButton,
  RoundArrowButton,
  Wrapper
} from './styles'
import { useGlobalLoading } from '../../../context/LoadingContext'
import { useRouter } from '../../../context/RouterContext'
import { useTranslation } from '../../../hooks/useTranslation'
import {
  ButtonPrimary,
  ErrorIcon,
  EyeClosedIcon,
  EyeIcon,
  LockCircleIcon,
  OkayIcon,
  YellowErrorIcon,
  NoticeText,
  SmallArrowIcon
} from '../../../lib-react-components'
import { getDeviceName } from '../../../utils/getDeviceName'
import { logger } from '../../../utils/logger'
import { ModalContent } from '../ModalContent'

/**
 * @param {{
 *  onClose: () => void
 *  onSuccess?: () => void
 * }} props
 */
export const CreateVaultModalContent = ({ onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { navigate } = useRouter()

  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useGlobalLoading({ isLoading })

  const schema = Validator.object({
    name: Validator.string().required(t('Name is required')),
    password: Validator.string(),
    passwordConfirm: Validator.string()
  })

  const { addDevice } = useVault()
  const { createVault } = useCreateVault()

  const { register, handleSubmit, setErrors } = useForm({
    initialValues: {
      name: '',
      password: '',
      passwordConfirm: ''
    },
    validate: (values) => schema.validate(values)
  })

  const nameField = register('name')

  const { onChange: onPasswordChange, ...passwordField } = register('password')
  const { onChange: onPasswordConfirmChange, ...passwordConfirmField } =
    register('passwordConfirm')

  const passwordStrengthResult = useMemo(
    () =>
      checkPasswordStrength(passwordField.value || '', {
        rules: {
          length: 12
        },
        errors: {
          minLength: t('Password must be at least 12 characters long'),
          hasLowerCase: t('Password is missing a lowercase letter'),
          hasUpperCase: t('Password is missing an uppercase letter'),
          hasNumbers: t('Password is missing a number'),
          hasSymbols: t('Password is missing a special character')
        }
      }),
    [passwordField.value, t]
  )

  const strengthIcon = useMemo(() => {
    switch (passwordStrengthResult.strengthType) {
      case 'error':
        return ErrorIcon
      case 'warning':
        return YellowErrorIcon
      case 'success':
        return OkayIcon
      default:
        return null
    }
  }, [passwordStrengthResult.strengthType])

  const submit = async (values) => {
    if (isLoading) {
      return
    }

    if (values.password) {
      const strengthResult = checkPasswordStrength(values.password, {
        rules: { length: 12 },
        errors: {
          minLength: t('Password must be at least 12 characters long'),
          hasLowerCase: t('Password is missing a lowercase letter'),
          hasUpperCase: t('Password is missing an uppercase letter'),
          hasNumbers: t('Password is missing a number'),
          hasSymbols: t('Password is missing a special character')
        }
      })

      if (!strengthResult.success) {
        setErrors({
          password:
            strengthResult.errors?.[0] || t('Password is not strong enough')
        })
        return
      }

      if (values.password !== values.passwordConfirm) {
        setErrors({
          passwordConfirm: t('Passwords do not match')
        })

        return
      }
    }

    try {
      setIsLoading(true)

      await createVault({
        name: values.name,
        password: values.password
      })

      await addDevice(getDeviceName())

      onSuccess?.()
      navigate('vault', { recordType: 'all' })

      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      logger.error('CreateVaultModalContent', 'Error creating vault:', error)
    }
  }

  return html` <${ModalContent}
    onClose=${onClose}
    onSubmit=${handleSubmit(submit)}
    showCloseButton=${false}
    borderColor=${colors.grey400.mode1}
    borderRadius="20px"
    headerChildren=${html`
      <${BackButtonTitle}>
        <${BackButton}
          type="button"
          onClick=${onClose}
          data-testid="createvault-back"
        >
          <${SmallArrowIcon} color=${colors.primary400.mode1} size="20" />
        <//>
        <${HeaderTitle}>${t('Create new Vault')}<//>
      <//>
    `}
  >
    <${Wrapper}>
      <${FieldGroup}>
        <${VaultNameRow}>
          <${InputRowLeft}>
            <${InputIconWrapper}>
              <${LockCircleIcon} size="24" color=${colors.white.mode1} />
            <//>
            <${InputText}
              placeholder=${t('Insert Vault name...')}
              autoFocus
              value=${nameField.value}
              disabled=${nameField.isDisabled}
              onChange=${(e) => nameField.onChange?.(e.target.value)}
            />
          <//>
        <//>

        ${!!nameField.error?.length &&
        html`<${NoticeText} text=${nameField.error} type="error" />`}
      <//>

      ${PROTECTED_VAULT_ENABLED
        ? html`
            <${AccordionSection}>
              <${AccordionRow}>
                <${Label}>${t('Set Vault Password (optional)')}<//>
                <${RoundArrowButton}
                  type="button"
                  $isOpen=${isPasswordOpen}
                  onClick=${() => setIsPasswordOpen(!isPasswordOpen)}
                  data-testid="createvault-password-toggle"
                >
                  <${SmallArrowIcon}
                    color=${colors.primary400.mode1}
                    size="20"
                  />
                <//>
              <//>
              <${AccordionContent} $isOpen=${isPasswordOpen}>
                <${AccordionFields}>
                  <${InputRow}>
                    <${InputRowLeft}>
                      <${InputText}
                        placeholder=${t('Create Vault Password (optional)')}
                        value=${passwordField.value}
                        disabled=${passwordField.isDisabled}
                        type=${isPasswordVisible ? 'text' : 'password'}
                        onChange=${(e) => onPasswordChange?.(e.target.value)}
                      />
                    <//>
                    <${PasswordRowRight}>
                      ${passwordField.value?.length
                        ? html`
                            <${PasswordStrength}
                              strength=${passwordStrengthResult.type}
                            >
                              ${strengthIcon && html`<${strengthIcon} />`}
                              ${t(passwordStrengthResult.strengthText)}
                            <//>
                          `
                        : null}
                      <${IconOnlyButton}
                        type="button"
                        onClick=${() =>
                          setIsPasswordVisible(!isPasswordVisible)}
                        data-testid="createvault-password-visibility"
                      >
                        ${isPasswordVisible
                          ? html`
                              <${EyeClosedIcon}
                                color=${colors.primary400.mode1}
                              />
                            `
                          : html`
                              <${EyeIcon} color=${colors.primary400.mode1} />
                            `}
                      <//>
                    <//>
                  <//>
                  <${InputRow}>
                    <${InputRowLeft}>
                      <${InputText}
                        placeholder=${t('Repeat Vault Password')}
                        value=${passwordConfirmField.value}
                        disabled=${passwordConfirmField.isDisabled}
                        type=${isPasswordConfirmVisible ? 'text' : 'password'}
                        onChange=${(e) =>
                          onPasswordConfirmChange?.(e.target.value)}
                      />
                    <//>
                    <${PasswordRowRight}>
                      <${IconOnlyButton}
                        type="button"
                        onClick=${() =>
                          setIsPasswordConfirmVisible(
                            !isPasswordConfirmVisible
                          )}
                        data-testid="createvault-passwordconfirm-visibility"
                      >
                        ${isPasswordConfirmVisible
                          ? html`
                              <${EyeClosedIcon}
                                color=${colors.primary400.mode1}
                              />
                            `
                          : html`
                              <${EyeIcon} color=${colors.primary400.mode1} />
                            `}
                      <//>
                    <//>
                  <//>
                  ${passwordConfirmField.error?.length
                    ? html`
                        <${PasswordErrorRow}>
                          <${ErrorIcon} />
                          ${passwordConfirmField.error}
                        <//>
                      `
                    : passwordField.error?.length
                      ? html`
                          <${PasswordErrorRow}>
                            <${ErrorIcon} />
                            ${passwordField.error}
                          <//>
                        `
                      : passwordField.value?.length &&
                          passwordStrengthResult.errors?.length
                        ? html`
                            <${PasswordErrorRow}>
                              <${ErrorIcon} />
                              ${passwordStrengthResult.errors[0]}
                            <//>
                          `
                        : null}
                  <${PasswordRequirements}>
                    <span>
                      ${t(
                        'Your password must be at least 12 characters long and include at least one of each:'
                      )}
                    </span>
                    <${RequirementsList}>
                      <${RequirementsItem}>${t('Uppercase Letter (A-Z)')}<//>
                      <${RequirementsItem}>${t('Lowercase Letter (a-z)')}<//>
                      <${RequirementsItem}>${t('Number (0-9)')}<//>
                      <${RequirementsItem}>
                        ${t('Special Character (! @ # $...)')}
                      <//>
                    <//>
                    <span>
                      ${t('Note: Avoid common words and personal information.')}
                    </span>
                  <//>
                <//>
              <//>
            <//>
          `
        : null}

      <${Actions}>
        <${ContinueButtonWrapper}>
          <${ButtonPrimary}
            type="submit"
            size="lg"
            testId="createvault-continue"
          >
            ${t('Continue')}
          <//>
        <//>

        <${CancelButton}
          type="button"
          onClick=${onClose}
          data-testid="createvault-cancel"
        >
          ${t('Cancel')}
        <//>
      <//>
    <//>
  <//>`
}
