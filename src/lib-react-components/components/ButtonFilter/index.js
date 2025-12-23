import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode
 *  variant?: 'primary' | 'secondary'
 *  startIcon?: import('react').ElementType
 *  isDisabled?: boolean
 *  type?: 'button' | 'submit'
 *  onClick: () => void,
 *  testId?: string
 * }} props
 */
export const ButtonFilter = ({
  children,
  startIcon,
  variant = 'primary',
  type = 'button',
  isDisabled,
  onClick,
  testId
}) => {
  const handleClick = isDisabled ? () => {} : onClick

  return html`
    <${Button}
      variant=${variant}
      isDisabled=${isDisabled}
      type=${type}
      onClick=${handleClick}
      data-testid=${testId}
    >
      ${startIcon && html`<${startIcon} size="24" />`} ${children}
    <//>
  `
}
