import { html } from 'htm/react'
import { checkPasswordStrength } from 'pearpass-utils-password-check'

import { useTranslation } from '../../../../hooks/useTranslation'
import { HighlightString, NoticeText } from '../../../../lib-react-components'
import { PasswordWrapper } from '../styles'
/**
 * @param {{
 *  pass: string
 *  rules: {
 *    specialCharacters: boolean,
 *    characters: number
 *  }
 * }} props
 */
export const PasswordChecker = ({ pass }) => {
  const { t } = useTranslation()

  const { strengthText, strengthType } = checkPasswordStrength(pass)

  return html` <${PasswordWrapper}>
    <${HighlightString} text=${pass} />
    <${NoticeText} text=${t(strengthText)} type=${strengthType} />
  <//>`
}
