import { html } from 'htm/react'

import { Header, HeaderChildrenWrapper } from './styles'
import { ButtonRoundIcon, XIcon } from '../../../lib-react-components'

/**
 * @param {{
 *  onClose: () => void
 *  children: import('react').ReactNode
 *  showCloseButton?: boolean
 * }} props
 */
export const ModalHeader = ({
  onClose,
  children,
  showCloseButton = true
}) => html`
  <${Header}>
    <${HeaderChildrenWrapper}> ${children} <//>

    ${showCloseButton &&
    html`<${ButtonRoundIcon}
      onClick=${onClose}
      startIcon=${XIcon}
      data-testid="modalheader-button-close"
    />`}
  <//>
`
