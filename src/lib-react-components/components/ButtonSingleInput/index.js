import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  startIcon: import('react').ElementType
 *  variant: 'default' | 'bordered',
 *  rounded: 'default' | 'md'
 *  type?: 'button' | 'submit'
 *  onClick: () => void,
 *  testId?: string
 * }} props
 */
export const ButtonSingleInput = ({
  children,
  startIcon,
  variant = 'default',
  rounded = 'default',
  type = 'button',
  onClick,
  testId = 'button-single-input'
}) => html`
  <${Button}
    data-testid=${testId}
    onClick=${onClick}
    variant=${variant}
    rounded=${rounded}
    type=${type}
  >
    ${startIcon && html`<${startIcon} size="24" />`} ${children}
  <//>
`
