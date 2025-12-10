import { html } from 'htm/react'

import { NoticeTextComponent, NoticeTextWrapper } from './styles'
import { ErrorIcon } from '../../icons/ErrorIcon'
import { OkayIcon } from '../../icons/OkayIcon'
import { YellowErrorIcon } from '../../icons/YellowErrorIcon'

/**
 * @param {{
 *  text: string
 *  type: 'success' | 'error' | 'warning'
 * }} props
 */
export const NoticeText = ({ text, type = 'success' }) => {
  const getIconByType = () => {
    switch (type) {
      case 'success':
        return OkayIcon
      case 'error':
        return ErrorIcon
      case 'warning':
        return YellowErrorIcon
      default:
        return null
    }
  }

  return html`
    <${NoticeTextWrapper}>
      <${getIconByType()} size="10px" />
      <${NoticeTextComponent} type=${type}> ${text} <//>
    <//>
  `
}
