import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { ButtonContainer, IconWrapper } from './styles'

/**
 * @param {{
 *    startIcon?: import('react').ElementType,
 *    endIcon?: import('react').ElementType,
 *    children: import('react').ReactNode,
 *    type?: 'button' | 'submit',
 *    onClick: () => void
 * }} props
 */
export const ButtonCreate = ({
  startIcon,
  endIcon,
  children,
  type = 'button',
  onClick
}) => html`
  <${ButtonContainer} onClick=${() => onClick()} type=${type}>
    <${IconWrapper}>
      ${startIcon &&
      html`<${startIcon} color=${colors.black.mode1} size="24" />`}
    <//>
    ${children}
    <${IconWrapper}>
      ${endIcon && html`<${endIcon} color=${colors.black.mode1} size="24" />`}
    <//>
  <//>
`
