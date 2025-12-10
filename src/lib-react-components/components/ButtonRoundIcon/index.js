import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  startIcon: import('react').ElementType
 *  onClick: () => void
 *  iconSize?: string
 * }} props
 */
export const ButtonRoundIcon = ({
  children,
  startIcon,
  onClick,
  iconSize
}) => html`
  <${Button} type="button" onClick=${onClick}>
    ${startIcon &&
    html`<${startIcon}
      color=${colors.primary400.mode1}
      size=${iconSize || '24'}
    />`}
    ${children}
  <//>
`
