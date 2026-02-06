import { html } from 'htm/react'

import { Wrapper } from './styles'
import { ModalHeader } from '../ModalHeader'

/**
 * @param {{
 *  onClose: () => void
 *  headerChildren: import('react').ReactNode
 *  children: import('react').ReactNode
 *  onSubmit?: () => void
 *  showCloseButton?: boolean
 *  borderColor?: string
 *  borderRadius?: string
 *  closeButtonDataId?: string
 * }} props
 */
export const ModalContent = ({
  onClose,
  onSubmit,
  headerChildren,
  children,
  showCloseButton = true,
  borderColor,
  borderRadius,
  closeButtonDataId
}) => html`
  <${Wrapper} $borderColor=${borderColor} $borderRadius=${borderRadius}>
    <${onSubmit ? 'form' : 'div'}
      onSubmit=${(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <${ModalHeader}
        onClose=${onClose}
        showCloseButton=${showCloseButton}
        closeButtonDataId=${closeButtonDataId}
      >
        ${headerChildren}
      <//>

      <div>${children}</div>
    <//>
  <//>
`
