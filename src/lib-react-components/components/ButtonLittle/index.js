import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  variant?: 'primary' | 'secondary'
 *  startIcon?: import('react').ElementType
 *  type?: 'button' | 'submit'
 *  onClick: () => void,
 *  testId?: string
 * }} props
 */
export const ButtonLittle = ({
  children,
  startIcon,
  variant = 'primary',
  type = 'button',
  onClick,
  testId
}) => html`
  <${Button}
    data-testid=${testId}
    type=${type}
    variant=${variant}
    onClick=${onClick}
    isIconOnly=${!children}
  >
    ${startIcon && html`<${startIcon} size="24px" />`} ${children}
  <//>
`
