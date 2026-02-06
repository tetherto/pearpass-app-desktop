import { html } from 'htm/react'

import { Header, HeaderChildrenWrapper } from './styles'
import { ButtonRoundIcon, XIcon } from '../../../lib-react-components'

/**
 * @param {{
 *  onClose: () => void
 *  children: import('react').ReactNode
 *  showCloseButton?: boolean
 *  closeButtonDataId?: string
 * }} props
 */
export const ModalHeader = ({
  onClose,
  children,
  showCloseButton = true,
  closeButtonDataId
}) => html`
  <${Header}>
    <${HeaderChildrenWrapper}> ${children} <//>

    ${showCloseButton &&
    html`<${ButtonRoundIcon}
      onClick=${onClose}
      startIcon=${XIcon}
      testId="modalheader-button-close"
      dataId=${closeButtonDataId}
    />`}
  <//>
`
