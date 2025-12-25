import { html } from 'htm/react'

import { Header, HeaderChildrenWrapper } from './styles'
import { ButtonRoundIcon, XIcon } from '../../../lib-react-components'

/**
 * @param {{
 *  onClose: () => void
 *  children: import('react').ReactNode
 * }} props
 */
export const ModalHeader = ({ onClose, children }) => html`
  <${Header}>
    <${HeaderChildrenWrapper}> ${children} <//>

    <${ButtonRoundIcon}
      onClick=${onClose}
      startIcon=${XIcon}
      data-testid="modalheader-button-close"
    />
  <//>
`
