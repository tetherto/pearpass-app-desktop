import React, { useState } from 'react'

import { html } from 'htm/react'
import {
  checkPassphraseStrength,
  checkPasswordStrength
} from 'pearpass-utils-password-check'

import { PasswordStrongnessWrapper } from './styles'
import { useTranslation } from '../../../hooks/useTranslation'
import { ErrorIcon } from '../../icons/ErrorIcon'
import { EyeClosedIcon } from '../../icons/EyeClosedIcon'
import { EyeIcon } from '../../icons/EyeIcon'
import { KeyIcon } from '../../icons/KeyIcon'
import { OkayIcon } from '../../icons/OkayIcon'
import { YellowErrorIcon } from '../../icons/YellowErrorIcon'
import { ButtonRoundIcon } from '../ButtonRoundIcon'
import { HighlightString } from '../HighlightString'
import { InputField } from '../InputField'

const PASSWORD_STRENGTH_ICONS = {
  error: ErrorIcon,
  warning: YellowErrorIcon,
  success: OkayIcon
}

/**
 * @param {{
 *  value: string,
 *  onChange: (value: string) => void,
 *  label: string,
 *  error: string,
 *  passType: 'password' | 'passphrase',
 *  additionalItems: import('react').ReactNode,
 *  belowInputContent: import('react').ReactNode,
 *  placeholder: string,
 *  isDisabled: boolean,
 *  hasStrongness: boolean,
 *  onClick: () => void,
 *  variant?: 'default' | 'outline'
 *  icon: import('react').ReactNode,
 *  testId?: string
 * }} props
 */
export const PasswordField = ({
  value,
  onChange,
  label,
  error,
  passType = 'password',
  additionalItems,
  belowInputContent,
  placeholder,
  isDisabled,
  hasStrongness = false,
  onClick,
  variant = 'default',
  icon,
  testId = 'password-field'
}) => {
  const { t } = useTranslation()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleChange = (value) => {
    onChange?.(value)
  }

  const getPasswordStrongness = () => {
    if (!value?.length) {
      return null
    }

    const { success, type, strengthType, strengthText } =
      passType === 'password'
        ? checkPasswordStrength(value)
        : checkPassphraseStrength(value)

    if (!success) {
      return null
    }

    const icon = PASSWORD_STRENGTH_ICONS[strengthType]

    return html`
      <${PasswordStrongnessWrapper} strength=${type}>
        <${icon} />
        ${t(strengthText)}
      <//>
    `
  }

  return html`
    <${InputField}
      testId=${testId}
      label=${label || 'Password'}
      icon=${icon || KeyIcon}
      isDisabled=${isDisabled}
      value=${value}
      overlay=${isPasswordVisible
        ? html` <${HighlightString} text=${value} /> `
        : null}
      onChange=${handleChange}
      onClick=${onClick}
      placeholder=${placeholder}
      error=${error}
      variant=${variant}
      belowInputContent=${belowInputContent}
      additionalItems=${html`
        <${React.Fragment}>
          ${!!hasStrongness && getPasswordStrongness()}

          <${ButtonRoundIcon}
            testId="passwordfield-button-togglevisibility"
            startIcon=${isPasswordVisible ? EyeClosedIcon : EyeIcon}
            onClick=${(e) => {
              e.stopPropagation()
              setIsPasswordVisible(!isPasswordVisible)
            }}
          />

          ${additionalItems}
        <//>
      `}
      type=${isPasswordVisible ? 'text' : 'password'}
    />
  `
}
