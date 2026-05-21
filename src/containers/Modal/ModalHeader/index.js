import { Close } from '@tetherto/pearpass-lib-ui-kit/icons'
import { html } from 'htm/react'

import { Header, HeaderChildrenWrapper } from './styles'

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
    html`<button
      onClick=${onClose}
      data-testid="modalheader-button-close"
      data-id=${closeButtonDataId}
      style=${{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '50%'
      }}
    >
      <${Close} width="20" height="20" />
    </button>`}
  <//>
`
