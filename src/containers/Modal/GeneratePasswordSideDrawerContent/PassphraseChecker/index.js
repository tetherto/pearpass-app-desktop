import { html } from 'htm/react'
import { checkPassphraseStrength } from 'pearpass-utils-password-check'

import { useTranslation } from '../../../../hooks/useTranslation'
import { HighlightString, NoticeText } from '../../../../lib-react-components'
import { PasswordWrapper } from '../styles'

/**
 * @param {{
 *  pass: Array<string>
 *  rules: {
 *   capitalLetters: boolean,
 *   symbols: boolean,
 *   numbers: boolean,
 *   words: number
 *  }
 * }} props
 */
export const PassphraseChecker = ({ pass }) => {
  const { t } = useTranslation()

  const { strengthText, strengthType } = checkPassphraseStrength(pass)

  return html` <${PasswordWrapper}>
    <${HighlightString} text=${pass && pass.join('-')} />
    <${NoticeText} text=${t(strengthText)} type=${strengthType} />
  <//>`
}
