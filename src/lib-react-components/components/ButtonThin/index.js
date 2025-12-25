import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  startIcon: import('react').ElementType
 *  endIcon: import('react').ElementType
 *  variant: 'black' | 'grey'
 *  type?: 'button' | 'submit'
 *  onClick: () => void,
 *  testId?: string
 * }} props
 */
export const ButtonThin = ({
  children,
  startIcon,
  endIcon,
  variant = 'black',
  type = 'button',
  onClick,
  testId = 'button-thin'
}) => html`
  <${Button}
    data-testid=${testId}
    variant=${variant}
    onClick=${onClick}
    type=${type}
  >
    ${startIcon && html`<${startIcon} size="24" />`} ${children}
    ${endIcon && html`<${endIcon} size="24" />`}
  <//>
`
