import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  variant?: 'primary' | 'secondary'
 *  startIcon?: import('react').ElementType
 *  isDisabled?: boolean
 *  type?: 'button' | 'submit'
 *  onClick: () => void
 * }} props
 */
export const ButtonFilter = ({
  children,
  startIcon,
  variant = 'primary',
  type = 'button',
  isDisabled,
  onClick
}) => {
  const handleClick = isDisabled ? () => {} : onClick

  return html`
    <${Button}
      variant=${variant}
      isDisabled=${isDisabled}
      type=${type}
      onClick=${handleClick}
    >
      ${startIcon && html`<${startIcon} size="24" />`} ${children}
    <//>
  `
}
