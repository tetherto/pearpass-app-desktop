import { html } from 'htm/react'
import { colors } from 'pearpass-lib-ui-theme-provider'

import { Button } from './styles'

/**
 * @param {{
 *  children?: import('react').ReactNode
 *  startIcon: import('react').ElementType
 *  onClick: () => void
 *  iconSize?: string,
 *  testId?: string,
 *  dataId?: string
 * }} props
 */
export const ButtonRoundIcon = ({
  children,
  startIcon,
  onClick,
  iconSize,
  testId = 'button-round-icon',
  dataId
}) => html`
  <${Button}
    type="button"
    onClick=${onClick}
    data-testid=${testId}
    data-id=${dataId}
  >
    ${startIcon &&
    html`<${startIcon}
      color=${colors.primary400.mode1}
      size=${iconSize || '24'}
    />`}
    ${children}
  <//>
`
