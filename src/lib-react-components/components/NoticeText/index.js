import {
  Check,
  ErrorFilled,
  ReportProblem
} from '@tetherto/pearpass-lib-ui-kit/icons'
import { html } from 'htm/react'

import { NoticeTextComponent, NoticeTextWrapper } from './styles'

/**
 * @param {{
 *  text: string
 *  type: 'success' | 'error' | 'warning'
 *  testId?: string
 * }} props
 */
export const NoticeText = ({ text, type = 'success', testId }) => {
  const getIconByType = () => {
    switch (type) {
      case 'success':
        return Check
      case 'error':
        return ErrorFilled
      case 'warning':
        return ReportProblem
      default:
        return null
    }
  }

  const Icon = getIconByType()

  return html`
    <${NoticeTextWrapper}>
      ${Icon && html`<${Icon} width="10" height="10" />`}
      <${NoticeTextComponent} data-testid=${testId} type=${type}> ${text} <//>
    <//>
  `
}
