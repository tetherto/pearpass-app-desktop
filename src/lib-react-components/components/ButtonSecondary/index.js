import { html } from 'htm/react'

import { Button } from './styles'

/**
 * @param {{
 *  children: import('react').ReactNode,
 *  size?: 'sm' | 'md' | 'lg',
 *  onClick: () => void
 *  type?: 'button' | 'submit'
 *  disabled?: boolean
 * }} props
 */

export const ButtonSecondary = ({
  children,
  size = 'md',
  onClick,
  type = 'button',
  disabled = false
}) => html`
  <${Button} size=${size} onClick=${onClick} type=${type} disabled=${disabled}>
    ${children}
  <//>
`
